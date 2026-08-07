"use client";

import { useEffect, useState, useCallback } from "react";
import { useParams, useSearchParams, useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { ProductCard } from "@/components/product/ProductCard";
import { ProductFilters } from "@/components/product/ProductFilters";
import { getImagePlaceholder } from "@/lib/utils";
import type { Product, PaginatedResponse } from "@/types";

const SORT_OPTIONS = [
  { value: "newest", label: "Newest" },
  { value: "price_asc", label: "Price: Low to High" },
  { value: "price_desc", label: "Price: High to Low" },
  { value: "name_asc", label: "A — Z" },
];

const FILTER_SECTIONS = [
  {
    key: "brand",
    label: "Designer",
    type: "checkbox" as const,
    options: [
      { value: "the-heritage-edit", label: "The Heritage Edit" },
      { value: "ozwald-boateng", label: "Ozwald Boateng" },
      { value: "kenneth-ize", label: "Kenneth Ize" },
      { value: "lisa-folawiyo", label: "Lisa Folawiyo" },
      { value: "maki-oh", label: "Maki Oh" },
      { value: "thebe-magugu", label: "Thebe Magugu" },
      { value: "duro-olowu", label: "Duro Olowu" },
      { value: "christie-brown", label: "Christie Brown" },
    ],
  },
  {
    key: "size",
    label: "Size",
    type: "checkbox" as const,
    options: [
      { value: "XS", label: "XS" },
      { value: "S", label: "S" },
      { value: "M", label: "M" },
      { value: "L", label: "L" },
      { value: "XL", label: "XL" },
    ],
  },
  {
    key: "color",
    label: "Color",
    type: "checkbox" as const,
    options: [
      { value: "Black", label: "Black" },
      { value: "White", label: "White" },
      { value: "Navy", label: "Navy" },
      { value: "Ivory", label: "Ivory" },
      { value: "Camel", label: "Camel" },
      { value: "Red", label: "Red" },
    ],
  },
];

export default function CollectionPage() {
  const params = useParams();
  const searchParams = useSearchParams();
  const router = useRouter();
  const slug = params.slug as string;

  const [products, setProducts] = useState<Product[]>([]);
  const [total, setTotal] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [activeFilters, setActiveFilters] = useState<Record<string, string[]>>(
    {},
  );
  const [sort, setSort] = useState("newest");

  const fetchProducts = useCallback(async () => {
    setIsLoading(true);
    const params = new URLSearchParams();
    params.set("collection", slug);
    params.set("sort", sort);
    params.set("pageSize", "24");

    Object.entries(activeFilters).forEach(([key, values]) => {
      values.forEach((v) => params.append(key, v));
    });

    try {
      const res = await fetch(`/api/products?${params.toString()}`);
      const data: PaginatedResponse<Product> = await res.json();
      setProducts(data.data);
      setTotal(data.total);
    } catch {
      setProducts([]);
    } finally {
      setIsLoading(false);
    }
  }, [slug, sort, activeFilters]);

  useEffect(() => {
    fetchProducts();
  }, [fetchProducts]);

  const handleFilterChange = (key: string, values: string[]) => {
    setActiveFilters((prev) => {
      const next = { ...prev };
      if (values.length === 0) delete next[key];
      else next[key] = values;
      return next;
    });
  };

  const collectionTitle = slug
    .split("-")
    .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
    .join(" ");

  return (
    <div>
      {/* Collection header — gradient hero */}
      <section className="relative bg-gradient-to-br from-[#0D2C22] via-[#163829] to-[#2E1A47] py-20 md:py-28">
        <div className="luxury-container text-center relative z-10">
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
          >
            <p className="text-[10px] font-sans font-semibold tracking-[0.3em] uppercase text-gold mb-3">
              Collection
            </p>
            <h1 className="text-display-md md:text-display-lg font-serif text-white">
              {collectionTitle}
            </h1>
          </motion.div>
        </div>
      </section>

      {/* Catalog */}
      <section className="luxury-container py-10 md:py-14">
        {/* Sort bar — desktop */}
        <div className="hidden lg:flex items-center justify-end mb-8 gap-4">
          <label className="text-xs font-sans text-neutral-400">Sort by</label>
          <select
            value={sort}
            onChange={(e) => setSort(e.target.value)}
            className="luxury-input w-48 h-10 text-xs"
          >
            {SORT_OPTIONS.map((opt) => (
              <option key={opt.value} value={opt.value}>
                {opt.label}
              </option>
            ))}
          </select>
        </div>

        <div className="flex gap-10">
          <ProductFilters
            sections={FILTER_SECTIONS}
            activeFilters={activeFilters}
            onFilterChange={handleFilterChange}
            onClearAll={() => setActiveFilters({})}
            totalResults={total}
          />

          <div className="flex-1">
            {isLoading ? (
              <div className="luxury-grid">
                {Array.from({ length: 12 }).map((_, i) => (
                  <div key={i} className="space-y-3">
                    <div className="aspect-[3/4] skeleton" />
                    <div className="h-3 w-16 skeleton" />
                    <div className="h-4 w-32 skeleton" />
                    <div className="h-3 w-20 skeleton" />
                  </div>
                ))}
              </div>
            ) : products.length > 0 ? (
              <div className="luxury-grid">
                {products.map((product) => (
                  <ProductCard
                    key={product.id}
                    slug={product.slug}
                    name={product.name}
                    brandName={product.brand.name}
                    priceCents={product.basePriceCents}
                    salePriceCents={product.salePriceCents}
                    currency={product.currency}
                    imageUrl={
                      product.images[0]?.url ?? getImagePlaceholder(600, 800)
                    }
                    hoverImageUrl={product.images[1]?.url}
                  />
                ))}
              </div>
            ) : (
              <div className="text-center py-20">
                <p className="text-lg font-serif text-neutral-400 italic">
                  No pieces found
                </p>
                <p className="text-sm font-sans text-neutral-300 mt-2">
                  Try adjusting your filters to discover more
                </p>
              </div>
            )}
          </div>
        </div>
      </section>
    </div>
  );
}
