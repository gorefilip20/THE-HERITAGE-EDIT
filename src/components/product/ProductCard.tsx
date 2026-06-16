"use client";

import { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { motion } from "framer-motion";
import { Heart } from "lucide-react";
import { formatPrice, getImagePlaceholder } from "@/lib/utils";

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
  currency = "USD",
  imageUrl,
  hoverImageUrl,
  imageAlt,
}: ProductCardProps) {
  const [isHovered, setIsHovered] = useState(false);
  const [isWishlisted, setIsWishlisted] = useState(false);
  const [imageLoaded, setImageLoaded] = useState(false);

  const displayImage =
    isHovered && hoverImageUrl ? hoverImageUrl : imageUrl;
  const hasDiscount = salePriceCents && salePriceCents < priceCents;

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
      <Link href={`/product/${slug}`} className="block relative aspect-[3/4] bg-ivory overflow-hidden mb-4">
        {!imageLoaded && (
          <div className="absolute inset-0 skeleton" />
        )}
        <Image
          src={displayImage || getImagePlaceholder(600, 800)}
          alt={imageAlt ?? `${brandName} ${name}`}
          fill
          sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"
          className={`object-cover transition-all duration-700 ease-luxury group-hover:scale-105 ${
            imageLoaded ? "opacity-100" : "opacity-0"
          }`}
          onLoad={() => setImageLoaded(true)}
        />

        {hasDiscount && (
          <span className="absolute top-3 left-3 px-2 py-1 bg-heritage-purple text-white text-[10px] font-sans font-semibold tracking-wider uppercase">
            Sale
          </span>
        )}

        {/* Wishlist button */}
        <button
          onClick={(e) => {
            e.preventDefault();
            setIsWishlisted(!isWishlisted);
          }}
          className="absolute top-3 right-3 p-2 bg-white/80 backdrop-blur-sm rounded-full opacity-0 group-hover:opacity-100 transition-all duration-300 hover:bg-white"
          aria-label="Add to wishlist"
        >
          <Heart
            size={14}
            strokeWidth={1.5}
            className={isWishlisted ? "fill-heritage-green text-heritage-green" : "text-obsidian/60"}
          />
        </button>
      </Link>

      {/* Product info */}
      <div className="space-y-1">
        <p className="text-[10px] font-sans font-medium tracking-[0.15em] uppercase text-neutral-400">
          {brandName}
        </p>
        <Link href={`/product/${slug}`}>
          <h3 className="text-sm font-sans font-normal text-obsidian leading-snug line-clamp-2 group-hover:text-heritage-green transition-colors duration-300">
            {name}
          </h3>
        </Link>
        <div className="flex items-center gap-2 pt-1">
          <span className={`product-price text-sm ${hasDiscount ? "text-heritage-purple" : "text-obsidian"}`}>
            {formatPrice(salePriceCents ?? priceCents, currency)}
          </span>
          {hasDiscount && (
            <span className="product-price text-sm text-neutral-300 line-through">
              {formatPrice(priceCents, currency)}
            </span>
          )}
        </div>
      </div>
    </motion.article>
  );
}
