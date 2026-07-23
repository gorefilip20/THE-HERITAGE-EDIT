"use client";

import { useEffect, useState } from "react";
import {
  Shield,
  ShieldAlert,
  ShieldCheck,
  AlertTriangle,
  XCircle,
  DollarSign,
  Users,
  Lock,
  Key,
  Globe,
  ExternalLink,
  RefreshCw,
} from "lucide-react";
import { formatPrice } from "@/lib/utils";

interface RiskIndicators {
  failedPayments: number;
  duplicateEmailCount: number;
  highValueOrderCount: number;
  cancelledRate: number;
  cancelledCount: number;
  totalOrdersLast30: number;
}

interface SuspiciousOrder {
  id: string;
  orderNumber: string;
  totalCents: number;
  currency: string;
  paymentStatus: string;
  status: string;
  createdAt: string;
  email: string;
  reason: string;
}

interface HighValueOrder {
  id: string;
  orderNumber: string;
  totalCents: number;
  currency: string;
  paymentStatus: string;
  status: string;
  createdAt: string;
  email: string;
}

interface DuplicateEmail {
  email: string;
  orderCount: number;
  orders: Array<{
    id: string;
    orderNumber: string;
    createdAt: string;
    totalCents: number;
    currency: string;
    paymentStatus: string;
  }>;
}

interface FraudData {
  riskIndicators: RiskIndicators;
  highValueOrders: HighValueOrder[];
  duplicateEmailOrders: DuplicateEmail[];
  suspiciousActivity: SuspiciousOrder[];
}

const SECURITY_CHECKS = [
  {
    name: "HTTPS Encryption",
    description: "All traffic encrypted via TLS/SSL",
    icon: Lock,
    status: "active" as const,
  },
  {
    name: "Webhook Signatures",
    description: "Payment webhook payloads verified with HMAC signatures",
    icon: Key,
    status: "active" as const,
  },
  {
    name: "API Key Configuration",
    description: "Payment provider API keys securely stored in environment",
    icon: Globe,
    status: "active" as const,
  },
];

export default function FraudMonitorPage() {
  const [data, setData] = useState<FraudData | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<"suspicious" | "highvalue" | "duplicates">("suspicious");

  useEffect(() => {
    fetchFraudData();
  }, []);

  async function fetchFraudData() {
    setLoading(true);
    try {
      const res = await fetch("/api/admin/fraud");
      if (res.ok) {
        const json = await res.json();
        setData(json);
      }
    } catch (err) {
      console.error("Failed to fetch fraud data:", err);
    } finally {
      setLoading(false);
    }
  }

  if (loading) {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-serif text-neutral-900 mb-1">Fraud Monitor</h1>
          <p className="text-sm font-sans text-neutral-500">Loading security data...</p>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="bg-white rounded-xl border border-neutral-200 p-5">
              <div className="h-16 bg-neutral-100 rounded animate-pulse" />
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (!data) {
    return (
      <div className="text-center py-16">
        <ShieldAlert className="h-12 w-12 text-neutral-300 mx-auto mb-3" />
        <p className="text-sm font-sans text-neutral-400">Failed to load fraud monitoring data</p>
        <button
          onClick={fetchFraudData}
          className="mt-4 px-4 py-2 text-xs font-sans text-[#0D2C22] border border-[#0D2C22]/20 rounded-lg hover:bg-[#0D2C22]/5 transition-colors"
        >
          Retry
        </button>
      </div>
    );
  }

  const { riskIndicators } = data;

  const riskCards = [
    {
      label: "Failed Payments",
      value: riskIndicators.failedPayments,
      icon: XCircle,
      color: "text-red-600",
      bg: "bg-red-50",
      sub: "Last 30 days",
      severity: riskIndicators.failedPayments > 10 ? "high" : riskIndicators.failedPayments > 3 ? "medium" : "low",
    },
    {
      label: "Duplicate Emails",
      value: riskIndicators.duplicateEmailCount,
      icon: Users,
      color: "text-amber-600",
      bg: "bg-amber-50",
      sub: "Multiple orders in 24h",
      severity: riskIndicators.duplicateEmailCount > 5 ? "high" : riskIndicators.duplicateEmailCount > 0 ? "medium" : "low",
    },
    {
      label: "High-Value Orders",
      value: riskIndicators.highValueOrderCount,
      icon: DollarSign,
      color: "text-[#2E1A47]",
      bg: "bg-[#2E1A47]/5",
      sub: "Above NGN 50,000",
      severity: "info" as const,
    },
    {
      label: "Cancelled Rate",
      value: `${riskIndicators.cancelledRate}%`,
      icon: AlertTriangle,
      color: "text-orange-600",
      bg: "bg-orange-50",
      sub: `${riskIndicators.cancelledCount} of ${riskIndicators.totalOrdersLast30} orders`,
      severity: riskIndicators.cancelledRate > 20 ? "high" : riskIndicators.cancelledRate > 10 ? "medium" : "low",
    },
  ];

  const severityBorder: Record<string, string> = {
    high: "border-l-4 border-l-red-500",
    medium: "border-l-4 border-l-amber-400",
    low: "border-l-4 border-l-green-400",
    info: "border-l-4 border-l-[#2E1A47]",
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-serif text-neutral-900 mb-1">Fraud Monitor</h1>
          <p className="text-sm font-sans text-neutral-500">Security monitoring and risk indicators</p>
        </div>
        <button
          onClick={fetchFraudData}
          className="flex items-center gap-2 px-4 py-2 text-xs font-sans font-medium text-neutral-600 border border-neutral-200 hover:bg-neutral-50 rounded-none transition-colors"
        >
          <RefreshCw size={14} />
          Refresh
        </button>
      </div>

      {/* Risk Indicator Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {riskCards.map((card) => {
          const Icon = card.icon;
          return (
            <div
              key={card.label}
              className={`bg-white rounded-xl border border-neutral-200 shadow-sm p-5 ${severityBorder[card.severity]}`}
            >
              <div className="flex items-center justify-between mb-3">
                <span className="text-[10px] font-sans font-semibold tracking-[0.15em] uppercase text-neutral-400">
                  {card.label}
                </span>
                <div className={`w-8 h-8 rounded-lg ${card.bg} flex items-center justify-center`}>
                  <Icon size={16} className={card.color} />
                </div>
              </div>
              <p className="text-2xl font-serif font-semibold text-neutral-900">{card.value}</p>
              <p className="text-[11px] font-sans text-neutral-400 mt-1">{card.sub}</p>
            </div>
          );
        })}
      </div>

      {/* Tabs for suspicious activity / high-value / duplicates */}
      <div className="bg-white rounded-xl border border-neutral-200 shadow-sm overflow-hidden">
        <div className="flex border-b border-neutral-100">
          <button
            onClick={() => setActiveTab("suspicious")}
            className={`px-5 py-3 text-xs font-sans font-medium transition-colors ${
              activeTab === "suspicious"
                ? "text-[#0D2C22] border-b-2 border-[#0D2C22] bg-neutral-50/50"
                : "text-neutral-400 hover:text-neutral-600"
            }`}
          >
            <span className="flex items-center gap-2">
              <ShieldAlert size={14} />
              Suspicious Activity ({data.suspiciousActivity.length})
            </span>
          </button>
          <button
            onClick={() => setActiveTab("highvalue")}
            className={`px-5 py-3 text-xs font-sans font-medium transition-colors ${
              activeTab === "highvalue"
                ? "text-[#0D2C22] border-b-2 border-[#0D2C22] bg-neutral-50/50"
                : "text-neutral-400 hover:text-neutral-600"
            }`}
          >
            <span className="flex items-center gap-2">
              <DollarSign size={14} />
              High-Value Orders ({data.highValueOrders.length})
            </span>
          </button>
          <button
            onClick={() => setActiveTab("duplicates")}
            className={`px-5 py-3 text-xs font-sans font-medium transition-colors ${
              activeTab === "duplicates"
                ? "text-[#0D2C22] border-b-2 border-[#0D2C22] bg-neutral-50/50"
                : "text-neutral-400 hover:text-neutral-600"
            }`}
          >
            <span className="flex items-center gap-2">
              <Users size={14} />
              Duplicate Emails ({data.duplicateEmailOrders.length})
            </span>
          </button>
        </div>

        {/* Suspicious Activity Table */}
        {activeTab === "suspicious" && (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-neutral-100 bg-neutral-50/50">
                  <th className="text-left px-4 py-3 text-[10px] font-sans font-semibold tracking-[0.15em] uppercase text-neutral-400">Date</th>
                  <th className="text-left px-4 py-3 text-[10px] font-sans font-semibold tracking-[0.15em] uppercase text-neutral-400">Order</th>
                  <th className="text-left px-4 py-3 text-[10px] font-sans font-semibold tracking-[0.15em] uppercase text-neutral-400">Customer</th>
                  <th className="text-left px-4 py-3 text-[10px] font-sans font-semibold tracking-[0.15em] uppercase text-neutral-400">Amount</th>
                  <th className="text-left px-4 py-3 text-[10px] font-sans font-semibold tracking-[0.15em] uppercase text-neutral-400">Reason</th>
                  <th className="text-left px-4 py-3 text-[10px] font-sans font-semibold tracking-[0.15em] uppercase text-neutral-400">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-neutral-100">
                {data.suspiciousActivity.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="px-4 py-12 text-center">
                      <ShieldCheck className="h-8 w-8 text-green-300 mx-auto mb-2" />
                      <p className="text-sm font-sans text-neutral-400">No suspicious activity detected</p>
                    </td>
                  </tr>
                ) : (
                  data.suspiciousActivity.map((item, idx) => (
                    <tr key={`${item.id}-${idx}`} className="hover:bg-neutral-50 transition-colors">
                      <td className="px-4 py-3">
                        <p className="text-xs font-sans text-neutral-600">
                          {new Date(item.createdAt).toLocaleDateString("en-NG", {
                            day: "numeric",
                            month: "short",
                          })}
                        </p>
                        <p className="text-[10px] font-sans text-neutral-400">
                          {new Date(item.createdAt).toLocaleTimeString("en-NG", {
                            hour: "2-digit",
                            minute: "2-digit",
                          })}
                        </p>
                      </td>
                      <td className="px-4 py-3">
                        <a
                          href={`/admin/orders?search=${item.orderNumber}`}
                          className="text-xs font-mono font-medium text-[#0D2C22] hover:underline inline-flex items-center gap-1"
                        >
                          {item.orderNumber}
                          <ExternalLink size={10} className="opacity-50" />
                        </a>
                      </td>
                      <td className="px-4 py-3">
                        <p className="text-xs font-sans text-neutral-600 max-w-[160px] truncate">{item.email}</p>
                      </td>
                      <td className="px-4 py-3 text-xs font-sans font-medium text-neutral-800">
                        {formatPrice(item.totalCents, item.currency)}
                      </td>
                      <td className="px-4 py-3">
                        <span className={`inline-flex px-2 py-0.5 text-[9px] font-sans font-semibold tracking-wider uppercase rounded ${
                          item.reason.includes("Failed")
                            ? "bg-red-100 text-red-700"
                            : "bg-amber-100 text-amber-700"
                        }`}>
                          {item.reason}
                        </span>
                      </td>
                      <td className="px-4 py-3">
                        <span className={`inline-flex px-2 py-0.5 text-[9px] font-sans font-semibold tracking-wider uppercase rounded ${
                          item.paymentStatus === "FAILED"
                            ? "bg-red-50 text-red-600"
                            : item.paymentStatus === "CAPTURED"
                            ? "bg-green-50 text-green-600"
                            : "bg-neutral-100 text-neutral-600"
                        }`}>
                          {item.paymentStatus}
                        </span>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        )}

        {/* High-Value Orders Table */}
        {activeTab === "highvalue" && (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-neutral-100 bg-neutral-50/50">
                  <th className="text-left px-4 py-3 text-[10px] font-sans font-semibold tracking-[0.15em] uppercase text-neutral-400">Date</th>
                  <th className="text-left px-4 py-3 text-[10px] font-sans font-semibold tracking-[0.15em] uppercase text-neutral-400">Order</th>
                  <th className="text-left px-4 py-3 text-[10px] font-sans font-semibold tracking-[0.15em] uppercase text-neutral-400">Customer</th>
                  <th className="text-left px-4 py-3 text-[10px] font-sans font-semibold tracking-[0.15em] uppercase text-neutral-400">Amount</th>
                  <th className="text-left px-4 py-3 text-[10px] font-sans font-semibold tracking-[0.15em] uppercase text-neutral-400">Payment</th>
                  <th className="text-left px-4 py-3 text-[10px] font-sans font-semibold tracking-[0.15em] uppercase text-neutral-400">Order Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-neutral-100">
                {data.highValueOrders.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="px-4 py-12 text-center">
                      <DollarSign className="h-8 w-8 text-neutral-300 mx-auto mb-2" />
                      <p className="text-sm font-sans text-neutral-400">No high-value orders in the last 30 days</p>
                    </td>
                  </tr>
                ) : (
                  data.highValueOrders.map((order) => (
                    <tr key={order.id} className="hover:bg-neutral-50 transition-colors">
                      <td className="px-4 py-3 text-xs font-sans text-neutral-600">
                        {new Date(order.createdAt).toLocaleDateString("en-NG", {
                          day: "numeric",
                          month: "short",
                          year: "numeric",
                        })}
                      </td>
                      <td className="px-4 py-3">
                        <a
                          href={`/admin/orders?search=${order.orderNumber}`}
                          className="text-xs font-mono font-medium text-[#0D2C22] hover:underline inline-flex items-center gap-1"
                        >
                          {order.orderNumber}
                          <ExternalLink size={10} className="opacity-50" />
                        </a>
                      </td>
                      <td className="px-4 py-3 text-xs font-sans text-neutral-600 max-w-[160px] truncate">
                        {order.email}
                      </td>
                      <td className="px-4 py-3 text-sm font-sans font-semibold text-[#2E1A47]">
                        {formatPrice(order.totalCents, order.currency)}
                      </td>
                      <td className="px-4 py-3">
                        <span className={`inline-flex px-2 py-0.5 text-[9px] font-sans font-semibold tracking-wider uppercase rounded ${
                          order.paymentStatus === "CAPTURED"
                            ? "bg-green-100 text-green-700"
                            : order.paymentStatus === "FAILED"
                            ? "bg-red-100 text-red-700"
                            : "bg-amber-100 text-amber-700"
                        }`}>
                          {order.paymentStatus}
                        </span>
                      </td>
                      <td className="px-4 py-3">
                        <span className={`inline-flex px-2 py-0.5 text-[9px] font-sans font-semibold tracking-wider uppercase rounded ${
                          order.status === "DELIVERED"
                            ? "bg-green-100 text-green-700"
                            : order.status === "CANCELLED"
                            ? "bg-red-100 text-red-700"
                            : "bg-blue-100 text-blue-700"
                        }`}>
                          {order.status}
                        </span>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        )}

        {/* Duplicate Emails Table */}
        {activeTab === "duplicates" && (
          <div className="overflow-x-auto">
            {data.duplicateEmailOrders.length === 0 ? (
              <div className="px-4 py-12 text-center">
                <ShieldCheck className="h-8 w-8 text-green-300 mx-auto mb-2" />
                <p className="text-sm font-sans text-neutral-400">No duplicate email patterns detected</p>
              </div>
            ) : (
              <div className="divide-y divide-neutral-100">
                {data.duplicateEmailOrders.map((dup, idx) => (
                  <div key={idx} className="p-4">
                    <div className="flex items-center gap-3 mb-3">
                      <Users size={14} className="text-amber-500" />
                      <span className="text-xs font-sans font-medium text-neutral-700">{dup.email}</span>
                      <span className="inline-flex px-2 py-0.5 text-[9px] font-sans font-semibold tracking-wider uppercase rounded bg-amber-100 text-amber-700">
                        {dup.orderCount} orders
                      </span>
                    </div>
                    <div className="ml-7 space-y-1.5">
                      {dup.orders.map((order) => (
                        <div key={order.id} className="flex items-center gap-4 text-xs font-sans text-neutral-500">
                          <a
                            href={`/admin/orders?search=${order.orderNumber}`}
                            className="font-mono font-medium text-[#0D2C22] hover:underline"
                          >
                            {order.orderNumber}
                          </a>
                          <span>{formatPrice(order.totalCents, order.currency)}</span>
                          <span>
                            {new Date(order.createdAt).toLocaleDateString("en-NG", {
                              day: "numeric",
                              month: "short",
                              hour: "2-digit",
                              minute: "2-digit",
                            })}
                          </span>
                          <span className={`inline-flex px-1.5 py-0.5 text-[8px] font-semibold tracking-wider uppercase rounded ${
                            order.paymentStatus === "CAPTURED"
                              ? "bg-green-50 text-green-600"
                              : order.paymentStatus === "FAILED"
                              ? "bg-red-50 text-red-600"
                              : "bg-neutral-100 text-neutral-500"
                          }`}>
                            {order.paymentStatus}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>

      {/* Security Status */}
      <div className="bg-white rounded-xl border border-neutral-200 shadow-sm overflow-hidden">
        <div className="px-5 py-4 border-b border-neutral-100 bg-neutral-50/50">
          <div className="flex items-center gap-2">
            <Shield size={16} className="text-[#0D2C22]" />
            <h2 className="text-sm font-serif font-semibold text-neutral-800">Security Status</h2>
          </div>
        </div>
        <div className="divide-y divide-neutral-100">
          {SECURITY_CHECKS.map((check) => {
            const Icon = check.icon;
            return (
              <div key={check.name} className="flex items-center gap-4 px-5 py-4">
                <div className="w-9 h-9 rounded-lg bg-green-50 flex items-center justify-center shrink-0">
                  <Icon size={16} className="text-green-600" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-sans font-medium text-neutral-800">{check.name}</p>
                  <p className="text-[11px] font-sans text-neutral-400">{check.description}</p>
                </div>
                <span className="inline-flex items-center gap-1.5 px-2.5 py-1 text-[9px] font-sans font-semibold tracking-wider uppercase rounded-full bg-green-100 text-green-700">
                  <span className="w-1.5 h-1.5 rounded-full bg-green-500" />
                  Active
                </span>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
