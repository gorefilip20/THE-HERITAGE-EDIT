import { NextRequest, NextResponse } from "next/server";
import { getCartFromRedis, setCartInRedis, deleteCartFromRedis } from "@/lib/redis";
import { addToCartSchema } from "@/lib/validators";
import { prisma } from "@/lib/db";

function getCartId(request: NextRequest): string | null {
  return request.cookies.get("heritage-cart-id")?.value ?? null;
}

function generateCartId(): string {
  return `cart_${Date.now().toString(36)}_${Math.random().toString(36).slice(2, 8)}`;
}

export async function GET(request: NextRequest) {
  try {
    const cartId = getCartId(request);
    if (!cartId) {
      return NextResponse.json({ items: [], subtotalCents: 0, itemCount: 0 });
    }

    const raw = await getCartFromRedis(cartId);
    if (!raw) {
      return NextResponse.json({ items: [], subtotalCents: 0, itemCount: 0 });
    }

    const cart = JSON.parse(raw);
    return NextResponse.json(cart);
  } catch {
    return NextResponse.json({ items: [], subtotalCents: 0, itemCount: 0 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const parsed = addToCartSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { error: "Validation failed", issues: parsed.error.issues },
        { status: 400 },
      );
    }

    const { productId, variantId, quantity } = parsed.data;

    const product = await prisma.product.findUnique({
      where: { id: productId },
      include: {
        brand: true,
        images: { where: { isPrimary: true }, take: 1 },
        variants: { where: { id: variantId } },
      },
    });

    if (!product || product.status !== "PUBLISHED") {
      return NextResponse.json(
        { error: "Product not found or unavailable" },
        { status: 404 },
      );
    }

    const variant = product.variants[0];
    if (!variant) {
      return NextResponse.json(
        { error: "Variant not found" },
        { status: 404 },
      );
    }

    if (variant.stockCount < quantity) {
      return NextResponse.json(
        { error: `Only ${variant.stockCount} items available` },
        { status: 400 },
      );
    }

    let cartId = getCartId(request);
    let cart: {
      items: Array<{
        productId: string;
        variantId: string;
        name: string;
        brand: string;
        size: string;
        color: string | null;
        imageUrl: string;
        priceCents: number;
        quantity: number;
        slug: string;
      }>;
    } = { items: [] };

    if (cartId) {
      const raw = await getCartFromRedis(cartId);
      if (raw) cart = JSON.parse(raw);
    } else {
      cartId = generateCartId();
    }

    const priceCents =
      (product.salePriceCents ?? product.basePriceCents) + variant.priceDeltaCents;

    const existingIdx = cart.items.findIndex(
      (i) => i.productId === productId && i.variantId === variantId,
    );

    if (existingIdx >= 0) {
      const newQty = Math.min(10, cart.items[existingIdx].quantity + quantity);
      if (newQty > variant.stockCount) {
        return NextResponse.json(
          { error: `Only ${variant.stockCount} items available` },
          { status: 400 },
        );
      }
      cart.items[existingIdx].quantity = newQty;
    } else {
      cart.items.push({
        productId,
        variantId,
        name: product.name,
        brand: product.brand.name,
        size: variant.size,
        color: variant.color,
        imageUrl: product.images[0]?.url ?? "",
        priceCents,
        quantity,
        slug: product.slug,
      });
    }

    await setCartInRedis(cartId, JSON.stringify(cart));

    const subtotalCents = cart.items.reduce(
      (sum, i) => sum + i.priceCents * i.quantity,
      0,
    );
    const itemCount = cart.items.reduce((sum, i) => sum + i.quantity, 0);

    const response = NextResponse.json({
      items: cart.items,
      subtotalCents,
      itemCount,
    });

    response.cookies.set("heritage-cart-id", cartId, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: 60 * 60 * 24 * 7,
      path: "/",
    });

    return response;
  } catch (err) {
    console.error("Cart add error:", err);
    return NextResponse.json({ error: "Failed to add item" }, { status: 500 });
  }
}

export async function PATCH(request: NextRequest) {
  try {
    const cartId = getCartId(request);
    if (!cartId) {
      return NextResponse.json({ error: "Cart not found" }, { status: 404 });
    }

    const raw = await getCartFromRedis(cartId);
    if (!raw) {
      return NextResponse.json({ error: "Cart not found" }, { status: 404 });
    }

    const cart = JSON.parse(raw);
    const body = await request.json();
    const { variantId, quantity } = body;

    if (!variantId || typeof quantity !== "number") {
      return NextResponse.json(
        { error: "variantId and quantity are required" },
        { status: 400 },
      );
    }

    if (quantity <= 0) {
      cart.items = cart.items.filter(
        (i: { variantId: string }) => i.variantId !== variantId,
      );
    } else {
      const item = cart.items.find(
        (i: { variantId: string }) => i.variantId === variantId,
      );
      if (item) {
        item.quantity = Math.min(10, quantity);
      }
    }

    await setCartInRedis(cartId, JSON.stringify(cart));

    const subtotalCents = cart.items.reduce(
      (sum: number, i: { priceCents: number; quantity: number }) =>
        sum + i.priceCents * i.quantity,
      0,
    );
    const itemCount = cart.items.reduce(
      (sum: number, i: { quantity: number }) => sum + i.quantity,
      0,
    );

    return NextResponse.json({
      items: cart.items,
      subtotalCents,
      itemCount,
    });
  } catch {
    return NextResponse.json(
      { error: "Failed to update cart" },
      { status: 500 },
    );
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const cartId = getCartId(request);
    if (cartId) {
      await deleteCartFromRedis(cartId);
    }

    const response = NextResponse.json({ success: true });
    response.cookies.set("heritage-cart-id", "", {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: 0,
      path: "/",
    });

    return response;
  } catch {
    return NextResponse.json(
      { error: "Failed to clear cart" },
      { status: 500 },
    );
  }
}
