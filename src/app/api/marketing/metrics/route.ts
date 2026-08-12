import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { getCurrentUser } from "@/lib/auth";

/* ──────────────────────────────────────────────────────────
   MARKETING DASHBOARD METRICS
   Aggregates real data from the database so the marketing
   page (admin-facing) actually renders numbers.
   ────────────────────────────────────────────────────────── */
export async function GET(_request: NextRequest) {
  try {
    const user = await getCurrentUser();
    const isAdmin =
      user?.role === "ADMIN" || user?.role === "SUPER_ADMIN";
    if (!isAdmin) {
      return NextResponse.json(
        { error: "Admin access required" },
        { status: 403 },
      );
    }

    const [
      totalOrders,
      totalRevenue,
      subscriberCount,
      contactCount,
      recentOrders,
      emailSubscribers,
    ] = await Promise.all([
      prisma.order.count(),
      prisma.order.aggregate({
        _sum: { totalCents: true },
        where: { paymentStatus: "CAPTURED" },
      }),
      prisma.newsletterSubscriber.count(),
      prisma.contactSubmission.count(),
      prisma.order.findMany({
        take: 10,
        orderBy: { createdAt: "desc" },
        select: {
          orderNumber: true,
          status: true,
          paymentStatus: true,
          totalCents: true,
          createdAt: true,
        },
      }),
      prisma.newsletterSubscriber.findMany({
        take: 10,
        orderBy: { createdAt: "desc" },
        select: { email: true, source: true, createdAt: true },
      }),
    ]);

    return NextResponse.json({
      activeCampaigns: 0,
      totalReach: 0,
      emailSubscribers: subscriberCount,
      totalOrders,
      totalRevenueCents: totalRevenue._sum.totalCents ?? 0,
      conversionRate: 0,
      contactSubmissions: contactCount,
      recentOrders,
      emailPerformance: emailSubscribers,
      campaigns: [],
      subscribers: emailSubscribers,
    });
  } catch (err) {
    console.error("Marketing metrics error:", err);
    return NextResponse.json(
      { error: "Failed to load marketing metrics" },
      { status: 500 },
    );
  }
}
