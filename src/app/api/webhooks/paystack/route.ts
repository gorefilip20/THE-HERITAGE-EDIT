import { NextRequest, NextResponse } from "next/server";
import crypto from "crypto";
import { capturePaidOrder, PAYSTACK_SECRET_KEY, verifyPaystackTransaction } from "@/lib/paystack";
import { prisma } from "@/lib/db";

function verifyPaystackSignature(body: string, signature: string): boolean {
  if (!PAYSTACK_SECRET_KEY || !signature) return false;
  const expected = crypto
    .createHmac("sha512", PAYSTACK_SECRET_KEY)
    .update(body)
    .digest("hex");
  const expectedBuffer = Buffer.from(expected, "utf8");
  const signatureBuffer = Buffer.from(signature, "utf8");
  return expectedBuffer.length === signatureBuffer.length && crypto.timingSafeEqual(expectedBuffer, signatureBuffer);
}

export async function POST(request: NextRequest) {
  const rawBody = await request.text();
  const signature = request.headers.get("x-paystack-signature") ?? "";

  if (!verifyPaystackSignature(rawBody, signature)) {
    return NextResponse.json({ error: "Invalid signature" }, { status: 401 });
  }

  try {
    const event = JSON.parse(rawBody) as {
      event?: string;
      data?: { reference?: string };
    };

    if (event.event !== "charge.success" || !event.data?.reference) {
      return NextResponse.json({ received: true });
    }

    // Do not trust the webhook payload alone. Verify the transaction directly
    // with Paystack before changing the order or decrementing stock.
    const verified = await verifyPaystackTransaction(event.data.reference);
    const payment = verified.data;
    if (payment?.status !== "success" || payment.reference !== event.data.reference) {
      return NextResponse.json({ error: "Transaction not successful" }, { status: 400 });
    }

    const order = await prisma.order.findUnique({
      where: { orderNumber: event.data.reference },
      select: { id: true, totalCents: true, currency: true },
    });
    if (!order) {
      console.error(`[Paystack Webhook] Order not found: ${event.data.reference}`);
      return NextResponse.json({ received: true });
    }

    if (
      payment.amount !== order.totalCents ||
      (payment.currency && payment.currency !== order.currency)
    ) {
      console.error(`[Paystack Webhook] Amount/currency mismatch for ${event.data.reference}`);
      return NextResponse.json({ error: "Transaction does not match order" }, { status: 400 });
    }

    await capturePaidOrder(order.id, event.data.reference);
    console.log(`[Paystack Webhook] Order ${event.data.reference} confirmed`);
    return NextResponse.json({ received: true });
  } catch (error) {
    console.error("[Paystack Webhook] Error:", error);
    return NextResponse.json({ error: "Webhook processing failed" }, { status: 500 });
  }
}
