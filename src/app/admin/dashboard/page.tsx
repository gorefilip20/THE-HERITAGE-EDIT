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
  UserPlus,
  Activity,
  AlertCircle,
  CalendarDays,
} from "lucide-react";
import { formatPrice } from "@/lib/utils";

/* ------------------------------------------------------------------ */
/*  Types                                                              */
/* ------------------------------------------------------------------ */

interface DashboardMetrics {
  totalRevenueCents: number;
  orderCount: number;
  averageOrderValueCents: number;
  conversionRate: number;
  stockOutAlerts: number;
  pendingAiReview: number;
  topProducts: Array<{ name: string; revenue: number; units: number }>;
}

interface DashboardData {
  totalCustomers: number;
  newCustomersThisWeek: number;
  newCustomersThisMonth: number;
  ordersByStatus: Record<string, { count: number; revenue: number }>;
  recentSignups: Array<{
    id: string;
    email: string;
    firstName: string;
    lastName: string;
    createdAt: string;
  }>;
  lowStockProducts: Array<{
    id: string;
    name: string;
    sku: string;
    variants: Array<{ size: string; color: string | null; stockCount: number }>;
  }>;
  lowStockCount: number;
  recentOrders: Array<{
    id: string;
    orderNumber: string;
    guestEmail: string | null;
    status: string;
    totalCents: number;
    createdAt: string;
    user: { firstName: string; lastName: string; email: string } | null;
    _count: { items: number };
  }>;
}

/* ------------------------------------------------------------------ */
/*  MetricCard                                                         */
/* ------------------------------------------------------------------ */

function MetricCard({
  label,
  value,
  icon: Icon,
  trend,
  trendValue,
  accent = "green",
  badge,
}: {
  label: string;
  value: string;
  icon: React.ElementType;
  trend?: "up" | "down";
  trendValue?: string;
  accent?: "green" | "purple" | "amber" | "blue";
  badge?: string;
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
          <div
            className={`flex items-center gap-0.5 text-xs font-medium ${trend === "up" ? "text-emerald-600" : "text-red-500"}`}
          >
            {trend === "up" ? (
              <ArrowUpRight size={12} />
            ) : (
              <ArrowDownRight size={12} />
            )}
            {trendValue}
          </div>
        )}
        {badge && (
          <span className="text-[9px] font-sans font-bold tracking-wider uppercase px-2 py-0.5 rounded-full bg-neutral-100 text-neutral-400">
            {badge}
          </span>
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

/* ------------------------------------------------------------------ */
/*  Status helpers                                                     */
/* ------------------------------------------------------------------ */

const STATUS_COLORS: Record<string, string> = {
  PENDING: "bg-amber-100 text-amber-700",
  CONFIRMED: "bg-blue-100 text-blue-700",
  PROCESSING: "bg-indigo-100 text-indigo-700",
  SHIPPED: "bg-emerald-100 text-emerald-700",
  DELIVERED: "bg-green-100 text-green-700",
  CANCELLED: "bg-red-100 text-red-700",
  REFUNDED: "bg-neutral-100 text-neutral-600",
};

const STATUS_BAR_COLORS: Record<string, string> = {
  PENDING: "#f59e0b",
  CONFIRMED: "#3b82f6",
  PROCESSING: "#6366f1",
  SHIPPED: "#10b981",
  DELIVERED: "#22c55e",
  CANCELLED: "#ef4444",
  REFUNDED: "#9ca3af",
};

const ALL_STATUSES = [
  "PENDING",
  "CONFIRMED",
  "PROCESSING",
  "SHIPPED",
  "DELIVERED",
  "CANCELLED",
  "REFUNDED",
];

/* ------------------------------------------------------------------ */
/*  Helpers                                                            */
/* ------------------------------------------------------------------ */

function timeAgo(dateStr: string) {
  const diff = Date.now() - new Date(dateStr).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return "Just now";
  if (mins < 60) return `${mins}m ago`;
  const hours = Math.floor(mins / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  return `${days}d ago`;
}

/* ------------------------------------------------------------------ */
/*  Page                                                               */
/* ------------------------------------------------------------------ */

export default function DashboardPage() {
  const [metrics, setMetrics] = useState<DashboardMetrics | null>(null);
  const [dashData, setDashData] = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchData() {
      try {
        const [metricsRes, dashRes] = await Promise.all([
          fetch("/api/admin/metrics"),
          fetch("/api/admin/dashboard"),
        ]);
        if (metricsRes.ok) setMetrics(await metricsRes.json());
        if (dashRes.ok) setDashData(await dashRes.json());
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
        <div className="h-24 bg-white rounded-xl border border-neutral-200 animate-pulse" />
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
          {[...Array(5)].map((_, i) => (
            <div
              key={i}
              className="h-32 bg-white rounded-xl border border-neutral-200 animate-pulse"
            />
          ))}
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 h-64 bg-white rounded-xl border border-neutral-200 animate-pulse" />
          <div className="h-64 bg-white rounded-xl border border-neutral-200 animate-pulse" />
        </div>
      </div>
    );
  }

  const ordersByStatus = dashData?.ordersByStatus ?? {};
  const maxStatusCount = Math.max(
    ...ALL_STATUSES.map((s) => ordersByStatus[s]?.count ?? 0),
    1,
  );

  return (
    <div className="space-y-6">
      {/* Welcome Banner */}
      <div className="p-6 rounded-xl bg-gradient-to-r from-[#0D2C22] via-[#1a4a3a] to-[#2E1A47] text-white shadow-lg">
        <div className="flex items-center justify-between">
          <div className="space-y-1">
            <h1 className="text-xl font-serif font-semibold tracking-tight flex items-center gap-2">
              <Sparkles className="h-5 w-5 text-amber-400 fill-amber-400" />
              Welcome to Heritage Admin
            </h1>
            <p className="text-sm font-sans text-white/60">
              Manage your luxury African fashion marketplace.
            </p>
          </div>
          <Link
            href="/admin/products/new"
            className="hidden md:flex items-center gap-2 px-4 py-2 bg-white/10 hover:bg-white/20 text-xs font-sans font-medium tracking-wider uppercase transition-colors"
            style={{ borderRadius: 0 }}
          >
            <Package size={14} />
            Add Product
          </Link>
        </div>
      </div>

      {/* ============================================================ */}
      {/* A. Top Metrics Row                                            */}
      {/* ============================================================ */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
        <MetricCard
          label="Total Revenue"
          value={formatPrice(metrics?.totalRevenueCents || 0)}
          icon={DollarSign}
          accent="green"
          trend="up"
          trendValue="12.5%"
        />
        <MetricCard
          label="Total Orders"
          value={(metrics?.orderCount || 0).toLocaleString()}
          icon={ShoppingCart}
          accent="blue"
          trend="up"
          trendValue="8.2%"
        />
        <MetricCard
          label="Avg Order Value"
          value={formatPrice(metrics?.averageOrderValueCents || 0)}
          icon={TrendingUp}
          accent="purple"
          trend="up"
          trendValue="3.1%"
        />
        <MetricCard
          label="Total Customers"
          value={(dashData?.totalCustomers || 0).toLocaleString()}
          icon={Users}
          accent="amber"
        />
        <MetricCard
          label="Visitors"
          value="--"
          icon={Eye}
          accent="blue"
          badge="Coming Soon"
        />
      </div>

      {/* Alerts */}
      {((metrics?.stockOutAlerts || 0) > 0 ||
        (metrics?.pendingAiReview || 0) > 0) && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {(metrics?.stockOutAlerts || 0) > 0 && (
            <div className="flex items-center gap-3 p-4 rounded-xl border border-amber-200 bg-amber-50">
              <AlertTriangle className="h-5 w-5 text-amber-600 shrink-0" />
              <div>
                <p className="text-sm font-sans font-medium text-amber-800">
                  {metrics?.stockOutAlerts} products out of stock
                </p>
                <p className="text-xs font-sans text-amber-600">
                  Review inventory levels
                </p>
              </div>
            </div>
          )}
          {(metrics?.pendingAiReview || 0) > 0 && (
            <div className="flex items-center gap-3 p-4 rounded-xl border border-purple-200 bg-purple-50">
              <Sparkles className="h-5 w-5 text-purple-600 shrink-0" />
              <div>
                <p className="text-sm font-sans font-medium text-purple-800">
                  {metrics?.pendingAiReview} pending AI review
                </p>
                <p className="text-xs font-sans text-purple-600">
                  Heritage narratives ready for approval
                </p>
              </div>
            </div>
          )}
        </div>
      )}

      {/* ============================================================ */}
      {/* B. Revenue Chart - Orders by Status                           */}
      {/* ============================================================ */}
      <div className="bg-white rounded-xl border border-neutral-200 shadow-sm overflow-hidden">
        <div className="flex items-center justify-between px-5 py-4 border-b border-neutral-100">
          <div className="flex items-center gap-2">
            <Activity size={16} className="text-neutral-400" />
            <h3 className="text-sm font-serif font-semibold text-neutral-800">
              Orders by Status
            </h3>
          </div>
          <Link
            href="/admin/orders"
            className="text-xs font-sans font-medium text-[#0D2C22] hover:text-[#0D2C22]/70 flex items-center gap-1"
          >
            View All <ArrowUpRight size={12} />
          </Link>
        </div>
        <div className="p-5">
          <div className="space-y-3">
            {ALL_STATUSES.map((status) => {
              const data = ordersByStatus[status];
              const count = data?.count ?? 0;
              const revenue = data?.revenue ?? 0;
              const barWidth =
                maxStatusCount > 0
                  ? Math.max((count / maxStatusCount) * 100, count > 0 ? 4 : 0)
                  : 0;
              return (
                <div key={status} className="flex items-center gap-3">
                  <span className="text-xs font-sans font-medium text-neutral-500 w-24 shrink-0">
                    {status}
                  </span>
                  <div className="flex-1 h-7 bg-neutral-50 rounded relative overflow-hidden">
                    <div
                      className="h-full rounded transition-all duration-500"
                      style={{
                        width: `${barWidth}%`,
                        backgroundColor:
                          STATUS_BAR_COLORS[status] || "#9ca3af",
                      }}
                    />
                  </div>
                  <div className="text-right shrink-0 w-28">
                    <span className="text-sm font-sans font-semibold text-neutral-800">
                      {count}
                    </span>
                    <span className="text-xs font-sans text-neutral-400 ml-2">
                      {formatPrice(revenue)}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* ============================================================ */}
      {/* C. Recent Orders + D. Activity Feed                           */}
      {/* ============================================================ */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Recent Orders Table */}
        <div className="lg:col-span-2 bg-white rounded-xl border border-neutral-200 shadow-sm overflow-hidden">
          <div className="flex items-center justify-between px-5 py-4 border-b border-neutral-100">
            <div className="flex items-center gap-2">
              <Clock size={16} className="text-neutral-400" />
              <h3 className="text-sm font-serif font-semibold text-neutral-800">
                Recent Orders
              </h3>
            </div>
            <Link
              href="/admin/orders"
              className="text-xs font-sans font-medium text-[#0D2C22] hover:text-[#0D2C22]/70 flex items-center gap-1"
            >
              View All <ArrowUpRight size={12} />
            </Link>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-neutral-100 bg-neutral-50/50">
                  <th className="text-left px-5 py-2.5 text-[10px] font-sans font-bold tracking-[0.15em] uppercase text-neutral-400">
                    Order
                  </th>
                  <th className="text-left px-3 py-2.5 text-[10px] font-sans font-bold tracking-[0.15em] uppercase text-neutral-400">
                    Customer
                  </th>
                  <th className="text-center px-3 py-2.5 text-[10px] font-sans font-bold tracking-[0.15em] uppercase text-neutral-400">
                    Items
                  </th>
                  <th className="text-right px-3 py-2.5 text-[10px] font-sans font-bold tracking-[0.15em] uppercase text-neutral-400">
                    Total
                  </th>
                  <th className="text-center px-3 py-2.5 text-[10px] font-sans font-bold tracking-[0.15em] uppercase text-neutral-400">
                    Status
                  </th>
                  <th className="text-right px-5 py-2.5 text-[10px] font-sans font-bold tracking-[0.15em] uppercase text-neutral-400">
                    Date
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-neutral-50">
                {(dashData?.recentOrders || []).length === 0 ? (
                  <tr>
                    <td colSpan={6} className="px-5 py-12 text-center">
                      <ShoppingCart className="h-8 w-8 text-neutral-300 mx-auto mb-2" />
                      <p className="text-sm font-sans text-neutral-400">
                        No orders yet
                      </p>
                    </td>
                  </tr>
                ) : (
                  (dashData?.recentOrders || []).map((order) => (
                    <tr
                      key={order.id}
                      className="hover:bg-neutral-50 transition-colors"
                    >
                      <td className="px-5 py-3">
                        <Link
                          href={`/admin/orders/${order.id}`}
                          className="text-sm font-sans font-medium text-[#0D2C22] hover:underline"
                        >
                          {order.orderNumber}
                        </Link>
                      </td>
                      <td className="px-3 py-3">
                        <p className="text-xs font-sans text-neutral-500 truncate max-w-[180px]">
                          {order.user?.email || order.guestEmail || "Guest"}
                        </p>
                      </td>
                      <td className="px-3 py-3 text-center">
                        <span className="text-xs font-sans font-medium text-neutral-600">
                          {order._count.items}
                        </span>
                      </td>
                      <td className="px-3 py-3 text-right">
                        <span className="text-sm font-sans font-medium text-neutral-800">
                          {formatPrice(order.totalCents)}
                        </span>
                      </td>
                      <td className="px-3 py-3 text-center">
                        <span
                          className={`inline-flex px-1.5 py-0.5 text-[9px] font-sans font-semibold tracking-wider uppercase rounded ${STATUS_COLORS[order.status] || "bg-neutral-100 text-neutral-600"}`}
                        >
                          {order.status}
                        </span>
                      </td>
                      <td className="px-5 py-3 text-right">
                        <span className="text-xs font-sans text-neutral-400">
                          {timeAgo(order.createdAt)}
                        </span>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Activity Feed */}
        <div className="bg-white rounded-xl border border-neutral-200 shadow-sm overflow-hidden">
          <div className="px-5 py-4 border-b border-neutral-100">
            <div className="flex items-center gap-2">
              <Activity size={16} className="text-neutral-400" />
              <h3 className="text-sm font-serif font-semibold text-neutral-800">
                Activity Feed
              </h3>
            </div>
          </div>
          <div className="divide-y divide-neutral-50 max-h-[400px] overflow-y-auto">
            {/* Recent sign-ups */}
            {(dashData?.recentSignups || []).slice(0, 5).map((user) => (
              <div
                key={`signup-${user.id}`}
                className="flex items-start gap-3 px-5 py-3"
              >
                <div className="mt-0.5 p-1.5 rounded-full bg-purple-50 shrink-0">
                  <UserPlus size={12} className="text-purple-500" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-xs font-sans font-medium text-neutral-700">
                    New customer sign-up
                  </p>
                  <p className="text-xs font-sans text-neutral-400 truncate">
                    {user.firstName} {user.lastName}
                  </p>
                  <p className="text-[10px] font-sans text-neutral-300 mt-0.5">
                    {timeAgo(user.createdAt)}
                  </p>
                </div>
              </div>
            ))}

            {/* Recent orders */}
            {(dashData?.recentOrders || []).slice(0, 3).map((order) => (
              <div
                key={`order-${order.id}`}
                className="flex items-start gap-3 px-5 py-3"
              >
                <div className="mt-0.5 p-1.5 rounded-full bg-blue-50 shrink-0">
                  <ShoppingCart size={12} className="text-blue-500" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-xs font-sans font-medium text-neutral-700">
                    New order {order.orderNumber}
                  </p>
                  <p className="text-xs font-sans text-neutral-400">
                    {formatPrice(order.totalCents)}
                  </p>
                  <p className="text-[10px] font-sans text-neutral-300 mt-0.5">
                    {timeAgo(order.createdAt)}
                  </p>
                </div>
              </div>
            ))}

            {/* Low stock alerts */}
            {(dashData?.lowStockProducts || []).slice(0, 3).map((product) => (
              <div
                key={`stock-${product.id}`}
                className="flex items-start gap-3 px-5 py-3"
              >
                <div className="mt-0.5 p-1.5 rounded-full bg-amber-50 shrink-0">
                  <AlertCircle size={12} className="text-amber-500" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-xs font-sans font-medium text-neutral-700">
                    Low stock alert
                  </p>
                  <p className="text-xs font-sans text-neutral-400 truncate">
                    {product.name}
                  </p>
                  <p className="text-[10px] font-sans text-neutral-300 mt-0.5">
                    {product.variants
                      .map(
                        (v) =>
                          `${v.size}${v.color ? `/${v.color}` : ""}: ${v.stockCount} left`,
                      )
                      .join(", ")}
                  </p>
                </div>
              </div>
            ))}

            {(dashData?.recentSignups || []).length === 0 &&
              (dashData?.recentOrders || []).length === 0 &&
              (dashData?.lowStockProducts || []).length === 0 && (
                <div className="px-5 py-12 text-center">
                  <Activity className="h-8 w-8 text-neutral-300 mx-auto mb-2" />
                  <p className="text-sm font-sans text-neutral-400">
                    No recent activity
                  </p>
                </div>
              )}
          </div>
        </div>
      </div>

      {/* ============================================================ */}
      {/* E. Quick Stats Cards                                          */}
      {/* ============================================================ */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Orders by Status Breakdown */}
        <div className="bg-white rounded-xl border border-neutral-200 shadow-sm overflow-hidden">
          <div className="px-5 py-4 border-b border-neutral-100">
            <h3 className="text-sm font-serif font-semibold text-neutral-800">
              Order Status Breakdown
            </h3>
          </div>
          <div className="divide-y divide-neutral-50">
            {ALL_STATUSES.map((status) => {
              const count = ordersByStatus[status]?.count ?? 0;
              return (
                <div
                  key={status}
                  className="flex items-center justify-between px-5 py-2.5"
                >
                  <div className="flex items-center gap-2">
                    <span
                      className="w-2 h-2 rounded-full"
                      style={{
                        backgroundColor:
                          STATUS_BAR_COLORS[status] || "#9ca3af",
                      }}
                    />
                    <span className="text-xs font-sans text-neutral-600">
                      {status}
                    </span>
                  </div>
                  <span className="text-sm font-sans font-semibold text-neutral-800">
                    {count}
                  </span>
                </div>
              );
            })}
          </div>
        </div>

        {/* Inventory Alerts */}
        <div className="bg-white rounded-xl border border-neutral-200 shadow-sm overflow-hidden">
          <div className="px-5 py-4 border-b border-neutral-100">
            <h3 className="text-sm font-serif font-semibold text-neutral-800">
              Inventory Alerts
            </h3>
          </div>
          <div className="p-5 space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <AlertTriangle size={14} className="text-amber-500" />
                <span className="text-xs font-sans text-neutral-600">
                  Low Stock Products
                </span>
              </div>
              <span className="text-lg font-sans font-semibold text-amber-600">
                {dashData?.lowStockCount ?? 0}
              </span>
            </div>
            <div className="border-t border-neutral-100 pt-4">
              {(dashData?.lowStockProducts || []).slice(0, 5).map((product) => (
                <Link
                  key={product.id}
                  href={`/admin/products/${product.id}`}
                  className="flex items-center justify-between py-1.5 hover:bg-neutral-50 -mx-2 px-2 rounded transition-colors"
                >
                  <span className="text-xs font-sans text-neutral-600 truncate max-w-[160px]">
                    {product.name}
                  </span>
                  <span className="text-[10px] font-sans font-medium text-amber-600">
                    {product.variants.reduce(
                      (sum, v) => sum + v.stockCount,
                      0,
                    )}{" "}
                    left
                  </span>
                </Link>
              ))}
              {(dashData?.lowStockProducts || []).length === 0 && (
                <p className="text-xs font-sans text-neutral-400 text-center py-4">
                  All stock levels healthy
                </p>
              )}
            </div>
          </div>
        </div>

        {/* New Customers */}
        <div className="bg-white rounded-xl border border-neutral-200 shadow-sm overflow-hidden">
          <div className="px-5 py-4 border-b border-neutral-100">
            <h3 className="text-sm font-serif font-semibold text-neutral-800">
              New Customers
            </h3>
          </div>
          <div className="p-5 space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <CalendarDays size={14} className="text-blue-500" />
                <span className="text-xs font-sans text-neutral-600">
                  This Week
                </span>
              </div>
              <span className="text-lg font-sans font-semibold text-blue-600">
                {dashData?.newCustomersThisWeek ?? 0}
              </span>
            </div>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <CalendarDays size={14} className="text-purple-500" />
                <span className="text-xs font-sans text-neutral-600">
                  This Month
                </span>
              </div>
              <span className="text-lg font-sans font-semibold text-purple-600">
                {dashData?.newCustomersThisMonth ?? 0}
              </span>
            </div>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Users size={14} className="text-neutral-400" />
                <span className="text-xs font-sans text-neutral-600">
                  Total Customers
                </span>
              </div>
              <span className="text-lg font-sans font-semibold text-neutral-800">
                {(dashData?.totalCustomers ?? 0).toLocaleString()}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Bottom: Top Products + Quick Actions */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          {/* Quick Actions */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            <Link
              href="/admin/products/new"
              className="flex flex-col items-center gap-2 p-4 rounded-xl border border-neutral-200 bg-white hover:border-[#0D2C22]/20 hover:shadow-sm transition-all group"
            >
              <div className="p-2 rounded-lg bg-emerald-50 group-hover:bg-emerald-100 transition-colors">
                <Plus size={18} className="text-emerald-600" />
              </div>
              <span className="text-xs font-sans font-medium text-neutral-600">
                Add Product
              </span>
            </Link>
            <Link
              href="/admin/orders"
              className="flex flex-col items-center gap-2 p-4 rounded-xl border border-neutral-200 bg-white hover:border-[#0D2C22]/20 hover:shadow-sm transition-all group"
            >
              <div className="p-2 rounded-lg bg-blue-50 group-hover:bg-blue-100 transition-colors">
                <ShoppingCart size={18} className="text-blue-600" />
              </div>
              <span className="text-xs font-sans font-medium text-neutral-600">
                Manage Orders
              </span>
            </Link>
            <Link
              href="/admin/customers"
              className="flex flex-col items-center gap-2 p-4 rounded-xl border border-neutral-200 bg-white hover:border-[#0D2C22]/20 hover:shadow-sm transition-all group"
            >
              <div className="p-2 rounded-lg bg-purple-50 group-hover:bg-purple-100 transition-colors">
                <Users size={18} className="text-purple-600" />
              </div>
              <span className="text-xs font-sans font-medium text-neutral-600">
                Customers
              </span>
            </Link>
            <Link
              href="/"
              target="_blank"
              className="flex flex-col items-center gap-2 p-4 rounded-xl border border-neutral-200 bg-white hover:border-[#0D2C22]/20 hover:shadow-sm transition-all group"
            >
              <div className="p-2 rounded-lg bg-amber-50 group-hover:bg-amber-100 transition-colors">
                <Eye size={18} className="text-amber-600" />
              </div>
              <span className="text-xs font-sans font-medium text-neutral-600">
                View Store
              </span>
            </Link>
          </div>
        </div>

        {/* Top Products */}
        <div className="bg-white rounded-xl border border-neutral-200 shadow-sm overflow-hidden">
          <div className="px-5 py-4 border-b border-neutral-100">
            <h3 className="text-sm font-serif font-semibold text-neutral-800">
              Top Products
            </h3>
          </div>
          <div className="divide-y divide-neutral-100">
            {(metrics?.topProducts || []).length === 0 ? (
              <div className="px-5 py-12 text-center">
                <Package className="h-8 w-8 text-neutral-300 mx-auto mb-2" />
                <p className="text-sm font-sans text-neutral-400">
                  No sales data yet
                </p>
              </div>
            ) : (
              metrics?.topProducts.map((product, idx) => (
                <div key={idx} className="flex items-center gap-3 px-5 py-3">
                  <span className="text-xs font-sans font-bold text-neutral-300 w-5">
                    {idx + 1}
                  </span>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-sans font-medium text-neutral-800 truncate">
                      {product.name}
                    </p>
                    <p className="text-xs font-sans text-neutral-400">
                      {product.units} units
                    </p>
                  </div>
                  <span className="text-sm font-sans font-medium text-emerald-600">
                    {formatPrice(product.revenue)}
                  </span>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
