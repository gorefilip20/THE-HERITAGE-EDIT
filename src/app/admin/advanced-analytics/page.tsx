"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import {
  TrendingUp,
  Users,
  ShoppingCart,
  AlertTriangle,
  BarChart3,
  PieChart,
} from "lucide-react";

interface AdvancedAnalytics {
  customerLifetimeValue: any;
  conversionFunnel: any;
  customerSegmentation: any[];
  demandForecast: any;
  cohortAnalysis: any[];
  productPerformance: any[];
  marketBasketAnalysis: any[];
  churnPrediction: any;
}

export default function AdvancedAnalyticsDashboard() {
  const [analytics, setAnalytics] = useState<AdvancedAnalytics | null>(null);
  const [loading, setLoading] = useState(true);
  const [period, setPeriod] = useState("30days");

  useEffect(() => {
    fetch(`/api/admin/advanced-analytics?period=${period}`)
      .then((r) => r.json())
      .then((d) => setAnalytics(d.analytics))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [period]);

  if (loading) {
    return <div className="text-center py-12">Loading analytics...</div>;
  }

  if (!analytics) {
    return <div className="text-center py-12">Failed to load analytics</div>;
  }

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-display-md font-serif italic text-obsidian mb-2">
            Advanced Analytics
          </h1>
          <p className="text-[13px] font-sans text-neutral-500">
            Deep insights into customer behavior and business performance
          </p>
        </div>
        <select
          value={period}
          onChange={(e) => setPeriod(e.target.value)}
          className="px-4 py-2 border border-slate-border rounded-lg text-[12px] font-sans"
        >
          <option value="7days">Last 7 days</option>
          <option value="30days">Last 30 days</option>
          <option value="90days">Last 90 days</option>
          <option value="1year">Last year</option>
        </select>
      </div>

      {/* CLV Overview */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-white border border-slate-border rounded-lg p-6"
      >
        <div className="flex items-center gap-3 mb-6">
          <Users size={20} className="text-blue-600" />
          <h2 className="text-lg font-serif text-obsidian">Customer Lifetime Value</h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <div>
            <p className="text-[11px] font-sans text-neutral-500 mb-2">Average CLV</p>
            <p className="text-2xl font-serif text-obsidian">
              ₦{(analytics.customerLifetimeValue.average / 1000).toFixed(0)}K
            </p>
          </div>
          <div>
            <p className="text-[11px] font-sans text-neutral-500 mb-2">Median CLV</p>
            <p className="text-2xl font-serif text-obsidian">
              ₦{(analytics.customerLifetimeValue.median / 1000).toFixed(0)}K
            </p>
          </div>
          <div>
            <p className="text-[11px] font-sans text-neutral-500 mb-2">Top 10% CLV</p>
            <p className="text-2xl font-serif text-obsidian">
              ₦{(analytics.customerLifetimeValue.top10Percent / 1000).toFixed(0)}K
            </p>
          </div>
          <div>
            <p className="text-[11px] font-sans text-neutral-500 mb-2">Distribution</p>
            <div className="flex gap-1">
              {analytics.customerLifetimeValue.distribution.map((d: any) => (
                <div
                  key={d.range}
                  className="flex-1 h-8 bg-blue-500 rounded opacity-75 hover:opacity-100 transition-opacity"
                  title={`${d.range}: ${d.percentage}%`}
                />
              ))}
            </div>
          </div>
        </div>

        {/* CLV Distribution Table */}
        <table className="w-full text-[12px]">
          <thead className="bg-neutral-50">
            <tr>
              <th className="px-4 py-2 text-left font-medium">Range</th>
              <th className="px-4 py-2 text-left font-medium">Customers</th>
              <th className="px-4 py-2 text-left font-medium">Percentage</th>
            </tr>
          </thead>
          <tbody>
            {analytics.customerLifetimeValue.distribution.map((d: any) => (
              <tr key={d.range} className="border-t border-slate-border">
                <td className="px-4 py-3">{d.range}</td>
                <td className="px-4 py-3">{d.count.toLocaleString()}</td>
                <td className="px-4 py-3">{d.percentage}%</td>
              </tr>
            ))}
          </tbody>
        </table>
      </motion.div>

      {/* Conversion Funnel */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="bg-white border border-slate-border rounded-lg p-6"
      >
        <div className="flex items-center gap-3 mb-6">
          <ShoppingCart size={20} className="text-green-600" />
          <h2 className="text-lg font-serif text-obsidian">Conversion Funnel</h2>
        </div>

        <div className="space-y-4">
          {analytics.conversionFunnel.steps.map((step: any, idx: number) => (
            <div key={idx}>
              <div className="flex items-center justify-between mb-2">
                <span className="text-[12px] font-sans font-medium">{step.name}</span>
                <span className="text-[11px] font-sans text-neutral-500">
                  {step.count.toLocaleString()} ({step.conversionRate.toFixed(1)}%)
                </span>
              </div>
              <div className="w-full h-8 bg-neutral-100 rounded overflow-hidden">
                <div
                  className="h-full bg-gradient-to-r from-green-400 to-green-600 transition-all"
                  style={{ width: `${step.conversionRate}%` }}
                />
              </div>
            </div>
          ))}
        </div>

        <div className="mt-6 p-4 bg-red-50 border border-red-200 rounded-lg">
          <div className="flex items-start gap-2">
            <AlertTriangle size={16} className="text-red-600 mt-0.5" />
            <div>
              <p className="text-[12px] font-sans font-medium text-red-900">
                Drop-off Rate: {analytics.conversionFunnel.dropOffRate}%
              </p>
              <p className="text-[11px] font-sans text-red-700 mt-1">
                Optimize cart abandonment recovery and checkout flow
              </p>
            </div>
          </div>
        </div>
      </motion.div>

      {/* Customer Segmentation */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="bg-white border border-slate-border rounded-lg p-6"
      >
        <div className="flex items-center gap-3 mb-6">
          <PieChart size={20} className="text-purple-600" />
          <h2 className="text-lg font-serif text-obsidian">Customer Segmentation</h2>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-[12px]">
            <thead className="bg-neutral-50">
              <tr>
                <th className="px-4 py-3 text-left font-medium">Segment</th>
                <th className="px-4 py-3 text-left font-medium">Count</th>
                <th className="px-4 py-3 text-left font-medium">Avg Order Value</th>
                <th className="px-4 py-3 text-left font-medium">Repeat Rate</th>
                <th className="px-4 py-3 text-left font-medium">Churn Risk</th>
              </tr>
            </thead>
            <tbody>
              {analytics.customerSegmentation.map((seg: any) => (
                <tr key={seg.segment} className="border-t border-slate-border hover:bg-neutral-50">
                  <td className="px-4 py-3 font-medium">{seg.segment}</td>
                  <td className="px-4 py-3">{seg.count.toLocaleString()}</td>
                  <td className="px-4 py-3">₦{(seg.avgOrderValue / 1000).toFixed(0)}K</td>
                  <td className="px-4 py-3">{seg.repeatPurchaseRate}%</td>
                  <td className="px-4 py-3">
                    <span
                      className={`px-2 py-1 rounded text-[10px] font-semibold ${
                        seg.churnRisk > 70
                          ? "bg-red-100 text-red-700"
                          : seg.churnRisk > 40
                          ? "bg-yellow-100 text-yellow-700"
                          : "bg-green-100 text-green-700"
                      }`}
                    >
                      {seg.churnRisk}%
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </motion.div>

      {/* Demand Forecast */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
        className="bg-white border border-slate-border rounded-lg p-6"
      >
        <div className="flex items-center gap-3 mb-6">
          <TrendingUp size={20} className="text-orange-600" />
          <h2 className="text-lg font-serif text-obsidian">Demand Forecast (Next Month)</h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div>
            <p className="text-[11px] font-sans text-neutral-500 mb-2">Projected Revenue</p>
            <p className="text-2xl font-serif text-obsidian">
              ₦{(analytics.demandForecast.nextMonth.projectedRevenue / 1000000).toFixed(1)}M
            </p>
          </div>
          <div>
            <p className="text-[11px] font-sans text-neutral-500 mb-2">Confidence Level</p>
            <p className="text-2xl font-serif text-obsidian">
              {(analytics.demandForecast.nextMonth.confidence * 100).toFixed(0)}%
            </p>
          </div>
          <div>
            <p className="text-[11px] font-sans text-neutral-500 mb-2">Trend</p>
            <p className="text-2xl font-serif text-green-600">
              ↑ {analytics.demandForecast.nextMonth.trendPercentage}%
            </p>
          </div>
        </div>

        <div>
          <h3 className="text-[12px] font-sans font-medium text-obsidian mb-4">Top Products</h3>
          <div className="space-y-3">
            {analytics.demandForecast.topProducts.map((product: any) => (
              <div key={product.name} className="flex items-center justify-between">
                <span className="text-[12px] font-sans">{product.name}</span>
                <div className="flex items-center gap-2">
                  <span className="text-[11px] font-sans text-neutral-500">
                    {product.projected} units
                  </span>
                  <span
                    className={`text-[10px] font-semibold ${
                      product.trend === "up"
                        ? "text-green-600"
                        : product.trend === "down"
                        ? "text-red-600"
                        : "text-neutral-500"
                    }`}
                  >
                    {product.trend === "up" ? "↑" : product.trend === "down" ? "↓" : "→"}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </motion.div>

      {/* Churn Prediction */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4 }}
        className="bg-white border border-slate-border rounded-lg p-6"
      >
        <div className="flex items-center gap-3 mb-6">
          <AlertTriangle size={20} className="text-red-600" />
          <h2 className="text-lg font-serif text-obsidian">Churn Prediction</h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div>
            <p className="text-[11px] font-sans text-neutral-500 mb-2">At-Risk Customers</p>
            <p className="text-2xl font-serif text-red-600">
              {analytics.churnPrediction.atRiskCustomers}
            </p>
          </div>
          <div>
            <p className="text-[11px] font-sans text-neutral-500 mb-2">Predicted Churn</p>
            <p className="text-2xl font-serif text-red-600">
              {analytics.churnPrediction.predictedChurn}
            </p>
          </div>
          <div>
            <p className="text-[11px] font-sans text-neutral-500 mb-2">Churn Rate</p>
            <p className="text-2xl font-serif text-red-600">
              {analytics.churnPrediction.churnRate}%
            </p>
          </div>
        </div>

        <div>
          <h3 className="text-[12px] font-sans font-medium text-obsidian mb-4">
            Top Churn Reasons
          </h3>
          <div className="space-y-3">
            {analytics.churnPrediction.topChurnReasons.map((reason: any) => (
              <div key={reason.reason} className="flex items-center justify-between">
                <span className="text-[12px] font-sans">{reason.reason}</span>
                <span className="text-[11px] font-sans text-neutral-500">
                  {reason.count} customers
                </span>
              </div>
            ))}
          </div>
        </div>
      </motion.div>
    </div>
  );
}
