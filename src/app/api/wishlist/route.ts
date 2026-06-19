import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { getCurrentUser } from "@/lib/auth";

export async function GET() {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json(
        { error: "Authentication required" },
        { status: 401 },
      );
    }

    const items = await prisma.wishlistItem.findMany({
      where: { userId: user.id },
      orderBy: { createdAt: "desc" },
      include: {
        product: {
          include: {
            brand: true,
            images: { where: { isPrimary: true }, take: 1 },
            variants: { orderBy: { size: "asc" } },
          },
        },
      },
    });

    return NextResponse.json({
      data: items.map((item) => ({
        id: item.id,
        productId: item.productId,
        addedAt: item.createdAt,
        product: item.product,
      })),
      total: items.length,
    });
  } catch (err) {
    console.error("Wishlist fetch error:", err);
    return NextResponse.json(
      { error: "Failed to fetch wishlist" },
      { status: 500 },
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json(
        { error: "Authentication required" },
        { status: 401 },
      );
    }

    const body = await request.json();
    const { productId } = body;

    if (!productId || typeof productId !== "string") {
      return NextResponse.json(
        { error: "productId is required" },
        { status: 400 },
      );
    }

    const product = await prisma.product.findUnique({
      where: { id: productId },
      select: { id: true, status: true },
    });

    if (!product || product.status !== "PUBLISHED") {
      return NextResponse.json(
        { error: "Product not found" },
        { status: 404 },
      );
    }

    const existing = await prisma.wishlistItem.findUnique({
      where: {
        userId_productId: { userId: user.id, productId },
      },
    });

    if (existing) {
      return NextResponse.json({ id: existing.id, alreadyExists: true });
    }

    const item = await prisma.wishlistItem.create({
      data: {
        userId: user.id,
        productId,
      },
    });

    return NextResponse.json({ id: item.id }, { status: 201 });
  } catch (err) {
    console.error("Wishlist add error:", err);
    return NextResponse.json(
      { error: "Failed to add to wishlist" },
      { status: 500 },
    );
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json(
        { error: "Authentication required" },
        { status: 401 },
      );
    }

    const { searchParams } = request.nextUrl;
    const productId = searchParams.get("productId");

    if (!productId) {
      return NextResponse.json(
        { error: "productId query param is required" },
        { status: 400 },
      );
    }

    await prisma.wishlistItem.deleteMany({
      where: {
        userId: user.id,
        productId,
      },
    });

    return NextResponse.json({ success: true });
  } catch (err) {
    console.error("Wishlist remove error:", err);
    return NextResponse.json(
      { error: "Failed to remove from wishlist" },
      { status: 500 },
    );
  }
}
