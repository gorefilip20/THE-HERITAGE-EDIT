"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import {
  Check,
  Eye,
  Loader2,
  Pencil,
  Plus,
  Sparkles,
  Trash2,
  X,
} from "lucide-react";
import { formatPrice } from "@/lib/utils";
import type { Product } from "@/types";

const STATUS_BADGES: Record<string, { label: string; className: string }> = {
  DRAFT: { label: "Draft", className: "bg-neutral-100 text-neutral-500" },
  AI_PENDING: { label: "AI Generating", className: "bg-amber-50 text-amber-600" },
  AI_REVIEW: { label: "AI Review", className: "bg-heritage-purple/10 text-heritage-purple" },
  PUBLISHED: { label: "Published", className: "bg-heritage-green/10 text-heritage-green" },
  ARCHIVED: { label: "Archived", className: "bg-neutral-100 text-neutral-400" },
};

type AdminProduct = Product & {
  totalStock?: number;
  variantCount?: number;
};

type EditState = {
  id: string;
  name: string;
  basePrice: string;
  salePrice: string;
  status: Product["status"];
  isFeatured: boolean;
};

function toEditState(product: AdminProduct): EditState {
  return {
    id: product.id,
    name: product.name,
    basePrice: (product.basePriceCents / 100).toFixed(2),
    salePrice: product.salePriceCents ? (product.salePriceCents / 100).toFixed(2) : "",
    status: product.status,
    isFeatured: product.isFeatured,
  };
}

export default function ProductsPage() {
  const [products, setProducts] = useState<AdminProduct[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [editState, setEditState] = useState<EditState | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [actionError, setActionError] = useState<string | null>(null);

  const loadProducts = useCallback(async () => {
    setIsLoading(true);
    setLoadError(null);
    try {
      const response = await fetch("/api/admin/products?pageSize=100&sort=newest", {
        cache: "no-store",
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error ?? "Could not load products");
      setProducts(data.data ?? []);
    } catch (error) {
      setLoadError(error instanceof Error ? error.message : "Could not load products");
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    void loadProducts();
  }, [loadProducts]);

  const saveProduct = async () => {
    if (!editState) return;
    setIsSaving(true);
    setActionError(null);
    try {
      const basePriceCents = Math.round(Number(editState.basePrice) * 100);
      const salePriceCents = editState.salePrice.trim()
        ? Math.round(Number(editState.salePrice) * 100)
        : null;
      if (!editState.name.trim() || !Number.isFinite(basePriceCents) || basePriceCents <= 0) {
        throw new Error("Enter a product name and a valid base price.");
      }
      if (salePriceCents !== null && (!Number.isFinite(salePriceCents) || salePriceCents <= 0)) {
        throw new Error("Enter a valid sale price or leave it empty.");
      }

      const response = await fetch(`/api/products/${editState.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: editState.name.trim(),
          basePriceCents,
          salePriceCents,
          status: editState.status,
          isFeatured: editState.isFeatured,
        }),
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error ?? "Could not update product");
      setEditState(null);
      await loadProducts();
    } catch (error) {
      setActionError(error instanceof Error ? error.message : "Could not update product");
    } finally {
      setIsSaving(false);
    }
  };

  const archiveProduct = async (product: AdminProduct) => {
    if (!window.confirm(`Delete “${product.name}” from the storefront?`)) return;
    setDeletingId(product.id);
    setActionError(null);
    try {
      const response = await fetch(`/api/products/${product.id}`, { method: "DELETE" });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error ?? "Could not delete product");
      setProducts((current) => current.filter((item) => item.id !== product.id));
    } catch (error) {
      setActionError(error instanceof Error ? error.message : "Could not delete product");
    } finally {
      setDeletingId(null);
    }
  };

  return (
    <div>
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between mb-8">
        <div>
          <h1 className="text-2xl font-serif text-obsidian mb-1">Products</h1>
          <p className="text-sm font-sans text-neutral-400">View, edit, publish, and remove your luxury product catalog.</p>
        </div>
        <Link href="/admin/products/new" className="luxury-button-primary gap-2 self-start">
          <Plus size={16} />
          Add Product
        </Link>
      </div>

      {actionError && (
        <div className="mb-5 flex items-center justify-between gap-4 border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          <span>{actionError}</span>
          <button type="button" onClick={() => setActionError(null)} aria-label="Dismiss error"><X size={15} /></button>
        </div>
      )}

      <div className="bg-white border border-slate-border overflow-x-auto">
        <table className="w-full min-w-[920px]">
          <thead>
            <tr className="border-b border-slate-border bg-ivory/50">
              <th className="text-left px-4 py-3 text-[10px] font-sans font-semibold tracking-[0.15em] uppercase text-neutral-400">Product</th>
              <th className="text-left px-4 py-3 text-[10px] font-sans font-semibold tracking-[0.15em] uppercase text-neutral-400">Department</th>
              <th className="text-left px-4 py-3 text-[10px] font-sans font-semibold tracking-[0.15em] uppercase text-neutral-400">Price</th>
              <th className="text-left px-4 py-3 text-[10px] font-sans font-semibold tracking-[0.15em] uppercase text-neutral-400">Stock</th>
              <th className="text-left px-4 py-3 text-[10px] font-sans font-semibold tracking-[0.15em] uppercase text-neutral-400">Status</th>
              <th className="text-left px-4 py-3 text-[10px] font-sans font-semibold tracking-[0.15em] uppercase text-neutral-400">Heritage</th>
              <th className="text-right px-4 py-3 text-[10px] font-sans font-semibold tracking-[0.15em] uppercase text-neutral-400">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-border">
            {isLoading
              ? Array.from({ length: 6 }).map((_, i) => (
                  <tr key={i}><td colSpan={7} className="px-4 py-4"><div className="h-8 skeleton w-full" /></td></tr>
                ))
              : loadError
                ? <tr><td colSpan={7} className="px-4 py-16 text-center text-sm text-red-600">{loadError}</td></tr>
                : products.length === 0
                  ? <tr><td colSpan={7} className="px-4 py-16 text-center text-sm text-neutral-400">No products have been uploaded yet.</td></tr>
                  : products.map((product) => {
                      const badge = STATUS_BADGES[product.status] ?? STATUS_BADGES.DRAFT;
                      return (
                        <tr key={product.id} className="group hover:bg-ivory/50 transition-colors">
                          <td className="px-4 py-3">
                            <div className="flex items-center gap-3">
                              <div className="w-10 h-12 bg-ivory shrink-0 overflow-hidden">
                                {product.images[0] && <img src={product.images[0].url} alt="" className="w-full h-full object-cover" />}
                              </div>
                              <div>
                                <p className="text-sm font-sans font-medium text-obsidian">{product.name}</p>
                                <p className="text-xs font-sans text-neutral-400">{product.brand?.name ?? "The Heritage Edit"} · {product.sku}</p>
                              </div>
                            </div>
                          </td>
                          <td className="px-4 py-3 text-xs font-sans text-neutral-500">{product.department}<br /><span className="text-neutral-400">{product.clothingType}</span></td>
                          <td className="px-4 py-3 product-price text-sm">{formatPrice(product.basePriceCents)}</td>
                          <td className="px-4 py-3 text-xs font-sans text-neutral-500">{product.totalStock ?? product.variants.reduce((sum, variant) => sum + variant.stockCount, 0)}</td>
                          <td className="px-4 py-3"><span className={`inline-flex px-2 py-0.5 text-[10px] font-sans font-semibold tracking-wider uppercase ${badge.className}`}>{badge.label}</span></td>
                          <td className="px-4 py-3">{product.heritage ? <Sparkles size={14} className={product.heritage.isApproved ? "text-heritage-green" : "text-amber-400"} /> : <span className="text-xs text-neutral-300">—</span>}</td>
                          <td className="px-4 py-3">
                            <div className="flex justify-end items-center gap-1">
                              <Link href={`/product/${product.slug}`} target="_blank" className="p-2 text-neutral-400 hover:text-heritage-green" aria-label={`View ${product.name}`}><Eye size={15} /></Link>
                              <button type="button" onClick={() => setEditState(toEditState(product))} className="p-2 text-neutral-400 hover:text-heritage-purple" aria-label={`Edit ${product.name}`}><Pencil size={15} /></button>
                              <button type="button" onClick={() => void archiveProduct(product)} disabled={deletingId === product.id} className="p-2 text-neutral-400 hover:text-red-600 disabled:opacity-40" aria-label={`Delete ${product.name}`}>
                                {deletingId === product.id ? <Loader2 size={15} className="animate-spin" /> : <Trash2 size={15} />}
                              </button>
                            </div>
                          </td>
                        </tr>
                      );
                    })}
          </tbody>
        </table>
      </div>

      <p className="mt-4 text-xs text-neutral-400">Deleting a product archives it, keeping order history safe while removing it from the public storefront.</p>

      {editState && (
        <div className="fixed inset-0 z-[70] flex items-center justify-center bg-black/40 p-4" role="dialog" aria-modal="true" aria-label="Edit product">
          <div className="w-full max-w-lg bg-white shadow-2xl">
            <div className="flex items-center justify-between border-b border-slate-border px-6 py-5">
              <div><p className="text-[10px] font-sans font-semibold tracking-[0.2em] uppercase text-neutral-400">Catalog management</p><h2 className="mt-1 text-xl font-serif text-obsidian">Edit product</h2></div>
              <button type="button" onClick={() => setEditState(null)} className="p-2 text-neutral-400 hover:text-obsidian" aria-label="Close edit dialog"><X size={18} /></button>
            </div>
            <div className="space-y-5 px-6 py-6">
              <label className="block"><span className="luxury-label">Product name</span><input className="luxury-input" value={editState.name} onChange={(event) => setEditState({ ...editState, name: event.target.value })} /></label>
              <div className="grid grid-cols-2 gap-4">
                <label className="block"><span className="luxury-label">Price (USD)</span><input type="number" min="0.01" step="0.01" className="luxury-input" value={editState.basePrice} onChange={(event) => setEditState({ ...editState, basePrice: event.target.value })} /></label>
                <label className="block"><span className="luxury-label">Sale price (optional)</span><input type="number" min="0.01" step="0.01" className="luxury-input" value={editState.salePrice} onChange={(event) => setEditState({ ...editState, salePrice: event.target.value })} /></label>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <label className="block"><span className="luxury-label">Status</span><select className="luxury-input" value={editState.status} onChange={(event) => setEditState({ ...editState, status: event.target.value as Product["status"] })}><option value="PUBLISHED">Published</option><option value="DRAFT">Draft</option><option value="AI_PENDING">AI Generating</option><option value="AI_REVIEW">AI Review</option><option value="ARCHIVED">Archived</option></select></label>
                <label className="flex items-center gap-3 pt-7 text-sm text-obsidian"><input type="checkbox" checked={editState.isFeatured} onChange={(event) => setEditState({ ...editState, isFeatured: event.target.checked })} className="h-4 w-4 accent-[#0D2C22]" /> Featured on home</label>
              </div>
              <div className="flex justify-end gap-3 border-t border-slate-border pt-5"><button type="button" onClick={() => setEditState(null)} className="luxury-button-secondary">Cancel</button><button type="button" onClick={() => void saveProduct()} disabled={isSaving} className="luxury-button-primary gap-2">{isSaving ? <Loader2 size={15} className="animate-spin" /> : <Check size={15} />} Save changes</button></div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

