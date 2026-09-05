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
    key: "agbada",
    title: "The Agbada Collection",
    subtitle: "Regal Presence",
    query: "category=agbada-robes",
    href: "/shop?category=agbada-robes",
  },
  {
    key: "ankara",
    title: "Ankara Reimagined",
    subtitle: "Bold & Contemporary",
    query: "category=ankara-dresses",
    href: "/shop?category=ankara-dresses",
  },
  {
    key: "bridal",
    title: "The Bridal Edit",
    subtitle: "Ceremony & Celebration",
    query: "collection=wedding-ceremony",
    href: "/collection/wedding-ceremony",
  },
];

const BRAND_MARQUEE = [
  "Ozwald Boateng",
  "Duro Olowu",
  "Lisa Folawiyo",
  "Maki Oh",
  "Thebe Magugu",
  "Kenneth Ize",
  "Imane Ayissi",
  "Laduma Ngxokolo",
  "Christie Brown",
  "Tongoro",
  "Ahluwalia",
  "Orange Culture",
];

export default function HomePage() {
  const [featuredProducts, setFeaturedProducts] = useState<Product[]>([]);
  const [newArrivals, setNewArrivals] = useState<Product[]>([]);
  const [editorialProducts, setEditorialProducts] = useState<Record<string, Product[]>>({});
  const [isHomeLoading, setIsHomeLoading] = useState(true);

  useEffect(() => {
    const loadHomeProducts = async () => {
      try {
        const responses = await Promise.all([
          fetch("/api/products?featured=true&pageSize=8"),
          fetch("/api/products?sort=newest&pageSize=8"),
          ...EDITORIAL_BLOCKS.map((block) => fetch(`/api/products?${block.query}&pageSize=1`)),
        ]);
        const payloads = await Promise.all(responses.map((response) => response.json()));
        setFeaturedProducts(payloads[0]?.data ?? []);
        setNewArrivals(payloads[1]?.data ?? []);
        const nextEditorial: Record<string, Product[]> = {};
        EDITORIAL_BLOCKS.forEach((block, index) => {
          nextEditorial[block.key] = payloads[index + 2]?.data ?? [];
        });
        setEditorialProducts(nextEditorial);
      } catch {
        // The homepage keeps its visual structure even if a non-critical catalog request fails.
      } finally {
        setIsHomeLoading(false);
      }
    };
    void loadHomeProducts();
  }, []);

  const editorialWithProducts = EDITORIAL_BLOCKS.map((block, index) => ({
    ...block,
    product: editorialProducts[block.key]?.[0] ?? newArrivals[index] ?? null,
  }));

  return (
    <div className="bg-white">
      {/* ═══════════════════════════════════════════
          HERO — FULL-BLEED CINEMATIC
         ═══════════════════════════════════════════ */}
      <section className="relative overflow-hidden bg-[#f4eadc] text-obsidian">
        <div className="absolute inset-0 pointer-events-none opacity-70">
          <div className="absolute -left-24 top-10 h-72 w-72 rounded-full bg-[#e9b8a6]/50 blur-3xl" />
          <div className="absolute right-0 top-0 h-96 w-96 rounded-full bg-[#c9d8c1]/70 blur-3xl" />
          <div className="absolute bottom-0 left-1/3 h-64 w-64 rounded-full bg-[#d9c4e8]/50 blur-3xl" />
        </div>

        <div className="luxury-container relative grid min-h-[calc(100svh-88px)] items-center gap-10 py-12 md:grid-cols-[0.92fr_1.08fr] md:gap-16 md:py-20 lg:min-h-[760px]">
          <motion.div
            initial={{ opacity: 0, x: -24 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8, ease }}
            className="relative z-10 max-w-xl"
          >
            <div className="mb-7 flex items-center gap-3">
              <span className="h-px w-10 bg-heritage-green" />
              <p className="text-[10px] font-sans font-semibold tracking-[0.34em] uppercase text-heritage-green">
                The finest edit in African fashion
              </p>
            </div>
            <h1 className="max-w-[11ch] text-[clamp(4rem,13vw,8.5rem)] font-serif font-medium leading-[0.84] tracking-[-0.06em] text-obsidian">
              Wear your <span className="text-heritage-purple italic">heritage.</span>
            </h1>
            <p className="mt-8 max-w-md text-[15px] font-sans leading-[1.75] text-obsidian/65 md:text-[17px]">
              Curated fashion, fearless design, and hand-finished pieces from Africa&apos;s most compelling designers — delivered to wherever you are.
            </p>
            <div className="mt-9 flex flex-wrap items-center gap-3">
              <Link
                href="/shop"
                className="luxury-button-primary group bg-heritage-green px-7 shadow-[0_14px_30px_rgba(26,58,42,0.18)] hover:bg-heritage-green-600"
              >
                Shop the edit
                <ArrowRight size={15} className="transition-transform duration-300 group-hover:translate-x-1" />
              </Link>
              <Link
                href="/about"
                className="inline-flex h-12 items-center gap-2 border-b border-obsidian/25 px-3 text-[11px] font-sans font-semibold tracking-[0.18em] uppercase text-obsidian transition-colors hover:border-heritage-purple hover:text-heritage-purple"
              >
                Our story
                <ChevronRight size={14} />
              </Link>
            </div>
            <div className="mt-10 flex flex-wrap gap-x-6 gap-y-2 text-[10px] font-sans font-medium tracking-[0.14em] uppercase text-obsidian/45">
              <span>Worldwide delivery</span>
              <span>Secure checkout</span>
              <span>Authentic craft</span>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, scale: 0.96, rotate: 1 }}
            animate={{ opacity: 1, scale: 1, rotate: 0 }}
            transition={{ duration: 1, delay: 0.12, ease }}
            className="relative mx-auto w-full max-w-[620px]"
          >
            <div className="relative aspect-[0.82] overflow-hidden rounded-[2px] bg-heritage-green shadow-[0_28px_80px_rgba(46,26,71,0.2)]">
              <div className="absolute inset-0 bg-[radial-gradient(circle_at_28%_22%,rgba(244,234,220,0.92)_0_11%,transparent_11.5%),radial-gradient(circle_at_74%_70%,rgba(213,164,177,0.8)_0_16%,transparent_16.5%),linear-gradient(132deg,#1a3a2a_0%,#2e1a47_52%,#b7635f_100%)]" />
              <div className="absolute -right-16 top-10 h-[72%] w-[58%] rotate-[18deg] rounded-[48%_52%_42%_58%] border-[26px] border-[#e9b8a6]/80 opacity-90" />
              <div className="absolute -left-16 bottom-[-12%] h-[70%] w-[70%] -rotate-[28deg] rounded-[45%] border-[32px] border-[#d9c4e8]/70" />
              <div className="absolute inset-x-7 top-7 bottom-7 border border-white/30" />
              <div className="absolute left-8 top-8 text-[9px] font-sans font-semibold tracking-[0.3em] uppercase text-white/75">T H E  E D I T</div>
              <div className="absolute bottom-8 left-8 right-8 flex items-end justify-between text-white">
                <div>
                  <p className="text-[10px] font-sans font-semibold tracking-[0.3em] uppercase text-white/60">New season / 01</p>
                  <p className="mt-2 max-w-[9ch] text-4xl font-serif italic leading-[0.9] md:text-6xl">Crafted to be remembered.</p>
                </div>
                <span className="mb-1 flex h-11 w-11 items-center justify-center rounded-full border border-white/40 bg-white/10 backdrop-blur-sm"><ArrowRight size={16} /></span>
              </div>
            </div>
            <div className="absolute -bottom-5 -left-3 rounded-sm bg-white px-4 py-3 shadow-xl md:-left-8">
              <p className="text-[9px] font-sans font-semibold tracking-[0.2em] uppercase text-heritage-purple">Curated globally</p>
              <p className="mt-1 font-serif text-lg text-obsidian">Rooted in Africa</p>
            </div>
            <div className="absolute -right-2 top-8 hidden rounded-full bg-heritage-purple px-4 py-2 text-[9px] font-sans font-semibold tracking-[0.2em] uppercase text-white shadow-lg md:block md:-right-7">Limited pieces</div>
          </motion.div>
        </div>
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
            <Link href={editorialWithProducts[0].product ? `/product/${editorialWithProducts[0].product.slug}` : editorialWithProducts[0].href} className="group block">
              <div className="relative aspect-[4/5] bg-ivory overflow-hidden mb-5">
                <Image
                  src={editorialWithProducts[0].product?.images[0]?.url ?? getImagePlaceholder(700, 900)}
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
                {editorialWithProducts[0].subtitle}
              </p>
              <h3 className="text-xl md:text-2xl font-serif text-obsidian group-hover:text-heritage-green transition-colors duration-300">
                {editorialWithProducts[0].title}
              </h3>
            </Link>
          </motion.div>

          {/* Two stacked right */}
          <div className="md:col-span-5 flex flex-col gap-4 md:gap-6">
            {editorialWithProducts.slice(1).map((block, idx) => (
              <motion.div
                key={block.title}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-80px" }}
                transition={{ duration: 0.6, delay: (idx + 1) * 0.15, ease }}
              >
                <Link href={block.product ? `/product/${block.product.slug}` : block.href} className="group block">
                  <div className="relative aspect-[5/4] bg-ivory overflow-hidden mb-4">
                    <Image
                      src={block.product?.images[0]?.url ?? getImagePlaceholder(700, 900)}
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
            {isHomeLoading ? (
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-6">
                {Array.from({ length: 4 }).map((_, index) => <div key={index} className="aspect-[3/4] bg-white/70 animate-pulse" />)}
              </div>
            ) : newArrivals.length > 0 ? (
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-6">
                {newArrivals.map((product) => (
                  <ProductCard
                    key={product.id}
                    slug={product.slug}
                    name={product.name}
                    brandName={product.brand?.name ?? "The Heritage Edit"}
                    priceCents={product.basePriceCents}
                    salePriceCents={product.salePriceCents}
                    currency={product.currency}
                    imageUrl={product.images[0]?.url ?? getImagePlaceholder(600, 800)}
                    hoverImageUrl={product.images[1]?.url}
                  />
                ))}
              </div>
            ) : (
              <div className="border border-dashed border-heritage-green/20 bg-white/50 px-6 py-14 text-center">
                <p className="font-serif text-xl italic text-obsidian">Your next signature piece is on its way.</p>
                <p className="mt-2 text-sm font-sans text-neutral-400">Newly published products will appear here first.</p>
                <Link href="/shop" className="mt-6 inline-flex luxury-button-secondary">Explore the collection</Link>
              </div>
            )}
          </div>
        </section>

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
            {(featuredProducts.length > 0 ? featuredProducts : newArrivals).length > 0
              ? (featuredProducts.length > 0 ? featuredProducts : newArrivals).map((product) => (
                  <ProductCard
                    key={product.id}
                    slug={product.slug}
                    name={product.name}
                    brandName={product.brand?.name ?? "The Heritage Edit"}
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
                Every thread carries the wisdom of generations
              </h2>
              <p className="text-[14px] font-sans text-white/50 leading-[1.9] mb-10">
                From the Kente looms of Ghana to the Adire dye pits of
                Nigeria, every piece in our collection carries a story of
                cultural heritage. We connect you with Africa&apos;s finest
                designers and artisans — bringing centuries of textile
                mastery to the global stage.
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
          CUSTOMER REVIEWS — SOCIAL PROOF
         ═══════════════════════════════════════════ */}
      <section className="py-24 md:py-32">
        <div className="luxury-container">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, ease }}
            className="text-center mb-16"
          >
            <p className="text-[10px] font-sans font-medium tracking-[0.4em] uppercase text-heritage-green/50 mb-4">
              Customer Stories
            </p>
            <h2 className="text-display-md md:text-display-lg font-serif italic text-obsidian">
              Loved by Customers Worldwide
            </h2>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[
              {
                name: "Amara Okonkwo",
                location: "Lagos, Nigeria",
                rating: 5,
                text: "The quality is exceptional. Every piece feels like an investment in my heritage. The craftsmanship is unmatched.",
                image: getImagePlaceholder(80, 80),
              },
              {
                name: "Zainab Hassan",
                location: "London, UK",
                rating: 5,
                text: "I'm obsessed! The Ankara collection is stunning and the customer service is incredibly responsive. Highly recommend!",
                image: getImagePlaceholder(80, 80),
              },
              {
                name: "Kwame Mensah",
                location: "New York, USA",
                rating: 5,
                text: "Finally, a platform that celebrates African fashion with the luxury it deserves. The Heritage Edit is revolutionary.",
                image: getImagePlaceholder(80, 80),
              },
            ].map((review, idx) => (
              <motion.div
                key={review.name}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.6, delay: idx * 0.1, ease }}
                className="bg-ivory p-8 rounded-lg"
              >
                <div className="flex items-center gap-1 mb-4">
                  {Array.from({ length: review.rating }).map((_, i) => (
                    <span key={i} className="text-heritage-green">★</span>
                  ))}
                </div>
                <p className="text-[14px] font-sans text-neutral-700 leading-relaxed mb-6">
                  "{review.text}"
                </p>
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-neutral-300 overflow-hidden">
                    <Image
                      src={review.image}
                      alt={review.name}
                      width={40}
                      height={40}
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <div>
                    <p className="text-[12px] font-sans font-medium text-obsidian">{review.name}</p>
                    <p className="text-[11px] font-sans text-neutral-500">{review.location}</p>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ═══════════════════════════════════════════
          INSTAGRAM GALLERY — SOCIAL INTEGRATION
         ═══════════════════════════════════════════ */}
      <section className="bg-ivory py-24 md:py-32">
        <div className="luxury-container">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, ease }}
            className="text-center mb-16"
          >
            <p className="text-[10px] font-sans font-medium tracking-[0.4em] uppercase text-heritage-purple/50 mb-4">
              Follow Us
            </p>
            <h2 className="text-display-md md:text-display-lg font-serif italic text-obsidian mb-4">
              @TheHeritageEdit
            </h2>
            <p className="text-[14px] font-sans text-neutral-600">
              Tag us for a chance to be featured
            </p>
          </motion.div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
            {Array.from({ length: 8 }).map((_, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, scale: 0.95 }}
                whileInView={{ opacity: 1, scale: 1 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: i * 0.05 }}
                className="relative aspect-square bg-neutral-200 overflow-hidden group cursor-pointer"
              >
                <Image
                  src={getImagePlaceholder(400, 400)}
                  alt={`Instagram post ${i + 1}`}
                  fill
                  className="object-cover group-hover:scale-110 transition-transform duration-500"
                />
                <div className="absolute inset-0 bg-black/0 group-hover:bg-black/30 transition-colors duration-300 flex items-center justify-center">
                  <span className="text-white opacity-0 group-hover:opacity-100 transition-opacity text-[12px] font-sans font-medium">
                    View on Instagram
                  </span>
                </div>
              </motion.div>
            ))}
          </div>

          <div className="text-center">
            <a
              href="https://www.instagram.com/theheritageedit_/?igsh=MWJyMTZpNGMyeHUxYg=="
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 h-12 px-8 border border-obsidian text-obsidian text-[11px] font-sans font-semibold tracking-[0.15em] uppercase hover:bg-neutral-50 transition-colors"
            >
              Follow on Instagram
              <ArrowRight size={14} />
            </a>
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
