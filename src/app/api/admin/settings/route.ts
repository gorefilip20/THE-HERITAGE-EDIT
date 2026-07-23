import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { cookies } from "next/headers";
import * as jose from "jose";

async function getAdminUser() {
  const cookieStore = await cookies();
  const token = cookieStore.get("auth_token")?.value;
  if (!token) return null;
  try {
    const secret = new TextEncoder().encode(process.env.NEXTAUTH_SECRET || "fallback");
    const { payload } = await jose.jwtVerify(token, secret);
    const user = await prisma.user.findUnique({ where: { id: payload.userId as string } });
    if (!user || (user.role !== "ADMIN" && user.role !== "SUPER_ADMIN")) return null;
    return user;
  } catch {
    return null;
  }
}

export async function GET() {
  const user = await getAdminUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const settings = await prisma.storeSettings.upsert({
    where: { id: "default" },
    create: { id: "default" },
    update: {},
  });

  return NextResponse.json(settings);
}

export async function PUT(request: NextRequest) {
  const user = await getAdminUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const body = await request.json();

  const settings = await prisma.storeSettings.upsert({
    where: { id: "default" },
    create: {
      id: "default",
      storeName: body.storeName,
      storeEmail: body.storeEmail,
      currency: body.currency,
      timezone: body.timezone,
      freeShippingThresholdCents: body.freeShippingThresholdCents,
      paystackEnabled: body.paystackEnabled,
      flutterwaveEnabled: body.flutterwaveEnabled,
      domesticShippingCents: body.domesticShippingCents,
      internationalShippingCents: body.internationalShippingCents,
      expressShippingCents: body.expressShippingCents,
      estimatedDomesticDays: body.estimatedDomesticDays,
      estimatedInternationalDays: body.estimatedInternationalDays,
      notifyNewOrders: body.notifyNewOrders,
      notifyLowStock: body.notifyLowStock,
      notifySignups: body.notifySignups,
      notifyPaymentFailures: body.notifyPaymentFailures,
      lowStockThreshold: body.lowStockThreshold,
    },
    update: {
      storeName: body.storeName,
      storeEmail: body.storeEmail,
      currency: body.currency,
      timezone: body.timezone,
      freeShippingThresholdCents: body.freeShippingThresholdCents,
      paystackEnabled: body.paystackEnabled,
      flutterwaveEnabled: body.flutterwaveEnabled,
      domesticShippingCents: body.domesticShippingCents,
      internationalShippingCents: body.internationalShippingCents,
      expressShippingCents: body.expressShippingCents,
      estimatedDomesticDays: body.estimatedDomesticDays,
      estimatedInternationalDays: body.estimatedInternationalDays,
      notifyNewOrders: body.notifyNewOrders,
      notifyLowStock: body.notifyLowStock,
      notifySignups: body.notifySignups,
      notifyPaymentFailures: body.notifyPaymentFailures,
      lowStockThreshold: body.lowStockThreshold,
    },
  });

  return NextResponse.json(settings);
}
