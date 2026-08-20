import { prisma as defaultPrisma } from "../../lib/prisma";
import { NotFoundError, ConflictError, ValidationError } from "../../domain/errors";
import { ProductVariantDTO, toProductVariantDTO } from "../../domain/types/catalog";
import { CreateVariantInput, UpdateVariantInput } from "../validators/catalog.schema";
import { AuditAction, UserRole, InventoryTransactionType } from "@prisma/client";

export class VariantService {
  constructor(private prisma: any = defaultPrisma) {}

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
    excludeVariantId?: string,
    client: any = this.prisma
  ): Promise<void> {
    const normalizedColor = color?.trim().toLowerCase() || null;
    const normalizedSize = size?.trim().toLowerCase() || null;

    const existingVariants = await client.productVariant.findMany({
      where: {
        productId,
        id: excludeVariantId ? { not: excludeVariantId } : undefined,
      },
    });

    const duplicate = existingVariants.find((v: any) => {
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
    const variants = await this.prisma.productVariant.findMany({
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
    const variant = await this.prisma.productVariant.findUnique({
      where: { id },
      include: { product: true },
    });

    if (!variant) {
      throw new NotFoundError("Product variant not found");
    }

    return toProductVariantDTO(variant);
  }

  /**
   * Creates a new variant for a product
   */
  async createVariant(
    productId: string,
    input: CreateVariantInput,
    actorId?: string,
    actorRole?: UserRole,
    ipAddress?: string
  ): Promise<ProductVariantDTO> {
    const product = await this.prisma.product.findUnique({
      where: { id: productId },
    });

    if (!product) {
      throw new NotFoundError("Product not found");
    }

    // Check SKU uniqueness
    const existingSku = await this.prisma.productVariant.findFirst({
      where: { sku: input.sku },
    });

    if (existingSku) {
      throw new ConflictError(`Variant with SKU '${input.sku}' already exists.`);
    }

    await this.validateUniqueCombination(productId, input.color, input.size);

    const variant = await this.prisma.$transaction(async (tx: any) => {
      const created = await tx.productVariant.create({
        data: {
          productId,
          sku: input.sku.trim(),
          color: input.color?.trim() || null,
          size: input.size?.trim() || null,
          customAttributes: (input.customAttributes as any) || null,
          cashPrice: input.cashPrice,
          stock: input.stock ?? 0,
          isActive: input.isActive ?? true,
        },
      });

      // Record initial inventory transaction if stock > 0
      if (created.stock > 0) {
        await tx.inventoryTransaction.create({
          data: {
            variantId: created.id,
            type: InventoryTransactionType.ADMIN_ADJUSTMENT,
            quantity: created.stock,
            referenceId: `INIT_${created.id}`,
            notes: "Initial variant stock on creation",
          },
        });
      }

      if (actorId && actorRole) {
        await tx.auditLog.create({
          data: {
            userId: actorId,
            userRole: actorRole,
            action: AuditAction.CREATE,
            entity: "ProductVariant",
            entityId: created.id,
            newData: created,
            ipAddress: ipAddress || null,
            summary: `Created variant '${created.sku}' for product ${productId}`,
          },
        });
      }

      return created;
    });

    return toProductVariantDTO(variant);
  }

  /**
   * Updates an existing variant
   */
  async updateVariant(
    id: string,
    input: UpdateVariantInput,
    actorId?: string,
    actorRole?: UserRole,
    ipAddress?: string
  ): Promise<ProductVariantDTO> {
    const existing = await this.prisma.productVariant.findUnique({
      where: { id },
      include: { product: true },
    });

    if (!existing) {
      throw new NotFoundError("Product variant not found");
    }

    // Check SKU collision
    if (input.sku && input.sku !== existing.sku) {
      const existingSku = await this.prisma.productVariant.findFirst({
        where: { sku: input.sku, id: { not: id } },
      });
      if (existingSku) {
        throw new ConflictError(`Variant with SKU '${input.sku}' already exists.`);
      }
    }

    // Check color/size collision
    if (input.color !== undefined || input.size !== undefined) {
      await this.validateUniqueCombination(
        existing.productId,
        input.color !== undefined ? input.color : existing.color,
        input.size !== undefined ? input.size : existing.size,
        id
      );
    }

    // Invariant: If product is active, cannot deactivate the ONLY active variant
    if (input.isActive === false && existing.isActive && existing.product.isActive) {
      const activeCount = await this.prisma.productVariant.count({
        where: {
          productId: existing.productId,
          isActive: true,
          id: { not: id },
        },
      });

      if (activeCount === 0) {
        throw new ValidationError("Cannot deactivate the only active variant of an active product. Deactivate product first.");
      }
    }

    const updated = await this.prisma.$transaction(async (tx: any) => {
      const stockDelta = input.stock !== undefined ? input.stock - existing.stock : 0;

      const res = await tx.productVariant.update({
        where: { id },
        data: {
          sku: input.sku?.trim(),
          color: input.color !== undefined ? input.color?.trim() || null : undefined,
          size: input.size !== undefined ? input.size?.trim() || null : undefined,
          customAttributes: input.customAttributes !== undefined ? (input.customAttributes as any) : undefined,
          cashPrice: input.cashPrice,
          stock: input.stock,
          isActive: input.isActive,
        },
      });

      // Record inventory adjustment if stock changed
      if (stockDelta !== 0) {
        await tx.inventoryTransaction.create({
          data: {
            variantId: id,
            type: InventoryTransactionType.ADMIN_ADJUSTMENT,
            quantity: stockDelta,
            referenceId: `ADJ_${id}_${Date.now()}`,
            notes: `Manual stock adjustment from ${existing.stock} to ${res.stock}`,
          },
        });
      }

      if (actorId && actorRole) {
        await tx.auditLog.create({
          data: {
            userId: actorId,
            userRole: actorRole,
            action: AuditAction.UPDATE,
            entity: "ProductVariant",
            entityId: id,
            oldData: existing,
            newData: res,
            ipAddress: ipAddress || null,
            summary: `Updated variant '${res.sku}'`,
          },
        });
      }

      return res;
    });

    return toProductVariantDTO(updated);
  }

  /**
   * Deletes a variant
   */
  async deleteVariant(
    id: string,
    actorId?: string,
    actorRole?: UserRole,
    ipAddress?: string
  ): Promise<void> {
    const existing = await this.prisma.productVariant.findUnique({
      where: { id },
      include: { product: true },
    });

    if (!existing) {
      throw new NotFoundError("Product variant not found");
    }

    // Invariant: If product is active, cannot delete the ONLY active variant
    if (existing.isActive && existing.product.isActive) {
      const activeCount = await this.prisma.productVariant.count({
        where: {
          productId: existing.productId,
          isActive: true,
          id: { not: id },
        },
      });

      if (activeCount === 0) {
        throw new ValidationError("Cannot delete the only active variant of an active product. Deactivate product first.");
      }
    }

    await this.prisma.$transaction(async (tx: any) => {
      await tx.productVariant.delete({ where: { id } });

      if (actorId && actorRole) {
        await tx.auditLog.create({
          data: {
            userId: actorId,
            userRole: actorRole,
            action: AuditAction.DELETE,
            entity: "ProductVariant",
            entityId: id,
            oldData: existing,
            ipAddress: ipAddress || null,
            summary: `Deleted variant '${existing.sku}'`,
          },
        });
      }
    });
  }
}

export const variantService = new VariantService();
