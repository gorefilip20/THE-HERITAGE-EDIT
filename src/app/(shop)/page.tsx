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
    title: "The Agbada Collection",
    subtitle: "Regal Presence",
    category: "Agbada & Robes",
    image: "https://images.unsplash.com/photo-1600091166971-7f9faad6c1e2?w=700&h=900&fit=crop&q=80",
    href: "/shop?category=agbada-robes",
  },
  {
    title: "Ankara Reimagined",
    subtitle: "Bold & Contemporary",
    category: "Ankara Dresses",
    image: "https://images.unsplash.com/photo-1590735213920-68192a487bc2?w=700&h=900&fit=crop&q=80",
    href: "/shop?category=ankara-dresses",
  },
  {
    title: "The Bridal Edit",
    subtitle: "Ceremony & Celebration",
    category: "Wedding & Ceremony",
    image: "https://images.unsplash.com/photo-1594463750939-ebb28c3f7f75?w=700&h=900&fit=crop&q=80",
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

const FORMSPREE_URL = "https://formspree.io/f/maqrjzvj";

export default function HomePage() {
  const [featuredProducts, setFeaturedProducts] = useState<Product[]>([]);
  const [newArrivals, setNewArrivals] = useState<Product[]>([]);
  const [nlEmail, setNlEmail] = useState("");
  const [nlStatus, setNlStatus] = useState<"idle" | "submitting" | "success" | "error">("idle");

  async function handleNewsletterSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!nlEmail || nlStatus === "submitting" || nlStatus === "success") return;
    setNlStatus("submitting");
    try {
      const res = await fetch(FORMSPREE_URL, {
        method: "POST",
        headers: { "Content-Type": "application/json", Accept: "application/json" },
        body: JSON.stringify({ email: nlEmail }),
      });
      if (res.ok) {
        setNlStatus("success");
      } else {
        setNlStatus("error");
      }
    } catch {
      setNlStatus("error");
    }
  }

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
            src="https://images.unsplash.com/photo-1617137968427-85924c800a22?w=1920&h=1080&fit=crop&q=80"
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
              The Finest Edit in African Fashion
            </p>
            <h1 className="text-display-lg md:text-display-xl font-serif italic text-white mb-6 leading-[1.05]">
              Wear Your
              <br />
              Heritage
            </h1>
            <p className="text-[15px] font-sans text-white/50 leading-[1.8] mb-10 max-w-lg">
              Discover Africa&apos;s finest designers and textiles — from hand-woven
              Aso Oke to bold Ankara prints. Luxury fashion rooted in centuries
              of cultural artistry, delivered worldwide.
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
              src="https://images.unsplash.com/photo-1590735213920-68192a487bc2?w=960&h=700&fit=crop"
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
                detail: "Paystack & Flutterwave",
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
                image: "https://images.unsplash.com/photo-1531746020798-e6953c6e8e04?w=80&h=80&fit=crop&crop=face",
              },
              {
                name: "Zainab Hassan",
                location: "London, UK",
                rating: 5,
                text: "I'm obsessed! The Ankara collection is stunning and the customer service is incredibly responsive. Highly recommend!",
                image: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=80&h=80&fit=crop&crop=face",
              },
              {
                name: "Kwame Mensah",
                location: "New York, USA",
                rating: 5,
                text: "Finally, a platform that celebrates African fashion with the luxury it deserves. The Heritage Edit is revolutionary.",
                image: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=80&h=80&fit=crop&crop=face",
              },
            ].map((review, idx) => (
              <motion.div
                key={review.name}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.6, delay: idx * 0.1, ease }}
                className="bg-ivory p-8"
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
            {[
              "https://images.unsplash.com/photo-1590735213920-68192a487bc2?w=400&h=400&fit=crop",
              "https://images.unsplash.com/photo-1516575150508-4ed8cb3be8ed?w=400&h=400&fit=crop",
              "https://images.unsplash.com/photo-1523359346063-d879354c0ea5?w=400&h=400&fit=crop",
              "https://images.unsplash.com/photo-1558618666-fcd25c85f82e?w=400&h=400&fit=crop",
              "https://images.unsplash.com/photo-1509631179647-0177331693ae?w=400&h=400&fit=crop",
              "https://images.unsplash.com/photo-1525507119028-ed4c629a60a3?w=400&h=400&fit=crop",
              "https://images.unsplash.com/photo-1618932260643-eee4a2f652a6?w=400&h=400&fit=crop",
              "https://images.unsplash.com/photo-1583391733956-3750e0ff4e8b?w=400&h=400&fit=crop",
            ].map((src, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, scale: 0.95 }}
                whileInView={{ opacity: 1, scale: 1 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: i * 0.05 }}
                className="relative aspect-square bg-neutral-200 overflow-hidden group cursor-pointer"
              >
                <Image
                  src={src}
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
              href="https://instagram.com/theheritageedit"
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
              onSubmit={handleNewsletterSubmit}
              className="flex flex-col sm:flex-row items-center justify-center gap-3 max-w-md mx-auto"
            >
              <input
                type="email"
                placeholder="your@email.com"
                value={nlEmail}
                onChange={(e) => setNlEmail(e.target.value)}
                required
                disabled={nlStatus === "success"}
                className="w-full sm:flex-1 h-12 px-5 bg-white/10 border border-white/10 text-sm font-sans text-white placeholder:text-white/30 focus:outline-none focus:border-white/30 transition-colors disabled:opacity-50"
              />
              <button
                type="submit"
                disabled={nlStatus === "submitting" || nlStatus === "success"}
                className="w-full sm:w-auto h-12 px-8 bg-white text-heritage-purple text-[11px] font-sans font-semibold tracking-[0.2em] uppercase hover:bg-ivory transition-colors disabled:opacity-60 disabled:cursor-not-allowed"
              >
                {nlStatus === "success" ? "Subscribed" : nlStatus === "submitting" ? "Sending..." : "Subscribe"}
              </button>
            </form>
          </motion.div>
        </div>
      </section>
    </div>
  );
}
