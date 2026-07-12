"use client";

import { useState, useEffect, useCallback, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import { Loader2, Heart, Plus, LogOut } from "lucide-react";
import { formatPrice, getImagePlaceholder } from "@/lib/utils";
import { useCartStore } from "@/store/cart-store";

/* ──────────────────────────────────────────────────────────
   TYPES
   ────────────────────────────────────────────────────────── */

interface AccountUser {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  role: string;
}

interface OrderRow {
  id: string;
  orderNumber: string;
  status: string;
  totalCents: number;
  currency: string;
  createdAt: string;
  items: Array<{
    id: string;
    quantity: number;
    product: {
      name: string;
      slug: string;
      images: { url: string }[];
      brand: { name: string };
    } | null;
  }>;
}

interface WishRow {
  id: string;
  productId: string;
  product: {
    name: string;
    slug: string;
    basePriceCents: number;
    salePriceCents: number | null;
    currency: string;
    brand: { name: string };
    images: { url: string }[];
    variants: Array<{ id: string; size: string; color: string | null; stockCount: number; priceDeltaCents: number }>;
  };
}

interface AddressRow {
  id: string;
  label: string;
  firstName: string;
  lastName: string;
  line1: string;
  line2: string | null;
  city: string;
  state: string | null;
  postalCode: string;
  country: string;
  phone: string | null;
  isDefault: boolean;
}

type Tab = "Orders" | "Wishlist" | "Addresses" | "Profile";
const TABS: Tab[] = ["Orders", "Wishlist", "Addresses", "Profile"];

/* ── Status chip styling (mirrors design tokens) ── */
const STATUS_STYLE: Record<string, { bg: string; color: string; label: string }> = {
  PENDING: { bg: "#F3F1EC", color: "#525252", label: "Pending" },
  CONFIRMED: { bg: "#EFEAF5", color: "#2E1A47", label: "Confirmed" },
  PROCESSING: { bg: "#EFEAF5", color: "#2E1A47", label: "Processing" },
  SHIPPED: { bg: "#E8F0ED", color: "#0D2C22", label: "In Transit" },
  DELIVERED: { bg: "#F3F1EC", color: "#525252", label: "Delivered" },
  CANCELLED: { bg: "#FBEAEA", color: "#b91c1c", label: "Cancelled" },
  REFUNDED: { bg: "#FBEAEA", color: "#b91c1c", label: "Refunded" },
};

function formatDate(iso: string): string {
  try {
    return new Date(iso).toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  } catch {
    return "";
  }
}

/* ──────────────────────────────────────────────────────────
   PAGE
   ────────────────────────────────────────────────────────── */

export default function AccountPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-[60vh] flex items-center justify-center">
          <Loader2 className="w-6 h-6 animate-spin text-heritage-green" />
        </div>
      }
    >
      <AccountInner />
    </Suspense>
  );
}

function AccountInner() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const initialTab = (searchParams.get("tab") as Tab) ?? "Orders";

  const [tab, setTab] = useState<Tab>(TABS.includes(initialTab) ? initialTab : "Orders");
  const [user, setUser] = useState<AccountUser | null>(null);
  const [authChecked, setAuthChecked] = useState(false);

  /* ── Auth gate ── */
  useEffect(() => {
    let active = true;
    (async () => {
      try {
        const res = await fetch("/api/auth/me");
        if (!res.ok) {
          router.replace("/auth/login?redirect=/account");
          return;
        }
        const data = await res.json();
        if (!data.user) {
          router.replace("/auth/login?redirect=/account");
          return;
        }
        if (active) {
          setUser(data.user);
          setAuthChecked(true);
        }
      } catch {
        router.replace("/auth/login?redirect=/account");
      }
    })();
    return () => {
      active = false;
    };
  }, [router]);

  const handleLogout = async () => {
    await fetch("/api/auth/me", { method: "DELETE" });
    router.push("/");
    router.refresh();
  };

  if (!authChecked || !user) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center">
        <Loader2 className="w-6 h-6 animate-spin text-heritage-green" />
      </div>
    );
  }

  return (
    <div className="max-w-[1200px] mx-auto px-5 sm:px-8 lg:px-16 pt-10 pb-24">
      {/* Header */}
      <div className="mb-10">
        <p className="text-[10px] font-sans font-medium tracking-[0.3em] uppercase text-heritage-green/50 mb-2">
          My Account
        </p>
        <h1 className="font-serif italic font-medium text-[clamp(28px,3vw,38px)] tracking-tight text-obsidian">
          Welcome back, {user.firstName}
        </h1>
      </div>

      <div className="flex flex-wrap gap-8 lg:gap-14 items-start">
        {/* ── SIDEBAR ── */}
        <aside className="flex-[0_1_220px] min-w-[180px] flex flex-col border-t border-[#EAEAEA]">
          {TABS.map((t) => (
            <TabButton key={t} label={t} active={tab === t} onClick={() => setTab(t)} />
          ))}
          {(user.role === "ADMIN" || user.role === "SUPER_ADMIN") && (
            <Link
              href="/admin"
              className="flex items-center justify-between py-4 px-1 border-b border-[#EAEAEA] text-[12px] font-sans font-medium tracking-[0.12em] uppercase text-obsidian/60 hover:text-heritage-green transition-colors"
            >
              Admin Dashboard
            </Link>
          )}
          <button
            onClick={handleLogout}
            className="flex items-center gap-2 py-4 px-1 border-b border-[#EAEAEA] text-[12px] font-sans font-medium tracking-[0.12em] uppercase text-obsidian/40 hover:text-[#b91c1c] transition-colors text-left"
          >
            <LogOut size={13} /> Sign Out
          </button>
        </aside>

        {/* ── PANEL ── */}
        <div className="flex-1 basis-[560px] min-w-[min(100%,320px)]">
          {tab === "Orders" && <OrdersPanel />}
          {tab === "Wishlist" && <WishlistPanel />}
          {tab === "Addresses" && <AddressesPanel />}
          {tab === "Profile" && <ProfilePanel user={user} onUpdate={setUser} onWishCount={() => {}} />}
        </div>
      </div>
    </div>
  );
}

function TabButton({ label, active, onClick }: { label: Tab; active: boolean; onClick: () => void }) {
  const [wishCount, setWishCount] = useState<number | null>(null);
  useEffect(() => {
    if (label !== "Wishlist") return;
    fetch("/api/wishlist")
      .then((r) => (r.ok ? r.json() : { total: 0 }))
      .then((d) => setWishCount(d.total ?? 0))
      .catch(() => setWishCount(null));
  }, [label]);

  return (
    <button
      onClick={onClick}
      className="flex items-center justify-between py-4 px-1 border-b border-[#EAEAEA] w-full text-left group"
    >
      <span
        className={`text-[12px] font-sans tracking-[0.12em] uppercase transition-colors ${
          active ? "font-semibold text-heritage-green" : "font-normal text-obsidian/60 group-hover:text-obsidian"
        }`}
      >
        {label}
      </span>
      {label === "Wishlist" && wishCount !== null && wishCount > 0 && (
        <span className="min-w-[18px] h-[18px] px-1.5 flex items-center justify-center bg-heritage-green text-white text-[10px] font-semibold rounded-full">
          {wishCount}
        </span>
      )}
    </button>
  );
}

/* ──────────────────────────────────────────────────────────
   ORDERS
   ────────────────────────────────────────────────────────── */

function OrdersPanel() {
  const [orders, setOrders] = useState<OrderRow[] | null>(null);

  useEffect(() => {
    fetch("/api/orders")
      .then((r) => (r.ok ? r.json() : { data: [] }))
      .then((d) => setOrders(d.data ?? []))
      .catch(() => setOrders([]));
  }, []);

  if (orders === null) {
    return <PanelLoader />;
  }

  if (orders.length === 0) {
    return (
      <EmptyState
        title="No orders yet"
        subtitle="When you place an order, it will appear here."
        cta={{ label: "Explore the Collection", href: "/shop" }}
      />
    );
  }

  return (
    <div className="flex flex-col gap-4">
      {orders.map((o) => {
        const first = o.items[0]?.product;
        const extra = o.items.length - 1;
        const img = first?.images?.[0]?.url || getImagePlaceholder(48, 62);
        const style = STATUS_STYLE[o.status] ?? STATUS_STYLE.PENDING;
        return (
          <div key={o.id} className="border border-[#EAEAEA]">
            <div className="flex items-center justify-between gap-3 flex-wrap px-5 py-4 bg-ivory border-b border-[#EAEAEA]">
              <div className="flex items-center gap-4 flex-wrap">
                <span className="text-[12px] font-semibold text-obsidian">#{o.orderNumber}</span>
                <span className="text-[12px] text-neutral-400">{formatDate(o.createdAt)}</span>
              </div>
              <span
                className="px-3 py-1 text-[10px] font-semibold tracking-[0.12em] uppercase"
                style={{ background: style.bg, color: style.color }}
              >
                {style.label}
              </span>
            </div>
            <div className="px-5 py-4 flex items-center justify-between gap-3 flex-wrap">
              <div className="flex items-center gap-3">
                <div className="w-12 h-[62px] bg-ivory shrink-0 overflow-hidden relative">
                  <Image src={img} alt={first?.name ?? "Order item"} fill sizes="48px" className="object-cover" />
                </div>
                <div>
                  <p className="text-[13px] text-obsidian mb-0.5">{first?.name ?? "Order item"}</p>
                  <p className="text-[12px] text-neutral-400">
                    {extra > 0 ? `+ ${extra} more item${extra > 1 ? "s" : ""}` : "1 item"}
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-5">
                <span className="text-[14px] font-medium tabular-nums text-obsidian">
                  {formatPrice(o.totalCents, o.currency)}
                </span>
                <Link
                  href={`/account/orders/${o.id}`}
                  className="text-[11px] font-medium tracking-[0.12em] uppercase text-heritage-green border-b border-heritage-green/25 pb-0.5 hover:text-heritage-green-500 transition-colors"
                >
                  View Details
                </Link>
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}

/* ──────────────────────────────────────────────────────────
   WISHLIST
   ────────────────────────────────────────────────────────── */

function WishlistPanel() {
  const [items, setItems] = useState<WishRow[] | null>(null);
  const { addItem, openCart } = useCartStore();

  useEffect(() => {
    fetch("/api/wishlist")
      .then((r) => (r.ok ? r.json() : { data: [] }))
      .then((d) => setItems(d.data ?? []))
      .catch(() => setItems([]));
  }, []);

  const remove = useCallback(async (productId: string) => {
    setItems((prev) => (prev ? prev.filter((i) => i.productId !== productId) : prev));
    await fetch(`/api/wishlist?productId=${productId}`, { method: "DELETE" });
  }, []);

  const addToBag = (w: WishRow) => {
    const variant = w.product.variants.find((v) => v.stockCount > 0) ?? w.product.variants[0];
    if (!variant) return;
    const unit = (w.product.salePriceCents ?? w.product.basePriceCents) + variant.priceDeltaCents;
    addItem({
      productId: w.productId,
      variantId: variant.id,
      name: w.product.name,
      brand: w.product.brand.name,
      size: variant.size,
      color: variant.color,
      imageUrl: w.product.images?.[0]?.url || getImagePlaceholder(200, 267),
      priceCents: unit,
      quantity: 1,
      slug: w.product.slug,
    });
    openCart();
  };

  if (items === null) return <PanelLoader />;

  if (items.length === 0) {
    return (
      <EmptyState
        title="Your wishlist is empty"
        subtitle="Save pieces you love and find them here."
        cta={{ label: "Explore the Collection", href: "/shop" }}
      />
    );
  }

  return (
    <div className="grid grid-cols-[repeat(auto-fill,minmax(min(200px,42vw),1fr))] gap-5 gap-y-8">
      {items.map((w) => {
        const price = w.product.salePriceCents ?? w.product.basePriceCents;
        const img = w.product.images?.[0]?.url || getImagePlaceholder(200, 267);
        return (
          <article key={w.id}>
            <div className="aspect-[3/4] bg-ivory mb-3 relative overflow-hidden group">
              <Link href={`/product/${w.product.slug}`}>
                <Image src={img} alt={w.product.name} fill sizes="220px" className="object-cover transition-transform duration-700 ease-luxury group-hover:scale-105" />
              </Link>
              <button
                onClick={() => remove(w.productId)}
                aria-label="Remove from wishlist"
                className="absolute top-2.5 right-2.5 w-8 h-8 flex items-center justify-center bg-white border border-[#EAEAEA] text-[#b91c1c] hover:border-[#b91c1c] transition-colors"
              >
                <Heart size={14} fill="currentColor" />
              </button>
            </div>
            <p className="text-[10px] font-semibold tracking-[0.16em] uppercase text-neutral-400 mb-1">
              {w.product.brand.name}
            </p>
            <Link href={`/product/${w.product.slug}`} className="block text-[13px] text-obsidian leading-snug mb-1.5 hover:text-heritage-green transition-colors">
              {w.product.name}
            </Link>
            <div className="flex items-center justify-between gap-2">
              <span className="text-[13px] font-medium tabular-nums text-obsidian">
                {formatPrice(price, w.product.currency)}
              </span>
              <button
                onClick={() => addToBag(w)}
                className="text-[11px] font-medium tracking-[0.1em] uppercase text-heritage-green underline hover:text-heritage-green-500 transition-colors"
              >
                Add to Bag
              </button>
            </div>
          </article>
        );
      })}
    </div>
  );
}

/* ──────────────────────────────────────────────────────────
   ADDRESSES
   ────────────────────────────────────────────────────────── */

const EMPTY_ADDRESS = {
  label: "Home",
  firstName: "",
  lastName: "",
  line1: "",
  line2: "",
  city: "",
  state: "",
  postalCode: "",
  country: "",
  phone: "",
};

function AddressesPanel() {
  const [addresses, setAddresses] = useState<AddressRow[] | null>(null);
  const [adding, setAdding] = useState(false);
  const [form, setForm] = useState({ ...EMPTY_ADDRESS });
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(() => {
    fetch("/api/addresses")
      .then((r) => (r.ok ? r.json() : { data: [] }))
      .then((d) => setAddresses(d.data ?? []))
      .catch(() => setAddresses([]));
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  const remove = async (id: string) => {
    setAddresses((prev) => (prev ? prev.filter((a) => a.id !== id) : prev));
    await fetch(`/api/addresses?id=${id}`, { method: "DELETE" });
  };

  const save = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setError(null);
    try {
      const res = await fetch("/api/addresses", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      if (!res.ok) {
        const d = await res.json().catch(() => ({}));
        throw new Error(d.error ?? "Could not save address");
      }
      setAdding(false);
      setForm({ ...EMPTY_ADDRESS });
      load();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong");
    } finally {
      setSaving(false);
    }
  };

  if (addresses === null) return <PanelLoader />;

  return (
    <div className="grid grid-cols-[repeat(auto-fill,minmax(min(260px,100%),1fr))] gap-4">
      {addresses.map((a) => (
        <div
          key={a.id}
          className="relative p-6 border"
          style={{ borderColor: a.isDefault ? "#0D2C22" : "#EAEAEA" }}
        >
          {a.isDefault && (
            <span className="absolute top-4 right-4 px-2.5 py-1 bg-heritage-green text-white text-[9px] font-semibold tracking-[0.12em] uppercase">
              Default
            </span>
          )}
          <p className="text-[13px] font-semibold text-obsidian mb-3">{a.label}</p>
          <p className="text-[13px] leading-[1.8] text-neutral-600 whitespace-pre-line mb-5">
            {a.firstName} {a.lastName}
            {"\n"}
            {a.line1}
            {a.line2 ? `\n${a.line2}` : ""}
            {"\n"}
            {a.city}
            {a.state ? `, ${a.state}` : ""} {a.postalCode}
            {"\n"}
            {a.country}
            {a.phone ? ` · ${a.phone}` : ""}
          </p>
          <div className="flex gap-4">
            <button
              onClick={() => remove(a.id)}
              className="text-[11px] text-neutral-400 underline hover:text-[#b91c1c] transition-colors"
            >
              Remove
            </button>
          </div>
        </div>
      ))}

      {/* Add-new card / inline form */}
      {adding ? (
        <form onSubmit={save} className="p-6 border border-[#EAEAEA] flex flex-col gap-3 col-span-full max-w-xl">
          {error && (
            <div className="p-3 bg-[#FBEAEA] text-[12px] text-[#b91c1c] border border-[#f3d3d3]">{error}</div>
          )}
          <div className="grid grid-cols-2 gap-3">
            <AddrInput label="Label" value={form.label} onChange={(v) => setForm({ ...form, label: v })} />
            <AddrInput label="Phone" value={form.phone} onChange={(v) => setForm({ ...form, phone: v })} required={false} />
            <AddrInput label="First Name" value={form.firstName} onChange={(v) => setForm({ ...form, firstName: v })} />
            <AddrInput label="Last Name" value={form.lastName} onChange={(v) => setForm({ ...form, lastName: v })} />
            <div className="col-span-2">
              <AddrInput label="Address Line 1" value={form.line1} onChange={(v) => setForm({ ...form, line1: v })} />
            </div>
            <div className="col-span-2">
              <AddrInput label="Address Line 2" value={form.line2} onChange={(v) => setForm({ ...form, line2: v })} required={false} />
            </div>
            <AddrInput label="City" value={form.city} onChange={(v) => setForm({ ...form, city: v })} />
            <AddrInput label="State / Region" value={form.state} onChange={(v) => setForm({ ...form, state: v })} required={false} />
            <AddrInput label="Postal Code" value={form.postalCode} onChange={(v) => setForm({ ...form, postalCode: v })} />
            <AddrInput label="Country" value={form.country} onChange={(v) => setForm({ ...form, country: v })} />
          </div>
          <div className="flex gap-3 mt-2">
            <button
              type="submit"
              disabled={saving}
              className="h-11 px-6 bg-heritage-green text-white text-[11px] font-semibold tracking-[0.15em] uppercase hover:bg-[#124534] transition-colors disabled:opacity-50 flex items-center gap-2"
            >
              {saving && <Loader2 size={14} className="animate-spin" />} Save Address
            </button>
            <button
              type="button"
              onClick={() => { setAdding(false); setError(null); }}
              className="h-11 px-6 border border-[#EAEAEA] text-[11px] font-semibold tracking-[0.15em] uppercase text-neutral-500 hover:border-obsidian transition-colors"
            >
              Cancel
            </button>
          </div>
        </form>
      ) : (
        <button
          onClick={() => setAdding(true)}
          className="border border-dashed border-neutral-300 p-6 flex flex-col items-center justify-center gap-2 text-neutral-400 hover:border-heritage-green hover:text-heritage-green transition-colors min-h-[160px]"
        >
          <Plus size={24} strokeWidth={1.25} />
          <span className="text-[11px] font-medium tracking-[0.12em] uppercase">Add New Address</span>
        </button>
      )}
    </div>
  );
}

function AddrInput({
  label,
  value,
  onChange,
  required = true,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  required?: boolean;
}) {
  return (
    <div>
      <label className="block text-[10px] font-semibold tracking-[0.15em] uppercase text-neutral-400 mb-1.5">
        {label}
      </label>
      <input
        value={value}
        onChange={(e) => onChange(e.target.value)}
        required={required}
        className="w-full h-11 px-3 border border-[#EAEAEA] text-[14px] text-obsidian outline-none focus:border-heritage-green transition-colors"
      />
    </div>
  );
}

/* ──────────────────────────────────────────────────────────
   PROFILE
   ────────────────────────────────────────────────────────── */

function ProfilePanel({
  user,
  onUpdate,
}: {
  user: AccountUser;
  onUpdate: (u: AccountUser) => void;
  onWishCount: () => void;
}) {
  const [firstName, setFirstName] = useState(user.firstName);
  const [lastName, setLastName] = useState(user.lastName);
  const [email, setEmail] = useState(user.email);
  const [saving, setSaving] = useState(false);
  const [msg, setMsg] = useState<{ type: "ok" | "err"; text: string } | null>(null);

  const save = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setMsg(null);
    try {
      const res = await fetch("/api/auth/me", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ firstName, lastName, email }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "Could not save changes");
      onUpdate(data.user);
      setMsg({ type: "ok", text: "Your profile has been updated." });
    } catch (err) {
      setMsg({ type: "err", text: err instanceof Error ? err.message : "Something went wrong" });
    } finally {
      setSaving(false);
    }
  };

  const initial = (user.firstName?.[0] ?? user.email[0] ?? "A").toUpperCase();

  return (
    <div className="max-w-[480px] flex flex-col gap-6">
      <div className="flex items-center gap-5 pb-6 border-b border-[#EAEAEA]">
        <span className="w-16 h-16 rounded-full bg-[#E8F0ED] text-heritage-green flex items-center justify-center font-serif text-2xl">
          {initial}
        </span>
        <div>
          <p className="text-[15px] font-medium text-obsidian mb-0.5">
            {user.firstName} {user.lastName}
          </p>
          <p className="text-[13px] text-neutral-400">
            {user.role === "ADMIN" || user.role === "SUPER_ADMIN" ? "Administrator" : "Inner Circle Member"}
          </p>
        </div>
      </div>

      <form onSubmit={save} className="grid grid-cols-2 gap-3">
        {msg && (
          <div
            className={`col-span-2 p-3 text-[12px] border ${
              msg.type === "ok"
                ? "bg-[#F4F8F6] text-heritage-green border-[#d5e6de]"
                : "bg-[#FBEAEA] text-[#b91c1c] border-[#f3d3d3]"
            }`}
          >
            {msg.text}
          </div>
        )}
        <div className="col-span-2">
          <ProfileLabel>Email</ProfileLabel>
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            className="w-full h-12 px-4 border border-[#EAEAEA] text-[14px] text-obsidian outline-none focus:border-heritage-green transition-colors"
          />
        </div>
        <div>
          <ProfileLabel>First Name</ProfileLabel>
          <input
            value={firstName}
            onChange={(e) => setFirstName(e.target.value)}
            required
            className="w-full h-12 px-4 border border-[#EAEAEA] text-[14px] text-obsidian outline-none focus:border-heritage-green transition-colors"
          />
        </div>
        <div>
          <ProfileLabel>Last Name</ProfileLabel>
          <input
            value={lastName}
            onChange={(e) => setLastName(e.target.value)}
            required
            className="w-full h-12 px-4 border border-[#EAEAEA] text-[14px] text-obsidian outline-none focus:border-heritage-green transition-colors"
          />
        </div>
        <button
          type="submit"
          disabled={saving}
          className="col-span-2 justify-self-start h-12 px-8 bg-heritage-green text-white text-[11px] font-semibold tracking-[0.2em] uppercase hover:bg-[#124534] transition-colors disabled:opacity-50 flex items-center gap-2 mt-1"
        >
          {saving && <Loader2 size={14} className="animate-spin" />} Save Changes
        </button>
      </form>
    </div>
  );
}

function ProfileLabel({ children }: { children: React.ReactNode }) {
  return (
    <p className="text-[10px] font-semibold tracking-[0.15em] uppercase text-neutral-400 mb-2">{children}</p>
  );
}

/* ──────────────────────────────────────────────────────────
   SHARED
   ────────────────────────────────────────────────────────── */

function PanelLoader() {
  return (
    <div className="py-20 flex items-center justify-center">
      <Loader2 className="w-5 h-5 animate-spin text-heritage-green" />
    </div>
  );
}

function EmptyState({
  title,
  subtitle,
  cta,
}: {
  title: string;
  subtitle: string;
  cta: { label: string; href: string };
}) {
  return (
    <div className="text-center py-16 px-6 border border-[#EAEAEA] bg-ivory">
      <p className="font-serif text-xl text-obsidian mb-2">{title}</p>
      <p className="text-[13px] text-neutral-400 mb-6">{subtitle}</p>
      <Link
        href={cta.href}
        className="inline-flex items-center h-11 px-7 border border-obsidian text-obsidian text-[11px] font-semibold tracking-[0.15em] uppercase hover:bg-obsidian hover:text-white transition-colors"
      >
        {cta.label}
      </Link>
    </div>
  );
}
