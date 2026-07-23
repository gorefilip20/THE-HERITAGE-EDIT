"use client";

import { useState, useEffect, useRef } from "react";
import Link from "next/link";
import { Bell, AlertTriangle, Package } from "lucide-react";

interface StockAlert {
  variantId: string;
  productId: string;
  productName: string;
  brandName: string;
  size: string;
  color: string | null;
  waitingCustomers: number;
}

export default function StockAlertDropdown() {
  const [open, setOpen] = useState(false);
  const [alerts, setAlerts] = useState<StockAlert[]>([]);
  const [count, setCount] = useState(0);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    fetch("/api/admin/stock-alerts")
      .then((r) => r.json())
      .then((data) => {
        setAlerts(data.outOfStock || []);
        setCount(data.totalOutOfStock || 0);
      })
      .catch(() => {});
  }, []);

  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    }
    if (open) document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, [open]);

  return (
    <div ref={ref} className="relative">
      <button
        onClick={() => setOpen(!open)}
        className="relative p-2 text-white/60 hover:text-white hover:bg-white/10 rounded-lg transition-all"
      >
        <Bell size={16} />
        {count > 0 && (
          <span className="absolute -top-0.5 -right-0.5 min-w-[16px] h-4 px-1 flex items-center justify-center rounded-full bg-red-500 text-white text-[9px] font-bold">
            {count > 99 ? "99+" : count}
          </span>
        )}
      </button>

      {open && (
        <div className="absolute right-0 top-full mt-2 w-80 bg-white shadow-xl border border-neutral-200 z-50 overflow-hidden">
          <div className="px-4 py-3 border-b border-neutral-100 bg-neutral-50">
            <div className="flex items-center justify-between">
              <h3 className="text-xs font-sans font-semibold text-neutral-700">Stock Alerts</h3>
              <span className="text-[10px] font-sans font-medium text-red-600 bg-red-50 px-2 py-0.5 rounded-full">
                {count} out of stock
              </span>
            </div>
          </div>

          <div className="max-h-[300px] overflow-y-auto divide-y divide-neutral-50">
            {alerts.length === 0 ? (
              <div className="px-4 py-8 text-center">
                <Package className="h-8 w-8 text-neutral-200 mx-auto mb-2" />
                <p className="text-sm text-neutral-400">All items in stock</p>
              </div>
            ) : (
              alerts.slice(0, 10).map((alert) => (
                <div key={alert.variantId} className="px-4 py-3 hover:bg-neutral-50 transition-colors">
                  <div className="flex items-start gap-3">
                    <AlertTriangle size={14} className="text-amber-500 mt-0.5 shrink-0" />
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-neutral-800 truncate">
                        {alert.productName}
                      </p>
                      <p className="text-[11px] text-neutral-400">
                        {alert.brandName} &middot; Size {alert.size}
                        {alert.color ? ` &middot; ${alert.color}` : ""}
                      </p>
                      {alert.waitingCustomers > 0 && (
                        <p className="text-[10px] text-blue-600 mt-0.5">
                          {alert.waitingCustomers} customer{alert.waitingCustomers > 1 ? "s" : ""} waiting
                        </p>
                      )}
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>

          <div className="px-4 py-2 border-t border-neutral-100 bg-neutral-50">
            <Link
              href="/admin/products"
              onClick={() => setOpen(false)}
              className="text-[11px] font-sans font-medium text-[#0D2C22] hover:underline"
            >
              View all products →
            </Link>
          </div>
        </div>
      )}
    </div>
  );
}
