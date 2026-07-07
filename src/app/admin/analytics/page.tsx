"use client";

import { useEffect, useState } from "react";
import { BarChart3, TrendingUp, DollarSign, ShoppingBag, Users, Package } from "lucide-react";
import { formatPrice } from "@/lib/utils";

interface AnalyticsData {
  totalRevenueCents: number;
  orderCount: number;
  averageOrderValueCents: number;
  conversionRate: number;
  topProducts: Array<{ name: string; revenue: number; units: number }>;
}

export default function AnalyticsPage() {
  const [data, setData] = useState<AnalyticsData | null>(null);
  const [loading, setLoading] = useState(true);
  const [period, setPeriod] = useState("30d");

  useEffect(() => {
    fetchAnalytics();
  }, [period]);

  async function fetchAnalytics() {
    setLoading(true);
    try {
      const res = await fetch("/api/admin/metrics");
      if (res.ok) {
        const metrics = await res.json();
        setData(metrics);
      }
    } catch (err) {
      console.error("Failed to fetch analytics:", err);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-serif text-neutral-900 mb-1">Analytics</h1>
          <p className="text-sm text-neutral-500">Track your store performance and growth</p>
        </div>
        <select
          value={period}
          onChange={(e) => setPeriod(e.target.value)}
          className="h-9 px-3 rounded-lg border border-neutral-200 bg-white text-sm focus:outline-none focus:border-[#0D2C22]"
        >
          <option value="7d">Last 7 days</option>
          <option value="30d">Last 30 days</option>
          <option value="90d">Last 90 days</option>
          <option value="all">All time</option>
        </select>
      </div>

      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {[...Array(6)].map((_, i) => (
            <div key={i} className="h-28 bg-white rounded-xl border border-neutral-200 animate-pulse" />
          ))}
        </div>
      ) : (
        <div className="space-y-6">
          {/* Key Metrics */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="p-5 bg-white rounded-xl border border-neutral-200 shadow-sm">
              <div className="flex items-center gap-2 mb-3">
                <div className="p-2 rounded-lg bg-emerald-100">
                  <DollarSign size={14} className="text-emerald-600" />
                </div>
                <span className="text-xs font-medium text-neutral-500">Revenue</span>
              </div>
              <p className="text-2xl font-semibold text-neutral-900">{formatPrice(data?.totalRevenueCents || 0)}</p>
            </div>
            <div className="p-5 bg-white rounded-xl border border-neutral-200 shadow-sm">
              <div className="flex items-center gap-2 mb-3">
                <div className="p-2 rounded-lg bg-blue-100">
                  <ShoppingBag size={14} className="text-blue-600" />
                </div>
                <span className="text-xs font-medium text-neutral-500">Orders</span>
              </div>
              <p className="text-2xl font-semibold text-neutral-900">{data?.orderCount || 0}</p>
            </div>
            <div className="p-5 bg-white rounded-xl border border-neutral-200 shadow-sm">
              <div className="flex items-center gap-2 mb-3">
                <div className="p-2 rounded-lg bg-purple-100">
                  <TrendingUp size={14} className="text-purple-600" />
                </div>
                <span className="text-xs font-medium text-neutral-500">Avg Order Value</span>
              </div>
              <p className="text-2xl font-semibold text-neutral-900">{formatPrice(data?.averageOrderValueCents || 0)}</p>
            </div>
            <div className="p-5 bg-white rounded-xl border border-neutral-200 shadow-sm">
              <div className="flex items-center gap-2 mb-3">
                <div className="p-2 rounded-lg bg-amber-100">
                  <Users size={14} className="text-amber-600" />
                </div>
                <span className="text-xs font-medium text-neutral-500">Conversion</span>
              </div>
              <p className="text-2xl font-semibold text-neutral-900">{(data?.conversionRate || 0).toFixed(2)}%</p>
            </div>
          </div>

          {/* Top Products Table */}
          <div className="bg-white rounded-xl border border-neutral-200 shadow-sm overflow-hidden">
            <div className="px-5 py-4 border-b border-neutral-100 flex items-center gap-2">
              <BarChart3 size={16} className="text-neutral-400" />
              <h3 className="text-sm font-semibold text-neutral-800">Top Performing Products</h3>
            </div>
            <table className="w-full">
              <thead>
                <tr className="border-b border-neutral-100 bg-neutral-50/50">
                  <th className="text-left px-5 py-3 text-[10px] font-semibold tracking-[0.15em] uppercase text-neutral-400">#</th>
                  <th className="text-left px-5 py-3 text-[10px] font-semibold tracking-[0.15em] uppercase text-neutral-400">Product</th>
                  <th className="text-left px-5 py-3 text-[10px] font-semibold tracking-[0.15em] uppercase text-neutral-400">Units Sold</th>
                  <th className="text-left px-5 py-3 text-[10px] font-semibold tracking-[0.15em] uppercase text-neutral-400">Revenue</th>
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
                      <td className="px-5 py-3 text-sm font-medium text-emerald-600">{formatPrice(product.revenue)}</td>
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
