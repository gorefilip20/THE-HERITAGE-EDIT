"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import {
  LayoutDashboard,
  Megaphone,
  Mail,
  TrendingUp,
  Settings,
  LogOut,
  Menu,
  X,
} from "lucide-react";

interface MarketingLayoutProps {
  children: React.ReactNode;
}

const MARKETING_NAV = [
  { label: "Dashboard", href: "/marketing", icon: LayoutDashboard },
  { label: "Campaigns", href: "/marketing/campaigns", icon: Megaphone },
  { label: "Email", href: "/marketing/email", icon: Mail },
  { label: "Analytics", href: "/marketing/analytics", icon: TrendingUp },
  { label: "Settings", href: "/marketing/settings", icon: Settings },
];

export default function MarketingLayout({ children }: MarketingLayoutProps) {
  const router = useRouter();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const handleLogout = async () => {
    await fetch("/api/auth/logout", { method: "POST" });
    router.push("/auth/login");
  };

  return (
    <div className="flex h-screen bg-neutral-50">
      {/* Sidebar */}
      <aside
        className={`fixed md:relative z-40 h-screen w-64 bg-green-900 text-white transition-transform duration-300 ${
          sidebarOpen ? "translate-x-0" : "-translate-x-full md:translate-x-0"
        }`}
      >
        <div className="p-6 border-b border-white/10">
          <h1 className="text-xl font-serif tracking-wide">Marketing Hub</h1>
          <p className="text-xs font-sans text-white/50 mt-1">Campaigns & Analytics</p>
        </div>

        <nav className="p-4 space-y-2">
          {MARKETING_NAV.map((item) => {
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
        className="md:hidden fixed bottom-6 right-6 z-50 w-12 h-12 bg-green-900 text-white flex items-center justify-center rounded-full shadow-lg"
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
