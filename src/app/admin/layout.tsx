"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import {
  LayoutDashboard,
  Package,
  ShoppingCart,
  Plus,
  ArrowLeft,
  Users,
  Settings,
  BarChart3,
  Tag,
  Layers,
  LogOut,
  Menu,
  X,
  Globe,
  DollarSign,
  Shield,
} from "lucide-react";
import { cn } from "@/lib/utils";
import GlobalSearch from "@/components/admin/GlobalSearch";
import StockAlertDropdown from "@/components/admin/StockAlertDropdown";

const ADMIN_NAV = [
  { href: "/admin/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { href: "/admin/products", label: "Products", icon: Package },
  { href: "/admin/products/new", label: "Add Product", icon: Plus },
  { href: "/admin/orders", label: "Orders", icon: ShoppingCart },
  { href: "/admin/transactions", label: "Transactions", icon: DollarSign },
  { href: "/admin/customers", label: "Customers", icon: Users },
  { href: "/admin/categories", label: "Categories", icon: Layers },
  { href: "/admin/collections", label: "Collections", icon: Tag },
  { href: "/admin/analytics", label: "Analytics", icon: BarChart3 },
  { href: "/admin/fraud", label: "Fraud Monitor", icon: Shield },
  { href: "/admin/settings", label: "Settings", icon: Settings },
];

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const router = useRouter();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [adminUser, setAdminUser] = useState<{ firstName: string; email: string } | null>(null);

  useEffect(() => {
    fetch("/api/auth/me")
      .then((r) => r.json())
      .then((d) => {
        if (d.user) setAdminUser(d.user);
      })
      .catch(() => {});
  }, []);

  const handleLogout = async () => {
    await fetch("/api/auth/me", { method: "DELETE" });
    router.push("/auth/login");
  };

  return (
    <div className="min-h-screen bg-[#F8F9FA]">
      {/* Top Header */}
      <header className="fixed top-0 left-0 right-0 z-50 bg-gradient-to-r from-[#0D2C22] to-[#1a4a3a] text-white shadow-lg">
        <div className="flex items-center justify-between h-14 px-4 md:px-6">
          <div className="flex items-center gap-4">
            <button
              onClick={() => setSidebarOpen(!sidebarOpen)}
              className="md:hidden p-2 hover:bg-white/10 rounded-lg transition-colors"
            >
              {sidebarOpen ? <X size={18} /> : <Menu size={18} />}
            </button>
            <Link
              href="/"
              className="flex items-center gap-2 text-white/60 hover:text-white text-xs font-sans transition-colors"
            >
              <ArrowLeft size={14} />
              <span className="hidden sm:inline">Store</span>
            </Link>
            <span className="text-white/20">|</span>
            <span className="text-sm font-sans font-semibold tracking-wider">
              HERITAGE ADMIN
            </span>
          </div>

          <div className="flex items-center gap-3">
            <GlobalSearch />
            <Link
              href="/"
              target="_blank"
              className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 text-[10px] font-sans font-medium tracking-wider uppercase text-white/60 hover:text-white hover:bg-white/10 rounded-lg transition-all"
            >
              <Globe size={12} />
              View Store
            </Link>
            <StockAlertDropdown />
            {adminUser && (
              <div className="hidden sm:flex items-center gap-2 pl-3 border-l border-white/10">
                <div className="w-7 h-7 rounded-full bg-[#2E1A47] flex items-center justify-center text-[10px] font-bold">
                  {adminUser.firstName[0]}
                </div>
                <span className="text-xs font-sans text-white/80">{adminUser.firstName}</span>
              </div>
            )}
            <button
              onClick={handleLogout}
              className="p-2 text-white/40 hover:text-white hover:bg-white/10 rounded-lg transition-all"
              title="Logout"
            >
              <LogOut size={14} />
            </button>
          </div>
        </div>
      </header>

      <div className="flex pt-14">
        {/* Sidebar */}
        <aside
          className={cn(
            "fixed md:sticky top-14 left-0 z-40 w-60 bg-white border-r border-neutral-200 h-[calc(100vh-3.5rem)] shrink-0 transition-transform duration-300 ease-in-out overflow-y-auto",
            sidebarOpen ? "translate-x-0" : "-translate-x-full md:translate-x-0"
          )}
        >
          <nav className="p-3 space-y-0.5">
            <div className="px-3 py-2 mb-2">
              <p className="text-[9px] font-sans font-bold tracking-[0.2em] uppercase text-neutral-300">
                Management
              </p>
            </div>
            {ADMIN_NAV.map((item) => {
              const Icon = item.icon;
              const isActive = pathname === item.href || pathname.startsWith(item.href + "/");

              return (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={() => setSidebarOpen(false)}
                  className={cn(
                    "flex items-center gap-3 px-3 py-2.5 text-[13px] font-sans rounded-lg transition-all duration-150",
                    isActive
                      ? "bg-[#0D2C22]/5 text-[#0D2C22] font-medium shadow-sm border border-[#0D2C22]/10"
                      : "text-neutral-500 hover:text-neutral-800 hover:bg-neutral-50",
                  )}
                >
                  <Icon size={16} strokeWidth={1.5} className={isActive ? "text-[#0D2C22]" : ""} />
                  {item.label}
                </Link>
              );
            })}
          </nav>

          {/* Sidebar Footer */}
          <div className="absolute bottom-0 left-0 right-0 p-4 border-t border-neutral-100 bg-neutral-50/50">
            <div className="text-center">
              <p className="text-[10px] font-sans text-neutral-400">The Heritage Edit</p>
              <p className="text-[9px] font-sans text-neutral-300 mt-0.5">Admin Panel v2.0</p>
            </div>
          </div>
        </aside>

        {/* Mobile Overlay */}
        {sidebarOpen && (
          <div
            className="fixed inset-0 bg-black/30 z-30 md:hidden"
            onClick={() => setSidebarOpen(false)}
          />
        )}

        {/* Main Content */}
        <main className="flex-1 p-4 md:p-8 max-w-7xl mx-auto w-full min-h-[calc(100vh-3.5rem)]">
          {children}
        </main>
      </div>
    </div>
  );
}
