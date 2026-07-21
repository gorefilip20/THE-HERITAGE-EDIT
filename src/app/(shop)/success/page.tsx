"use client";

import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { Suspense } from "react";
import { CheckCircle, ArrowRight, Package } from "lucide-react";

function SuccessContent() {
  const searchParams = useSearchParams();
  const orderNumber = searchParams.get("order") ?? searchParams.get("reference");

  return (
    <div className="min-h-[70vh] flex items-center justify-center px-4 py-20">
      <div className="max-w-lg w-full text-center">
        <div className="w-20 h-20 bg-heritage-green/10 flex items-center justify-center mx-auto mb-8">
          <CheckCircle size={40} strokeWidth={1.2} className="text-heritage-green" />
        </div>

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
          <Link
            href="/shop"
            className="luxury-button-primary gap-2"
          >
            Continue Shopping
            <ArrowRight size={14} />
          </Link>
          <Link
            href="/account/orders"
            className="luxury-button-secondary"
          >
            View Your Orders
          </Link>
        </div>
      </div>
    </div>
  );
}

export default function SuccessPage() {
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
