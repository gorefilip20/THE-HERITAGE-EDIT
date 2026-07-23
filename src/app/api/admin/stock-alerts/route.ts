import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";

export async function GET() {
  try {
    const outOfStock = await prisma.productVariant.findMany({
      where: { stockCount: 0 },
      include: {
        product: {
          select: {
            id: true,
            name: true,
            sku: true,
            brand: { select: { name: true } },
            images: { where: { isPrimary: true }, take: 1, select: { url: true } },
          },
        },
      },
      orderBy: { product: { name: "asc" } },
    });

    const lowStock = await prisma.productVariant.findMany({
      where: { stockCount: { gt: 0, lte: 5 } },
      include: {
        product: {
          select: {
            id: true,
            name: true,
            sku: true,
            brand: { select: { name: true } },
          },
        },
      },
      orderBy: { stockCount: "asc" },
      take: 20,
    });

    const notificationCounts = await prisma.stockNotification.groupBy({
      by: ["productId"],
      where: { notifiedAt: null },
      _count: true,
    });

    return NextResponse.json({
      outOfStock: outOfStock.map((v) => ({
        variantId: v.id,
        productId: v.product.id,
        productName: v.product.name,
        sku: v.product.sku,
        brandName: v.product.brand.name,
        size: v.size,
        color: v.color,
        imageUrl: v.product.images[0]?.url,
        waitingCustomers: notificationCounts.find((n) => n.productId === v.product.id)?._count || 0,
      })),
      lowStock: lowStock.map((v) => ({
        variantId: v.id,
        productId: v.product.id,
        productName: v.product.name,
        brandName: v.product.brand.name,
        size: v.size,
        stockCount: v.stockCount,
      })),
      totalOutOfStock: outOfStock.length,
      totalLowStock: lowStock.length,
    });
  } catch (err) {
    console.error("Stock alerts error:", err);
    return NextResponse.json({ error: "Failed to fetch stock alerts" }, { status: 500 });
  }
}
