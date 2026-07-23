import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { sendOrderConfirmationEmail } from "@/lib/email";
import { sendOrderConfirmationSms } from "@/lib/sms";

export async function POST(request: NextRequest) {
  try {
    const secretHash = process.env.FLUTTERWAVE_SECRET_HASH;
    const verifHash = request.headers.get("verif-hash");

    if (!secretHash || verifHash !== secretHash) {
      return NextResponse.json({ error: "Invalid signature" }, { status: 401 });
    }

    const body = await request.json();
    const { event, data } = body;

    if (event !== "charge.completed" || data?.status !== "successful") {
      return NextResponse.json({ success: true });
    }

    const txRef = data.tx_ref;
    if (!txRef) {
      console.error("[Flutterwave Webhook] No tx_ref in payload");
      return NextResponse.json({ success: true });
    }

    const order = await prisma.order.findFirst({
      where: { orderNumber: txRef },
      include: {
        items: {
          include: {
            product: {
              include: {
                brand: { select: { name: true } },
                images: { where: { isPrimary: true }, take: 1 },
              },
            },
            variant: { select: { size: true } },
          },
        },
        shippingAddress: true,
      },
    });

    if (!order) {
      console.error(`[Flutterwave Webhook] Order not found: ${txRef}`);
      return NextResponse.json({ success: true });
    }

    if (order.paymentStatus === "CAPTURED") {
      return NextResponse.json({ success: true });
    }

    await prisma.$transaction(async (tx) => {
      await tx.order.update({
        where: { id: order.id },
        data: {
          paymentStatus: "CAPTURED",
          status: "CONFIRMED",
          paymentProvider: "flutterwave",
        },
      });

      for (const item of order.items) {
        if (item.variantId) {
          await tx.productVariant.update({
            where: { id: item.variantId },
            data: { stockCount: { decrement: item.quantity } },
          });
        }
      }
    });

    const customerEmail = order.guestEmail;
    if (customerEmail) {
      const emailItems = order.items.map((item) => ({
        name: item.product.name,
        brand: item.product.brand.name,
        size: item.variant?.size ?? "One Size",
        quantity: item.quantity,
        priceCents: item.totalCents,
        imageUrl: item.product.images[0]?.url ?? "",
      }));

      const addr = order.shippingAddress;
      await sendOrderConfirmationEmail({
        to: customerEmail,
        orderNumber: order.orderNumber,
        items: emailItems,
        subtotalCents: order.subtotalCents,
        shippingCents: order.shippingCents,
        taxCents: order.taxCents,
        dutyCents: order.dutyCents,
        totalCents: order.totalCents,
        currency: order.currency,
        shippingAddress: addr
          ? {
              name: `${addr.firstName} ${addr.lastName}`,
              line1: addr.line1,
              line2: addr.line2 ?? undefined,
              city: addr.city,
              state: addr.state ?? undefined,
              postalCode: addr.postalCode,
              country: addr.country,
            }
          : undefined,
        shippingMethod: order.shippingMethod ?? "Standard",
      });
    }

    const phone = order.shippingAddress?.phone;
    if (phone) {
      const totalFormatted = new Intl.NumberFormat("en-NG", {
        style: "currency",
        currency: order.currency || "NGN",
        minimumFractionDigits: 0,
      }).format(order.totalCents / 100);
      await sendOrderConfirmationSms(phone, order.orderNumber, totalFormatted);
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Flutterwave webhook error:", error);
    return NextResponse.json(
      { error: "Webhook processing failed" },
      { status: 500 },
    );
  }
}
