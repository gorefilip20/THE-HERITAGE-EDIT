import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { capturePaidOrder } from "@/lib/paystack";
import { verifyFlutterwaveTransaction } from "@/lib/flutterwave";

export async function GET(request: NextRequest) {
  const transactionId = request.nextUrl.searchParams.get("transaction_id");
  const txRef = request.nextUrl.searchParams.get("tx_ref") ?? "";
  if (!transactionId) return NextResponse.json({ error: "Missing transaction_id" }, { status: 400 });

  try {
    const verification = await verifyFlutterwaveTransaction(transactionId);
    const data = verification.data;
    if (data?.status !== "successful" || data.currency !== "NGN") {
      return NextResponse.json({ verified: false, status: data?.status ?? "unknown" }, { status: 400 });
    }

    const orderId = txRef.startsWith("HE-") ? txRef.slice(3).split("-")[0] : null;
    if (!orderId) return NextResponse.json({ verified: true, captured: false, txRef: data.tx_ref ?? txRef });

    const order = await prisma.order.findUnique({ where: { id: orderId }, select: { totalCents: true, currency: true } });
    if (!order || order.currency !== "NGN" || Math.round(Number(data.charged_amount ?? data.amount ?? 0) * 100) !== order.totalCents) {
      return NextResponse.json({ error: "Payment does not match order" }, { status: 400 });
    }

    const result = await capturePaidOrder(orderId, data.tx_ref ?? txRef, "Flutterwave");
    return NextResponse.json({ verified: true, captured: result.captured, orderId });
  } catch (error) {
    console.error("Flutterwave verification error:", error);
    return NextResponse.json({ error: "Could not verify Flutterwave payment" }, { status: 502 });
  }
}
