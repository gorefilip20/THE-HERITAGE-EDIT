"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { motion } from "framer-motion";
import { ArrowRight, ChevronRight, Play } from "lucide-react";
import { ProductCard } from "@/components/product/ProductCard";
import { formatPrice, getImagePlaceholder } from "@/lib/utils";
import type { Product } from "@/types";

const ease = [0.16, 1, 0.3, 1];

const EDITORIAL_BLOCKS = [
  {
    title: "The Art of Tailoring",
    subtitle: "Precision & Form",
    category: "Suiting",
    image: getImagePlaceholder(700, 900),
    href: "/shop?category=coats",
  },
  {
    title: "Evening Grandeur",
    subtitle: "After Dark",
    category: "Eveningwear",
    image: getImagePlaceholder(700, 900),
    href: "/shop?category=dresses",
  },
  {
    title: "The Resort Edit",
    subtitle: "Endless Summer",
    category: "Resort 2026",
    image: getImagePlaceholder(700, 900),
    href: "/shop?category=knitwear",
  },
];

const BRAND_MARQUEE = [
  "Gucci",
  "Valentino",
  "Saint Laurent",
  "Bottega Veneta",
  "Balenciaga",
  "Prada",
  "Burberry",
  "Loewe",
  "Chloé",
  "Dior",
];

export default function HomePage() {
  const [featuredProducts, setFeaturedProducts] = useState<Product[]>([]);
  const [newArrivals, setNewArrivals] = useState<Product[]>([]);

  useEffect(() => {
    fetch("/api/products?featured=true&pageSize=8")
      .then((r) => r.json())
      .then((d) => setFeaturedProducts(d.data ?? []))
      .catch(() => {});

    fetch("/api/products?sort=newest&pageSize=4")
      .then((r) => r.json())
      .then((d) => setNewArrivals(d.data ?? []))
      .catch(() => {});
  }, []);

  return (
    <div className="bg-white">
      {/* ═══════════════════════════════════════════
          HERO — FULL-BLEED CINEMATIC
         ═══════════════════════════════════════════ */}
      <section className="relative h-screen min-h-[700px] max-h-[1100px] bg-obsidian overflow-hidden">
        <div className="absolute inset-0">
          <Image
            src={getImagePlaceholder(1920, 1080)}
            alt="Autumn/Winter 2026 Campaign"
            fill
            className="object-cover opacity-50"
            priority
          />
        </div>
        <div className="absolute inset-0 bg-gradient-to-t from-obsidian/80 via-obsidian/20 to-transparent" />
        <div className="absolute inset-0 bg-gradient-to-r from-obsidian/40 to-transparent" />

        <div className="relative luxury-container h-full flex flex-col justify-end pb-20 md:pb-28">
          <motion.div
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 1, delay: 0.3, ease }}
            className="max-w-2xl"
          >
            <p className="text-[10px] font-sans font-medium tracking-[0.4em] uppercase text-white/40 mb-5">
              Autumn / Winter 2026
            </p>
            <h1 className="text-display-lg md:text-display-xl font-serif italic text-white mb-6 leading-[1.05]">
              The New
              <br />
              Silhouette
            </h1>
            <p className="text-[15px] font-sans text-white/50 leading-[1.8] mb-10 max-w-lg">
              A study in architectural precision and fluid movement.
              Discover the season&apos;s defining pieces — where heritage
              craftsmanship meets the modern wardrobe.
            </p>
            <div className="flex items-center gap-6">
              <Link
                href="/shop"
                className="inline-flex items-center gap-3 h-12 px-8 bg-white text-obsidian text-[11px] font-sans font-semibold tracking-[0.2em] uppercase hover:bg-ivory transition-colors duration-300"
              >
                Shop the Collection
                <ArrowRight size={14} />
              </Link>
              <button className="inline-flex items-center gap-3 text-[11px] font-sans font-medium tracking-[0.15em] uppercase text-white/50 hover:text-white transition-colors duration-300">
                <span className="w-10 h-10 border border-white/20 flex items-center justify-center">
                  <Play size={12} fill="currentColor" />
                </span>
                Watch Film
              </button>
            </div>
          </motion.div>
        </div>

        {/* Scroll indicator */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1.5 }}
          className="absolute bottom-8 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2"
        >
          <span className="text-[9px] font-sans tracking-[0.3em] uppercase text-white/20">
            Scroll
          </span>
          <motion.div
            animate={{ y: [0, 6, 0] }}
            transition={{ duration: 1.5, repeat: Infinity }}
            className="w-px h-8 bg-gradient-to-b from-white/30 to-transparent"
          />
        </motion.div>
      </section>

      {/* ═══════════════════════════════════════════
          BRAND MARQUEE
         ═══════════════════════════════════════════ */}
      <section className="border-y border-slate-border bg-ivory py-6 overflow-hidden">
        <div className="flex animate-marquee whitespace-nowrap">
          {[...BRAND_MARQUEE, ...BRAND_MARQUEE].map((brand, i) => (
            <span
              key={`${brand}-${i}`}
              className="mx-8 md:mx-12 text-[11px] font-sans font-medium tracking-[0.25em] uppercase text-neutral-300"
            >
              {brand}
            </span>
          ))}
        </div>
      </section>

      {/* ═══════════════════════════════════════════
          EDITORIAL TRIO — ASYMMETRIC GRID
         ═══════════════════════════════════════════ */}
      <section className="luxury-container py-24 md:py-32">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-100px" }}
          transition={{ duration: 0.7, ease }}
          className="text-center mb-16"
        >
          <p className="text-[10px] font-sans font-medium tracking-[0.4em] uppercase text-heritage-purple/60 mb-4">
            Curated Selections
          </p>
          <h2 className="text-display-md md:text-display-lg font-serif italic text-obsidian">
            The Editorial
          </h2>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-12 gap-4 md:gap-6">
          {/* Large left */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-80px" }}
            transition={{ duration: 0.6, ease }}
            className="md:col-span-7"
          >
            <Link href={EDITORIAL_BLOCKS[0].href} className="group block">
              <div className="relative aspect-[4/5] bg-ivory overflow-hidden mb-5">
                <Image
                  src={EDITORIAL_BLOCKS[0].image}
                  alt={EDITORIAL_BLOCKS[0].title}
                  fill
                  sizes="(max-width: 768px) 100vw, 58vw"
                  className="object-cover transition-transform duration-1000 ease-luxury group-hover:scale-[1.03]"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-700" />
                <div className="absolute bottom-0 left-0 right-0 p-8 translate-y-4 opacity-0 group-hover:translate-y-0 group-hover:opacity-100 transition-all duration-500 ease-luxury">
                  <span className="inline-flex items-center gap-2 text-[11px] font-sans font-medium tracking-[0.2em] uppercase text-white">
                    Explore
                    <ArrowRight size={12} />
                  </span>
                </div>
              </div>
              <p className="text-[10px] font-sans font-medium tracking-[0.2em] uppercase text-neutral-400 mb-2">
                {EDITORIAL_BLOCKS[0].subtitle}
              </p>
              <h3 className="text-xl md:text-2xl font-serif text-obsidian group-hover:text-heritage-green transition-colors duration-300">
                {EDITORIAL_BLOCKS[0].title}
              </h3>
            </Link>
          </motion.div>

          {/* Two stacked right */}
          <div className="md:col-span-5 flex flex-col gap-4 md:gap-6">
            {EDITORIAL_BLOCKS.slice(1).map((block, idx) => (
              <motion.div
                key={block.title}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-80px" }}
                transition={{ duration: 0.6, delay: (idx + 1) * 0.15, ease }}
              >
                <Link href={block.href} className="group block">
                  <div className="relative aspect-[5/4] bg-ivory overflow-hidden mb-4">
                    <Image
                      src={block.image}
                      alt={block.title}
                      fill
                      sizes="(max-width: 768px) 100vw, 40vw"
                      className="object-cover transition-transform duration-1000 ease-luxury group-hover:scale-[1.03]"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/30 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-700" />
                  </div>
                  <p className="text-[10px] font-sans font-medium tracking-[0.2em] uppercase text-neutral-400 mb-1.5">
                    {block.subtitle}
                  </p>
                  <h3 className="text-lg font-serif text-obsidian group-hover:text-heritage-green transition-colors duration-300">
                    {block.title}
                  </h3>
                </Link>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ═══════════════════════════════════════════
          NEW ARRIVALS — HORIZONTAL SCROLL
         ═══════════════════════════════════════════ */}
      {newArrivals.length > 0 && (
        <section className="bg-ivory py-24 md:py-32">
          <div className="luxury-container">
            <div className="flex items-end justify-between mb-14">
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.6, ease }}
              >
                <p className="text-[10px] font-sans font-medium tracking-[0.4em] uppercase text-heritage-green/50 mb-3">
                  Just Landed
                </p>
                <h2 className="text-display-sm md:text-display-md font-serif italic text-obsidian">
                  New Arrivals
                </h2>
              </motion.div>
              <Link
                href="/shop?sort=newest"
                className="hidden md:inline-flex items-center gap-2 text-[11px] font-sans font-medium tracking-[0.15em] uppercase text-heritage-green hover:text-heritage-green-500 transition-colors border-b border-heritage-green/20 pb-1"
              >
                View All
                <ChevronRight size={12} />
              </Link>
            </div>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-6">
              {newArrivals.map((product) => (
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
          </div>
        </section>
      )}

      {/* ═══════════════════════════════════════════
          FEATURED PIECES — FULL LUXURY GRID
         ═══════════════════════════════════════════ */}
      <section className="py-24 md:py-32">
        <div className="luxury-container">
          <div className="flex items-end justify-between mb-14">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, ease }}
            >
              <p className="text-[10px] font-sans font-medium tracking-[0.4em] uppercase text-heritage-purple/50 mb-3">
                Editor&apos;s Selection
              </p>
              <h2 className="text-display-sm md:text-display-md font-serif italic text-obsidian">
                Featured Pieces
              </h2>
            </motion.div>
            <Link
              href="/shop"
              className="hidden md:inline-flex items-center gap-2 text-[11px] font-sans font-medium tracking-[0.15em] uppercase text-heritage-green hover:text-heritage-green-500 transition-colors border-b border-heritage-green/20 pb-1"
            >
              Shop All
              <ChevronRight size={12} />
            </Link>
          </div>
          <div className="luxury-grid">
            {featuredProducts.length > 0
              ? featuredProducts.map((product) => (
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
                ))
              : Array.from({ length: 8 }).map((_, i) => (
                  <div key={i} className="space-y-3">
                    <div className="aspect-[3/4] bg-neutral-100 animate-pulse" />
                    <div className="h-3 w-16 bg-neutral-100 animate-pulse" />
                    <div className="h-4 w-32 bg-neutral-100 animate-pulse" />
                    <div className="h-3 w-20 bg-neutral-100 animate-pulse" />
                  </div>
                ))}
          </div>
        </div>
      </section>

      {/* ═══════════════════════════════════════════
          SPLIT EDITORIAL — TWO HALVES
         ═══════════════════════════════════════════ */}
      <section className="relative">
        <div className="grid grid-cols-1 md:grid-cols-2 min-h-[600px] md:min-h-[700px]">
          {/* Left: Image */}
          <div className="relative aspect-square md:aspect-auto overflow-hidden">
            <Image
              src={getImagePlaceholder(960, 700)}
              alt="Heritage craftsmanship"
              fill
              className="object-cover"
            />
          </div>
          {/* Right: Content */}
          <div className="bg-heritage-green flex items-center">
            <motion.div
              initial={{ opacity: 0, x: 30 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.7, ease }}
              className="px-10 md:px-16 lg:px-24 py-16 md:py-0 max-w-lg"
            >
              <p className="text-[10px] font-sans font-medium tracking-[0.4em] uppercase text-white/30 mb-5">
                Our Philosophy
              </p>
              <h2 className="text-display-sm md:text-display-md font-serif italic text-white mb-6 leading-tight">
                Every piece tells a story of heritage and craft
              </h2>
              <p className="text-[14px] font-sans text-white/50 leading-[1.9] mb-10">
                Our AI-powered Heritage Engine researches the provenance,
                design DNA, and cultural significance behind every garment —
                transforming your wardrobe into a curated collection of
                stories worth wearing.
              </p>
              <Link
                href="/shop"
                className="inline-flex items-center gap-3 h-12 px-8 bg-white text-heritage-green text-[11px] font-sans font-semibold tracking-[0.2em] uppercase hover:bg-ivory transition-colors duration-300"
              >
                Discover the Collection
                <ArrowRight size={14} />
              </Link>
            </motion.div>
          </div>
        </div>
      </section>

      {/* ═══════════════════════════════════════════
          HERITAGE PROMISE — TRUST BAR
         ═══════════════════════════════════════════ */}
      <section className="bg-ivory border-y border-slate-border py-16 md:py-20">
        <div className="luxury-container">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 md:gap-12">
            {[
              {
                label: "Complimentary\nExpress Shipping",
                detail: "On all orders worldwide",
              },
              {
                label: "Certificate of\nAuthenticity",
                detail: "Verified provenance",
              },
              {
                label: "14-Day\nFree Returns",
                detail: "No questions asked",
              },
              {
                label: "Secure\nCheckout",
                detail: "Paystack & Stripe",
              },
            ].map(({ label, detail }) => (
              <div key={label} className="text-center">
                <p className="text-[11px] font-sans font-semibold tracking-[0.15em] uppercase text-obsidian whitespace-pre-line leading-relaxed mb-2">
                  {label}
                </p>
                <p className="text-[11px] font-sans text-neutral-400">
                  {detail}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ═══════════════════════════════════════════
          NEWSLETTER — ELEGANT CTA
         ═══════════════════════════════════════════ */}
      <section className="bg-heritage-purple py-24 md:py-32">
        <div className="luxury-container text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.7, ease }}
          >
            <p className="text-[10px] font-sans font-medium tracking-[0.4em] uppercase text-white/30 mb-5">
              Stay Informed
            </p>
            <h2 className="text-display-sm md:text-display-md font-serif italic text-white mb-4 max-w-2xl mx-auto">
              Join the inner circle
            </h2>
            <p className="text-[14px] font-sans text-white/40 leading-relaxed max-w-md mx-auto mb-10">
              Early access to new arrivals, editorial features, and exclusive
              invitations to private sales events.
            </p>
            <form
              onSubmit={(e) => e.preventDefault()}
              className="flex flex-col sm:flex-row items-center justify-center gap-3 max-w-md mx-auto"
            >
              <input
                type="email"
                placeholder="your@email.com"
                className="w-full sm:flex-1 h-12 px-5 bg-white/10 border border-white/10 text-sm font-sans text-white placeholder:text-white/30 focus:outline-none focus:border-white/30 transition-colors"
              />
              <button
                type="submit"
                className="w-full sm:w-auto h-12 px-8 bg-white text-heritage-purple text-[11px] font-sans font-semibold tracking-[0.2em] uppercase hover:bg-ivory transition-colors"
              >
                Subscribe
              </button>
            </form>
          </motion.div>
        </div>
      </section>
    </div>
  );
}
