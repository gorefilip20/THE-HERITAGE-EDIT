import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { getCurrentUser } from "@/lib/auth";

export async function GET(request: NextRequest) {
  try {
    const user = await getCurrentUser();
    if (!user || (user.role !== "ADMIN" && user.role !== "SUPER_ADMIN")) {
      return NextResponse.json({ error: "Admin access required" }, { status: 403 });
    }

    const { searchParams } = request.nextUrl;
    const page = Math.max(1, parseInt(searchParams.get("page") ?? "1"));
    const pageSize = Math.min(100, Math.max(1, parseInt(searchParams.get("pageSize") ?? "20")));
    const search = searchParams.get("search");

    const where: Record<string, unknown> = {};

    if (search) {
      const sanitized = search.trim().slice(0, 200);
      if (sanitized.length > 0) {
        where.OR = [
          { email: { contains: sanitized, mode: "insensitive" } },
          { firstName: { contains: sanitized, mode: "insensitive" } },
          { lastName: { contains: sanitized, mode: "insensitive" } },
        ];
      }
    }

    const [customers, total] = await Promise.all([
      prisma.user.findMany({
        where,
        orderBy: { createdAt: "desc" },
        skip: (page - 1) * pageSize,
        take: pageSize,
        select: {
          id: true,
          email: true,
          firstName: true,
          lastName: true,
          role: true,
          phone: true,
          createdAt: true,
          _count: { select: { orders: true } },
          orders: {
            where: { paymentStatus: "CAPTURED" },
            select: { totalCents: true },
          },
        },
      }),
      prisma.user.count({ where }),
    ]);

    const data = customers.map((c) => ({
      id: c.id,
      email: c.email,
      firstName: c.firstName,
      lastName: c.lastName,
      role: c.role,
      phone: c.phone,
      createdAt: c.createdAt,
      _count: c._count,
      totalSpent: c.orders.reduce((sum, o) => sum + o.totalCents, 0),
    }));

    return NextResponse.json({
      data,
      total,
      page,
      pageSize,
      totalPages: Math.ceil(total / pageSize),
    });
  } catch (err) {
    console.error("Admin customers error:", err);
    return NextResponse.json({ error: "Failed to fetch customers" }, { status: 500 });
  }
}
