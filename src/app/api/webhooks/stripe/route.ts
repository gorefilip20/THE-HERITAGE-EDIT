import { NextRequest, NextResponse } from "next/server";
import Stripe from "stripe";
import { prisma } from "@/lib/db";
import { sendOrderConfirmationEmail } from "@/lib/email";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY ?? "", {
  apiVersion: "2024-04-10",
});

const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET ?? "";

export async function POST(request: NextRequest) {
  const body = await request.text();
  const signature = request.headers.get("stripe-signature");

  if (!signature) {
    return NextResponse.json(
      { error: "Missing stripe-signature header" },
      { status: 400 },
    );
  }

  let event: Stripe.Event;

  try {
    event = stripe.webhooks.constructEvent(body, signature, webhookSecret);
  } catch (err) {
    console.error(
      "Stripe webhook signature verification failed:",
      err instanceof Error ? err.message : err,
    );
    return NextResponse.json(
      { error: "Invalid signature" },
      { status: 400 },
    );
  }

  switch (event.type) {
    case "checkout.session.completed": {
      const session = event.data.object as Stripe.Checkout.Session;
      await handleCheckoutCompleted(session);
      break;
    }

    case "payment_intent.succeeded": {
      const paymentIntent = event.data.object as Stripe.PaymentIntent;
      await handlePaymentSucceeded(paymentIntent);
      break;
    }

    case "payment_intent.payment_failed": {
      const paymentIntent = event.data.object as Stripe.PaymentIntent;
      await handlePaymentFailed(paymentIntent);
      break;
    }

    default:
      break;
  }

  return NextResponse.json({ received: true });
}

async function handleCheckoutCompleted(session: Stripe.Checkout.Session) {
  const orderId = session.metadata?.orderId;
  if (!orderId) {
    console.error("Checkout session missing orderId in metadata:", session.id);
    return;
  }

  try {
    const order = await prisma.order.findUnique({
      where: { id: orderId },
      include: {
        items: {
          include: {
            product: { include: { brand: true, images: { take: 1 } } },
            variant: true,
          },
        },
        shippingAddress: true,
      },
    });

    if (!order) {
      console.error("Order not found for checkout session:", orderId);
      return;
    }

    if (order.paymentStatus === "CAPTURED") {
      return;
    }

    await prisma.$transaction(async (tx) => {
      await tx.order.update({
        where: { id: orderId },
        data: {
          status: "CONFIRMED",
          paymentStatus: "CAPTURED",
          stripePaymentId: session.payment_intent as string,
        },
      });

      for (const item of order.items) {
        if (item.variantId) {
          await tx.productVariant.update({
            where: { id: item.variantId },
            data: {
              stockCount: { decrement: item.quantity },
            },
          });
        }
      }
    });

    const recipientEmail = order.guestEmail ?? session.customer_details?.email;
    if (recipientEmail) {
      await sendOrderConfirmationEmail({
        to: recipientEmail,
        orderNumber: order.orderNumber,
        items: order.items.map((item) => ({
          name: item.product.name,
          brand: item.product.brand.name,
          size: item.variant?.size ?? "One Size",
          quantity: item.quantity,
          priceCents: item.totalCents,
          imageUrl: item.product.images[0]?.url ?? "",
        })),
        subtotalCents: order.subtotalCents,
        shippingCents: order.shippingCents,
        taxCents: order.taxCents,
        dutyCents: order.dutyCents,
        totalCents: order.totalCents,
        shippingAddress: order.shippingAddress
          ? {
              name: `${order.shippingAddress.firstName} ${order.shippingAddress.lastName}`,
              line1: order.shippingAddress.line1,
              line2: order.shippingAddress.line2 ?? undefined,
              city: order.shippingAddress.city,
              state: order.shippingAddress.state ?? undefined,
              postalCode: order.shippingAddress.postalCode,
              country: order.shippingAddress.country,
            }
          : undefined,
        shippingMethod: order.shippingMethod ?? "Standard",
      });
    }
  } catch (err) {
    console.error("Error processing checkout.session.completed:", err);
    throw err;
  }
}

async function handlePaymentSucceeded(paymentIntent: Stripe.PaymentIntent) {
  const orderId = paymentIntent.metadata?.orderId;
  if (!orderId) return;

  try {
    await prisma.order.update({
      where: { id: orderId },
      data: {
        paymentStatus: "CAPTURED",
        stripePaymentId: paymentIntent.id,
      },
    });
  } catch (err) {
    console.error("Error handling payment_intent.succeeded:", err);
  }
}

async function handlePaymentFailed(paymentIntent: Stripe.PaymentIntent) {
  const orderId = paymentIntent.metadata?.orderId;
  if (!orderId) return;

  try {
    await prisma.order.update({
      where: { id: orderId },
      data: {
        paymentStatus: "FAILED",
        status: "CANCELLED",
      },
    });
  } catch (err) {
    console.error("Error handling payment_intent.payment_failed:", err);
  }
}
