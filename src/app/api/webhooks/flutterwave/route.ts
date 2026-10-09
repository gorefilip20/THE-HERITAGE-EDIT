import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { capturePaidOrder } from "@/lib/paystack";
import { validFlutterwaveWebhookHash, verifyFlutterwaveTransaction } from "@/lib/flutterwave";

function getOrderId(data: Record<string, unknown>): string | null {
  const meta = data.meta as Record<string, unknown> | undefined;
  if (typeof meta?.orderId === "string" && meta.orderId) return meta.orderId;
  const txRef = typeof data.tx_ref === "string" ? data.tx_ref : "";
  const match = txRef.match(/^HE-([^-]+)-/);
  return match?.[1] ?? null;
}

export async function POST(request: NextRequest) {
  if (!validFlutterwaveWebhookHash(request.headers.get("verif-hash"))) {
    return NextResponse.json({ error: "Invalid signature" }, { status: 401 });
  }

  try {
    const body = (await request.json()) as { data?: Record<string, unknown> };
    const data = body.data ?? {};
    const transactionId = String(data.id ?? "");
    if (!transactionId) return NextResponse.json({ error: "Missing transaction id" }, { status: 400 });

    const verification = await verifyFlutterwaveTransaction(transactionId);
    const verified = verification.data;
    if (verified?.status !== "successful" || verified.currency !== "NGN") {
      return NextResponse.json({ success: true, ignored: true });
    }

    const orderId = getOrderId({ ...data, ...verified });
    if (!orderId) return NextResponse.json({ success: true, captured: false });

    const order = await prisma.order.findUnique({ where: { id: orderId }, select: { totalCents: true, currency: true } });
    if (!order || order.currency !== "NGN" || Math.round(Number(verified.charged_amount ?? verified.amount ?? 0) * 100) !== order.totalCents) {
      return NextResponse.json({ error: "Payment does not match order" }, { status: 400 });
    }

    const result = await capturePaidOrder(orderId, verified.tx_ref ?? String(data.tx_ref ?? transactionId), "Flutterwave");
    return NextResponse.json({ success: true, captured: result.captured });
  } catch (error) {
    console.error("Flutterwave webhook error:", error);
    return NextResponse.json({ error: "Webhook processing failed" }, { status: 500 });
  }
}
