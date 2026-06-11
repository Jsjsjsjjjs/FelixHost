// prisma/seed.ts
import { PrismaClient, Role } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

async function main() {
  console.log("Seeding database...");

  // Create owner account
  const passwordHash = await bcrypt.hash("admin123", 12);

  const owner = await prisma.user.upsert({
    where: { email: "admin@pterocontrol.local" },
    update: {},
    create: {
      email: "admin@pterocontrol.local",
      username: "admin",
      passwordHash,
      role: Role.OWNER,
    },
  });

  console.log("Created owner:", owner.email);

  // Default settings
  const settings = [
    { key: "app_name", value: "PteroControl", description: "Application name", isPublic: true },
    { key: "max_session_hours", value: "24", description: "Session expiry in hours" },
    { key: "enable_notifications", value: "true", description: "Enable notifications" },
    { key: "snapshot_interval_minutes", value: "5", description: "Resource snapshot interval" },
  ];

  for (const s of settings) {
    await prisma.settings.upsert({
      where: { key: s.key },
      update: {},
      create: s,
    });
  }

  console.log("Seed complete.");
}

main()
  .catch((e) => { console.error(e); process.exit(1); })
  .finally(() => prisma.$disconnect());
