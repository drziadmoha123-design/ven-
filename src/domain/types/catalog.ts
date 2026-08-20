import { Category, Product, ProductVariant, ProductImage } from "@prisma/client";

export type Locale = "ar" | "en";

export interface LocalizedString {
  ar: string;
  en: string;
}

export interface CategoryDTO {
  id: string;
  name: string;
  nameAr: string | null;
  slug: string;
  parentId: string | null;
  isActive: boolean;
  productCount?: number;
  children?: CategoryDTO[];
  createdAt: string;
  updatedAt: string;
}

export interface ProductImageDTO {
  id: string;
  productId: string;
  storageKey: string;
  url: string;
  altText: string | null;
  displayOrder: number;
  isPrimary: boolean;
}

export interface ProductVariantDTO {
  id: string;
  productId: string;
  sku: string;
  color: string | null;
  size: string | null;
  customAttributes: Record<string, unknown> | null;
  cashPrice: number;
  stock: number;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface ProductDTO {
  id: string;
  title: string;
  titleAr: string | null;
  description: string;
  descriptionAr: string | null;
  slug: string;
  categoryId: string;
  category?: CategoryDTO;
  baseCashPrice: number;
  specifications: Record<string, unknown> | null;
  isActive: boolean;
  images: ProductImageDTO[];
  variants: ProductVariantDTO[];
  primaryImage?: ProductImageDTO | null;
  minPrice: number;
  maxPrice: number;
  totalStock: number;
  createdAt: string;
  updatedAt: string;
}

export interface CatalogQueryFilters {
  search?: string;
  categoryId?: string;
  categorySlug?: string;
  minPrice?: number;
  maxPrice?: number;
  inStockOnly?: boolean;
  sortBy?: "newest" | "price-asc" | "price-desc" | "rating";
  page?: number;
  limit?: number;
  locale?: Locale;
}

export interface PaginatedCatalogResult {
  items: ProductDTO[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
  hasMore: boolean;
  availableCategories: CategoryDTO[];
  priceRange: {
    min: number;
    max: number;
  };
}

export interface ProductDetailDTO extends ProductDTO {
  availableColors: string[];
  availableSizes: string[];
  attributesMatrix: Record<string, string[]>;
}

export function toCategoryDTO(category: Category & { _count?: { products: number }; children?: Category[] }): CategoryDTO {
  return {
    id: category.id,
    name: category.name,
    nameAr: category.nameAr,
    slug: category.slug,
    parentId: category.parentId,
    isActive: category.isActive,
    productCount: category._count?.products,
    children: category.children ? category.children.map((c) => toCategoryDTO(c)) : undefined,
    createdAt: category.createdAt.toISOString(),
    updatedAt: category.updatedAt.toISOString(),
  };
}

export function toProductImageDTO(image: ProductImage): ProductImageDTO {
  return {
    id: image.id,
    productId: image.productId,
    storageKey: image.storageKey,
    url: image.url,
    altText: image.altText,
    displayOrder: image.displayOrder,
    isPrimary: image.isPrimary,
  };
}

export function toProductVariantDTO(variant: ProductVariant): ProductVariantDTO {
  return {
    id: variant.id,
    productId: variant.productId,
    sku: variant.sku,
    color: variant.color,
    size: variant.size,
    customAttributes: variant.customAttributes as Record<string, unknown> | null,
    cashPrice: Number(variant.cashPrice),
    stock: variant.stock,
    isActive: variant.isActive,
    createdAt: variant.createdAt.toISOString(),
    updatedAt: variant.updatedAt.toISOString(),
  };
}

export function toProductDTO(
  product: Product & {
    category?: Category;
    images?: ProductImage[];
    variants?: ProductVariant[];
  }
): ProductDTO {
  const images = (product.images || []).map(toProductImageDTO).sort((a, b) => a.displayOrder - b.displayOrder);
  const variants = (product.variants || []).map(toProductVariantDTO);

  const primaryImage = images.find((img) => img.isPrimary) || images[0] || null;

  const prices = variants.length > 0
    ? variants.map((v) => v.cashPrice)
    : [Number(product.baseCashPrice)];

  const minPrice = Math.min(...prices);
  const maxPrice = Math.max(...prices);
  const totalStock = variants.reduce((sum, v) => sum + (v.isActive ? v.stock : 0), 0);

  return {
    id: product.id,
    title: product.title,
    titleAr: product.titleAr,
    description: product.description,
    descriptionAr: product.descriptionAr,
    slug: product.slug,
    categoryId: product.categoryId,
    category: product.category ? toCategoryDTO(product.category) : undefined,
    baseCashPrice: Number(product.baseCashPrice),
    specifications: product.specifications as Record<string, unknown> | null,
    isActive: product.isActive,
    images,
    variants,
    primaryImage,
    minPrice,
    maxPrice,
    totalStock,
    createdAt: product.createdAt.toISOString(),
    updatedAt: product.updatedAt.toISOString(),
  };
}

export function toProductDetailDTO(
  product: Product & {
    category?: Category;
    images?: ProductImage[];
    variants?: ProductVariant[];
  }
): ProductDetailDTO {
  const base = toProductDTO(product);
  const availableColors = Array.from(
    new Set(base.variants.map((v) => v.color).filter((c): c is string => Boolean(c)))
  );
  const availableSizes = Array.from(
    new Set(base.variants.map((v) => v.size).filter((s): s is string => Boolean(s)))
  );
  const attributesMatrix: Record<string, string[]> = {};
  for (const v of base.variants) {
    if (v.customAttributes) {
      for (const [key, val] of Object.entries(v.customAttributes)) {
        if (!attributesMatrix[key]) attributesMatrix[key] = [];
        const strVal = String(val);
        if (!attributesMatrix[key].includes(strVal)) {
          attributesMatrix[key].push(strVal);
        }
      }
    }
  }

  return {
    ...base,
    availableColors,
    availableSizes,
    attributesMatrix,
  };
}
