import { NextRequest, NextResponse } from "next/server";
import { UserRole } from "@prisma/client";
import { prisma } from "@/lib/db";
import { hashPassword } from "@/lib/auth";

export async function POST(request: NextRequest) {
  const setupToken = process.env.ADMIN_SETUP_TOKEN;
  const email = process.env.ADMIN_SETUP_EMAIL?.trim().toLowerCase();
  const password = process.env.ADMIN_SETUP_PASSWORD;
  const providedToken = request.headers.get("x-admin-setup-token");

  if (!setupToken || !email || !password || providedToken !== setupToken) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  if (password.length < 8) {
    return NextResponse.json(
      { error: "ADMIN_SETUP_PASSWORD must be at least 8 characters" },
      { status: 400 },
    );
  }

  try {
    const existing = await prisma.user.findUnique({ where: { email } });
    if (existing?.role === UserRole.SUPER_ADMIN) {
      return NextResponse.json(
        { error: "A SUPER_ADMIN already exists for this email. Remove setup variables." },
        { status: 409 },
      );
    }

    const passwordHash = await hashPassword(password);
    const user = existing
      ? await prisma.user.update({
          where: { id: existing.id },
          data: { passwordHash, role: UserRole.SUPER_ADMIN },
          select: { email: true, role: true },
        })
      : await prisma.user.create({
          data: {
            email,
            passwordHash,
            firstName: "Heritage",
            lastName: "Admin",
            role: UserRole.SUPER_ADMIN,
          },
          select: { email: true, role: true },
        });

    return NextResponse.json({
      success: true,
      email: user.email,
      role: user.role,
      message: "Admin account provisioned. Remove ADMIN_SETUP_* variables now.",
    });
  } catch (error) {
    console.error("Admin setup error:", error);
    return NextResponse.json({ error: "Admin setup failed" }, { status: 500 });
  }
}
