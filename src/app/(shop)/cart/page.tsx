"use client";

import Link from "next/link";
import Image from "next/image";
import { Minus, Plus, X, ShoppingBag, ArrowRight } from "lucide-react";
import { useCartStore } from "@/store/cart-store";
import { formatPrice } from "@/lib/utils";

const SHIPPING_OPTIONS = [
  { id: "lagos", label: "Lagos Same-Day", price: 500000, time: "Before 9pm" },
  { id: "standard", label: "Standard Courier", price: 800000, time: "5–9 business days" },
  { id: "dhl", label: "DHL Express Worldwide", price: 2500000, time: "2–4 business days" },
];

export default function CartPage() {
  const items = useCartStore((s) => s.items);
  const removeItem = useCartStore((s) => s.removeItem);
  const updateQuantity = useCartStore((s) => s.updateQuantity);
  const subtotalCents = useCartStore((s) => s.subtotalCents());
  const itemCount = useCartStore((s) => s.itemCount());

  const freeShippingThreshold = 50000000;
  const qualifiesForFreeShipping = subtotalCents >= freeShippingThreshold;

  if (items.length === 0) {
    return (
      <div className="luxury-container py-20 md:py-32 text-center max-w-lg mx-auto">
        <ShoppingBag className="h-16 w-16 text-neutral-200 mx-auto mb-6" />
        <h1 className="text-2xl md:text-3xl font-serif text-obsidian mb-3">Your Edit is Empty</h1>
        <p className="text-sm text-neutral-500 mb-8 leading-relaxed">
          You haven&apos;t added any pieces to your edit yet. Explore our collection to discover
          heritage craftsmanship at its finest.
        </p>
        <Link
          href="/shop"
          className="inline-flex items-center h-12 px-10 bg-[#0D2C22] text-white text-[11px] font-semibold tracking-[0.15em] uppercase hover:bg-[#163829] transition-colors"
        >
          Explore Collection
        </Link>
      </div>
    );
  }

  return (
    <div className="luxury-container py-12 md:py-20">
      <div className="mb-10">
        <p className="text-[10px] font-sans font-semibold tracking-[0.3em] uppercase text-gold mb-3">
          Shopping Bag
        </p>
        <h1 className="text-3xl md:text-4xl font-serif text-obsidian">Your Edit</h1>
        <p className="text-sm text-neutral-500 mt-1">
          {itemCount} {itemCount === 1 ? "piece" : "pieces"} in your bag
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-10 lg:gap-16">
        {/* Line Items */}
        <div className="lg:col-span-2">
          <div className="border-b border-neutral-200 pb-3 mb-6 hidden md:grid grid-cols-[2fr_1fr_1fr_1fr_auto] gap-4 text-[10px] font-sans font-semibold tracking-[0.2em] uppercase text-neutral-400">
            <span>Product</span>
            <span className="text-center">Size</span>
            <span className="text-center">Quantity</span>
            <span className="text-right">Total</span>
            <span className="w-8" />
          </div>

          <div className="space-y-0">
            {items.map((item) => (
              <div
                key={`${item.productId}-${item.variantId}`}
                className="grid grid-cols-1 md:grid-cols-[2fr_1fr_1fr_1fr_auto] gap-4 md:gap-4 items-center py-6 border-b border-neutral-100"
              >
                {/* Product */}
                <div className="flex gap-4">
                  <Link
                    href={`/product/${item.slug}`}
                    className="relative w-[100px] h-[130px] bg-[#f8f7f5] flex-shrink-0 overflow-hidden"
                  >
                    {item.imageUrl ? (
                      <Image
                        src={item.imageUrl}
                        alt={item.name}
                        fill
                        sizes="100px"
                        className="object-cover"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center">
                        <ShoppingBag className="h-6 w-6 text-neutral-300" />
                      </div>
                    )}
                  </Link>
                  <div className="flex flex-col justify-center">
                    <p className="text-[10px] font-sans font-semibold tracking-[0.2em] uppercase text-neutral-400 mb-1">
                      {item.brand}
                    </p>
                    <Link href={`/product/${item.slug}`}>
                      <h3 className="text-sm font-sans text-obsidian leading-snug hover:text-heritage-green transition-colors">
                        {item.name}
                      </h3>
                    </Link>
                    <p className="text-[13px] font-serif text-obsidian mt-1 md:hidden">
                      {formatPrice(item.priceCents)}
                    </p>
                  </div>
                </div>

                {/* Size */}
                <div className="text-center">
                  <span className="text-sm text-neutral-600">{item.size}</span>
                </div>

                {/* Quantity Stepper */}
                <div className="flex items-center justify-center">
                  <div className="flex items-center border border-neutral-200">
                    <button
                      onClick={() =>
                        updateQuantity(item.productId, item.variantId, item.quantity - 1)
                      }
                      className="w-9 h-9 flex items-center justify-center text-neutral-500 hover:text-obsidian transition-colors"
                      aria-label="Decrease quantity"
                    >
                      <Minus size={14} />
                    </button>
                    <span className="w-9 h-9 flex items-center justify-center text-sm font-medium text-obsidian border-x border-neutral-200">
                      {item.quantity}
                    </span>
                    <button
                      onClick={() =>
                        updateQuantity(item.productId, item.variantId, item.quantity + 1)
                      }
                      className="w-9 h-9 flex items-center justify-center text-neutral-500 hover:text-obsidian transition-colors"
                      aria-label="Increase quantity"
                    >
                      <Plus size={14} />
                    </button>
                  </div>
                </div>

                {/* Price */}
                <div className="text-right">
                  <span className="text-[16px] font-serif text-obsidian">
                    {formatPrice(item.priceCents * item.quantity)}
                  </span>
                </div>

                {/* Remove */}
                <div className="flex justify-end">
                  <button
                    onClick={() => removeItem(item.productId, item.variantId)}
                    className="w-8 h-8 flex items-center justify-center text-neutral-400 hover:text-red-500 transition-colors"
                    aria-label="Remove item"
                  >
                    <X size={16} />
                  </button>
                </div>
              </div>
            ))}
          </div>

          <div className="mt-6">
            <Link
              href="/shop"
              className="text-[11px] font-sans font-medium tracking-[0.1em] uppercase text-heritage-green hover:text-[#163829] transition-colors"
            >
              &larr; Continue Shopping
            </Link>
          </div>
        </div>

        {/* Order Summary Sidebar */}
        <div className="lg:col-span-1">
          <div className="bg-[#f8f7f5] p-6 md:p-8 sticky top-28">
            <h2 className="text-[11px] font-sans font-semibold tracking-[0.2em] uppercase text-neutral-400 mb-6">
              Order Summary
            </h2>

            <div className="space-y-3 mb-6">
              <div className="flex justify-between text-sm text-neutral-600">
                <span>Subtotal ({itemCount} {itemCount === 1 ? "item" : "items"})</span>
                <span className="font-serif">{formatPrice(subtotalCents)}</span>
              </div>
              <div className="flex justify-between text-sm text-neutral-600">
                <span>Shipping</span>
                <span className="text-neutral-400">Calculated at checkout</span>
              </div>
              {qualifiesForFreeShipping && (
                <p className="text-[11px] text-emerald-600 font-medium">
                  You qualify for free DHL Express shipping
                </p>
              )}
            </div>

            <div className="border-t border-neutral-200 pt-4 mb-6">
              <div className="flex justify-between items-baseline">
                <span className="text-sm font-medium text-obsidian">Estimated Total</span>
                <span className="text-xl font-serif text-obsidian">{formatPrice(subtotalCents)}</span>
              </div>
            </div>

            <Link
              href="/checkout"
              className="flex items-center justify-center gap-2 w-full h-12 bg-[#0D2C22] text-white text-[11px] font-semibold tracking-[0.15em] uppercase hover:bg-[#163829] transition-colors"
            >
              Proceed to Checkout
              <ArrowRight size={14} />
            </Link>

            <div className="mt-6 space-y-2">
              {SHIPPING_OPTIONS.map((opt) => (
                <div key={opt.id} className="flex justify-between text-[11px] text-neutral-500">
                  <span>{opt.label}</span>
                  <span>
                    {opt.id === "dhl" && qualifiesForFreeShipping
                      ? "FREE"
                      : formatPrice(opt.price)}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
