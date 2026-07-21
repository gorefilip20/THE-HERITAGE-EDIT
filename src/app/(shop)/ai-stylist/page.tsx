"use client";

import { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { motion } from "framer-motion";
import { Sparkles, ArrowRight, Loader } from "lucide-react";
import { ProductCard } from "@/components/product/ProductCard";
import { getImagePlaceholder } from "@/lib/utils";
import type { Product } from "@/types";

interface StyleProfile {
  occasion: string;
  bodyType: string;
  colorPreference: string;
  budget: string;
  style: string;
}

export default function AIStylist() {
  const [step, setStep] = useState<"quiz" | "loading" | "results">("quiz");
  const [styleProfile, setStyleProfile] = useState<StyleProfile>({
    occasion: "",
    bodyType: "",
    colorPreference: "",
    budget: "",
    style: "",
  });
  const [recommendations, setRecommendations] = useState<Product[]>([]);
  const [loading, setLoading] = useState(false);

  const handleQuizSubmit = async () => {
    if (!styleProfile.occasion || !styleProfile.bodyType || !styleProfile.colorPreference) {
      alert("Please answer all questions");
      return;
    }

    setStep("loading");
    setLoading(true);

    try {
      const response = await fetch("/api/ai/recommendations", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(styleProfile),
      });

      const data = await response.json();
      setRecommendations(data.products || []);
      setStep("results");
    } catch (error) {
      console.error("Error getting recommendations:", error);
      setStep("quiz");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-white min-h-screen">
      {/* Hero */}
      <section className="relative h-[40vh] min-h-[350px] bg-gradient-to-r from-heritage-purple to-heritage-green overflow-hidden">
        <div className="absolute inset-0 opacity-10">
          <div className="absolute inset-0 bg-[url('data:image/svg+xml;utf8,<svg xmlns=%22http://www.w3.org/2000/svg%22 viewBox=%220 0 100 100%22><circle cx=%2250%22 cy=%2250%22 r=%2230%22 fill=%22white%22/></svg>')] bg-repeat opacity-5"></div>
        </div>
        <div className="relative luxury-container h-full flex flex-col justify-center">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
          >
            <div className="flex items-center gap-2 mb-4">
              <Sparkles size={24} className="text-white" />
              <p className="text-[11px] font-sans font-semibold tracking-[0.3em] uppercase text-white/70">
                Powered by AI
              </p>
            </div>
            <h1 className="text-display-lg md:text-display-xl font-serif italic text-white mb-4 leading-tight">
              Your Personal Stylist
            </h1>
            <p className="text-[15px] font-sans text-white/70 max-w-lg">
              Answer a few questions and let our AI find the perfect African fashion pieces for your style, body type, and occasion.
            </p>
          </motion.div>
        </div>
      </section>

      <div className="luxury-container py-16">
        {step === "quiz" && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="max-w-2xl mx-auto"
          >
            <div className="bg-neutral-50 p-8 md:p-12">
              <h2 className="text-2xl font-serif text-obsidian mb-8">Tell Us About Your Style</h2>

              <div className="space-y-8">
                {/* Occasion */}
                <div>
                  <label className="block text-[13px] font-sans font-medium text-obsidian mb-4">
                    What's the occasion?
                  </label>
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                    {["Casual", "Business", "Party", "Wedding", "Resort", "Daily Wear"].map((occ) => (
                      <button
                        key={occ}
                        onClick={() => setStyleProfile({ ...styleProfile, occasion: occ })}
                        className={`px-4 py-3 text-[12px] font-sans font-medium transition-all ${
                          styleProfile.occasion === occ
                            ? "bg-obsidian text-white"
                            : "bg-white border border-slate-border text-obsidian hover:border-obsidian"
                        }`}
                      >
                        {occ}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Body Type */}
                <div>
                  <label className="block text-[13px] font-sans font-medium text-obsidian mb-4">
                    What's your body type?
                  </label>
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                    {["Pear", "Apple", "Hourglass", "Rectangle", "Inverted Triangle"].map((type) => (
                      <button
                        key={type}
                        onClick={() => setStyleProfile({ ...styleProfile, bodyType: type })}
                        className={`px-4 py-3 text-[12px] font-sans font-medium transition-all ${
                          styleProfile.bodyType === type
                            ? "bg-obsidian text-white"
                            : "bg-white border border-slate-border text-obsidian hover:border-obsidian"
                        }`}
                      >
                        {type}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Color Preference */}
                <div>
                  <label className="block text-[13px] font-sans font-medium text-obsidian mb-4">
                    Favorite colors?
                  </label>
                  <div className="grid grid-cols-3 md:grid-cols-6 gap-3">
                    {[
                      { name: "Vibrant", color: "bg-red-500" },
                      { name: "Earthy", color: "bg-amber-700" },
                      { name: "Jewel", color: "bg-purple-700" },
                      { name: "Neutral", color: "bg-gray-600" },
                      { name: "Pastels", color: "bg-pink-300" },
                      { name: "Bold", color: "bg-blue-700" },
                    ].map((col) => (
                      <button
                        key={col.name}
                        onClick={() => setStyleProfile({ ...styleProfile, colorPreference: col.name })}
                        className={`p-4 transition-all border-2 ${
                          styleProfile.colorPreference === col.name
                            ? "border-obsidian"
                            : "border-transparent"
                        }`}
                      >
                        <div className={`w-full h-8 ${col.color}`} />
                        <p className="text-[10px] font-sans text-obsidian mt-2 text-center">{col.name}</p>
                      </button>
                    ))}
                  </div>
                </div>

                {/* Budget */}
                <div>
                  <label className="block text-[13px] font-sans font-medium text-obsidian mb-4">
                    Budget per item?
                  </label>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                    {["Under ₦10K", "₦10K-₦30K", "₦30K-₦50K", "₦50K+"].map((budget) => (
                      <button
                        key={budget}
                        onClick={() => setStyleProfile({ ...styleProfile, budget })}
                        className={`px-4 py-3 text-[12px] font-sans font-medium transition-all ${
                          styleProfile.budget === budget
                            ? "bg-obsidian text-white"
                            : "bg-white border border-slate-border text-obsidian hover:border-obsidian"
                        }`}
                      >
                        {budget}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Style */}
                <div>
                  <label className="block text-[13px] font-sans font-medium text-obsidian mb-4">
                    Your style?
                  </label>
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                    {["Classic", "Modern", "Bohemian", "Minimalist", "Bold", "Eclectic"].map((style) => (
                      <button
                        key={style}
                        onClick={() => setStyleProfile({ ...styleProfile, style })}
                        className={`px-4 py-3 text-[12px] font-sans font-medium transition-all ${
                          styleProfile.style === style
                            ? "bg-obsidian text-white"
                            : "bg-white border border-slate-border text-obsidian hover:border-obsidian"
                        }`}
                      >
                        {style}
                      </button>
                    ))}
                  </div>
                </div>

                <button
                  onClick={handleQuizSubmit}
                  className="w-full h-12 bg-heritage-green text-white text-[11px] font-sans font-semibold tracking-[0.15em] uppercase hover:bg-heritage-green-600 transition-colors flex items-center justify-center gap-2"
                >
                  <Sparkles size={14} />
                  Get My Recommendations
                  <ArrowRight size={14} />
                </button>
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
                Finding your perfect pieces...
              </p>
              <p className="text-[13px] font-sans text-neutral-500 mt-2">
                Our AI is analyzing your style profile
              </p>
            </div>
          </motion.div>
        )}

        {step === "results" && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
          >
            <div className="text-center mb-12">
              <h2 className="text-display-sm font-serif italic text-obsidian mb-4">
                Your Personalized Collection
              </h2>
              <p className="text-[15px] font-sans text-neutral-600 max-w-lg mx-auto">
                Based on your preferences for {styleProfile.occasion} occasions and {styleProfile.style} style
              </p>
            </div>

            {recommendations.length > 0 ? (
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-6 mb-12">
                {recommendations.map((product) => (
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
                  No items found
                </p>
                <p className="text-[13px] font-sans text-neutral-500">
                  Try adjusting your preferences
                </p>
              </div>
            )}

            <div className="text-center">
              <button
                onClick={() => {
                  setStep("quiz");
                  setRecommendations([]);
                }}
                className="inline-flex items-center gap-2 h-12 px-8 border border-obsidian text-obsidian text-[11px] font-sans font-semibold tracking-[0.15em] uppercase hover:bg-neutral-50 transition-colors"
              >
                <Sparkles size={14} />
                Try Again
              </button>
              <Link
                href="/shop"
                className="inline-flex items-center gap-2 h-12 px-8 ml-4 bg-obsidian text-white text-[11px] font-sans font-semibold tracking-[0.15em] uppercase hover:bg-neutral-800 transition-colors"
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
