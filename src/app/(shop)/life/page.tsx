"use client";

import { useEffect, useState, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import { motion } from "framer-motion";
import { ProductCard } from "@/components/product/ProductCard";
import { getImagePlaceholder } from "@/lib/utils";
import type { Product } from "@/types";

const LIFE_CATEGORIES = [
  { name: "Home Textiles", slug: "textiles", description: "Hand-woven throws, cushions & table runners", image: getImagePlaceholder(600, 400) },
  { name: "Wall Art", slug: "wall-art", description: "African-inspired prints & original artworks", image: getImagePlaceholder(600, 400) },
  { name: "Beauty", slug: "beauty", description: "Natural skincare & body care from Africa", image: getImagePlaceholder(600, 400) },
  { name: "Fragrance", slug: "fragrance", description: "Candles & perfumes with African botanicals", image: getImagePlaceholder(600, 400) },
  { name: "Tableware", slug: "tableware", description: "Artisan ceramics & handcrafted serveware", image: getImagePlaceholder(600, 400) },
  { name: "Gifts", slug: "gifts", description: "Curated gift sets for every occasion", image: getImagePlaceholder(600, 400) },
];

function LifePageContent() {
  const searchParams = useSearchParams();
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);

  const category = searchParams.get("category");

  useEffect(() => {
    setLoading(true);
    const params = new URLSearchParams();
    params.set("pageSize", "12");
    if (category) params.set("category", category);
    params.set("tag", "life");

    fetch(`/api/products?${params.toString()}`)
      .then((r) => r.json())
      .then((d) => setProducts(d.data ?? []))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [category]);

  return (
    <div className="bg-white min-h-screen">
      {/* Hero */}
      <section className="relative h-[50vh] min-h-[400px] bg-obsidian overflow-hidden">
        <div className="absolute inset-0">
          <Image
            src={getImagePlaceholder(1920, 800)}
            alt="Life & Home Collection"
            fill
            className="object-cover opacity-40"
          />
        </div>
        <div className="absolute inset-0 bg-gradient-to-t from-obsidian/80 to-transparent" />
        <div className="relative luxury-container h-full flex flex-col justify-end pb-16">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
          >
            <p className="text-[10px] font-sans font-medium tracking-[0.4em] uppercase text-white/40 mb-4">
              Home &middot; Beauty &middot; Gifts
            </p>
            <h1 className="text-display-lg font-serif italic text-white mb-4">
              Life
            </h1>
            <p className="text-[15px] font-sans text-white/60 max-w-lg">
              Extend the heritage beyond your wardrobe. Discover artisan-crafted
              homeware, natural beauty, and thoughtful gifts rooted in African craftsmanship.
            </p>
          </motion.div>
        </div>
      </section>

      {/* Category Grid */}
      <section className="luxury-container py-16">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {LIFE_CATEGORIES.map((cat, idx) => (
            <motion.div
              key={cat.slug}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: idx * 0.1 }}
            >
              <Link
                href={`/life?category=${cat.slug}`}
                className="group block"
              >
                <div className="relative aspect-[3/2] bg-ivory overflow-hidden mb-4">
                  <Image
                    src={cat.image}
                    alt={cat.name}
                    fill
                    className="object-cover transition-transform duration-700 group-hover:scale-105"
                  />
                  <div className="absolute inset-0 bg-black/20 group-hover:bg-black/10 transition-colors duration-500" />
                </div>
                <h3 className="text-lg font-serif text-obsidian group-hover:text-heritage-green transition-colors mb-1">
                  {cat.name}
                </h3>
                <p className="text-[13px] font-sans text-neutral-500">
                  {cat.description}
                </p>
              </Link>
            </motion.div>
          ))}
        </div>
      </section>

      {/* Products */}
      {category && (
        <section className="luxury-container pb-24">
          <div className="flex items-center justify-between mb-10">
            <h2 className="text-display-sm font-serif italic text-obsidian">
              {category.charAt(0).toUpperCase() + category.slice(1).replace("-", " ")}
            </h2>
            <p className="text-sm text-neutral-500">{products.length} pieces</p>
          </div>

          {loading ? (
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-6">
              {Array.from({ length: 8 }).map((_, i) => (
                <div key={i} className="space-y-3">
                  <div className="aspect-[3/4] bg-neutral-100 animate-pulse" />
                  <div className="h-3 w-16 bg-neutral-100 animate-pulse" />
                  <div className="h-4 w-32 bg-neutral-100 animate-pulse" />
                </div>
              ))}
            </div>
          ) : products.length > 0 ? (
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-6">
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
            <div className="text-center py-20">
              <p className="text-lg font-serif italic text-neutral-400 mb-4">
                Coming Soon
              </p>
              <p className="text-sm text-neutral-500 max-w-md mx-auto">
                We&apos;re curating the finest African homeware and beauty products. Stay tuned.
              </p>
            </div>
          )}
        </section>
      )}
    </div>
  );
}

export default function LifePage() {
  return (
    <Suspense fallback={<div className="text-center py-12">Loading...</div>}>
      <LifePageContent />
    </Suspense>
  );
}
