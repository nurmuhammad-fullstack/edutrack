import { PrismaClient } from "../lib/generated/prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";
import * as dotenv from "dotenv";

dotenv.config({ path: ".env.local" });

const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL! });
const prisma = new PrismaClient({ adapter } as any);

async function main() {
  const existing = await prisma.trainer.findUnique({
    where: { id: "dev-trainer-001" },
  });

  if (existing) {
    console.log("✓ Already seeded");
    return;
  }

  await prisma.trainer.create({
    data: {
      id: "dev-trainer-001",
      email: "test@edutrack.uz",
      name: "Test Trener",
      plan: "PRO",
      groups: {
        create: [
          { name: "1-guruh · Boshlang'ich", monthlyFee: 450000 },
          { name: "2-guruh · O'rta", monthlyFee: 500000 },
          { name: "3-guruh · Yuqori", monthlyFee: 600000 },
        ],
      },
    },
  });

  console.log("✓ Seeded: trainer + 3 groups");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
