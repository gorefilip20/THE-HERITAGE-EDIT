import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";

export async function GET() {
  try {
    const now = new Date();
    const thirtyDaysAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);

    const [
      failedPayments,
      cancelledOrders,
      totalOrders,
      highValueOrders,
      flaggedOrders,
      recentFailedOrders,
    ] = await Promise.all([
      prisma.order.count({
        where: { paymentStatus: "FAILED", createdAt: { gte: thirtyDaysAgo } },
      }),
      prisma.order.count({
        where: { status: "CANCELLED", createdAt: { gte: thirtyDaysAgo } },
      }),
      prisma.order.count({
        where: { createdAt: { gte: thirtyDaysAgo } },
      }),
      prisma.order.findMany({
        where: { totalCents: { gte: 5000000 }, createdAt: { gte: thirtyDaysAgo } },
        select: {
          id: true,
          orderNumber: true,
          guestEmail: true,
          totalCents: true,
          status: true,
          paymentStatus: true,
          isFraudSuspect: true,
          fraudScore: true,
          fraudReasons: true,
          createdAt: true,
          user: { select: { email: true, firstName: true, lastName: true } },
        },
        orderBy: { totalCents: "desc" },
        take: 20,
      }),
      prisma.order.findMany({
        where: { isFraudSuspect: true, createdAt: { gte: thirtyDaysAgo } },
        select: {
          id: true,
          orderNumber: true,
          guestEmail: true,
          totalCents: true,
          status: true,
          fraudScore: true,
          fraudReasons: true,
          createdAt: true,
          user: { select: { email: true } },
        },
        orderBy: { createdAt: "desc" },
        take: 20,
      }),
      prisma.order.findMany({
        where: { paymentStatus: "FAILED", createdAt: { gte: thirtyDaysAgo } },
        select: {
          id: true,
          orderNumber: true,
          guestEmail: true,
          totalCents: true,
          createdAt: true,
          user: { select: { email: true } },
        },
        orderBy: { createdAt: "desc" },
        take: 20,
      }),
    ]);

    const cancellationRate = totalOrders > 0 ? ((cancelledOrders / totalOrders) * 100) : 0;

    const securityChecks = {
      httpsEnabled: !!process.env.NEXTAUTH_URL?.startsWith("https"),
      paystackConfigured: !!process.env.PAYSTACK_SECRET_KEY,
      flutterwaveConfigured: !!process.env.FLUTTERWAVE_SECRET_KEY,
      webhookHashSet: !!process.env.FLUTTERWAVE_SECRET_HASH,
      authSecretSet: !!process.env.NEXTAUTH_SECRET,
    };

    return NextResponse.json({
      riskIndicators: {
        failedPayments,
        cancelledOrders,
        cancellationRate: Math.round(cancellationRate * 10) / 10,
        highValueOrderCount: highValueOrders.length,
        flaggedOrderCount: flaggedOrders.length,
      },
      highValueOrders: highValueOrders.map((o) => ({
        ...o,
        email: o.user?.email || o.guestEmail,
      })),
      flaggedOrders: flaggedOrders.map((o) => ({
        ...o,
        email: o.user?.email || o.guestEmail,
      })),
      recentFailedOrders: recentFailedOrders.map((o) => ({
        ...o,
        email: o.user?.email || o.guestEmail,
      })),
      securityChecks,
    });
  } catch (err) {
    console.error("Fraud API error:", err);
    return NextResponse.json({ error: "Failed to fetch fraud data" }, { status: 500 });
  }
}
