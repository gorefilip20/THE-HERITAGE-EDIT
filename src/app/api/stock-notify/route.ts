import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";

export async function POST(request: NextRequest) {
  try {
    const { email, productId, variantId } = await request.json();

    if (!email || !productId) {
      return NextResponse.json({ error: "email and productId are required" }, { status: 400 });
    }

    const product = await prisma.product.findUnique({
      where: { id: productId },
      select: { id: true, name: true },
    });

    if (!product) {
      return NextResponse.json({ error: "Product not found" }, { status: 404 });
    }

    await prisma.stockNotification.upsert({
      where: {
        email_productId_variantId: {
          email,
          productId,
          variantId: variantId || null,
        },
      },
      create: { email, productId, variantId: variantId || null },
      update: { notifiedAt: null },
    });

    return NextResponse.json({ message: "You will be notified when this item is back in stock." });
  } catch (err) {
    console.error("Stock notify error:", err);
    return NextResponse.json({ error: "Failed to register notification" }, { status: 500 });
  }
}
