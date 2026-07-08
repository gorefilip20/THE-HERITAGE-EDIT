"use client";

import { useEffect, useState, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import { motion } from "framer-motion";
import { ArrowRight } from "lucide-react";
import { ProductCard } from "@/components/product/ProductCard";
import { getImagePlaceholder } from "@/lib/utils";
import type { Product } from "@/types";

const DISCOUNT_TIERS = [
  { label: "Up to 30% Off", value: "30", color: "bg-red-600" },
  { label: "Up to 50% Off", value: "50", color: "bg-red-700" },
  { label: "Up to 70% Off", value: "70", color: "bg-red-800" },
];

function SalePageContent() {
  const searchParams = useSearchParams();
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);

  const discount = searchParams.get("discount");
  const gender = searchParams.get("gender");

  useEffect(() => {
    setLoading(true);
    const params = new URLSearchParams();
    params.set("pageSize", "24");
    params.set("tag", "sale");
    if (discount) params.set("discount", discount);
    if (gender) params.set("gender", gender);

    fetch(`/api/products?${params.toString()}`)
      .then((r) => r.json())
      .then((d) => setProducts(d.data ?? []))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [discount, gender]);

  return (
    <div className="bg-white min-h-screen">
      {/* Hero - Sale Banner */}
      <section className="relative bg-gradient-to-r from-red-700 to-red-900 overflow-hidden py-12 md:py-20">
        <div className="absolute inset-0 opacity-10">
          <div className="absolute inset-0 bg-[url('data:image/svg+xml;utf8,<svg xmlns=%22http://www.w3.org/2000/svg%22 viewBox=%220 0 100 100%22><text x=%2250%22 y=%2250%22 font-size=%2280%22 fill=%22white%22 text-anchor=%22middle%22 dominant-baseline=%22middle%22>%25</text></svg>')] bg-repeat opacity-5"></div>
        </div>
        <div className="relative luxury-container">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="max-w-2xl"
          >
            <p className="text-[12px] font-sans font-semibold tracking-[0.3em] uppercase text-white/60 mb-4">
              Limited Time Offer
            </p>
            <h1 className="text-display-lg md:text-display-xl font-serif italic text-white mb-6 leading-tight">
              End of Season Sale
            </h1>
            <p className="text-[15px] font-sans text-white/70 leading-relaxed mb-8 max-w-lg">
              Up to 70% off on selected heritage pieces. Luxury African fashion at exceptional prices.
            </p>
            <div className="flex flex-wrap gap-4">
              {DISCOUNT_TIERS.map((tier) => (
                <Link
                  key={tier.value}
                  href={`/sale?discount=${tier.value}`}
                  className={`inline-flex items-center gap-2 px-6 h-12 ${tier.color} text-white text-[11px] font-sans font-semibold tracking-[0.15em] uppercase hover:shadow-lg transition-all duration-300`}
                >
                  {tier.label}
                  <ArrowRight size={12} />
                </Link>
              ))}
            </div>
          </motion.div>
        </div>
      </section>

      {/* Filter Section */}
      <section className="luxury-container py-12 border-b border-slate-border">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-6">
          <div>
            <h2 className="text-display-sm font-serif italic text-obsidian mb-2">
              Sale Collection
            </h2>
            <p className="text-[13px] font-sans text-neutral-500">
              {products.length} items on sale
            </p>
          </div>
          <div className="flex flex-wrap gap-3">
            <Link
              href="/sale"
              className={`px-4 h-10 border text-[11px] font-sans font-medium tracking-wider uppercase transition-all ${
                !gender
                  ? "bg-obsidian text-white border-obsidian"
                  : "border-slate-border text-obsidian hover:border-obsidian"
              }`}
            >
              All
            </Link>
            <Link
              href="/sale?gender=women"
              className={`px-4 h-10 border text-[11px] font-sans font-medium tracking-wider uppercase transition-all ${
                gender === "women"
                  ? "bg-obsidian text-white border-obsidian"
                  : "border-slate-border text-obsidian hover:border-obsidian"
              }`}
            >
              Women
            </Link>
            <Link
              href="/sale?gender=men"
              className={`px-4 h-10 border text-[11px] font-sans font-medium tracking-wider uppercase transition-all ${
                gender === "men"
                  ? "bg-obsidian text-white border-obsidian"
                  : "border-slate-border text-obsidian hover:border-obsidian"
              }`}
            >
              Men
            </Link>
            <Link
              href="/sale?gender=kids"
              className={`px-4 h-10 border text-[11px] font-sans font-medium tracking-wider uppercase transition-all ${
                gender === "kids"
                  ? "bg-obsidian text-white border-obsidian"
                  : "border-slate-border text-obsidian hover:border-obsidian"
              }`}
            >
              Kids
            </Link>
          </div>
        </div>
      </section>

      {/* Products Grid */}
      <section className="luxury-container py-16">
        {loading ? (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-6">
            {Array.from({ length: 12 }).map((_, i) => (
              <div key={i} className="space-y-3">
                <div className="aspect-[3/4] bg-neutral-100 animate-pulse" />
                <div className="h-3 w-16 bg-neutral-100 animate-pulse" />
                <div className="h-4 w-32 bg-neutral-100 animate-pulse" />
              </div>
            ))}
          </div>
        ) : products.length > 0 ? (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-6">
            {products.map((product) => (
              <ProductCard
                key={product.id}
                slug={product.slug}
                name={product.name}
                brandName={product.brand.name}
                priceCents={product.basePriceCents}
                salePriceCents={product.salePriceCents}
                currency={product.currency}
                imageUrl={product.images[0]?.url ?? getImagePlaceholder(600, 800)}
                hoverImageUrl={product.images[1]?.url}
              />
            ))}
          </div>
        ) : (
          <div className="text-center py-24">
            <p className="text-lg font-serif italic text-neutral-400 mb-4">
              No items found
            </p>
            <p className="text-sm text-neutral-500 mb-8">
              Check back soon for amazing sale prices on heritage pieces.
            </p>
            <Link
              href="/shop"
              className="inline-flex items-center gap-2 h-12 px-8 bg-obsidian text-white text-[11px] font-sans font-semibold tracking-[0.15em] uppercase hover:bg-neutral-800 transition-colors"
            >
              Continue Shopping
              <ArrowRight size={14} />
            </Link>
          </div>
        )}
      </section>
    </div>
  );
}

export default function SalePage() {
  return (
    <Suspense fallback={<div className="text-center py-12">Loading...</div>}>
      <SalePageContent />
    </Suspense>
  );
}
