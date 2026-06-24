"use client";

import { useEffect, useState, useCallback, useRef } from "react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import {
  Upload,
  X,
  Loader2,
  Sparkles,
  BookOpen,
  Calendar,
  ShoppingBag,
  Check,
  RefreshCw,
  Edit3,
  Eye,
  ChevronDown,
  ImagePlus,
  AlertCircle,
  ArrowRight,
} from "lucide-react";
import { formatPrice } from "@/lib/utils";

interface HeritageData {
  historyAndHeritage: string;
  whenToWear: string;
  rightOccasion: string[];
  styleRecommendations: string[];
  aiModelUsed: string;
  isApproved: boolean;
}

interface CreatedProduct {
  id: string;
  name: string;
  sku: string;
  slug: string;
  basePriceCents: number;
  status: string;
  brand: { id: string; name: string };
  category: { id: string; name: string };
  images: Array<{ id: string; url: string }>;
  heritage: HeritageData | null;
}

const BRANDS = [
  { id: "brand-gucci", name: "Gucci", country: "Italy" },
  { id: "brand-prada", name: "Prada", country: "Italy" },
  { id: "brand-bottega", name: "Bottega Veneta", country: "Italy" },
  { id: "brand-saintlaurent", name: "Saint Laurent", country: "France" },
  { id: "brand-balenciaga", name: "Balenciaga", country: "Spain" },
  { id: "brand-valentino", name: "Valentino", country: "Italy" },
  { id: "brand-celine", name: "Celine", country: "France" },
  { id: "brand-loewe", name: "Loewe", country: "Spain" },
  { id: "brand-hermes", name: "Hermès", country: "France" },
  { id: "brand-chanel", name: "Chanel", country: "France" },
];

const CATEGORIES = [
  { id: "cat-senator", name: "Senator Wear" },
  { id: "cat-native", name: "Native Wear" },
  { id: "cat-footwear", name: "Footwear" },
  { id: "cat-jewelry", name: "Jewelry" },
  { id: "cat-bags", name: "Bags" },
  { id: "cat-coats", name: "Coats & Jackets" },
  { id: "cat-dresses", name: "Dresses" },
  { id: "cat-tops", name: "Tops & Blouses" },
  { id: "cat-trousers", name: "Trousers & Shorts" },
  { id: "cat-knitwear", name: "Knitwear" },
  { id: "cat-shoes", name: "Shoes" },
  { id: "cat-accessories", name: "Accessories" },
  { id: "cat-suits", name: "Suits & Tailoring" },
  { id: "cat-swimwear", name: "Swimwear" },
];

const SIZES = ["XXS", "XS", "S", "M", "L", "XL", "XXL"];

type HeritageTab = "story" | "occasions" | "lookbook";

export default function NewProductPage() {
  const router = useRouter();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [formData, setFormData] = useState({
    name: "",
    brandId: "",
    categoryId: "",
    basePriceCents: "",
    sku: "",
    description: "",
  });
  const [stockMap, setStockMap] = useState<Record<string, number>>(
    Object.fromEntries(SIZES.map((s) => [s, 0])),
  );
  const [imagePreviews, setImagePreviews] = useState<string[]>([]);
  const [dragOver, setDragOver] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);

  const [createdProduct, setCreatedProduct] = useState<CreatedProduct | null>(null);
  const [polledProduct, setPolledProduct] = useState<CreatedProduct | null>(null);
  const [heritageTab, setHeritageTab] = useState<HeritageTab>("story");
  const [isEditing, setIsEditing] = useState(false);
  const [isApproving, setIsApproving] = useState(false);
  const [isRegenerating, setIsRegenerating] = useState(false);
  const [editFields, setEditFields] = useState<HeritageData | null>(null);

  const displayProduct = polledProduct ?? createdProduct;
  const heritage = displayProduct?.heritage ?? null;
  const isAiPending =
    displayProduct?.status === "AI_PENDING" || (!heritage && displayProduct !== null);

  useEffect(() => {
    if (!createdProduct) return;
    if (createdProduct.heritage) return;
    let attempts = 0;
    const maxAttempts = 30;
    const interval = setInterval(async () => {
      attempts++;
      try {
        const res = await fetch(`/api/products/${createdProduct.id}`);
        if (!res.ok) return;
        const data: CreatedProduct = await res.json();
        setPolledProduct(data);

        if (data.heritage) {
          setEditFields(data.heritage);
          clearInterval(interval);
          return;
        }

        if (data.status === "DRAFT" || data.status === "PUBLISHED" || data.status === "ARCHIVED") {
          clearInterval(interval);
          setSubmitError(
            "Heritage narrative generation failed — the product was saved as a Draft. " +
            "Check that ANTHROPIC_API_KEY or OPENAI_API_KEY is set in your .env file, then use the Regenerate button.",
          );
          return;
        }

        if (attempts >= maxAttempts) {
          clearInterval(interval);
          setSubmitError(
            "Heritage generation is taking longer than expected. The product was saved — " +
            "refresh the page or use the Regenerate button once the AI service responds.",
          );
        }
      } catch {
        /* retry silently */
      }
    }, 2500);
    return () => clearInterval(interval);
  }, [createdProduct]);

  const handleFiles = useCallback((files: FileList | null) => {
    if (!files) return;
    const incoming = Array.from(files).slice(0, 8);
    incoming.forEach((file) => {
      if (!file.type.startsWith("image/")) return;
      const reader = new FileReader();
      reader.onload = () =>
        setImagePreviews((prev) => [...prev, reader.result as string].slice(0, 8));
      reader.readAsDataURL(file);
    });
  }, []);

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      setDragOver(false);
      handleFiles(e.dataTransfer.files);
    },
    [handleFiles],
  );

  const removeImage = (idx: number) =>
    setImagePreviews((prev) => prev.filter((_, i) => i !== idx));

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitError(null);
    setIsSubmitting(true);

    try {
      const activeVariants = SIZES.filter((s) => (stockMap[s] ?? 0) > 0).map(
        (s) => ({ size: s, stockCount: stockMap[s] }),
      );

      const res = await fetch("/api/products", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: formData.name,
          brandId: formData.brandId,
          categoryId: formData.categoryId,
          basePriceCents: Math.round(parseFloat(formData.basePriceCents) * 100),
          description: formData.description || undefined,
          variants: activeVariants.length > 0 ? activeVariants : undefined,
          imageUrls: imagePreviews.length > 0 ? imagePreviews : undefined,
        }),
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error ?? "Failed to create product");
      }

      const product: CreatedProduct = await res.json();
      setCreatedProduct(product);
      if (product.heritage) {
        setEditFields(product.heritage);
      }
    } catch (err) {
      setSubmitError(err instanceof Error ? err.message : "Something went wrong");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleRegenerate = async () => {
    if (!displayProduct) return;
    setIsRegenerating(true);
    try {
      const res = await fetch(`/api/products/${displayProduct.id}/heritage`, {
        method: "POST",
      });
      if (res.ok) {
        const data = await res.json();
        setEditFields(data);
        setPolledProduct((prev) =>
          prev ? { ...prev, heritage: data, status: "AI_REVIEW" } : prev,
        );
      }
    } finally {
      setIsRegenerating(false);
    }
  };

  const handleApproveAndPublish = async () => {
    if (!displayProduct) return;
    setIsApproving(true);
    try {
      const res = await fetch(`/api/products/${displayProduct.id}/heritage`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...editFields, isApproved: true }),
      });
      if (res.ok) {
        router.push("/admin/products");
      }
    } finally {
      setIsApproving(false);
    }
  };

  const selectedBrand = BRANDS.find((b) => b.id === formData.brandId);

  return (
    <div>
      {/* Page header */}
      <div className="mb-8">
        <div className="flex items-center gap-3 mb-1">
          <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-[#0D2C22] to-[#2E1A47] flex items-center justify-center">
            <Sparkles className="h-4 w-4 text-amber-400" />
          </div>
          <h1 className="text-2xl font-serif tracking-tight text-neutral-900">
            Product Ingestion Studio
          </h1>
        </div>
        <p className="text-sm font-sans text-neutral-400 ml-11">
          Upload a product and our AI will compose its Heritage Narrative in real
          time
        </p>
      </div>

      {/* ──────────────── SPLIT PANE LAYOUT ──────────────── */}
      <div className="grid grid-cols-1 xl:grid-cols-12 gap-6 items-start">
        {/* ─── LEFT PANE: THE FORM ─── */}
        <div className="xl:col-span-5 bg-white rounded-xl border border-neutral-200 shadow-sm overflow-hidden">
          <div className="px-6 py-4 border-b border-neutral-100 bg-neutral-50/50">
            <h2 className="text-[11px] font-sans font-semibold tracking-[0.18em] uppercase text-neutral-400">
              Product Details
            </h2>
          </div>

          <form onSubmit={handleSubmit} className="p-6 space-y-5">
            {submitError && (
              <div className="flex items-start gap-3 p-4 rounded-lg bg-red-50 border border-red-100">
                <AlertCircle className="h-4 w-4 text-red-500 mt-0.5 shrink-0" />
                <p className="text-sm font-sans text-red-700">{submitError}</p>
              </div>
            )}

            {/* Drag & drop image zone */}
            <div>
              <label className="block text-[11px] font-sans font-medium tracking-[0.12em] uppercase text-neutral-400 mb-2">
                Product Media
              </label>
              <div
                onDragOver={(e) => {
                  e.preventDefault();
                  setDragOver(true);
                }}
                onDragLeave={() => setDragOver(false)}
                onDrop={handleDrop}
                onClick={() => fileInputRef.current?.click()}
                className={`relative border-2 border-dashed rounded-xl p-6 text-center cursor-pointer transition-all duration-200 ${
                  dragOver
                    ? "border-[#0D2C22] bg-[#0D2C22]/[0.02]"
                    : "border-neutral-200 hover:border-neutral-300 bg-neutral-50/30"
                }`}
              >
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/jpeg,image/png,image/webp"
                  multiple
                  onChange={(e) => handleFiles(e.target.files)}
                  className="sr-only"
                />
                <ImagePlus
                  className="mx-auto mb-2 text-neutral-300"
                  size={28}
                  strokeWidth={1.2}
                />
                <p className="text-sm font-sans text-neutral-500">
                  Drop images here or{" "}
                  <span className="text-[#0D2C22] font-medium">browse</span>
                </p>
                <p className="text-[11px] font-sans text-neutral-300 mt-1">
                  JPEG, PNG, WebP &middot; Up to 10 MB &middot; Max 8 images
                </p>
              </div>

              {imagePreviews.length > 0 && (
                <div className="grid grid-cols-4 gap-2 mt-3">
                  {imagePreviews.map((src, idx) => (
                    <div
                      key={idx}
                      className="relative aspect-square rounded-lg overflow-hidden bg-neutral-100 group"
                    >
                      <img
                        src={src}
                        alt={`Upload ${idx + 1}`}
                        className="w-full h-full object-cover"
                      />
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          removeImage(idx);
                        }}
                        className="absolute top-1 right-1 w-5 h-5 rounded-full bg-black/60 text-white flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                      >
                        <X size={10} />
                      </button>
                      {idx === 0 && (
                        <span className="absolute bottom-1 left-1 px-1.5 py-0.5 rounded bg-[#0D2C22] text-white text-[8px] font-sans font-bold tracking-wider uppercase">
                          Hero
                        </span>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Brand & Category */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-[11px] font-sans font-medium tracking-[0.12em] uppercase text-neutral-400 mb-1.5">
                  Brand
                </label>
                <div className="relative">
                  <select
                    value={formData.brandId}
                    onChange={(e) =>
                      setFormData((p) => ({ ...p, brandId: e.target.value }))
                    }
                    required
                    className="w-full h-11 pl-3 pr-8 rounded-lg border border-neutral-200 bg-white text-sm font-sans text-neutral-900 appearance-none focus:outline-none focus:border-[#0D2C22] focus:ring-1 focus:ring-[#0D2C22]/20 transition-all"
                  >
                    <option value="">Select brand</option>
                    {BRANDS.map((b) => (
                      <option key={b.id} value={b.id}>
                        {b.name}
                      </option>
                    ))}
                  </select>
                  <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-neutral-400 pointer-events-none" />
                </div>
              </div>
              <div>
                <label className="block text-[11px] font-sans font-medium tracking-[0.12em] uppercase text-neutral-400 mb-1.5">
                  Category
                </label>
                <div className="relative">
                  <select
                    value={formData.categoryId}
                    onChange={(e) =>
                      setFormData((p) => ({ ...p, categoryId: e.target.value }))
                    }
                    required
                    className="w-full h-11 pl-3 pr-8 rounded-lg border border-neutral-200 bg-white text-sm font-sans text-neutral-900 appearance-none focus:outline-none focus:border-[#0D2C22] focus:ring-1 focus:ring-[#0D2C22]/20 transition-all"
                  >
                    <option value="">Select category</option>
                    {CATEGORIES.map((c) => (
                      <option key={c.id} value={c.id}>
                        {c.name}
                      </option>
                    ))}
                  </select>
                  <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-neutral-400 pointer-events-none" />
                </div>
              </div>
            </div>

            {/* Product title */}
            <div>
              <label className="block text-[11px] font-sans font-medium tracking-[0.12em] uppercase text-neutral-400 mb-1.5">
                Product Title
              </label>
              <input
                type="text"
                value={formData.name}
                onChange={(e) =>
                  setFormData((p) => ({ ...p, name: e.target.value }))
                }
                placeholder="e.g., Wool Silk Double-Breasted Blazer"
                required
                className="w-full h-11 px-3 rounded-lg border border-neutral-200 bg-white text-sm font-sans text-neutral-900 placeholder:text-neutral-300 focus:outline-none focus:border-[#0D2C22] focus:ring-1 focus:ring-[#0D2C22]/20 transition-all"
              />
            </div>

            {/* Price & SKU row */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-[11px] font-sans font-medium tracking-[0.12em] uppercase text-neutral-400 mb-1.5">
                  Base Price (USD)
                </label>
                <div className="relative">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-sm text-neutral-400">
                    $
                  </span>
                  <input
                    type="number"
                    step="0.01"
                    min="0"
                    value={formData.basePriceCents}
                    onChange={(e) =>
                      setFormData((p) => ({
                        ...p,
                        basePriceCents: e.target.value,
                      }))
                    }
                    placeholder="2,450.00"
                    required
                    className="w-full h-11 pl-7 pr-3 rounded-lg border border-neutral-200 bg-white text-sm font-sans text-neutral-900 tabular-nums placeholder:text-neutral-300 focus:outline-none focus:border-[#0D2C22] focus:ring-1 focus:ring-[#0D2C22]/20 transition-all"
                  />
                </div>
              </div>
              <div>
                <label className="block text-[11px] font-sans font-medium tracking-[0.12em] uppercase text-neutral-400 mb-1.5">
                  SKU (Optional)
                </label>
                <input
                  type="text"
                  value={formData.sku}
                  onChange={(e) =>
                    setFormData((p) => ({
                      ...p,
                      sku: e.target.value.toUpperCase(),
                    }))
                  }
                  placeholder="Auto-generated"
                  className="w-full h-11 px-3 rounded-lg border border-neutral-200 bg-white text-sm font-sans font-mono text-neutral-900 placeholder:text-neutral-300 focus:outline-none focus:border-[#0D2C22] focus:ring-1 focus:ring-[#0D2C22]/20 transition-all"
                />
              </div>
            </div>

            {/* Stock inventory grid */}
            <div>
              <label className="block text-[11px] font-sans font-medium tracking-[0.12em] uppercase text-neutral-400 mb-2">
                Stock Inventory
              </label>
              <div className="grid grid-cols-7 gap-2">
                {SIZES.map((size) => (
                  <div key={size} className="text-center">
                    <span className="block text-[10px] font-sans font-semibold text-neutral-500 mb-1">
                      {size}
                    </span>
                    <input
                      type="number"
                      min="0"
                      value={stockMap[size]}
                      onChange={(e) =>
                        setStockMap((prev) => ({
                          ...prev,
                          [size]: parseInt(e.target.value) || 0,
                        }))
                      }
                      className="w-full h-9 rounded-lg border border-neutral-200 bg-white text-center text-xs font-sans tabular-nums text-neutral-700 focus:outline-none focus:border-[#0D2C22] focus:ring-1 focus:ring-[#0D2C22]/20 transition-all"
                    />
                  </div>
                ))}
              </div>
            </div>

            {/* Submit */}
            <button
              type="submit"
              disabled={isSubmitting || !formData.name || !formData.brandId || !formData.categoryId}
              className="w-full h-12 rounded-lg bg-gradient-to-r from-[#0D2C22] to-[#0D2C22]/90 text-white text-sm font-sans font-semibold tracking-wide flex items-center justify-center gap-2.5 transition-all duration-300 hover:shadow-lg hover:shadow-[#0D2C22]/20 active:scale-[0.98] disabled:opacity-40 disabled:cursor-not-allowed disabled:hover:shadow-none"
            >
              {isSubmitting ? (
                <>
                  <Loader2 size={16} className="animate-spin" />
                  <span>Creating Product &amp; Generating Heritage...</span>
                </>
              ) : (
                <>
                  <Sparkles size={16} />
                  <span>Draft Product &amp; Generate Heritage</span>
                </>
              )}
            </button>
          </form>
        </div>

        {/* ─── RIGHT PANE: LIVE AI HERITAGE PREVIEW ─── */}
        <div className="xl:col-span-7 bg-white rounded-xl border border-neutral-200 shadow-sm overflow-hidden min-h-[600px] flex flex-col">
          <div className="px-6 py-4 border-b border-neutral-100 bg-neutral-50/50 flex items-center justify-between">
            <h2 className="text-[11px] font-sans font-semibold tracking-[0.18em] uppercase text-neutral-400">
              Heritage Narrative — Live Preview
            </h2>
            {heritage && (
              <span className="text-[10px] font-sans text-neutral-300 tracking-wide">
                Generated via{" "}
                <span className="text-[#2E1A47] font-medium">
                  {heritage.aiModelUsed}
                </span>
              </span>
            )}
          </div>

          <div className="flex-1 p-6">
            <AnimatePresence mode="wait">
              {/* ── Idle state: no product created yet ── */}
              {!displayProduct && (
                <motion.div
                  key="idle"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="h-full flex flex-col items-center justify-center text-center py-16"
                >
                  <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-neutral-50 to-neutral-100 border border-neutral-200 flex items-center justify-center mb-5">
                    <Sparkles
                      className="text-neutral-300"
                      size={32}
                      strokeWidth={1}
                    />
                  </div>
                  <h3 className="text-base font-serif italic text-neutral-400 mb-2">
                    The Heritage Narrative awaits
                  </h3>
                  <p className="text-sm font-sans text-neutral-300 max-w-xs leading-relaxed">
                    Fill in the product details on the left and click
                    &ldquo;Draft Product&rdquo; — our AI will compose a luxury
                    editorial narrative in seconds.
                  </p>
                </motion.div>
              )}

              {/* ── AI Pending: elegant loader ── */}
              {displayProduct && isAiPending && (
                <motion.div
                  key="pending"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="h-full flex flex-col items-center justify-center text-center py-16"
                >
                  <div className="relative w-20 h-20 mb-6">
                    <div className="absolute inset-0 rounded-full border-2 border-neutral-100" />
                    <div className="absolute inset-0 rounded-full border-2 border-transparent border-t-[#0D2C22] animate-spin" />
                    <div className="absolute inset-3 rounded-full border-2 border-transparent border-t-[#2E1A47] animate-spin [animation-direction:reverse] [animation-duration:1.5s]" />
                    <Sparkles className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-[#2E1A47]" size={20} />
                  </div>
                  <h3 className="text-base font-serif italic text-neutral-700 mb-2">
                    Composing Heritage Narrative
                  </h3>
                  <p className="text-sm font-sans text-neutral-400 max-w-xs leading-relaxed">
                    Our AI is researching the design history, craftsmanship DNA,
                    and cultural context for{" "}
                    <span className="font-medium text-neutral-600">
                      {displayProduct.name}
                    </span>
                  </p>
                  <div className="flex items-center gap-1.5 mt-6">
                    {[0, 1, 2].map((i) => (
                      <motion.div
                        key={i}
                        className="w-1.5 h-1.5 rounded-full bg-[#0D2C22]"
                        animate={{ opacity: [0.2, 1, 0.2] }}
                        transition={{
                          duration: 1.5,
                          repeat: Infinity,
                          delay: i * 0.3,
                        }}
                      />
                    ))}
                  </div>
                </motion.div>
              )}

              {/* ── Heritage loaded: tabbed content ── */}
              {heritage && !isAiPending && (
                <motion.div
                  key="heritage"
                  initial={{ opacity: 0, y: 12 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
                  className="space-y-6"
                >
                  {/* Product summary bar */}
                  <div className="flex items-center gap-4 p-4 rounded-lg bg-neutral-50 border border-neutral-100">
                    {displayProduct?.images[0] && (
                      <div className="w-12 h-16 rounded overflow-hidden bg-white shrink-0">
                        <img
                          src={displayProduct?.images[0].url}
                          alt=""
                          className="w-full h-full object-cover"
                        />
                      </div>
                    )}
                    <div className="flex-1 min-w-0">
                      <p className="text-[10px] font-sans font-medium tracking-[0.15em] uppercase text-[#2E1A47]">
                        {displayProduct?.brand.name}
                      </p>
                      <p className="text-sm font-sans font-medium text-neutral-900 truncate">
                        {displayProduct?.name}
                      </p>
                    </div>
                    <div className="flex items-center gap-2">
                      <div
                        className={`w-2 h-2 rounded-full ${
                          heritage.isApproved ? "bg-emerald-500" : "bg-amber-400"
                        }`}
                      />
                      <span className="text-[10px] font-sans font-medium tracking-wider uppercase text-neutral-400">
                        {heritage.isApproved ? "Live" : "Awaiting Review"}
                      </span>
                    </div>
                  </div>

                  {/* Toolbar */}
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-1">
                      {(
                        [
                          { id: "story", label: "The Heritage Story", icon: BookOpen },
                          { id: "occasions", label: "Occasion Guide", icon: Calendar },
                          { id: "lookbook", label: "The Lookbook Edit", icon: ShoppingBag },
                        ] as const
                      ).map((tab) => {
                        const Icon = tab.icon;
                        const active = heritageTab === tab.id;
                        return (
                          <button
                            key={tab.id}
                            onClick={() => setHeritageTab(tab.id)}
                            className={`relative flex items-center gap-1.5 px-3.5 py-2 rounded-lg text-xs font-sans font-medium transition-all duration-200 ${
                              active
                                ? "bg-[#0D2C22]/[0.06] text-[#0D2C22]"
                                : "text-neutral-400 hover:text-neutral-600 hover:bg-neutral-50"
                            }`}
                          >
                            <Icon size={13} strokeWidth={1.8} />
                            <span className="hidden sm:inline">{tab.label}</span>
                          </button>
                        );
                      })}
                    </div>

                    <div className="flex items-center gap-1">
                      <button
                        onClick={() => setIsEditing(!isEditing)}
                        className="p-2 rounded-lg text-neutral-400 hover:text-neutral-600 hover:bg-neutral-50 transition-colors"
                        title={isEditing ? "Preview" : "Edit"}
                      >
                        {isEditing ? <Eye size={15} /> : <Edit3 size={15} />}
                      </button>
                      <button
                        onClick={handleRegenerate}
                        disabled={isRegenerating}
                        className="p-2 rounded-lg text-neutral-400 hover:text-neutral-600 hover:bg-neutral-50 transition-colors disabled:opacity-40"
                        title="Regenerate"
                      >
                        <RefreshCw
                          size={15}
                          className={isRegenerating ? "animate-spin" : ""}
                        />
                      </button>
                    </div>
                  </div>

                  {/* Tab content */}
                  <AnimatePresence mode="wait">
                    {heritageTab === "story" && (
                      <motion.div
                        key="tab-story"
                        initial={{ opacity: 0, y: 8 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -8 }}
                        transition={{ duration: 0.25 }}
                      >
                        <div className="rounded-xl border border-neutral-100 overflow-hidden">
                          <div className="px-5 py-3 bg-[#0D2C22]/[0.02] border-b border-neutral-100">
                            <h3 className="text-xs font-sans font-semibold tracking-[0.15em] uppercase text-[#0D2C22]/60">
                              Heritage &amp; History
                            </h3>
                          </div>
                          <div className="p-5">
                            {isEditing && editFields ? (
                              <textarea
                                value={editFields.historyAndHeritage}
                                onChange={(e) =>
                                  setEditFields((prev) =>
                                    prev
                                      ? { ...prev, historyAndHeritage: e.target.value }
                                      : prev,
                                  )
                                }
                                className="w-full min-h-[280px] p-3 rounded-lg border border-neutral-200 text-sm font-serif text-neutral-700 leading-relaxed resize-y focus:outline-none focus:border-[#0D2C22] focus:ring-1 focus:ring-[#0D2C22]/20"
                              />
                            ) : (
                              <div className="prose-sm font-serif text-neutral-600 leading-[1.85] space-y-4">
                                {(editFields?.historyAndHeritage ?? heritage.historyAndHeritage)
                                  .split("\n\n")
                                  .map((para, i) => (
                                    <p
                                      key={i}
                                      className={
                                        i === 0
                                          ? "text-base text-neutral-800 first-letter:text-3xl first-letter:font-serif first-letter:font-bold first-letter:text-[#0D2C22] first-letter:mr-1 first-letter:float-left first-letter:leading-[0.85]"
                                          : "text-sm"
                                      }
                                    >
                                      {para}
                                    </p>
                                  ))}
                              </div>
                            )}
                          </div>
                        </div>
                      </motion.div>
                    )}

                    {heritageTab === "occasions" && (
                      <motion.div
                        key="tab-occasions"
                        initial={{ opacity: 0, y: 8 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -8 }}
                        transition={{ duration: 0.25 }}
                        className="space-y-4"
                      >
                        {/* When to Wear */}
                        <div className="rounded-xl border border-neutral-100 overflow-hidden">
                          <div className="px-5 py-3 bg-[#0D2C22]/[0.02] border-b border-neutral-100">
                            <h3 className="text-xs font-sans font-semibold tracking-[0.15em] uppercase text-[#0D2C22]/60">
                              When to Wear
                            </h3>
                          </div>
                          <div className="p-5 font-serif text-sm text-neutral-600 leading-[1.85] italic">
                            {(editFields?.whenToWear ?? heritage.whenToWear)
                              .split("\n\n")
                              .map((para, i) => (
                                <p key={i} className="mb-3 last:mb-0">
                                  {para}
                                </p>
                              ))}
                          </div>
                        </div>

                        {/* Occasion cards */}
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                          {(editFields?.rightOccasion ?? heritage.rightOccasion).map(
                            (occasion, idx) => (
                              <motion.div
                                key={occasion}
                                initial={{ opacity: 0, y: 6 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: idx * 0.08 }}
                                className="flex items-start gap-3 p-4 rounded-lg border border-[#0D2C22]/[0.08] bg-[#0D2C22]/[0.015] hover:border-[#0D2C22]/20 transition-colors"
                              >
                                <Calendar
                                  size={15}
                                  className="text-[#0D2C22]/40 mt-0.5 shrink-0"
                                  strokeWidth={1.5}
                                />
                                <span className="text-sm font-sans text-neutral-700 leading-snug">
                                  {occasion}
                                </span>
                              </motion.div>
                            ),
                          )}
                        </div>
                      </motion.div>
                    )}

                    {heritageTab === "lookbook" && (
                      <motion.div
                        key="tab-lookbook"
                        initial={{ opacity: 0, y: 8 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -8 }}
                        transition={{ duration: 0.25 }}
                      >
                        <div className="rounded-xl border border-neutral-100 overflow-hidden">
                          <div className="px-5 py-3 bg-[#2E1A47]/[0.03] border-b border-neutral-100">
                            <h3 className="text-xs font-sans font-semibold tracking-[0.15em] uppercase text-[#2E1A47]/60">
                              Complete the Look
                            </h3>
                          </div>
                          <div className="p-4 space-y-2.5">
                            {(
                              editFields?.styleRecommendations ??
                              heritage.styleRecommendations
                            ).map((rec, idx) => (
                              <motion.div
                                key={rec}
                                initial={{ opacity: 0, x: -8 }}
                                animate={{ opacity: 1, x: 0 }}
                                transition={{ delay: idx * 0.06 }}
                                className="flex items-center gap-3 p-3.5 rounded-lg border border-[#2E1A47]/[0.06] bg-[#2E1A47]/[0.01] hover:border-[#2E1A47]/15 transition-colors group cursor-pointer"
                              >
                                <div className="w-8 h-8 rounded-lg bg-[#2E1A47]/[0.05] flex items-center justify-center shrink-0">
                                  <ShoppingBag
                                    size={14}
                                    className="text-[#2E1A47]/50"
                                    strokeWidth={1.5}
                                  />
                                </div>
                                <span className="text-sm font-sans text-neutral-700 group-hover:text-[#2E1A47] transition-colors flex-1">
                                  {rec}
                                </span>
                                <ArrowRight
                                  size={14}
                                  className="text-neutral-200 group-hover:text-[#2E1A47]/40 transition-colors"
                                />
                              </motion.div>
                            ))}
                          </div>
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>

                  {/* Publish action bar */}
                  {!heritage.isApproved && (
                    <div className="flex items-center gap-3 pt-4 border-t border-neutral-100">
                      <button
                        onClick={handleApproveAndPublish}
                        disabled={isApproving}
                        className="flex-1 h-12 rounded-lg bg-gradient-to-r from-[#0D2C22] to-[#2E1A47] text-white text-sm font-sans font-semibold tracking-wide flex items-center justify-center gap-2.5 transition-all duration-300 hover:shadow-lg hover:shadow-[#0D2C22]/20 active:scale-[0.98] disabled:opacity-40"
                      >
                        {isApproving ? (
                          <Loader2 size={16} className="animate-spin" />
                        ) : (
                          <Check size={16} />
                        )}
                        Publish to Editorial Storefront
                      </button>
                    </div>
                  )}
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>
      </div>
    </div>
  );
}
