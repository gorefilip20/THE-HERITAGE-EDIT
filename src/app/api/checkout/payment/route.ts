import { NextRequest, NextResponse } from "next/server";
import { createPaymentIntent } from "@/lib/stripe";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { amountCents, currency, email, orderId } = body;

    if (!amountCents || !currency || !email) {
      return NextResponse.json(
        { error: "amountCents, currency, and email are required" },
        { status: 400 },
      );
    }

    const paymentIntent = await createPaymentIntent(amountCents, currency, {
      email,
      orderId: orderId ?? "",
    });

    return NextResponse.json({
      clientSecret: paymentIntent.client_secret,
      paymentIntentId: paymentIntent.id,
    });
  } catch (err) {
    console.error("Payment intent creation failed:", err);
    return NextResponse.json(
      { error: "Failed to create payment intent" },
      { status: 500 },
    );
  }
}
