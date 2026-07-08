"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState, useEffect } from "react";
import {
  LayoutDashboard,
  Package,
  Truck,
  AlertCircle,
  Settings,
  LogOut,
  Menu,
  X,
} from "lucide-react";

interface WarehouseLayoutProps {
  children: React.ReactNode;
}

const WAREHOUSE_NAV = [
  { label: "Dashboard", href: "/warehouse", icon: LayoutDashboard },
  { label: "Inventory", href: "/warehouse/inventory", icon: Package },
  { label: "Shipments", href: "/warehouse/shipments", icon: Truck },
  { label: "Alerts", href: "/warehouse/alerts", icon: AlertCircle },
  { label: "Settings", href: "/warehouse/settings", icon: Settings },
];

export default function WarehouseLayout({ children }: WarehouseLayoutProps) {
  const router = useRouter();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [warehouseName, setWarehouseName] = useState("Warehouse");

  useEffect(() => {
    fetch("/api/warehouse/me")
      .then((r) => r.json())
      .then((d) => setWarehouseName(d.name || "Warehouse"))
      .catch(() => {});
  }, []);

  const handleLogout = async () => {
    await fetch("/api/auth/logout", { method: "POST" });
    router.push("/auth/login");
  };

  return (
    <div className="flex h-screen bg-neutral-50">
      {/* Sidebar */}
      <aside
        className={`fixed md:relative z-40 h-screen w-64 bg-blue-900 text-white transition-transform duration-300 ${
          sidebarOpen ? "translate-x-0" : "-translate-x-full md:translate-x-0"
        }`}
      >
        <div className="p-6 border-b border-white/10">
          <h1 className="text-xl font-serif tracking-wide">Warehouse Hub</h1>
          <p className="text-xs font-sans text-white/50 mt-1">{warehouseName}</p>
        </div>

        <nav className="p-4 space-y-2">
          {WAREHOUSE_NAV.map((item) => {
            const Icon = item.icon;
            return (
              <Link
                key={item.href}
                href={item.href}
                className="flex items-center gap-3 px-4 py-3 rounded-lg text-[13px] font-sans font-medium text-white/70 hover:bg-white/10 hover:text-white transition-all duration-200"
                onClick={() => setSidebarOpen(false)}
              >
                <Icon size={16} />
                {item.label}
              </Link>
            );
          })}
        </nav>

        <div className="absolute bottom-0 left-0 right-0 p-4 border-t border-white/10">
          <button
            onClick={handleLogout}
            className="flex items-center gap-3 w-full px-4 py-3 rounded-lg text-[13px] font-sans font-medium text-white/70 hover:bg-white/10 hover:text-white transition-all duration-200"
          >
            <LogOut size={16} />
            Logout
          </button>
        </div>
      </aside>

      {/* Mobile toggle */}
      <button
        onClick={() => setSidebarOpen(!sidebarOpen)}
        className="md:hidden fixed bottom-6 right-6 z-50 w-12 h-12 bg-blue-900 text-white flex items-center justify-center rounded-full shadow-lg"
      >
        {sidebarOpen ? <X size={20} /> : <Menu size={20} />}
      </button>

      {/* Main content */}
      <main className="flex-1 overflow-auto">
        <div className="p-6 md:p-10">{children}</div>
      </main>
    </div>
  );
}
