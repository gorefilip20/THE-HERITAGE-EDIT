"use client";

import { useState, useEffect, useCallback, useTransition, useRef } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import { motion, AnimatePresence } from "framer-motion";
import {
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  X,
  SlidersHorizontal,
  Grid3X3,
  LayoutGrid,
  Heart,
  Loader2,
} from "lucide-react";
import { cn, formatPrice, getImagePlaceholder } from "@/lib/utils";
import type { Product, PaginatedResponse } from "@/types";

/* ──────────────────────────────────────────────────────────
   FILTER CONFIGURATION
   ────────────────────────────────────────────────────────── */

const PRICE_RANGES = [
  { label: "Under $500", min: 0, max: 500 },
  { label: "$500 – $1,000", min: 500, max: 1000 },
  { label: "$1,000 – $2,500", min: 1000, max: 2500 },
  { label: "$2,500 – $5,000", min: 2500, max: 5000 },
  { label: "$5,000+", min: 5000, max: 0 },
];

const SIZES = ["XXS", "XS", "S", "M", "L", "XL", "XXL", "ONE SIZE"];

const SORT_OPTIONS = [
  { value: "newest", label: "New Arrivals" },
  { value: "price_asc", label: "Price: Low to High" },
  { value: "price_desc", label: "Price: High to Low" },
  { value: "name_asc", label: "Alphabetical" },
];

interface FilterState {
  brand: string[];
  category: string;
  size: string[];
  minPrice: string;
  maxPrice: string;
  sort: string;
  search: string;
  page: number;
}

/* ──────────────────────────────────────────────────────────
   TYPES
   ────────────────────────────────────────────────────────── */

interface BrandOption {
  slug: string;
  name: string;
  _count: number;
}

interface CategoryOption {
  slug: string;
  name: string;
  _count: number;
}

/* ──────────────────────────────────────────────────────────
   SHOP PAGE
   ────────────────────────────────────────────────────────── */

export default function ShopPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [isPending, startTransition] = useTransition();

  const [products, setProducts] = useState<Product[]>([]);
  const [totalProducts, setTotalProducts] = useState(0);
  const [totalPages, setTotalPages] = useState(1);
  const [loading, setLoading] = useState(true);
  const [brands, setBrands] = useState<BrandOption[]>([]);
  const [categories, setCategories] = useState<CategoryOption[]>([]);
  const [isMobileFilterOpen, setIsMobileFilterOpen] = useState(false);
  const [gridCols, setGridCols] = useState<3 | 4>(4);

  const filters: FilterState = {
    brand: searchParams.getAll("brand"),
    category: searchParams.get("category") ?? "",
    size: searchParams.getAll("size"),
    minPrice: searchParams.get("minPrice") ?? "",
    maxPrice: searchParams.get("maxPrice") ?? "",
    sort: searchParams.get("sort") ?? "newest",
    search: searchParams.get("search") ?? "",
    page: parseInt(searchParams.get("page") ?? "1"),
  };

  const activeFilterCount =
    filters.brand.length +
    (filters.category ? 1 : 0) +
    filters.size.length +
    (filters.minPrice || filters.maxPrice ? 1 : 0) +
    (filters.search ? 1 : 0);

  /* ── URL updater ── */
  const updateURL = useCallback(
    (updates: Partial<FilterState>) => {
      const params = new URLSearchParams();
      const merged = { ...filters, ...updates };

      if (updates.brand !== undefined || updates.category !== undefined ||
          updates.size !== undefined || updates.minPrice !== undefined ||
          updates.maxPrice !== undefined || updates.search !== undefined) {
        merged.page = 1;
      }

      merged.brand.forEach((b) => params.append("brand", b));
      if (merged.category) params.set("category", merged.category);
      merged.size.forEach((s) => params.append("size", s));
      if (merged.minPrice) params.set("minPrice", merged.minPrice);
      if (merged.maxPrice) params.set("maxPrice", merged.maxPrice);
      if (merged.sort && merged.sort !== "newest") params.set("sort", merged.sort);
      if (merged.search) params.set("search", merged.search);
      if (merged.page > 1) params.set("page", String(merged.page));

      const qs = params.toString();
      startTransition(() => {
        router.push(`/shop${qs ? `?${qs}` : ""}`, { scroll: false });
      });
    },
    [filters, router],
  );

  const clearAllFilters = () => {
    startTransition(() => {
      router.push("/shop", { scroll: false });
    });
  };

  /* ── Fetch products ── */
  useEffect(() => {
    const controller = new AbortController();
    setLoading(true);

    const fetchProducts = async () => {
      try {
        const params = new URLSearchParams(searchParams.toString());
        params.set("pageSize", "24");
        if (!params.has("sort")) params.set("sort", "newest");

        const res = await fetch(`/api/products?${params.toString()}`, {
          signal: controller.signal,
        });
        if (!res.ok) throw new Error("Failed to fetch");
        const data: PaginatedResponse<Product> = await res.json();

        setProducts(data.data);
        setTotalProducts(data.total);
        setTotalPages(data.totalPages);
      } catch (err) {
        if ((err as Error).name !== "AbortError") {
          console.error("Failed to load products:", err);
        }
      } finally {
        setLoading(false);
      }
    };

    fetchProducts();
    return () => controller.abort();
  }, [searchParams]);

  /* ── Fetch filter options ── */
  useEffect(() => {
    const fetchFilters = async () => {
      try {
        const [brandsRes, catsRes] = await Promise.all([
          fetch("/api/products/filters?type=brands"),
          fetch("/api/products/filters?type=categories"),
        ]);
        if (brandsRes.ok) setBrands(await brandsRes.json());
        if (catsRes.ok) setCategories(await catsRes.json());
      } catch {
        /* filter options are non-critical */
      }
    };
    fetchFilters();
  }, []);

  /* ── Toggle helpers ── */
  const toggleBrand = (slug: string) => {
    const current = filters.brand;
    const next = current.includes(slug)
      ? current.filter((b) => b !== slug)
      : [...current, slug];
    updateURL({ brand: next });
  };

  const toggleSize = (size: string) => {
    const current = filters.size;
    const next = current.includes(size)
      ? current.filter((s) => s !== size)
      : [...current, size];
    updateURL({ size: next });
  };

  const setPriceRange = (min: number, max: number) => {
    if (
      filters.minPrice === String(min) &&
      filters.maxPrice === (max > 0 ? String(max) : "")
    ) {
      updateURL({ minPrice: "", maxPrice: "" });
    } else {
      updateURL({
        minPrice: String(min),
        maxPrice: max > 0 ? String(max) : "",
      });
    }
  };

  /* ── SIDEBAR FILTER CONTENT (shared desktop + mobile) ── */
  const filterContent = (
    <div className="space-y-8">
      {/* Active filters */}
      {activeFilterCount > 0 && (
        <div>
          <div className="flex items-center justify-between mb-3">
            <span className="text-[10px] font-sans font-semibold tracking-[0.2em] uppercase text-neutral-400">
              Active Filters
            </span>
            <button
              onClick={clearAllFilters}
              className="text-[11px] font-sans text-heritage-green hover:underline"
            >
              Clear All
            </button>
          </div>
          <div className="flex flex-wrap gap-1.5">
            {filters.brand.map((b) => (
              <FilterPill key={b} label={b} onRemove={() => toggleBrand(b)} />
            ))}
            {filters.category && (
              <FilterPill label={filters.category} onRemove={() => updateURL({ category: "" })} />
            )}
            {filters.size.map((s) => (
              <FilterPill key={s} label={s} onRemove={() => toggleSize(s)} />
            ))}
            {(filters.minPrice || filters.maxPrice) && (
              <FilterPill
                label={`${filters.minPrice ? `$${filters.minPrice}` : "$0"} – ${filters.maxPrice ? `$${filters.maxPrice}` : "∞"}`}
                onRemove={() => updateURL({ minPrice: "", maxPrice: "" })}
              />
            )}
            {filters.search && (
              <FilterPill label={`"${filters.search}"`} onRemove={() => updateURL({ search: "" })} />
            )}
          </div>
        </div>
      )}

      {/* Designer filter */}
      <FilterSection title="Designer" defaultOpen>
        <div className="space-y-1 max-h-[240px] overflow-y-auto scrollbar-hide pr-1">
          {brands.map((brand) => (
            <label
              key={brand.slug}
              className="flex items-center gap-3 py-1.5 cursor-pointer group"
            >
              <Checkbox
                checked={filters.brand.includes(brand.slug)}
                onChange={() => toggleBrand(brand.slug)}
              />
              <span className="text-[13px] font-sans text-obsidian/75 group-hover:text-obsidian transition-colors flex-1">
                {brand.name}
              </span>
              <span className="text-[11px] font-sans text-neutral-300 tabular-nums">
                {brand._count}
              </span>
            </label>
          ))}
          {brands.length === 0 && (
            <p className="text-xs font-sans text-neutral-400 py-2">Loading designers...</p>
          )}
        </div>
      </FilterSection>

      {/* Category filter */}
      <FilterSection title="Category" defaultOpen>
        <div className="space-y-1">
          {categories.map((cat) => (
            <button
              key={cat.slug}
              onClick={() =>
                updateURL({ category: filters.category === cat.slug ? "" : cat.slug })
              }
              className={cn(
                "flex items-center justify-between w-full py-1.5 text-[13px] font-sans transition-colors",
                filters.category === cat.slug
                  ? "text-heritage-green font-medium"
                  : "text-obsidian/75 hover:text-obsidian",
              )}
            >
              <span>{cat.name}</span>
              <span className="text-[11px] text-neutral-300 tabular-nums">{cat._count}</span>
            </button>
          ))}
          {categories.length === 0 && (
            <p className="text-xs font-sans text-neutral-400 py-2">Loading categories...</p>
          )}
        </div>
      </FilterSection>

      {/* Size filter */}
      <FilterSection title="Size" defaultOpen={false}>
        <div className="grid grid-cols-4 gap-1.5">
          {SIZES.map((size) => (
            <button
              key={size}
              onClick={() => toggleSize(size)}
              className={cn(
                "h-9 flex items-center justify-center text-[11px] font-sans font-medium border transition-all duration-200",
                filters.size.includes(size)
                  ? "border-heritage-green bg-heritage-green text-white"
                  : "border-slate-border text-obsidian/60 hover:border-obsidian/30",
                size === "ONE SIZE" && "col-span-2",
              )}
            >
              {size}
            </button>
          ))}
        </div>
      </FilterSection>

      {/* Price Range filter */}
      <FilterSection title="Price Range" defaultOpen={false}>
        <div className="space-y-1">
          {PRICE_RANGES.map((range) => {
            const isActive =
              filters.minPrice === String(range.min) &&
              filters.maxPrice === (range.max > 0 ? String(range.max) : "");
            return (
              <button
                key={range.label}
                onClick={() => setPriceRange(range.min, range.max)}
                className={cn(
                  "block w-full text-left py-1.5 text-[13px] font-sans transition-colors",
                  isActive
                    ? "text-heritage-green font-medium"
                    : "text-obsidian/75 hover:text-obsidian",
                )}
              >
                {range.label}
              </button>
            );
          })}
        </div>
      </FilterSection>
    </div>
  );

  return (
    <div className="min-h-screen bg-white">
      {/* ── BREADCRUMB + HEADER ── */}
      <div className="luxury-container pt-6 pb-10">
        {/* Breadcrumb */}
        <nav className="flex items-center gap-2 text-[11px] font-sans text-neutral-400 mb-8">
          <Link href="/" className="hover:text-obsidian transition-colors">Home</Link>
          <span>/</span>
          <span className="text-obsidian">Shop</span>
          {filters.search && (
            <>
              <span>/</span>
              <span className="text-obsidian">"{filters.search}"</span>
            </>
          )}
        </nav>

        {/* Page title */}
        <div className="flex items-end justify-between gap-6">
          <div>
            <h1 className="text-display-sm md:text-display-md font-serif italic text-obsidian mb-2">
              {filters.search
                ? `Results for "${filters.search}"`
                : filters.category
                  ? categories.find((c) => c.slug === filters.category)?.name ?? "Shop"
                  : "The Collection"}
            </h1>
            <p className="text-sm font-sans text-neutral-400">
              {totalProducts.toLocaleString()} {totalProducts === 1 ? "piece" : "pieces"}
              {filters.brand.length > 0 && ` from ${filters.brand.length} designer${filters.brand.length > 1 ? "s" : ""}`}
            </p>
          </div>

          {/* Desktop sort + grid toggle */}
          <div className="hidden lg:flex items-center gap-4">
            <div className="flex items-center gap-1 border border-slate-border">
              <button
                onClick={() => setGridCols(3)}
                className={cn(
                  "p-2 transition-colors",
                  gridCols === 3 ? "text-obsidian" : "text-neutral-300",
                )}
                aria-label="3 columns"
              >
                <Grid3X3 size={16} />
              </button>
              <button
                onClick={() => setGridCols(4)}
                className={cn(
                  "p-2 transition-colors",
                  gridCols === 4 ? "text-obsidian" : "text-neutral-300",
                )}
                aria-label="4 columns"
              >
                <LayoutGrid size={16} />
              </button>
            </div>

            <SortDropdown
              value={filters.sort}
              onChange={(sort) => updateURL({ sort })}
            />
          </div>
        </div>
      </div>

      {/* ── MAIN CONTENT ── */}
      <div className="luxury-container pb-20">
        <div className="flex gap-12">
          {/* ─ DESKTOP SIDEBAR ─ */}
          <aside className="hidden lg:block w-[260px] shrink-0">
            <div className="sticky top-28 max-h-[calc(100vh-8rem)] overflow-y-auto scrollbar-hide pb-8">
              {filterContent}
            </div>
          </aside>

          {/* ─ PRODUCT GRID ─ */}
          <div className="flex-1 min-w-0">
            {/* Mobile toolbar */}
            <div className="lg:hidden flex items-center justify-between mb-6">
              <button
                onClick={() => setIsMobileFilterOpen(true)}
                className="inline-flex items-center gap-2 h-10 px-5 border border-slate-border text-xs font-sans font-medium tracking-wider uppercase text-obsidian hover:border-obsidian transition-colors"
              >
                <SlidersHorizontal size={14} />
                Filter
                {activeFilterCount > 0 && (
                  <span className="w-5 h-5 flex items-center justify-center bg-heritage-green text-white text-[10px] rounded-full">
                    {activeFilterCount}
                  </span>
                )}
              </button>
              <SortDropdown
                value={filters.sort}
                onChange={(sort) => updateURL({ sort })}
              />
            </div>

            {/* Loading state */}
            {loading ? (
              <div className={cn(
                "grid gap-x-4 gap-y-10 md:gap-x-5 md:gap-y-12",
                gridCols === 4
                  ? "grid-cols-2 md:grid-cols-3 lg:grid-cols-4"
                  : "grid-cols-2 md:grid-cols-3",
              )}>
                {Array.from({ length: 12 }).map((_, i) => (
                  <ProductSkeleton key={i} />
                ))}
              </div>
            ) : products.length === 0 ? (
              /* Empty state */
              <div className="py-24 text-center">
                <p className="text-lg font-serif text-obsidian mb-2">No pieces found</p>
                <p className="text-sm font-sans text-neutral-400 mb-6 max-w-md mx-auto">
                  Try adjusting your filters or search terms to discover more from our collection.
                </p>
                <button
                  onClick={clearAllFilters}
                  className="luxury-button-secondary"
                >
                  Clear All Filters
                </button>
              </div>
            ) : (
              /* Product grid */
              <>
                <div
                  className={cn(
                    "grid gap-x-4 gap-y-10 md:gap-x-5 md:gap-y-12",
                    gridCols === 4
                      ? "grid-cols-2 md:grid-cols-3 lg:grid-cols-4"
                      : "grid-cols-2 md:grid-cols-3",
                  )}
                >
                  {products.map((product, idx) => (
                    <ShopProductCard
                      key={product.id}
                      product={product}
                      index={idx}
                      priority={idx < 4}
                    />
                  ))}
                </div>

                {/* Pagination */}
                {totalPages > 1 && (
                  <Pagination
                    currentPage={filters.page}
                    totalPages={totalPages}
                    onPageChange={(page) => {
                      updateURL({ page });
                      window.scrollTo({ top: 0, behavior: "smooth" });
                    }}
                  />
                )}
              </>
            )}
          </div>
        </div>
      </div>

      {/* ── MOBILE FILTER DRAWER ── */}
      <AnimatePresence>
        {isMobileFilterOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black/30 z-40 lg:hidden"
              onClick={() => setIsMobileFilterOpen(false)}
            />
            <motion.div
              initial={{ x: "-100%" }}
              animate={{ x: 0 }}
              exit={{ x: "-100%" }}
              transition={{ type: "spring", damping: 28, stiffness: 260 }}
              className="fixed top-0 left-0 bottom-0 w-[88%] max-w-sm bg-white z-50 flex flex-col lg:hidden"
            >
              <div className="flex items-center justify-between px-6 h-16 border-b border-slate-border shrink-0">
                <span className="text-[11px] font-sans font-semibold tracking-[0.2em] uppercase text-obsidian">
                  Filter & Refine
                </span>
                <button onClick={() => setIsMobileFilterOpen(false)} className="p-2 -mr-2">
                  <X size={20} strokeWidth={1.5} />
                </button>
              </div>
              <div className="flex-1 overflow-y-auto px-6 py-6">
                {filterContent}
              </div>
              <div className="shrink-0 px-6 py-4 border-t border-slate-border bg-white">
                <button
                  onClick={() => setIsMobileFilterOpen(false)}
                  className="luxury-button-primary w-full"
                >
                  Show {totalProducts.toLocaleString()} Results
                </button>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
}

/* ──────────────────────────────────────────────────────────
   SUB-COMPONENTS
   ────────────────────────────────────────────────────────── */

function ShopProductCard({
  product,
  index,
  priority,
}: {
  product: Product;
  index: number;
  priority?: boolean;
}) {
  const [isHovered, setIsHovered] = useState(false);
  const [isWishlisted, setIsWishlisted] = useState(false);

  const primaryImage = product.images.find((i) => i.isPrimary) ?? product.images[0];
  const hoverImage = product.images.find((i) => !i.isPrimary && i.sortOrder === 1);
  const displayImage =
    isHovered && hoverImage ? hoverImage.url : primaryImage?.url;
  const hasDiscount =
    product.salePriceCents && product.salePriceCents < product.basePriceCents;
  const availableSizes = product.variants
    .filter((v) => v.stockCount > 0)
    .map((v) => v.size);

  return (
    <motion.article
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.45, delay: Math.min(index * 0.04, 0.3), ease: [0.16, 1, 0.3, 1] }}
      className="group relative"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      {/* Image */}
      <Link
        href={`/product/${product.slug}`}
        className="block relative aspect-[3/4] bg-ivory overflow-hidden mb-3"
      >
        <Image
          src={displayImage || getImagePlaceholder(600, 800)}
          alt={primaryImage?.alt ?? `${product.brand.name} ${product.name}`}
          fill
          sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"
          className="object-cover transition-all duration-700 ease-luxury group-hover:scale-[1.04]"
          priority={priority}
        />

        {/* Badges */}
        {hasDiscount && (
          <span className="absolute top-3 left-3 px-2.5 py-1 bg-heritage-purple text-white text-[9px] font-sans font-bold tracking-wider uppercase">
            Sale
          </span>
        )}

        {/* Wishlist */}
        <button
          onClick={(e) => {
            e.preventDefault();
            setIsWishlisted(!isWishlisted);
          }}
          className="absolute top-3 right-3 w-8 h-8 flex items-center justify-center bg-white/85 backdrop-blur-sm rounded-full opacity-0 group-hover:opacity-100 transition-all duration-300 hover:bg-white hover:scale-110"
          aria-label="Add to wishlist"
        >
          <Heart
            size={14}
            strokeWidth={1.5}
            className={isWishlisted ? "fill-heritage-green text-heritage-green" : "text-obsidian/50"}
          />
        </button>

        {/* Quick-view sizes */}
        <div className="absolute bottom-0 left-0 right-0 bg-white/95 backdrop-blur-sm opacity-0 group-hover:opacity-100 transition-all duration-300 translate-y-1 group-hover:translate-y-0">
          <div className="flex items-center justify-center gap-1.5 py-2.5 px-3">
            {availableSizes.length > 0 ? (
              availableSizes.slice(0, 6).map((size) => (
                <span
                  key={size}
                  className="text-[10px] font-sans font-medium text-obsidian/60 tracking-wide"
                >
                  {size}
                </span>
              ))
            ) : (
              <span className="text-[10px] font-sans text-neutral-400">Sold Out</span>
            )}
          </div>
        </div>
      </Link>

      {/* Product info */}
      <div className="space-y-0.5">
        <p className="text-[10px] font-sans font-semibold tracking-[0.16em] uppercase text-neutral-400">
          {product.brand.name}
        </p>
        <Link href={`/product/${product.slug}`}>
          <h3 className="text-[13px] font-sans text-obsidian leading-snug line-clamp-1 group-hover:text-heritage-green transition-colors duration-200">
            {product.name}
          </h3>
        </Link>
        <div className="flex items-center gap-2 pt-0.5">
          <span
            className={cn(
              "text-[13px] product-price",
              hasDiscount ? "text-heritage-purple" : "text-obsidian",
            )}
          >
            {formatPrice(product.salePriceCents ?? product.basePriceCents, product.currency)}
          </span>
          {hasDiscount && (
            <span className="text-[13px] product-price text-neutral-300 line-through">
              {formatPrice(product.basePriceCents, product.currency)}
            </span>
          )}
        </div>
      </div>
    </motion.article>
  );
}

/* ── Filter Section (collapsible) ── */

function FilterSection({
  title,
  defaultOpen = true,
  children,
}: {
  title: string;
  defaultOpen?: boolean;
  children: React.ReactNode;
}) {
  const [isOpen, setIsOpen] = useState(defaultOpen);

  return (
    <div className="border-t border-slate-border pt-6">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center justify-between w-full mb-4"
      >
        <span className="text-[10px] font-sans font-semibold tracking-[0.2em] uppercase text-obsidian">
          {title}
        </span>
        <ChevronDown
          size={14}
          className={cn(
            "text-neutral-400 transition-transform duration-200",
            isOpen && "rotate-180",
          )}
        />
      </button>
      <AnimatePresence initial={false}>
        {isOpen && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="overflow-hidden"
          >
            {children}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

/* ── Checkbox ── */

function Checkbox({
  checked,
  onChange,
}: {
  checked: boolean;
  onChange: () => void;
}) {
  return (
    <button
      role="checkbox"
      aria-checked={checked}
      onClick={onChange}
      className={cn(
        "w-[15px] h-[15px] border flex items-center justify-center transition-all duration-150 shrink-0",
        checked
          ? "bg-heritage-green border-heritage-green"
          : "border-neutral-300 hover:border-neutral-400",
      )}
    >
      {checked && (
        <svg width="9" height="7" viewBox="0 0 9 7" fill="none">
          <path
            d="M1 3.5L3.25 5.75L8 1"
            stroke="white"
            strokeWidth="1.5"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      )}
    </button>
  );
}

/* ── Filter Pill ── */

function FilterPill({ label, onRemove }: { label: string; onRemove: () => void }) {
  return (
    <button
      onClick={onRemove}
      className="inline-flex items-center gap-1 px-2.5 py-1 bg-ivory text-[11px] font-sans text-obsidian/70 border border-slate-border hover:border-heritage-green hover:text-heritage-green transition-colors"
    >
      {label}
      <X size={10} />
    </button>
  );
}

/* ── Sort Dropdown ── */

function SortDropdown({
  value,
  onChange,
}: {
  value: string;
  onChange: (value: string) => void;
}) {
  const [isOpen, setIsOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  const current = SORT_OPTIONS.find((o) => o.value === value) ?? SORT_OPTIONS[0];

  useEffect(() => {
    const handleClick = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, []);

  return (
    <div ref={ref} className="relative">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-2 h-10 px-4 border border-slate-border text-[11px] font-sans font-medium tracking-wider uppercase text-obsidian hover:border-obsidian/30 transition-colors"
      >
        Sort: {current.label}
        <ChevronDown size={12} className={cn("transition-transform", isOpen && "rotate-180")} />
      </button>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 4 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 4 }}
            transition={{ duration: 0.15 }}
            className="absolute top-full right-0 mt-1 w-52 bg-white border border-slate-border shadow-lg z-30"
          >
            {SORT_OPTIONS.map((opt) => (
              <button
                key={opt.value}
                onClick={() => {
                  onChange(opt.value);
                  setIsOpen(false);
                }}
                className={cn(
                  "block w-full text-left px-4 py-3 text-[12px] font-sans transition-colors",
                  opt.value === value
                    ? "text-heritage-green font-medium bg-heritage-green/[0.03]"
                    : "text-obsidian/70 hover:bg-ivory",
                )}
              >
                {opt.label}
              </button>
            ))}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

/* ── Pagination ── */

function Pagination({
  currentPage,
  totalPages,
  onPageChange,
}: {
  currentPage: number;
  totalPages: number;
  onPageChange: (page: number) => void;
}) {
  const pages: (number | "...")[] = [];

  if (totalPages <= 7) {
    for (let i = 1; i <= totalPages; i++) pages.push(i);
  } else {
    pages.push(1);
    if (currentPage > 3) pages.push("...");
    for (
      let i = Math.max(2, currentPage - 1);
      i <= Math.min(totalPages - 1, currentPage + 1);
      i++
    ) {
      pages.push(i);
    }
    if (currentPage < totalPages - 2) pages.push("...");
    pages.push(totalPages);
  }

  return (
    <div className="flex items-center justify-center gap-1 mt-16">
      <button
        onClick={() => onPageChange(currentPage - 1)}
        disabled={currentPage === 1}
        className="w-10 h-10 flex items-center justify-center text-obsidian/50 hover:text-obsidian disabled:opacity-30 transition-colors"
      >
        <ChevronLeft size={16} />
      </button>
      {pages.map((page, idx) =>
        page === "..." ? (
          <span key={`ellipsis-${idx}`} className="w-10 h-10 flex items-center justify-center text-neutral-300 text-sm">
            ...
          </span>
        ) : (
          <button
            key={page}
            onClick={() => onPageChange(page)}
            className={cn(
              "w-10 h-10 flex items-center justify-center text-[13px] font-sans transition-all duration-200",
              page === currentPage
                ? "bg-heritage-green text-white font-medium"
                : "text-obsidian/60 hover:text-obsidian hover:bg-ivory",
            )}
          >
            {page}
          </button>
        ),
      )}
      <button
        onClick={() => onPageChange(currentPage + 1)}
        disabled={currentPage === totalPages}
        className="w-10 h-10 flex items-center justify-center text-obsidian/50 hover:text-obsidian disabled:opacity-30 transition-colors"
      >
        <ChevronRight size={16} />
      </button>
    </div>
  );
}

/* ── Product Skeleton ── */

function ProductSkeleton() {
  return (
    <div className="animate-pulse">
      <div className="aspect-[3/4] bg-neutral-100 mb-3" />
      <div className="h-2.5 bg-neutral-100 w-20 mb-2" />
      <div className="h-3 bg-neutral-100 w-full mb-2" />
      <div className="h-3 bg-neutral-100 w-16" />
    </div>
  );
}

