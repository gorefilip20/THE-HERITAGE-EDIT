"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { Heart, Trash2, ShoppingBag, Loader2 } from "lucide-react";
import { formatPrice, getImagePlaceholder } from "@/lib/utils";
import { useCartStore } from "@/store/cart-store";

interface WishlistProduct {
  id: string;
  name: string;
  slug: string;
  priceCents: number;
  comparePriceCents: number | null;
  brand: { name: string } | null;
  images: Array<{ url: string; altText: string | null }>;
  variants: Array<{ id: string; size: string; stock: number }>;
}

export default function WishlistPage() {
  const [items, setItems] = useState<WishlistProduct[]>([]);
  const [loading, setLoading] = useState(true);
  const addItem = useCartStore((s) => s.addItem);

  useEffect(() => {
    fetchWishlist();
  }, []);

  async function fetchWishlist() {
    try {
      const res = await fetch("/api/wishlist");
      if (res.ok) {
        const data = await res.json();
        setItems(data.items ?? []);
      }
    } catch (err) {
      console.error("Failed to fetch wishlist:", err);
    } finally {
      setLoading(false);
    }
  }

  async function removeFromWishlist(productId: string) {
    try {
      await fetch(`/api/wishlist?productId=${productId}`, { method: "DELETE" });
      setItems(items.filter((item) => item.id !== productId));
    } catch (err) {
      console.error("Failed to remove from wishlist:", err);
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="h-6 w-6 animate-spin text-[#0D2C22]" />
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <div className="mb-10">
        <p className="text-[10px] font-sans font-semibold tracking-[0.3em] uppercase text-gold mb-3">
          Saved Pieces
        </p>
        <h1 className="text-display-sm font-serif text-[#0D2C22] mb-2">My Wishlist</h1>
        <p className="text-sm font-sans text-neutral-500">
          {items.length} {items.length === 1 ? "item" : "items"} saved
        </p>
      </div>

      {items.length === 0 ? (
        <div className="bg-white border border-neutral-200 p-16 text-center">
          <Heart className="h-12 w-12 text-neutral-300 mx-auto mb-4" />
          <h2 className="text-lg font-serif text-neutral-800 mb-2">Your wishlist is empty</h2>
          <p className="text-sm text-neutral-500 mb-6 max-w-md mx-auto">
            Save your favorite pieces to revisit later. Click the heart icon on any product to add it here.
          </p>
          <Link
            href="/shop"
            className="inline-flex items-center h-12 px-8 bg-[#0D2C22] text-white text-[11px] font-semibold tracking-[0.15em] uppercase hover:bg-[#163829] transition-colors"
          >
            Explore Collection
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-6">
          {items.map((product) => (
            <div key={product.id} className="group">
              {/* Image */}
              <Link href={`/product/${product.slug}`} className="block relative aspect-[3/4] bg-[#f8f7f5] overflow-hidden mb-4">
                {product.images[0] ? (
                  <Image
                    src={product.images[0].url}
                    alt={product.images[0].altText || product.name}
                    fill
                    sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"
                    className="object-cover group-hover:scale-[1.04] transition-transform duration-700"
                  />
                ) : (
                  <div className="w-full h-full bg-neutral-100 flex items-center justify-center">
                    <ShoppingBag className="h-8 w-8 text-neutral-300" />
                  </div>
                )}
                {product.comparePriceCents && product.comparePriceCents > product.priceCents && (
                  <span className="absolute top-3 left-3 px-2.5 py-1 bg-red-600 text-white text-[10px] font-sans font-semibold tracking-wider uppercase">
                    Sale
                  </span>
                )}
                <button
                  onClick={(e) => {
                    e.preventDefault();
                    removeFromWishlist(product.id);
                  }}
                  className="absolute top-3 right-3 w-8 h-8 bg-white/90 backdrop-blur-sm flex items-center justify-center hover:bg-white transition-colors"
                  aria-label="Remove from wishlist"
                >
                  <Heart size={14} fill="#ef4444" className="text-red-500" />
                </button>
              </Link>

              {/* Info */}
              <div className="space-y-1.5">
                {product.brand && (
                  <p className="text-[10px] font-sans font-semibold tracking-[0.2em] uppercase text-neutral-500">
                    {product.brand.name}
                  </p>
                )}
                <Link href={`/product/${product.slug}`}>
                  <h3 className="text-[14px] font-sans text-obsidian leading-snug line-clamp-2 group-hover:text-heritage-green transition-colors duration-300">
                    {product.name}
                  </h3>
                </Link>
                <div className="flex items-center gap-2">
                  <span className="text-[16px] font-serif text-obsidian">{formatPrice(product.priceCents)}</span>
                  {product.comparePriceCents && product.comparePriceCents > product.priceCents && (
                    <span className="text-[14px] font-sans text-neutral-400 line-through">{formatPrice(product.comparePriceCents)}</span>
                  )}
                </div>
                <Link
                  href={`/product/${product.slug}`}
                  className="inline-flex items-center gap-1.5 mt-1 text-[11px] font-sans font-medium tracking-[0.1em] uppercase text-heritage-green hover:text-[#163829] transition-colors"
                >
                  <ShoppingBag size={12} />
                  Move to Bag
                </Link>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
