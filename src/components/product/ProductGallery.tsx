"use client";

import { useState } from "react";
import Image from "next/image";
import { motion, AnimatePresence } from "framer-motion";
import { getImagePlaceholder } from "@/lib/utils";
import type { ProductImage } from "@/types";

interface ProductGalleryProps {
  images: ProductImage[];
  productName: string;
}

export function ProductGallery({ images, productName }: ProductGalleryProps) {
  const [selectedIndex, setSelectedIndex] = useState(0);
  const sortedImages = [...images].sort((a, b) => a.sortOrder - b.sortOrder);
  const selectedImage = sortedImages[selectedIndex];

  if (sortedImages.length === 0) {
    return (
      <div className="aspect-[3/4] bg-ivory flex items-center justify-center">
        <span className="text-neutral-300 font-sans text-sm">No image</span>
      </div>
    );
  }

  return (
    <div className="flex gap-4">
      {/* Thumbnails — vertical strip */}
      {sortedImages.length > 1 && (
        <div className="hidden md:flex flex-col gap-2 w-16 shrink-0">
          {sortedImages.map((img, idx) => (
            <button
              key={img.id}
              onClick={() => setSelectedIndex(idx)}
              className={`relative aspect-[3/4] overflow-hidden border-2 transition-all duration-200 ${
                idx === selectedIndex
                  ? "border-heritage-green"
                  : "border-transparent hover:border-neutral-200"
              }`}
            >
              <Image
                src={img.url}
                alt={img.alt ?? `${productName} view ${idx + 1}`}
                fill
                sizes="64px"
                className="object-cover"
              />
            </button>
          ))}
        </div>
      )}

      {/* Main image */}
      <div className="flex-1 relative aspect-[3/4] bg-ivory overflow-hidden cursor-zoom-in">
        <AnimatePresence mode="wait">
          <motion.div
            key={selectedImage.id}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3 }}
            className="absolute inset-0"
          >
            <Image
              src={selectedImage.url || getImagePlaceholder(800, 1067)}
              alt={selectedImage.alt ?? productName}
              fill
              sizes="(max-width: 768px) 100vw, 50vw"
              className="object-cover"
              priority
            />
          </motion.div>
        </AnimatePresence>

        {/* Mobile dot indicators */}
        {sortedImages.length > 1 && (
          <div className="md:hidden absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-2">
            {sortedImages.map((_, idx) => (
              <button
                key={idx}
                onClick={() => setSelectedIndex(idx)}
                className={`w-1.5 h-1.5 rounded-full transition-all ${
                  idx === selectedIndex
                    ? "bg-heritage-green w-4"
                    : "bg-obsidian/20"
                }`}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
