import { prisma } from "../../lib/prisma";
import { NotFoundError, ConflictError, ValidationError } from "../../domain/errors";
import { CategoryDTO, toCategoryDTO } from "../../domain/types/catalog";
import { CreateCategoryInput, UpdateCategoryInput } from "../validators/catalog.schema";
import { AuditAction, UserRole } from "@prisma/client";

export class CategoryService {
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
      const existing = await prisma.category.findUnique({
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
    const categories = await prisma.category.findMany({
      where: includeInactive ? undefined : { isActive: true },
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

    // Return root categories with nested children
    return categories
      .filter((cat) => !cat.parentId)
      .map((cat) => toCategoryDTO(cat));
  }

  /**
   * Retrieves all categories flat (useful for dropdowns/admin)
   */
  async getAllFlatCategories(includeInactive = false): Promise<CategoryDTO[]> {
    const categories = await prisma.category.findMany({
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

    return categories.map((cat) => toCategoryDTO(cat));
  }

  /**
   * Retrieves a category by ID
   */
  async getCategoryById(id: string): Promise<CategoryDTO> {
    const category = await prisma.category.findUnique({
      where: { id },
      include: {
        _count: {
          select: {
            products: {
              where: { isActive: true, archivedAt: null },
            },
          },
        },
        children: true,
      },
    });

    if (!category) {
      throw new NotFoundError(`Category with ID '${id}' not found.`);
    }

    return toCategoryDTO(category);
  }

  /**
   * Retrieves a category by Slug
   */
  async getCategoryBySlug(slug: string): Promise<CategoryDTO> {
    const category = await prisma.category.findUnique({
      where: { slug },
      include: {
        _count: {
          select: {
            products: {
              where: { isActive: true, archivedAt: null },
            },
          },
        },
        children: true,
      },
    });

    if (!category) {
      throw new NotFoundError(`Category with slug '${slug}' not found.`);
    }

    return toCategoryDTO(category);
  }

  /**
   * Creates a new Category (Admin operation)
   */
  async createCategory(
    input: CreateCategoryInput,
    actorId?: string,
    actorRole?: UserRole,
    ipAddress?: string
  ): Promise<CategoryDTO> {
    const baseSlug = input.slug || this.generateSlug(input.name) || "category";
    const slug = await this.ensureUniqueSlug(baseSlug);

    if (input.parentId) {
      const parent = await prisma.category.findUnique({
        where: { id: input.parentId },
      });
      if (!parent) {
        throw new NotFoundError(`Parent category with ID '${input.parentId}' not found.`);
      }
    }

    const created = await prisma.$transaction(async (tx) => {
      const cat = await tx.category.create({
        data: {
          name: input.name,
          nameAr: input.nameAr,
          slug,
          parentId: input.parentId || null,
          isActive: input.isActive ?? true,
        },
        include: {
          _count: { select: { products: true } },
          children: true,
        },
      });

      await tx.auditLog.create({
        data: {
          actorId: actorId || null,
          actorRole: actorRole || null,
          action: AuditAction.CREATE,
          entity: "Category",
          entityId: cat.id,
          summary: `Created category '${cat.name}' (${cat.slug})`,
          details: { input, generatedSlug: slug },
          ipAddress: ipAddress || null,
        },
      });

      return cat;
    });

    return toCategoryDTO(created);
  }

  /**
   * Updates an existing Category (Admin operation)
   */
  async updateCategory(
    id: string,
    input: UpdateCategoryInput,
    actorId?: string,
    actorRole?: UserRole,
    ipAddress?: string
  ): Promise<CategoryDTO> {
    const existing = await prisma.category.findUnique({
      where: { id },
    });

    if (!existing) {
      throw new NotFoundError(`Category with ID '${id}' not found.`);
    }

    let slug = existing.slug;
    if (input.slug && input.slug !== existing.slug) {
      slug = await this.ensureUniqueSlug(input.slug, id);
    } else if (input.name && !input.slug && input.name !== existing.name) {
      slug = await this.ensureUniqueSlug(this.generateSlug(input.name), id);
    }

    if (input.parentId) {
      if (input.parentId === id) {
        throw new ValidationError("A category cannot be its own parent.");
      }
      const parent = await prisma.category.findUnique({
        where: { id: input.parentId },
      });
      if (!parent) {
        throw new NotFoundError(`Parent category with ID '${input.parentId}' not found.`);
      }
    }

    const updated = await prisma.$transaction(async (tx) => {
      const cat = await tx.category.update({
        where: { id },
        data: {
          name: input.name !== undefined ? input.name : existing.name,
          nameAr: input.nameAr !== undefined ? input.nameAr : existing.nameAr,
          slug,
          parentId: input.parentId !== undefined ? input.parentId : existing.parentId,
          isActive: input.isActive !== undefined ? input.isActive : existing.isActive,
        },
        include: {
          _count: { select: { products: true } },
          children: true,
        },
      });

      await tx.auditLog.create({
        data: {
          actorId: actorId || null,
          actorRole: actorRole || null,
          action: AuditAction.UPDATE,
          entity: "Category",
          entityId: cat.id,
          summary: `Updated category '${cat.name}' (${cat.slug})`,
          details: { before: existing, after: cat, input },
          ipAddress: ipAddress || null,
        },
      });

      return cat;
    });

    return toCategoryDTO(updated);
  }

  /**
   * Deletes or deactivates a category (Admin operation)
   */
  async deleteCategory(
    id: string,
    actorId?: string,
    actorRole?: UserRole,
    ipAddress?: string
  ): Promise<void> {
    const existing = await prisma.category.findUnique({
      where: { id },
      include: {
        _count: { select: { products: true, children: true } },
      },
    });

    if (!existing) {
      throw new NotFoundError(`Category with ID '${id}' not found.`);
    }

    if (existing._count.products > 0) {
      throw new ConflictError(
        `Cannot delete category '${existing.name}' because it contains ${existing._count.products} product(s). Deactivate it or reassign products first.`
      );
    }

    if (existing._count.children > 0) {
      throw new ConflictError(
        `Cannot delete category '${existing.name}' because it has subcategories. Remove or reassign subcategories first.`
      );
    }

    await prisma.$transaction(async (tx) => {
      await tx.category.delete({
        where: { id },
      });

      await tx.auditLog.create({
        data: {
          actorId: actorId || null,
          actorRole: actorRole || null,
          action: AuditAction.DELETE,
          entity: "Category",
          entityId: id,
          summary: `Deleted category '${existing.name}'`,
          details: { deletedCategory: existing },
          ipAddress: ipAddress || null,
        },
      });
    });
  }
}

export const categoryService = new CategoryService();
