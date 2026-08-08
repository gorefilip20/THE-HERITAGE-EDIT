"use client";

import { useEffect, useState } from "react";
import {
  BarChart3,
  TrendingUp,
  DollarSign,
  ShoppingBag,
  Users,
  Package,
  Eye,
  ShoppingCart,
  ArrowUpRight,
} from "lucide-react";
import { formatPrice } from "@/lib/utils";

interface AnalyticsData {
  totalRevenueCents: number;
  orderCount: number;
  averageOrderValueCents: number;
  conversionRate: number;
  topProducts: Array<{ name: string; revenue: number; units: number }>;
}

interface AdvancedData {
  revenueByDay: Array<{ date: string; revenue: number; orders: number }>;
  visitorsByDay: Array<{ date: string; visitors: number; pageViews: number }>;
  totalVisitors: number;
  totalPageViews: number;
}

export default function AnalyticsPage() {
  const [data, setData] = useState<AnalyticsData | null>(null);
  const [advanced, setAdvanced] = useState<AdvancedData | null>(null);
  const [loading, setLoading] = useState(true);
  const [period, setPeriod] = useState("30d");

  useEffect(() => {
    fetchAnalytics();
  }, [period]);

  async function fetchAnalytics() {
    setLoading(true);
    try {
      const days = period === "7d" ? 7 : period === "90d" ? 90 : 30;
      const [metricsRes, advRes] = await Promise.all([
        fetch("/api/admin/metrics"),
        fetch(`/api/admin/advanced-analytics?days=${days}`),
      ]);
      if (metricsRes.ok) setData(await metricsRes.json());
      if (advRes.ok) setAdvanced(await advRes.json());
    } catch (err) {
      console.error("Failed to fetch analytics:", err);
    } finally {
      setLoading(false);
    }
  }

  const revenueMax = Math.max(...(advanced?.revenueByDay || []).map((d) => d.revenue), 1);
  const visitorMax = Math.max(...(advanced?.visitorsByDay || []).map((d) => d.visitors), 1);

  const funnelSteps = [
    { label: "Visitors", value: advanced?.totalVisitors || 0, color: "#0D2C22" },
    { label: "Product Views", value: advanced?.totalPageViews || 0, color: "#2563eb" },
    { label: "Add to Cart", value: Math.round((advanced?.totalVisitors || 0) * (data?.conversionRate || 0) / 100 * 3), color: "#7c3aed" },
    { label: "Purchased", value: data?.orderCount || 0, color: "#059669" },
  ];
  const funnelMax = Math.max(...funnelSteps.map((s) => s.value), 1);

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-serif text-neutral-900 mb-1">Analytics</h1>
          <p className="text-sm text-neutral-500">Track your store performance and growth</p>
        </div>
        <div className="flex items-center border border-[#EAEAEA] bg-white">
          {["7d", "30d", "90d"].map((p) => (
            <button
              key={p}
              onClick={() => setPeriod(p)}
              className={`px-4 py-2 text-xs font-medium tracking-wider uppercase transition-colors ${
                period === p
                  ? "bg-[#0D2C22] text-white"
                  : "text-neutral-500 hover:text-neutral-800"
              }`}
            >
              {p === "7d" ? "7 Days" : p === "30d" ? "30 Days" : "90 Days"}
            </button>
          ))}
        </div>
      </div>

      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="h-28 bg-white rounded-xl border border-[#EAEAEA] animate-pulse" />
          ))}
        </div>
      ) : (
        <div className="space-y-6">
          {/* Quick Stats */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="p-5 bg-white rounded-xl border border-[#EAEAEA] shadow-sm">
              <div className="flex items-center gap-2 mb-3">
                <div className="p-2 rounded-lg bg-emerald-100">
                  <DollarSign size={14} className="text-emerald-600" />
                </div>
                <span className="text-xs font-medium text-neutral-500">Revenue</span>
              </div>
              <p className="text-2xl font-serif font-semibold text-neutral-900">{formatPrice(data?.totalRevenueCents || 0)}</p>
            </div>
            <div className="p-5 bg-white rounded-xl border border-[#EAEAEA] shadow-sm">
              <div className="flex items-center gap-2 mb-3">
                <div className="p-2 rounded-lg bg-blue-100">
                  <ShoppingBag size={14} className="text-blue-600" />
                </div>
                <span className="text-xs font-medium text-neutral-500">Orders</span>
              </div>
              <p className="text-2xl font-serif font-semibold text-neutral-900">{data?.orderCount || 0}</p>
            </div>
            <div className="p-5 bg-white rounded-xl border border-[#EAEAEA] shadow-sm">
              <div className="flex items-center gap-2 mb-3">
                <div className="p-2 rounded-lg bg-purple-100">
                  <Eye size={14} className="text-purple-600" />
                </div>
                <span className="text-xs font-medium text-neutral-500">Visitors</span>
              </div>
              <p className="text-2xl font-serif font-semibold text-neutral-900">{(advanced?.totalVisitors || 0).toLocaleString()}</p>
            </div>
            <div className="p-5 bg-white rounded-xl border border-[#EAEAEA] shadow-sm">
              <div className="flex items-center gap-2 mb-3">
                <div className="p-2 rounded-lg bg-amber-100">
                  <TrendingUp size={14} className="text-amber-600" />
                </div>
                <span className="text-xs font-medium text-neutral-500">Conversion Rate</span>
              </div>
              <p className="text-2xl font-serif font-semibold text-neutral-900">{(data?.conversionRate || 0).toFixed(2)}%</p>
            </div>
          </div>

          {/* Revenue + Visitors Bar Charts */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Revenue Chart */}
            <div className="bg-white rounded-xl border border-[#EAEAEA] shadow-sm overflow-hidden">
              <div className="px-5 py-4 border-b border-neutral-100">
                <h3 className="text-sm font-serif font-semibold text-neutral-800">Revenue</h3>
              </div>
              <div className="p-5">
                <div className="flex items-end gap-1 h-48">
                  {(advanced?.revenueByDay || []).map((day, i) => (
                    <div key={i} className="flex-1 flex flex-col items-center gap-1 group">
                      <div className="w-full relative">
                        <div
                          className="w-full bg-emerald-500 rounded-t transition-all hover:bg-emerald-600"
                          style={{ height: `${Math.max((day.revenue / revenueMax) * 160, 2)}px` }}
                        />
                      </div>
                      <span className="text-[8px] text-neutral-400 whitespace-nowrap">
                        {new Date(day.date).toLocaleDateString("en-GB", { day: "numeric", month: "short" })}
                      </span>
                    </div>
                  ))}
                  {(advanced?.revenueByDay || []).length === 0 && (
                    <div className="flex-1 flex items-center justify-center h-full">
                      <p className="text-xs text-neutral-400">No revenue data</p>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Visitors Chart */}
            <div className="bg-white rounded-xl border border-[#EAEAEA] shadow-sm overflow-hidden">
              <div className="px-5 py-4 border-b border-neutral-100">
                <h3 className="text-sm font-serif font-semibold text-neutral-800">Visitors</h3>
              </div>
              <div className="p-5">
                <div className="flex items-end gap-1 h-48">
                  {(advanced?.visitorsByDay || []).map((day, i) => (
                    <div key={i} className="flex-1 flex flex-col items-center gap-1">
                      <div className="w-full relative">
                        <div
                          className="w-full bg-blue-500 rounded-t transition-all hover:bg-blue-600"
                          style={{ height: `${Math.max((day.visitors / visitorMax) * 160, 2)}px` }}
                        />
                      </div>
                      <span className="text-[8px] text-neutral-400 whitespace-nowrap">
                        {new Date(day.date).toLocaleDateString("en-GB", { day: "numeric", month: "short" })}
                      </span>
                    </div>
                  ))}
                  {(advanced?.visitorsByDay || []).length === 0 && (
                    <div className="flex-1 flex items-center justify-center h-full">
                      <p className="text-xs text-neutral-400">No visitor data</p>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Conversion Funnel */}
          <div className="bg-white rounded-xl border border-[#EAEAEA] shadow-sm overflow-hidden">
            <div className="px-5 py-4 border-b border-neutral-100">
              <h3 className="text-sm font-serif font-semibold text-neutral-800">Conversion Funnel</h3>
            </div>
            <div className="p-5">
              <div className="space-y-3">
                {funnelSteps.map((step, i) => {
                  const barWidth = Math.max((step.value / funnelMax) * 100, step.value > 0 ? 4 : 0);
                  const prevValue = i > 0 ? funnelSteps[i - 1].value : step.value;
                  const dropRate = prevValue > 0 && i > 0 ? ((1 - step.value / prevValue) * 100).toFixed(0) : null;
                  return (
                    <div key={step.label} className="flex items-center gap-4">
                      <span className="text-xs font-medium text-neutral-500 w-28 shrink-0">{step.label}</span>
                      <div className="flex-1 h-8 bg-neutral-50 rounded relative overflow-hidden">
                        <div
                          className="h-full rounded transition-all duration-500"
                          style={{ width: `${barWidth}%`, backgroundColor: step.color }}
                        />
                      </div>
                      <div className="text-right shrink-0 w-24">
                        <span className="text-sm font-semibold text-neutral-800">{step.value.toLocaleString()}</span>
                        {dropRate && (
                          <span className="text-[10px] text-red-500 ml-1">-{dropRate}%</span>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>

          {/* Top Products Table */}
          <div className="bg-white rounded-xl border border-[#EAEAEA] shadow-sm overflow-hidden">
            <div className="px-5 py-4 border-b border-neutral-100">
              <h3 className="text-sm font-serif font-semibold text-neutral-800">Top Performing Products</h3>
            </div>
            <table className="w-full">
              <thead>
                <tr className="border-b border-neutral-100 bg-neutral-50/50">
                  <th className="text-left px-5 py-3 text-[10px] font-bold tracking-[0.15em] uppercase text-neutral-400">#</th>
                  <th className="text-left px-5 py-3 text-[10px] font-bold tracking-[0.15em] uppercase text-neutral-400">Product</th>
                  <th className="text-left px-5 py-3 text-[10px] font-bold tracking-[0.15em] uppercase text-neutral-400">Units Sold</th>
                  <th className="text-right px-5 py-3 text-[10px] font-bold tracking-[0.15em] uppercase text-neutral-400">Revenue</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-neutral-100">
                {(data?.topProducts || []).length === 0 ? (
                  <tr>
                    <td colSpan={4} className="px-5 py-12 text-center">
                      <Package className="h-8 w-8 text-neutral-300 mx-auto mb-2" />
                      <p className="text-sm text-neutral-400">No sales data available yet</p>
                    </td>
                  </tr>
                ) : (
                  data?.topProducts.map((product, idx) => (
                    <tr key={idx} className="hover:bg-neutral-50 transition-colors">
                      <td className="px-5 py-3 text-sm font-bold text-neutral-300">{idx + 1}</td>
                      <td className="px-5 py-3 text-sm font-medium text-neutral-800">{product.name}</td>
                      <td className="px-5 py-3 text-sm text-neutral-600">{product.units}</td>
                      <td className="px-5 py-3 text-sm font-medium text-emerald-600 text-right">{formatPrice(product.revenue)}</td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
