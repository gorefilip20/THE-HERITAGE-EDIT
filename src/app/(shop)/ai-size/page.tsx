"use client";

import { useState } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import { Ruler, ArrowRight, CheckCircle } from "lucide-react";

interface SizeProfile {
  height: string;
  weight: string;
  chest: string;
  waist: string;
  hips: string;
  shoeSize: string;
  previousSizes: string;
}

interface SizePrediction {
  recommended: string;
  alternatives: string[];
  confidence: number;
  tips: string[];
}

export default function AISizePrediction() {
  const [step, setStep] = useState<"input" | "results">("input");
  const [profile, setProfile] = useState<SizeProfile>({
    height: "",
    weight: "",
    chest: "",
    waist: "",
    hips: "",
    shoeSize: "",
    previousSizes: "",
  });
  const [prediction, setPrediction] = useState<SizePrediction | null>(null);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async () => {
    if (!profile.height || !profile.weight) {
      alert("Please enter at least height and weight");
      return;
    }

    setLoading(true);
    try {
      const response = await fetch("/api/ai/size-prediction", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(profile),
      });

      const data = await response.json();
      setPrediction(data.prediction);
      setStep("results");
    } catch (error) {
      console.error("Size prediction error:", error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-white min-h-screen">
      {/* Hero */}
      <section className="relative h-[35vh] min-h-[300px] bg-gradient-to-r from-heritage-green to-heritage-purple overflow-hidden">
        <div className="relative luxury-container h-full flex flex-col justify-center">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
          >
            <div className="flex items-center gap-2 mb-4">
              <Ruler size={24} className="text-white" />
              <p className="text-[11px] font-sans font-semibold tracking-[0.3em] uppercase text-white/70">
                AI-Powered Sizing
              </p>
            </div>
            <h1 className="text-display-lg md:text-display-xl font-serif italic text-white mb-4">
              Find Your Perfect Fit
            </h1>
            <p className="text-[15px] font-sans text-white/70 max-w-lg">
              Get personalized size recommendations based on your measurements and previous purchases.
            </p>
          </motion.div>
        </div>
      </section>

      <div className="luxury-container py-16">
        {step === "input" && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="max-w-2xl mx-auto"
          >
            <div className="bg-neutral-50 p-8 md:p-12">
              <h2 className="text-2xl font-serif text-obsidian mb-8">Your Measurements</h2>

              <div className="space-y-6">
                {/* Height & Weight */}
                <div className="grid grid-cols-2 gap-6">
                  <div>
                    <label className="block text-[12px] font-sans font-medium text-obsidian mb-2">
                      Height (cm)
                    </label>
                    <input
                      type="number"
                      placeholder="e.g., 170"
                      value={profile.height}
                      onChange={(e) => setProfile({ ...profile, height: e.target.value })}
                      className="w-full px-4 py-3 border border-slate-border focus:outline-none focus:border-obsidian"
                    />
                  </div>
                  <div>
                    <label className="block text-[12px] font-sans font-medium text-obsidian mb-2">
                      Weight (kg)
                    </label>
                    <input
                      type="number"
                      placeholder="e.g., 65"
                      value={profile.weight}
                      onChange={(e) => setProfile({ ...profile, weight: e.target.value })}
                      className="w-full px-4 py-3 border border-slate-border focus:outline-none focus:border-obsidian"
                    />
                  </div>
                </div>

                {/* Body Measurements */}
                <div className="grid grid-cols-3 gap-4">
                  <div>
                    <label className="block text-[12px] font-sans font-medium text-obsidian mb-2">
                      Chest (cm)
                    </label>
                    <input
                      type="number"
                      placeholder="Optional"
                      value={profile.chest}
                      onChange={(e) => setProfile({ ...profile, chest: e.target.value })}
                      className="w-full px-4 py-3 border border-slate-border focus:outline-none focus:border-obsidian"
                    />
                  </div>
                  <div>
                    <label className="block text-[12px] font-sans font-medium text-obsidian mb-2">
                      Waist (cm)
                    </label>
                    <input
                      type="number"
                      placeholder="Optional"
                      value={profile.waist}
                      onChange={(e) => setProfile({ ...profile, waist: e.target.value })}
                      className="w-full px-4 py-3 border border-slate-border focus:outline-none focus:border-obsidian"
                    />
                  </div>
                  <div>
                    <label className="block text-[12px] font-sans font-medium text-obsidian mb-2">
                      Hips (cm)
                    </label>
                    <input
                      type="number"
                      placeholder="Optional"
                      value={profile.hips}
                      onChange={(e) => setProfile({ ...profile, hips: e.target.value })}
                      className="w-full px-4 py-3 border border-slate-border focus:outline-none focus:border-obsidian"
                    />
                  </div>
                </div>

                {/* Shoe Size */}
                <div>
                  <label className="block text-[12px] font-sans font-medium text-obsidian mb-2">
                    Shoe Size
                  </label>
                  <select
                    value={profile.shoeSize}
                    onChange={(e) => setProfile({ ...profile, shoeSize: e.target.value })}
                    className="w-full px-4 py-3 border border-slate-border focus:outline-none focus:border-obsidian"
                  >
                    <option value="">Select size...</option>
                    {Array.from({ length: 15 }, (_, i) => 35 + i).map((size) => (
                      <option key={size} value={size.toString()}>
                        EU {size}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Previous Sizes */}
                <div>
                  <label className="block text-[12px] font-sans font-medium text-obsidian mb-2">
                    Sizes you usually wear (comma-separated)
                  </label>
                  <input
                    type="text"
                    placeholder="e.g., M, L, XL"
                    value={profile.previousSizes}
                    onChange={(e) => setProfile({ ...profile, previousSizes: e.target.value })}
                    className="w-full px-4 py-3 border border-slate-border focus:outline-none focus:border-obsidian"
                  />
                </div>

                <button
                  onClick={handleSubmit}
                  disabled={loading}
                  className="w-full h-12 bg-heritage-green text-white text-[11px] font-sans font-semibold tracking-[0.15em] uppercase hover:bg-heritage-green-600 disabled:opacity-50 transition-colors flex items-center justify-center gap-2"
                >
                  <Ruler size={14} />
                  {loading ? "Analyzing..." : "Get Size Recommendation"}
                  <ArrowRight size={14} />
                </button>
              </div>
            </div>
          </motion.div>
        )}

        {step === "results" && prediction && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="max-w-2xl mx-auto"
          >
            <div className="bg-green-50 border border-green-200 p-8 md:p-12 mb-8">
              <div className="flex items-start gap-4 mb-6">
                <CheckCircle className="w-8 h-8 text-green-600 flex-shrink-0 mt-1" />
                <div>
                  <h2 className="text-2xl font-serif text-green-900 mb-2">Your Recommended Size</h2>
                  <p className="text-[13px] font-sans text-green-700">
                    Based on your measurements and style profile
                  </p>
                </div>
              </div>

              <div className="bg-white p-6 mb-6">
                <p className="text-[11px] font-sans font-medium tracking-wider uppercase text-neutral-500 mb-2">
                  Primary Size
                </p>
                <p className="text-display-sm font-serif text-green-900">
                  {prediction.recommended}
                </p>
                <p className="text-[12px] font-sans text-green-700 mt-2">
                  {Math.round(prediction.confidence)}% confidence
                </p>
              </div>

              {prediction.alternatives.length > 0 && (
                <div>
                  <p className="text-[11px] font-sans font-medium tracking-wider uppercase text-neutral-500 mb-3">
                    Alternative Sizes
                  </p>
                  <div className="flex flex-wrap gap-2">
                    {prediction.alternatives.map((alt) => (
                      <span
                        key={alt}
                        className="px-4 py-2 bg-white border border-green-200 text-green-900 text-[12px] font-sans font-medium"
                      >
                        {alt}
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Tips */}
            <div className="bg-neutral-50 p-8 mb-8">
              <h3 className="text-lg font-serif text-obsidian mb-6">Sizing Tips</h3>
              <div className="space-y-3">
                {prediction.tips.map((tip, idx) => (
                  <div key={idx} className="flex gap-3">
                    <div className="w-6 h-6 rounded-full bg-heritage-green text-white flex items-center justify-center flex-shrink-0 text-[11px] font-semibold">
                      {idx + 1}
                    </div>
                    <p className="text-[13px] font-sans text-neutral-700 pt-0.5">{tip}</p>
                  </div>
                ))}
              </div>
            </div>

            <div className="flex gap-4">
              <button
                onClick={() => {
                  setStep("input");
                  setPrediction(null);
                }}
                className="flex-1 h-12 border border-obsidian text-obsidian text-[11px] font-sans font-semibold tracking-[0.15em] uppercase hover:bg-neutral-50 transition-colors"
              >
                Try Again
              </button>
              <Link
                href="/shop"
                className="flex-1 h-12 bg-obsidian text-white text-[11px] font-sans font-semibold tracking-[0.15em] uppercase hover:bg-neutral-800 transition-colors flex items-center justify-center gap-2"
              >
                Shop Now
                <ArrowRight size={14} />
              </Link>
            </div>
          </motion.div>
        )}
      </div>
    </div>
  );
}
