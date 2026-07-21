"use client";

import { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { motion } from "framer-motion";
import { Heart, ShoppingBag } from "lucide-react";
import { getImagePlaceholder } from "@/lib/utils";
import { useLocale } from "@/context/LocaleContext";

interface ProductCardProps {
  slug: string;
  name: string;
  brandName: string;
  priceCents: number;
  salePriceCents?: number | null;
  currency?: string;
  imageUrl: string;
  hoverImageUrl?: string;
  imageAlt?: string;
}

export function ProductCard({
  slug,
  name,
  brandName,
  priceCents,
  salePriceCents,
  currency,
  imageUrl,
  hoverImageUrl,
  imageAlt,
}: ProductCardProps) {
  const { formatPrice } = useLocale();
  const [isHovered, setIsHovered] = useState(false);
  const [isWishlisted, setIsWishlisted] = useState(false);
  const [imageLoaded, setImageLoaded] = useState(false);

  const displayImage =
    isHovered && hoverImageUrl ? hoverImageUrl : imageUrl;
  const hasDiscount = salePriceCents && salePriceCents < priceCents;
  const discountPercent = hasDiscount
    ? Math.round(((priceCents - salePriceCents) / priceCents) * 100)
    : 0;

  return (
    <motion.article
      initial={{ opacity: 0, y: 16 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-50px" }}
      transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
      className="group relative"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      {/* Image container */}
      <Link href={`/product/${slug}`} className="block relative aspect-[3/4] bg-[#f8f7f5] overflow-hidden mb-4">
        {!imageLoaded && (
          <div className="absolute inset-0 bg-[#f0eeeb] animate-pulse" />
        )}
        <Image
          src={displayImage || getImagePlaceholder(600, 800)}
          alt={imageAlt ?? `${brandName} ${name}`}
          fill
          sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"
          className={`object-cover transition-all duration-700 ease-luxury group-hover:scale-[1.04] ${
            imageLoaded ? "opacity-100" : "opacity-0"
          }`}
          onLoad={() => setImageLoaded(true)}
        />

        {/* Sale badge */}
        {hasDiscount && (
          <span className="absolute top-3 left-3 px-2.5 py-1 bg-obsidian text-white text-[10px] font-sans font-semibold tracking-wider uppercase">
            -{discountPercent}%
          </span>
        )}

        {/* Hover overlay with actions */}
        <div className="absolute inset-x-0 bottom-0 p-4 bg-gradient-to-t from-black/40 to-transparent opacity-0 group-hover:opacity-100 transition-all duration-500 translate-y-2 group-hover:translate-y-0">
          <button
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
            }}
            className="w-full h-10 bg-white text-obsidian text-[10px] font-sans font-semibold tracking-[0.15em] uppercase flex items-center justify-center gap-2 hover:bg-ivory transition-colors"
          >
            <ShoppingBag size={12} />
            Quick Add
          </button>
        </div>

        {/* Wishlist button */}
        <button
          onClick={(e) => {
            e.preventDefault();
            e.stopPropagation();
            setIsWishlisted(!isWishlisted);
          }}
          className="absolute top-3 right-3 w-8 h-8 bg-white/90 backdrop-blur-sm flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all duration-300 hover:bg-white hover:scale-110"
          aria-label="Add to wishlist"
        >
          <Heart
            size={14}
            strokeWidth={1.5}
            className={isWishlisted ? "fill-heritage-green text-heritage-green" : "text-obsidian/70"}
          />
        </button>
      </Link>

      {/* Product info */}
      <div className="space-y-1.5">
        <p className="text-[10px] font-sans font-semibold tracking-[0.2em] uppercase text-neutral-500">
          {brandName}
        </p>
        <Link href={`/product/${slug}`}>
          <h3 className="text-[13px] font-sans font-normal text-obsidian leading-snug line-clamp-2 group-hover:text-heritage-green transition-colors duration-300">
            {name}
          </h3>
        </Link>
        <div className="flex items-center gap-2 pt-0.5">
          <span className={`text-[13px] font-sans font-medium ${hasDiscount ? "text-red-600" : "text-obsidian"}`}>
            {formatPrice(salePriceCents ?? priceCents, currency)}
          </span>
          {hasDiscount && (
            <span className="text-[13px] font-sans text-neutral-400 line-through">
              {formatPrice(priceCents, currency)}
            </span>
          )}

        </div>
      </div>
    </motion.article>
  );
}
