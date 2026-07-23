import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { generateOrderNumber } from "@/lib/utils";
import { z } from "zod";

const FLUTTERWAVE_SECRET = process.env.FLUTTERWAVE_SECRET_KEY ?? "";
const APP_URL = process.env.NEXT_PUBLIC_APP_URL ?? "https://heritageedit.com";

const checkoutItemSchema = z.object({
  productId: z.string().min(1),
  variantId: z.string().min(1),
  quantity: z.number().int().positive().max(10),
});

const flutterwaveCheckoutSchema = z.object({
  items: z.array(checkoutItemSchema).min(1).max(50),
  email: z.string().email(),
  phone: z.string().optional(),
  shippingAddress: z.object({
    firstName: z.string().min(1),
    lastName: z.string().min(1),
    line1: z.string().min(1),
    line2: z.string().optional(),
    city: z.string().min(1),
    state: z.string().optional(),
    postalCode: z.string().min(1),
    country: z.string().min(1),
    phone: z.string().optional(),
  }),
  userId: z.string().optional(),
  currency: z.enum(["NGN", "USD", "GHS", "ZAR", "KES"]).default("NGN"),
});

export async function POST(request: NextRequest) {
  try {
    if (!FLUTTERWAVE_SECRET) {
      return NextResponse.json(
        { error: "Flutterwave not configured" },
        { status: 503 },
      );
    }

    let body: unknown;
    try {
      body = await request.json();
    } catch {
      return NextResponse.json(
        { error: "Invalid or empty request body" },
        { status: 400 },
      );
    }

    const parsed = flutterwaveCheckoutSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        { error: "Invalid request", issues: parsed.error.issues },
        { status: 400 },
      );
    }

    const { items, email, phone, shippingAddress, userId, currency } = parsed.data;

    const productIds = Array.from(new Set(items.map((i) => i.productId)));
    const products = await prisma.product.findMany({
      where: { id: { in: productIds }, status: "PUBLISHED" },
      include: {
        brand: { select: { name: true } },
        variants: true,
        images: { where: { isPrimary: true }, take: 1 },
      },
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
          { error: `Insufficient stock for ${product.name} (${variant.size}). Available: ${variant.stockCount}` },
          { status: 400 },
        );
      }

      const unitPrice = (product.salePriceCents ?? product.basePriceCents) + variant.priceDeltaCents;
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

    const orderNumber = generateOrderNumber();

    let shippingAddressId: string | null = null;
    if (userId) {
      const addr = await prisma.address.create({
        data: {
          userId,
          label: "Shipping",
          firstName: shippingAddress.firstName,
          lastName: shippingAddress.lastName,
          line1: shippingAddress.line1,
          line2: shippingAddress.line2 ?? null,
          city: shippingAddress.city,
          state: shippingAddress.state ?? null,
          postalCode: shippingAddress.postalCode,
          country: shippingAddress.country,
          phone: shippingAddress.phone ?? null,
        },
      });
      shippingAddressId = addr.id;
    }

    const order = await prisma.order.create({
      data: {
        orderNumber,
        userId: userId ?? null,
        guestEmail: email,
        status: "PENDING",
        paymentStatus: "PENDING",
        paymentProvider: "flutterwave",
        subtotalCents,
        shippingCents: 0,
        taxCents: 0,
        dutyCents: 0,
        totalCents: subtotalCents,
        currency,
        shippingAddressId,
        trackingNumber: null,
        notes: `Shipping: ${shippingAddress.firstName} ${shippingAddress.lastName}, ${shippingAddress.line1}, ${shippingAddress.city}, ${shippingAddress.country} ${shippingAddress.postalCode}`,
        items: { create: orderItems },
      },
    });

    const flwRes = await fetch("https://api.flutterwave.com/v3/payments", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${FLUTTERWAVE_SECRET}`,
      },
      body: JSON.stringify({
        tx_ref: order.orderNumber,
        amount: subtotalCents / 100,
        currency,
        redirect_url: `${APP_URL}/success?provider=flutterwave&order=${order.orderNumber}`,
        customer: {
          email,
          phone_number: phone || shippingAddress.phone || "",
          name: `${shippingAddress.firstName} ${shippingAddress.lastName}`,
        },
        customizations: {
          title: "The Heritage Edit",
          description: `Order ${orderNumber}`,
          logo: `${APP_URL}/logo.png`,
        },
      }),
    });

    const flwData = await flwRes.json();

    if (flwData.status === "success" && flwData.data?.link) {
      return NextResponse.json({
        success: true,
        link: flwData.data.link,
        orderId: order.id,
        orderNumber: order.orderNumber,
      });
    }

    return NextResponse.json(
      { error: "Failed to initialize payment" },
      { status: 400 },
    );
  } catch (error) {
    console.error("Flutterwave checkout error:", error);
    return NextResponse.json(
      { error: "Payment processing failed" },
      { status: 500 },
    );
  }
}
