"use client";

import { useEffect, useState, use } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import {
  Loader2,
  ArrowLeft,
  Save,
  ChevronDown,
  AlertCircle,
  Check,
} from "lucide-react";
import { formatPrice } from "@/lib/utils";

interface Variant {
  id?: string;
  size: string;
  color?: string | null;
  stockCount: number;
  priceDeltaCents: number;
}

interface ProductData {
  id: string;
  name: string;
  sku: string;
  slug: string;
  description: string | null;
  basePriceCents: number;
  salePriceCents: number | null;
  status: string;
  isFeatured: boolean;
  brand: { id: string; name: string };
  category: { id: string; name: string };
  images: Array<{ id: string; url: string }>;
  variants: Variant[];
  heritage: unknown;
}

interface Option {
  id: string;
  name: string;
}

const SIZES = ["XXS", "XS", "S", "M", "L", "XL", "XXL", "3XL", "MTM", "ONE"];
const STATUSES = [
  { value: "DRAFT", label: "Draft" },
  { value: "PUBLISHED", label: "Published" },
  { value: "ARCHIVED", label: "Archived" },
];

export default function EditProductPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);
  const router = useRouter();

  const [product, setProduct] = useState<ProductData | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [saved, setSaved] = useState(false);

  const [brands, setBrands] = useState<Option[]>([]);
  const [categories, setCategories] = useState<Option[]>([]);

  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [basePriceCents, setBasePriceCents] = useState("");
  const [salePriceCents, setSalePriceCents] = useState("");
  const [status, setStatus] = useState("DRAFT");
  const [isFeatured, setIsFeatured] = useState(false);
  const [brandId, setBrandId] = useState("");
  const [categoryId, setCategoryId] = useState("");
  const [stockMap, setStockMap] = useState<Record<string, number>>({});

  useEffect(() => {
    Promise.all([
      fetch(`/api/admin/products/${id}`).then((r) => r.json()),
      fetch("/api/admin/brands").then((r) => r.json()),
      fetch("/api/admin/categories").then((r) => r.json()),
    ])
      .then(([prod, brandsData, catsData]) => {
        if (prod.error) {
          setError(prod.error);
          return;
        }
        setProduct(prod);
        setName(prod.name);
        setDescription(prod.description ?? "");
        setBasePriceCents((prod.basePriceCents / 100).toFixed(2));
        setSalePriceCents(
          prod.salePriceCents ? (prod.salePriceCents / 100).toFixed(2) : "",
        );
        setStatus(prod.status);
        setIsFeatured(prod.isFeatured);
        setBrandId(prod.brand.id);
        setCategoryId(prod.category.id);

        const sm: Record<string, number> = {};
        SIZES.forEach((s) => (sm[s] = 0));
        prod.variants.forEach((v: Variant) => {
          sm[v.size] = v.stockCount;
        });
        setStockMap(sm);

        setBrands(brandsData.data ?? []);
        setCategories(catsData.data ?? []);
      })
      .catch(() => setError("Failed to load product"))
      .finally(() => setLoading(false));
  }, [id]);

  const handleSave = async () => {
    setError(null);
    setSaving(true);
    setSaved(false);

    try {
      const variants = SIZES.filter((s) => (stockMap[s] ?? 0) > 0).map(
        (s) => ({ size: s, stockCount: stockMap[s], priceDeltaCents: 0 }),
      );

      const res = await fetch(`/api/admin/products/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name,
          description: description || null,
          basePriceCents: Math.round(parseFloat(basePriceCents) * 100),
          salePriceCents: salePriceCents
            ? Math.round(parseFloat(salePriceCents) * 100)
            : null,
          status,
          isFeatured,
          brandId,
          categoryId,
          variants,
        }),
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error ?? "Failed to save");
      }

      const updated = await res.json();
      setProduct(updated);
      setSaved(true);
      setTimeout(() => setSaved(false), 3000);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong");
    } finally {
      setSaving(false);
    }
  };

  const inputClass =
    "w-full h-11 px-3 border border-neutral-200 bg-white text-sm font-sans text-neutral-900 focus:outline-none focus:border-[#0D2C22] focus:ring-1 focus:ring-[#0D2C22]/20 transition-all";
  const labelClass =
    "block text-[11px] font-sans font-medium tracking-[0.12em] uppercase text-neutral-400 mb-1.5";

  if (loading) {
    return (
      <div className="flex items-center justify-center py-32">
        <Loader2 className="w-6 h-6 animate-spin text-heritage-green" />
      </div>
    );
  }

  if (error && !product) {
    return (
      <div className="text-center py-20">
        <AlertCircle className="mx-auto mb-4 text-red-400" size={32} />
        <p className="text-sm text-red-600 mb-4">{error}</p>
        <Link
          href="/admin/products"
          className="text-sm text-heritage-green hover:underline"
        >
          Back to products
        </Link>
      </div>
    );
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-8">
        <div className="flex items-center gap-4">
          <Link
            href="/admin/products"
            className="w-9 h-9 flex items-center justify-center border border-neutral-200 hover:border-neutral-300 transition-colors"
          >
            <ArrowLeft size={16} className="text-neutral-500" />
          </Link>
          <div>
            <h1 className="text-xl font-serif text-obsidian">Edit Product</h1>
            <p className="text-xs font-sans text-neutral-400 mt-0.5">
              {product?.sku}
            </p>
          </div>
        </div>
        <button
          onClick={handleSave}
          disabled={saving}
          className="h-12 px-6 bg-heritage-green text-white text-[11px] font-sans font-semibold tracking-[0.2em] uppercase flex items-center gap-2 hover:bg-[#163829] transition-colors disabled:opacity-50"
        >
          {saving ? (
            <Loader2 size={16} className="animate-spin" />
          ) : saved ? (
            <Check size={16} />
          ) : (
            <Save size={16} />
          )}
          {saved ? "Saved" : "Save Changes"}
        </button>
      </div>

      {error && (
        <div className="flex items-start gap-3 p-4 mb-6 bg-red-50 border border-red-100">
          <AlertCircle className="h-4 w-4 text-red-500 mt-0.5 shrink-0" />
          <p className="text-sm font-sans text-red-700">{error}</p>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-white border border-slate-border p-6 space-y-5">
            <div>
              <label className={labelClass}>Product Title</label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className={inputClass}
              />
            </div>

            <div>
              <label className={labelClass}>Description</label>
              <textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                rows={5}
                className="w-full px-3 py-2.5 border border-neutral-200 bg-white text-sm font-sans text-neutral-900 resize-y focus:outline-none focus:border-[#0D2C22] focus:ring-1 focus:ring-[#0D2C22]/20 transition-all"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className={labelClass}>Base Price (&#8358;)</label>
                <div className="relative">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-sm text-neutral-400">
                    &#8358;
                  </span>
                  <input
                    type="number"
                    step="0.01"
                    min="0"
                    value={basePriceCents}
                    onChange={(e) => setBasePriceCents(e.target.value)}
                    className={inputClass + " pl-7"}
                  />
                </div>
              </div>
              <div>
                <label className={labelClass}>Sale Price (&#8358;)</label>
                <div className="relative">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-sm text-neutral-400">
                    &#8358;
                  </span>
                  <input
                    type="number"
                    step="0.01"
                    min="0"
                    value={salePriceCents}
                    onChange={(e) => setSalePriceCents(e.target.value)}
                    placeholder="Optional"
                    className={inputClass + " pl-7"}
                  />
                </div>
              </div>
            </div>

            <div>
              <label className={labelClass}>Stock Inventory</label>
              <div className="grid grid-cols-5 sm:grid-cols-10 gap-2">
                {SIZES.map((size) => (
                  <div key={size} className="text-center">
                    <span className="block text-[10px] font-sans font-semibold text-neutral-500 mb-1">
                      {size}
                    </span>
                    <input
                      type="number"
                      min="0"
                      value={stockMap[size] ?? 0}
                      onChange={(e) =>
                        setStockMap((prev) => ({
                          ...prev,
                          [size]: parseInt(e.target.value) || 0,
                        }))
                      }
                      className="w-full h-9 border border-neutral-200 bg-white text-center text-xs font-sans tabular-nums text-neutral-700 focus:outline-none focus:border-[#0D2C22] transition-all"
                    />
                  </div>
                ))}
              </div>
            </div>
          </div>

          {product?.images && product.images.length > 0 && (
            <div className="bg-white border border-slate-border p-6">
              <h3 className={labelClass + " mb-3"}>Product Images</h3>
              <div className="grid grid-cols-4 gap-3">
                {product.images.map((img, idx) => (
                  <div
                    key={img.id}
                    className="relative aspect-square bg-ivory overflow-hidden"
                  >
                    <img
                      src={img.url}
                      alt={`Product image ${idx + 1}`}
                      className="w-full h-full object-cover"
                    />
                    {idx === 0 && (
                      <span className="absolute bottom-1 left-1 px-1.5 py-0.5 bg-heritage-green text-white text-[8px] font-sans font-bold tracking-wider uppercase">
                        Hero
                      </span>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        <div className="space-y-6">
          <div className="bg-white border border-slate-border p-6 space-y-5">
            <div>
              <label className={labelClass}>Status</label>
              <div className="relative">
                <select
                  value={status}
                  onChange={(e) => setStatus(e.target.value)}
                  className={inputClass + " appearance-none pr-8"}
                >
                  {STATUSES.map((s) => (
                    <option key={s.value} value={s.value}>
                      {s.label}
                    </option>
                  ))}
                </select>
                <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-neutral-400 pointer-events-none" />
              </div>
            </div>

            <div>
              <label className={labelClass}>Brand</label>
              <div className="relative">
                <select
                  value={brandId}
                  onChange={(e) => setBrandId(e.target.value)}
                  className={inputClass + " appearance-none pr-8"}
                >
                  {brands.map((b) => (
                    <option key={b.id} value={b.id}>
                      {b.name}
                    </option>
                  ))}
                </select>
                <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-neutral-400 pointer-events-none" />
              </div>
            </div>

            <div>
              <label className={labelClass}>Category</label>
              <div className="relative">
                <select
                  value={categoryId}
                  onChange={(e) => setCategoryId(e.target.value)}
                  className={inputClass + " appearance-none pr-8"}
                >
                  {categories.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.name}
                    </option>
                  ))}
                </select>
                <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-neutral-400 pointer-events-none" />
              </div>
            </div>

            <label className="flex items-center gap-3 cursor-pointer">
              <input
                type="checkbox"
                checked={isFeatured}
                onChange={(e) => setIsFeatured(e.target.checked)}
                className="w-4 h-4 border-neutral-300 text-heritage-green focus:ring-heritage-green"
              />
              <span className="text-sm font-sans text-neutral-700">
                Featured product
              </span>
            </label>
          </div>

          <div className="bg-white border border-slate-border p-6">
            <h3 className={labelClass + " mb-3"}>Summary</h3>
            <dl className="space-y-3 text-sm font-sans">
              <div className="flex justify-between">
                <dt className="text-neutral-400">SKU</dt>
                <dd className="text-neutral-700 font-mono text-xs">
                  {product?.sku}
                </dd>
              </div>
              <div className="flex justify-between">
                <dt className="text-neutral-400">Current Price</dt>
                <dd className="text-neutral-700">
                  {product ? formatPrice(product.basePriceCents) : "—"}
                </dd>
              </div>
              <div className="flex justify-between">
                <dt className="text-neutral-400">Heritage</dt>
                <dd className="text-neutral-700">
                  {product?.heritage ? "Generated" : "None"}
                </dd>
              </div>
              <div className="flex justify-between">
                <dt className="text-neutral-400">Total Stock</dt>
                <dd className="text-neutral-700">
                  {Object.values(stockMap).reduce((a, b) => a + b, 0)} units
                </dd>
              </div>
            </dl>
          </div>
        </div>
      </div>
    </div>
  );
}
