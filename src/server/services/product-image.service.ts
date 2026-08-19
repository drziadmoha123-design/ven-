import { prisma } from "../../lib/prisma";
import { NotFoundError, ValidationError } from "../../domain/errors";
import { ProductImageDTO, toProductImageDTO } from "../../domain/types/catalog";
import { CreateProductImageInput } from "../validators/catalog.schema";
import { AuditAction, UserRole } from "@prisma/client";

export class ProductImageService {
  /**
   * Retrieves all images for a product
   */
  async getProductImages(productId: string): Promise<ProductImageDTO[]> {
    const images = await prisma.productImage.findMany({
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
    const product = await prisma.product.findUnique({
      where: { id: productId },
      include: { images: true },
    });

    if (!product) {
      throw new NotFoundError(`Product with ID '${productId}' not found.`);
    }

    const isFirstImage = product.images.length === 0;
    const shouldBePrimary = input.isPrimary || isFirstImage;

    const created = await prisma.$transaction(async (tx) => {
      if (shouldBePrimary) {
        // Demote previous primary images
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

      await tx.auditLog.create({
        data: {
          actorId: actorId || null,
          actorRole: actorRole || null,
          action: AuditAction.CREATE,
          entity: "ProductImage",
          entityId: img.id,
          summary: `Added image to product '${product.title}'`,
          details: { imageId: img.id, productId, url: img.url, isPrimary: shouldBePrimary },
          ipAddress: ipAddress || null,
        },
      });

      return img;
    });

    return toProductImageDTO(created);
  }

  /**
   * Sets primary image for a product
   */
  async setPrimaryImage(
    productId: string,
    imageId: string,
    actorId?: string,
    actorRole?: UserRole,
    ipAddress?: string
  ): Promise<void> {
    const image = await prisma.productImage.findFirst({
      where: { id: imageId, productId },
    });

    if (!image) {
      throw new NotFoundError(`Image with ID '${imageId}' not found for product '${productId}'.`);
    }

    await prisma.$transaction(async (tx) => {
      await tx.productImage.updateMany({
        where: { productId, isPrimary: true },
        data: { isPrimary: false },
      });

      await tx.productImage.update({
        where: { id: imageId },
        data: { isPrimary: true },
      });

      await tx.auditLog.create({
        data: {
          actorId: actorId || null,
          actorRole: actorRole || null,
          action: AuditAction.UPDATE,
          entity: "ProductImage",
          entityId: imageId,
          summary: `Set image '${imageId}' as primary for product '${productId}'`,
          details: { productId, imageId },
          ipAddress: ipAddress || null,
        },
      });
    });
  }

  /**
   * Deletes an image from a product
   */
  async deleteImage(
    productId: string,
    imageId: string,
    actorId?: string,
    actorRole?: UserRole,
    ipAddress?: string
  ): Promise<void> {
    const image = await prisma.productImage.findFirst({
      where: { id: imageId, productId },
    });

    if (!image) {
      throw new NotFoundError(`Image with ID '${imageId}' not found for product '${productId}'.`);
    }

    await prisma.$transaction(async (tx) => {
      await tx.productImage.delete({
        where: { id: imageId },
      });

      // If deleted image was primary, make the next available image primary
      if (image.isPrimary) {
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

      await tx.auditLog.create({
        data: {
          actorId: actorId || null,
          actorRole: actorRole || null,
          action: AuditAction.DELETE,
          entity: "ProductImage",
          entityId: imageId,
          summary: `Deleted image '${imageId}' from product '${productId}'`,
          details: { deletedImage: image },
          ipAddress: ipAddress || null,
        },
      });
    });
  }
}

export const productImageService = new ProductImageService();
