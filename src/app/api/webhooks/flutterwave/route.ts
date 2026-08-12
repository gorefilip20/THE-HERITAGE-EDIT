import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";

/* ──────────────────────────────────────────────────────────
   FLUTTERWAVE WEBHOOK
   Verifies the transaction server-side, then marks the order
   CONFIRMED / CAPTURED and decrements stock (idempotent).
   ────────────────────────────────────────────────────────── */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const signature = request.headers.get("verif-hash") ?? "";
    const secretHash = process.env.FLUTTERWAVE_SECRET_HASH;

    if (!secretHash || signature !== secretHash) {
      return NextResponse.json(
        { error: "Invalid signature" },
        { status: 401 },
      );
    }

    const txRef = body?.tx_ref as string | undefined;
    if (!txRef?.startsWith("the_")) {
      return NextResponse.json({ received: true });
    }
    const orderId = txRef.slice(4);

    if (body?.status === "successful") {
      const order = await prisma.order.findFirst({
        where: { id: orderId },
        include: { items: true },
      });
      if (!order) {
        console.error(`[Flutterwave Webhook] Order not found: ${txRef}`);
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
        `[Flutterwave Webhook] Order ${order.orderNumber} confirmed — payment successful`,
      );
    } else if (body?.status === "failed" || body?.status === "cancelled") {
      await prisma.order
        .updateMany({
          where: { id: orderId, paymentStatus: "PENDING" },
          data: { paymentStatus: "FAILED" },
        })
        .catch(() => {});
    }

    return NextResponse.json({ received: true });
  } catch (err) {
    console.error("[Flutterwave Webhook] Error:", err);
    return NextResponse.json({ received: true });
  }
}
