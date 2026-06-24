"use client";

import { useEffect, useState, useMemo, useCallback } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import { motion, AnimatePresence } from "framer-motion";
import {
  Heart,
  Share2,
  Ruler,
  ShieldCheck,
  Truck,
  RotateCcw,
  ChevronDown,
  Minus,
  Plus,
  ShoppingBag,
  Check,
  X,
} from "lucide-react";
import { cn, formatPrice, getImagePlaceholder } from "@/lib/utils";
import { useCartStore } from "@/store/cart-store";
import type { Product, ProductVariant } from "@/types";

/* ──────────────────────────────────────────────────────────
   CONSTANTS
   ────────────────────────────────────────────────────────── */

const SIZE_CHART: Record<string, Record<string, string>> = {
  XXS: { IT: "36", FR: "32", UK: "4", US: "00" },
  XS:  { IT: "38", FR: "34", UK: "6", US: "0" },
  S:   { IT: "40", FR: "36", UK: "8", US: "2–4" },
  M:   { IT: "42", FR: "38", UK: "10", US: "6" },
  L:   { IT: "44", FR: "40", UK: "12", US: "8" },
  XL:  { IT: "46", FR: "42", UK: "14", US: "10–12" },
  XXL: { IT: "48", FR: "44", UK: "16", US: "14" },
};

const ACCORDION_SECTIONS = [
  {
    key: "description",
    title: "Description",
  },
  {
    key: "sizefit",
    title: "Size & Fit",
  },
  {
    key: "shipping",
    title: "Premium Shipping & Returns",
  },
] as const;

type AccordionKey = (typeof ACCORDION_SECTIONS)[number]["key"];

/* ──────────────────────────────────────────────────────────
   PAGE COMPONENT
   ────────────────────────────────────────────────────────── */

export default function ProductDetailPage() {
  const params = useParams();
  const slug = params.slug as string;
  const addItem = useCartStore((s) => s.addItem);
  const openCart = useCartStore((s) => s.openCart);

  const [product, setProduct] = useState<Product | null>(null);
  const [loading, setLoading] = useState(true);
  const [selectedImageIdx, setSelectedImageIdx] = useState(0);
  const [selectedVariant, setSelectedVariant] = useState<ProductVariant | null>(null);
  const [sizeNotSelected, setSizeNotSelected] = useState(false);
  const [quantity, setQuantity] = useState(1);
  const [openAccordions, setOpenAccordions] = useState<Set<AccordionKey>>(
    new Set<AccordionKey>(["description"]),
  );
  const [isWishlisted, setIsWishlisted] = useState(false);
  const [addedToCart, setAddedToCart] = useState(false);
  const [isSizeDrawerOpen, setIsSizeDrawerOpen] = useState(false);

  /* ── Fetch product (server-side Redis cache via API) ── */
  useEffect(() => {
    let cancelled = false;
    async function load() {
      try {
        const res = await fetch(`/api/products/${slug}`);
        if (res.ok && !cancelled) {
          const data = await res.json();
          setProduct(data);
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    }
    load();
    return () => { cancelled = true; };
  }, [slug]);

  /* ── Computed price ── */
  const finalPrice = useMemo(() => {
    if (!product) return 0;
    const base = product.salePriceCents ?? product.basePriceCents;
    return base + (selectedVariant?.priceDeltaCents ?? 0);
  }, [product, selectedVariant]);

  const isOnSale =
    product?.salePriceCents != null &&
    product.salePriceCents < product.basePriceCents;

  /* ── Accordion toggle ── */
  const toggleAccordion = useCallback((key: AccordionKey) => {
    setOpenAccordions((prev) => {
      const next = new Set(prev);
      if (next.has(key)) next.delete(key);
      else next.add(key);
      return next;
    });
  }, []);

  /* ── Size selection ── */
  const handleSizeSelect = useCallback(
    (variant: ProductVariant) => {
      if (variant.stockCount <= 0) return;
      setSelectedVariant(variant);
      setSizeNotSelected(false);
      setIsSizeDrawerOpen(false);
    },
    [],
  );

  /* ── Add to cart ── */
  const handleAddToCart = useCallback(() => {
    if (!product) return;

    if (!selectedVariant) {
      setSizeNotSelected(true);
      setIsSizeDrawerOpen(true);
      return;
    }

    addItem({
      productId: product.id,
      variantId: selectedVariant.id,
      name: product.name,
      brand: product.brand.name,
      size: selectedVariant.size,
      color: selectedVariant.color,
      imageUrl: product.images[0]?.url ?? "",
      priceCents: finalPrice,
      quantity,
      slug: product.slug,
    });

    setAddedToCart(true);
    openCart();
    setTimeout(() => setAddedToCart(false), 2500);
  }, [product, selectedVariant, finalPrice, quantity, addItem, openCart]);

  /* ── Loading skeleton ── */
  if (loading) {
    return (
      <div className="luxury-container py-12 lg:py-20">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 lg:gap-16">
          <div className="flex gap-4">
            <div className="hidden sm:flex flex-col gap-3 w-[76px] shrink-0">
              {Array.from({ length: 4 }).map((_, i) => (
                <div key={i} className="aspect-[3/4] bg-neutral-100 animate-pulse" />
              ))}
            </div>
            <div className="flex-1 aspect-[3/4] bg-neutral-100 animate-pulse" />
          </div>
          <div className="space-y-6 pt-4">
            <div className="h-3 w-28 bg-neutral-100 animate-pulse" />
            <div className="h-8 w-3/4 bg-neutral-100 animate-pulse" />
            <div className="h-6 w-32 bg-neutral-100 animate-pulse" />
            <div className="h-14 w-full bg-neutral-100 animate-pulse mt-10" />
          </div>
        </div>
      </div>
    );
  }

  /* ── Not found ── */
  if (!product) {
    return (
      <div className="luxury-container py-24 text-center">
        <h1 className="text-display-sm font-serif italic text-obsidian mb-2">
          Piece Not Found
        </h1>
        <p className="text-sm font-sans text-neutral-400 mb-8 max-w-md mx-auto">
          This item may have been removed from our collection or is currently unavailable.
        </p>
        <Link href="/shop" className="luxury-button-primary">
          Explore the Collection
        </Link>
      </div>
    );
  }

  const images =
    product.images.length > 0
      ? product.images
      : [
          {
            id: "ph",
            url: getImagePlaceholder(800, 1067),
            alt: product.name,
            sortOrder: 0,
            isPrimary: true,
          },
        ];

  const inStockVariants = product.variants.filter((v) => v.stockCount > 0);

  return (
    <div className="luxury-container py-8 lg:py-16">
      {/* ── BREADCRUMB ── */}
      <nav className="flex items-center gap-2 text-[11px] font-sans text-neutral-400 mb-8 lg:mb-12">
        <Link href="/" className="hover:text-obsidian transition-colors">
          Home
        </Link>
        <span>/</span>
        <Link href="/shop" className="hover:text-obsidian transition-colors">
          Shop
        </Link>
        <span>/</span>
        <Link
          href={`/shop?category=${product.category.slug}`}
          className="hover:text-obsidian transition-colors"
        >
          {product.category.name}
        </Link>
        <span>/</span>
        <span className="text-obsidian truncate max-w-[180px]">{product.name}</span>
      </nav>

      {/* ── TWO-COLUMN LAYOUT ── */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 lg:gap-16">
        {/* ═══ LEFT: IMAGE GALLERY ═══ */}
        <div className="flex gap-4">
          {/* Vertical thumbnail strip */}
          <div className="hidden sm:flex flex-col gap-3 w-[76px] shrink-0">
            {images.map((img, idx) => (
              <button
                key={img.id}
                onClick={() => setSelectedImageIdx(idx)}
                className={cn(
                  "relative aspect-[3/4] overflow-hidden border transition-all duration-200",
                  idx === selectedImageIdx
                    ? "border-heritage-green opacity-100"
                    : "border-transparent opacity-50 hover:opacity-80",
                )}
              >
                <Image
                  src={img.url}
                  alt={img.alt ?? `View ${idx + 1}`}
                  fill
                  sizes="76px"
                  className="object-cover"
                />
              </button>
            ))}
          </div>

          {/* Main image */}
          <div className="flex-1 relative">
            <AnimatePresence mode="wait">
              <motion.div
                key={selectedImageIdx}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
                className="aspect-[3/4] overflow-hidden bg-ivory"
              >
                <Image
                  src={images[selectedImageIdx]?.url ?? getImagePlaceholder(800, 1067)}
                  alt={images[selectedImageIdx]?.alt ?? product.name}
                  fill
                  sizes="(max-width: 1024px) 100vw, 50vw"
                  className="object-cover"
                  priority={selectedImageIdx === 0}
                />
              </motion.div>
            </AnimatePresence>

            {/* Sale badge */}
            {isOnSale && (
              <span className="absolute top-4 left-4 px-3 py-1.5 bg-heritage-purple text-white text-[9px] font-sans font-bold tracking-[0.2em] uppercase">
                Sale
              </span>
            )}

            {/* Action buttons */}
            <div className="absolute top-4 right-4 flex flex-col gap-2">
              <button
                onClick={() => setIsWishlisted(!isWishlisted)}
                className="w-10 h-10 flex items-center justify-center bg-white/90 backdrop-blur-sm shadow-sm hover:bg-white transition-colors"
                aria-label="Add to wishlist"
              >
                <Heart
                  size={16}
                  strokeWidth={1.5}
                  className={cn(
                    "transition-colors",
                    isWishlisted
                      ? "fill-heritage-green text-heritage-green"
                      : "text-obsidian/50",
                  )}
                />
              </button>
              <button
                className="w-10 h-10 flex items-center justify-center bg-white/90 backdrop-blur-sm shadow-sm hover:bg-white transition-colors"
                aria-label="Share"
              >
                <Share2 size={16} strokeWidth={1.5} className="text-obsidian/50" />
              </button>
            </div>

            {/* Mobile dots */}
            {images.length > 1 && (
              <div className="sm:hidden flex items-center justify-center gap-2 mt-4">
                {images.map((_, idx) => (
                  <button
                    key={idx}
                    onClick={() => setSelectedImageIdx(idx)}
                    className={cn(
                      "h-1.5 rounded-full transition-all duration-300",
                      idx === selectedImageIdx
                        ? "bg-heritage-green w-6"
                        : "bg-neutral-300 w-1.5",
                    )}
                  />
                ))}
              </div>
            )}
          </div>
        </div>

        {/* ═══ RIGHT: STICKY PRODUCT PANEL ═══ */}
        <div>
          <div className="lg:sticky lg:top-28 space-y-6">
            {/* Brand */}
            <div>
              <Link
                href={`/shop?brand=${product.brand.slug}`}
                className="text-[10px] font-sans font-semibold tracking-[0.2em] uppercase text-heritage-purple hover:text-heritage-purple/70 transition-colors"
              >
                {product.brand.name}
              </Link>
              {product.brand.country && (
                <span className="text-[9px] font-sans text-neutral-300 ml-2 tracking-wider uppercase">
                  {product.brand.country}
                </span>
              )}
            </div>

            {/* Title */}
            <h1 className="text-2xl lg:text-[28px] font-serif tracking-tight text-obsidian leading-tight">
              {product.name}
            </h1>

            {/* Mytheresa-style Item Code */}
            <p className="text-[11px] font-sans text-neutral-400 tracking-wider tabular-nums -mt-3">
              Item No. {product.sku}
            </p>

            {/* Price */}
            <div className="flex items-baseline gap-3">
              <span
                className={cn(
                  "text-xl font-sans font-light tabular-nums",
                  isOnSale ? "text-heritage-purple" : "text-obsidian",
                )}
              >
                {formatPrice(finalPrice, product.currency)}
              </span>
              {isOnSale && (
                <span className="text-sm font-sans text-neutral-300 line-through tabular-nums">
                  {formatPrice(
                    product.basePriceCents +
                      (selectedVariant?.priceDeltaCents ?? 0),
                    product.currency,
                  )}
                </span>
              )}
            </div>

            <div className="w-full h-px bg-slate-border" />

            {/* ── SELECT SIZE DRAWER ── */}
            {product.variants.length > 0 && (
              <div>
                <button
                  onClick={() => setIsSizeDrawerOpen(!isSizeDrawerOpen)}
                  className={cn(
                    "w-full flex items-center justify-between h-14 px-5 border transition-all duration-200",
                    sizeNotSelected
                      ? "border-red-400 bg-red-50/30"
                      : selectedVariant
                        ? "border-heritage-green bg-heritage-green/[0.02]"
                        : "border-slate-border hover:border-obsidian/30",
                  )}
                >
                  <div className="flex items-center gap-3">
                    <Ruler size={16} strokeWidth={1.5} className="text-neutral-400" />
                    <span className="text-[13px] font-sans text-obsidian">
                      {selectedVariant
                        ? `Size ${selectedVariant.size}${selectedVariant.color ? ` — ${selectedVariant.color}` : ""}`
                        : "Select Size"}
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    {sizeNotSelected && (
                      <span className="text-[11px] font-sans text-red-500">Required</span>
                    )}
                    {selectedVariant && selectedVariant.stockCount <= 3 && (
                      <span className="text-[10px] font-sans text-amber-600 font-medium">
                        Only {selectedVariant.stockCount} left
                      </span>
                    )}
                    <ChevronDown
                      size={14}
                      className={cn(
                        "text-neutral-400 transition-transform duration-200",
                        isSizeDrawerOpen && "rotate-180",
                      )}
                    />
                  </div>
                </button>

                {/* Size drawer content */}
                <AnimatePresence>
                  {isSizeDrawerOpen && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: "auto", opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      transition={{ duration: 0.25, ease: [0.16, 1, 0.3, 1] }}
                      className="overflow-hidden border-x border-b border-slate-border"
                    >
                      <div className="p-4 space-y-1">
                        {product.variants.map((v) => {
                          const isSelected = selectedVariant?.id === v.id;
                          const outOfStock = v.stockCount <= 0;
                          const lowStock = v.stockCount > 0 && v.stockCount <= 3;
                          const itSize = SIZE_CHART[v.size]?.IT;

                          return (
                            <button
                              key={v.id}
                              onClick={() => handleSizeSelect(v)}
                              disabled={outOfStock}
                              className={cn(
                                "w-full flex items-center justify-between px-4 py-3 transition-all duration-150",
                                isSelected
                                  ? "bg-heritage-green/[0.04] border border-heritage-green"
                                  : outOfStock
                                    ? "opacity-40 cursor-not-allowed"
                                    : "hover:bg-ivory border border-transparent",
                              )}
                            >
                              <div className="flex items-center gap-3">
                                <span className="text-[13px] font-sans font-medium text-obsidian w-10">
                                  {v.size}
                                </span>
                                {itSize && (
                                  <span className="text-[11px] font-sans text-neutral-400">
                                    IT {itSize}
                                  </span>
                                )}
                                {v.color && (
                                  <>
                                    <span className="text-neutral-200">·</span>
                                    <span className="text-[11px] font-sans text-neutral-400">
                                      {v.color}
                                    </span>
                                    {v.colorHex && (
                                      <span
                                        className="w-3 h-3 rounded-full border border-neutral-200"
                                        style={{ backgroundColor: v.colorHex }}
                                      />
                                    )}
                                  </>
                                )}
                              </div>
                              <div className="flex items-center gap-3">
                                {outOfStock && (
                                  <span className="text-[10px] font-sans font-medium text-neutral-400 tracking-wider uppercase">
                                    Sold Out
                                  </span>
                                )}
                                {lowStock && (
                                  <span className="text-[10px] font-sans font-medium text-amber-600">
                                    {v.stockCount} left
                                  </span>
                                )}
                                {!outOfStock && !lowStock && (
                                  <span className="text-[10px] font-sans text-emerald-600">
                                    In Stock
                                  </span>
                                )}
                                {v.priceDeltaCents > 0 && (
                                  <span className="text-[11px] font-sans text-neutral-400">
                                    +{formatPrice(v.priceDeltaCents, product.currency)}
                                  </span>
                                )}
                                {isSelected && (
                                  <Check size={14} className="text-heritage-green" />
                                )}
                              </div>
                            </button>
                          );
                        })}
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            )}

            {/* ── QUANTITY ── */}
            <div className="flex items-center gap-5">
              <span className="text-[10px] font-sans font-semibold tracking-[0.2em] uppercase text-neutral-400">
                Quantity
              </span>
              <div className="flex items-center border border-slate-border">
                <button
                  onClick={() => setQuantity((q) => Math.max(1, q - 1))}
                  className="w-10 h-10 flex items-center justify-center text-neutral-400 hover:text-obsidian transition-colors"
                >
                  <Minus size={14} />
                </button>
                <span className="w-10 text-center text-sm font-sans font-medium tabular-nums text-obsidian">
                  {quantity}
                </span>
                <button
                  onClick={() =>
                    setQuantity((q) =>
                      Math.min(
                        10,
                        selectedVariant ? Math.min(q + 1, selectedVariant.stockCount) : q + 1,
                      ),
                    )
                  }
                  className="w-10 h-10 flex items-center justify-center text-neutral-400 hover:text-obsidian transition-colors"
                >
                  <Plus size={14} />
                </button>
              </div>
            </div>

            {/* ── ADD TO BAG ── */}
            <button
              onClick={handleAddToCart}
              disabled={inStockVariants.length === 0}
              className={cn(
                "w-full h-14 text-[13px] font-sans font-semibold tracking-wider uppercase flex items-center justify-center gap-3 transition-all duration-300 active:scale-[0.98]",
                addedToCart
                  ? "bg-emerald-700 text-white"
                  : "bg-heritage-green text-white hover:shadow-lg hover:shadow-heritage-green/20 disabled:opacity-40 disabled:cursor-not-allowed",
              )}
            >
              {addedToCart ? (
                <>
                  <Check size={16} />
                  Added to Bag
                </>
              ) : inStockVariants.length === 0 ? (
                "Currently Unavailable"
              ) : (
                <>
                  <ShoppingBag size={16} />
                  Add to Bag — {formatPrice(finalPrice * quantity, product.currency)}
                </>
              )}
            </button>

            {/* ── TRUST INDICATORS ── */}
            <div className="grid grid-cols-3 gap-3">
              {[
                { icon: Truck, label: "Complimentary\nExpress Shipping" },
                { icon: RotateCcw, label: "14-Day\nFree Returns" },
                { icon: ShieldCheck, label: "Authenticity\nGuaranteed" },
              ].map(({ icon: Icon, label }) => (
                <div
                  key={label}
                  className="flex flex-col items-center text-center py-4 bg-ivory/50"
                >
                  <Icon
                    size={18}
                    className="text-heritage-green/30 mb-2"
                    strokeWidth={1.2}
                  />
                  <span className="text-[9px] font-sans text-neutral-400 leading-tight whitespace-pre-line tracking-wide uppercase">
                    {label}
                  </span>
                </div>
              ))}
            </div>

            <div className="w-full h-px bg-slate-border" />

            {/* ── ACCORDIONS ── */}
            <div className="space-y-0">
              {ACCORDION_SECTIONS.map((section) => (
                <div key={section.key} className="border-b border-slate-border">
                  <button
                    onClick={() => toggleAccordion(section.key)}
                    className="w-full flex items-center justify-between py-5 group"
                  >
                    <span className="text-[12px] font-sans font-semibold tracking-[0.12em] uppercase text-obsidian group-hover:text-heritage-green transition-colors">
                      {section.title}
                    </span>
                    <motion.div
                      animate={{
                        rotate: openAccordions.has(section.key) ? 180 : 0,
                      }}
                      transition={{ duration: 0.25, ease: [0.16, 1, 0.3, 1] }}
                    >
                      <ChevronDown size={14} className="text-neutral-400" />
                    </motion.div>
                  </button>
                  <AnimatePresence initial={false}>
                    {openAccordions.has(section.key) && (
                      <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: "auto", opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
                        className="overflow-hidden"
                      >
                        <div className="pb-6">
                          <AccordionContent
                            sectionKey={section.key}
                            product={product}
                          />
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* ── HERITAGE NARRATIVE ── */}
      {product.heritage && product.heritage.isApproved && (
        <div className="mt-20 lg:mt-28">
          <div className="max-w-3xl mx-auto text-center">
            <p className="text-[10px] font-sans font-semibold tracking-[0.3em] uppercase text-heritage-purple/60 mb-4">
              The Heritage Narrative
            </p>
            <h2 className="text-display-sm font-serif italic text-obsidian mb-8">
              The Story Behind This Piece
            </h2>
            <div className="font-serif text-[16px] text-neutral-500 leading-[2] space-y-6 text-left">
              {product.heritage.historyAndHeritage
                .split("\n\n")
                .map((para, i) => (
                  <p
                    key={i}
                    className={cn(
                      i === 0 &&
                        "first-letter:text-5xl first-letter:font-serif first-letter:font-bold first-letter:text-heritage-green first-letter:mr-2 first-letter:float-left first-letter:leading-[0.75]",
                    )}
                  >
                    {para}
                  </p>
                ))}
            </div>

            {/* Occasion suitability */}
            {product.heritage.rightOccasion.length > 0 && (
              <div className="mt-12 pt-8 border-t border-slate-border text-left">
                <p className="text-[10px] font-sans font-semibold tracking-[0.2em] uppercase text-heritage-green/50 mb-5 text-center">
                  The Right Occasion
                </p>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {product.heritage.rightOccasion.map((occ, i) => (
                    <div
                      key={i}
                      className="flex items-start gap-3 py-3 px-4 bg-ivory/50"
                    >
                      <span className="text-heritage-green/30 text-xs mt-0.5">●</span>
                      <span className="text-[13px] font-sans text-neutral-500 leading-relaxed">
                        {occ}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* ── COMPLETE THE LOOK — Cross-category matchmaker ── */}
          {product.heritage.styleRecommendations.length > 0 && (
            <CompleteTheLook recommendations={product.heritage.styleRecommendations} />
          )}
        </div>
      )}
    </div>
  );
}

/* ──────────────────────────────────────────────────────────
   COMPLETE THE LOOK — CROSS-CATEGORY MATCHMAKER
   ────────────────────────────────────────────────────────── */

const CATEGORY_SLUGS: Record<string, string> = {
  "senator wear": "senator-wear",
  "native wear": "native-wear",
  footwear: "footwear",
  shoes: "shoes",
  bags: "bags",
  jewelry: "jewelry",
  jewellery: "jewellery",
  accessories: "accessories",
  "coats & jackets": "coats-jackets",
  "suits & tailoring": "suits-tailoring",
  dresses: "dresses",
  knitwear: "knitwear",
};

const CATEGORY_ICONS: Record<string, string> = {
  footwear: "👞",
  shoes: "👞",
  bags: "👜",
  jewelry: "💎",
  jewellery: "💎",
  accessories: "⌚",
  "senator wear": "🎩",
  "native wear": "🪡",
};

function parseRecommendation(rec: string): { category: string; item: string; slug: string } | null {
  const colonIdx = rec.indexOf(":");
  if (colonIdx > 0 && colonIdx < 30) {
    const cat = rec.substring(0, colonIdx).trim();
    const item = rec.substring(colonIdx + 1).trim();
    const slug = CATEGORY_SLUGS[cat.toLowerCase()] ?? "";
    return { category: cat, item, slug };
  }
  return null;
}

function CompleteTheLook({ recommendations }: { recommendations: string[] }) {
  const parsed = recommendations
    .map(parseRecommendation)
    .filter((r): r is NonNullable<typeof r> => r !== null);

  const unparsed = recommendations.filter((r) => !parseRecommendation(r));

  if (parsed.length === 0 && unparsed.length === 0) return null;

  return (
    <div className="mt-16 pt-12 border-t border-slate-border">
      <div className="max-w-4xl mx-auto">
        <div className="text-center mb-10">
          <p className="text-[10px] font-sans font-semibold tracking-[0.3em] uppercase text-heritage-purple/60 mb-3">
            The Luxury Matchmaker
          </p>
          <h3 className="text-display-sm font-serif italic text-obsidian mb-3">
            Complete The Look
          </h3>
          <p className="text-[13px] font-sans text-neutral-400 max-w-md mx-auto">
            Our AI has curated complementary pieces from across our collection
            to help you build a considered, head-to-toe ensemble.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {parsed.map((rec, i) => {
            const icon = CATEGORY_ICONS[rec.category.toLowerCase()] ?? "✦";
            return (
              <Link
                key={i}
                href={rec.slug ? `/shop?category=${rec.slug}` : "/shop"}
                className="group block p-5 border border-slate-border bg-white hover:border-heritage-green/30 hover:shadow-sm transition-all duration-300"
              >
                <div className="flex items-start gap-3">
                  <span className="text-lg shrink-0 mt-0.5 grayscale group-hover:grayscale-0 transition-all duration-300">
                    {icon}
                  </span>
                  <div className="min-w-0">
                    <p className="text-[10px] font-sans font-semibold tracking-[0.2em] uppercase text-heritage-green mb-1.5">
                      {rec.category}
                    </p>
                    <p className="text-[13px] font-sans text-neutral-600 leading-relaxed line-clamp-2 group-hover:text-obsidian transition-colors">
                      {rec.item}
                    </p>
                  </div>
                </div>
                <div className="mt-3 pt-3 border-t border-slate-border/50 flex items-center justify-between">
                  <span className="text-[10px] font-sans font-medium tracking-[0.15em] uppercase text-neutral-300 group-hover:text-heritage-green transition-colors">
                    Explore {rec.category}
                  </span>
                  <ChevronDown size={10} className="text-neutral-300 -rotate-90 group-hover:text-heritage-green transition-colors" />
                </div>
              </Link>
            );
          })}
        </div>

        {unparsed.length > 0 && (
          <div className="mt-6 flex flex-wrap justify-center gap-2">
            {unparsed.map((rec, i) => (
              <span
                key={i}
                className="px-4 py-2 text-[12px] font-sans text-obsidian/60 border border-slate-border"
              >
                {rec}
              </span>
            ))}
          </div>
        )}

        <div className="text-center mt-8">
          <Link
            href="/shop"
            className="inline-flex items-center gap-2 text-[11px] font-sans font-medium tracking-[0.15em] uppercase text-heritage-green border-b border-heritage-green/20 pb-1 hover:border-heritage-green transition-colors"
          >
            Browse Full Collection
            <ChevronDown size={10} className="-rotate-90" />
          </Link>
        </div>
      </div>
    </div>
  );
}

/* ──────────────────────────────────────────────────────────
   ACCORDION CONTENT
   ────────────────────────────────────────────────────────── */

function AccordionContent({
  sectionKey,
  product,
}: {
  sectionKey: AccordionKey;
  product: Product;
}) {
  switch (sectionKey) {
    case "description":
      return (
        <div className="text-[13px] font-sans text-neutral-500 leading-relaxed space-y-3">
          {product.description ? (
            product.description.split("\n\n").map((p, i) => <p key={i}>{p}</p>)
          ) : (
            <p>
              A carefully curated piece from {product.brand.name}, selected by our
              editorial team for its exceptional craftsmanship and enduring style.
            </p>
          )}
          <div className="flex flex-wrap gap-x-6 gap-y-2 pt-3 text-[11px] text-neutral-400">
            <span>SKU: {product.sku}</span>
            <span>Category: {product.category.name}</span>
            {product.brand.country && <span>Made in {product.brand.country}</span>}
          </div>
        </div>
      );

    case "sizefit":
      return (
        <div className="text-[13px] font-sans text-neutral-500 leading-relaxed space-y-4">
          <p>
            This piece is true to size. We recommend selecting your usual{" "}
            {product.brand.name} size. If you are between sizes, we suggest sizing
            up for a more relaxed fit.
          </p>
          {product.variants.length > 0 && (
            <div className="overflow-x-auto">
              <table className="w-full text-[11px]">
                <thead>
                  <tr className="border-b border-slate-border">
                    <th className="text-left py-2 font-semibold text-obsidian tracking-wider uppercase pr-6">
                      Size
                    </th>
                    <th className="text-left py-2 font-semibold text-obsidian tracking-wider uppercase pr-6">
                      IT
                    </th>
                    <th className="text-left py-2 font-semibold text-obsidian tracking-wider uppercase pr-6">
                      FR
                    </th>
                    <th className="text-left py-2 font-semibold text-obsidian tracking-wider uppercase pr-6">
                      UK
                    </th>
                    <th className="text-left py-2 font-semibold text-obsidian tracking-wider uppercase">
                      US
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {product.variants.map((v) => {
                    const chart = SIZE_CHART[v.size];
                    if (!chart) return null;
                    return (
                      <tr key={v.id} className="border-b border-slate-border/50">
                        <td className="py-2 text-obsidian font-medium">{v.size}</td>
                        <td className="py-2 text-neutral-400">{chart.IT ?? "—"}</td>
                        <td className="py-2 text-neutral-400">{chart.FR ?? "—"}</td>
                        <td className="py-2 text-neutral-400">{chart.UK ?? "—"}</td>
                        <td className="py-2 text-neutral-400">{chart.US ?? "—"}</td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>
      );

    case "shipping":
      return (
        <div className="text-[13px] font-sans text-neutral-500 leading-relaxed space-y-4">
          <div className="space-y-2">
            <div className="flex items-start gap-3">
              <Truck size={14} className="text-heritage-green/50 mt-0.5 shrink-0" />
              <div>
                <p className="text-obsidian font-medium mb-0.5">
                  Complimentary Express Shipping
                </p>
                <p>
                  All orders ship via DHL Express. Estimated delivery: 2–4
                  business days within the US, 3–7 business days internationally.
                </p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <RotateCcw size={14} className="text-heritage-green/50 mt-0.5 shrink-0" />
              <div>
                <p className="text-obsidian font-medium mb-0.5">
                  14-Day Return Policy
                </p>
                <p>
                  Items may be returned within 14 days of delivery in their
                  original condition with all tags attached. Final sale items are
                  excluded.
                </p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <ShieldCheck size={14} className="text-heritage-green/50 mt-0.5 shrink-0" />
              <div>
                <p className="text-obsidian font-medium mb-0.5">
                  Certificate of Authenticity
                </p>
                <p>
                  Every piece ships with a Heritage Edit certificate verifying
                  provenance and authenticity.
                </p>
              </div>
            </div>
          </div>
        </div>
      );
  }
}
