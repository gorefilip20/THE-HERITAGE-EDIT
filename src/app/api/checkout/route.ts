import { NextRequest, NextResponse } from "next/server";
import Stripe from "stripe";
import { prisma } from "@/lib/db";
import { generateOrderNumber } from "@/lib/utils";
import { z } from "zod";

/* ──────────────────────────────────────────────────────────
   STRIPE INITIALIZATION
   ────────────────────────────────────────────────────────── */

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY ?? "", {
  apiVersion: "2024-04-10",
});

const APP_URL = process.env.NEXT_PUBLIC_APP_URL ?? "https://heritageedit.com";

/* ──────────────────────────────────────────────────────────
   REQUEST VALIDATION
   ────────────────────────────────────────────────────────── */

const checkoutItemSchema = z.object({
  productId: z.string().min(1),
  variantId: z.string().min(1),
  quantity: z.number().int().positive().max(10),
});

const checkoutRequestSchema = z.object({
  items: z.array(checkoutItemSchema).min(1).max(50),
  email: z.string().email().optional(),
  userId: z.string().optional(),
});

type CheckoutItem = z.infer<typeof checkoutItemSchema>;

/* ──────────────────────────────────────────────────────────
   POST — CREATE STRIPE CHECKOUT SESSION
   ────────────────────────────────────────────────────────── */

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const parsed = checkoutRequestSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { error: "Invalid request", issues: parsed.error.issues },
        { status: 400 },
      );
    }

    const { items, email, userId } = parsed.data;

    /* ── Verify prices from database (never trust frontend) ── */
    const productIds = Array.from(new Set(items.map((i) => i.productId)));

    const products = await prisma.product.findMany({
      where: {
        id: { in: productIds },
        status: "PUBLISHED",
      },
      include: {
        brand: { select: { name: true } },
        variants: true,
        images: {
          where: { isPrimary: true },
          take: 1,
        },
      },
    });

    const productMap = new Map(products.map((p) => [p.id, p]));

    /* ── Build verified line items + order items ── */
    const lineItems: Stripe.Checkout.SessionCreateParams.LineItem[] = [];
    const orderItems: Array<{
      productId: string;
      variantId: string;
      quantity: number;
      unitPriceCents: number;
      totalCents: number;
    }> = [];
    let subtotalCents = 0;

    for (const item of items) {
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

      const verifiedUnitPrice =
        (product.salePriceCents ?? product.basePriceCents) +
        variant.priceDeltaCents;

      const itemTotal = verifiedUnitPrice * item.quantity;
      subtotalCents += itemTotal;

      orderItems.push({
        productId: product.id,
        variantId: variant.id,
        quantity: item.quantity,
        unitPriceCents: verifiedUnitPrice,
        totalCents: itemTotal,
      });

      const primaryImage = product.images[0]?.url;

      lineItems.push({
        price_data: {
          currency: product.currency.toLowerCase(),
          unit_amount: verifiedUnitPrice,
          product_data: {
            name: product.name,
            description: `${product.brand.name} — Size ${variant.size}${variant.color ? `, ${variant.color}` : ""}`,
            metadata: {
              productId: product.id,
              variantId: variant.id,
              sku: product.sku,
            },
            ...(primaryImage ? { images: [primaryImage] } : {}),
          },
        },
        quantity: item.quantity,
      });
    }

    /* ── Create pending order record ── */
    const orderNumber = generateOrderNumber();

    const order = await prisma.order.create({
      data: {
        orderNumber,
        userId: userId ?? null,
        guestEmail: email ?? null,
        status: "PENDING",
        paymentStatus: "PENDING",
        subtotalCents,
        shippingCents: 0,
        taxCents: 0,
        dutyCents: 0,
        totalCents: subtotalCents,
        currency: "USD",
        trackingNumber: null,
        notes: null,
        items: {
          create: orderItems,
        },
      },
    });

    /* ── Create Stripe Checkout Session ── */
    const session = await stripe.checkout.sessions.create({
      mode: "payment",
      payment_method_types: ["card"],
      line_items: lineItems,
      customer_email: email ?? undefined,

      shipping_address_collection: {
        allowed_countries: [
          "US", "GB", "DE", "FR", "IT", "ES", "NL", "BE", "AT", "CH",
          "SE", "DK", "NO", "FI", "IE", "PT", "AU", "CA", "JP", "SG",
          "AE", "KR", "HK",
        ],
      },
      phone_number_collection: { enabled: true },

      payment_intent_data: {
        metadata: {
          orderId: order.id,
          orderNumber: order.orderNumber,
        },
      },

      metadata: {
        orderId: order.id,
        orderNumber: order.orderNumber,
      },

      allow_promotion_codes: true,
      billing_address_collection: "required",

      shipping_options: [
        {
          shipping_rate_data: {
            type: "fixed_amount",
            fixed_amount: { amount: 0, currency: "usd" },
            display_name: "Complimentary Express Shipping",
            delivery_estimate: {
              minimum: { unit: "business_day", value: 2 },
              maximum: { unit: "business_day", value: 5 },
            },
          },
        },
        {
          shipping_rate_data: {
            type: "fixed_amount",
            fixed_amount: { amount: 3500, currency: "usd" },
            display_name: "Priority Next-Day Delivery",
            delivery_estimate: {
              minimum: { unit: "business_day", value: 1 },
              maximum: { unit: "business_day", value: 1 },
            },
          },
        },
      ],

      success_url: `${APP_URL}/success?session_id={CHECKOUT_SESSION_ID}&order=${order.orderNumber}`,
      cancel_url: `${APP_URL}/shop?checkout=cancelled`,

      expires_at: Math.floor(Date.now() / 1000) + 60 * 30,
    });

    return NextResponse.json({
      sessionId: session.id,
      sessionUrl: session.url,
      orderId: order.id,
      orderNumber: order.orderNumber,
    });
  } catch (err) {
    console.error("Checkout session creation error:", err);

    if (err instanceof Stripe.errors.StripeError) {
      return NextResponse.json(
        { error: `Payment service error: ${err.message}` },
        { status: 502 },
      );
    }

    return NextResponse.json(
      { error: "Failed to create checkout session" },
      { status: 500 },
    );
  }
}
