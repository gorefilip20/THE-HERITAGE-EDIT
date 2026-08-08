import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";

export async function GET() {
  const checks: Record<string, string> = {
    status: "ok",
    timestamp: new Date().toISOString(),
    version: process.env.npm_package_version ?? "1.0.0",
  };

  try {
    await prisma.$queryRaw`SELECT 1`;
    checks.database = "connected";
  } catch {
    checks.database = "disconnected";
    checks.status = "degraded";
  }

  checks.paystack = process.env.PAYSTACK_SECRET_KEY ? "configured" : "missing";
  checks.flutterwave = process.env.FLUTTERWAVE_SECRET_KEY ? "configured" : "missing";
  checks.email = process.env.RESEND_API_KEY ? "configured" : "missing";
  checks.sms = process.env.TWILIO_ACCOUNT_SID ? "configured" : "not configured";

  const statusCode = checks.status === "ok" ? 200 : 503;
  return NextResponse.json(checks, { status: statusCode });
}
