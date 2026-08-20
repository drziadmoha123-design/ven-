import { prisma as defaultPrisma } from "../../lib/prisma";
import { NotFoundError, ValidationError } from "../../domain/errors";
import { ProductImageDTO, toProductImageDTO } from "../../domain/types/catalog";
import { CreateProductImageInput } from "../validators/catalog.schema";
import { AuditAction, UserRole } from "@prisma/client";

export class ProductImageService {
  constructor(private prisma: any = defaultPrisma) {}

  /**
   * Retrieves all images for a product
   */
  async getProductImages(productId: string): Promise<ProductImageDTO[]> {
    const images = await this.prisma.productImage.findMany({
      where: { productId },
      orderBy: { displayOrder: "asc" },
    });
    return images.map(toProductImageDTO);
  }

  /**
   * Adds an image to a product (Admin operation)
   */
  async addImage(
    productId: string,
    input: CreateProductImageInput,
    actorId?: string,
    actorRole?: UserRole,
    ipAddress?: string
  ): Promise<ProductImageDTO> {
    const product = await this.prisma.product.findUnique({
      where: { id: productId },
      include: { images: true },
    });

    if (!product) {
      throw new NotFoundError(`Product with ID '${productId}' not found.`);
    }

    const isFirstImage = product.images.length === 0;
    const shouldBePrimary = input.isPrimary || isFirstImage;

    const created = await this.prisma.$transaction(async (tx: any) => {
      if (shouldBePrimary) {
        await tx.productImage.updateMany({
          where: { productId, isPrimary: true },
          data: { isPrimary: false },
        });
      }

      const img = await tx.productImage.create({
        data: {
          productId,
          storageKey: input.storageKey,
          url: input.url,
          altText: input.altText || null,
          displayOrder: input.displayOrder ?? product.images.length,
          isPrimary: shouldBePrimary,
        },
      });

      if (actorId && actorRole) {
        await tx.auditLog.create({
          data: {
            userId: actorId,
            userRole: actorRole,
            action: AuditAction.CREATE,
            entity: "ProductImage",
            entityId: img.id,
            newData: img,
            ipAddress: ipAddress || null,
            summary: `Added image to product ${productId}`,
          },
        });
      }

      return img;
    });

    return toProductImageDTO(created);
  }

  /**
   * Sets an image as the primary image for a product
   */
  async setPrimaryImage(
    productId: string,
    imageId: string,
    actorId?: string,
    actorRole?: UserRole,
    ipAddress?: string
  ): Promise<void> {
    const image = await this.prisma.productImage.findFirst({
      where: { id: imageId, productId },
    });

    if (!image) {
      throw new NotFoundError("Product image not found");
    }

    await this.prisma.$transaction(async (tx: any) => {
      await tx.productImage.updateMany({
        where: { productId, isPrimary: true },
        data: { isPrimary: false },
      });

      await tx.productImage.update({
        where: { id: imageId },
        data: { isPrimary: true },
      });

      if (actorId && actorRole) {
        await tx.auditLog.create({
          data: {
            userId: actorId,
            userRole: actorRole,
            action: AuditAction.UPDATE,
            entity: "ProductImage",
            entityId: imageId,
            ipAddress: ipAddress || null,
            summary: `Set image ${imageId} as primary for product ${productId}`,
          },
        });
      }
    });
  }

  /**
   * Deletes an image and reassigns primary if needed
   */
  async deleteImage(
    productId: string,
    imageId: string,
    actorId?: string,
    actorRole?: UserRole,
    ipAddress?: string
  ): Promise<void> {
    const image = await this.prisma.productImage.findFirst({
      where: { id: imageId, productId },
    });

    if (!image) {
      throw new NotFoundError("Product image not found");
    }

    await this.prisma.$transaction(async (tx: any) => {
      await tx.productImage.delete({ where: { id: imageId } });

      if (image.isPrimary) {
        // Fallback: make next lowest displayOrder image primary
        const nextImage = await tx.productImage.findFirst({
          where: { productId },
          orderBy: { displayOrder: "asc" },
        });

        if (nextImage) {
          await tx.productImage.update({
            where: { id: nextImage.id },
            data: { isPrimary: true },
          });
        }
      }

      if (actorId && actorRole) {
        await tx.auditLog.create({
          data: {
            userId: actorId,
            userRole: actorRole,
            action: AuditAction.DELETE,
            entity: "ProductImage",
            entityId: imageId,
            oldData: image,
            ipAddress: ipAddress || null,
            summary: `Deleted image ${imageId} from product ${productId}`,
          },
        });
      }
    });
  }
}

export const productImageService = new ProductImageService();
