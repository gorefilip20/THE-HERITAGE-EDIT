"use client";

import { useEffect, useState } from "react";
import {
  DollarSign,
  ShoppingCart,
  TrendingUp,
  AlertTriangle,
  Sparkles,
  BarChart3,
} from "lucide-react";
import { formatPrice } from "@/lib/utils";
import type { AdminMetrics } from "@/types";

function MetricCard({
  label,
  value,
  icon: Icon,
  accent = "green",
}: {
  label: string;
  value: string;
  icon: React.ElementType;
  accent?: "green" | "purple" | "amber";
}) {
  const accentClasses = {
    green: "bg-emerald-500/5 text-emerald-600 border-emerald-500/10",
    purple: "bg-purple-500/5 text-purple-600 border-purple-500/10",
    amber: "bg-amber-500/5 text-amber-600 border-amber-500/10",
  };

  return (
    <div className={`p-6 rounded-xl border bg-white shadow-sm ${accentClasses[accent]}`}>
      <div className="flex items-center justify-between">
        <span className="text-sm font-medium text-neutral-500">{label}</span>
        <Icon className="h-5 w-5 opacity-80" />
      </div>
      <div className="mt-2">
        <span className="text-2xl font-semibold tracking-tight text-neutral-900">
          {value}
        </span>
      </div>
    </div>
  );
}

export function AdminDashboard() {
  const [metrics, setMetrics] = useState<AdminMetrics | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchMetrics() {
      try {
        const res = await fetch("/api/admin/metrics");
        if (res.ok) {
          const data = await res.json();
          setMetrics(data);
        }
      } catch (error) {
        console.error("Failed to load dashboard metrics:", error);
      } finally {
        setLoading(false);
      }
    }
    fetchMetrics();
  }, []);

  if (loading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 animate-pulse">
        {[...Array(4)].map((_, i) => (
          <div key={i} className="h-32 bg-neutral-100 rounded-xl border border-neutral-200" />
        ))}
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Editorial Announcement Banner */}
      <div className="p-6 rounded-xl bg-gradient-to-r from-[#0D2C22] to-[#2E1A47] text-white flex items-center justify-between shadow-md">
        <div className="space-y-1">
          <h2 className="text-xl font-semibold tracking-tight flex items-center gap-2">
            <Sparkles className="h-5 w-5 text-amber-400 fill-amber-400" />
            THE HERITAGE EDIT Workspace
          </h2>
          <p className="text-sm text-neutral-300">
            Welcome back. Your high-frequency product ingestion and AI narrative engines are live.
          </p>
        </div>
      </div>

      {/* Fully Guarded Metrics Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <MetricCard
          label="Gross Merchandise Value"
          value={formatPrice(metrics?.totalRevenueCents || 0)}
          icon={DollarSign}
          accent="green"
        />
        <MetricCard
          label="Total Orders"
          value={(metrics?.orderCount || 0).toLocaleString()}
          icon={ShoppingCart}
          accent="green"
        />
        <MetricCard
          label="Average Order Value"
          value={formatPrice(metrics?.averageOrderValueCents || 0)}
          icon={TrendingUp}
          accent="purple"
        />
        <MetricCard
          label="Conversion Rate"
          value={`${(metrics?.conversionRate || 0).toFixed(2)}%`}
          icon={BarChart3}
          accent="purple"
        />
      </div>

      {/* Empty State Action Guide */}
      {(!metrics || metrics.orderCount === 0) && (
        <div className="p-8 rounded-xl border border-dashed border-neutral-200 bg-neutral-50/50 text-center space-y-3">
          <AlertTriangle className="h-8 w-8 text-neutral-400 mx-auto" />
          <h3 className="text-md font-medium text-neutral-800">Your Database is Active & Fresh</h3>
          <p className="text-sm text-neutral-500 max-w-md mx-auto">
            Metrics will calculate dynamically as orders process. Use the sidebar to upload products and test your AI Heritage generation engine.
          </p>
        </div>
      )}
    </div>
  );
}
