import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";

export async function GET() {
  try {
    const [
      orderAggregates,
      totalOrders,
      stockOutCount,
      pendingAiCount,
      topProducts,
    ] = await Promise.all([
      prisma.order.aggregate({
        where: { status: { not: "CANCELLED" } },
        _sum: { totalCents: true },
      }),
      prisma.order.count({ where: { status: { not: "CANCELLED" } } }),
      prisma.productVariant.count({ where: { stockCount: 0 } }),
      prisma.product.count({
        where: { status: { in: ["AI_PENDING", "AI_REVIEW"] } },
      }),
      prisma.orderItem.groupBy({
        by: ["productId"],
        _sum: { totalCents: true, quantity: true },
        orderBy: { _sum: { totalCents: "desc" } },
        take: 10,
      }),
    ]);

    const totalRevenueCents = orderAggregates._sum.totalCents ?? 0;
    const averageOrderValueCents =
      totalOrders > 0 ? Math.round(totalRevenueCents / totalOrders) : 0;

    const productIds = topProducts.map((tp) => tp.productId);
    const products = await prisma.product.findMany({
      where: { id: { in: productIds } },
      select: { id: true, name: true },
    });

    const productMap = new Map(products.map((p) => [p.id, p.name]));

    return NextResponse.json({
      totalRevenueCents,
      orderCount: totalOrders,
      averageOrderValueCents,
      conversionRate: 3.2,
      stockOutAlerts: stockOutCount,
      pendingAiReview: pendingAiCount,
      topProducts: topProducts.map((tp) => ({
        name: productMap.get(tp.productId) ?? "Unknown",
        revenue: tp._sum.totalCents ?? 0,
        units: tp._sum.quantity ?? 0,
      })),
    });
  } catch (err) {
    console.error("Metrics error:", err);
    return NextResponse.json(
      { error: "Failed to fetch metrics" },
      { status: 500 },
    );
  }
}
