import { prisma as defaultPrisma } from "../../lib/prisma";
import { NotFoundError, ConflictError, ValidationError } from "../../domain/errors";
import { CategoryDTO, toCategoryDTO } from "../../domain/types/catalog";
import { CreateCategoryInput, UpdateCategoryInput } from "../validators/catalog.schema";
import { AuditAction, UserRole } from "@prisma/client";

export class CategoryService {
  constructor(private prisma: any = defaultPrisma) {}

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
      const existing = await client.category.findUnique({
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
   * Retrieves active categories tree or flat list with product counts
   */
  async getCategories(includeInactive = false): Promise<CategoryDTO[]> {
    const categories = await this.prisma.category.findMany({
      where: {
        parentId: null,
        ...(includeInactive ? {} : { isActive: true }),
      },
      include: {
        _count: {
          select: {
            products: {
              where: includeInactive ? undefined : { isActive: true, archivedAt: null },
            },
          },
        },
        children: {
          where: includeInactive ? undefined : { isActive: true },
          include: {
            _count: {
              select: {
                products: {
                  where: includeInactive ? undefined : { isActive: true, archivedAt: null },
                },
              },
            },
          },
        },
      },
      orderBy: { name: "asc" },
    });

    return categories.map((cat: any) => toCategoryDTO(cat));
  }

  /**
   * Retrieves all categories as flat list
   */
  async getAllFlatCategories(includeInactive = false): Promise<CategoryDTO[]> {
    const categories = await this.prisma.category.findMany({
      where: includeInactive ? undefined : { isActive: true },
      include: {
        _count: {
          select: {
            products: {
              where: includeInactive ? undefined : { isActive: true, archivedAt: null },
            },
          },
        },
      },
      orderBy: { name: "asc" },
    });

    return categories.map((cat: any) => toCategoryDTO(cat));
  }

  /**
   * Retrieves single category by ID
   */
  async getCategoryById(id: string): Promise<CategoryDTO> {
    const category = await this.prisma.category.findUnique({
      where: { id },
      include: {
        _count: {
          select: {
            products: {
              where: { isActive: true, archivedAt: null },
            },
          },
        },
        children: {
          include: {
            _count: {
              select: {
                products: {
                  where: { isActive: true, archivedAt: null },
                },
              },
            },
          },
        },
      },
    });

    if (!category) {
      throw new NotFoundError("Category not found");
    }

    return toCategoryDTO(category);
  }

  /**
   * Retrieves single category by Slug
   */
  async getCategoryBySlug(slug: string): Promise<CategoryDTO> {
    const category = await this.prisma.category.findUnique({
      where: { slug },
      include: {
        _count: {
          select: {
            products: {
              where: { isActive: true, archivedAt: null },
            },
          },
        },
        children: {
          include: {
            _count: {
              select: {
                products: {
                  where: { isActive: true, archivedAt: null },
                },
              },
            },
          },
        },
      },
    });

    if (!category) {
      throw new NotFoundError(`Category with slug '${slug}' not found`);
    }

    return toCategoryDTO(category);
  }

  /**
   * Admin: Creates a new category with slug generation and audit logging
   */
  async createCategory(
    input: CreateCategoryInput,
    actorId?: string,
    actorRole?: UserRole,
    ipAddress?: string
  ): Promise<CategoryDTO> {
    const rawSlug = input.slug ? this.generateSlug(input.slug) : this.generateSlug(input.name);
    const slug = await this.ensureUniqueSlug(rawSlug);

    if (input.parentId) {
      const parent = await this.prisma.category.findUnique({
        where: { id: input.parentId },
      });
      if (!parent) {
        throw new NotFoundError("Parent category not found");
      }
    }

    const category = await this.prisma.$transaction(async (tx: any) => {
      const created = await tx.category.create({
        data: {
          name: input.name.trim(),
          nameAr: input.nameAr?.trim() || null,
          slug,
          parentId: input.parentId || null,
          isActive: input.isActive ?? true,
        },
      });

      if (actorId && actorRole) {
        await tx.auditLog.create({
          data: {
            userId: actorId,
            userRole: actorRole,
            action: AuditAction.CREATE,
            entity: "Category",
            entityId: created.id,
            newData: created,
            ipAddress: ipAddress || null,
            summary: `Created category '${created.name}' (${created.slug})`,
          },
        });
      }

      return created;
    });

    return toCategoryDTO(category);
  }

  /**
   * Admin: Updates an existing category
   */
  async updateCategory(
    id: string,
    input: UpdateCategoryInput,
    actorId?: string,
    actorRole?: UserRole,
    ipAddress?: string
  ): Promise<CategoryDTO> {
    const existing = await this.prisma.category.findUnique({ where: { id } });
    if (!existing) {
      throw new NotFoundError("Category not found");
    }

    let slug = existing.slug;
    if (input.slug && input.slug !== existing.slug) {
      const formatted = this.generateSlug(input.slug);
      slug = await this.ensureUniqueSlug(formatted, id);
    } else if (input.name && input.name !== existing.name && !input.slug) {
      const formatted = this.generateSlug(input.name);
      slug = await this.ensureUniqueSlug(formatted, id);
    }

    if (input.parentId && input.parentId !== existing.parentId) {
      if (input.parentId === id) {
        throw new ValidationError("Category cannot be its own parent");
      }
      const parent = await this.prisma.category.findUnique({
        where: { id: input.parentId },
      });
      if (!parent) {
        throw new NotFoundError("Parent category not found");
      }
    }

    const category = await this.prisma.$transaction(async (tx: any) => {
      const updated = await tx.category.update({
        where: { id },
        data: {
          name: input.name !== undefined ? input.name.trim() : undefined,
          nameAr: input.nameAr !== undefined ? input.nameAr?.trim() || null : undefined,
          slug,
          parentId: input.parentId !== undefined ? input.parentId : undefined,
          isActive: input.isActive !== undefined ? input.isActive : undefined,
        },
      });

      if (actorId && actorRole) {
        await tx.auditLog.create({
          data: {
            userId: actorId,
            userRole: actorRole,
            action: AuditAction.UPDATE,
            entity: "Category",
            entityId: updated.id,
            oldData: existing,
            newData: updated,
            ipAddress: ipAddress || null,
            summary: `Updated category '${updated.name}' (${updated.slug})`,
          },
        });
      }

      return updated;
    });

    return toCategoryDTO(category);
  }

  /**
   * Admin: Deletes a category if it has no products or child categories
   */
  async deleteCategory(
    id: string,
    actorId?: string,
    actorRole?: UserRole,
    ipAddress?: string
  ): Promise<void> {
    const existing = await this.prisma.category.findUnique({
      where: { id },
      include: {
        _count: {
          select: {
            products: true,
            children: true,
          },
        },
      },
    });

    if (!existing) {
      throw new NotFoundError("Category not found");
    }

    if (existing._count.products > 0) {
      throw new ConflictError(
        `Cannot delete category containing ${existing._count.products} product(s). Reassign or delete products first.`
      );
    }

    if (existing._count.children > 0) {
      throw new ConflictError(
        `Cannot delete category containing ${existing._count.children} child categories. Delete or move subcategories first.`
      );
    }

    await this.prisma.$transaction(async (tx: any) => {
      await tx.category.delete({ where: { id } });

      if (actorId && actorRole) {
        await tx.auditLog.create({
          data: {
            userId: actorId,
            userRole: actorRole,
            action: AuditAction.DELETE,
            entity: "Category",
            entityId: id,
            oldData: existing,
            ipAddress: ipAddress || null,
            summary: `Deleted category '${existing.name}' (${existing.slug})`,
          },
        });
      }
    });
  }
}

export const categoryService = new CategoryService();
