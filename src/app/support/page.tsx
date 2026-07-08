"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Clock, CheckCircle, AlertCircle, MessageSquare } from "lucide-react";

interface SupportMetrics {
  openTickets: number;
  resolvedToday: number;
  avgResponseTime: number;
  customerSatisfaction: number;
  recentTickets: any[];
  topIssues: any[];
}

export default function SupportDashboard() {
  const [metrics, setMetrics] = useState<SupportMetrics | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/support/metrics")
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
          Customer Service Dashboard
        </h1>
        <p className="text-[13px] font-sans text-neutral-500">
          Manage support tickets and customer inquiries.
        </p>
      </div>

      {/* Metrics Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {/* Open Tickets */}
        <div className="bg-white border border-slate-border p-6 rounded-lg">
          <div className="flex items-start justify-between mb-4">
            <div>
              <p className="text-[11px] font-sans font-medium tracking-wider uppercase text-neutral-500 mb-1">
                Open Tickets
              </p>
              <p className="text-2xl font-serif text-obsidian">
                {metrics.openTickets}
              </p>
            </div>
            <div className="w-10 h-10 bg-red-100 rounded-lg flex items-center justify-center">
              <AlertCircle size={18} className="text-red-600" />
            </div>
          </div>
          <Link href="/support/tickets" className="text-[12px] font-sans text-red-600">
            View all →
          </Link>
        </div>

        {/* Resolved Today */}
        <div className="bg-white border border-slate-border p-6 rounded-lg">
          <div className="flex items-start justify-between mb-4">
            <div>
              <p className="text-[11px] font-sans font-medium tracking-wider uppercase text-neutral-500 mb-1">
                Resolved Today
              </p>
              <p className="text-2xl font-serif text-obsidian">
                {metrics.resolvedToday}
              </p>
            </div>
            <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
              <CheckCircle size={18} className="text-green-600" />
            </div>
          </div>
          <p className="text-[12px] font-sans text-green-600">Great progress</p>
        </div>

        {/* Avg Response Time */}
        <div className="bg-white border border-slate-border p-6 rounded-lg">
          <div className="flex items-start justify-between mb-4">
            <div>
              <p className="text-[11px] font-sans font-medium tracking-wider uppercase text-neutral-500 mb-1">
                Avg Response Time
              </p>
              <p className="text-2xl font-serif text-obsidian">
                {metrics.avgResponseTime}m
              </p>
            </div>
            <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
              <Clock size={18} className="text-blue-600" />
            </div>
          </div>
          <p className="text-[12px] font-sans text-blue-600">Within target</p>
        </div>

        {/* Satisfaction */}
        <div className="bg-white border border-slate-border p-6 rounded-lg">
          <div className="flex items-start justify-between mb-4">
            <div>
              <p className="text-[11px] font-sans font-medium tracking-wider uppercase text-neutral-500 mb-1">
                Satisfaction
              </p>
              <p className="text-2xl font-serif text-obsidian">
                {metrics.customerSatisfaction}%
              </p>
            </div>
            <div className="w-10 h-10 bg-yellow-100 rounded-lg flex items-center justify-center">
              <MessageSquare size={18} className="text-yellow-600" />
            </div>
          </div>
          <p className="text-[12px] font-sans text-yellow-600">Excellent</p>
        </div>
      </div>

      {/* Recent Tickets */}
      <div className="bg-white border border-slate-border rounded-lg overflow-hidden">
        <div className="p-6 border-b border-slate-border">
          <h2 className="text-lg font-serif text-obsidian">Recent Tickets</h2>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-[13px]">
            <thead className="bg-neutral-50 border-b border-slate-border">
              <tr>
                <th className="px-6 py-3 text-left font-sans font-medium text-neutral-600">
                  Ticket ID
                </th>
                <th className="px-6 py-3 text-left font-sans font-medium text-neutral-600">
                  Customer
                </th>
                <th className="px-6 py-3 text-left font-sans font-medium text-neutral-600">
                  Subject
                </th>
                <th className="px-6 py-3 text-left font-sans font-medium text-neutral-600">
                  Status
                </th>
                <th className="px-6 py-3 text-left font-sans font-medium text-neutral-600">
                  Priority
                </th>
              </tr>
            </thead>
            <tbody>
              {metrics.recentTickets.slice(0, 5).map((ticket) => (
                <tr key={ticket.id} className="border-b border-slate-border hover:bg-neutral-50">
                  <td className="px-6 py-4 font-mono text-neutral-600">
                    {ticket.id.slice(0, 8)}
                  </td>
                  <td className="px-6 py-4">{ticket.customerName}</td>
                  <td className="px-6 py-4">{ticket.subject}</td>
                  <td className="px-6 py-4">
                    <span
                      className={`px-2 py-1 rounded text-[11px] font-semibold uppercase ${
                        ticket.status === "resolved"
                          ? "bg-green-100 text-green-700"
                          : ticket.status === "open"
                          ? "bg-red-100 text-red-700"
                          : "bg-yellow-100 text-yellow-700"
                      }`}
                    >
                      {ticket.status}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <span
                      className={`px-2 py-1 rounded text-[11px] font-semibold uppercase ${
                        ticket.priority === "high"
                          ? "bg-red-100 text-red-700"
                          : ticket.priority === "medium"
                          ? "bg-yellow-100 text-yellow-700"
                          : "bg-green-100 text-green-700"
                      }`}
                    >
                      {ticket.priority}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Top Issues */}
      <div className="bg-white border border-slate-border rounded-lg overflow-hidden">
        <div className="p-6 border-b border-slate-border">
          <h2 className="text-lg font-serif text-obsidian">Top Issues</h2>
        </div>
        <div className="divide-y divide-slate-border">
          {metrics.topIssues.slice(0, 5).map((issue) => (
            <div key={issue.id} className="p-6 flex items-center justify-between hover:bg-neutral-50">
              <div>
                <p className="font-medium text-obsidian">{issue.title}</p>
                <p className="text-[12px] font-sans text-neutral-500 mt-1">
                  {issue.count} occurrences
                </p>
              </div>
              <div className="text-right">
                <p className="text-[12px] font-sans text-neutral-500">
                  {issue.resolutionRate}% resolved
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
