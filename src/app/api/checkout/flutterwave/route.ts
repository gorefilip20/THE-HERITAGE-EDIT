import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { DEFAULT_CURRENCY } from "@/lib/utils";

const FLUTTERWAVE_PAYMENTS_URL = "https://api.flutterwave.com/v3/payments";
const appUrl = () => (process.env.NEXT_PUBLIC_APP_URL ?? "https://theheritageedit.shop").replace(/\/$/, "");

const initializeSchema = z.object({
  amount: z.number().finite().positive(),
  email: z.string().email(),
  phone: z.string().trim().min(7).max(30).optional(),
  orderId: z.string().trim().min(1).max(120).optional(),
});

export async function POST(request: NextRequest) {
  try {
    const flutterwaveKey = (process.env.FLUTTERWAVE_SECRET_KEY ?? "")
      .trim()
      .replace(/^['"]|['"]$/g, "")
      .replace(/^Bearer\s+/i, "");
    if (!flutterwaveKey) {
      return NextResponse.json({ error: "Flutterwave is not configured on the server" }, { status: 500 });
    }

    const parsed = initializeSchema.safeParse(await request.json());
    if (!parsed.success) {
      return NextResponse.json({ error: "Invalid payment request", issues: parsed.error.issues }, { status: 400 });
    }

    const { amount, email, phone, orderId } = parsed.data;
    // The application stores money in kobo/cents. Flutterwave receives major NGN.
    const amountNgn = Math.round(amount) / 100;
    const txRef = `HE-${orderId ?? Date.now()}-${crypto.randomUUID().slice(0, 8)}`;
    const response = await fetch(FLUTTERWAVE_PAYMENTS_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${flutterwaveKey}`,
      },
      body: JSON.stringify({
        tx_ref: txRef,
        amount: amountNgn,
        currency: DEFAULT_CURRENCY,
        payment_options: "card,banktransfer,ussd",
        redirect_url: `${appUrl()}/checkout/success`,
        customer: { email, ...(phone ? { phonenumber: phone } : {}) },
        customizations: {
          title: "The Heritage Edit",
          description: "Premium African Fashion",
          logo: `${appUrl()}/icon.jpg`,
        },
        meta: { orderId: orderId ?? null },
      }),
      cache: "no-store",
    });

    const data = (await response.json().catch(() => null)) as {
      status?: string;
      message?: string;
      data?: { link?: string };
    } | null;

    if (!response.ok || data?.status !== "success" || !data.data?.link) {
      console.error("Flutterwave initialization rejected", {
        status: response.status,
        message: data?.message ?? "No provider message",
      });
      return NextResponse.json(
        { error: data?.message ?? "Flutterwave could not initialize this payment" },
        { status: 502 },
      );
    }

    return NextResponse.json({ success: true, link: data.data.link, txRef });
  } catch (error) {
    console.error("Flutterwave initialization error:", error);
    return NextResponse.json({ error: "Payment processing failed" }, { status: 500 });
  }
}
