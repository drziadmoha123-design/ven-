import { PrismaClient, UserRole } from "@prisma/client";
import * as argon2 from "argon2";
import { DOMAIN_DEFAULTS, SYSTEM_SETTING_KEYS } from "../../domain/constants";

export interface BootstrapResult {
  settingsCreated: number;
  adminCreated: boolean;
  adminEmail: string;
  categoriesCreated: number;
}

export async function bootstrapDatabase(prisma: PrismaClient): Promise<BootstrapResult> {
  let settingsCreated = 0;
  let adminCreated = false;
  let categoriesCreated = 0;

  // 1. Initialize System Settings
  const defaultSettings: Array<{ key: string; value: string; description: string }> = [
    {
      key: SYSTEM_SETTING_KEYS.GLOBAL_SHIPPING_PRICE,
      value: String(DOMAIN_DEFAULTS.GLOBAL_SHIPPING_PRICE),
      description: "Standard global shipping price in EGP for Cash on Delivery orders",
    },
    {
      key: SYSTEM_SETTING_KEYS.EXPECTED_DELIVERY_DURATION,
      value: DOMAIN_DEFAULTS.EXPECTED_DELIVERY_DURATION,
      description: "Estimated delivery duration displayed to customers",
    },
    {
      key: SYSTEM_SETTING_KEYS.LOW_STOCK_THRESHOLD,
      value: String(DOMAIN_DEFAULTS.LOW_STOCK_THRESHOLD),
      description: "Threshold below which inventory triggers low-stock operational notifications",
    },
  ];

  for (const setting of defaultSettings) {
    const existing = await prisma.systemSetting.findUnique({
      where: { key: setting.key },
    });

    if (!existing) {
      await prisma.systemSetting.create({
        data: {
          key: setting.key,
          value: setting.value,
          description: setting.description,
        },
      });
      settingsCreated++;
    }
  }

  // 2. Admin User Bootstrap from Environment
  const adminEmail = (process.env.ADMIN_EMAIL || "admin@venplus.com").trim().toLowerCase();
  const existingAdmin = await prisma.user.findFirst({
    where: {
      OR: [
        { email: adminEmail },
        { role: UserRole.ADMIN },
      ],
    },
  });

  if (!existingAdmin) {
    let passwordHash = process.env.ADMIN_PASSWORD_HASH;
    if (!passwordHash) {
      const defaultPassword = process.env.ADMIN_PASSWORD || "Admin123!VenPlus";
      passwordHash = await argon2.hash(defaultPassword, {
        type: argon2.argon2id,
        memoryCost: 65536,
        timeCost: 3,
        parallelism: 4,
      });
    }

    await prisma.user.create({
      data: {
        email: adminEmail,
        passwordHash,
        fullName: "VEN+ Platform Administrator",
        phone: "01000000000",
        role: UserRole.ADMIN,
        referralCode: "VENADMIN",
        emailVerifiedAt: new Date(),
        isActive: true,
      },
    });
    adminCreated = true;
  }

  // 3. Foundation Categories
  const initialCategories = [
    {
      name: "Electronics & Tech",
      nameAr: "إلكترونيات وتكنولوجيا",
      slug: "electronics",
    },
    {
      name: "Fashion & Lifestyle",
      nameAr: "أزياء وأسلوب حياة",
      slug: "fashion",
    },
    {
      name: "Home & Living",
      nameAr: "مستلزمات المنزل",
      slug: "home-living",
    },
  ];

  for (const cat of initialCategories) {
    const existingCat = await prisma.category.findUnique({
      where: { slug: cat.slug },
    });

    if (!existingCat) {
      await prisma.category.create({
        data: {
          name: cat.name,
          nameAr: cat.nameAr,
          slug: cat.slug,
          isActive: true,
        },
      });
      categoriesCreated++;
    }
  }

  return {
    settingsCreated,
    adminCreated,
    adminEmail,
    categoriesCreated,
  };
}
