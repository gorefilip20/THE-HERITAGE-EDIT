"use client";

import { AdminDashboard } from "@/components/admin/AdminDashboard";

export default function DashboardPage() {
  return (
    <div>
      <div className="mb-8">
        <h1 className="text-2xl font-serif text-obsidian mb-1">Dashboard</h1>
        <p className="text-sm font-sans text-neutral-400">
          Real-time overview of your luxury marketplace
        </p>
      </div>
      <AdminDashboard />
    </div>
  );
}
