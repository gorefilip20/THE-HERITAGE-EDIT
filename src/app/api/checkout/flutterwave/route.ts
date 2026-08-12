import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { generateOrderNumber } from "@/lib/utils";
import { getShippingOptions, calculateTaxAndDuty } from "@/lib/shipping";

/* ──────────────────────────────────────────────────────────
   FLUTTERWAVE CHECKOUT INITIALIZATION
   Creates a PENDING order in the database (mirroring the
   Paystack flow) and returns the payment link. The webhook
   at /api/webhooks/flutterwave marks the order paid.
   ────────────────────────────────────────────────────────── */
export async function POST(request: NextRequest) {
  try {
    const { email, items, shippingAddress, currency } =
      await request.json();

    const flutterwaveKey = process.env.FLUTTERWAVE_SECRET_KEY;
    if (!flutterwaveKey) {
      return NextResponse.json(
        { error: "Flutterwave not configured" },
        { status: 500 },
      );
    }

    if (!email || !items?.length) {
      return NextResponse.json(
        { error: "Email and cart items are required" },
        { status: 400 },
      );
    }

    /* ── Recompute pricing server-side (never trust the client) ── */
    const productIds: string[] = Array.from(
      new Set(
        items.map(
          (i: { productId: string; variantId?: string; quantity: number }) =>
            i.productId,
        ),
      ),
    );
    const products = await prisma.product.findMany({
      where: { id: { in: productIds }, status: "PUBLISHED" },
      include: { variants: true },
    });
    const productMap = new Map(products.map((p) => [p.id, p]));
    const orderItems: Array<{
      productId: string;
      variantId: string;
      quantity: number;
      unitPriceCents: number;
      totalCents: number;
    }> = [];
    let subtotalCents = 0;
    for (const item of items as Array<{
      productId: string;
      variantId?: string;
      quantity: number;
    }>) {
      const product = productMap.get(item.productId);
      if (!product) {
        return NextResponse.json(
          { error: `Product not found or unavailable: ${item.productId}` },
          { status: 400 },
        );
      }
      const variant = product.variants.find((v) => v.id === item.variantId);
      if (!variant) {
        return NextResponse.json(
          { error: `Variant not found: ${item.variantId} for ${product.name}` },
          { status: 400 },
        );
      }
      if (variant.stockCount < item.quantity) {
        return NextResponse.json(
          {
            error: `Insufficient stock for ${product.name} (${variant.size}). Available: ${variant.stockCount}`,
          },
          { status: 400 },
        );
      }
      const unitPrice =
        (product.salePriceCents ?? product.basePriceCents) +
        variant.priceDeltaCents;
      const itemTotal = unitPrice * item.quantity;
      subtotalCents += itemTotal;
      orderItems.push({
        productId: product.id,
        variantId: variant.id,
        quantity: item.quantity,
        unitPriceCents: unitPrice,
        totalCents: itemTotal,
      });
    }

    /* ── Shipping + tax/duty (same static calculator as Paystack) ── */
    const shippingOptions = getShippingOptions(
      shippingAddress?.country ?? "NG",
      subtotalCents,
    );
    const taxDuty = shippingAddress
      ? calculateTaxAndDuty(
          subtotalCents,
          shippingAddress.country ?? "NG",
          shippingAddress.state,
        )
      : null;
    const shippingCents = shippingOptions[0]?.priceCents ?? 0;
    const taxCents = taxDuty?.taxCents ?? 0;
    const dutyCents = taxDuty?.dutyCents ?? 0;
    const totalCents = subtotalCents + shippingCents + taxCents + dutyCents;

    const orderNumber = generateOrderNumber();

    const order = await prisma.order.create({
      data: {
        orderNumber,
        userId: null,
        guestEmail: email,
        status: "PENDING",
        paymentStatus: "PENDING",
        subtotalCents,
        shippingCents,
        taxCents,
        dutyCents,
        discountCents: 0,
        totalCents,
        items: {
          create: orderItems,
        },
        ...(shippingAddress
          ? {
              shippingAddress: {
                create: {
                  firstName: shippingAddress.firstName,
                  lastName: shippingAddress.lastName,
                  line1: shippingAddress.line1,
                  line2: shippingAddress.line2 ?? null,
                  city: shippingAddress.city,
                  state: shippingAddress.state ?? null,
                  postalCode: shippingAddress.postalCode,
                  country: shippingAddress.country ?? "NG",
                  phone: shippingAddress.phone ?? null,
                },
              },
            }
          : {}),
      },
    } as Parameters<typeof prisma.order.create>[0]);

    /* ── Initialise the Flutterwave payment link ── */
    const response = await fetch("https://api.flutterwave.com/v3/payments", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${flutterwaveKey}`,
      },
      body: JSON.stringify({
        tx_ref: `the_${order.id}`,
        amount: Math.round(totalCents / 100),
        currency: currency ?? "NGN",
        redirect_url: `${process.env.NEXT_PUBLIC_APP_URL}/success?provider=flutterwave&order=${orderNumber}`,
        customer: { email },
        customizations: {
          title: "The Heritage Edit",
          description: "Premium African Fashion",
        },
        meta: { orderId: order.id, orderNumber: order.orderNumber },
      }),
    });

    const data = await response.json();

    if (data.status === "success" && data.data?.link) {
      return NextResponse.json({
        success: true,
        orderNumber: order.orderNumber,
        authorizationUrl: data.data.link,
      });
    }

    return NextResponse.json(
      { error: "Failed to initialize payment" },
      { status: 400 },
    );
  } catch (err) {
    console.error("Flutterwave checkout error:", err);
    return NextResponse.json(
      { error: "Payment initialization failed" },
      { status: 500 },
    );
  }
}
