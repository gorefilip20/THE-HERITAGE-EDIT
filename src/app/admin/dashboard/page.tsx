"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import {
  DollarSign,
  ShoppingCart,
  TrendingUp,
  Users,
  Package,
  AlertTriangle,
  Sparkles,
  ArrowUpRight,
  ArrowDownRight,
  Eye,
  Clock,
  Plus,
} from "lucide-react";
import { formatPrice } from "@/lib/utils";

interface DashboardMetrics {
  totalRevenueCents: number;
  orderCount: number;
  averageOrderValueCents: number;
  conversionRate: number;
  stockOutAlerts: number;
  pendingAiReview: number;
  topProducts: Array<{ name: string; revenue: number; units: number }>;
}

interface RecentOrder {
  id: string;
  orderNumber: string;
  guestEmail: string | null;
  status: string;
  totalCents: number;
  createdAt: string;
}

function MetricCard({
  label,
  value,
  icon: Icon,
  trend,
  trendValue,
  accent = "green",
}: {
  label: string;
  value: string;
  icon: React.ElementType;
  trend?: "up" | "down";
  trendValue?: string;
  accent?: "green" | "purple" | "amber" | "blue";
}) {
  const accentClasses = {
    green: "border-emerald-100 bg-gradient-to-br from-white to-emerald-50/30",
    purple: "border-purple-100 bg-gradient-to-br from-white to-purple-50/30",
    amber: "border-amber-100 bg-gradient-to-br from-white to-amber-50/30",
    blue: "border-blue-100 bg-gradient-to-br from-white to-blue-50/30",
  };

  const iconClasses = {
    green: "bg-emerald-100 text-emerald-600",
    purple: "bg-purple-100 text-purple-600",
    amber: "bg-amber-100 text-amber-600",
    blue: "bg-blue-100 text-blue-600",
  };

  return (
    <div className={`p-5 rounded-xl border shadow-sm ${accentClasses[accent]}`}>
      <div className="flex items-start justify-between">
        <div className={`p-2 rounded-lg ${iconClasses[accent]}`}>
          <Icon className="h-4 w-4" />
        </div>
        {trend && (
          <div className={`flex items-center gap-0.5 text-xs font-medium ${trend === "up" ? "text-emerald-600" : "text-red-500"}`}>
            {trend === "up" ? <ArrowUpRight size={12} /> : <ArrowDownRight size={12} />}
            {trendValue}
          </div>
        )}
      </div>
      <div className="mt-3">
        <span className="text-2xl font-semibold tracking-tight text-neutral-900">
          {value}
        </span>
      </div>
      <p className="text-xs font-medium text-neutral-500 mt-1">{label}</p>
    </div>
  );
}

const STATUS_COLORS: Record<string, string> = {
  PENDING: "bg-amber-100 text-amber-700",
  CONFIRMED: "bg-blue-100 text-blue-700",
  PROCESSING: "bg-indigo-100 text-indigo-700",
  SHIPPED: "bg-emerald-100 text-emerald-700",
  DELIVERED: "bg-green-100 text-green-700",
  CANCELLED: "bg-red-100 text-red-700",
};

export default function DashboardPage() {
  const [metrics, setMetrics] = useState<DashboardMetrics | null>(null);
  const [recentOrders, setRecentOrders] = useState<RecentOrder[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchData() {
      try {
        const [metricsRes, ordersRes] = await Promise.all([
          fetch("/api/admin/metrics"),
          fetch("/api/admin/orders?pageSize=5"),
        ]);
        if (metricsRes.ok) setMetrics(await metricsRes.json());
        if (ordersRes.ok) {
          const data = await ordersRes.json();
          setRecentOrders(data.data ?? []);
        }
      } catch (error) {
        console.error("Failed to load dashboard data:", error);
      } finally {
        setLoading(false);
      }
    }
    fetchData();
  }, []);

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="h-32 bg-white rounded-xl border border-neutral-200 animate-pulse" />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Welcome Banner */}
      <div className="p-6 rounded-xl bg-gradient-to-r from-[#0D2C22] via-[#1a4a3a] to-[#2E1A47] text-white shadow-lg">
        <div className="flex items-center justify-between">
          <div className="space-y-1">
            <h1 className="text-xl font-semibold tracking-tight flex items-center gap-2">
              <Sparkles className="h-5 w-5 text-amber-400 fill-amber-400" />
              Welcome to Heritage Admin
            </h1>
            <p className="text-sm text-white/60">
              Manage your luxury African fashion marketplace.
            </p>
          </div>
          <Link
            href="/admin/products/new"
            className="hidden md:flex items-center gap-2 px-4 py-2 bg-white/10 hover:bg-white/20 rounded-lg text-xs font-medium tracking-wider uppercase transition-colors"
          >
            <Package size={14} />
            Add Product
          </Link>
        </div>
      </div>

      {/* Metrics Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <MetricCard label="Total Revenue" value={formatPrice(metrics?.totalRevenueCents || 0)} icon={DollarSign} accent="green" trend="up" trendValue="12.5%" />
        <MetricCard label="Total Orders" value={(metrics?.orderCount || 0).toLocaleString()} icon={ShoppingCart} accent="blue" trend="up" trendValue="8.2%" />
        <MetricCard label="Avg Order Value" value={formatPrice(metrics?.averageOrderValueCents || 0)} icon={TrendingUp} accent="purple" trend="up" trendValue="3.1%" />
        <MetricCard label="Conversion Rate" value={`${(metrics?.conversionRate || 0).toFixed(2)}%`} icon={Users} accent="amber" />
      </div>

      {/* Alerts */}
      {((metrics?.stockOutAlerts || 0) > 0 || (metrics?.pendingAiReview || 0) > 0) && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {(metrics?.stockOutAlerts || 0) > 0 && (
            <div className="flex items-center gap-3 p-4 rounded-xl border border-amber-200 bg-amber-50">
              <AlertTriangle className="h-5 w-5 text-amber-600 shrink-0" />
              <div>
                <p className="text-sm font-medium text-amber-800">{metrics?.stockOutAlerts} products out of stock</p>
                <p className="text-xs text-amber-600">Review inventory levels</p>
              </div>
            </div>
          )}
          {(metrics?.pendingAiReview || 0) > 0 && (
            <div className="flex items-center gap-3 p-4 rounded-xl border border-purple-200 bg-purple-50">
              <Sparkles className="h-5 w-5 text-purple-600 shrink-0" />
              <div>
                <p className="text-sm font-medium text-purple-800">{metrics?.pendingAiReview} pending AI review</p>
                <p className="text-xs text-purple-600">Heritage narratives ready for approval</p>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Recent Orders */}
        <div className="lg:col-span-2 bg-white rounded-xl border border-neutral-200 shadow-sm overflow-hidden">
          <div className="flex items-center justify-between px-5 py-4 border-b border-neutral-100">
            <div className="flex items-center gap-2">
              <Clock size={16} className="text-neutral-400" />
              <h3 className="text-sm font-semibold text-neutral-800">Recent Orders</h3>
            </div>
            <Link href="/admin/orders" className="text-xs font-medium text-[#0D2C22] hover:text-[#0D2C22]/70 flex items-center gap-1">
              View All <ArrowUpRight size={12} />
            </Link>
          </div>
          <div className="divide-y divide-neutral-100">
            {recentOrders.length === 0 ? (
              <div className="px-5 py-12 text-center">
                <ShoppingCart className="h-8 w-8 text-neutral-300 mx-auto mb-2" />
                <p className="text-sm text-neutral-400">No orders yet</p>
              </div>
            ) : (
              recentOrders.map((order) => (
                <div key={order.id} className="flex items-center justify-between px-5 py-3 hover:bg-neutral-50 transition-colors">
                  <div>
                    <p className="text-sm font-medium text-neutral-800">{order.orderNumber}</p>
                    <p className="text-xs text-neutral-400">{order.guestEmail || "Guest"}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-medium text-neutral-800">{formatPrice(order.totalCents)}</p>
                    <span className={`inline-flex px-1.5 py-0.5 text-[9px] font-semibold tracking-wider uppercase rounded ${STATUS_COLORS[order.status] || "bg-neutral-100 text-neutral-600"}`}>
                      {order.status}
                    </span>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Top Products */}
        <div className="bg-white rounded-xl border border-neutral-200 shadow-sm overflow-hidden">
          <div className="px-5 py-4 border-b border-neutral-100">
            <h3 className="text-sm font-semibold text-neutral-800">Top Products</h3>
          </div>
          <div className="divide-y divide-neutral-100">
            {(metrics?.topProducts || []).length === 0 ? (
              <div className="px-5 py-12 text-center">
                <Package className="h-8 w-8 text-neutral-300 mx-auto mb-2" />
                <p className="text-sm text-neutral-400">No sales data yet</p>
              </div>
            ) : (
              metrics?.topProducts.map((product, idx) => (
                <div key={idx} className="flex items-center gap-3 px-5 py-3">
                  <span className="text-xs font-bold text-neutral-300 w-5">{idx + 1}</span>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-neutral-800 truncate">{product.name}</p>
                    <p className="text-xs text-neutral-400">{product.units} units</p>
                  </div>
                  <span className="text-sm font-medium text-emerald-600">{formatPrice(product.revenue)}</span>
                </div>
              ))
            )}
          </div>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <Link href="/admin/products/new" className="flex flex-col items-center gap-2 p-4 rounded-xl border border-neutral-200 bg-white hover:border-[#0D2C22]/20 hover:shadow-sm transition-all group">
          <div className="p-2 rounded-lg bg-emerald-50 group-hover:bg-emerald-100 transition-colors"><Plus size={18} className="text-emerald-600" /></div>
          <span className="text-xs font-medium text-neutral-600">Add Product</span>
        </Link>
        <Link href="/admin/orders" className="flex flex-col items-center gap-2 p-4 rounded-xl border border-neutral-200 bg-white hover:border-[#0D2C22]/20 hover:shadow-sm transition-all group">
          <div className="p-2 rounded-lg bg-blue-50 group-hover:bg-blue-100 transition-colors"><ShoppingCart size={18} className="text-blue-600" /></div>
          <span className="text-xs font-medium text-neutral-600">Manage Orders</span>
        </Link>
        <Link href="/admin/customers" className="flex flex-col items-center gap-2 p-4 rounded-xl border border-neutral-200 bg-white hover:border-[#0D2C22]/20 hover:shadow-sm transition-all group">
          <div className="p-2 rounded-lg bg-purple-50 group-hover:bg-purple-100 transition-colors"><Users size={18} className="text-purple-600" /></div>
          <span className="text-xs font-medium text-neutral-600">Customers</span>
        </Link>
        <Link href="/" target="_blank" className="flex flex-col items-center gap-2 p-4 rounded-xl border border-neutral-200 bg-white hover:border-[#0D2C22]/20 hover:shadow-sm transition-all group">
          <div className="p-2 rounded-lg bg-amber-50 group-hover:bg-amber-100 transition-colors"><Eye size={18} className="text-amber-600" /></div>
          <span className="text-xs font-medium text-neutral-600">View Store</span>
        </Link>
      </div>
    </div>
  );
}
