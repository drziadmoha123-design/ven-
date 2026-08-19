import { prisma } from "../../lib/prisma";
import { NotFoundError, ConflictError, ValidationError } from "../../domain/errors";
import {
  ProductDTO,
  ProductDetailDTO,
  CatalogQueryFilters,
  PaginatedCatalogResult,
  toProductDTO,
  toCategoryDTO,
} from "../../domain/types/catalog";
import { CreateProductInput, UpdateProductInput } from "../validators/catalog.schema";
import { AuditAction, UserRole, InventoryTransactionType, Prisma } from "@prisma/client";

export class ProductService {
  /**
   * Generates a URL-safe lowercase slug from string
   */
  private generateSlug(text: string): string {
    return text
      .toLowerCase()
      .trim()
      .replace(/[^\w\s-]/g, "")
      .replace(/[\s_-]+/g, "-")
      .replace(/^-+|-+$/g, "");
  }

  /**
   * Ensures slug uniqueness by appending suffix if needed
   */
  private async ensureUniqueSlug(baseSlug: string, currentId?: string): Promise<string> {
    let slug = baseSlug;
    let counter = 1;

    while (true) {
      const existing = await prisma.product.findUnique({
        where: { slug },
      });

      if (!existing || (currentId && existing.id === currentId)) {
        return slug;
      }

      slug = `${baseSlug}-${counter}`;
      counter++;
    }
  }

  /**
   * Public Catalog Query with multi-field search, category hierarchy, price range, points-only, and sorting
   */
  async getCatalog(filters: CatalogQueryFilters = {}): Promise<PaginatedCatalogResult> {
    const page = Math.max(1, filters.page || 1);
    const limit = Math.min(100, Math.max(1, filters.limit || 20));
    const skip = (page - 1) * limit;

    const where: Prisma.ProductWhereInput = {
      isActive: true,
      archivedAt: null,
    };

    // Category Filter (supporting parent categories and subcategories)
    if (filters.categoryId) {
      const category = await prisma.category.findUnique({
        where: { id: filters.categoryId },
        include: { children: { select: { id: true } } },
      });

      if (category) {
        const categoryIds = [category.id, ...category.children.map((c) => c.id)];
        where.categoryId = { in: categoryIds };
      } else {
        where.categoryId = filters.categoryId;
      }
    } else if (filters.categorySlug) {
      const category = await prisma.category.findUnique({
        where: { slug: filters.categorySlug },
        include: { children: { select: { id: true } } },
      });

      if (category) {
        const categoryIds = [category.id, ...category.children.map((c) => c.id)];
        where.categoryId = { in: categoryIds };
      }
    }

    // Points-only Filter
    if (filters.pointsOnly) {
      where.pointsEnabled = true;
      where.pointsPrice = { not: null, gt: 0 };
    }

    // Search Query across Arabic and English titles, descriptions, and categories
    if (filters.search && filters.search.trim()) {
      const q = filters.search.trim();
      where.OR = [
        { title: { contains: q, mode: "insensitive" } },
        { titleAr: { contains: q, mode: "insensitive" } },
        { description: { contains: q, mode: "insensitive" } },
        { descriptionAr: { contains: q, mode: "insensitive" } },
        {
          category: {
            OR: [
              { name: { contains: q, mode: "insensitive" } },
              { nameAr: { contains: q, mode: "insensitive" } },
            ],
          },
        },
      ];
    }

    // Price Filtering (applied on baseCashPrice or active variants)
    if (filters.minPrice !== undefined || filters.maxPrice !== undefined) {
      where.baseCashPrice = {};
      if (filters.minPrice !== undefined) {
        where.baseCashPrice.gte = filters.minPrice;
      }
      if (filters.maxPrice !== undefined) {
        where.baseCashPrice.lte = filters.maxPrice;
      }
    }

    // In-Stock Only filter (product must have at least one active variant with stock > 0)
    if (filters.inStockOnly) {
      where.variants = {
        some: {
          isActive: true,
          stock: { gt: 0 },
        },
      };
    }

    // Sorting
    let orderBy: Prisma.ProductOrderByWithRelationInput = { createdAt: "desc" };
    if (filters.sortBy === "price-asc") {
      orderBy = { baseCashPrice: "asc" };
    } else if (filters.sortBy === "price-desc") {
      orderBy = { baseCashPrice: "desc" };
    } else if (filters.sortBy === "points-asc") {
      orderBy = { pointsPrice: "asc" };
    } else if (filters.sortBy === "points-desc") {
      orderBy = { pointsPrice: "desc" };
    } else {
      orderBy = { createdAt: "desc" };
    }

    const [products, total, categories, priceAggregate] = await Promise.all([
      prisma.product.findMany({
        where,
        include: {
          category: true,
          images: { orderBy: { displayOrder: "asc" } },
          variants: { where: { isActive: true }, orderBy: { createdAt: "asc" } },
        },
        orderBy,
        skip,
        take: limit,
      }),
      prisma.product.count({ where }),
      prisma.category.findMany({
        where: { isActive: true, parentId: null },
        include: {
          _count: {
            select: {
              products: { where: { isActive: true, archivedAt: null } },
            },
          },
          children: {
            where: { isActive: true },
            include: {
              _count: {
                select: {
                  products: { where: { isActive: true, archivedAt: null } },
                },
              },
            },
          },
        },
        orderBy: { name: "asc" },
      }),
      prisma.product.aggregate({
        where: { isActive: true, archivedAt: null },
        _min: { baseCashPrice: true },
        _max: { baseCashPrice: true },
      }),
    ]);

    const totalPages = Math.ceil(total / limit) || 1;

    return {
      items: products.map(toProductDTO),
      total,
      page,
      limit,
      totalPages,
      hasMore: page < totalPages,
      availableCategories: categories.map(toCategoryDTO),
      priceRange: {
        min: Number(priceAggregate._min.baseCashPrice || 0),
        max: Number(priceAggregate._max.baseCashPrice || 10000),
      },
    };
  }

  /**
   * Retrieves single product detail by ID or Slug
   */
  async getProductByIdOrSlug(idOrSlug: string, includeInactive = false): Promise<ProductDetailDTO> {
    const isUuid = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(idOrSlug);

    const product = await prisma.product.findFirst({
      where: {
        OR: isUuid ? [{ id: idOrSlug }, { slug: idOrSlug }] : [{ slug: idOrSlug }],
        ...(includeInactive ? {} : { isActive: true, archivedAt: null }),
      },
      include: {
        category: true,
        images: { orderBy: { displayOrder: "asc" } },
        variants: {
          where: includeInactive ? undefined : { isActive: true },
          orderBy: { createdAt: "asc" },
        },
      },
    });

    if (!product) {
      throw new NotFoundError(`Product '${idOrSlug}' not found.`);
    }

    const baseDto = toProductDTO(product);

    // Build available colors, sizes, and attributes matrix
    const availableColors = Array.from(
      new Set(baseDto.variants.map((v) => v.color).filter((c): c is string => Boolean(c)))
    );
    const availableSizes = Array.from(
      new Set(baseDto.variants.map((v) => v.size).filter((s): s is string => Boolean(s)))
    );

    const attributesMatrix: Record<string, string[]> = {};
    if (availableColors.length > 0) attributesMatrix.color = availableColors;
    if (availableSizes.length > 0) attributesMatrix.size = availableSizes;

    return {
      ...baseDto,
      availableColors,
      availableSizes,
      attributesMatrix,
    };
  }

  /**
   * Creates a new Product with variants and images in an atomic transaction (Admin operation)
   */
  async createProduct(
    input: CreateProductInput,
    actorId?: string,
    actorRole?: UserRole,
    ipAddress?: string
  ): Promise<ProductDTO> {
    const category = await prisma.category.findUnique({
      where: { id: input.categoryId },
    });

    if (!category) {
      throw new NotFoundError(`Category with ID '${input.categoryId}' not found.`);
    }

    const baseSlug = input.slug || this.generateSlug(input.title) || "product";
    const slug = await this.ensureUniqueSlug(baseSlug);

    const created = await prisma.$transaction(async (tx) => {
      const product = await tx.product.create({
        data: {
          title: input.title,
          titleAr: input.titleAr || null,
          description: input.description,
          descriptionAr: input.descriptionAr || null,
          slug,
          categoryId: input.categoryId,
          baseCashPrice: input.baseCashPrice,
          pointsEnabled: input.pointsEnabled ?? false,
          pointsPrice: input.pointsPrice || null,
          deliveryRewardPoints: input.deliveryRewardPoints ?? 0,
          specifications: input.specifications ? JSON.parse(JSON.stringify(input.specifications)) : undefined,
          isActive: input.isActive ?? true,
        },
      });

      // Create variants
      for (const variantInput of input.variants) {
        const v = await tx.productVariant.create({
          data: {
            productId: product.id,
            sku: variantInput.sku,
            color: variantInput.color || null,
            size: variantInput.size || null,
            customAttributes: variantInput.customAttributes
              ? JSON.parse(JSON.stringify(variantInput.customAttributes))
              : undefined,
            cashPrice: variantInput.cashPrice,
            pointsPrice: variantInput.pointsPrice || null,
            deliveryRewardPoints: variantInput.deliveryRewardPoints ?? input.deliveryRewardPoints ?? 0,
            stock: variantInput.stock ?? 0,
            isActive: variantInput.isActive ?? true,
          },
        });

        if (v.stock > 0) {
          await tx.inventoryTransaction.create({
            data: {
              variantId: v.id,
              type: InventoryTransactionType.ADMIN_ADJUSTMENT,
              quantity: v.stock,
              beforeStock: 0,
              afterStock: v.stock,
              reason: "Initial product creation variant stock",
              createdById: actorId || null,
            },
          });
        }
      }

      // Create images if provided
      if (input.images && input.images.length > 0) {
        for (let i = 0; i < input.images.length; i++) {
          const img = input.images[i];
          await tx.productImage.create({
            data: {
              productId: product.id,
              storageKey: img.storageKey,
              url: img.url,
              altText: img.altText || null,
              displayOrder: img.displayOrder ?? i,
              isPrimary: img.isPrimary || i === 0,
            },
          });
        }
      }

      await tx.auditLog.create({
        data: {
          actorId: actorId || null,
          actorRole: actorRole || null,
          action: AuditAction.CREATE,
          entity: "Product",
          entityId: product.id,
          summary: `Created product '${product.title}' (${product.slug}) with ${input.variants.length} variant(s)`,
          details: { productId: product.id, slug, variantCount: input.variants.length },
          ipAddress: ipAddress || null,
        },
      });

      return tx.product.findUniqueOrThrow({
        where: { id: product.id },
        include: {
          category: true,
          images: { orderBy: { displayOrder: "asc" } },
          variants: { orderBy: { createdAt: "asc" } },
        },
      });
    });

    return toProductDTO(created);
  }

  /**
   * Updates an existing Product (Admin operation)
   */
  async updateProduct(
    id: string,
    input: UpdateProductInput,
    actorId?: string,
    actorRole?: UserRole,
    ipAddress?: string
  ): Promise<ProductDTO> {
    const existing = await prisma.product.findUnique({
      where: { id },
      include: { category: true, variants: true, images: true },
    });

    if (!existing) {
      throw new NotFoundError(`Product with ID '${id}' not found.`);
    }

    if (input.categoryId && input.categoryId !== existing.categoryId) {
      const cat = await prisma.category.findUnique({
        where: { id: input.categoryId },
      });
      if (!cat) {
        throw new NotFoundError(`Category with ID '${input.categoryId}' not found.`);
      }
    }

    let slug = existing.slug;
    if (input.slug && input.slug !== existing.slug) {
      slug = await this.ensureUniqueSlug(input.slug, id);
    } else if (input.title && !input.slug && input.title !== existing.title) {
      slug = await this.ensureUniqueSlug(this.generateSlug(input.title), id);
    }

    const updated = await prisma.$transaction(async (tx) => {
      const product = await tx.product.update({
        where: { id },
        data: {
          title: input.title !== undefined ? input.title : existing.title,
          titleAr: input.titleAr !== undefined ? input.titleAr : existing.titleAr,
          description: input.description !== undefined ? input.description : existing.description,
          descriptionAr: input.descriptionAr !== undefined ? input.descriptionAr : existing.descriptionAr,
          slug,
          categoryId: input.categoryId !== undefined ? input.categoryId : existing.categoryId,
          baseCashPrice: input.baseCashPrice !== undefined ? input.baseCashPrice : existing.baseCashPrice,
          pointsEnabled: input.pointsEnabled !== undefined ? input.pointsEnabled : existing.pointsEnabled,
          pointsPrice: input.pointsPrice !== undefined ? input.pointsPrice : existing.pointsPrice,
          deliveryRewardPoints:
            input.deliveryRewardPoints !== undefined ? input.deliveryRewardPoints : existing.deliveryRewardPoints,
          specifications:
            input.specifications !== undefined
              ? input.specifications
                ? JSON.parse(JSON.stringify(input.specifications))
                : null
              : undefined,
          isActive: input.isActive !== undefined ? input.isActive : existing.isActive,
        },
        include: {
          category: true,
          images: { orderBy: { displayOrder: "asc" } },
          variants: { orderBy: { createdAt: "asc" } },
        },
      });

      await tx.auditLog.create({
        data: {
          actorId: actorId || null,
          actorRole: actorRole || null,
          action: AuditAction.UPDATE,
          entity: "Product",
          entityId: product.id,
          summary: `Updated product '${product.title}' (${product.slug})`,
          details: { before: existing, after: product },
          ipAddress: ipAddress || null,
        },
      });

      return product;
    });

    return toProductDTO(updated);
  }

  /**
   * Deactivates or archives a product (Admin operation)
   */
  async deleteProduct(
    id: string,
    actorId?: string,
    actorRole?: UserRole,
    ipAddress?: string
  ): Promise<void> {
    const existing = await prisma.product.findUnique({
      where: { id },
      include: {
        _count: { select: { orderItems: true } },
      },
    });

    if (!existing) {
      throw new NotFoundError(`Product with ID '${id}' not found.`);
    }

    await prisma.$transaction(async (tx) => {
      // Soft-delete: mark inactive and set archivedAt
      await tx.product.update({
        where: { id },
        data: {
          isActive: false,
          archivedAt: new Date(),
        },
      });

      // Also deactivate all variants
      await tx.productVariant.updateMany({
        where: { productId: id },
        data: { isActive: false },
      });

      await tx.auditLog.create({
        data: {
          actorId: actorId || null,
          actorRole: actorRole || null,
          action: AuditAction.DELETE,
          entity: "Product",
          entityId: id,
          summary: `Archived/Deactivated product '${existing.title}' (${existing.slug})`,
          details: { archivedProduct: existing },
          ipAddress: ipAddress || null,
        },
      });
    });
  }
}

export const productService = new ProductService();
