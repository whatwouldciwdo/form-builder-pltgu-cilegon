import { prisma } from "../src/lib/prisma";
import bcrypt from "bcryptjs";

async function main() {
  console.log("Seeding initial administrator user...");

  const existingAdmin = await prisma.user.findUnique({
    where: { email: "admin@pltgu-cilegon.co.id" },
  });

  if (!existingAdmin) {
    const hashedPassword = await bcrypt.hash("AdminPLTGU2026!", 10);
    const admin = await prisma.user.create({
      data: {
        name: "Admin PLTGU Cilegon",
        email: "admin@pltgu-cilegon.co.id",
        password: hashedPassword,
        role: "SUPER_ADMIN",
      },
    });

    console.log(`Admin user created: ${admin.email}`);
  } else {
    console.log("Admin user already exists.");
  }
}

main()
  .catch((e) => {
    console.error("Seed error:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
