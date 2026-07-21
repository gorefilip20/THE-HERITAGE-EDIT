import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import crypto from "crypto";
import { sendOrderConfirmationEmail } from "@/lib/email";
import { sendOrderConfirmationSms } from "@/lib/sms";

const PAYSTACK_SECRET = process.env.PAYSTACK_SECRET_KEY ?? "";

function verifyPaystackSignature(
  body: string,
  signature: string,
): boolean {
  const hash = crypto
    .createHmac("sha512", PAYSTACK_SECRET)
    .update(body)
    .digest("hex");
  return hash === signature;
}

export async function POST(request: NextRequest) {
  try {
    const rawBody = await request.text();
    const signature = request.headers.get("x-paystack-signature") ?? "";

    if (!verifyPaystackSignature(rawBody, signature)) {
      return NextResponse.json(
        { error: "Invalid signature" },
        { status: 401 },
      );
    }

    const event = JSON.parse(rawBody);

    if (event.event === "charge.success") {
      const { reference, metadata } = event.data;
      const orderId = metadata?.orderId;
      const orderRef = reference as string;

      const order = await prisma.order.findFirst({
        where: orderId
          ? { id: orderId }
          : { orderNumber: orderRef },
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
        console.error(`[Paystack Webhook] Order not found: ${orderRef}`);
        return NextResponse.json({ received: true });
      }

      if (order.paymentStatus === "CAPTURED") {
        return NextResponse.json({ received: true });
      }

      await prisma.$transaction(async (tx) => {
        await tx.order.update({
          where: { id: order.id },
          data: {
            status: "CONFIRMED",
            paymentStatus: "CAPTURED",
            stripePaymentId: event.data.id?.toString() ?? null,
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

      console.log(
        `[Paystack Webhook] Order ${order.orderNumber} confirmed — payment successful`,
      );

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
          shippingAddress: addr ? {
            name: `${addr.firstName} ${addr.lastName}`,
            line1: addr.line1,
            line2: addr.line2 ?? undefined,
            city: addr.city,
            state: addr.state ?? undefined,
            postalCode: addr.postalCode,
            country: addr.country,
          } : undefined,
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
    }

    return NextResponse.json({ received: true });
  } catch (err) {
    console.error("[Paystack Webhook] Error:", err);
    return NextResponse.json({ received: true });
  }
}
