"use client";

import { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { motion } from "framer-motion";
import { ArrowLeft, Truck, Lock, AlertCircle } from "lucide-react";
import { getImagePlaceholder, formatPrice } from "@/lib/utils";

interface CartItem {
  id: string;
  name: string;
  price: number;
  quantity: number;
  image: string;
}

interface ShippingOption {
  id: string;
  name: string;
  description: string;
  price: number;
  estimatedDays: number;
  trackingAvailable: boolean;
}

const SHIPPING_OPTIONS: ShippingOption[] = [
  {
    id: "dhl-express",
    name: "DHL Express Worldwide",
    description: "Delivery within 2-4 business days",
    price: 2500000,
    estimatedDays: 4,
    trackingAvailable: true,
  },
  {
    id: "standard-courier",
    name: "Standard Courier",
    description: "Delivery within 5-9 business days",
    price: 800000,
    estimatedDays: 9,
    trackingAvailable: true,
  },
  {
    id: "lagos-same-day",
    name: "Lagos Same-Day",
    description: "Same day delivery (Lagos only)",
    price: 500000,
    estimatedDays: 0,
    trackingAvailable: true,
  },
];

const PAYMENT_METHODS = [
  { id: "paystack", name: "Paystack", icon: "💳", description: "Card, Bank Transfer, Mobile Money" },
  { id: "flutterwave", name: "Flutterwave", icon: "🌊", description: "Multiple payment options" },
  { id: "stripe", name: "Stripe", icon: "🎯", description: "International cards" },
];

export default function EnhancedCheckout() {
  const [step, setStep] = useState<"shipping" | "payment" | "review">("shipping");
  const [selectedShipping, setSelectedShipping] = useState("standard-courier");
  const [selectedPayment, setSelectedPayment] = useState("paystack");
  const [loading, setLoading] = useState(false);

  // Mock cart data
  const cartItems: CartItem[] = [
    {
      id: "1",
      name: "Ankara Dress",
      price: 15000,
      quantity: 1,
      image: getImagePlaceholder(200, 250),
    },
    {
      id: "2",
      name: "Agbada Robe",
      price: 25000,
      quantity: 1,
      image: getImagePlaceholder(200, 250),
    },
  ];

  const shippingCost = SHIPPING_OPTIONS.find((s) => s.id === selectedShipping)?.price || 0;
  const subtotal = cartItems.reduce((sum, item) => sum + item.price * item.quantity, 0);
  const tax = Math.round(subtotal * 0.1);
  const total = subtotal + tax + shippingCost;

  const handlePayment = async () => {
    setLoading(true);
    try {
      if (selectedPayment === "paystack") {
        // Initiate Paystack payment
        const response = await fetch("/api/checkout/paystack", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            amount: total,
            email: "customer@example.com",
            reference: `order_${Date.now()}`,
          }),
        });
        const data = await response.json();
        if (data.authorizationUrl) {
          window.location.href = data.authorizationUrl;
        }
      } else if (selectedPayment === "flutterwave") {
        // Initiate Flutterwave payment
        const response = await fetch("/api/checkout/flutterwave", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            amount: total,
            email: "customer@example.com",
            phone: "+234XXXXXXXXXX",
          }),
        });
        const data = await response.json();
        if (data.link) {
          window.location.href = data.link;
        }
      }
    } catch (error) {
      console.error("Payment error:", error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-white min-h-screen">
      {/* Header */}
      <div className="border-b border-slate-border">
        <div className="luxury-container py-6">
          <Link href="/shop" className="inline-flex items-center gap-2 text-[13px] font-sans text-neutral-500 hover:text-obsidian mb-4">
            <ArrowLeft size={14} />
            Back to Shopping
          </Link>
          <h1 className="text-display-md font-serif italic text-obsidian">Checkout</h1>
        </div>
      </div>

      <div className="luxury-container py-12">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
          {/* Main Content */}
          <div className="lg:col-span-2">
            {/* Step Indicator */}
            <div className="flex items-center gap-8 mb-12">
              {[
                { id: "shipping", label: "Shipping" },
                { id: "payment", label: "Payment" },
                { id: "review", label: "Review" },
              ].map((s, idx, arr) => (
                <div key={s.id} className="flex items-center gap-4">
                  <div
                    className={`w-10 h-10 rounded-full flex items-center justify-center text-[11px] font-sans font-semibold transition-all ${
                      step === s.id || arr.findIndex((x) => x.id === step) > idx
                        ? "bg-obsidian text-white"
                        : "bg-neutral-100 text-neutral-400"
                    }`}
                  >
                    {idx + 1}
                  </div>
                  <span className="text-[13px] font-sans font-medium text-neutral-600 hidden md:inline">
                    {s.label}
                  </span>
                  {idx < arr.length - 1 && (
                    <div className="hidden lg:block w-8 h-px bg-neutral-200" />
                  )}
                </div>
              ))}
            </div>

            {/* Shipping Step */}
            {step === "shipping" && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
              >
                <h2 className="text-lg font-serif text-obsidian mb-6">Select Shipping Method</h2>
                <div className="space-y-4 mb-8">
                  {SHIPPING_OPTIONS.map((option) => (
                    <label
                      key={option.id}
                      className="flex items-start gap-4 p-4 border border-slate-border cursor-pointer hover:border-obsidian transition-colors"
                    >
                      <input
                        type="radio"
                        name="shipping"
                        value={option.id}
                        checked={selectedShipping === option.id}
                        onChange={(e) => setSelectedShipping(e.target.value)}
                        className="mt-1"
                      />
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <Truck size={14} className="text-heritage-green" />
                          <p className="font-medium text-obsidian">{option.name}</p>
                        </div>
                        <p className="text-[12px] font-sans text-neutral-500">
                          {option.description}
                        </p>
                        {option.trackingAvailable && (
                          <p className="text-[11px] font-sans text-green-600 mt-1">
                            ✓ Live tracking available
                          </p>
                        )}
                      </div>
                      <p className="font-serif text-obsidian whitespace-nowrap">
                        ₦{option.price.toLocaleString()}
                      </p>
                    </label>
                  ))}
                </div>
                <button
                  onClick={() => setStep("payment")}
                  className="w-full h-12 bg-obsidian text-white text-[11px] font-sans font-semibold tracking-[0.15em] uppercase hover:bg-neutral-800 transition-colors"
                >
                  Continue to Payment
                </button>
              </motion.div>
            )}

            {/* Payment Step */}
            {step === "payment" && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
              >
                <h2 className="text-lg font-serif text-obsidian mb-6">Select Payment Method</h2>
                <div className="space-y-4 mb-8">
                  {PAYMENT_METHODS.map((method) => (
                    <label
                      key={method.id}
                      className="flex items-start gap-4 p-4 border border-slate-border cursor-pointer hover:border-obsidian transition-colors"
                    >
                      <input
                        type="radio"
                        name="payment"
                        value={method.id}
                        checked={selectedPayment === method.id}
                        onChange={(e) => setSelectedPayment(e.target.value)}
                        className="mt-1"
                      />
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <span className="text-xl">{method.icon}</span>
                          <p className="font-medium text-obsidian">{method.name}</p>
                        </div>
                        <p className="text-[12px] font-sans text-neutral-500">
                          {method.description}
                        </p>
                      </div>
                      <Lock size={14} className="text-green-600 mt-1" />
                    </label>
                  ))}
                </div>

                {/* Security Notice */}
                <div className="flex items-start gap-3 p-4 bg-green-50 border border-green-200 mb-8">
                  <Lock size={16} className="text-green-600 mt-0.5 flex-shrink-0" />
                  <div>
                    <p className="text-[12px] font-sans font-medium text-green-900">
                      Secure Payment
                    </p>
                    <p className="text-[11px] font-sans text-green-700 mt-1">
                      All transactions are encrypted and secure. Your payment information is never stored.
                    </p>
                  </div>
                </div>

                <div className="flex gap-4">
                  <button
                    onClick={() => setStep("shipping")}
                    className="flex-1 h-12 border border-obsidian text-obsidian text-[11px] font-sans font-semibold tracking-[0.15em] uppercase hover:bg-neutral-50 transition-colors"
                  >
                    Back
                  </button>
                  <button
                    onClick={() => setStep("review")}
                    className="flex-1 h-12 bg-obsidian text-white text-[11px] font-sans font-semibold tracking-[0.15em] uppercase hover:bg-neutral-800 transition-colors"
                  >
                    Review Order
                  </button>
                </div>
              </motion.div>
            )}

            {/* Review Step */}
            {step === "review" && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
              >
                <h2 className="text-lg font-serif text-obsidian mb-6">Review Your Order</h2>

                {/* Order Summary */}
                <div className="bg-neutral-50 p-6 mb-8">
                  <h3 className="font-medium text-obsidian mb-4">Order Summary</h3>
                  <div className="space-y-3 mb-4 pb-4 border-b border-slate-border">
                    {cartItems.map((item) => (
                      <div key={item.id} className="flex items-center justify-between text-[13px]">
                        <span className="text-neutral-600">{item.name} x {item.quantity}</span>
                        <span className="font-medium">₦{(item.price * item.quantity).toLocaleString()}</span>
                      </div>
                    ))}
                  </div>
                  <div className="space-y-2 text-[13px]">
                    <div className="flex justify-between">
                      <span className="text-neutral-600">Subtotal</span>
                      <span>₦{subtotal.toLocaleString()}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-neutral-600">Tax (10%)</span>
                      <span>₦{tax.toLocaleString()}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-neutral-600">
                        Shipping ({SHIPPING_OPTIONS.find((s) => s.id === selectedShipping)?.name})
                      </span>
                      <span>₦{shippingCost.toLocaleString()}</span>
                    </div>
                    <div className="flex justify-between font-serif text-lg pt-2 border-t border-slate-border">
                      <span>Total</span>
                      <span>₦{total.toLocaleString()}</span>
                    </div>
                  </div>
                </div>

                <div className="flex gap-4">
                  <button
                    onClick={() => setStep("payment")}
                    className="flex-1 h-12 border border-obsidian text-obsidian text-[11px] font-sans font-semibold tracking-[0.15em] uppercase hover:bg-neutral-50 transition-colors"
                  >
                    Back
                  </button>
                  <button
                    onClick={handlePayment}
                    disabled={loading}
                    className="flex-1 h-12 bg-heritage-green text-white text-[11px] font-sans font-semibold tracking-[0.15em] uppercase hover:bg-heritage-green-600 disabled:opacity-50 transition-colors"
                  >
                    {loading ? "Processing..." : "Complete Purchase"}
                  </button>
                </div>
              </motion.div>
            )}
          </div>

          {/* Order Summary Sidebar */}
          <div className="lg:col-span-1">
            <div className="sticky top-6 bg-neutral-50 p-6">
              <h3 className="font-serif text-lg text-obsidian mb-6">Order Summary</h3>

              <div className="space-y-4 mb-6 pb-6 border-b border-slate-border">
                {cartItems.map((item) => (
                  <div key={item.id} className="flex gap-3">
                    <Image
                      src={item.image}
                      alt={item.name}
                      width={60}
                      height={80}
                      className="object-cover"
                    />
                    <div className="flex-1 text-[12px]">
                      <p className="font-medium text-obsidian">{item.name}</p>
                      <p className="text-neutral-500">Qty: {item.quantity}</p>
                      <p className="font-medium text-obsidian mt-1">
                        ₦{(item.price * item.quantity).toLocaleString()}
                      </p>
                    </div>
                  </div>
                ))}
              </div>

              <div className="space-y-2 text-[12px] mb-6">
                <div className="flex justify-between">
                  <span className="text-neutral-600">Subtotal</span>
                  <span>₦{subtotal.toLocaleString()}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-neutral-600">Tax</span>
                  <span>₦{tax.toLocaleString()}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-neutral-600">Shipping</span>
                  <span>₦{shippingCost.toLocaleString()}</span>
                </div>
                <div className="flex justify-between font-serif text-lg pt-2 border-t border-slate-border">
                  <span>Total</span>
                  <span>₦{total.toLocaleString()}</span>
                </div>
              </div>

              {/* Trust Badges */}
              <div className="space-y-3 pt-6 border-t border-slate-border">
                <div className="flex items-center gap-2 text-[11px]">
                  <Lock size={12} className="text-green-600" />
                  <span className="text-neutral-600">Secure Checkout</span>
                </div>
                <div className="flex items-center gap-2 text-[11px]">
                  <Truck size={12} className="text-blue-600" />
                  <span className="text-neutral-600">Live Tracking</span>
                </div>
                <div className="flex items-center gap-2 text-[11px]">
                  <AlertCircle size={12} className="text-orange-600" />
                  <span className="text-neutral-600">30-Day Returns</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
