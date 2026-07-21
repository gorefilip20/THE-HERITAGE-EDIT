"use client";

import { Fragment } from "react";
import Link from "next/link";
import Image from "next/image";
import { motion, AnimatePresence } from "framer-motion";
import { X, Minus, Plus, ShoppingBag, ArrowRight } from "lucide-react";
import { useCartStore } from "@/store/cart-store";
import { formatPrice, getImagePlaceholder } from "@/lib/utils";

export function CartDrawer() {
  const {
    items,
    isOpen,
    closeCart,
    removeItem,
    updateQuantity,
    subtotalCents,
    itemCount,
  } = useCartStore();

  const subtotal = subtotalCents();
  const count = itemCount();

  return (
    <AnimatePresence>
      {isOpen && (
        <Fragment>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3 }}
            className="fixed inset-0 bg-black/30 z-50"
            onClick={closeCart}
          />

          {/* Drawer */}
          <motion.aside
            initial={{ x: "100%" }}
            animate={{ x: 0 }}
            exit={{ x: "100%" }}
            transition={{ type: "spring", damping: 25, stiffness: 200 }}
            className="fixed top-0 right-0 bottom-0 w-full max-w-md bg-white z-50 flex flex-col shadow-2xl"
          >
            {/* Header */}
            <div className="flex items-center justify-between px-6 h-16 border-b border-slate-border shrink-0">
              <div className="flex items-center gap-3">
                <ShoppingBag size={18} strokeWidth={1.5} />
                <span className="text-sm font-sans font-medium tracking-wider uppercase">
                  Your Edit
                </span>
                <span className="text-xs font-sans text-neutral-400">
                  ({count})
                </span>
              </div>
              <button
                onClick={closeCart}
                className="p-2 -mr-2 text-obsidian/60 hover:text-obsidian transition-colors"
                aria-label="Close cart"
              >
                <X size={18} />
              </button>
            </div>

            {/* Items */}
            {items.length === 0 ? (
              <div className="flex-1 flex flex-col items-center justify-center gap-4 px-6">
                <ShoppingBag size={48} strokeWidth={0.8} className="text-neutral-200" />
                <p className="text-sm font-sans text-neutral-400">
                  Your edit is empty
                </p>
                <button onClick={closeCart} className="luxury-button-secondary">
                  Continue Shopping
                </button>
              </div>
            ) : (
              <div className="flex-1 overflow-y-auto px-6 py-4 space-y-6">
                {items.map((item) => (
                  <motion.div
                    key={`${item.productId}-${item.variantId}`}
                    layout
                    exit={{ opacity: 0, x: 50 }}
                    className="flex gap-4"
                  >
                    {/* Image */}
                    <Link
                      href={`/product/${item.slug}`}
                      onClick={closeCart}
                      className="relative w-20 aspect-[3/4] bg-ivory shrink-0 overflow-hidden"
                    >
                      <Image
                        src={item.imageUrl || getImagePlaceholder(160, 213)}
                        alt={item.name}
                        fill
                        sizes="80px"
                        className="object-cover"
                      />
                    </Link>

                    {/* Details */}
                    <div className="flex-1 min-w-0">
                      <p className="text-[10px] font-sans font-medium tracking-[0.12em] uppercase text-neutral-400 mb-0.5">
                        {item.brand}
                      </p>
                      <Link
                        href={`/product/${item.slug}`}
                        onClick={closeCart}
                        className="text-sm font-sans text-obsidian line-clamp-1 hover:text-heritage-green transition-colors"
                      >
                        {item.name}
                      </Link>
                      <p className="text-xs font-sans text-neutral-400 mt-0.5">
                        Size: {item.size}
                        {item.color ? ` / ${item.color}` : ""}
                      </p>

                      <div className="flex items-center justify-between mt-3">
                        {/* Quantity controls */}
                        <div className="flex items-center border border-slate-border">
                          <button
                            onClick={() =>
                              updateQuantity(
                                item.productId,
                                item.variantId,
                                item.quantity - 1,
                              )
                            }
                            className="w-8 h-8 flex items-center justify-center text-obsidian/60 hover:text-obsidian transition-colors"
                          >
                            <Minus size={12} />
                          </button>
                          <span className="w-8 h-8 flex items-center justify-center text-xs font-sans font-medium">
                            {item.quantity}
                          </span>
                          <button
                            onClick={() =>
                              updateQuantity(
                                item.productId,
                                item.variantId,
                                item.quantity + 1,
                              )
                            }
                            className="w-8 h-8 flex items-center justify-center text-obsidian/60 hover:text-obsidian transition-colors"
                          >
                            <Plus size={12} />
                          </button>
                        </div>

                        <span className="product-price text-sm">
                          {formatPrice(item.priceCents * item.quantity)}
                        </span>
                      </div>
                    </div>

                    {/* Remove */}
                    <button
                      onClick={() => removeItem(item.productId, item.variantId)}
                      className="self-start p-1 text-neutral-300 hover:text-obsidian transition-colors"
                      aria-label={`Remove ${item.name}`}
                    >
                      <X size={14} />
                    </button>
                  </motion.div>
                ))}
              </div>
            )}

            {/* Footer */}
            {items.length > 0 && (
              <div className="border-t border-slate-border px-6 py-5 space-y-4 shrink-0 bg-white">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-sans font-medium tracking-wider uppercase text-neutral-500">
                    Subtotal
                  </span>
                  <span className="product-price text-lg font-medium">
                    {formatPrice(subtotal)}
                  </span>
                </div>
                <p className="text-[11px] font-sans text-neutral-400">
                  Shipping, taxes, and duties calculated at checkout
                </p>
                <Link
                  href="/checkout"
                  onClick={closeCart}
                  className="luxury-button-primary w-full gap-2"
                >
                  Proceed to Checkout
                  <ArrowRight size={14} />
                </Link>
                <button
                  onClick={closeCart}
                  className="luxury-button-ghost w-full text-xs"
                >
                  Continue Shopping
                </button>
              </div>
            )}
          </motion.aside>
        </Fragment>
      )}
    </AnimatePresence>
  );
}
