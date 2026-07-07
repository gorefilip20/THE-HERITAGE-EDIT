"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import {
  User,
  Package,
  Heart,
  MapPin,
  LogOut,
  ChevronRight,
  Loader2,
  ShoppingBag,
} from "lucide-react";
import { formatPrice } from "@/lib/utils";

interface UserData {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  role: string;
}

interface Order {
  id: string;
  orderNumber: string;
  status: string;
  totalCents: number;
  createdAt: string;
  items: Array<{ id: string; quantity: number; product: { name: string } }>;
}

const STATUS_STYLES: Record<string, string> = {
  PENDING: "bg-amber-100 text-amber-700",
  CONFIRMED: "bg-blue-100 text-blue-700",
  PROCESSING: "bg-indigo-100 text-indigo-700",
  SHIPPED: "bg-emerald-100 text-emerald-700",
  DELIVERED: "bg-green-100 text-green-700",
  CANCELLED: "bg-red-100 text-red-700",
};

export default function AccountPage() {
  const router = useRouter();
  const [user, setUser] = useState<UserData | null>(null);
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("orders");

  useEffect(() => {
    async function fetchData() {
      try {
        const userRes = await fetch("/api/auth/me");
        if (!userRes.ok) {
          router.push("/auth/login?redirect=/account");
          return;
        }
        const userData = await userRes.json();
        setUser(userData.user);

        const ordersRes = await fetch("/api/orders");
        if (ordersRes.ok) {
          const ordersData = await ordersRes.json();
          setOrders(ordersData.data ?? []);
        }
      } catch {
        router.push("/auth/login?redirect=/account");
      } finally {
        setLoading(false);
      }
    }
    fetchData();
  }, [router]);

  async function handleLogout() {
    await fetch("/api/auth/me", { method: "DELETE" });
    router.push("/");
    router.refresh();
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="h-6 w-6 animate-spin text-[#0D2C22]" />
      </div>
    );
  }

  if (!user) return null;

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      {/* Header */}
      <div className="mb-10">
        <h1 className="text-display-sm font-serif text-[#0D2C22] mb-2">My Account</h1>
        <p className="text-sm font-sans text-neutral-500">
          Welcome back, {user.firstName}. Manage your orders and preferences.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
        {/* Sidebar */}
        <div className="lg:col-span-1">
          {/* User Card */}
          <div className="p-5 rounded-xl bg-gradient-to-br from-[#0D2C22] to-[#2E1A47] text-white mb-4">
            <div className="w-12 h-12 rounded-full bg-white/10 flex items-center justify-center mb-3">
              <span className="text-lg font-serif">{user.firstName[0]}{user.lastName[0]}</span>
            </div>
            <p className="text-sm font-medium">{user.firstName} {user.lastName}</p>
            <p className="text-xs text-white/60">{user.email}</p>
          </div>

          {/* Nav */}
          <nav className="space-y-1">
            {[
              { id: "orders", label: "My Orders", icon: Package },
              { id: "wishlist", label: "Wishlist", icon: Heart },
              { id: "addresses", label: "Addresses", icon: MapPin },
              { id: "profile", label: "Profile", icon: User },
            ].map((item) => {
              const Icon = item.icon;
              return (
                <button
                  key={item.id}
                  onClick={() => setActiveTab(item.id)}
                  className={`w-full flex items-center justify-between px-4 py-3 text-sm rounded-lg transition-all ${
                    activeTab === item.id
                      ? "bg-[#0D2C22]/5 text-[#0D2C22] font-medium"
                      : "text-neutral-500 hover:text-neutral-800 hover:bg-neutral-50"
                  }`}
                >
                  <span className="flex items-center gap-3">
                    <Icon size={16} />
                    {item.label}
                  </span>
                  <ChevronRight size={14} className="text-neutral-300" />
                </button>
              );
            })}
            <button
              onClick={handleLogout}
              className="w-full flex items-center gap-3 px-4 py-3 text-sm text-red-500 hover:text-red-700 hover:bg-red-50 rounded-lg transition-all"
            >
              <LogOut size={16} />
              Sign Out
            </button>
          </nav>

          {user.role === "ADMIN" || user.role === "SUPER_ADMIN" ? (
            <Link
              href="/admin/dashboard"
              className="mt-4 flex items-center justify-center gap-2 px-4 py-2.5 bg-[#0D2C22] text-white text-xs font-medium tracking-wider uppercase rounded-lg hover:bg-[#0D2C22]/90 transition-colors"
            >
              Admin Panel
            </Link>
          ) : null}
        </div>

        {/* Content */}
        <div className="lg:col-span-3">
          {activeTab === "orders" && (
            <div>
              <h2 className="text-lg font-serif text-neutral-900 mb-4">Order History</h2>
              {orders.length === 0 ? (
                <div className="bg-white rounded-xl border border-neutral-200 p-12 text-center">
                  <ShoppingBag className="h-10 w-10 text-neutral-300 mx-auto mb-3" />
                  <p className="text-sm text-neutral-500 mb-4">You haven&apos;t placed any orders yet</p>
                  <Link
                    href="/shop"
                    className="inline-flex px-6 py-2.5 bg-[#0D2C22] text-white text-xs font-medium tracking-wider uppercase rounded-lg hover:bg-[#0D2C22]/90 transition-colors"
                  >
                    Start Shopping
                  </Link>
                </div>
              ) : (
                <div className="space-y-3">
                  {orders.map((order) => (
                    <div key={order.id} className="bg-white rounded-xl border border-neutral-200 p-5 hover:shadow-sm transition-shadow">
                      <div className="flex items-center justify-between mb-3">
                        <div>
                          <p className="text-sm font-medium font-mono text-[#0D2C22]">{order.orderNumber}</p>
                          <p className="text-xs text-neutral-400">{new Date(order.createdAt).toLocaleDateString("en-US", { year: "numeric", month: "long", day: "numeric" })}</p>
                        </div>
                        <div className="text-right">
                          <span className={`inline-flex px-2 py-0.5 text-[9px] font-semibold tracking-wider uppercase rounded ${STATUS_STYLES[order.status] || "bg-neutral-100 text-neutral-600"}`}>
                            {order.status}
                          </span>
                          <p className="text-sm font-medium text-neutral-800 mt-1">{formatPrice(order.totalCents)}</p>
                        </div>
                      </div>
                      <div className="border-t border-neutral-100 pt-3">
                        <p className="text-xs text-neutral-500">
                          {order.items.map((item) => `${item.product.name} (x${item.quantity})`).join(", ")}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {activeTab === "wishlist" && (
            <div>
              <h2 className="text-lg font-serif text-neutral-900 mb-4">My Wishlist</h2>
              <div className="bg-white rounded-xl border border-neutral-200 p-12 text-center">
                <Heart className="h-10 w-10 text-neutral-300 mx-auto mb-3" />
                <p className="text-sm text-neutral-500 mb-4">Your wishlist is empty</p>
                <Link
                  href="/shop"
                  className="inline-flex px-6 py-2.5 bg-[#0D2C22] text-white text-xs font-medium tracking-wider uppercase rounded-lg hover:bg-[#0D2C22]/90 transition-colors"
                >
                  Discover Products
                </Link>
              </div>
            </div>
          )}

          {activeTab === "addresses" && (
            <div>
              <h2 className="text-lg font-serif text-neutral-900 mb-4">Saved Addresses</h2>
              <div className="bg-white rounded-xl border border-neutral-200 p-12 text-center">
                <MapPin className="h-10 w-10 text-neutral-300 mx-auto mb-3" />
                <p className="text-sm text-neutral-500 mb-4">No saved addresses</p>
                <p className="text-xs text-neutral-400">Addresses will be saved during checkout</p>
              </div>
            </div>
          )}

          {activeTab === "profile" && (
            <div>
              <h2 className="text-lg font-serif text-neutral-900 mb-4">Profile Settings</h2>
              <div className="bg-white rounded-xl border border-neutral-200 p-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-[11px] font-medium tracking-wider uppercase text-neutral-400 mb-1.5">First Name</label>
                    <input type="text" defaultValue={user.firstName} className="w-full h-10 px-3 rounded-lg border border-neutral-200 bg-white text-sm focus:outline-none focus:border-[#0D2C22]" />
                  </div>
                  <div>
                    <label className="block text-[11px] font-medium tracking-wider uppercase text-neutral-400 mb-1.5">Last Name</label>
                    <input type="text" defaultValue={user.lastName} className="w-full h-10 px-3 rounded-lg border border-neutral-200 bg-white text-sm focus:outline-none focus:border-[#0D2C22]" />
                  </div>
                  <div className="md:col-span-2">
                    <label className="block text-[11px] font-medium tracking-wider uppercase text-neutral-400 mb-1.5">Email</label>
                    <input type="email" defaultValue={user.email} className="w-full h-10 px-3 rounded-lg border border-neutral-200 bg-neutral-50 text-sm" readOnly />
                  </div>
                </div>
                <button className="mt-4 px-6 py-2.5 bg-[#0D2C22] text-white text-xs font-medium tracking-wider uppercase rounded-lg hover:bg-[#0D2C22]/90 transition-colors">
                  Save Changes
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
