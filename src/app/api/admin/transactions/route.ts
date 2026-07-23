import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";

export async function GET(request: NextRequest) {
  try {
    const params = request.nextUrl.searchParams;
    const page = parseInt(params.get("page") || "1");
    const pageSize = parseInt(params.get("pageSize") || "20");
    const status = params.get("status");
    const dateFrom = params.get("dateFrom");
    const dateTo = params.get("dateTo");
    const provider = params.get("provider");

    const where: Record<string, unknown> = {};
    if (status) where.paymentStatus = status;
    if (provider) where.paymentProvider = provider;
    if (dateFrom || dateTo) {
      where.createdAt = {
        ...(dateFrom ? { gte: new Date(dateFrom) } : {}),
        ...(dateTo ? { lte: new Date(dateTo) } : {}),
      };
    }

    const [orders, total, capturedSum, refundedSum, totalOrders] = await Promise.all([
      prisma.order.findMany({
        where,
        select: {
          id: true,
          orderNumber: true,
          guestEmail: true,
          totalCents: true,
          paymentStatus: true,
          paymentProvider: true,
          stripePaymentId: true,
          status: true,
          currency: true,
          createdAt: true,
          user: { select: { email: true, firstName: true, lastName: true } },
        },
        orderBy: { createdAt: "desc" },
        skip: (page - 1) * pageSize,
        take: pageSize,
      }),
      prisma.order.count({ where }),
      prisma.order.aggregate({
        where: { ...where, paymentStatus: "CAPTURED" },
        _sum: { totalCents: true },
      }),
      prisma.order.aggregate({
        where: { ...where, paymentStatus: "REFUNDED" },
        _sum: { totalCents: true },
      }),
      prisma.order.count({ where: { paymentStatus: { in: ["CAPTURED", "REFUNDED"] } } }),
    ]);

    const totalRevenue = capturedSum._sum.totalCents ?? 0;
    const totalRefunds = refundedSum._sum.totalCents ?? 0;

    return NextResponse.json({
      data: orders.map((o) => ({
        id: o.id,
        orderNumber: o.orderNumber,
        email: o.user?.email || o.guestEmail || "N/A",
        customerName: o.user ? `${o.user.firstName} ${o.user.lastName}` : "Guest",
        totalCents: o.totalCents,
        paymentStatus: o.paymentStatus,
        paymentProvider: o.paymentProvider || (o.stripePaymentId ? "paystack" : "unknown"),
        orderStatus: o.status,
        currency: o.currency,
        createdAt: o.createdAt,
        type: o.paymentStatus === "REFUNDED" ? "Refund" : "Payment",
      })),
      pagination: { page, pageSize, total, totalPages: Math.ceil(total / pageSize) },
      summary: {
        totalRevenue,
        totalRefunds,
        netRevenue: totalRevenue - totalRefunds,
        totalTransactions: totalOrders,
      },
    });
  } catch (err) {
    console.error("Transactions error:", err);
    return NextResponse.json({ error: "Failed to fetch transactions" }, { status: 500 });
  }
}
