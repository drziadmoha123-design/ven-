import { prisma as defaultPrisma } from "../../lib/prisma";
import { NotFoundError, ConflictError, ValidationError } from "../../domain/errors";
import {
  ProductDTO,
  ProductDetailDTO,
  CatalogQueryFilters,
  PaginatedCatalogResult,
  toProductDTO,
  toProductDetailDTO,
  toCategoryDTO,
} from "../../domain/types/catalog";
import { CreateProductInput, UpdateProductInput } from "../validators/catalog.schema";
import { AuditAction, UserRole, InventoryTransactionType, Prisma } from "@prisma/client";
import { CategoryService, categoryService as defaultCategoryService } from "./category.service";
import { VariantService, variantService as defaultVariantService } from "./variant.service";
import { ProductImageService, productImageService as defaultProductImageService } from "./product-image.service";

export class ProductService {
  constructor(
    private prisma: any = defaultPrisma,
    private categoryService: CategoryService = defaultCategoryService,
    private variantService: VariantService = defaultVariantService,
    private productImageService: ProductImageService = defaultProductImageService
  ) {}

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
  private async ensureUniqueSlug(baseSlug: string, currentId?: string, client: any = this.prisma): Promise<string> {
    let slug = baseSlug;
    let counter = 1;

    while (true) {
      const existing = await client.product.findUnique({
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
   * Public Catalog Query with multi-field search, category hierarchy, price range, and sorting
   */
  async getCatalog(filters: CatalogQueryFilters = {}): Promise<PaginatedCatalogResult> {
    const page = Math.max(1, filters.page || 1);
    const limit = Math.min(100, Math.max(1, filters.limit || 20));
    const skip = (page - 1) * limit;

    const where: any = {
      isActive: true,
      archivedAt: null,
    };

    // Category Filter (supports single category or category + subcategories)
    if (filters.categoryId) {
      where.categoryId = filters.categoryId;
    } else if (filters.categorySlug) {
      const category = await this.prisma.category.findUnique({
        where: { slug: filters.categorySlug },
      });
      if (category) {
        where.categoryId = category.id;
      }
    }

    // Price Range Filter
    if (filters.minPrice !== undefined || filters.maxPrice !== undefined) {
      where.baseCashPrice = {};
      if (filters.minPrice !== undefined) where.baseCashPrice.gte = filters.minPrice;
      if (filters.maxPrice !== undefined) where.baseCashPrice.lte = filters.maxPrice;
    }

    // Stock Filter: must have at least one active variant with stock > 0
    if (filters.inStockOnly) {
      where.variants = {
        some: {
          isActive: true,
          stock: { gt: 0 },
        },
      };
    }

    // Multi-attribute Search across Title & Description in Arabic & English
    if (filters.search && filters.search.trim()) {
      const term = filters.search.trim();
      where.OR = [
        { title: { contains: term, mode: "insensitive" } },
        { titleAr: { contains: term, mode: "insensitive" } },
        { description: { contains: term, mode: "insensitive" } },
        { descriptionAr: { contains: term, mode: "insensitive" } },
      ];
    }

    // Sorting
    let orderBy: any = { createdAt: "desc" };
    if (filters.sortBy) {
      switch (filters.sortBy) {
        case "price-asc":
          orderBy = { baseCashPrice: "asc" };
          break;
        case "price-desc":
          orderBy = { baseCashPrice: "desc" };
          break;
        case "newest":
        default:
          orderBy = { createdAt: "desc" };
          break;
      }
    }

    const [total, products, priceAgg, categories] = await Promise.all([
      this.prisma.product.count({ where }),
      this.prisma.product.findMany({
        where,
        include: {
          category: true,
          variants: {
            where: { isActive: true },
          },
          images: {
            orderBy: { displayOrder: "asc" },
          },
        },
        orderBy,
        skip,
        take: limit,
      }),
      this.prisma.product.aggregate({
        where: { isActive: true, archivedAt: null },
        _min: { baseCashPrice: true },
        _max: { baseCashPrice: true },
      }),
      this.prisma.category.findMany({
        where: { isActive: true },
        include: {
          _count: {
            select: {
              products: { where: { isActive: true, archivedAt: null } },
            },
          },
        },
        orderBy: { name: "asc" },
      }),
    ]);

    const items = products.map((p: any) => toProductDTO(p));
    const totalPages = Math.ceil(total / limit) || 1;

    return {
      items,
      total,
      page,
      limit,
      totalPages,
      hasMore: page < totalPages,
      priceRange: {
        min: priceAgg._min?.baseCashPrice ?? 0,
        max: priceAgg._max?.baseCashPrice ?? 1000,
      },
      availableCategories: categories.map((c: any) => toCategoryDTO(c)),
    };
  }

  /**
   * Retrieves single product details by ID or Slug
   */
  async getProductByIdOrSlug(identifier: string, includeInactive = false): Promise<ProductDetailDTO> {
    const product = await this.prisma.product.findFirst({
      where: {
        OR: [{ id: identifier }, { slug: identifier }],
      },
      include: {
        category: true,
        variants: {
          where: includeInactive ? undefined : { isActive: true },
          orderBy: { createdAt: "asc" },
        },
        images: {
          orderBy: { displayOrder: "asc" },
        },
      },
    });

    if (!product || (!includeInactive && (!product.isActive || product.archivedAt))) {
      throw new NotFoundError("Product not found");
    }

    return toProductDetailDTO(product);
  }

  /**
   * Admin: Creates a new product atomically with initial variants, images, and inventory logs
   */
  async createProduct(
    input: CreateProductInput,
    actorId?: string,
    actorRole?: UserRole,
    ipAddress?: string
  ): Promise<ProductDetailDTO> {
    // Validate category exists
    const category = await this.prisma.category.findUnique({
      where: { id: input.categoryId },
    });
    if (!category) {
      throw new NotFoundError("Category not found");
    }

    const rawSlug = input.slug ? this.generateSlug(input.slug) : this.generateSlug(input.title);
    const slug = await this.ensureUniqueSlug(rawSlug);

    // Validate variant combinations (color + size uniqueness within input)
    const variantSet = new Set<string>();
    for (const v of input.variants) {
      const key = `${v.color?.trim().toLowerCase() || ""}|${v.size?.trim().toLowerCase() || ""}`;
      if (variantSet.has(key)) {
        throw new ConflictError(
          `Duplicate variant combination '${v.color || "N/A"}' - '${v.size || "N/A"}' in creation payload.`
        );
      }
      variantSet.add(key);
    }

    const createdProduct = await this.prisma.$transaction(async (tx: any) => {
      // 1. Create Product
      const product = await tx.product.create({
        data: {
          title: input.title.trim(),
          titleAr: input.titleAr?.trim() || null,
          description: input.description.trim(),
          descriptionAr: input.descriptionAr?.trim() || null,
          slug,
          categoryId: input.categoryId,
          baseCashPrice: input.baseCashPrice,
          specifications: (input.specifications as any) || null,
          isActive: input.isActive ?? true,
        },
      });

      // 2. Create Variants & Initial Stock Transactions
      for (const v of input.variants) {
        const variant = await tx.productVariant.create({
          data: {
            productId: product.id,
            sku: v.sku.trim(),
            color: v.color?.trim() || null,
            size: v.size?.trim() || null,
            customAttributes: (v.customAttributes as any) || null,
            cashPrice: v.cashPrice,
            stock: v.stock ?? 0,
            isActive: v.isActive ?? true,
          },
        });

        if (variant.stock > 0) {
          await tx.inventoryTransaction.create({
            data: {
              variantId: variant.id,
              type: InventoryTransactionType.ADMIN_ADJUSTMENT,
              quantity: variant.stock,
              referenceId: `INIT_${variant.id}`,
              notes: "Initial variant stock on product creation",
            },
          });
        }
      }

      // 3. Create Images
      if (input.images && input.images.length > 0) {
        let hasPrimary = input.images.some((i) => i.isPrimary);
        for (let idx = 0; idx < input.images.length; idx++) {
          const img = input.images[idx];
          const isPrimary = hasPrimary ? img.isPrimary : idx === 0;
          await tx.productImage.create({
            data: {
              productId: product.id,
              storageKey: img.storageKey,
              url: img.url,
              altText: img.altText || null,
              displayOrder: img.displayOrder ?? idx,
              isPrimary: isPrimary ?? false,
            },
          });
        }
      }

      // 4. Audit Log
      if (actorId && actorRole) {
        await tx.auditLog.create({
          data: {
            userId: actorId,
            userRole: actorRole,
            action: AuditAction.CREATE,
            entity: "Product",
            entityId: product.id,
            newData: product,
            ipAddress: ipAddress || null,
            summary: `Created product '${product.title}' with ${input.variants.length} variant(s)`,
          },
        });
      }

      return product;
    });

    return this.getProductByIdOrSlug(createdProduct.id, true);
  }

  /**
   * Admin: Updates product general information
   */
  async updateProduct(
    id: string,
    input: UpdateProductInput,
    actorId?: string,
    actorRole?: UserRole,
    ipAddress?: string
  ): Promise<ProductDetailDTO> {
    const existing = await this.prisma.product.findUnique({
      where: { id },
      include: { variants: true },
    });

    if (!existing) {
      throw new NotFoundError("Product not found");
    }

    let slug = existing.slug;
    if (input.slug && input.slug !== existing.slug) {
      const formatted = this.generateSlug(input.slug);
      slug = await this.ensureUniqueSlug(formatted, id);
    } else if (input.title && input.title !== existing.title && !input.slug) {
      const formatted = this.generateSlug(input.title);
      slug = await this.ensureUniqueSlug(formatted, id);
    }

    if (input.categoryId && input.categoryId !== existing.categoryId) {
      const category = await this.prisma.category.findUnique({
        where: { id: input.categoryId },
      });
      if (!category) {
        throw new NotFoundError("Category not found");
      }
    }

    // Invariant: Product cannot be activated without at least one active variant
    if (input.isActive === true && !existing.isActive) {
      const activeVariants = existing.variants.filter((v: any) => v.isActive);
      if (activeVariants.length === 0) {
        throw new ValidationError("Product must have at least one active variant before activation.");
      }
    }

    const updated = await this.prisma.$transaction(async (tx: any) => {
      const res = await tx.product.update({
        where: { id },
        data: {
          title: input.title !== undefined ? input.title.trim() : undefined,
          titleAr: input.titleAr !== undefined ? input.titleAr?.trim() || null : undefined,
          description: input.description !== undefined ? input.description.trim() : undefined,
          descriptionAr: input.descriptionAr !== undefined ? input.descriptionAr?.trim() || null : undefined,
          slug,
          categoryId: input.categoryId,
          baseCashPrice: input.baseCashPrice,
          specifications: input.specifications !== undefined ? (input.specifications as any) : undefined,
          isActive: input.isActive,
        },
      });

      if (actorId && actorRole) {
        await tx.auditLog.create({
          data: {
            userId: actorId,
            userRole: actorRole,
            action: AuditAction.UPDATE,
            entity: "Product",
            entityId: id,
            oldData: existing,
            newData: res,
            ipAddress: ipAddress || null,
            summary: `Updated product '${res.title}'`,
          },
        });
      }

      return res;
    });

    return this.getProductByIdOrSlug(updated.id, true);
  }

  /**
   * Admin: Archives/soft-deletes a product
   */
  async deleteProduct(
    id: string,
    actorId?: string,
    actorRole?: UserRole,
    ipAddress?: string
  ): Promise<void> {
    const existing = await this.prisma.product.findUnique({ where: { id } });
    if (!existing) {
      throw new NotFoundError("Product not found");
    }

    await this.prisma.$transaction(async (tx: any) => {
      await tx.product.update({
        where: { id },
        data: {
          isActive: false,
          archivedAt: new Date(),
        },
      });

      if (actorId && actorRole) {
        await tx.auditLog.create({
          data: {
            userId: actorId,
            userRole: actorRole,
            action: AuditAction.DELETE,
            entity: "Product",
            entityId: id,
            oldData: existing,
            ipAddress: ipAddress || null,
            summary: `Archived product '${existing.title}' (${existing.slug})`,
          },
        });
      }
    });
  }
}

export const productService = new ProductService();
