import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { generateOrderNumber } from "@/lib/utils";
import { z } from "zod";

const PAYSTACK_SECRET = process.env.PAYSTACK_SECRET_KEY ?? "";
const APP_URL = process.env.NEXT_PUBLIC_APP_URL ?? "https://heritageedit.com";

const checkoutItemSchema = z.object({
  productId: z.string().min(1),
  variantId: z.string().min(1),
  quantity: z.number().int().positive().max(10),
});

const paystackCheckoutSchema = z.object({
  items: z.array(checkoutItemSchema).min(1).max(50),
  email: z.string().email(),
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
    if (!PAYSTACK_SECRET) {
      return NextResponse.json(
        { error: "Paystack is not configured" },
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
    const parsed = paystackCheckoutSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { error: "Invalid request", issues: parsed.error.issues },
        { status: 400 },
      );
    }

    const { items, email, shippingAddress, userId, currency } = parsed.data;

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

    const orderNumber = generateOrderNumber();

    let shippingAddressId: string | null = null;

    if (userId) {
      const address = await prisma.address.create({
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
      shippingAddressId = address.id;
    }

    const order = await prisma.order.create({
      data: {
        orderNumber,
        userId: userId ?? null,
        guestEmail: email,
        status: "PENDING",
        paymentStatus: "PENDING",
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

    const amountInMinorUnit = subtotalCents;

    const paystackRes = await fetch(
      "https://api.paystack.co/transaction/initialize",
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${PAYSTACK_SECRET}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          email,
          amount: amountInMinorUnit,
          currency,
          reference: order.orderNumber,
          callback_url: `${APP_URL}/success?provider=paystack&order=${order.orderNumber}`,
          metadata: {
            orderId: order.id,
            orderNumber: order.orderNumber,
            custom_fields: [
              {
                display_name: "Order Number",
                variable_name: "order_number",
                value: order.orderNumber,
              },
            ],
          },
        }),
      },
    );

    if (!paystackRes.ok) {
      const errBody = await paystackRes.text().catch(() => "Unknown error");
      console.error("Paystack initialization error:", errBody);
      return NextResponse.json(
        { error: "Payment initialization failed" },
        { status: 502 },
      );
    }

    let paystackData: { status?: boolean; data?: { authorization_url?: string; access_code?: string; reference?: string } };
    try {
      paystackData = await paystackRes.json();
    } catch {
      console.error("Paystack returned non-JSON response on 200");
      return NextResponse.json(
        { error: "Invalid response from payment provider" },
        { status: 502 },
      );
    }

    if (!paystackData.status || !paystackData.data?.authorization_url) {
      return NextResponse.json(
        { error: "Invalid response from payment provider" },
        { status: 502 },
      );
    }

    return NextResponse.json({
      authorizationUrl: paystackData.data.authorization_url,
      accessCode: paystackData.data.access_code,
      reference: paystackData.data.reference,
      orderId: order.id,
      orderNumber: order.orderNumber,
    });
  } catch (err) {
    console.error("Paystack checkout error:", err);
    return NextResponse.json(
      { error: "Failed to create checkout session" },
      { status: 500 },
    );
  }
}
