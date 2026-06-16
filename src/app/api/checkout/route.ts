import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { checkoutSchema } from "@/lib/validators";
import { generateOrderNumber } from "@/lib/utils";
import { getShippingOptions, calculateTaxAndDuty } from "@/lib/shipping";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const parsed = checkoutSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { error: "Validation failed", issues: parsed.error.issues },
        { status: 400 },
      );
    }

    const { email, shippingAddress, shippingOptionId } = parsed.data;
    const { items, stripePaymentIntentId } = body;

    if (!items || items.length === 0) {
      return NextResponse.json(
        { error: "Cart is empty" },
        { status: 400 },
      );
    }

    const productIds = items.map((i: { productId: string }) => i.productId);
    const products = await prisma.product.findMany({
      where: { id: { in: productIds } },
      include: { variants: true },
    });

    let subtotalCents = 0;
    const orderItems: Array<{
      productId: string;
      variantId: string | null;
      quantity: number;
      unitPriceCents: number;
      totalCents: number;
    }> = [];

    for (const item of items) {
      const product = products.find((p) => p.id === item.productId);
      if (!product) {
        return NextResponse.json(
          { error: `Product ${item.productId} not found` },
          { status: 400 },
        );
      }

      const variant = product.variants.find((v) => v.id === item.variantId);
      if (variant && variant.stockCount < item.quantity) {
        return NextResponse.json(
          { error: `Insufficient stock for ${product.name} (${variant.size})` },
          { status: 400 },
        );
      }

      const unitPrice =
        (product.salePriceCents ?? product.basePriceCents) +
        (variant?.priceDeltaCents ?? 0);

      orderItems.push({
        productId: item.productId,
        variantId: item.variantId ?? null,
        quantity: item.quantity,
        unitPriceCents: unitPrice,
        totalCents: unitPrice * item.quantity,
      });

      subtotalCents += unitPrice * item.quantity;
    }

    const shippingOptions = getShippingOptions(
      shippingAddress.country,
      subtotalCents,
    );
    const selectedShipping = shippingOptions.find(
      (o) => o.id === shippingOptionId,
    );
    const shippingCents = selectedShipping?.priceCents ?? 0;

    const { taxCents, dutyCents } = calculateTaxAndDuty(
      subtotalCents,
      shippingAddress.country,
      shippingAddress.state,
    );

    const totalCents = subtotalCents + shippingCents + taxCents + dutyCents;

    const address = await prisma.address.create({
      data: {
        userId: body.userId ?? undefined,
        firstName: shippingAddress.firstName,
        lastName: shippingAddress.lastName,
        line1: shippingAddress.line1,
        line2: shippingAddress.line2,
        city: shippingAddress.city,
        state: shippingAddress.state,
        postalCode: shippingAddress.postalCode,
        country: shippingAddress.country,
        phone: shippingAddress.phone,
      },
    });

    const order = await prisma.order.create({
      data: {
        orderNumber: generateOrderNumber(),
        userId: body.userId ?? null,
        guestEmail: email,
        status: "CONFIRMED",
        paymentStatus: stripePaymentIntentId ? "AUTHORIZED" : "PENDING",
        subtotalCents,
        shippingCents,
        taxCents,
        dutyCents,
        totalCents,
        currency: "USD",
        shippingAddressId: address.id,
        stripePaymentId: stripePaymentIntentId ?? null,
        shippingMethod: selectedShipping?.service ?? "Standard",
        items: {
          create: orderItems,
        },
      },
      include: { items: true },
    });

    // Decrement stock
    for (const item of orderItems) {
      if (item.variantId) {
        await prisma.productVariant.update({
          where: { id: item.variantId },
          data: { stockCount: { decrement: item.quantity } },
        });
      }
    }

    return NextResponse.json({
      orderId: order.id,
      orderNumber: order.orderNumber,
      totalCents: order.totalCents,
    });
  } catch (err) {
    console.error("Checkout error:", err);
    return NextResponse.json(
      { error: "Checkout failed" },
      { status: 500 },
    );
  }
}
