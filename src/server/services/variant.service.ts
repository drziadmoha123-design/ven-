import { prisma } from "../../lib/prisma";
import { NotFoundError, ConflictError, ValidationError } from "../../domain/errors";
import { ProductVariantDTO, toProductVariantDTO } from "../../domain/types/catalog";
import { CreateVariantInput, UpdateVariantInput } from "../validators/catalog.schema";
import { AuditAction, UserRole, InventoryTransactionType } from "@prisma/client";

export class VariantService {
  /**
   * Generates a unique SKU if not provided
   */
  private generateSku(productSlug: string, color?: string | null, size?: string | null): string {
    const parts = [productSlug.substring(0, 10).toUpperCase()];
    if (color) parts.push(color.substring(0, 4).toUpperCase());
    if (size) parts.push(size.substring(0, 4).toUpperCase());
    parts.push(Math.random().toString(36).substring(2, 6).toUpperCase());
    return parts.join("-");
  }

  /**
   * Validates that no duplicate variant exists for the product with same color & size
   */
  private async validateUniqueCombination(
    productId: string,
    color?: string | null,
    size?: string | null,
    excludeVariantId?: string
  ): Promise<void> {
    const normalizedColor = color?.trim().toLowerCase() || null;
    const normalizedSize = size?.trim().toLowerCase() || null;

    const existingVariants = await prisma.productVariant.findMany({
      where: {
        productId,
        id: excludeVariantId ? { not: excludeVariantId } : undefined,
      },
    });

    const duplicate = existingVariants.find((v) => {
      const vColor = v.color?.trim().toLowerCase() || null;
      const vSize = v.size?.trim().toLowerCase() || null;
      return vColor === normalizedColor && vSize === normalizedSize;
    });

    if (duplicate) {
      throw new ConflictError(
        `A variant with color '${color || "N/A"}' and size '${size || "N/A"}' already exists for this product.`
      );
    }
  }

  /**
   * Retrieves all variants for a product
   */
  async getProductVariants(productId: string, includeInactive = false): Promise<ProductVariantDTO[]> {
    const variants = await prisma.productVariant.findMany({
      where: {
        productId,
        isActive: includeInactive ? undefined : true,
      },
      orderBy: { createdAt: "asc" },
    });

    return variants.map(toProductVariantDTO);
  }

  /**
   * Retrieves a single variant by ID
   */
  async getVariantById(id: string): Promise<ProductVariantDTO> {
    const variant = await prisma.productVariant.findUnique({
      where: { id },
      include: { product: true },
    });

    if (!variant) {
      throw new NotFoundError(`Product variant with ID '${id}' not found.`);
    }

    return toProductVariantDTO(variant);
  }

  /**
   * Adds a variant to a product (Admin operation)
   */
  async createVariant(
    productId: string,
    input: CreateVariantInput,
    actorId?: string,
    actorRole?: UserRole,
    ipAddress?: string
  ): Promise<ProductVariantDTO> {
    const product = await prisma.product.findUnique({
      where: { id: productId },
    });

    if (!product) {
      throw new NotFoundError(`Product with ID '${productId}' not found.`);
    }

    await this.validateUniqueCombination(productId, input.color, input.size);

    const sku = input.sku || this.generateSku(product.slug, input.color, input.size);

    // Verify SKU uniqueness
    const existingSku = await prisma.productVariant.findUnique({
      where: { sku },
    });

    if (existingSku) {
      throw new ConflictError(`Variant SKU '${sku}' is already in use.`);
    }

    const created = await prisma.$transaction(async (tx) => {
      const variant = await tx.productVariant.create({
        data: {
          productId,
          sku,
          color: input.color || null,
          size: input.size || null,
          customAttributes: input.customAttributes ? JSON.parse(JSON.stringify(input.customAttributes)) : undefined,
          cashPrice: input.cashPrice,
          pointsPrice: input.pointsPrice || null,
          deliveryRewardPoints: input.deliveryRewardPoints ?? product.deliveryRewardPoints ?? 0,
          stock: input.stock ?? 0,
          isActive: input.isActive ?? true,
        },
      });

      // Record initial inventory transaction if stock > 0
      if (variant.stock > 0) {
        await tx.inventoryTransaction.create({
          data: {
            variantId: variant.id,
            type: InventoryTransactionType.ADMIN_ADJUSTMENT,
            quantity: variant.stock,
            beforeStock: 0,
            afterStock: variant.stock,
            reason: "Initial variant stock creation",
            createdById: actorId || null,
          },
        });
      }

      await tx.auditLog.create({
        data: {
          actorId: actorId || null,
          actorRole: actorRole || null,
          action: AuditAction.CREATE,
          entity: "ProductVariant",
          entityId: variant.id,
          summary: `Created variant '${variant.sku}' for product '${product.title}'`,
          details: { variantId: variant.id, sku: variant.sku, stock: variant.stock },
          ipAddress: ipAddress || null,
        },
      });

      return variant;
    });

    return toProductVariantDTO(created);
  }

  /**
   * Updates an existing variant (Admin operation)
   */
  async updateVariant(
    id: string,
    input: UpdateVariantInput,
    actorId?: string,
    actorRole?: UserRole,
    ipAddress?: string
  ): Promise<ProductVariantDTO> {
    const existing = await prisma.productVariant.findUnique({
      where: { id },
      include: { product: true },
    });

    if (!existing) {
      throw new NotFoundError(`Product variant with ID '${id}' not found.`);
    }

    if (input.color !== undefined || input.size !== undefined) {
      const targetColor = input.color !== undefined ? input.color : existing.color;
      const targetSize = input.size !== undefined ? input.size : existing.size;
      await this.validateUniqueCombination(existing.productId, targetColor, targetSize, id);
    }

    if (input.sku && input.sku !== existing.sku) {
      const skuCheck = await prisma.productVariant.findUnique({
        where: { sku: input.sku },
      });
      if (skuCheck) {
        throw new ConflictError(`Variant SKU '${input.sku}' is already in use.`);
      }
    }

    // Check if deactivating this variant violates "every active product must have at least one active variant"
    if (input.isActive === false && existing.isActive) {
      const activeCount = await prisma.productVariant.count({
        where: {
          productId: existing.productId,
          isActive: true,
          id: { not: id },
        },
      });

      if (activeCount === 0 && existing.product.isActive) {
        throw new ValidationError(
          "Cannot deactivate this variant. An active product must have at least one active variant."
        );
      }
    }

    const updated = await prisma.$transaction(async (tx) => {
      const stockChanged = input.stock !== undefined && input.stock !== existing.stock;

      const variant = await tx.productVariant.update({
        where: { id },
        data: {
          sku: input.sku !== undefined ? input.sku : existing.sku,
          color: input.color !== undefined ? input.color : existing.color,
          size: input.size !== undefined ? input.size : existing.size,
          customAttributes:
            input.customAttributes !== undefined
              ? input.customAttributes
                ? JSON.parse(JSON.stringify(input.customAttributes))
                : null
              : undefined,
          cashPrice: input.cashPrice !== undefined ? input.cashPrice : existing.cashPrice,
          pointsPrice: input.pointsPrice !== undefined ? input.pointsPrice : existing.pointsPrice,
          deliveryRewardPoints:
            input.deliveryRewardPoints !== undefined ? input.deliveryRewardPoints : existing.deliveryRewardPoints,
          stock: input.stock !== undefined ? input.stock : existing.stock,
          isActive: input.isActive !== undefined ? input.isActive : existing.isActive,
        },
      });

      if (stockChanged && input.stock !== undefined) {
        const delta = input.stock - existing.stock;
        await tx.inventoryTransaction.create({
          data: {
            variantId: variant.id,
            type: InventoryTransactionType.ADMIN_ADJUSTMENT,
            quantity: delta,
            beforeStock: existing.stock,
            afterStock: input.stock,
            reason: "Admin stock manual adjustment",
            createdById: actorId || null,
          },
        });
      }

      await tx.auditLog.create({
        data: {
          actorId: actorId || null,
          actorRole: actorRole || null,
          action: AuditAction.UPDATE,
          entity: "ProductVariant",
          entityId: variant.id,
          summary: `Updated variant '${variant.sku}' for product '${existing.product.title}'`,
          details: { before: existing, after: variant },
          ipAddress: ipAddress || null,
        },
      });

      return variant;
    });

    return toProductVariantDTO(updated);
  }

  /**
   * Deletes a variant (Admin operation)
   */
  async deleteVariant(
    id: string,
    actorId?: string,
    actorRole?: UserRole,
    ipAddress?: string
  ): Promise<void> {
    const existing = await prisma.productVariant.findUnique({
      where: { id },
      include: {
        product: true,
        _count: { select: { orderItems: true, cartItems: true } },
      },
    });

    if (!existing) {
      throw new NotFoundError(`Product variant with ID '${id}' not found.`);
    }

    const otherActiveCount = await prisma.productVariant.count({
      where: {
        productId: existing.productId,
        isActive: true,
        id: { not: id },
      },
    });

    if (otherActiveCount === 0 && existing.product.isActive) {
      throw new ValidationError(
        "Cannot delete this variant. Every active product must have at least one active variant."
      );
    }

    if (existing._count.orderItems > 0) {
      throw new ConflictError(
        `Cannot delete variant '${existing.sku}' because it is associated with existing orders. Deactivate it instead.`
      );
    }

    await prisma.$transaction(async (tx) => {
      await tx.productVariant.delete({
        where: { id },
      });

      await tx.auditLog.create({
        data: {
          actorId: actorId || null,
          actorRole: actorRole || null,
          action: AuditAction.DELETE,
          entity: "ProductVariant",
          entityId: id,
          summary: `Deleted variant '${existing.sku}' from product '${existing.product.title}'`,
          details: { deletedVariant: existing },
          ipAddress: ipAddress || null,
        },
      });
    });
  }
}

export const variantService = new VariantService();
