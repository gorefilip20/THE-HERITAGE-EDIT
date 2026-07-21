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
            className="inline-flex px-8 py-3 bg-[#0D2C22] text-white text-xs font-semibold tracking-wider uppercase hover:shadow-lg hover:shadow-[#0D2C22]/20 transition-all"
          >
            Explore Collection
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {items.map((product) => (
            <div key={product.id} className="group bg-white border border-neutral-200 overflow-hidden hover:shadow-md transition-all">
              {/* Image */}
              <Link href={`/product/${product.slug}`} className="block relative aspect-[3/4] overflow-hidden">
                {product.images[0] ? (
                  <Image
                    src={product.images[0].url}
                    alt={product.images[0].altText || product.name}
                    fill
                    className="object-cover group-hover:scale-105 transition-transform duration-500"
                  />
                ) : (
                  <div className="w-full h-full bg-neutral-100 flex items-center justify-center">
                    <ShoppingBag className="h-8 w-8 text-neutral-300" />
                  </div>
                )}
                {product.comparePriceCents && product.comparePriceCents > product.priceCents && (
                  <div className="absolute top-3 left-3 px-2 py-0.5 bg-red-500 text-white text-[9px] font-bold tracking-wider uppercase">
                    Sale
                  </div>
                )}
              </Link>

              {/* Info */}
              <div className="p-4">
                {product.brand && (
                  <p className="text-[10px] font-semibold tracking-[0.15em] uppercase text-neutral-400 mb-1">
                    {product.brand.name}
                  </p>
                )}
                <Link href={`/product/${product.slug}`}>
                  <h3 className="text-sm font-medium text-neutral-800 line-clamp-1 hover:text-[#0D2C22] transition-colors">
                    {product.name}
                  </h3>
                </Link>
                <div className="flex items-center gap-2 mt-2">
                  <span className="text-sm font-semibold text-neutral-900">{formatPrice(product.priceCents)}</span>
                  {product.comparePriceCents && product.comparePriceCents > product.priceCents && (
                    <span className="text-xs text-neutral-400 line-through">{formatPrice(product.comparePriceCents)}</span>
                  )}
                </div>

                {/* Actions */}
                <div className="flex items-center gap-2 mt-3 pt-3 border-t border-neutral-100">
                  <button
                    onClick={() => removeFromWishlist(product.id)}
                    className="flex items-center gap-1.5 px-3 py-1.5 text-[10px] font-medium text-red-500 hover:bg-red-50 transition-colors"
                  >
                    <Trash2 size={12} />
                    Remove
                  </button>
                  <Link
                    href={`/product/${product.slug}`}
                    className="flex-1 flex items-center justify-center gap-1.5 px-3 py-1.5 bg-[#0D2C22] text-white text-[10px] font-medium tracking-wider uppercase hover:bg-[#0D2C22]/90 transition-colors"
                  >
                    <ShoppingBag size={12} />
                    View
                  </Link>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
