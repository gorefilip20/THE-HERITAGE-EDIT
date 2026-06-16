"use client";

import Link from "next/link";
import { CheckoutForm } from "@/components/checkout/CheckoutForm";

export default function CheckoutPage() {
  return (
    <div className="min-h-screen bg-[#FBFBFA]">
      {/* Minimal checkout header */}
      <header className="border-b border-neutral-200 bg-white">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <Link
            href="/"
            className="text-base font-serif tracking-[0.12em] text-[#0D2C22]"
          >
            THE HERITAGE EDIT
          </Link>
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 rounded-full bg-emerald-500" />
            <span className="text-[10px] font-sans font-medium tracking-[0.15em] uppercase text-neutral-400">
              Secure Checkout
            </span>
          </div>
        </div>
      </header>

      <CheckoutForm />
    </div>
  );
}
