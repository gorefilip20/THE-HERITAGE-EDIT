import { PrismaClient, UserRole } from "@prisma/client";
import { hashPassword } from "../src/lib/auth";

const prisma = new PrismaClient();

async function main() {
  const email = process.env.ADMIN_EMAIL?.trim().toLowerCase();
  const password = process.env.ADMIN_PASSWORD;

  if (!email || !password) {
    throw new Error(
      "Set ADMIN_EMAIL and ADMIN_PASSWORD for this one-time provisioning command.",
    );
  }
  if (password.length < 8) {
    throw new Error("ADMIN_PASSWORD must be at least 8 characters long.");
  }

  const existing = await prisma.user.findUnique({ where: { email } });
  const passwordHash = await hashPassword(password);

  const user = existing
    ? await prisma.user.update({
        where: { id: existing.id },
        data: { passwordHash, role: UserRole.SUPER_ADMIN },
        select: { email: true, firstName: true, lastName: true, role: true },
      })
    : await prisma.user.create({
        data: {
          email,
          passwordHash,
          firstName: "Heritage",
          lastName: "Admin",
          role: UserRole.SUPER_ADMIN,
        },
        select: { email: true, firstName: true, lastName: true, role: true },
      });

  console.log(`Admin account ready: ${user.email} (${user.role})`);
  console.log("Sign in at /auth/login?redirect=/admin");
}

main()
  .catch((error) => {
    console.error("Admin provisioning failed:", error instanceof Error ? error.message : error);
    process.exitCode = 1;
  })
  .finally(() => prisma.$disconnect());
