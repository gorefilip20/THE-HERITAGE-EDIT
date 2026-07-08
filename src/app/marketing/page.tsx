"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Megaphone, Mail, Users, TrendingUp } from "lucide-react";

interface MarketingMetrics {
  activeCampaigns: number;
  totalReach: number;
  emailSubscribers: number;
  conversionRate: number;
  campaigns: any[];
  emailPerformance: any[];
}

export default function MarketingDashboard() {
  const [metrics, setMetrics] = useState<MarketingMetrics | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/marketing/metrics")
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
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-display-md font-serif italic text-obsidian mb-2">
            Marketing Dashboard
          </h1>
          <p className="text-[13px] font-sans text-neutral-500">
            Manage campaigns and track performance.
          </p>
        </div>
        <Link
          href="/marketing/campaigns/new"
          className="h-12 px-8 bg-obsidian text-white text-[11px] font-sans font-semibold tracking-[0.15em] uppercase hover:bg-neutral-800 transition-colors"
        >
          New Campaign
        </Link>
      </div>

      {/* Metrics Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {/* Active Campaigns */}
        <div className="bg-white border border-slate-border p-6 rounded-lg">
          <div className="flex items-start justify-between mb-4">
            <div>
              <p className="text-[11px] font-sans font-medium tracking-wider uppercase text-neutral-500 mb-1">
                Active Campaigns
              </p>
              <p className="text-2xl font-serif text-obsidian">
                {metrics.activeCampaigns}
              </p>
            </div>
            <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
              <Megaphone size={18} className="text-blue-600" />
            </div>
          </div>
          <Link href="/marketing/campaigns" className="text-[12px] font-sans text-blue-600">
            View campaigns →
          </Link>
        </div>

        {/* Total Reach */}
        <div className="bg-white border border-slate-border p-6 rounded-lg">
          <div className="flex items-start justify-between mb-4">
            <div>
              <p className="text-[11px] font-sans font-medium tracking-wider uppercase text-neutral-500 mb-1">
                Total Reach
              </p>
              <p className="text-2xl font-serif text-obsidian">
                {(metrics.totalReach / 1000).toFixed(1)}K
              </p>
            </div>
            <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center">
              <Users size={18} className="text-purple-600" />
            </div>
          </div>
          <p className="text-[12px] font-sans text-purple-600">Across all channels</p>
        </div>

        {/* Email Subscribers */}
        <div className="bg-white border border-slate-border p-6 rounded-lg">
          <div className="flex items-start justify-between mb-4">
            <div>
              <p className="text-[11px] font-sans font-medium tracking-wider uppercase text-neutral-500 mb-1">
                Email Subscribers
              </p>
              <p className="text-2xl font-serif text-obsidian">
                {(metrics.emailSubscribers / 1000).toFixed(1)}K
              </p>
            </div>
            <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
              <Mail size={18} className="text-green-600" />
            </div>
          </div>
          <Link href="/marketing/email" className="text-[12px] font-sans text-green-600">
            Manage lists →
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
          <p className="text-[12px] font-sans text-orange-600">Campaign average</p>
        </div>
      </div>

      {/* Active Campaigns */}
      <div className="bg-white border border-slate-border rounded-lg overflow-hidden">
        <div className="p-6 border-b border-slate-border">
          <h2 className="text-lg font-serif text-obsidian">Active Campaigns</h2>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-[13px]">
            <thead className="bg-neutral-50 border-b border-slate-border">
              <tr>
                <th className="px-6 py-3 text-left font-sans font-medium text-neutral-600">
                  Campaign
                </th>
                <th className="px-6 py-3 text-left font-sans font-medium text-neutral-600">
                  Channel
                </th>
                <th className="px-6 py-3 text-left font-sans font-medium text-neutral-600">
                  Reach
                </th>
                <th className="px-6 py-3 text-left font-sans font-medium text-neutral-600">
                  Conversions
                </th>
                <th className="px-6 py-3 text-left font-sans font-medium text-neutral-600">
                  ROI
                </th>
              </tr>
            </thead>
            <tbody>
              {metrics.campaigns.slice(0, 5).map((campaign) => (
                <tr key={campaign.id} className="border-b border-slate-border hover:bg-neutral-50">
                  <td className="px-6 py-4 font-medium">{campaign.name}</td>
                  <td className="px-6 py-4">{campaign.channel}</td>
                  <td className="px-6 py-4">{campaign.reach.toLocaleString()}</td>
                  <td className="px-6 py-4">{campaign.conversions}</td>
                  <td className="px-6 py-4 font-medium text-green-600">
                    {campaign.roi}%
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Email Performance */}
      <div className="bg-white border border-slate-border rounded-lg overflow-hidden">
        <div className="p-6 border-b border-slate-border">
          <h2 className="text-lg font-serif text-obsidian">Email Performance</h2>
        </div>
        <div className="divide-y divide-slate-border">
          {metrics.emailPerformance.slice(0, 5).map((email) => (
            <div key={email.id} className="p-6 flex items-center justify-between hover:bg-neutral-50">
              <div>
                <p className="font-medium text-obsidian">{email.subject}</p>
                <p className="text-[12px] font-sans text-neutral-500 mt-1">
                  Sent to {email.recipients.toLocaleString()} recipients
                </p>
              </div>
              <div className="text-right">
                <p className="text-[12px] font-sans text-neutral-600">
                  {email.openRate}% open · {email.clickRate}% click
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
