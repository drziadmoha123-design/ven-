import { describe, it, expect, beforeEach, vi } from "vitest";
import { CategoryService } from "../server/services/category.service";
import { ProductService } from "../server/services/product.service";
import { VariantService } from "../server/services/variant.service";
import { ProductImageService } from "../server/services/product-image.service";
import { getLocalizedText, formatPrice } from "../lib/i18n";
import { ConflictError, NotFoundError, ValidationError } from "../domain/errors";
import { UserRole } from "@prisma/client";

describe("Catalog, Categories, Search, Variants & Storefront (CASH / COD Model)", () => {
  let mockCategories: Map<string, any>;
  let mockProducts: Map<string, any>;
  let mockVariants: Map<string, any>;
  let mockImages: Map<string, any>;
  let mockInventoryTransactions: any[];
  let mockAuditLogs: any[];
  let mockPrisma: any;

  let categoryService: CategoryService;
  let productService: ProductService;
  let variantService: VariantService;
  let productImageService: ProductImageService;

  beforeEach(() => {
    mockCategories = new Map();
    mockProducts = new Map();
    mockVariants = new Map();
    mockImages = new Map();
    mockInventoryTransactions = [];
    mockAuditLogs = [];

    mockPrisma = {
      category: {
        findUnique: vi.fn().mockImplementation(({ where, include }) => {
          let cat = null;
          if (where.id) cat = mockCategories.get(where.id) || null;
          if (where.slug) {
            for (const c of mockCategories.values()) {
              if (c.slug === where.slug) {
                cat = c;
                break;
              }
            }
          }
          if (!cat) return Promise.resolve(null);
          const res: any = { ...cat };
          if (include?._count) {
            const prodCount = Array.from(mockProducts.values()).filter((p) => p.categoryId === cat.id).length;
            const childCount = Array.from(mockCategories.values()).filter((c) => c.parentId === cat.id).length;
            res._count = { products: prodCount, children: childCount };
          }
          return Promise.resolve(res);
        }),
        findMany: vi.fn().mockImplementation(({ where = {}, include } = {}) => {
          let list = Array.from(mockCategories.values());
          if (where.parentId !== undefined) {
            list = list.filter((c) => c.parentId === where.parentId);
          }
          if (where.isActive !== undefined) {
            list = list.filter((c) => c.isActive === where.isActive);
          }

          if (include) {
            list = list.map((cat) => {
              const res: any = { ...cat };
              if (include.children) {
                res.children = Array.from(mockCategories.values()).filter(
                  (c) => c.parentId === cat.id && (where.isActive ? c.isActive : true)
                );
              }
              if (include._count?.select?.products) {
                const count = Array.from(mockProducts.values()).filter(
                  (p) => p.categoryId === cat.id && (where.isActive ? p.isActive : true)
                ).length;
                res._count = { products: count };
              }
              return res;
            });
          }
          return Promise.resolve(list);
        }),
        create: vi.fn().mockImplementation(({ data }) => {
          const id = `cat_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`;
          const cat = {
            id,
            name: data.name,
            nameAr: data.nameAr || null,
            slug: data.slug,
            parentId: data.parentId || null,
            isActive: data.isActive !== undefined ? data.isActive : true,
            createdAt: new Date(),
            updatedAt: new Date(),
          };
          mockCategories.set(id, cat);
          return Promise.resolve(cat);
        }),
        update: vi.fn().mockImplementation(({ where, data }) => {
          const cat = mockCategories.get(where.id);
          if (cat) {
            Object.assign(cat, data, { updatedAt: new Date() });
            mockCategories.set(where.id, cat);
            return Promise.resolve(cat);
          }
          return Promise.resolve(null);
        }),
        delete: vi.fn().mockImplementation(({ where }) => {
          const cat = mockCategories.get(where.id);
          if (cat) {
            mockCategories.delete(where.id);
            return Promise.resolve(cat);
          }
          return Promise.resolve(null);
        }),
        count: vi.fn().mockImplementation(({ where = {} } = {}) => {
          let count = 0;
          for (const c of mockCategories.values()) {
            if (where.slug && c.slug !== where.slug) continue;
            if (where.parentId && c.parentId !== where.parentId) continue;
            if (where.id?.not && c.id === where.id.not) continue;
            count++;
          }
          return Promise.resolve(count);
        }),
      },
      product: {
        findFirst: vi.fn().mockImplementation(({ where = {}, include } = {}) => {
          let list = Array.from(mockProducts.values());
          if (where.OR) {
            list = list.filter((p) => {
              return where.OR.some((clause: any) => {
                if (clause.id && p.id === clause.id) return true;
                if (clause.slug && p.slug === clause.slug) return true;
                return false;
              });
            });
          }
          if (where.id) list = list.filter((p) => p.id === where.id);
          if (where.slug) list = list.filter((p) => p.slug === where.slug);

          const prod = list[0] || null;
          if (!prod) return Promise.resolve(null);

          const result: any = { ...prod };
          if (include?.category) {
            result.category = mockCategories.get(prod.categoryId) || null;
          }
          if (include?.variants) {
            let vList = Array.from(mockVariants.values()).filter((v) => v.productId === prod.id);
            if (include.variants.where?.isActive !== undefined) {
              vList = vList.filter((v) => v.isActive === include.variants.where.isActive);
            }
            result.variants = vList;
          }
          if (include?.images) {
            result.images = Array.from(mockImages.values())
              .filter((i) => i.productId === prod.id)
              .sort((a, b) => a.displayOrder - b.displayOrder);
          }
          return Promise.resolve(result);
        }),
        findUnique: vi.fn().mockImplementation(({ where, include }) => {
          let prod = null;
          if (where.id) prod = mockProducts.get(where.id) || null;
          if (where.slug) {
            for (const p of mockProducts.values()) {
              if (p.slug === where.slug) {
                prod = p;
                break;
              }
            }
          }

          if (!prod) return Promise.resolve(null);

          const result: any = { ...prod };
          if (include?.category) {
            result.category = mockCategories.get(prod.categoryId) || null;
          }
          if (include?.variants) {
            let vList = Array.from(mockVariants.values()).filter((v) => v.productId === prod.id);
            if (include.variants.where?.isActive !== undefined) {
              vList = vList.filter((v) => v.isActive === include.variants.where.isActive);
            }
            result.variants = vList;
          }
          if (include?.images) {
            result.images = Array.from(mockImages.values())
              .filter((i) => i.productId === prod.id)
              .sort((a, b) => a.displayOrder - b.displayOrder);
          }
          return Promise.resolve(result);
        }),
        findMany: vi.fn().mockImplementation(({ where = {}, include, orderBy, skip = 0, take = 20 } = {}) => {
          let list = Array.from(mockProducts.values());

          if (where.isActive !== undefined) {
            list = list.filter((p) => p.isActive === where.isActive);
          }
          if (where.categoryId) {
            list = list.filter((p) => p.categoryId === where.categoryId);
          }
          if (where.baseCashPrice) {
            if (where.baseCashPrice.gte !== undefined) {
              list = list.filter((p) => p.baseCashPrice >= where.baseCashPrice.gte);
            }
            if (where.baseCashPrice.lte !== undefined) {
              list = list.filter((p) => p.baseCashPrice <= where.baseCashPrice.lte);
            }
          }
          if (where.OR) {
            list = list.filter((p) => {
              return where.OR.some((clause: any) => {
                if (clause.title?.contains) {
                  return p.title.toLowerCase().includes(clause.title.contains.toLowerCase());
                }
                if (clause.titleAr?.contains) {
                  return p.titleAr?.toLowerCase().includes(clause.titleAr.contains.toLowerCase());
                }
                if (clause.description?.contains) {
                  return p.description.toLowerCase().includes(clause.description.contains.toLowerCase());
                }
                if (clause.descriptionAr?.contains) {
                  return p.descriptionAr?.toLowerCase().includes(clause.descriptionAr.contains.toLowerCase());
                }
                return false;
              });
            });
          }
          if (where.variants?.some?.stock?.gt !== undefined) {
            list = list.filter((p) => {
              const pVars = Array.from(mockVariants.values()).filter((v) => v.productId === p.id && v.isActive);
              return pVars.some((v) => v.stock > where.variants.some.stock.gt);
            });
          }

          // Sorting
          if (orderBy) {
            if (orderBy.createdAt) {
              list.sort((a, b) =>
                orderBy.createdAt === "desc"
                  ? b.createdAt.getTime() - a.createdAt.getTime()
                  : a.createdAt.getTime() - b.createdAt.getTime()
              );
            } else if (orderBy.baseCashPrice) {
              list.sort((a, b) =>
                orderBy.baseCashPrice === "asc"
                  ? a.baseCashPrice - b.baseCashPrice
                  : b.baseCashPrice - a.baseCashPrice
              );
            }
          }

          // Hydrate includes
          list = list.map((prod) => {
            const result: any = { ...prod };
            if (include?.category) {
              result.category = mockCategories.get(prod.categoryId) || null;
            }
            if (include?.variants) {
              let vList = Array.from(mockVariants.values()).filter((v) => v.productId === prod.id);
              if (include.variants.where?.isActive !== undefined) {
                vList = vList.filter((v) => v.isActive === include.variants.where.isActive);
              }
              result.variants = vList;
            }
            if (include?.images) {
              result.images = Array.from(mockImages.values())
                .filter((i) => i.productId === prod.id)
                .sort((a, b) => a.displayOrder - b.displayOrder);
            }
            return result;
          });

          return Promise.resolve(list.slice(skip, skip + take));
        }),
        count: vi.fn().mockImplementation(({ where = {} } = {}) => {
          let list = Array.from(mockProducts.values());
          if (where.categoryId) {
            list = list.filter((p) => p.categoryId === where.categoryId);
          }
          if (where.isActive !== undefined) {
            list = list.filter((p) => p.isActive === where.isActive);
          }
          if (where.baseCashPrice) {
            if (where.baseCashPrice.gte !== undefined) {
              list = list.filter((p) => p.baseCashPrice >= where.baseCashPrice.gte);
            }
            if (where.baseCashPrice.lte !== undefined) {
              list = list.filter((p) => p.baseCashPrice <= where.baseCashPrice.lte);
            }
          }
          if (where.OR) {
            list = list.filter((p) => {
              return where.OR.some((clause: any) => {
                if (clause.title?.contains) {
                  return p.title.toLowerCase().includes(clause.title.contains.toLowerCase());
                }
                if (clause.titleAr?.contains) {
                  return p.titleAr?.toLowerCase().includes(clause.titleAr.contains.toLowerCase());
                }
                if (clause.description?.contains) {
                  return p.description.toLowerCase().includes(clause.description.contains.toLowerCase());
                }
                if (clause.descriptionAr?.contains) {
                  return p.descriptionAr?.toLowerCase().includes(clause.descriptionAr.contains.toLowerCase());
                }
                return false;
              });
            });
          }
          if (where.variants?.some?.stock?.gt !== undefined) {
            list = list.filter((p) => {
              const pVars = Array.from(mockVariants.values()).filter((v) => v.productId === p.id && v.isActive);
              return pVars.some((v) => v.stock > where.variants.some.stock.gt);
            });
          }
          return Promise.resolve(list.length);
        }),
        aggregate: vi.fn().mockImplementation(() => {
          const prices = Array.from(mockProducts.values()).map((p) => p.baseCashPrice);
          const min = prices.length > 0 ? Math.min(...prices) : 0;
          const max = prices.length > 0 ? Math.max(...prices) : 0;
          return Promise.resolve({
            _min: { baseCashPrice: min },
            _max: { baseCashPrice: max },
          });
        }),
        create: vi.fn().mockImplementation(({ data }) => {
          const id = `prod_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`;
          const product = {
            id,
            title: data.title,
            titleAr: data.titleAr || null,
            description: data.description,
            descriptionAr: data.descriptionAr || null,
            slug: data.slug,
            categoryId: data.categoryId,
            baseCashPrice: data.baseCashPrice,
            specifications: data.specifications || null,
            isActive: data.isActive !== undefined ? data.isActive : true,
            createdAt: new Date(),
            updatedAt: new Date(),
          };
          mockProducts.set(id, product);
          return Promise.resolve(product);
        }),
        update: vi.fn().mockImplementation(({ where, data }) => {
          const prod = mockProducts.get(where.id);
          if (prod) {
            Object.assign(prod, data, { updatedAt: new Date() });
            mockProducts.set(where.id, prod);
            return Promise.resolve(prod);
          }
          return Promise.resolve(null);
        }),
      },
      productVariant: {
        findUnique: vi.fn().mockImplementation(({ where, include }) => {
          const variant = mockVariants.get(where.id) || null;
          if (!variant) return Promise.resolve(null);
          const result: any = { ...variant };
          if (include?.product) {
            result.product = mockProducts.get(variant.productId) || null;
          }
          return Promise.resolve(result);
        }),
        findFirst: vi.fn().mockImplementation(({ where }) => {
          for (const v of mockVariants.values()) {
            if (where.sku && v.sku === where.sku && (!where.id?.not || v.id !== where.id.not)) {
              return Promise.resolve(v);
            }
            if (
              where.productId &&
              v.productId === where.productId &&
              v.color === where.color &&
              v.size === where.size &&
              (!where.id?.not || v.id !== where.id.not)
            ) {
              return Promise.resolve(v);
            }
          }
          return Promise.resolve(null);
        }),
        findMany: vi.fn().mockImplementation(({ where = {} } = {}) => {
          let list = Array.from(mockVariants.values());
          if (where.productId) list = list.filter((v) => v.productId === where.productId);
          if (where.isActive !== undefined) list = list.filter((v) => v.isActive === where.isActive);
          return Promise.resolve(list);
        }),
        create: vi.fn().mockImplementation(({ data }) => {
          const id = `var_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`;
          const variant = {
            id,
            productId: data.productId,
            sku: data.sku,
            color: data.color || null,
            size: data.size || null,
            customAttributes: data.customAttributes || null,
            cashPrice: data.cashPrice,
            stock: data.stock || 0,
            isActive: data.isActive !== undefined ? data.isActive : true,
            createdAt: new Date(),
            updatedAt: new Date(),
          };
          mockVariants.set(id, variant);
          return Promise.resolve(variant);
        }),
        update: vi.fn().mockImplementation(({ where, data }) => {
          const variant = mockVariants.get(where.id);
          if (variant) {
            Object.assign(variant, data, { updatedAt: new Date() });
            mockVariants.set(where.id, variant);
            return Promise.resolve(variant);
          }
          return Promise.resolve(null);
        }),
        updateMany: vi.fn().mockImplementation(({ where, data }) => {
          let count = 0;
          for (const v of mockVariants.values()) {
            if (where.productId && v.productId === where.productId) {
              Object.assign(v, data);
              count++;
            }
          }
          return Promise.resolve({ count });
        }),
        count: vi.fn().mockImplementation(({ where = {} } = {}) => {
          let list = Array.from(mockVariants.values());
          if (where.productId) list = list.filter((v) => v.productId === where.productId);
          if (where.isActive !== undefined) list = list.filter((v) => v.isActive === where.isActive);
          if (where.id?.not) list = list.filter((v) => v.id !== where.id.not);
          return Promise.resolve(list.length);
        }),
        delete: vi.fn().mockImplementation(({ where }) => {
          const variant = mockVariants.get(where.id);
          if (variant) {
            mockVariants.delete(where.id);
            return Promise.resolve(variant);
          }
          return Promise.resolve(null);
        }),
      },
      productImage: {
        findMany: vi.fn().mockImplementation(({ where = {}, orderBy } = {}) => {
          let list = Array.from(mockImages.values());
          if (where.productId) list = list.filter((i) => i.productId === where.productId);
          if (orderBy?.displayOrder) {
            list.sort((a, b) => a.displayOrder - b.displayOrder);
          }
          return Promise.resolve(list);
        }),
        findFirst: vi.fn().mockImplementation(({ where = {}, orderBy } = {}) => {
          let list = Array.from(mockImages.values());
          if (where.id) list = list.filter((i) => i.id === where.id);
          if (where.productId) list = list.filter((i) => i.productId === where.productId);
          if (where.isPrimary !== undefined) list = list.filter((i) => i.isPrimary === where.isPrimary);
          if (orderBy?.displayOrder) {
            list.sort((a, b) => a.displayOrder - b.displayOrder);
          }
          return Promise.resolve(list[0] || null);
        }),
        create: vi.fn().mockImplementation(({ data }) => {
          const id = `img_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`;
          const img = {
            id,
            productId: data.productId,
            storageKey: data.storageKey,
            url: data.url,
            altText: data.altText || null,
            displayOrder: data.displayOrder || 0,
            isPrimary: data.isPrimary !== undefined ? data.isPrimary : false,
            createdAt: new Date(),
            updatedAt: new Date(),
          };
          mockImages.set(id, img);
          return Promise.resolve(img);
        }),
        update: vi.fn().mockImplementation(({ where, data }) => {
          const img = mockImages.get(where.id);
          if (img) {
            Object.assign(img, data, { updatedAt: new Date() });
            mockImages.set(where.id, img);
            return Promise.resolve(img);
          }
          return Promise.resolve(null);
        }),
        updateMany: vi.fn().mockImplementation(({ where, data }) => {
          let count = 0;
          for (const img of mockImages.values()) {
            if (where.productId && img.productId === where.productId) {
              if (where.isPrimary !== undefined && img.isPrimary !== where.isPrimary) continue;
              Object.assign(img, data);
              count++;
            }
          }
          return Promise.resolve({ count });
        }),
        delete: vi.fn().mockImplementation(({ where }) => {
          const img = mockImages.get(where.id);
          if (img) {
            mockImages.delete(where.id);
            return Promise.resolve(img);
          }
          return Promise.resolve(null);
        }),
      },
      inventoryTransaction: {
        create: vi.fn().mockImplementation(({ data }) => {
          const tx = { id: `inv_${Date.now()}`, ...data, createdAt: new Date() };
          mockInventoryTransactions.push(tx);
          return Promise.resolve(tx);
        }),
        findMany: vi.fn().mockImplementation(() => Promise.resolve(mockInventoryTransactions)),
      },
      auditLog: {
        create: vi.fn().mockImplementation(({ data }) => {
          const log = { id: `log_${Date.now()}`, ...data, createdAt: new Date() };
          mockAuditLogs.push(log);
          return Promise.resolve(log);
        }),
        findFirst: vi.fn().mockImplementation(({ where }) => {
          return Promise.resolve(
            mockAuditLogs.find(
              (l) =>
                (!where.entity || l.entity === where.entity) &&
                (!where.entityId || l.entityId === where.entityId)
            ) || null
          );
        }),
      },
      $transaction: vi.fn().mockImplementation(async (callback) => {
        return callback(mockPrisma);
      }),
    };

    categoryService = new CategoryService(mockPrisma);
    productImageService = new ProductImageService(mockPrisma);
    variantService = new VariantService(mockPrisma);
    productService = new ProductService(mockPrisma, categoryService, variantService, productImageService);
  });

  describe("1. Category Domain & Service Layer", () => {
    it("creates a root category with automatic slug generation and audit log", async () => {
      const cat = await categoryService.createCategory(
        {
          name: "Smartphones",
          nameAr: "الهواتف الذكية",
        },
        "admin-user-1",
        UserRole.ADMIN
      );

      expect(cat).toBeDefined();
      expect(cat.name).toBe("Smartphones");
      expect(cat.nameAr).toBe("الهواتف الذكية");
      expect(cat.slug).toBe("smartphones");
      expect(cat.isActive).toBe(true);

      const audit = await mockPrisma.auditLog.findFirst({
        where: { entity: "Category", entityId: cat.id },
      });
      expect(audit).toBeDefined();
      expect(audit?.summary).toContain("Created category");
    });

    it("handles slug collisions by auto-incrementing suffix", async () => {
      const cat1 = await categoryService.createCategory({ name: "Laptops" });
      const cat2 = await categoryService.createCategory({ name: "Laptops" });
      const cat3 = await categoryService.createCategory({ name: "Laptops" });

      expect(cat1.slug).toBe("laptops");
      expect(cat2.slug).toBe("laptops-1");
      expect(cat3.slug).toBe("laptops-2");
    });

    it("supports parent-child category hierarchies", async () => {
      const parent = await categoryService.createCategory({ name: "Electronics", nameAr: "إلكترونيات" });
      const child = await categoryService.createCategory({
        name: "Headphones",
        nameAr: "سماعات الرأس",
        parentId: parent.id,
      });

      expect(child.parentId).toBe(parent.id);

      const tree = await categoryService.getCategories();
      expect(tree.length).toBe(1);
      expect(tree[0].name).toBe("Electronics");
      expect(tree[0].children?.length).toBe(1);
      expect(tree[0].children?.[0].name).toBe("Headphones");
    });

    it("prevents deleting a category containing products", async () => {
      const cat = await categoryService.createCategory({ name: "Accessories" });

      await productService.createProduct({
        title: "Fast Charger 65W",
        description: "High speed USB-C charger",
        categoryId: cat.id,
        baseCashPrice: 350,
        variants: [
          { sku: "CHG-65W-BLK", color: "Black", cashPrice: 350, stock: 10 },
        ],
      });

      await expect(categoryService.deleteCategory(cat.id)).rejects.toThrow(ConflictError);
    });
  });

  describe("2. Product Creation, Variants & Invariants", () => {
    it("atomically creates a product with variants, images, and inventory transactions", async () => {
      const cat = await categoryService.createCategory({ name: "Audio", nameAr: "صوتيات" });

      const product = await productService.createProduct(
        {
          title: "Wireless ANC Headphones",
          titleAr: "سماعات لاسلكية عازلة للضوضاء",
          description: "Premium active noise cancelling over-ear headphones.",
          descriptionAr: "سماعات رأس لاسلكية ممتازة مع ميزة إلغاء الضوضاء الفعالة.",
          categoryId: cat.id,
          baseCashPrice: 1800,
          variants: [
            {
              sku: "ANC-HEAD-BLK",
              color: "Midnight Black",
              size: "Standard",
              cashPrice: 1800,
              stock: 15,
            },
            {
              sku: "ANC-HEAD-SLV",
              color: "Silver",
              size: "Standard",
              cashPrice: 1850,
              stock: 8,
            },
          ],
          images: [
            {
              storageKey: "products/anc-1.jpg",
              url: "https://example.com/anc-1.jpg",
              altText: "Black ANC Headphone",
              isPrimary: true,
            },
            {
              storageKey: "products/anc-2.jpg",
              url: "https://example.com/anc-2.jpg",
              altText: "Silver ANC Headphone",
              isPrimary: false,
            },
          ],
        },
        "admin-user-1",
        UserRole.ADMIN
      );

      expect(product).toBeDefined();
      expect(product.variants.length).toBe(2);
      expect(product.images.length).toBe(2);
      expect(product.primaryImage?.url).toBe("https://example.com/anc-1.jpg");
      expect(product.minPrice).toBe(1800);
      expect(product.maxPrice).toBe(1850);
      expect(product.totalStock).toBe(23);

      const invTx = await mockPrisma.inventoryTransaction.findMany();
      expect(invTx.length).toBe(2);
      expect(invTx.map((t: any) => t.quantity)).toEqual(expect.arrayContaining([15, 8]));
    });

    it("rejects duplicate variant color and size combinations on same product", async () => {
      const cat = await categoryService.createCategory({ name: "Wearables" });
      const product = await productService.createProduct({
        title: "Smart Watch V2",
        description: "Fitness tracker watch",
        categoryId: cat.id,
        baseCashPrice: 900,
        variants: [
          { sku: "SW2-BLK-M", color: "Black", size: "Medium", cashPrice: 900, stock: 5 },
        ],
      });

      await expect(
        variantService.createVariant(product.id, {
          sku: "SW2-BLK-M-DUP",
          color: "Black",
          size: "Medium",
          cashPrice: 900,
          stock: 3,
        })
      ).rejects.toThrow(ConflictError);
    });

    it("enforces invariant: cannot deactivate or delete the last active variant of an active product", async () => {
      const cat = await categoryService.createCategory({ name: "Gadgets" });
      const product = await productService.createProduct({
        title: "Portable Power Bank",
        description: "20000mAh Power bank",
        categoryId: cat.id,
        baseCashPrice: 450,
        variants: [
          { sku: "PB-20K-1", color: "Black", cashPrice: 450, stock: 10, isActive: true },
        ],
      });

      const variant = product.variants[0];

      await expect(
        variantService.updateVariant(variant.id, { isActive: false })
      ).rejects.toThrow(ValidationError);

      await expect(
        variantService.deleteVariant(variant.id)
      ).rejects.toThrow(ValidationError);
    });
  });

  describe("3. Catalog Queries, Multilingual Search & Filtering", () => {
    beforeEach(async () => {
      const catPhones = await categoryService.createCategory({ name: "Phones", nameAr: "الهواتف", slug: "phones" });
      const catLaptops = await categoryService.createCategory({ name: "Computers", nameAr: "حواسيب", slug: "computers" });

      // Product 1: iPhone
      await productService.createProduct({
        title: "Apple iPhone 15 Pro",
        titleAr: "آبل آيفون 15 برو",
        description: "Titanium design with A17 Pro chip.",
        descriptionAr: "تصميم من التيتانيوم مع شريحة إيه 17 برو الجبارة.",
        categoryId: catPhones.id,
        baseCashPrice: 45000,
        variants: [
          { sku: "IP15P-128", color: "Natural Titanium", cashPrice: 45000, stock: 4 },
        ],
      });

      // Product 2: Budget Phone
      await productService.createProduct({
        title: "Samsung Galaxy A15",
        titleAr: "سامسونج جالاكسي ايه 15",
        description: "Super AMOLED display with long battery.",
        descriptionAr: "شاشة سوبر أموليد وبطارية تدوم طويلاً.",
        categoryId: catPhones.id,
        baseCashPrice: 6500,
        variants: [
          { sku: "SMA15-BLU", color: "Blue", cashPrice: 6500, stock: 12 },
        ],
      });

      // Product 3: Laptop
      await productService.createProduct({
        title: "MacBook Air M3",
        titleAr: "ماك بوك اير ام 3",
        description: "Ultra thin Apple Silicon laptop.",
        descriptionAr: "حاسوب محمول فائق النحافة بمعالج آبل سيليكون.",
        categoryId: catLaptops.id,
        baseCashPrice: 52000,
        variants: [
          { sku: "MBA-M3-SLV", color: "Silver", cashPrice: 52000, stock: 0 },
        ],
      });
    });

    it("searches products across Arabic and English titles and descriptions", async () => {
      const resEn = await productService.getCatalog({ search: "Titanium" });
      expect(resEn.total).toBe(1);
      expect(resEn.items[0].title).toBe("Apple iPhone 15 Pro");

      const resAr = await productService.getCatalog({ search: "سامسونج" });
      expect(resAr.total).toBe(1);
      expect(resAr.items[0].title).toBe("Samsung Galaxy A15");
    });

    it("filters catalog by in-stock products only", async () => {
      const res = await productService.getCatalog({ inStockOnly: true });
      expect(res.total).toBe(2);
      expect(res.items.some((p) => p.title.includes("MacBook"))).toBe(false);
    });

    it("filters catalog by price range and sorts by price ascending", async () => {
      const res = await productService.getCatalog({
        minPrice: 5000,
        maxPrice: 46000,
        sortBy: "price-asc",
      });

      expect(res.total).toBe(2);
      expect(res.items[0].baseCashPrice).toBe(6500);
      expect(res.items[1].baseCashPrice).toBe(45000);
    });
  });

  describe("4. Media Management & Primary Image Assignment", () => {
    it("handles image addition, primary flag updates, and primary fallback on deletion", async () => {
      const cat = await categoryService.createCategory({ name: "Cables" });
      const product = await productService.createProduct({
        title: "Braided Cable 2M",
        description: "Heavy duty braided USB-C cable",
        categoryId: cat.id,
        baseCashPrice: 120,
        variants: [{ sku: "CBL-2M-1", cashPrice: 120, stock: 50 }],
        images: [
          { storageKey: "img-1.jpg", url: "https://example.com/1.jpg", isPrimary: true },
          { storageKey: "img-2.jpg", url: "https://example.com/2.jpg", isPrimary: false },
        ],
      });

      const images = await productImageService.getProductImages(product.id);
      expect(images.length).toBe(2);
      expect(images[0].isPrimary).toBe(true);

      await productImageService.setPrimaryImage(product.id, images[1].id);
      const updatedImages = await productImageService.getProductImages(product.id);
      expect(updatedImages.find((i) => i.id === images[1].id)?.isPrimary).toBe(true);
      expect(updatedImages.find((i) => i.id === images[0].id)?.isPrimary).toBe(false);

      await productImageService.deleteImage(product.id, images[1].id);
      const remainingImages = await productImageService.getProductImages(product.id);
      expect(remainingImages.length).toBe(1);
      expect(remainingImages[0].isPrimary).toBe(true);
    });
  });

  describe("5. Localization & Formatting Utilities", () => {
    it("correctly resolves localized text with Arabic default fallback", () => {
      expect(getLocalizedText("هاتف ذكي", "Smartphone", "ar")).toBe("هاتف ذكي");
      expect(getLocalizedText("هاتف ذكي", "Smartphone", "en")).toBe("Smartphone");
      expect(getLocalizedText(null, "Laptop", "ar")).toBe("Laptop");
      expect(getLocalizedText("حاسوب", null, "en")).toBe("حاسوب");
    });

    it("formats Egyptian Pounds according to locale", () => {
      expect(formatPrice(1500, "ar")).toContain("ج.م");
      expect(formatPrice(1500, "en")).toContain("EGP");
    });
  });
});
