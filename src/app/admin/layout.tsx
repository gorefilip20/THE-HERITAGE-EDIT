"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  Package,
  ShoppingCart,
  Plus,
  ArrowLeft,
} from "lucide-react";
import { cn } from "@/lib/utils";

const ADMIN_NAV = [
  { href: "/admin/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { href: "/admin/products", label: "Products", icon: Package },
  { href: "/admin/products/new", label: "Upload", icon: Plus },
  { href: "/admin/orders", label: "Orders", icon: ShoppingCart },
];

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();

  return (
    <div className="min-h-screen bg-ivory">
      <header className="bg-heritage-green text-white">
        <div className="flex items-center justify-between h-14 px-6">
          <div className="flex items-center gap-4">
            <Link
              href="/"
              className="flex items-center gap-2 text-white/60 hover:text-white text-xs font-sans transition-colors"
            >
              <ArrowLeft size={14} />
              Store
            </Link>
            <span className="text-white/20">|</span>
            <span className="text-sm font-sans font-semibold tracking-wider">
              HERITAGE ADMIN
            </span>
          </div>
        </div>
      </header>

      <div className="flex">
        <aside className="w-56 bg-white border-r border-slate-border min-h-[calc(100vh-3.5rem)] shrink-0 hidden md:block">
          <nav className="p-4 space-y-1">
            {ADMIN_NAV.map((item) => {
              const Icon = item.icon;
              const isActive = pathname === item.href;

              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={cn(
                    "flex items-center gap-3 px-3 py-2.5 text-sm font-sans rounded transition-colors duration-150",
                    isActive
                      ? "bg-heritage-green/5 text-heritage-green font-medium"
                      : "text-obsidian/60 hover:text-obsidian hover:bg-ivory",
                  )}
                >
                  <Icon size={16} strokeWidth={1.5} />
                  {item.label}
                </Link>
              );
            })}
          </nav>
        </aside>

        <main className="flex-1 p-6 md:p-8 max-w-6xl">{children}</main>
      </div>
    </div>
  );
}
