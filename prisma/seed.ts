import { PrismaClient, Role } from "./generated/prisma";
import * as bcrypt from "bcrypt";

const prisma = new PrismaClient();

async function main() {
  const superAdminEmail = "admin@miratonroseafrica.com";
  const superAdminPassword = "changethispassword";

  // Hash the password
  const hashedPassword = await bcrypt.hash(superAdminPassword, 10);

  // Create super admin user
  await prisma.user.create({
    data: {
      email: superAdminEmail,
      password: hashedPassword,
      role: Role.super_admin,
      firstName: "Miratonrose",
      lastName: "Admin",
      userName: "SuperAdmin",
    },
  });

  // Create default restriction types
  await prisma.restriction.createMany({
    data: [
      {
        type: "suspend_login",
      },
      {
        type: "block_vend",
      },
    ],
  });

  // Create default fee
  await prisma.fee.create({
    data: {
      type: "Vending",
      rate: 1.4,
    },
  });

  console.log("default data seeded successfully.");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
