import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { getCurrentUser } from "@/lib/auth";

/* ──────────────────────────────────────────────────────────
   PUBLIC ORDER LOOKUP — used by the post-payment success
   page so a guest buyer can see their order confirmation
   without logging in. Matches by orderNumber AND the
   guestEmail used at checkout (un-guessable pair).
   ────────────────────────────────────────────────────────── */
export async function GET(request: NextRequest) {
  try {
    const orderNumber = request.nextUrl.searchParams.get("orderNumber");
    const email = request.nextUrl.searchParams.get("email");

    if (!orderNumber) {
      return NextResponse.json(
        { error: "orderNumber is required" },
        { status: 400 },
      );
    }

    /* Logged-in users and admins may look up any of their orders by
       orderNumber alone (email is only required for anonymous guests). */
    const user = await getCurrentUser().catch(() => null);
    const isAdmin =
      user?.role === "ADMIN" || user?.role === "SUPER_ADMIN";

    const order = await prisma.order.findFirst({
      where: { orderNumber },
      include: {
        items: {
          include: {
            product: {
              select: {
                id: true,
                name: true,
                slug: true,
                sku: true,
                images: { orderBy: { sortOrder: "asc" }, take: 1 },
              },
            },
            variant: { select: { size: true, color: true } },
          },
        },
      },
    });

    if (!order) {
      return NextResponse.json({ error: "Order not found" }, { status: 404 });
    }

    // Guest orders require the checkout email to match (prevents enumeration).
    // A logged-in user is also granted access when their account email matches
    // the checkout email used on the guest order (same person, different flows).
    const isOwner = user ? order.userId === user.id : false;
    const accountEmailMatch =
      user &&
      order.guestEmail?.toLowerCase() === user.email.toLowerCase();
    if (!isAdmin && !isOwner && !accountEmailMatch && !order.userId && order.guestEmail?.toLowerCase() !== email?.toLowerCase()) {
      return NextResponse.json({ error: "Email does not match this order" }, { status: 403 });
    }

    return NextResponse.json({
      order: {
        id: order.id,
        orderNumber: order.orderNumber,
        status: order.status,
        paymentStatus: order.paymentStatus,
        totalCents: order.totalCents,
        currency: order.currency,
        createdAt: order.createdAt,
        guestEmail: order.guestEmail,
        items: order.items.map((item) => ({
          productName: item.product.name,
          productSlug: item.product.slug,
          sku: item.product.sku,
          size: item.variant?.size ?? null,
          color: item.variant?.color ?? null,
          quantity: item.quantity,
          unitPriceCents: item.unitPriceCents,
          image: item.product.images[0]?.url ?? null,
        })),
      },
    });
  } catch (err) {
    console.error("Order lookup error:", err);
    return NextResponse.json(
      { error: "Failed to fetch order" },
      { status: 500 },
    );
  }
}
