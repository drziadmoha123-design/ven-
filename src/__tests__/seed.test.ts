import { describe, it, expect, vi } from "vitest";
import { bootstrapDatabase } from "@/lib/db/seed";
import { PrismaClient, UserRole } from "@prisma/client";
import { DOMAIN_DEFAULTS } from "@/domain/constants";

describe("Database Seed & Bootstrap Architecture", () => {
  it("should bootstrap system settings, admin account, and default categories idempotently", async () => {
    const settingsMap = new Map<string, any>();
    const usersMap = new Map<string, any>();
    const categoriesMap = new Map<string, any>();

    const mockPrisma = {
      systemSetting: {
        findUnique: vi.fn().mockImplementation(({ where }) => {
          return Promise.resolve(settingsMap.get(where.key) || null);
        }),
        create: vi.fn().mockImplementation(({ data }) => {
          settingsMap.set(data.key, data);
          return Promise.resolve(data);
        }),
      },
      user: {
        findFirst: vi.fn().mockImplementation(() => {
          return Promise.resolve(usersMap.size > 0 ? Array.from(usersMap.values())[0] : null);
        }),
        create: vi.fn().mockImplementation(({ data }) => {
          usersMap.set(data.email, data);
          return Promise.resolve(data);
        }),
      },
      category: {
        findUnique: vi.fn().mockImplementation(({ where }) => {
          return Promise.resolve(categoriesMap.get(where.slug) || null);
        }),
        create: vi.fn().mockImplementation(({ data }) => {
          categoriesMap.set(data.slug, data);
          return Promise.resolve(data);
        }),
      },
    } as unknown as PrismaClient;

    // Run first time
    const firstRun = await bootstrapDatabase(mockPrisma);
    expect(firstRun.settingsCreated).toBe(3);
    expect(firstRun.adminCreated).toBe(true);
    expect(firstRun.categoriesCreated).toBe(3);

    // Verify Admin created
    const createdAdmin = usersMap.get(firstRun.adminEmail);
    expect(createdAdmin).toBeDefined();
    expect(createdAdmin.role).toBe(UserRole.ADMIN);
    expect(createdAdmin.isActive).toBe(true);
    expect(createdAdmin.passwordHash).toBeDefined();

    // Verify Settings created
    const shippingSetting = settingsMap.get("GLOBAL_SHIPPING_PRICE");
    expect(shippingSetting).toBeDefined();
    expect(shippingSetting.value).toBe(String(DOMAIN_DEFAULTS.GLOBAL_SHIPPING_PRICE));

    // Run second time to verify idempotency
    const secondRun = await bootstrapDatabase(mockPrisma);
    expect(secondRun.settingsCreated).toBe(0);
    expect(secondRun.adminCreated).toBe(false);
    expect(secondRun.categoriesCreated).toBe(0);
  });
});
