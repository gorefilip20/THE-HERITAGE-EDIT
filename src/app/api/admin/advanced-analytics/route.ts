import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const period = searchParams.get("period") || "30days";

    // Determine date range based on period
    const now = new Date();
    const startDate = new Date();
    switch (period) {
      case "7days":
        startDate.setDate(now.getDate() - 7);
        break;
      case "30days":
        startDate.setDate(now.getDate() - 30);
        break;
      case "90days":
        startDate.setDate(now.getDate() - 90);
        break;
      case "1year":
        startDate.setFullYear(now.getFullYear() - 1);
        break;
      default:
        startDate.setDate(now.getDate() - 30);
    }

    // --- Revenue over time (last 6 months) ---
    const sixMonthsAgo = new Date();
    sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6);

    const revenueOrders = await prisma.order.findMany({
      where: {
        paymentStatus: "CAPTURED",
        createdAt: { gte: sixMonthsAgo },
      },
      select: {
        totalCents: true,
        createdAt: true,
      },
    });

    const revenueByMonth: Record<string, number> = {};
    const orderCountByMonth: Record<string, number> = {};
    for (let i = 5; i >= 0; i--) {
      const d = new Date();
      d.setMonth(d.getMonth() - i);
      const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`;
      revenueByMonth[key] = 0;
      orderCountByMonth[key] = 0;
    }

    for (const order of revenueOrders) {
      const d = new Date(order.createdAt);
      const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`;
      if (key in revenueByMonth) {
        revenueByMonth[key] += order.totalCents;
        orderCountByMonth[key] += 1;
      }
    }

    const revenueOverTime = Object.entries(revenueByMonth).map(([month, revenue]) => ({
      month,
      revenue,
      label: new Date(month + "-01").toLocaleDateString("en-US", {
        month: "short",
        year: "numeric",
      }),
    }));

    // --- Average order value trend ---
    const avgOrderValueTrend = Object.entries(revenueByMonth).map(([month, revenue]) => {
      const count = orderCountByMonth[month] || 1;
      return {
        month,
        averageOrderValue: Math.round(revenue / count),
        orderCount: orderCountByMonth[month],
        label: new Date(month + "-01").toLocaleDateString("en-US", {
          month: "short",
          year: "numeric",
        }),
      };
    });

    // --- Orders by status ---
    const ordersByStatusRaw = await prisma.order.groupBy({
      by: ["status"],
      _count: { id: true },
    });
    const ordersByStatus = ordersByStatusRaw.map((s) => ({
      status: s.status,
      count: s._count.id,
    }));

    // --- Top products ---
    const topProductsRaw = await prisma.orderItem.groupBy({
      by: ["productId"],
      _sum: { totalCents: true },
      _count: { id: true },
      orderBy: { _sum: { totalCents: "desc" } },
      take: 10,
    });

    const productIds = topProductsRaw.map((p) => p.productId);
    const products = await prisma.product.findMany({
      where: { id: { in: productIds } },
      select: { id: true, name: true, slug: true },
    });
    const productMap = new Map(products.map((p) => [p.id, p]));

    const topProducts = topProductsRaw.map((p) => ({
      productId: p.productId,
      name: productMap.get(p.productId)?.name ?? "Unknown Product",
      slug: productMap.get(p.productId)?.slug ?? "",
      revenue: p._sum.totalCents ?? 0,
      unitsSold: p._count.id,
    }));

    // --- Customer stats ---
    const thisMonthStart = new Date(now.getFullYear(), now.getMonth(), 1);

    const [totalCustomers, newCustomersThisMonth] = await Promise.all([
      prisma.user.count({ where: { role: "CUSTOMER" } }),
      prisma.user.count({
        where: { role: "CUSTOMER", createdAt: { gte: thisMonthStart } },
      }),
    ]);

    // Returning customers: users with more than 1 order
    const returningCustomersRaw = await prisma.order.groupBy({
      by: ["userId"],
      _count: { id: true },
      having: { id: { _count: { gt: 1 } } },
    });
    const returningCustomers = returningCustomersRaw.filter(
      (r) => r.userId !== null
    ).length;

    const customerStats = {
      totalCustomers,
      newThisMonth: newCustomersThisMonth,
      returning: returningCustomers,
    };

    // --- Payment method split ---
    const allOrdersForPayment = await prisma.order.findMany({
      where: { createdAt: { gte: startDate } },
      select: { stripePaymentId: true },
    });

    let paystackCount = 0;
    let flutterwaveCount = 0;
    let unknownCount = 0;

    for (const o of allOrdersForPayment) {
      if (o.stripePaymentId?.startsWith("FLW_")) {
        flutterwaveCount++;
      } else if (o.stripePaymentId) {
        paystackCount++;
      } else {
        unknownCount++;
      }
    }

    const paymentMethodSplit = [
      { method: "Paystack", count: paystackCount },
      { method: "Flutterwave", count: flutterwaveCount },
      ...(unknownCount > 0 ? [{ method: "Unknown", count: unknownCount }] : []),
    ];

    // --- Customer Lifetime Value from real orders ---
    const clvData = await prisma.order.groupBy({
      by: ["userId"],
      where: { paymentStatus: "CAPTURED", userId: { not: null } },
      _sum: { totalCents: true },
    });

    const clvValues = clvData
      .map((c) => c._sum.totalCents ?? 0)
      .sort((a, b) => a - b);

    const clvAverage =
      clvValues.length > 0
        ? Math.round(clvValues.reduce((a, b) => a + b, 0) / clvValues.length)
        : 0;
    const clvMedian =
      clvValues.length > 0
        ? clvValues[Math.floor(clvValues.length / 2)]
        : 0;
    const top10Index = Math.floor(clvValues.length * 0.9);
    const clvTop10 =
      clvValues.length > 0 ? clvValues[top10Index] ?? clvValues[clvValues.length - 1] : 0;

    const clvBuckets = [
      { range: "NGN 0-NGN 50K", min: 0, max: 5000000 },
      { range: "NGN 50K-NGN 100K", min: 5000000, max: 10000000 },
      { range: "NGN 100K-NGN 250K", min: 10000000, max: 25000000 },
      { range: "NGN 250K+", min: 25000000, max: Infinity },
    ];
    const clvDistribution = clvBuckets.map((bucket) => {
      const count = clvValues.filter(
        (v) => v >= bucket.min && v < bucket.max
      ).length;
      return {
        range: bucket.range,
        count,
        percentage:
          clvValues.length > 0 ? Math.round((count / clvValues.length) * 100) : 0,
      };
    });

    // --- Conversion funnel (order-based, since we have no page-view data) ---
    const [ordersCreated, paymentAuthorized, paymentCaptured, shipped, delivered] =
      await Promise.all([
        prisma.order.count({ where: { createdAt: { gte: startDate } } }),
        prisma.order.count({
          where: {
            paymentStatus: { in: ["AUTHORIZED", "CAPTURED"] },
            createdAt: { gte: startDate },
          },
        }),
        prisma.order.count({
          where: { paymentStatus: "CAPTURED", createdAt: { gte: startDate } },
        }),
        prisma.order.count({
          where: {
            status: { in: ["SHIPPED", "DELIVERED"] },
            createdAt: { gte: startDate },
          },
        }),
        prisma.order.count({
          where: { status: "DELIVERED", createdAt: { gte: startDate } },
        }),
      ]);

    const totalCreated = ordersCreated || 1;
    const funnelSteps = [
      { name: "Orders Created", count: ordersCreated, conversionRate: 100 },
      {
        name: "Payment Authorized",
        count: paymentAuthorized,
        conversionRate: Math.round((paymentAuthorized / totalCreated) * 1000) / 10,
      },
      {
        name: "Payment Captured",
        count: paymentCaptured,
        conversionRate: Math.round((paymentCaptured / totalCreated) * 1000) / 10,
      },
      {
        name: "Shipped",
        count: shipped,
        conversionRate: Math.round((shipped / totalCreated) * 1000) / 10,
      },
      {
        name: "Delivered",
        count: delivered,
        conversionRate: Math.round((delivered / totalCreated) * 1000) / 10,
      },
    ];
    const dropOffRate =
      Math.round(((ordersCreated - delivered) / totalCreated) * 1000) / 10;

    // --- Customer segmentation ---
    const customerSegmentation = await buildCustomerSegmentation();

    // --- Cohort analysis ---
    const cohortAnalysis = await buildCohortAnalysis(now);

    // --- Build response keeping same shape for existing page compatibility ---
    const analytics = {
      customerLifetimeValue: {
        average: clvAverage,
        median: clvMedian,
        top10Percent: clvTop10,
        distribution: clvDistribution,
      },

      conversionFunnel: {
        steps: funnelSteps,
        dropOffRate,
      },

      customerSegmentation,

      demandForecast: {
        nextMonth: {
          projectedRevenue:
            revenueOverTime.length > 0
              ? revenueOverTime[revenueOverTime.length - 1].revenue
              : 0,
          confidence: 0.65,
          trend:
            revenueOverTime.length >= 2
              ? revenueOverTime[revenueOverTime.length - 1].revenue >
                revenueOverTime[revenueOverTime.length - 2].revenue
                ? "up"
                : "down"
              : "stable",
          trendPercentage:
            revenueOverTime.length >= 2
              ? Math.abs(
                  Math.round(
                    ((revenueOverTime[revenueOverTime.length - 1].revenue -
                      revenueOverTime[revenueOverTime.length - 2].revenue) /
                      (revenueOverTime[revenueOverTime.length - 2].revenue || 1)) *
                      100
                  )
                )
              : 0,
        },
        topProducts: topProducts.slice(0, 5).map((p) => ({
          name: p.name,
          projected: p.unitsSold,
          trend: "stable" as const,
        })),
        seasonalTrends: {
          peak: ["December", "August", "June"],
          low: ["February", "September"],
        },
      },

      cohortAnalysis,

      productPerformance: topProducts.map((p, i) => ({
        id: String(i + 1),
        name: p.name,
        revenue: p.revenue,
        units: p.unitsSold,
        margin: 0,
        trend: "stable",
        roi: 0,
      })),

      marketBasketAnalysis: [] as Array<{
        product1: string;
        product2: string;
        frequency: number;
        confidence: number;
        lift: number;
      }>,

      churnPrediction: {
        atRiskCustomers: 0,
        predictedChurn: 0,
        churnRate: 0,
        topChurnReasons: [] as Array<{ reason: string; count: number }>,
      },

      // Additional real data fields for enhanced pages
      revenueOverTime,
      ordersByStatus,
      topProducts,
      customerStats,
      avgOrderValueTrend,
      paymentMethodSplit,
    };

    return NextResponse.json({
      success: true,
      period,
      analytics,
    });
  } catch (error) {
    console.error("Analytics error:", error);
    return NextResponse.json(
      { error: "Failed to fetch analytics" },
      { status: 500 }
    );
  }
}

async function buildCustomerSegmentation() {
  const customerOrders = await prisma.order.groupBy({
    by: ["userId"],
    where: { userId: { not: null }, paymentStatus: "CAPTURED" },
    _sum: { totalCents: true },
    _count: { id: true },
  });

  let vip = 0,
    regular = 0,
    occasional = 0,
    newCust = 0;
  let vipTotal = 0,
    regularTotal = 0,
    occasionalTotal = 0,
    newTotal = 0;
  let vipRepeat = 0,
    regularRepeat = 0;

  for (const c of customerOrders) {
    const total = c._sum.totalCents ?? 0;
    const count = c._count.id;
    const avg = count > 0 ? total / count : 0;

    if (count >= 5 || total >= 25000000) {
      vip++;
      vipTotal += avg;
      if (count > 1) vipRepeat++;
    } else if (count >= 3) {
      regular++;
      regularTotal += avg;
      if (count > 1) regularRepeat++;
    } else if (count === 2) {
      occasional++;
      occasionalTotal += avg;
    } else {
      newCust++;
      newTotal += avg;
    }
  }

  return [
    {
      segment: "VIP Customers",
      count: vip,
      avgOrderValue: vip > 0 ? Math.round(vipTotal / vip) : 0,
      repeatPurchaseRate: vip > 0 ? Math.round((vipRepeat / vip) * 100) : 0,
      churnRisk: 5,
    },
    {
      segment: "Regular Customers",
      count: regular,
      avgOrderValue: regular > 0 ? Math.round(regularTotal / regular) : 0,
      repeatPurchaseRate:
        regular > 0 ? Math.round((regularRepeat / regular) * 100) : 0,
      churnRisk: 20,
    },
    {
      segment: "Occasional Buyers",
      count: occasional,
      avgOrderValue:
        occasional > 0 ? Math.round(occasionalTotal / occasional) : 0,
      repeatPurchaseRate: 100,
      churnRisk: 45,
    },
    {
      segment: "New Customers",
      count: newCust,
      avgOrderValue: newCust > 0 ? Math.round(newTotal / newCust) : 0,
      repeatPurchaseRate: 0,
      churnRisk: 35,
    },
  ];
}

async function buildCohortAnalysis(now: Date) {
  const cohorts = [];

  for (let i = 3; i >= 0; i--) {
    const cohortStart = new Date(now.getFullYear(), now.getMonth() - i, 1);
    const cohortEnd = new Date(now.getFullYear(), now.getMonth() - i + 1, 0);
    const label = cohortStart.toLocaleDateString("en-US", {
      month: "short",
      year: "numeric",
    });

    const usersInCohort = await prisma.user.findMany({
      where: {
        role: "CUSTOMER",
        createdAt: { gte: cohortStart, lte: cohortEnd },
      },
      select: { id: true },
    });
    const userIds = usersInCohort.map((u) => u.id);
    const size = userIds.length;

    if (size === 0) {
      cohorts.push({
        cohort: label,
        size: 0,
        week1: 0,
        week4: 0,
        week12: 0,
        retention: 0,
      });
      continue;
    }

    const week1End = new Date(cohortStart);
    week1End.setDate(week1End.getDate() + 7);
    const week1 = await prisma.order.count({
      where: {
        userId: { in: userIds },
        createdAt: { gte: cohortStart, lte: week1End },
      },
    });

    const week4End = new Date(cohortStart);
    week4End.setDate(week4End.getDate() + 28);
    const week4 = await prisma.order.count({
      where: {
        userId: { in: userIds },
        createdAt: { gte: cohortStart, lte: week4End },
      },
    });

    const week12End = new Date(cohortStart);
    week12End.setDate(week12End.getDate() + 84);
    const hasWeek12 = week12End <= now;
    const week12 = hasWeek12
      ? await prisma.order.count({
          where: {
            userId: { in: userIds },
            createdAt: { gte: cohortStart, lte: week12End },
          },
        })
      : null;

    const retention =
      hasWeek12 && size > 0
        ? Math.round(((week12 ?? 0) / size) * 100 * 10) / 10
        : null;

    cohorts.push({
      cohort: label,
      size,
      week1,
      week4,
      week12,
      retention,
    });
  }

  return cohorts;
}
