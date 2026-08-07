"use client";

import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { Suspense } from "react";
import { CheckCircle, ArrowRight, Package } from "lucide-react";

function SuccessContent() {
  const searchParams = useSearchParams();
  const orderNumber = searchParams.get("order") ?? searchParams.get("reference");
  const provider = searchParams.get("provider") ?? "flutterwave";

  return (
    <div className="min-h-[70vh] flex items-center justify-center px-4 py-20">
      <div className="max-w-lg w-full text-center">
        <div className="w-20 h-20 bg-emerald-50 flex items-center justify-center mx-auto mb-8">
          <CheckCircle size={40} strokeWidth={1.2} className="text-emerald-600" />
        </div>

        <p className="text-[10px] font-sans font-semibold tracking-[0.3em] uppercase text-gold mb-3">
          Order Confirmed
        </p>

        <h1 className="text-3xl font-serif text-obsidian mb-3">
          Thank You for Your Order
        </h1>

        <p className="text-sm font-sans text-neutral-500 mb-2">
          Your payment has been received and your order is confirmed.
        </p>

        {orderNumber && (
          <p className="text-sm font-sans text-neutral-600 mb-8">
            Order number: <span className="font-medium text-heritage-green">{orderNumber}</span>
          </p>
        )}

        <div className="bg-ivory p-6 mb-8 text-left space-y-4">
          <div className="flex items-start gap-3">
            <Package size={18} strokeWidth={1.5} className="text-heritage-green mt-0.5 shrink-0" />
            <div>
              <p className="text-sm font-sans font-medium text-obsidian">What happens next?</p>
              <ul className="text-[13px] font-sans text-neutral-500 mt-2 space-y-1.5">
                <li>You will receive an order confirmation email shortly.</li>
                <li>Our team will carefully prepare your pieces for shipping.</li>
                <li>You will receive tracking information once your order ships.</li>
              </ul>
            </div>
          </div>
        </div>

        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          {orderNumber && (
            <Link
              href="/account"
              className="inline-flex items-center justify-center h-12 px-8 bg-[#0D2C22] text-white text-[11px] font-semibold tracking-[0.15em] uppercase hover:bg-[#163829] transition-colors"
            >
              View Order
            </Link>
          )}
          <Link
            href="/shop"
            className="inline-flex items-center justify-center gap-2 h-12 px-8 border border-[#0D2C22] text-[#0D2C22] text-[11px] font-semibold tracking-[0.15em] uppercase hover:bg-neutral-50 transition-colors"
          >
            Continue Shopping
            <ArrowRight size={14} />
          </Link>
        </div>
      </div>
    </div>
  );
}

export default function CheckoutSuccessPage() {
  return (
    <Suspense fallback={
      <div className="min-h-[70vh] flex items-center justify-center">
        <div className="animate-pulse text-neutral-400 text-sm">Loading...</div>
      </div>
    }>
      <SuccessContent />
    </Suspense>
  );
}
