import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";

export async function GET() {
  try {
    const now = new Date();
    const thirtyDaysAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
    const sevenDaysAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);

    const [
      totalCustomers,
      newCustomersThisWeek,
      newCustomersThisMonth,
      ordersByStatus,
      recentSignups,
      lowStockProducts,
      revenueByDay,
      failedPayments,
      totalPageViews,
      uniqueVisitors,
    ] = await Promise.all([
      prisma.user.count({ where: { role: "CUSTOMER" } }),
      prisma.user.count({ where: { role: "CUSTOMER", createdAt: { gte: sevenDaysAgo } } }),
      prisma.user.count({ where: { role: "CUSTOMER", createdAt: { gte: thirtyDaysAgo } } }),
      prisma.order.groupBy({
        by: ["status"],
        _count: true,
      }),
      prisma.user.findMany({
        where: { role: "CUSTOMER" },
        orderBy: { createdAt: "desc" },
        take: 10,
        select: { id: true, firstName: true, lastName: true, email: true, createdAt: true },
      }),
      prisma.productVariant.findMany({
        where: { stockCount: { lte: 5 } },
        include: {
          product: { select: { id: true, name: true, brand: { select: { name: true } } } },
        },
        orderBy: { stockCount: "asc" },
        take: 20,
      }),
      prisma.$queryRaw`
        SELECT DATE(created_at) as date,
               SUM(total_cents) as revenue,
               COUNT(*)::int as order_count
        FROM orders
        WHERE status != 'CANCELLED'
          AND created_at >= ${sevenDaysAgo}
        GROUP BY DATE(created_at)
        ORDER BY date ASC
      ` as Promise<Array<{ date: Date; revenue: bigint; order_count: number }>>,
      prisma.order.count({
        where: { paymentStatus: "FAILED", createdAt: { gte: thirtyDaysAgo } },
      }),
      prisma.pageView.count({ where: { createdAt: { gte: thirtyDaysAgo } } }).catch(() => 0),
      prisma.pageView.groupBy({
        by: ["sessionId"],
        where: { createdAt: { gte: thirtyDaysAgo } },
      }).then((r) => r.length).catch(() => 0),
    ]);

    const statusMap = Object.fromEntries(
      ordersByStatus.map((s) => [s.status, s._count])
    );

    return NextResponse.json({
      totalCustomers,
      newCustomersThisWeek,
      newCustomersThisMonth,
      ordersByStatus: statusMap,
      recentSignups,
      lowStockProducts: lowStockProducts.map((v) => ({
        id: v.id,
        productId: v.product.id,
        productName: v.product.name,
        brandName: v.product.brand.name,
        size: v.size,
        color: v.color,
        stockCount: v.stockCount,
      })),
      revenueByDay: (revenueByDay as Array<{ date: Date; revenue: bigint; order_count: number }>).map((r) => ({
        date: r.date,
        revenue: Number(r.revenue),
        orderCount: r.order_count,
      })),
      failedPayments,
      totalPageViews,
      uniqueVisitors,
    });
  } catch (err) {
    console.error("Dashboard API error:", err);
    return NextResponse.json({ error: "Failed to fetch dashboard data" }, { status: 500 });
  }
}
