"use client";

import { useEffect, useState } from "react";
import { Globe, RefreshCw, Check, AlertCircle, Package, ShoppingCart, Loader2 } from "lucide-react";

interface ShopifyStatus {
  connected: boolean;
  shopDomain: string | null;
  stats: {
    totalProducts: number;
    lastSyncAt: string | null;
  };
}

export default function IntegrationsPage() {
  const [status, setStatus] = useState<ShopifyStatus | null>(null);
  const [loading, setLoading] = useState(true);
  const [syncing, setSyncing] = useState<string | null>(null);
  const [syncResult, setSyncResult] = useState<string | null>(null);

  useEffect(() => {
    fetchStatus();
  }, []);

  async function fetchStatus() {
    try {
      const res = await fetch("/api/integrations/shopify");
      if (res.ok) setStatus(await res.json());
    } catch (err) {
      console.error("Failed to fetch Shopify status:", err);
    } finally {
      setLoading(false);
    }
  }

  async function triggerSync(action: string) {
    setSyncing(action);
    setSyncResult(null);
    try {
      const res = await fetch("/api/integrations/shopify", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action }),
      });
      const data = await res.json();
      if (res.ok) {
        setSyncResult(`Success: ${JSON.stringify(data.results)}`);
        fetchStatus();
      } else {
        setSyncResult(`Error: ${data.error}`);
      }
    } catch (err) {
      setSyncResult("Error: Failed to connect");
    } finally {
      setSyncing(null);
    }
  }

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl font-serif text-neutral-900 mb-1">Integrations</h1>
        <p className="text-sm text-neutral-500">Connect external sales channels and services</p>
      </div>

      {/* Shopify Integration Card */}
      <div className="bg-white rounded-xl border border-neutral-200 shadow-sm overflow-hidden">
        <div className="p-6 border-b border-neutral-100">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-xl bg-[#95BF47]/10 flex items-center justify-center">
                <Globe size={24} className="text-[#95BF47]" />
              </div>
              <div>
                <h3 className="text-base font-semibold text-neutral-800">Shopify</h3>
                <p className="text-xs text-neutral-500">Sync products, inventory, and orders with your Shopify store</p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              {status?.connected ? (
                <span className="flex items-center gap-1.5 px-3 py-1 bg-emerald-50 text-emerald-700 text-xs font-medium rounded-full">
                  <Check size={12} />
                  Connected
                </span>
              ) : (
                <span className="flex items-center gap-1.5 px-3 py-1 bg-amber-50 text-amber-700 text-xs font-medium rounded-full">
                  <AlertCircle size={12} />
                  Not Configured
                </span>
              )}
            </div>
          </div>
        </div>

        {loading ? (
          <div className="p-8 text-center">
            <Loader2 className="h-6 w-6 animate-spin text-neutral-300 mx-auto" />
          </div>
        ) : (
          <div className="p-6">
            {status?.connected ? (
              <div className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="p-4 rounded-lg border border-neutral-200 bg-neutral-50/50">
                    <p className="text-xs text-neutral-500 mb-1">Shop Domain</p>
                    <p className="text-sm font-medium text-neutral-800">{status.shopDomain}</p>
                  </div>
                  <div className="p-4 rounded-lg border border-neutral-200 bg-neutral-50/50">
                    <p className="text-xs text-neutral-500 mb-1">Products to Sync</p>
                    <p className="text-sm font-medium text-neutral-800">{status.stats.totalProducts}</p>
                  </div>
                  <div className="p-4 rounded-lg border border-neutral-200 bg-neutral-50/50">
                    <p className="text-xs text-neutral-500 mb-1">Last Sync</p>
                    <p className="text-sm font-medium text-neutral-800">{status.stats.lastSyncAt || "Never"}</p>
                  </div>
                </div>

                {/* Sync Actions */}
                <div>
                  <h4 className="text-sm font-semibold text-neutral-800 mb-3">Sync Actions</h4>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                    <button
                      onClick={() => triggerSync("sync_products")}
                      disabled={!!syncing}
                      className="flex items-center justify-center gap-2 px-4 py-3 bg-[#0D2C22] text-white text-xs font-medium tracking-wider uppercase rounded-lg hover:bg-[#0D2C22]/90 disabled:opacity-50 transition-colors"
                    >
                      {syncing === "sync_products" ? <Loader2 size={14} className="animate-spin" /> : <Package size={14} />}
                      Sync Products
                    </button>
                    <button
                      onClick={() => triggerSync("sync_inventory")}
                      disabled={!!syncing}
                      className="flex items-center justify-center gap-2 px-4 py-3 bg-[#0D2C22] text-white text-xs font-medium tracking-wider uppercase rounded-lg hover:bg-[#0D2C22]/90 disabled:opacity-50 transition-colors"
                    >
                      {syncing === "sync_inventory" ? <Loader2 size={14} className="animate-spin" /> : <RefreshCw size={14} />}
                      Sync Inventory
                    </button>
                    <button
                      onClick={() => triggerSync("sync_orders")}
                      disabled={!!syncing}
                      className="flex items-center justify-center gap-2 px-4 py-3 bg-[#0D2C22] text-white text-xs font-medium tracking-wider uppercase rounded-lg hover:bg-[#0D2C22]/90 disabled:opacity-50 transition-colors"
                    >
                      {syncing === "sync_orders" ? <Loader2 size={14} className="animate-spin" /> : <ShoppingCart size={14} />}
                      Sync Orders
                    </button>
                  </div>
                </div>

                {syncResult && (
                  <div className={`p-3 rounded-lg text-xs ${syncResult.startsWith("Error") ? "bg-red-50 text-red-700" : "bg-emerald-50 text-emerald-700"}`}>
                    {syncResult}
                  </div>
                )}
              </div>
            ) : (
              <div className="text-center py-8">
                <Globe className="h-10 w-10 text-neutral-300 mx-auto mb-3" />
                <h4 className="text-sm font-medium text-neutral-800 mb-2">Connect Your Shopify Store</h4>
                <p className="text-xs text-neutral-500 max-w-md mx-auto mb-4">
                  Set the following environment variables to connect your Shopify store:
                </p>
                <div className="bg-neutral-900 rounded-lg p-4 max-w-md mx-auto text-left">
                  <code className="text-xs text-green-400 font-mono">
                    SHOPIFY_SHOP_DOMAIN=your-store.myshopify.com<br />
                    SHOPIFY_ACCESS_TOKEN=shpat_xxxxx
                  </code>
                </div>
                <p className="text-[10px] text-neutral-400 mt-3">
                  Generate an access token from your Shopify Admin → Settings → Apps → Develop apps
                </p>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
