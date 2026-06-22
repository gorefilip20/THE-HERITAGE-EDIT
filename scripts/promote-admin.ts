import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

const TARGET_EMAIL = "evarestuschinecherem@gmail.com";

async function main() {
  const user = await prisma.user.findUnique({
    where: { email: TARGET_EMAIL },
    select: { id: true, email: true, firstName: true, lastName: true, role: true },
  });

  if (!user) {
    console.error(`\n  ✗ No account found for ${TARGET_EMAIL}`);
    console.error("    Register at /auth/login first, then re-run this script.\n");
    process.exit(1);
  }

  if (user.role === "SUPER_ADMIN" || user.role === "ADMIN") {
    console.log(`\n  ✓ ${user.firstName} ${user.lastName} is already ${user.role} — no changes needed.\n`);
    return;
  }

  const updated = await prisma.user.update({
    where: { id: user.id },
    data: { role: "SUPER_ADMIN" },
    select: { email: true, firstName: true, lastName: true, role: true },
  });

  console.log(`\n  ✓ Promoted to ${updated.role}`);
  console.log(`    ${updated.firstName} ${updated.lastName} (${updated.email})`);
  console.log("    You can now log in at /auth/login?redirect=/admin\n");
}

main()
  .catch((err) => {
    console.error("Script failed:", err);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
