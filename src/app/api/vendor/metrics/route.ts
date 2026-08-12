import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { getCurrentUser } from "@/lib/auth";

/* ──────────────────────────────────────────────────────────
   VENDOR DASHBOARD METRICS
   Aggregates real order/brand data so the vendor page
   (admin-facing) renders live numbers instead of hanging.
   ────────────────────────────────────────────────────────── */
export async function GET(_request: NextRequest) {
  try {
    const user = await getCurrentUser();
    const isAdmin =
      user?.role === "ADMIN" || user?.role === "SUPER_ADMIN";
    if (!isAdmin) {
      return NextResponse.json(
        { error: "Admin access required" },
        { status: 403 },
      );
    }

    const [totalOrders, totalRevenue, activeProducts, recentOrders] =
      await Promise.all([
        prisma.order.count(),
        prisma.order.aggregate({
          _sum: { totalCents: true },
          where: { paymentStatus: "CAPTURED" },
        }),
        prisma.product.count({ where: { status: "PUBLISHED" } }),
        prisma.order.findMany({
          take: 10,
          orderBy: { createdAt: "desc" },
          select: {
            orderNumber: true,
            status: true,
            paymentStatus: true,
            totalCents: true,
            createdAt: true,
          },
        }),
      ]);

    const topProducts = await prisma.orderItem.groupBy({
      by: ["productId"],
      _sum: { quantity: true },
      orderBy: { _sum: { quantity: "desc" } },
      take: 5,
    });

    return NextResponse.json({
      totalRevenue: totalRevenue._sum.totalCents ?? 0,
      totalOrders,
      activeProducts,
      conversionRate: 0,
      recentOrders,
      topProducts,
    });
  } catch (err) {
    console.error("Vendor metrics error:", err);
    return NextResponse.json(
      { error: "Failed to load vendor metrics" },
      { status: 500 },
    );
  }
}
