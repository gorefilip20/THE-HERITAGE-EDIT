"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { ArrowUpRight, Package, ShoppingCart, DollarSign, TrendingUp } from "lucide-react";

interface VendorMetrics {
  totalRevenue: number;
  totalOrders: number;
  activeProducts: number;
  conversionRate: number;
  recentOrders: any[];
  topProducts: any[];
}

export default function VendorDashboard() {
  const [metrics, setMetrics] = useState<VendorMetrics | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/vendor/metrics")
      .then((r) => r.json())
      .then((d) => setMetrics(d))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return <div className="text-center py-12">Loading...</div>;
  }

  if (!metrics) {
    return <div className="text-center py-12">Failed to load metrics</div>;
  }

  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-display-md font-serif italic text-obsidian mb-2">
          Vendor Dashboard
        </h1>
        <p className="text-[13px] font-sans text-neutral-500">
          Welcome back. Here&apos;s your store performance.
        </p>
      </div>

      {/* Metrics Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {/* Revenue */}
        <div className="bg-white border border-slate-border p-6 rounded-lg">
          <div className="flex items-start justify-between mb-4">
            <div>
              <p className="text-[11px] font-sans font-medium tracking-wider uppercase text-neutral-500 mb-1">
                Total Revenue
              </p>
              <p className="text-2xl font-serif text-obsidian">
                ${(metrics.totalRevenue / 100).toLocaleString()}
              </p>
            </div>
            <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
              <DollarSign size={18} className="text-green-600" />
            </div>
          </div>
          <p className="text-[12px] font-sans text-green-600 flex items-center gap-1">
            <ArrowUpRight size={12} /> 12% from last month
          </p>
        </div>

        {/* Orders */}
        <div className="bg-white border border-slate-border p-6 rounded-lg">
          <div className="flex items-start justify-between mb-4">
            <div>
              <p className="text-[11px] font-sans font-medium tracking-wider uppercase text-neutral-500 mb-1">
                Total Orders
              </p>
              <p className="text-2xl font-serif text-obsidian">
                {metrics.totalOrders}
              </p>
            </div>
            <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
              <ShoppingCart size={18} className="text-blue-600" />
            </div>
          </div>
          <p className="text-[12px] font-sans text-blue-600 flex items-center gap-1">
            <ArrowUpRight size={12} /> 8% from last month
          </p>
        </div>

        {/* Active Products */}
        <div className="bg-white border border-slate-border p-6 rounded-lg">
          <div className="flex items-start justify-between mb-4">
            <div>
              <p className="text-[11px] font-sans font-medium tracking-wider uppercase text-neutral-500 mb-1">
                Active Products
              </p>
              <p className="text-2xl font-serif text-obsidian">
                {metrics.activeProducts}
              </p>
            </div>
            <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center">
              <Package size={18} className="text-purple-600" />
            </div>
          </div>
          <Link
            href="/vendor/products"
            className="text-[12px] font-sans text-purple-600 hover:text-purple-700"
          >
            Manage products →
          </Link>
        </div>

        {/* Conversion Rate */}
        <div className="bg-white border border-slate-border p-6 rounded-lg">
          <div className="flex items-start justify-between mb-4">
            <div>
              <p className="text-[11px] font-sans font-medium tracking-wider uppercase text-neutral-500 mb-1">
                Conversion Rate
              </p>
              <p className="text-2xl font-serif text-obsidian">
                {metrics.conversionRate}%
              </p>
            </div>
            <div className="w-10 h-10 bg-orange-100 rounded-lg flex items-center justify-center">
              <TrendingUp size={18} className="text-orange-600" />
            </div>
          </div>
          <p className="text-[12px] font-sans text-orange-600 flex items-center gap-1">
            <ArrowUpRight size={12} /> 3% from last month
          </p>
        </div>
      </div>

      {/* Recent Orders */}
      <div className="bg-white border border-slate-border rounded-lg overflow-hidden">
        <div className="p-6 border-b border-slate-border">
          <h2 className="text-lg font-serif text-obsidian">Recent Orders</h2>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-[13px]">
            <thead className="bg-neutral-50 border-b border-slate-border">
              <tr>
                <th className="px-6 py-3 text-left font-sans font-medium text-neutral-600">
                  Order ID
                </th>
                <th className="px-6 py-3 text-left font-sans font-medium text-neutral-600">
                  Customer
                </th>
                <th className="px-6 py-3 text-left font-sans font-medium text-neutral-600">
                  Amount
                </th>
                <th className="px-6 py-3 text-left font-sans font-medium text-neutral-600">
                  Status
                </th>
                <th className="px-6 py-3 text-left font-sans font-medium text-neutral-600">
                  Date
                </th>
              </tr>
            </thead>
            <tbody>
              {metrics.recentOrders.slice(0, 5).map((order) => (
                <tr key={order.id} className="border-b border-slate-border hover:bg-neutral-50">
                  <td className="px-6 py-4 font-mono text-neutral-600">
                    {order.id.slice(0, 8)}
                  </td>
                  <td className="px-6 py-4">{order.customerName}</td>
                  <td className="px-6 py-4 font-medium">
                    ${(order.total / 100).toLocaleString()}
                  </td>
                  <td className="px-6 py-4">
                    <span
                      className={`px-2 py-1 rounded text-[11px] font-semibold uppercase ${
                        order.status === "completed"
                          ? "bg-green-100 text-green-700"
                          : order.status === "pending"
                          ? "bg-yellow-100 text-yellow-700"
                          : "bg-neutral-100 text-neutral-700"
                      }`}
                    >
                      {order.status}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-neutral-500">
                    {new Date(order.createdAt).toLocaleDateString()}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Top Products */}
      <div className="bg-white border border-slate-border rounded-lg overflow-hidden">
        <div className="p-6 border-b border-slate-border">
          <h2 className="text-lg font-serif text-obsidian">Top Selling Products</h2>
        </div>
        <div className="divide-y divide-slate-border">
          {metrics.topProducts.slice(0, 5).map((product) => (
            <div key={product.id} className="p-6 flex items-center justify-between hover:bg-neutral-50">
              <div>
                <p className="font-medium text-obsidian">{product.name}</p>
                <p className="text-[12px] font-sans text-neutral-500 mt-1">
                  {product.unitsSold} units sold
                </p>
              </div>
              <p className="text-lg font-serif text-obsidian">
                ${(product.revenue / 100).toLocaleString()}
              </p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
