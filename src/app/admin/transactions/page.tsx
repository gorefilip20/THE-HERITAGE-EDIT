"use client";

import { useState, useEffect } from "react";
import {
  DollarSign,
  TrendingUp,
  TrendingDown,
  ArrowUpRight,
  Filter,
  Download,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";
import { formatPrice } from "@/lib/utils";

interface Transaction {
  id: string;
  orderNumber: string;
  email: string;
  customerName: string;
  totalCents: number;
  paymentStatus: string;
  paymentProvider: string;
  orderStatus: string;
  currency: string;
  createdAt: string;
  type: string;
}

interface Summary {
  totalRevenue: number;
  totalRefunds: number;
  netRevenue: number;
  totalTransactions: number;
}

const STATUS_COLORS: Record<string, string> = {
  CAPTURED: "bg-emerald-100 text-emerald-700",
  PENDING: "bg-amber-100 text-amber-700",
  FAILED: "bg-red-100 text-red-700",
  REFUNDED: "bg-purple-100 text-purple-700",
  AUTHORIZED: "bg-blue-100 text-blue-700",
};

export default function TransactionsPage() {
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [summary, setSummary] = useState<Summary | null>(null);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [statusFilter, setStatusFilter] = useState("");
  const [providerFilter, setProviderFilter] = useState("");

  useEffect(() => {
    async function fetchData() {
      setLoading(true);
      const params = new URLSearchParams({ page: String(page), pageSize: "20" });
      if (statusFilter) params.set("status", statusFilter);
      if (providerFilter) params.set("provider", providerFilter);

      try {
        const res = await fetch(`/api/admin/transactions?${params}`);
        if (res.ok) {
          const data = await res.json();
          setTransactions(data.data);
          setSummary(data.summary);
          setTotalPages(data.pagination.totalPages);
        }
      } catch {
        /* ignore */
      }
      setLoading(false);
    }
    fetchData();
  }, [page, statusFilter, providerFilter]);

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-serif text-neutral-900 mb-1">Transactions</h1>
          <p className="text-sm text-neutral-500">Track all payments, refunds, and revenue</p>
        </div>
        <button className="flex items-center gap-2 px-4 py-2 border border-neutral-200 bg-white text-xs font-medium tracking-wider uppercase text-neutral-600 hover:bg-neutral-50 transition-colors">
          <Download size={14} />
          Export CSV
        </button>
      </div>

      {/* Summary Cards */}
      {summary && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
          <div className="p-5 rounded-xl border border-emerald-100 bg-gradient-to-br from-white to-emerald-50/30 shadow-sm">
            <div className="flex items-start justify-between">
              <div className="p-2 rounded-lg bg-emerald-100 text-emerald-600">
                <DollarSign className="h-4 w-4" />
              </div>
              <TrendingUp size={14} className="text-emerald-500" />
            </div>
            <div className="mt-3">
              <span className="text-2xl font-semibold tracking-tight text-neutral-900">
                {formatPrice(summary.totalRevenue)}
              </span>
            </div>
            <p className="text-xs font-medium text-neutral-500 mt-1">Total Revenue</p>
          </div>
          <div className="p-5 rounded-xl border border-red-100 bg-gradient-to-br from-white to-red-50/30 shadow-sm">
            <div className="flex items-start justify-between">
              <div className="p-2 rounded-lg bg-red-100 text-red-600">
                <TrendingDown className="h-4 w-4" />
              </div>
            </div>
            <div className="mt-3">
              <span className="text-2xl font-semibold tracking-tight text-neutral-900">
                {formatPrice(summary.totalRefunds)}
              </span>
            </div>
            <p className="text-xs font-medium text-neutral-500 mt-1">Total Refunds</p>
          </div>
          <div className="p-5 rounded-xl border border-blue-100 bg-gradient-to-br from-white to-blue-50/30 shadow-sm">
            <div className="flex items-start justify-between">
              <div className="p-2 rounded-lg bg-blue-100 text-blue-600">
                <ArrowUpRight className="h-4 w-4" />
              </div>
            </div>
            <div className="mt-3">
              <span className="text-2xl font-semibold tracking-tight text-neutral-900">
                {formatPrice(summary.netRevenue)}
              </span>
            </div>
            <p className="text-xs font-medium text-neutral-500 mt-1">Net Revenue</p>
          </div>
          <div className="p-5 rounded-xl border border-purple-100 bg-gradient-to-br from-white to-purple-50/30 shadow-sm">
            <div className="flex items-start justify-between">
              <div className="p-2 rounded-lg bg-purple-100 text-purple-600">
                <DollarSign className="h-4 w-4" />
              </div>
            </div>
            <div className="mt-3">
              <span className="text-2xl font-semibold tracking-tight text-neutral-900">
                {summary.totalTransactions.toLocaleString()}
              </span>
            </div>
            <p className="text-xs font-medium text-neutral-500 mt-1">Total Transactions</p>
          </div>
        </div>
      )}

      {/* Filters */}
      <div className="flex items-center gap-3 mb-4">
        <div className="flex items-center gap-2">
          <Filter size={14} className="text-neutral-400" />
          <select
            value={statusFilter}
            onChange={(e) => { setStatusFilter(e.target.value); setPage(1); }}
            className="h-9 px-3 text-xs font-sans border border-neutral-200 bg-white focus:outline-none focus:border-[#0D2C22]"
          >
            <option value="">All Statuses</option>
            <option value="CAPTURED">Captured</option>
            <option value="PENDING">Pending</option>
            <option value="FAILED">Failed</option>
            <option value="REFUNDED">Refunded</option>
          </select>
          <select
            value={providerFilter}
            onChange={(e) => { setProviderFilter(e.target.value); setPage(1); }}
            className="h-9 px-3 text-xs font-sans border border-neutral-200 bg-white focus:outline-none focus:border-[#0D2C22]"
          >
            <option value="">All Providers</option>
            <option value="paystack">Paystack</option>
            <option value="flutterwave">Flutterwave</option>
          </select>
        </div>
      </div>

      {/* Transactions Table */}
      <div className="bg-white rounded-xl border border-neutral-200 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-neutral-50 border-b border-neutral-200">
              <tr>
                <th className="text-left px-4 py-3 text-[10px] font-sans font-bold tracking-[0.15em] uppercase text-neutral-400">Date</th>
                <th className="text-left px-4 py-3 text-[10px] font-sans font-bold tracking-[0.15em] uppercase text-neutral-400">Order</th>
                <th className="text-left px-4 py-3 text-[10px] font-sans font-bold tracking-[0.15em] uppercase text-neutral-400">Customer</th>
                <th className="text-left px-4 py-3 text-[10px] font-sans font-bold tracking-[0.15em] uppercase text-neutral-400">Provider</th>
                <th className="text-left px-4 py-3 text-[10px] font-sans font-bold tracking-[0.15em] uppercase text-neutral-400">Status</th>
                <th className="text-left px-4 py-3 text-[10px] font-sans font-bold tracking-[0.15em] uppercase text-neutral-400">Type</th>
                <th className="text-right px-4 py-3 text-[10px] font-sans font-bold tracking-[0.15em] uppercase text-neutral-400">Amount</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-neutral-100">
              {loading ? (
                Array.from({ length: 5 }).map((_, i) => (
                  <tr key={i}>
                    <td colSpan={7} className="px-4 py-4">
                      <div className="h-4 bg-neutral-100 rounded animate-pulse" />
                    </td>
                  </tr>
                ))
              ) : transactions.length === 0 ? (
                <tr>
                  <td colSpan={7} className="px-4 py-12 text-center text-neutral-400">
                    No transactions found
                  </td>
                </tr>
              ) : (
                transactions.map((t) => (
                  <tr key={t.id} className="hover:bg-neutral-50 transition-colors">
                    <td className="px-4 py-3 text-xs text-neutral-500 whitespace-nowrap">
                      {new Date(t.createdAt).toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" })}
                    </td>
                    <td className="px-4 py-3">
                      <span className="text-xs font-medium text-[#0D2C22]">{t.orderNumber}</span>
                    </td>
                    <td className="px-4 py-3">
                      <p className="text-xs font-medium text-neutral-800 truncate max-w-[150px]">{t.customerName}</p>
                      <p className="text-[10px] text-neutral-400">{t.email}</p>
                    </td>
                    <td className="px-4 py-3">
                      <span className="text-xs capitalize text-neutral-600">{t.paymentProvider}</span>
                    </td>
                    <td className="px-4 py-3">
                      <span className={`inline-flex px-2 py-0.5 text-[9px] font-semibold tracking-wider uppercase rounded ${STATUS_COLORS[t.paymentStatus] || "bg-neutral-100 text-neutral-600"}`}>
                        {t.paymentStatus}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <span className={`text-xs font-medium ${t.type === "Refund" ? "text-red-600" : "text-emerald-600"}`}>
                        {t.type}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-right">
                      <span className={`text-sm font-medium tabular-nums ${t.type === "Refund" ? "text-red-600" : "text-neutral-900"}`}>
                        {t.type === "Refund" ? "-" : ""}{formatPrice(t.totalCents)}
                      </span>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="flex items-center justify-between px-4 py-3 border-t border-neutral-100">
            <p className="text-xs text-neutral-400">
              Page {page} of {totalPages}
            </p>
            <div className="flex items-center gap-1">
              <button
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                disabled={page <= 1}
                className="p-1.5 rounded hover:bg-neutral-100 disabled:opacity-30 transition-colors"
              >
                <ChevronLeft size={14} />
              </button>
              <button
                onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                disabled={page >= totalPages}
                className="p-1.5 rounded hover:bg-neutral-100 disabled:opacity-30 transition-colors"
              >
                <ChevronRight size={14} />
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
