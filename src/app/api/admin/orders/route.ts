import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = request.nextUrl;

    const page = Math.max(1, parseInt(searchParams.get("page") ?? "1"));
    const pageSize = Math.min(50, Math.max(1, parseInt(searchParams.get("pageSize") ?? "20")));
    const status = searchParams.get("status");
    const paymentStatus = searchParams.get("paymentStatus");
    const search = searchParams.get("search");
    const dateFrom = searchParams.get("dateFrom");
    const dateTo = searchParams.get("dateTo");

    const where: Record<string, unknown> = {};

    if (status) {
      where.status = status;
    }
    if (paymentStatus) {
      where.paymentStatus = paymentStatus;
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
    if (dateFrom || dateTo) {
      where.createdAt = {};
      if (dateFrom)
        (where.createdAt as Record<string, Date>).gte = new Date(dateFrom);
      if (dateTo)
        (where.createdAt as Record<string, Date>).lte = new Date(dateTo);
    }

    const [orders, total, statusAgg, revenueAgg] = await Promise.all([
      prisma.order.findMany({
        where,
        orderBy: { createdAt: "desc" },
        skip: (page - 1) * pageSize,
        take: pageSize,
        include: {
          items: {
            include: {
              product: {
                select: { name: true, brand: { select: { name: true } } },
              },
              variant: { select: { size: true } },
            },
          },
          shippingAddress: true,
        },
      }),
      prisma.order.count({ where }),
      prisma.order.groupBy({
        by: ["status"],
        _count: { id: true },
      }),
      prisma.order.aggregate({
        where: { paymentStatus: "CAPTURED" },
        _sum: { totalCents: true },
        _count: { id: true },
      }),
    ]);

    const statusCounts: Record<string, number> = {};
    for (const s of statusAgg) {
      statusCounts[s.status] = s._count.id;
    }

    return NextResponse.json({
      data: orders,
      total,
      page,
      pageSize,
      totalPages: Math.ceil(total / pageSize),
      statusCounts,
      summary: {
        capturedRevenueCents: revenueAgg._sum.totalCents ?? 0,
        capturedOrderCount: revenueAgg._count.id,
      },
    });
  } catch (err) {
    console.error("Admin orders listing error:", err);
    return NextResponse.json(
      { error: "Failed to fetch orders" },
      { status: 500 },
    );
  }
}
