import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { getCurrentUser } from "@/lib/auth";

/* ──────────────────────────────────────────────────────────
   WAREHOUSE DASHBOARD METRICS
   Aggregates real inventory/order data so the warehouse
   page (admin-facing) renders live numbers instead of
   hanging on a missing endpoint.
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

    const [
      lowStockVariants,
      pendingShipments,
      totalStock,
      pendingOrders,
    ] = await Promise.all([
      prisma.productVariant.findMany({
        where: { stockCount: { lte: 5 } },
        take: 20,
        include: {
          product: { select: { name: true, sku: true } },
        },
      }),
      prisma.order.count({
        where: {
          status: { in: ["CONFIRMED", "PROCESSING", "SHIPPED"] },
        },
      }),
      prisma.productVariant.aggregate({ _sum: { stockCount: true } }),
      prisma.order.findMany({
        where: {
          status: { in: ["CONFIRMED", "PROCESSING"] },
        },
        take: 10,
        orderBy: { createdAt: "asc" },
        select: {
          orderNumber: true,
          status: true,
          paymentStatus: true,
          createdAt: true,
        },
      }),
    ]);

    return NextResponse.json({
      totalItems: totalStock._sum.stockCount ?? 0,
      lowStockItems: lowStockVariants.length,
      pendingShipments,
      completedShipments: 0,
      stockAlerts: lowStockVariants.map((v) => ({
        productName: v.product.name,
        sku: v.product.sku,
        variant: `${v.size}${v.color ? ` / ${v.color}` : ""}`,
        stockCount: v.stockCount,
      })),
      pendingOrders,
    });
  } catch (err) {
    console.error("Warehouse metrics error:", err);
    return NextResponse.json(
      { error: "Failed to load warehouse metrics" },
      { status: 500 },
    );
  }
}
