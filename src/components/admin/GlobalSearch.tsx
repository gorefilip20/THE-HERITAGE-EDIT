"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { useRouter } from "next/navigation";
import { Search, Package, ShoppingCart, Users, X } from "lucide-react";
import { formatPrice } from "@/lib/utils";

interface SearchResults {
  products: Array<{ id: string; name: string; sku: string; status: string; basePriceCents: number; brand: { name: string } }>;
  orders: Array<{ id: string; orderNumber: string; guestEmail: string | null; status: string; totalCents: number; createdAt: string }>;
  customers: Array<{ id: string; email: string; firstName: string; lastName: string; createdAt: string }>;
}

export default function GlobalSearch() {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<SearchResults | null>(null);
  const [loading, setLoading] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const debounceRef = useRef<NodeJS.Timeout>();

  useEffect(() => {
    function handleKeyDown(e: KeyboardEvent) {
      if ((e.metaKey || e.ctrlKey) && e.key === "k") {
        e.preventDefault();
        setOpen(true);
        setTimeout(() => inputRef.current?.focus(), 50);
      }
      if (e.key === "Escape") {
        setOpen(false);
        setQuery("");
        setResults(null);
      }
    }
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, []);

  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    }
    if (open) document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, [open]);

  const search = useCallback(async (q: string) => {
    if (q.length < 2) { setResults(null); return; }
    setLoading(true);
    try {
      const res = await fetch(`/api/admin/search?q=${encodeURIComponent(q)}`);
      if (res.ok) setResults(await res.json());
    } catch { /* ignore */ }
    setLoading(false);
  }, []);

  useEffect(() => {
    clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => search(query), 300);
    return () => clearTimeout(debounceRef.current);
  }, [query, search]);

  const navigate = (path: string) => {
    router.push(path);
    setOpen(false);
    setQuery("");
    setResults(null);
  };

  const hasResults = results && (results.products.length > 0 || results.orders.length > 0 || results.customers.length > 0);

  return (
    <div ref={containerRef} className="relative">
      <button
        onClick={() => { setOpen(true); setTimeout(() => inputRef.current?.focus(), 50); }}
        className="flex items-center gap-2 px-3 py-1.5 text-[11px] font-sans text-white/50 bg-white/5 hover:bg-white/10 rounded-lg transition-colors"
      >
        <Search size={13} />
        <span className="hidden md:inline">Search...</span>
        <kbd className="hidden md:inline-flex items-center gap-0.5 px-1.5 py-0.5 text-[9px] font-mono bg-white/10 rounded">
          ⌘K
        </kbd>
      </button>

      {open && (
        <div className="fixed inset-0 z-[100] flex items-start justify-center pt-[15vh] px-4">
          <div className="fixed inset-0 bg-black/40" onClick={() => setOpen(false)} />
          <div className="relative w-full max-w-lg bg-white shadow-2xl border border-neutral-200 overflow-hidden z-10">
            <div className="flex items-center gap-3 px-4 py-3 border-b border-neutral-100">
              <Search size={16} className="text-neutral-400 shrink-0" />
              <input
                ref={inputRef}
                type="text"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Search orders, products, customers..."
                className="flex-1 text-sm font-sans text-neutral-900 placeholder:text-neutral-300 outline-none bg-transparent"
                autoFocus
              />
              {query && (
                <button onClick={() => { setQuery(""); setResults(null); }} className="p-1 hover:bg-neutral-100 rounded">
                  <X size={14} className="text-neutral-400" />
                </button>
              )}
            </div>

            {loading && (
              <div className="px-4 py-6 text-center">
                <div className="w-5 h-5 border-2 border-neutral-200 border-t-[#0D2C22] rounded-full animate-spin mx-auto" />
              </div>
            )}

            {!loading && query.length >= 2 && !hasResults && (
              <div className="px-4 py-8 text-center">
                <p className="text-sm text-neutral-400">No results found for &ldquo;{query}&rdquo;</p>
              </div>
            )}

            {!loading && hasResults && (
              <div className="max-h-[400px] overflow-y-auto divide-y divide-neutral-100">
                {results!.orders.length > 0 && (
                  <div className="p-2">
                    <p className="px-2 py-1 text-[10px] font-sans font-bold tracking-[0.15em] uppercase text-neutral-300">
                      Orders
                    </p>
                    {results!.orders.map((order) => (
                      <button
                        key={order.id}
                        onClick={() => navigate("/admin/orders")}
                        className="w-full flex items-center gap-3 px-2 py-2 rounded-lg hover:bg-neutral-50 transition-colors text-left"
                      >
                        <ShoppingCart size={14} className="text-blue-500 shrink-0" />
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium text-neutral-800 truncate">{order.orderNumber}</p>
                          <p className="text-[11px] text-neutral-400">{order.guestEmail || "Guest"}</p>
                        </div>
                        <span className="text-xs font-medium text-neutral-600">{formatPrice(order.totalCents)}</span>
                      </button>
                    ))}
                  </div>
                )}
                {results!.products.length > 0 && (
                  <div className="p-2">
                    <p className="px-2 py-1 text-[10px] font-sans font-bold tracking-[0.15em] uppercase text-neutral-300">
                      Products
                    </p>
                    {results!.products.map((product) => (
                      <button
                        key={product.id}
                        onClick={() => navigate("/admin/products")}
                        className="w-full flex items-center gap-3 px-2 py-2 rounded-lg hover:bg-neutral-50 transition-colors text-left"
                      >
                        <Package size={14} className="text-emerald-500 shrink-0" />
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium text-neutral-800 truncate">{product.name}</p>
                          <p className="text-[11px] text-neutral-400">{product.brand.name} &middot; {product.sku}</p>
                        </div>
                        <span className="text-xs font-medium text-neutral-600">{formatPrice(product.basePriceCents)}</span>
                      </button>
                    ))}
                  </div>
                )}
                {results!.customers.length > 0 && (
                  <div className="p-2">
                    <p className="px-2 py-1 text-[10px] font-sans font-bold tracking-[0.15em] uppercase text-neutral-300">
                      Customers
                    </p>
                    {results!.customers.map((customer) => (
                      <button
                        key={customer.id}
                        onClick={() => navigate("/admin/customers")}
                        className="w-full flex items-center gap-3 px-2 py-2 rounded-lg hover:bg-neutral-50 transition-colors text-left"
                      >
                        <Users size={14} className="text-purple-500 shrink-0" />
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium text-neutral-800 truncate">
                            {customer.firstName} {customer.lastName}
                          </p>
                          <p className="text-[11px] text-neutral-400">{customer.email}</p>
                        </div>
                      </button>
                    ))}
                  </div>
                )}
              </div>
            )}

            <div className="px-4 py-2 border-t border-neutral-100 bg-neutral-50 flex items-center justify-between">
              <p className="text-[10px] text-neutral-300">Navigate with arrow keys</p>
              <p className="text-[10px] text-neutral-300">ESC to close</p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
