"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { AlertTriangle, Package, Truck, CheckCircle } from "lucide-react";

interface WarehouseMetrics {
  totalItems: number;
  lowStockItems: number;
  pendingShipments: number;
  completedShipments: number;
  inventoryValue: number;
  stockAlerts: any[];
  pendingOrders: any[];
}

export default function WarehouseDashboard() {
  const [metrics, setMetrics] = useState<WarehouseMetrics | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/warehouse/metrics")
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
          Warehouse Dashboard
        </h1>
        <p className="text-[13px] font-sans text-neutral-500">
          Real-time inventory and shipment tracking.
        </p>
      </div>

      {/* Metrics Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {/* Total Items */}
        <div className="bg-white border border-slate-border p-6 rounded-lg">
          <div className="flex items-start justify-between mb-4">
            <div>
              <p className="text-[11px] font-sans font-medium tracking-wider uppercase text-neutral-500 mb-1">
                Total Items
              </p>
              <p className="text-2xl font-serif text-obsidian">
                {metrics.totalItems.toLocaleString()}
              </p>
            </div>
            <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
              <Package size={18} className="text-blue-600" />
            </div>
          </div>
          <Link href="/warehouse/inventory" className="text-[12px] font-sans text-blue-600">
            View inventory →
          </Link>
        </div>

        {/* Low Stock */}
        <div className="bg-white border border-slate-border p-6 rounded-lg">
          <div className="flex items-start justify-between mb-4">
            <div>
              <p className="text-[11px] font-sans font-medium tracking-wider uppercase text-neutral-500 mb-1">
                Low Stock Items
              </p>
              <p className="text-2xl font-serif text-obsidian">
                {metrics.lowStockItems}
              </p>
            </div>
            <div className="w-10 h-10 bg-red-100 rounded-lg flex items-center justify-center">
              <AlertTriangle size={18} className="text-red-600" />
            </div>
          </div>
          <p className="text-[12px] font-sans text-red-600">
            Requires attention
          </p>
        </div>

        {/* Pending Shipments */}
        <div className="bg-white border border-slate-border p-6 rounded-lg">
          <div className="flex items-start justify-between mb-4">
            <div>
              <p className="text-[11px] font-sans font-medium tracking-wider uppercase text-neutral-500 mb-1">
                Pending Shipments
              </p>
              <p className="text-2xl font-serif text-obsidian">
                {metrics.pendingShipments}
              </p>
            </div>
            <div className="w-10 h-10 bg-yellow-100 rounded-lg flex items-center justify-center">
              <Truck size={18} className="text-yellow-600" />
            </div>
          </div>
          <Link href="/warehouse/shipments" className="text-[12px] font-sans text-yellow-600">
            Manage shipments →
          </Link>
        </div>

        {/* Completed Shipments */}
        <div className="bg-white border border-slate-border p-6 rounded-lg">
          <div className="flex items-start justify-between mb-4">
            <div>
              <p className="text-[11px] font-sans font-medium tracking-wider uppercase text-neutral-500 mb-1">
                Completed Today
              </p>
              <p className="text-2xl font-serif text-obsidian">
                {metrics.completedShipments}
              </p>
            </div>
            <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
              <CheckCircle size={18} className="text-green-600" />
            </div>
          </div>
          <p className="text-[12px] font-sans text-green-600">
            On schedule
          </p>
        </div>
      </div>

      {/* Stock Alerts */}
      {metrics.stockAlerts.length > 0 && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-6">
          <h2 className="text-lg font-serif text-red-900 mb-4">Stock Alerts</h2>
          <div className="space-y-3">
            {metrics.stockAlerts.slice(0, 5).map((alert) => (
              <div key={alert.id} className="flex items-center justify-between">
                <div>
                  <p className="font-medium text-red-900">{alert.productName}</p>
                  <p className="text-[12px] font-sans text-red-700">
                    {alert.currentStock} units remaining
                  </p>
                </div>
                <button className="px-3 py-1 bg-red-600 text-white text-[11px] font-sans font-semibold rounded hover:bg-red-700">
                  Reorder
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Pending Orders */}
      <div className="bg-white border border-slate-border rounded-lg overflow-hidden">
        <div className="p-6 border-b border-slate-border">
          <h2 className="text-lg font-serif text-obsidian">Pending Orders for Fulfillment</h2>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-[13px]">
            <thead className="bg-neutral-50 border-b border-slate-border">
              <tr>
                <th className="px-6 py-3 text-left font-sans font-medium text-neutral-600">
                  Order ID
                </th>
                <th className="px-6 py-3 text-left font-sans font-medium text-neutral-600">
                  Items
                </th>
                <th className="px-6 py-3 text-left font-sans font-medium text-neutral-600">
                  Destination
                </th>
                <th className="px-6 py-3 text-left font-sans font-medium text-neutral-600">
                  Date
                </th>
                <th className="px-6 py-3 text-left font-sans font-medium text-neutral-600">
                  Action
                </th>
              </tr>
            </thead>
            <tbody>
              {metrics.pendingOrders.slice(0, 5).map((order) => (
                <tr key={order.id} className="border-b border-slate-border hover:bg-neutral-50">
                  <td className="px-6 py-4 font-mono text-neutral-600">
                    {order.id.slice(0, 8)}
                  </td>
                  <td className="px-6 py-4">{order.itemCount} items</td>
                  <td className="px-6 py-4">{order.destination}</td>
                  <td className="px-6 py-4 text-neutral-500">
                    {new Date(order.createdAt).toLocaleDateString()}
                  </td>
                  <td className="px-6 py-4">
                    <button className="text-blue-600 hover:text-blue-700 text-[11px] font-semibold">
                      Process
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
