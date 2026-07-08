import { NextRequest, NextResponse } from "next/server";

export async function POST(request: NextRequest) {
  try {
    const { amount, email, phone, orderId } = await request.json();

    const flutterwaveKey = process.env.FLUTTERWAVE_SECRET_KEY;
    if (!flutterwaveKey) {
      return NextResponse.json(
        { error: "Flutterwave not configured" },
        { status: 500 }
      );
    }

    // Initialize Flutterwave payment
    const response = await fetch("https://api.flutterwave.com/v3/payments", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${flutterwaveKey}`,
      },
      body: JSON.stringify({
        tx_ref: `order_${orderId || Date.now()}`,
        amount: amount / 100, // Convert cents to naira
        currency: "NGN",
        redirect_url: `${process.env.NEXT_PUBLIC_APP_URL}/checkout/success`,
        customer: {
          email,
          phone_number: phone,
        },
        customizations: {
          title: "The Heritage Edit",
          description: "Premium African Fashion",
          logo: `${process.env.NEXT_PUBLIC_APP_URL}/logo.png`,
        },
      }),
    });

    const data = await response.json();

    if (data.status === "success") {
      return NextResponse.json({
        success: true,
        link: data.data.link,
      });
    } else {
      return NextResponse.json(
        { error: "Failed to initialize payment" },
        { status: 400 }
      );
    }
  } catch (error) {
    console.error("Flutterwave error:", error);
    return NextResponse.json(
      { error: "Payment processing failed" },
      { status: 500 }
    );
  }
}

// Webhook handler for Flutterwave
export async function PUT(request: NextRequest) {
  try {
    const body = await request.json();
    const flutterwaveHash = request.headers.get("verif-hash");
    const secretHash = process.env.FLUTTERWAVE_SECRET_HASH;

    if (flutterwaveHash !== secretHash) {
      return NextResponse.json({ error: "Invalid signature" }, { status: 401 });
    }

    const { status, txRef, amount } = body;

    if (status === "successful") {
      // Update order status in database
      console.log(`Payment successful for order ${txRef}: ₦${amount}`);
      // TODO: Update order in database
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Webhook error:", error);
    return NextResponse.json(
      { error: "Webhook processing failed" },
      { status: 500 }
    );
  }
}
