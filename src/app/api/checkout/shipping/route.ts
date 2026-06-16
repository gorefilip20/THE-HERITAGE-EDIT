import { NextRequest, NextResponse } from "next/server";
import { shippingAddressSchema } from "@/lib/validators";
import { getShippingOptions, calculateTaxAndDuty } from "@/lib/shipping";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { country, state, subtotalCents } = body;

    if (!country || typeof subtotalCents !== "number") {
      return NextResponse.json(
        { error: "country and subtotalCents are required" },
        { status: 400 },
      );
    }

    const shippingOptions = getShippingOptions(country, subtotalCents);
    const taxDuty = calculateTaxAndDuty(subtotalCents, country, state);

    return NextResponse.json({ shippingOptions, taxDuty });
  } catch {
    return NextResponse.json(
      { error: "Failed to calculate shipping" },
      { status: 500 },
    );
  }
}
