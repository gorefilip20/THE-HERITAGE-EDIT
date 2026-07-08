"use client";

import { useEffect, useState, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import { motion } from "framer-motion";
import { ProductCard } from "@/components/product/ProductCard";
import { getImagePlaceholder } from "@/lib/utils";
import type { Product } from "@/types";

const KIDS_CATEGORIES = [
  { name: "Girls", slug: "girls", image: getImagePlaceholder(400, 500) },
  { name: "Boys", slug: "boys", image: getImagePlaceholder(400, 500) },
  { name: "Baby", slug: "baby", image: getImagePlaceholder(400, 500) },
  { name: "Accessories", slug: "accessories", image: getImagePlaceholder(400, 500) },
];

function KidsPageContent() {
  const searchParams = useSearchParams();
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);

  const gender = searchParams.get("gender");
  const category = searchParams.get("category");

  useEffect(() => {
    setLoading(true);
    const params = new URLSearchParams();
    params.set("pageSize", "12");
    if (category) params.set("category", category);
    params.set("tag", "kids");

    fetch(`/api/products?${params.toString()}`)
      .then((r) => r.json())
      .then((d) => setProducts(d.data ?? []))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [gender, category]);

  return (
    <div className="bg-white min-h-screen">
      {/* Hero */}
      <section className="relative h-[50vh] min-h-[400px] bg-heritage-purple overflow-hidden">
        <div className="absolute inset-0">
          <Image
            src={getImagePlaceholder(1920, 800)}
            alt="Kids Collection"
            fill
            className="object-cover opacity-40"
          />
        </div>
        <div className="absolute inset-0 bg-gradient-to-t from-heritage-purple/80 to-transparent" />
        <div className="relative luxury-container h-full flex flex-col justify-end pb-16">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
          >
            <p className="text-[10px] font-sans font-medium tracking-[0.4em] uppercase text-white/40 mb-4">
              Mini Heritage
            </p>
            <h1 className="text-display-lg font-serif italic text-white mb-4">
              Kids Collection
            </h1>
            <p className="text-[15px] font-sans text-white/60 max-w-lg">
              Introduce the next generation to the beauty of African fashion.
              Handcrafted pieces designed for comfort, style, and cultural pride.
            </p>
          </motion.div>
        </div>
      </section>

      {/* Category Grid */}
      <section className="luxury-container py-16">
        <h2 className="text-display-sm font-serif italic text-obsidian mb-10 text-center">
          Shop by Category
        </h2>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-6">
          {KIDS_CATEGORIES.map((cat) => (
            <Link
              key={cat.slug}
              href={`/kids?gender=${cat.slug}`}
              className="group relative aspect-[3/4] bg-ivory overflow-hidden"
            >
              <Image
                src={cat.image}
                alt={cat.name}
                fill
                className="object-cover transition-transform duration-700 group-hover:scale-105"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
              <div className="absolute bottom-0 left-0 right-0 p-6">
                <h3 className="text-lg font-serif text-white">{cat.name}</h3>
              </div>
            </Link>
          ))}
        </div>
      </section>

      {/* Products */}
      <section className="luxury-container pb-24">
        <div className="flex items-center justify-between mb-10">
          <h2 className="text-display-sm font-serif italic text-obsidian">
            {gender ? `${gender.charAt(0).toUpperCase() + gender.slice(1)}` : "All Kids"}
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
              Our kids collection is being carefully curated. Sign up to be notified when new pieces arrive.
            </p>
          </div>
        )}
      </section>
    </div>
  );
}

export default function KidsPage() {
  return (
    <Suspense fallback={<div className="text-center py-12">Loading...</div>}>
      <KidsPageContent />
    </Suspense>
  );
}
