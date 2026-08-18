import { PrismaClient } from "@prisma/client";
import { bootstrapDatabase } from "../src/lib/db/seed";

const prisma = new PrismaClient();

async function main() {
  console.log("Starting VEN+ Platform database bootstrap...");
  const result = await bootstrapDatabase(prisma);
  console.log("Bootstrap completed successfully:", result);
}

main()
  .catch((e) => {
    console.error("Bootstrap failed:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
