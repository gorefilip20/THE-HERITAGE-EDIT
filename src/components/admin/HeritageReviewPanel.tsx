"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import {
  Check,
  RefreshCw,
  Edit3,
  Eye,
  Loader2,
  Sparkles,
} from "lucide-react";
import type { Product, HeritageNarrative } from "@/types";

interface HeritageReviewPanelProps {
  product: Product;
  onApproved: () => void;
}

export function HeritageReviewPanel({
  product,
  onApproved,
}: HeritageReviewPanelProps) {
  const heritage = product.heritage;
  const [isEditing, setIsEditing] = useState(false);
  const [isRegenerating, setIsRegenerating] = useState(false);
  const [isApproving, setIsApproving] = useState(false);
  const [editData, setEditData] = useState({
    historyAndHeritage: heritage?.historyAndHeritage ?? "",
    whenToWear: heritage?.whenToWear ?? "",
    rightOccasion: heritage?.rightOccasion ?? [],
    styleRecommendations: heritage?.styleRecommendations ?? [],
  });

  const handleRegenerate = async () => {
    setIsRegenerating(true);
    try {
      const res = await fetch(`/api/products/${product.id}/heritage`, {
        method: "POST",
      });
      if (res.ok) {
        const data = await res.json();
        setEditData({
          historyAndHeritage: data.historyAndHeritage,
          whenToWear: data.whenToWear,
          rightOccasion: data.rightOccasion,
          styleRecommendations: data.styleRecommendations,
        });
      }
    } finally {
      setIsRegenerating(false);
    }
  };

  const handleApprove = async () => {
    setIsApproving(true);
    try {
      const res = await fetch(`/api/products/${product.id}/heritage`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...editData,
          isApproved: true,
        }),
      });
      if (res.ok) {
        onApproved();
      }
    } finally {
      setIsApproving(false);
    }
  };

  if (!heritage) {
    return (
      <div className="p-8 text-center bg-ivory border border-slate-border">
        <Sparkles className="mx-auto mb-3 text-neutral-300" size={32} />
        <p className="text-sm font-sans text-neutral-500">
          Heritage narrative is being generated...
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Status bar */}
      <div className="flex items-center justify-between p-4 bg-ivory border border-slate-border">
        <div className="flex items-center gap-3">
          <div
            className={`w-2 h-2 rounded-full ${
              heritage.isApproved ? "bg-green-500" : "bg-amber-400"
            }`}
          />
          <span className="text-xs font-sans font-medium tracking-wider uppercase text-neutral-500">
            {heritage.isApproved
              ? "Approved & Live"
              : product.status === "AI_PENDING"
                ? "AI Generating..."
                : "Pending Review"}
          </span>
          <span className="text-xs font-sans text-neutral-300">
            via {heritage.aiModelUsed}
          </span>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => setIsEditing(!isEditing)}
            className="luxury-button-ghost text-xs gap-1"
          >
            {isEditing ? <Eye size={14} /> : <Edit3 size={14} />}
            {isEditing ? "Preview" : "Edit"}
          </button>
          <button
            onClick={handleRegenerate}
            disabled={isRegenerating}
            className="luxury-button-ghost text-xs gap-1"
          >
            <RefreshCw
              size={14}
              className={isRegenerating ? "animate-spin" : ""}
            />
            Regenerate
          </button>
        </div>
      </div>

      {/* Heritage content */}
      <div className="space-y-6">
        <div>
          <label className="luxury-label">Heritage & History</label>
          {isEditing ? (
            <textarea
              value={editData.historyAndHeritage}
              onChange={(e) =>
                setEditData((prev) => ({
                  ...prev,
                  historyAndHeritage: e.target.value,
                }))
              }
              className="luxury-input h-48 py-3 resize-y"
            />
          ) : (
            <div className="p-4 bg-white border border-slate-border text-sm font-serif text-obsidian/80 leading-relaxed whitespace-pre-wrap">
              {editData.historyAndHeritage}
            </div>
          )}
        </div>

        <div>
          <label className="luxury-label">When to Wear</label>
          {isEditing ? (
            <textarea
              value={editData.whenToWear}
              onChange={(e) =>
                setEditData((prev) => ({
                  ...prev,
                  whenToWear: e.target.value,
                }))
              }
              className="luxury-input h-32 py-3 resize-y"
            />
          ) : (
            <div className="p-4 bg-white border border-slate-border text-sm font-serif text-obsidian/80 leading-relaxed whitespace-pre-wrap">
              {editData.whenToWear}
            </div>
          )}
        </div>

        <div>
          <label className="luxury-label">Right Occasions</label>
          <div className="flex flex-wrap gap-2">
            {editData.rightOccasion.map((occ, idx) => (
              <span
                key={idx}
                className="inline-flex items-center gap-1 px-3 py-1.5 bg-heritage-green/5 text-sm font-sans text-heritage-green border border-heritage-green/10"
              >
                {occ}
              </span>
            ))}
          </div>
        </div>

        <div>
          <label className="luxury-label">Style Recommendations</label>
          <div className="flex flex-wrap gap-2">
            {editData.styleRecommendations.map((rec, idx) => (
              <span
                key={idx}
                className="inline-flex items-center gap-1 px-3 py-1.5 bg-heritage-purple/5 text-sm font-sans text-heritage-purple border border-heritage-purple/10"
              >
                {rec}
              </span>
            ))}
          </div>
        </div>
      </div>

      {/* Action buttons */}
      {!heritage.isApproved && (
        <div className="flex gap-3 pt-4 border-t border-slate-border">
          <button
            onClick={handleApprove}
            disabled={isApproving}
            className="luxury-button-primary gap-2"
          >
            {isApproving ? (
              <Loader2 size={16} className="animate-spin" />
            ) : (
              <Check size={16} />
            )}
            Approve & Push Live
          </button>
        </div>
      )}
    </div>
  );
}
