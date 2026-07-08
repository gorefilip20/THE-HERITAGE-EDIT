import { NextRequest, NextResponse } from "next/server";

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const period = searchParams.get("period") || "30days";

    // Mock advanced analytics data
    const analytics = {
      customerLifetimeValue: {
        average: 125000,
        median: 85000,
        top10Percent: 450000,
        distribution: [
          { range: "₦0-₦50K", count: 245, percentage: 35 },
          { range: "₦50K-₦100K", count: 168, percentage: 24 },
          { range: "₦100K-₦250K", count: 189, percentage: 27 },
          { range: "₦250K+", count: 98, percentage: 14 },
        ],
      },

      conversionFunnel: {
        steps: [
          { name: "Visitors", count: 45230, conversionRate: 100 },
          { name: "Product Views", count: 28450, conversionRate: 62.9 },
          { name: "Add to Cart", count: 12340, conversionRate: 43.4 },
          { name: "Checkout Started", count: 8920, conversionRate: 72.3 },
          { name: "Payment Completed", count: 6780, conversionRate: 76.0 },
        ],
        dropOffRate: 85,
      },

      customerSegmentation: [
        {
          segment: "VIP Customers",
          count: 98,
          avgOrderValue: 450000,
          repeatPurchaseRate: 87,
          churnRisk: 5,
        },
        {
          segment: "Regular Customers",
          count: 456,
          avgOrderValue: 125000,
          repeatPurchaseRate: 62,
          churnRisk: 18,
        },
        {
          segment: "Occasional Buyers",
          count: 1230,
          avgOrderValue: 65000,
          repeatPurchaseRate: 28,
          churnRisk: 42,
        },
        {
          segment: "At-Risk Customers",
          count: 234,
          avgOrderValue: 45000,
          repeatPurchaseRate: 8,
          churnRisk: 92,
        },
        {
          segment: "New Customers",
          count: 567,
          avgOrderValue: 55000,
          repeatPurchaseRate: 0,
          churnRisk: 35,
        },
      ],

      demandForecast: {
        nextMonth: {
          projectedRevenue: 8500000,
          confidence: 0.87,
          trend: "up",
          trendPercentage: 12.5,
        },
        topProducts: [
          { name: "Ankara Dress", projected: 450, trend: "up" },
          { name: "Agbada Robe", projected: 320, trend: "stable" },
          { name: "Kente Cloth", projected: 280, trend: "up" },
          { name: "Adire Fabric", projected: 210, trend: "down" },
          { name: "Beaded Accessories", projected: 190, trend: "up" },
        ],
        seasonalTrends: {
          peak: ["December", "August", "June"],
          low: ["February", "September"],
        },
      },

      cohortAnalysis: [
        {
          cohort: "Jan 2026",
          size: 234,
          week1: 89,
          week4: 67,
          week12: 45,
          retention: 19.2,
        },
        {
          cohort: "Feb 2026",
          size: 312,
          week1: 112,
          week4: 89,
          week12: 62,
          retention: 19.9,
        },
        {
          cohort: "Mar 2026",
          size: 456,
          week1: 178,
          week4: 134,
          week12: 98,
          retention: 21.5,
        },
        {
          cohort: "Apr 2026",
          size: 523,
          week1: 198,
          week4: 156,
          week12: null,
          retention: null,
        },
      ],

      productPerformance: [
        {
          id: "1",
          name: "Ankara Dress",
          revenue: 2340000,
          units: 450,
          margin: 45,
          trend: "up",
          roi: 320,
        },
        {
          id: "2",
          name: "Agbada Robe",
          revenue: 1890000,
          units: 320,
          margin: 52,
          trend: "stable",
          roi: 285,
        },
        {
          id: "3",
          name: "Kente Cloth",
          revenue: 1560000,
          units: 280,
          margin: 48,
          trend: "up",
          roi: 310,
        },
        {
          id: "4",
          name: "Adire Fabric",
          revenue: 980000,
          units: 210,
          margin: 40,
          trend: "down",
          roi: 220,
        },
        {
          id: "5",
          name: "Beaded Accessories",
          revenue: 720000,
          units: 190,
          margin: 60,
          trend: "up",
          roi: 380,
        },
      ],

      marketBasketAnalysis: [
        {
          product1: "Ankara Dress",
          product2: "Beaded Accessories",
          frequency: 234,
          confidence: 0.68,
          lift: 2.1,
        },
        {
          product1: "Agbada Robe",
          product2: "Kente Cloth",
          frequency: 189,
          confidence: 0.62,
          lift: 1.8,
        },
        {
          product1: "Ankara Dress",
          product2: "Kente Cloth",
          frequency: 156,
          confidence: 0.58,
          lift: 1.6,
        },
      ],

      churnPrediction: {
        atRiskCustomers: 234,
        predictedChurn: 45,
        churnRate: 19.2,
        topChurnReasons: [
          { reason: "Inactive for 60+ days", count: 89 },
          { reason: "No repeat purchases", count: 67 },
          { reason: "Negative review", count: 34 },
          { reason: "Switched to competitor", count: 28 },
          { reason: "Unsubscribed from emails", count: 16 },
        ],
      },
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
