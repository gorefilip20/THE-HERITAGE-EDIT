"use client";

import { useEffect, useState, useMemo } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
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
  BookOpen,
  Sparkles,
  Star,
} from "lucide-react";
import { cn, formatPrice } from "@/lib/utils";
import { useCartStore } from "@/store/cart-store";
import type { Product, ProductVariant } from "@/types";

const SIZE_TRANSLATIONS: Record<string, Record<string, string>> = {
  XXS: { EU: "32", UK: "4", US: "00" },
  XS: { EU: "34", UK: "6", US: "0" },
  S: { EU: "36–38", UK: "8–10", US: "2–4" },
  M: { EU: "40–42", UK: "12–14", US: "6–8" },
  L: { EU: "44–46", UK: "16–18", US: "10–12" },
  XL: { EU: "48–50", UK: "20–22", US: "14–16" },
  XXL: { EU: "52–54", UK: "24–26", US: "18–20" },
};

type SizeScale = "EU" | "UK" | "US";

export default function ProductDetailPage() {
  const params = useParams();
  const slug = params.slug as string;
  const addItem = useCartStore((s) => s.addItem);
  const openCart = useCartStore((s) => s.openCart);

  const [product, setProduct] = useState<Product | null>(null);
  const [loading, setLoading] = useState(true);
  const [selectedImageIdx, setSelectedImageIdx] = useState(0);
  const [selectedVariant, setSelectedVariant] = useState<ProductVariant | null>(null);
  const [sizeScale, setSizeScale] = useState<SizeScale>("EU");
  const [quantity, setQuantity] = useState(1);
  const [openAccordion, setOpenAccordion] = useState<string | null>("heritage");
  const [isWishlisted, setIsWishlisted] = useState(false);
  const [addedToCart, setAddedToCart] = useState(false);

  useEffect(() => {
    async function load() {
      try {
        const res = await fetch(`/api/products/${slug}`);
        if (res.ok) {
          const data = await res.json();
          setProduct(data);
          if (data.variants?.length > 0) setSelectedVariant(data.variants[0]);
        }
      } finally {
        setLoading(false);
      }
    }
    load();
  }, [slug]);

  const finalPrice = useMemo(() => {
    if (!product) return 0;
    const base = product.salePriceCents ?? product.basePriceCents;
    return base + (selectedVariant?.priceDeltaCents ?? 0);
  }, [product, selectedVariant]);

  const isOnSale = product?.salePriceCents !== null && product?.salePriceCents !== undefined;

  const handleAddToCart = () => {
    if (!product || !selectedVariant) return;
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
    setTimeout(() => setAddedToCart(false), 2000);
    openCart();
  };

  const toggleAccordion = (key: string) =>
    setOpenAccordion((prev) => (prev === key ? null : key));

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12">
          <div className="lg:col-span-7">
            <div className="flex gap-4">
              <div className="flex flex-col gap-3 w-20">
                {[...Array(4)].map((_, i) => (
                  <div key={i} className="aspect-[3/4] rounded-lg bg-neutral-100 animate-pulse" />
                ))}
              </div>
              <div className="flex-1 aspect-[3/4] rounded-xl bg-neutral-100 animate-pulse" />
            </div>
          </div>
          <div className="lg:col-span-5 space-y-6">
            <div className="h-4 w-24 bg-neutral-100 rounded animate-pulse" />
            <div className="h-8 w-3/4 bg-neutral-100 rounded animate-pulse" />
            <div className="h-6 w-32 bg-neutral-100 rounded animate-pulse" />
            <div className="h-12 w-full bg-neutral-100 rounded-lg animate-pulse mt-8" />
          </div>
        </div>
      </div>
    );
  }

  if (!product) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24 text-center">
        <h1 className="text-2xl font-serif text-neutral-900 mb-2">Product Not Found</h1>
        <p className="text-sm text-neutral-500 mb-6">
          The piece you&apos;re looking for may have been removed from our collection.
        </p>
        <Link
          href="/"
          className="inline-flex items-center gap-2 text-sm font-sans font-medium text-[#0D2C22] hover:underline"
        >
          Return to the Edit
        </Link>
      </div>
    );
  }

  const images = product.images.length > 0
    ? product.images
    : [{ id: "placeholder", url: "/placeholder-product.jpg", alt: product.name, sortOrder: 0, isPrimary: true }];

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 lg:py-16">
      {/* Breadcrumb */}
      <nav className="flex items-center gap-2 text-xs font-sans text-neutral-400 mb-8">
        <Link href="/" className="hover:text-neutral-700 transition-colors">
          Home
        </Link>
        <span>/</span>
        <Link
          href={`/collection/${product.category.slug}`}
          className="hover:text-neutral-700 transition-colors"
        >
          {product.category.name}
        </Link>
        <span>/</span>
        <span className="text-neutral-700 truncate max-w-[200px]">{product.name}</span>
      </nav>

      {/* ─── ASYMMETRIC GRID ─── */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12">
        {/* ─── LEFT: IMAGE GALLERY ─── */}
        <div className="lg:col-span-7">
          <div className="flex gap-4">
            {/* Vertical thumbnail strip */}
            <div className="hidden sm:flex flex-col gap-3 w-[72px] shrink-0">
              {images.map((img, idx) => (
                <button
                  key={img.id}
                  onClick={() => setSelectedImageIdx(idx)}
                  className={cn(
                    "relative aspect-[3/4] rounded-lg overflow-hidden border-2 transition-all duration-200",
                    idx === selectedImageIdx
                      ? "border-[#0D2C22] shadow-sm"
                      : "border-transparent opacity-60 hover:opacity-100",
                  )}
                >
                  <img
                    src={img.url}
                    alt={img.alt ?? `View ${idx + 1}`}
                    className="w-full h-full object-cover"
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
                  transition={{ duration: 0.3 }}
                  className="aspect-[3/4] rounded-xl overflow-hidden bg-neutral-50"
                >
                  <img
                    src={images[selectedImageIdx]?.url}
                    alt={images[selectedImageIdx]?.alt ?? product.name}
                    className="w-full h-full object-cover"
                  />
                </motion.div>
              </AnimatePresence>

              {isOnSale && (
                <div className="absolute top-4 left-4 px-3 py-1.5 bg-[#2E1A47] text-white text-[10px] font-sans font-bold tracking-[0.2em] uppercase rounded-full">
                  Sale
                </div>
              )}

              <div className="absolute top-4 right-4 flex flex-col gap-2">
                <button
                  onClick={() => setIsWishlisted(!isWishlisted)}
                  className="w-10 h-10 rounded-full bg-white/90 backdrop-blur-sm shadow-sm flex items-center justify-center hover:bg-white transition-colors"
                >
                  <Heart
                    size={18}
                    className={cn(
                      "transition-colors",
                      isWishlisted ? "fill-red-500 text-red-500" : "text-neutral-600",
                    )}
                  />
                </button>
                <button className="w-10 h-10 rounded-full bg-white/90 backdrop-blur-sm shadow-sm flex items-center justify-center hover:bg-white transition-colors">
                  <Share2 size={18} className="text-neutral-600" />
                </button>
              </div>

              <div className="sm:hidden flex items-center justify-center gap-2 mt-4">
                {images.map((_, idx) => (
                  <button
                    key={idx}
                    onClick={() => setSelectedImageIdx(idx)}
                    className={cn(
                      "w-2 h-2 rounded-full transition-all",
                      idx === selectedImageIdx ? "bg-[#0D2C22] w-6" : "bg-neutral-300",
                    )}
                  />
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* ─── RIGHT: STICKY PRODUCT PANEL ─── */}
        <div className="lg:col-span-5">
          <div className="lg:sticky lg:top-28 space-y-6">
            <div>
              <Link
                href={`/collection?brand=${product.brand.slug}`}
                className="text-[11px] font-sans font-semibold tracking-[0.2em] uppercase text-[#2E1A47] hover:text-[#2E1A47]/70 transition-colors"
              >
                {product.brand.name}
              </Link>
              {product.brand.country && (
                <span className="text-[10px] font-sans text-neutral-300 ml-2 tracking-wider uppercase">
                  {product.brand.country}
                </span>
              )}
            </div>

            <h1 className="text-2xl lg:text-3xl font-serif tracking-tight text-neutral-900 leading-tight">
              {product.name}
            </h1>

            <div className="flex items-baseline gap-3">
              <span className="text-xl font-sans font-light tabular-nums text-neutral-900">
                {formatPrice(finalPrice)}
              </span>
              {isOnSale && (
                <span className="text-sm font-sans text-neutral-400 line-through tabular-nums">
                  {formatPrice(product.basePriceCents)}
                </span>
              )}
            </div>

            {product.description && (
              <p className="text-sm font-sans text-neutral-500 leading-relaxed">
                {product.description}
              </p>
            )}

            <div className="w-full h-px bg-neutral-100" />

            {/* Size selector with EU/UK/US scale translations */}
            {product.variants.length > 0 && (
              <div>
                <div className="flex items-center justify-between mb-3">
                  <span className="text-[11px] font-sans font-semibold tracking-[0.15em] uppercase text-neutral-500">
                    Select Size
                  </span>
                  <div className="flex items-center gap-1 bg-neutral-50 rounded-lg p-0.5">
                    {(["EU", "UK", "US"] as SizeScale[]).map((scale) => (
                      <button
                        key={scale}
                        onClick={() => setSizeScale(scale)}
                        className={cn(
                          "px-2.5 py-1 rounded-md text-[10px] font-sans font-bold tracking-wider transition-all duration-200",
                          sizeScale === scale
                            ? "bg-white shadow-sm text-[#0D2C22]"
                            : "text-neutral-400 hover:text-neutral-600",
                        )}
                      >
                        {scale}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="grid grid-cols-4 gap-2">
                  {product.variants.map((v) => {
                    const translation = SIZE_TRANSLATIONS[v.size]?.[sizeScale] ?? v.size;
                    const isSelected = selectedVariant?.id === v.id;
                    const outOfStock = v.stockCount <= 0;

                    return (
                      <button
                        key={v.id}
                        onClick={() => !outOfStock && setSelectedVariant(v)}
                        disabled={outOfStock}
                        className={cn(
                          "relative h-12 rounded-lg border text-center transition-all duration-200",
                          isSelected
                            ? "border-[#0D2C22] bg-[#0D2C22] text-white shadow-sm"
                            : outOfStock
                              ? "border-neutral-100 bg-neutral-50 text-neutral-300 cursor-not-allowed"
                              : "border-neutral-200 bg-white text-neutral-700 hover:border-[#0D2C22]/40",
                        )}
                      >
                        <span className="text-sm font-sans font-medium">{translation}</span>
                        <span className="block text-[9px] font-sans text-current opacity-50 -mt-0.5">
                          {v.size}
                        </span>
                        {outOfStock && (
                          <div className="absolute inset-0 flex items-center justify-center">
                            <div className="w-[70%] h-px bg-neutral-300 rotate-[-20deg]" />
                          </div>
                        )}
                        {v.stockCount > 0 && v.stockCount <= 3 && !isSelected && (
                          <span className="absolute -top-1.5 -right-1.5 w-4 h-4 rounded-full bg-amber-500 text-white text-[8px] font-bold flex items-center justify-center">
                            {v.stockCount}
                          </span>
                        )}
                      </button>
                    );
                  })}
                </div>

                <button className="flex items-center gap-1.5 mt-3 text-xs font-sans text-neutral-400 hover:text-[#0D2C22] transition-colors">
                  <Ruler size={13} strokeWidth={1.5} />
                  <span>View size guide</span>
                </button>
              </div>
            )}

            {/* Quantity */}
            <div className="flex items-center gap-4">
              <span className="text-[11px] font-sans font-semibold tracking-[0.15em] uppercase text-neutral-500">
                Qty
              </span>
              <div className="flex items-center border border-neutral-200 rounded-lg overflow-hidden">
                <button
                  onClick={() => setQuantity((q) => Math.max(1, q - 1))}
                  className="w-10 h-10 flex items-center justify-center text-neutral-400 hover:text-neutral-700 hover:bg-neutral-50 transition-colors"
                >
                  <Minus size={14} />
                </button>
                <span className="w-12 text-center text-sm font-sans font-medium tabular-nums text-neutral-900">
                  {quantity}
                </span>
                <button
                  onClick={() => setQuantity((q) => Math.min(10, q + 1))}
                  className="w-10 h-10 flex items-center justify-center text-neutral-400 hover:text-neutral-700 hover:bg-neutral-50 transition-colors"
                >
                  <Plus size={14} />
                </button>
              </div>
            </div>

            {/* Add to cart */}
            <button
              onClick={handleAddToCart}
              disabled={!selectedVariant || (selectedVariant?.stockCount ?? 0) <= 0}
              className={cn(
                "w-full h-14 rounded-xl text-sm font-sans font-semibold tracking-wide flex items-center justify-center gap-2.5 transition-all duration-300 active:scale-[0.98]",
                addedToCart
                  ? "bg-emerald-600 text-white"
                  : "bg-[#0D2C22] text-white hover:shadow-lg hover:shadow-[#0D2C22]/20 disabled:opacity-40 disabled:cursor-not-allowed",
              )}
            >
              {addedToCart ? (
                <>
                  <ShieldCheck size={18} />
                  Added to Bag
                </>
              ) : (
                <>
                  <ShoppingBag size={18} />
                  Add to Bag — {formatPrice(finalPrice * quantity)}
                </>
              )}
            </button>

            {/* Trust indicators */}
            <div className="grid grid-cols-3 gap-3">
              {[
                { icon: Truck, label: "Complimentary\nExpress Shipping" },
                { icon: RotateCcw, label: "14-Day\nFree Returns" },
                { icon: ShieldCheck, label: "Authenticity\nGuaranteed" },
              ].map(({ icon: Icon, label }) => (
                <div
                  key={label}
                  className="flex flex-col items-center text-center p-3 rounded-lg bg-neutral-50/50"
                >
                  <Icon size={18} className="text-[#0D2C22]/40 mb-1.5" strokeWidth={1.2} />
                  <span className="text-[10px] font-sans text-neutral-400 leading-tight whitespace-pre-line">
                    {label}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* ─── HERITAGE NARRATIVE ACCORDIONS ─── */}
      {product.heritage && (
        <div className="mt-16 lg:mt-24 max-w-3xl">
          <div className="flex items-center gap-3 mb-8">
            <div className="w-8 h-8 rounded-lg bg-[#0D2C22]/[0.05] flex items-center justify-center">
              <BookOpen size={16} className="text-[#0D2C22]/50" strokeWidth={1.5} />
            </div>
            <h2 className="text-lg font-serif italic text-neutral-900">
              The Heritage Narrative
            </h2>
          </div>

          <div className="space-y-0">
            <AccordionItem
              title="Heritage & History"
              icon={<Sparkles size={15} className="text-[#0D2C22]/40" />}
              isOpen={openAccordion === "heritage"}
              onToggle={() => toggleAccordion("heritage")}
            >
              <div className="font-serif text-neutral-600 leading-[1.9] space-y-4">
                {product.heritage.historyAndHeritage
                  .split("\n\n")
                  .map((para, i) => (
                    <p
                      key={i}
                      className={cn(
                        "text-[15px]",
                        i === 0 &&
                          "first-letter:text-4xl first-letter:font-serif first-letter:font-bold first-letter:text-[#0D2C22] first-letter:mr-1.5 first-letter:float-left first-letter:leading-[0.8]",
                      )}
                    >
                      {para}
                    </p>
                  ))}
              </div>
            </AccordionItem>

            <AccordionItem
              title="When to Wear"
              icon={<Star size={15} className="text-[#0D2C22]/40" />}
              isOpen={openAccordion === "wear"}
              onToggle={() => toggleAccordion("wear")}
            >
              <div className="font-serif italic text-neutral-500 text-[15px] leading-[1.9] space-y-3">
                {product.heritage.whenToWear
                  .split("\n\n")
                  .map((para, i) => (
                    <p key={i}>{para}</p>
                  ))}
              </div>
            </AccordionItem>

            <AccordionItem
              title="The Right Occasion"
              icon={<Star size={15} className="text-[#0D2C22]/40" />}
              isOpen={openAccordion === "occasion"}
              onToggle={() => toggleAccordion("occasion")}
            >
              <div className="space-y-3">
                {product.heritage.rightOccasion.map((occ, i) => (
                  <div key={i} className="flex items-start gap-3 pl-1">
                    <div className="w-1.5 h-1.5 rounded-full bg-[#0D2C22]/30 mt-2 shrink-0" />
                    <span className="text-[15px] font-serif italic text-neutral-600 leading-relaxed">
                      {occ}
                    </span>
                  </div>
                ))}
              </div>
            </AccordionItem>

            <AccordionItem
              title="Complete the Look"
              icon={<ShoppingBag size={15} className="text-[#0D2C22]/40" />}
              isOpen={openAccordion === "look"}
              onToggle={() => toggleAccordion("look")}
            >
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {product.heritage.styleRecommendations.map((rec, i) => (
                  <div
                    key={i}
                    className="flex items-center gap-3 p-3.5 rounded-lg border border-[#0D2C22]/[0.06] bg-[#0D2C22]/[0.01] hover:border-[#0D2C22]/15 transition-colors"
                  >
                    <div className="w-7 h-7 rounded-md bg-[#0D2C22]/[0.04] flex items-center justify-center shrink-0">
                      <ShoppingBag size={12} className="text-[#0D2C22]/30" />
                    </div>
                    <span className="text-sm font-sans text-neutral-600">{rec}</span>
                  </div>
                ))}
              </div>
            </AccordionItem>
          </div>
        </div>
      )}
    </div>
  );
}

function AccordionItem({
  title,
  icon,
  isOpen,
  onToggle,
  children,
}: {
  title: string;
  icon: React.ReactNode;
  isOpen: boolean;
  onToggle: () => void;
  children: React.ReactNode;
}) {
  return (
    <div className="border-b border-[#0D2C22]/[0.08]">
      <button
        onClick={onToggle}
        className="w-full flex items-center justify-between py-5 group"
      >
        <div className="flex items-center gap-3">
          {icon}
          <span className="text-sm font-sans font-medium tracking-wide text-neutral-800 group-hover:text-[#0D2C22] transition-colors">
            {title}
          </span>
        </div>
        <motion.div
          animate={{ rotate: isOpen ? 180 : 0 }}
          transition={{ duration: 0.25, ease: [0.16, 1, 0.3, 1] }}
        >
          <ChevronDown size={16} className="text-neutral-400" />
        </motion.div>
      </button>
      <AnimatePresence initial={false}>
        {isOpen && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.35, ease: [0.16, 1, 0.3, 1] }}
            className="overflow-hidden"
          >
            <div className="pb-6 pl-8">{children}</div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
