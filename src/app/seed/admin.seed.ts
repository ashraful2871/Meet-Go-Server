import { UserRole } from "@prisma/client";
import { prisma } from "../shared/prisma";
import bcrypt from "bcryptjs";

export const seedAdmin = async () => {
  try {
    // Check if an admin user already exists
    const existingAdmin = await prisma.user.findFirst({
      where: { role: UserRole.ADMIN },
    });

    if (existingAdmin) {
      console.log("🟡 Admin already exists.");
      return;
    }

    console.log("🔵 Creating default Admin...");

    // Hash admin password
    const hashedPassword = await bcrypt.hash("admin123", 10);

    // Create the admin user
    const adminUser = await prisma.user.create({
      data: {
        email: "admin@system.com",
        password: hashedPassword,
        name: "Ashraful Islam (Admin)",
        role: UserRole.ADMIN,
        status: "ACTIVE",
        IsVerified: true,
      },
    });

    // Create Admin profile linked with user
    const adminCreateResult = await prisma.admin.create({
      data: {
        email: adminUser.email,
        name: "Ashraful Islam (Admin)",
      },
    });
    console.log(adminCreateResult);
    console.log("✅ Default admin created successfully!");
  } catch (error) {
    console.error("❌ Admin seeding error:", error);
  } finally {
    await prisma.$disconnect();
  }
};
