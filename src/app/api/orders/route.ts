import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { getCurrentUser } from "@/lib/auth";

export async function GET(request: NextRequest) {
  try {
    const user = await getCurrentUser();
    const { searchParams } = request.nextUrl;

    const page = Math.max(1, parseInt(searchParams.get("page") ?? "1"));
    const pageSize = Math.min(50, Math.max(1, parseInt(searchParams.get("pageSize") ?? "20")));
    const status = searchParams.get("status");
    const search = searchParams.get("search");

    const isAdmin =
      user?.role === "ADMIN" || user?.role === "SUPER_ADMIN";

    const where: Record<string, unknown> = {};

    if (!isAdmin) {
      if (!user) {
        return NextResponse.json(
          { error: "Authentication required" },
          { status: 401 },
        );
      }
      where.userId = user.id;
    }

    if (status) {
      where.status = status;
    }

    if (search) {
      const sanitized = search.trim().slice(0, 100);
      if (sanitized.length > 0) {
        where.OR = [
          { orderNumber: { contains: sanitized, mode: "insensitive" } },
          { guestEmail: { contains: sanitized, mode: "insensitive" } },
        ];
      }
    }

    const [orders, total] = await Promise.all([
      prisma.order.findMany({
        where,
        orderBy: { createdAt: "desc" },
        skip: (page - 1) * pageSize,
        take: pageSize,
        include: {
          items: {
            include: {
              product: {
                select: {
                  id: true,
                  name: true,
                  slug: true,
                  images: { where: { isPrimary: true }, take: 1 },
                  brand: { select: { name: true } },
                },
              },
              variant: { select: { size: true, color: true } },
            },
          },
          shippingAddress: true,
        },
      }),
      prisma.order.count({ where }),
    ]);

    return NextResponse.json({
      data: orders,
      total,
      page,
      pageSize,
      totalPages: Math.ceil(total / pageSize),
    });
  } catch (err) {
    console.error("Orders listing error:", err);
    return NextResponse.json(
      { error: "Failed to fetch orders" },
      { status: 500 },
    );
  }
}
