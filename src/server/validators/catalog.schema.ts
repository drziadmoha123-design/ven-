import { z } from "zod";

export const CatalogQuerySchema = z.object({
  search: z.string().optional(),
  categoryId: z.string().uuid().optional(),
  categorySlug: z.string().optional(),
  minPrice: z.coerce.number().min(0).optional(),
  maxPrice: z.coerce.number().min(0).optional(),
  pointsOnly: z
    .enum(["true", "false", "1", "0"])
    .optional()
    .transform((val) => val === "true" || val === "1")
    .or(z.boolean().optional()),
  inStockOnly: z
    .enum(["true", "false", "1", "0"])
    .optional()
    .transform((val) => val === "true" || val === "1")
    .or(z.boolean().optional()),
  sortBy: z.enum(["newest", "price-asc", "price-desc", "rating", "points-asc", "points-desc"]).optional(),
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(100).default(20),
  locale: z.enum(["ar", "en"]).default("ar"),
});

export const CreateCategorySchema = z.object({
  name: z.string().min(2, "Category name must be at least 2 characters").max(100),
  nameAr: z.string().min(2, "Arabic category name must be at least 2 characters").max(100).optional().nullable(),
  slug: z
    .string()
    .min(2)
    .max(100)
    .regex(/^[a-z0-9-]+$/, "Slug must be lowercase alphanumeric with dashes")
    .optional(),
  parentId: z.string().uuid().optional().nullable(),
  isActive: z.boolean().default(true),
});

export const UpdateCategorySchema = CreateCategorySchema.partial();

export const CreateVariantSchema = z.object({
  sku: z.string().min(2).max(50),
  color: z.string().max(50).optional().nullable(),
  size: z.string().max(50).optional().nullable(),
  customAttributes: z.record(z.unknown()).optional().nullable(),
  cashPrice: z.number().min(0, "Cash price must be non-negative"),
  pointsPrice: z.number().int().min(0).optional().nullable(),
  deliveryRewardPoints: z.number().int().min(0).default(0),
  stock: z.number().int().min(0, "Stock must be non-negative").default(0),
  isActive: z.boolean().default(true),
});

export const UpdateVariantSchema = CreateVariantSchema.partial();

export const CreateProductImageSchema = z.object({
  storageKey: z.string().min(1),
  url: z.string().url("Valid image URL required"),
  altText: z.string().max(200).optional().nullable(),
  displayOrder: z.number().int().min(0).default(0),
  isPrimary: z.boolean().default(false),
});

export const CreateProductSchema = z.object({
  title: z.string().min(2, "Title must be at least 2 characters").max(200),
  titleAr: z.string().min(2, "Arabic title must be at least 2 characters").max(200).optional().nullable(),
  description: z.string().min(5, "Description must be at least 5 characters"),
  descriptionAr: z.string().min(5, "Arabic description must be at least 5 characters").optional().nullable(),
  slug: z
    .string()
    .min(2)
    .max(200)
    .regex(/^[a-z0-9-]+$/, "Slug must be lowercase alphanumeric with dashes")
    .optional(),
  categoryId: z.string().uuid("Invalid category ID"),
  baseCashPrice: z.number().min(0, "Base cash price must be non-negative"),
  pointsEnabled: z.boolean().default(false),
  pointsPrice: z.number().int().min(0).optional().nullable(),
  deliveryRewardPoints: z.number().int().min(0).default(0),
  specifications: z.record(z.unknown()).optional().nullable(),
  isActive: z.boolean().default(true),
  variants: z.array(CreateVariantSchema).min(1, "Product must have at least one variant"),
  images: z.array(CreateProductImageSchema).optional(),
});

export const UpdateProductSchema = z.object({
  title: z.string().min(2).max(200).optional(),
  titleAr: z.string().min(2).max(200).optional().nullable(),
  description: z.string().min(5).optional(),
  descriptionAr: z.string().min(5).optional().nullable(),
  slug: z.string().min(2).max(200).optional(),
  categoryId: z.string().uuid().optional(),
  baseCashPrice: z.number().min(0).optional(),
  pointsEnabled: z.boolean().optional(),
  pointsPrice: z.number().int().min(0).optional().nullable(),
  deliveryRewardPoints: z.number().int().min(0).optional(),
  specifications: z.record(z.unknown()).optional().nullable(),
  isActive: z.boolean().optional(),
});

export type CatalogQueryInput = z.infer<typeof CatalogQuerySchema>;
export type CreateCategoryInput = z.infer<typeof CreateCategorySchema>;
export type UpdateCategoryInput = z.infer<typeof UpdateCategorySchema>;
export type CreateProductInput = z.infer<typeof CreateProductSchema>;
export type UpdateProductInput = z.infer<typeof UpdateProductSchema>;
export type CreateVariantInput = z.infer<typeof CreateVariantSchema>;
export type UpdateVariantInput = z.infer<typeof UpdateVariantSchema>;
export type CreateProductImageInput = z.infer<typeof CreateProductImageSchema>;
