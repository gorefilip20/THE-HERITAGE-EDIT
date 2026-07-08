"use client";

import { useState, useRef } from "react";
import Link from "next/link";
import Image from "next/image";
import { motion } from "framer-motion";
import { Search, Upload, Camera, Loader, ArrowRight } from "lucide-react";
import { ProductCard } from "@/components/product/ProductCard";
import { getImagePlaceholder } from "@/lib/utils";
import type { Product } from "@/types";

export default function VisualSearch() {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [step, setStep] = useState<"upload" | "loading" | "results">("upload");
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [results, setResults] = useState<Product[]>([]);
  const [loading, setLoading] = useState(false);

  const handleImageUpload = async (file: File) => {
    const reader = new FileReader();
    reader.onload = async (e) => {
      const imageData = e.target?.result as string;
      setSelectedImage(imageData);
      setStep("loading");
      setLoading(true);

      try {
        const formData = new FormData();
        formData.append("image", file);

        const response = await fetch("/api/ai/visual-search", {
          method: "POST",
          body: formData,
        });

        const data = await response.json();
        setResults(data.products || []);
        setStep("results");
      } catch (error) {
        console.error("Visual search error:", error);
        setStep("upload");
      } finally {
        setLoading(false);
      }
    };
    reader.readAsDataURL(file);
  };

  return (
    <div className="bg-white min-h-screen">
      {/* Hero */}
      <section className="relative h-[35vh] min-h-[300px] bg-gradient-to-r from-heritage-purple via-heritage-green to-heritage-purple overflow-hidden">
        <div className="relative luxury-container h-full flex flex-col justify-center">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
          >
            <div className="flex items-center gap-2 mb-4">
              <Search size={24} className="text-white" />
              <p className="text-[11px] font-sans font-semibold tracking-[0.3em] uppercase text-white/70">
                AI-Powered Search
              </p>
            </div>
            <h1 className="text-display-lg md:text-display-xl font-serif italic text-white mb-4">
              Search by Image
            </h1>
            <p className="text-[15px] font-sans text-white/70 max-w-lg">
              Upload a photo of an outfit you love, and we'll find similar pieces from our collection.
            </p>
          </motion.div>
        </div>
      </section>

      <div className="luxury-container py-16">
        {step === "upload" && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="max-w-2xl mx-auto"
          >
            <div className="bg-neutral-50 p-8 md:p-12 rounded-lg">
              <h2 className="text-2xl font-serif text-obsidian mb-8">Upload an Image</h2>

              {/* Upload Area */}
              <div
                onClick={() => fileInputRef.current?.click()}
                className="border-2 border-dashed border-neutral-300 rounded-lg p-12 text-center cursor-pointer hover:border-obsidian hover:bg-neutral-100 transition-all"
              >
                <div className="flex flex-col items-center gap-4">
                  <div className="w-16 h-16 bg-neutral-200 rounded-full flex items-center justify-center">
                    <Upload size={24} className="text-neutral-600" />
                  </div>
                  <div>
                    <p className="text-lg font-serif text-obsidian mb-2">
                      Drop your image here
                    </p>
                    <p className="text-[13px] font-sans text-neutral-500">
                      or click to browse from your device
                    </p>
                  </div>
                  <p className="text-[11px] font-sans text-neutral-400 mt-4">
                    Supported formats: JPG, PNG, WebP (Max 10MB)
                  </p>
                </div>
              </div>

              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                onChange={(e) => {
                  const file = e.target.files?.[0];
                  if (file) handleImageUpload(file);
                }}
                className="hidden"
              />

              {/* Or Use Camera */}
              <div className="my-8 flex items-center gap-4">
                <div className="flex-1 h-px bg-neutral-300" />
                <span className="text-[12px] font-sans text-neutral-500">Or</span>
                <div className="flex-1 h-px bg-neutral-300" />
              </div>

              <button
                onClick={() => fileInputRef.current?.click()}
                className="w-full h-12 border border-obsidian text-obsidian text-[11px] font-sans font-semibold tracking-[0.15em] uppercase hover:bg-neutral-50 transition-colors flex items-center justify-center gap-2"
              >
                <Camera size={14} />
                Take a Photo
              </button>

              {/* Example Images */}
              <div className="mt-12">
                <p className="text-[12px] font-sans font-medium text-neutral-600 mb-4">
                  Try searching with these examples:
                </p>
                <div className="grid grid-cols-3 gap-4">
                  {[1, 2, 3].map((i) => (
                    <div
                      key={i}
                      className="aspect-square bg-neutral-200 rounded-lg overflow-hidden cursor-pointer hover:opacity-75 transition-opacity"
                    >
                      <Image
                        src={getImagePlaceholder(300, 300)}
                        alt={`Example ${i}`}
                        width={300}
                        height={300}
                        className="w-full h-full object-cover"
                      />
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </motion.div>
        )}

        {step === "loading" && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="text-center py-20"
          >
            <div className="inline-block">
              <Loader className="w-12 h-12 text-heritage-green animate-spin mb-4" />
              <p className="text-lg font-serif italic text-obsidian">
                Analyzing your image...
              </p>
              <p className="text-[13px] font-sans text-neutral-500 mt-2">
                Our AI is finding similar pieces
              </p>
            </div>
          </motion.div>
        )}

        {step === "results" && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
          >
            {selectedImage && (
              <div className="mb-12">
                <h2 className="text-lg font-serif text-obsidian mb-4">Your Search Image</h2>
                <div className="relative w-full max-w-sm h-96 bg-neutral-100 rounded-lg overflow-hidden">
                  <Image
                    src={selectedImage}
                    alt="Search image"
                    fill
                    className="object-cover"
                  />
                </div>
              </div>
            )}

            <div className="mb-12">
              <h2 className="text-display-sm font-serif italic text-obsidian mb-2">
                Similar Items Found
              </h2>
              <p className="text-[13px] font-sans text-neutral-600 mb-8">
                We found {results.length} items similar to your search image
              </p>

              {results.length > 0 ? (
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-6">
                  {results.map((product) => (
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
                    No similar items found
                  </p>
                  <p className="text-[13px] font-sans text-neutral-500">
                    Try uploading a different image
                  </p>
                </div>
              )}
            </div>

            <div className="flex gap-4">
              <button
                onClick={() => {
                  setStep("upload");
                  setSelectedImage(null);
                  setResults([]);
                }}
                className="flex-1 h-12 border border-obsidian text-obsidian text-[11px] font-sans font-semibold tracking-[0.15em] uppercase hover:bg-neutral-50 transition-colors"
              >
                Search Again
              </button>
              <Link
                href="/shop"
                className="flex-1 h-12 bg-obsidian text-white text-[11px] font-sans font-semibold tracking-[0.15em] uppercase hover:bg-neutral-800 transition-colors flex items-center justify-center gap-2"
              >
                Browse All
                <ArrowRight size={14} />
              </Link>
            </div>
          </motion.div>
        )}
      </div>
    </div>
  );
}
