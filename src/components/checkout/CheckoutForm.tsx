"use client";

import { useState, useMemo } from "react";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import {
  Check,
  ChevronRight,
  Truck,
  Lock,
  Loader2,
  Mail,
  MapPin,
  ArrowLeft,
  ShieldCheck,
  Globe,
  CreditCard,
} from "lucide-react";
import { cn, formatPrice } from "@/lib/utils";
import { useCartStore } from "@/store/cart-store";
import { useCheckoutStore } from "@/store/checkout-store";

const COUNTRIES = [
  { code: "NG", name: "Nigeria" },
  { code: "US", name: "United States" },
  { code: "GB", name: "United Kingdom" },
  { code: "GH", name: "Ghana" },
  { code: "KE", name: "Kenya" },
  { code: "ZA", name: "South Africa" },
  { code: "DE", name: "Germany" },
  { code: "FR", name: "France" },
  { code: "IT", name: "Italy" },
  { code: "ES", name: "Spain" },
  { code: "NL", name: "Netherlands" },
  { code: "BE", name: "Belgium" },
  { code: "AT", name: "Austria" },
  { code: "SE", name: "Sweden" },
  { code: "DK", name: "Denmark" },
  { code: "NO", name: "Norway" },
  { code: "CH", name: "Switzerland" },
  { code: "AU", name: "Australia" },
  { code: "JP", name: "Japan" },
  { code: "SG", name: "Singapore" },
  { code: "AE", name: "United Arab Emirates" },
  { code: "CA", name: "Canada" },
  { code: "KR", name: "South Korea" },
  { code: "HK", name: "Hong Kong" },
];

const PAYSTACK_CURRENCIES: Record<string, string> = {
  NG: "NGN",
  GH: "GHS",
  KE: "KES",
  ZA: "ZAR",
  US: "USD",
};

type Step = 1 | 2 | 3;
const STEP_LABELS = ["Identity", "Shipping", "Payment"] as const;

export function CheckoutForm() {
  const items = useCartStore((s) => s.items);
  const subtotalCents = useCartStore((s) => s.subtotalCents);
  const clearCart = useCartStore((s) => s.clearCart);

  const checkout = useCheckoutStore();

  const [currentStep, setCurrentStep] = useState<Step>(1);
  const [email, setEmail] = useState(checkout.email || "");
  const [address, setAddress] = useState({
    firstName: checkout.shippingAddress?.firstName ?? "",
    lastName: checkout.shippingAddress?.lastName ?? "",
    line1: checkout.shippingAddress?.line1 ?? "",
    line2: checkout.shippingAddress?.line2 ?? "",
    city: checkout.shippingAddress?.city ?? "",
    state: checkout.shippingAddress?.state ?? "",
    postalCode: checkout.shippingAddress?.postalCode ?? "",
    country: checkout.shippingAddress?.country ?? "NG",
    phone: checkout.shippingAddress?.phone ?? "",
  });
  const [loadingShipping, setLoadingShipping] = useState(false);
  const [shippingOptions, setShippingOptions] = useState(checkout.shippingOptions);
  const [selectedShippingId, setSelectedShippingId] = useState<string | null>(
    checkout.selectedShipping?.id ?? null,
  );
  const [taxDuty, setTaxDuty] = useState(checkout.taxDuty);
  const [isProcessing, setIsProcessing] = useState(false);
  const [orderComplete, setOrderComplete] = useState(false);
  const [orderNumber, setOrderNumber] = useState<string | null>(null);
  const [paymentError, setPaymentError] = useState<string | null>(null);

  const selectedShipping = shippingOptions.find((o) => o.id === selectedShippingId) ?? null;

  const totalCents = useMemo(() => {
    let total = subtotalCents();
    if (selectedShipping) total += selectedShipping.priceCents;
    if (taxDuty) total += taxDuty.taxCents + taxDuty.dutyCents;
    return total;
  }, [subtotalCents, selectedShipping, taxDuty]);

  const currency = PAYSTACK_CURRENCIES[address.country] ?? "USD";

  const handleStep1Submit = (e: React.FormEvent) => {
    e.preventDefault();
    checkout.setEmail(email);
    setCurrentStep(2);
  };

  const handleStep2Submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoadingShipping(true);

    checkout.setShippingAddress(address);

    try {
      const res = await fetch("/api/checkout/shipping", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          country: address.country,
          state: address.state,
          subtotalCents: subtotalCents(),
        }),
      });

      if (res.ok) {
        const data = await res.json();
        setShippingOptions(data.shippingOptions ?? []);
        setTaxDuty(data.taxDuty ?? null);
        checkout.setShippingOptions(data.shippingOptions ?? []);
        if (data.taxDuty) checkout.setTaxDuty(data.taxDuty);
        if (data.shippingOptions?.length > 0) {
          setSelectedShippingId(data.shippingOptions[0].id);
          checkout.selectShipping(data.shippingOptions[0]);
        }
      }
    } finally {
      setLoadingShipping(false);
      setCurrentStep(3);
    }
  };

  const handlePaystackCheckout = async () => {
    setIsProcessing(true);
    setPaymentError(null);

    try {
      const res = await fetch("/api/checkout/paystack", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email,
          items: items.map((item) => ({
            productId: item.productId,
            variantId: item.variantId,
            quantity: item.quantity,
          })),
          shippingAddress: address,
          currency,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        setPaymentError(data.error ?? "Payment initialization failed");
        return;
      }

      checkout.setOrderNumber(data.orderNumber);
      clearCart();

      window.location.href = data.authorizationUrl;
    } catch {
      setPaymentError("Network error — please try again");
    } finally {
      setIsProcessing(false);
    }
  };

  const handleStripeCheckout = async () => {
    setIsProcessing(true);
    setPaymentError(null);

    try {
      const res = await fetch("/api/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email,
          items: items.map((item) => ({
            productId: item.productId,
            variantId: item.variantId,
            quantity: item.quantity,
          })),
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        setPaymentError(data.error ?? "Payment initialization failed");
        return;
      }

      checkout.setOrderNumber(data.orderNumber);
      clearCart();

      if (data.sessionUrl) {
        window.location.href = data.sessionUrl;
      }
    } catch {
      setPaymentError("Network error — please try again");
    } finally {
      setIsProcessing(false);
    }
  };

  if (items.length === 0 && !orderComplete) {
    return (
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-24 text-center">
        <h2 className="text-xl font-serif text-neutral-900 mb-2">
          Your bag is empty
        </h2>
        <p className="text-sm text-neutral-500 mb-6">
          Add pieces to your collection before proceeding to checkout.
        </p>
        <Link
          href="/"
          className="inline-flex items-center gap-2 text-sm font-sans font-medium text-[#0D2C22] hover:underline"
        >
          <ArrowLeft size={14} />
          Continue Shopping
        </Link>
      </div>
    );
  }

  if (orderComplete) {
    return (
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-24 text-center">
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ type: "spring", stiffness: 200, damping: 15 }}
          className="w-20 h-20 rounded-full bg-emerald-50 border-2 border-emerald-200 flex items-center justify-center mx-auto mb-6"
        >
          <Check size={32} className="text-emerald-600" />
        </motion.div>
        <h2 className="text-2xl font-serif text-neutral-900 mb-2">
          Order Confirmed
        </h2>
        <p className="text-sm text-neutral-500 mb-1">
          Thank you for your purchase from The Heritage Edit.
        </p>
        {orderNumber && (
          <p className="text-sm font-mono text-[#0D2C22] font-medium mb-8">
            Order {orderNumber}
          </p>
        )}
        <Link
          href="/"
          className="inline-flex items-center gap-2 px-6 py-3 bg-[#0D2C22] text-white text-sm font-sans font-medium hover:shadow-lg transition-all"
        >
          Continue Shopping
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      {/* Step indicator */}
      <div className="flex items-center justify-center gap-2 mb-10">
        {STEP_LABELS.map((label, idx) => {
          const stepNum = (idx + 1) as Step;
          const isActive = currentStep === stepNum;
          const isDone = currentStep > stepNum;
          return (
            <div key={label} className="flex items-center gap-2">
              {idx > 0 && (
                <div
                  className={cn(
                    "w-8 h-px",
                    isDone ? "bg-[#0D2C22]" : "bg-neutral-200",
                  )}
                />
              )}
              <div className="flex items-center gap-2">
                <div
                  className={cn(
                    "w-7 h-7 rounded-full flex items-center justify-center text-xs font-sans font-bold transition-all",
                    isDone
                      ? "bg-[#0D2C22] text-white"
                      : isActive
                        ? "bg-[#0D2C22] text-white"
                        : "bg-neutral-100 text-neutral-400",
                  )}
                >
                  {isDone ? <Check size={12} /> : stepNum}
                </div>
                <span
                  className={cn(
                    "text-xs font-sans font-medium tracking-wider uppercase hidden sm:inline",
                    isActive || isDone ? "text-neutral-900" : "text-neutral-400",
                  )}
                >
                  {label}
                </span>
              </div>
            </div>
          );
        })}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-start">
        {/* LEFT: FORM STEPS */}
        <div className="lg:col-span-7">
          <AnimatePresence mode="wait">
            {/* STEP 1: Identity / Email */}
            {currentStep === 1 && (
              <motion.div
                key="step1"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                transition={{ duration: 0.3 }}
              >
                <div className="bg-white border border-neutral-200 shadow-sm overflow-hidden">
                  <div className="px-6 py-4 border-b border-neutral-100 bg-neutral-50/50 flex items-center gap-3">
                    <Mail size={16} className="text-[#0D2C22]/50" />
                    <h2 className="text-[11px] font-sans font-semibold tracking-[0.18em] uppercase text-neutral-500">
                      Contact Information
                    </h2>
                  </div>
                  <form onSubmit={handleStep1Submit} className="p-6 space-y-5">
                    <div>
                      <label className="block text-[11px] font-sans font-medium tracking-[0.12em] uppercase text-neutral-400 mb-1.5">
                        Email Address
                      </label>
                      <input
                        type="email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        placeholder="your@email.com"
                        required
                        className="w-full h-12 px-4 border border-neutral-200 bg-white text-sm font-sans text-neutral-900 placeholder:text-neutral-300 focus:outline-none focus:border-[#0D2C22] focus:ring-1 focus:ring-[#0D2C22]/20 transition-all"
                      />
                    </div>
                    <p className="text-xs font-sans text-neutral-400 leading-relaxed">
                      We&apos;ll send your order confirmation and tracking updates
                      to this address.
                    </p>
                    <button
                      type="submit"
                      className="w-full h-12 bg-[#0D2C22] text-white text-sm font-sans font-semibold tracking-wide flex items-center justify-center gap-2 hover:shadow-lg hover:shadow-[#0D2C22]/20 transition-all active:scale-[0.98]"
                    >
                      Continue to Shipping
                      <ChevronRight size={16} />
                    </button>
                  </form>
                </div>
              </motion.div>
            )}

            {/* STEP 2: Shipping Address */}
            {currentStep === 2 && (
              <motion.div
                key="step2"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                transition={{ duration: 0.3 }}
              >
                <div className="bg-white border border-neutral-200 shadow-sm overflow-hidden">
                  <div className="px-6 py-4 border-b border-neutral-100 bg-neutral-50/50 flex items-center gap-3">
                    <MapPin size={16} className="text-[#0D2C22]/50" />
                    <h2 className="text-[11px] font-sans font-semibold tracking-[0.18em] uppercase text-neutral-500">
                      Shipping Address
                    </h2>
                  </div>
                  <form onSubmit={handleStep2Submit} className="p-6 space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block text-[11px] font-sans font-medium tracking-[0.12em] uppercase text-neutral-400 mb-1.5">
                          First Name
                        </label>
                        <input
                          type="text"
                          value={address.firstName}
                          onChange={(e) =>
                            setAddress((a) => ({ ...a, firstName: e.target.value }))
                          }
                          required
                          className="w-full h-11 px-3 border border-neutral-200 bg-white text-sm font-sans text-neutral-900 focus:outline-none focus:border-[#0D2C22] focus:ring-1 focus:ring-[#0D2C22]/20 transition-all"
                        />
                      </div>
                      <div>
                        <label className="block text-[11px] font-sans font-medium tracking-[0.12em] uppercase text-neutral-400 mb-1.5">
                          Last Name
                        </label>
                        <input
                          type="text"
                          value={address.lastName}
                          onChange={(e) =>
                            setAddress((a) => ({ ...a, lastName: e.target.value }))
                          }
                          required
                          className="w-full h-11 px-3 border border-neutral-200 bg-white text-sm font-sans text-neutral-900 focus:outline-none focus:border-[#0D2C22] focus:ring-1 focus:ring-[#0D2C22]/20 transition-all"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-[11px] font-sans font-medium tracking-[0.12em] uppercase text-neutral-400 mb-1.5">
                        Country
                      </label>
                      <div className="relative">
                        <Globe className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-neutral-400 pointer-events-none" />
                        <select
                          value={address.country}
                          onChange={(e) =>
                            setAddress((a) => ({ ...a, country: e.target.value }))
                          }
                          className="w-full h-11 pl-9 pr-4 border border-neutral-200 bg-white text-sm font-sans text-neutral-900 appearance-none focus:outline-none focus:border-[#0D2C22] focus:ring-1 focus:ring-[#0D2C22]/20 transition-all"
                        >
                          {COUNTRIES.map((c) => (
                            <option key={c.code} value={c.code}>
                              {c.name}
                            </option>
                          ))}
                        </select>
                      </div>
                    </div>

                    <div>
                      <label className="block text-[11px] font-sans font-medium tracking-[0.12em] uppercase text-neutral-400 mb-1.5">
                        Street Address
                      </label>
                      <input
                        type="text"
                        value={address.line1}
                        onChange={(e) =>
                          setAddress((a) => ({ ...a, line1: e.target.value }))
                        }
                        placeholder="123 Heritage Lane"
                        required
                        className="w-full h-11 px-3 border border-neutral-200 bg-white text-sm font-sans text-neutral-900 placeholder:text-neutral-300 focus:outline-none focus:border-[#0D2C22] focus:ring-1 focus:ring-[#0D2C22]/20 transition-all"
                      />
                    </div>
                    <input
                      type="text"
                      value={address.line2}
                      onChange={(e) =>
                        setAddress((a) => ({ ...a, line2: e.target.value }))
                      }
                      placeholder="Apartment, suite, etc. (optional)"
                      className="w-full h-11 px-3 border border-neutral-200 bg-white text-sm font-sans text-neutral-900 placeholder:text-neutral-300 focus:outline-none focus:border-[#0D2C22] focus:ring-1 focus:ring-[#0D2C22]/20 transition-all"
                    />

                    <div className="grid grid-cols-3 gap-4">
                      <div>
                        <label className="block text-[11px] font-sans font-medium tracking-[0.12em] uppercase text-neutral-400 mb-1.5">
                          City
                        </label>
                        <input
                          type="text"
                          value={address.city}
                          onChange={(e) =>
                            setAddress((a) => ({ ...a, city: e.target.value }))
                          }
                          required
                          className="w-full h-11 px-3 border border-neutral-200 bg-white text-sm font-sans text-neutral-900 focus:outline-none focus:border-[#0D2C22] focus:ring-1 focus:ring-[#0D2C22]/20 transition-all"
                        />
                      </div>
                      <div>
                        <label className="block text-[11px] font-sans font-medium tracking-[0.12em] uppercase text-neutral-400 mb-1.5">
                          State / Region
                        </label>
                        <input
                          type="text"
                          value={address.state}
                          onChange={(e) =>
                            setAddress((a) => ({ ...a, state: e.target.value }))
                          }
                          className="w-full h-11 px-3 border border-neutral-200 bg-white text-sm font-sans text-neutral-900 focus:outline-none focus:border-[#0D2C22] focus:ring-1 focus:ring-[#0D2C22]/20 transition-all"
                        />
                      </div>
                      <div>
                        <label className="block text-[11px] font-sans font-medium tracking-[0.12em] uppercase text-neutral-400 mb-1.5">
                          Postal Code
                        </label>
                        <input
                          type="text"
                          value={address.postalCode}
                          onChange={(e) =>
                            setAddress((a) => ({
                              ...a,
                              postalCode: e.target.value,
                            }))
                          }
                          required
                          className="w-full h-11 px-3 border border-neutral-200 bg-white text-sm font-sans text-neutral-900 focus:outline-none focus:border-[#0D2C22] focus:ring-1 focus:ring-[#0D2C22]/20 transition-all"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-[11px] font-sans font-medium tracking-[0.12em] uppercase text-neutral-400 mb-1.5">
                        Phone (Optional)
                      </label>
                      <input
                        type="tel"
                        value={address.phone}
                        onChange={(e) =>
                          setAddress((a) => ({ ...a, phone: e.target.value }))
                        }
                        placeholder="For delivery coordination"
                        className="w-full h-11 px-3 border border-neutral-200 bg-white text-sm font-sans text-neutral-900 placeholder:text-neutral-300 focus:outline-none focus:border-[#0D2C22] focus:ring-1 focus:ring-[#0D2C22]/20 transition-all"
                      />
                    </div>

                    <div className="flex items-center gap-3 pt-2">
                      <button
                        type="button"
                        onClick={() => setCurrentStep(1)}
                        className="h-12 px-5 border border-neutral-200 text-sm font-sans font-medium text-neutral-600 hover:bg-neutral-50 transition-colors flex items-center gap-2"
                      >
                        <ArrowLeft size={14} />
                        Back
                      </button>
                      <button
                        type="submit"
                        disabled={loadingShipping}
                        className="flex-1 h-12 bg-[#0D2C22] text-white text-sm font-sans font-semibold tracking-wide flex items-center justify-center gap-2 hover:shadow-lg hover:shadow-[#0D2C22]/20 transition-all active:scale-[0.98] disabled:opacity-50"
                      >
                        {loadingShipping ? (
                          <>
                            <Loader2 size={16} className="animate-spin" />
                            Calculating duties &amp; shipping...
                          </>
                        ) : (
                          <>
                            Continue to Payment
                            <ChevronRight size={16} />
                          </>
                        )}
                      </button>
                    </div>
                  </form>
                </div>
              </motion.div>
            )}

            {/* STEP 3: Payment */}
            {currentStep === 3 && (
              <motion.div
                key="step3"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                transition={{ duration: 0.3 }}
                className="space-y-6"
              >
                {/* Shipping options */}
                {shippingOptions.length > 0 && (
                  <div className="bg-white border border-neutral-200 shadow-sm overflow-hidden">
                    <div className="px-6 py-4 border-b border-neutral-100 bg-neutral-50/50 flex items-center gap-3">
                      <Truck size={16} className="text-[#0D2C22]/50" />
                      <h2 className="text-[11px] font-sans font-semibold tracking-[0.18em] uppercase text-neutral-500">
                        Shipping Method
                      </h2>
                    </div>
                    <div className="p-4 space-y-2">
                      {shippingOptions.map((opt) => (
                        <label
                          key={opt.id}
                          className={cn(
                            "flex items-center justify-between p-4 border cursor-pointer transition-all duration-200",
                            selectedShippingId === opt.id
                              ? "border-[#0D2C22] bg-[#0D2C22]/[0.02]"
                              : "border-neutral-100 hover:border-neutral-200",
                          )}
                        >
                          <div className="flex items-center gap-3">
                            <div
                              className={cn(
                                "w-4 h-4 rounded-full border-2 flex items-center justify-center transition-all",
                                selectedShippingId === opt.id
                                  ? "border-[#0D2C22]"
                                  : "border-neutral-300",
                              )}
                            >
                              {selectedShippingId === opt.id && (
                                <div className="w-2 h-2 rounded-full bg-[#0D2C22]" />
                              )}
                            </div>
                            <div>
                              <p className="text-sm font-sans font-medium text-neutral-900">
                                {opt.carrier} {opt.service}
                              </p>
                              <p className="text-xs font-sans text-neutral-400">
                                {opt.estimatedDays} business day{opt.estimatedDays !== 1 ? "s" : ""}
                              </p>
                            </div>
                          </div>
                          <span className="text-sm font-sans font-medium tabular-nums text-neutral-900">
                            {opt.priceCents === 0
                              ? "Complimentary"
                              : formatPrice(opt.priceCents)}
                          </span>
                          <input
                            type="radio"
                            name="shipping"
                            value={opt.id}
                            checked={selectedShippingId === opt.id}
                            onChange={() => {
                              setSelectedShippingId(opt.id);
                              checkout.selectShipping(opt);
                            }}
                            className="sr-only"
                          />
                        </label>
                      ))}
                    </div>
                  </div>
                )}

                {/* Payment method selection */}
                <div className="bg-white border border-neutral-200 shadow-sm overflow-hidden">
                  <div className="px-6 py-4 border-b border-neutral-100 bg-neutral-50/50 flex items-center gap-3">
                    <CreditCard size={16} className="text-[#0D2C22]/50" />
                    <h2 className="text-[11px] font-sans font-semibold tracking-[0.18em] uppercase text-neutral-500">
                      Choose Payment Method
                    </h2>
                    <Lock size={12} className="text-emerald-500 ml-auto" />
                  </div>
                  <div className="p-6 space-y-4">
                    {paymentError && (
                      <div className="p-4 bg-red-50 border border-red-200 text-sm font-sans text-red-700">
                        {paymentError}
                      </div>
                    )}

                    {/* Paystack — Primary */}
                    <button
                      onClick={handlePaystackCheckout}
                      disabled={isProcessing}
                      className="w-full h-14 bg-gradient-to-r from-[#0D2C22] to-[#2E1A47] text-white text-sm font-sans font-semibold tracking-wide flex items-center justify-center gap-3 hover:shadow-lg hover:shadow-[#0D2C22]/20 transition-all active:scale-[0.98] disabled:opacity-50"
                    >
                      {isProcessing ? (
                        <>
                          <Loader2 size={16} className="animate-spin" />
                          Redirecting to Paystack...
                        </>
                      ) : (
                        <>
                          <Lock size={14} />
                          Pay {formatPrice(totalCents, currency)} with Paystack
                        </>
                      )}
                    </button>

                    <div className="relative flex items-center gap-4">
                      <div className="flex-1 h-px bg-neutral-200" />
                      <span className="text-[10px] font-sans font-medium tracking-[0.15em] uppercase text-neutral-300">
                        or
                      </span>
                      <div className="flex-1 h-px bg-neutral-200" />
                    </div>

                    {/* Stripe — Secondary */}
                    <button
                      onClick={handleStripeCheckout}
                      disabled={isProcessing}
                      className="w-full h-12 border border-neutral-200 bg-white text-obsidian text-sm font-sans font-medium tracking-wide flex items-center justify-center gap-3 hover:bg-neutral-50 transition-all active:scale-[0.98] disabled:opacity-50"
                    >
                      <CreditCard size={14} className="text-neutral-400" />
                      Pay with Card (Stripe)
                    </button>

                    <div className="flex items-center gap-3 pt-2">
                      <button
                        type="button"
                        onClick={() => setCurrentStep(2)}
                        className="h-12 px-5 border border-neutral-200 text-sm font-sans font-medium text-neutral-600 hover:bg-neutral-50 transition-colors flex items-center gap-2"
                      >
                        <ArrowLeft size={14} />
                        Back
                      </button>
                    </div>

                    <div className="flex items-center justify-center gap-2 pt-2">
                      <ShieldCheck size={13} className="text-neutral-300" />
                      <span className="text-[10px] font-sans text-neutral-300 tracking-wide">
                        256-bit SSL encrypted &middot; PCI-DSS compliant
                      </span>
                    </div>
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* RIGHT: ORDER SUMMARY */}
        <div className="lg:col-span-5">
          <div className="lg:sticky lg:top-24 bg-white border border-neutral-200 shadow-sm overflow-hidden">
            <div className="px-6 py-4 border-b border-neutral-100 bg-neutral-50/50">
              <h2 className="text-[11px] font-sans font-semibold tracking-[0.18em] uppercase text-neutral-500">
                Order Summary
              </h2>
            </div>

            <div className="px-6 py-4 space-y-4 max-h-[320px] overflow-y-auto">
              {items.map((item) => (
                <div key={`${item.productId}-${item.variantId}`} className="flex gap-4">
                  <div className="w-16 h-20 overflow-hidden bg-neutral-100 shrink-0">
                    {item.imageUrl && (
                      <img
                        src={item.imageUrl}
                        alt={item.name}
                        className="w-full h-full object-cover"
                      />
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-[10px] font-sans font-medium tracking-[0.15em] uppercase text-[#2E1A47]">
                      {item.brand}
                    </p>
                    <p className="text-sm font-sans text-neutral-900 truncate">
                      {item.name}
                    </p>
                    <p className="text-xs font-sans text-neutral-400 mt-0.5">
                      Size: {item.size} &middot; Qty: {item.quantity}
                    </p>
                  </div>
                  <span className="text-sm font-sans font-medium tabular-nums text-neutral-900 shrink-0">
                    {formatPrice(item.priceCents * item.quantity)}
                  </span>
                </div>
              ))}
            </div>

            <div className="px-6 py-4 border-t border-neutral-100 space-y-2.5">
              <div className="flex justify-between text-sm font-sans">
                <span className="text-neutral-500">Retail Subtotal</span>
                <span className="tabular-nums text-neutral-900">
                  {formatPrice(subtotalCents())}
                </span>
              </div>

              {taxDuty && taxDuty.taxCents > 0 && (
                <div className="flex justify-between text-sm font-sans">
                  <span className="text-neutral-500">
                    Tax ({taxDuty.country})
                  </span>
                  <span className="tabular-nums text-neutral-900">
                    {formatPrice(taxDuty.taxCents)}
                  </span>
                </div>
              )}

              {taxDuty && taxDuty.dutyCents > 0 && (
                <div className="flex justify-between text-sm font-sans">
                  <span className="text-neutral-500">
                    Import Duties ({taxDuty.country})
                  </span>
                  <span className="tabular-nums text-neutral-900">
                    {formatPrice(taxDuty.dutyCents)}
                  </span>
                </div>
              )}

              {selectedShipping && (
                <div className="flex justify-between text-sm font-sans">
                  <span className="text-neutral-500">
                    {selectedShipping.carrier} Shipping
                  </span>
                  <span className="tabular-nums text-neutral-900">
                    {selectedShipping.priceCents === 0
                      ? "Complimentary"
                      : formatPrice(selectedShipping.priceCents)}
                  </span>
                </div>
              )}

              <div className="pt-3 border-t border-neutral-100 flex justify-between">
                <span className="text-sm font-sans font-semibold text-neutral-900">
                  Total
                </span>
                <span className="text-lg font-sans font-semibold tabular-nums text-neutral-900">
                  {formatPrice(totalCents, currency)}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
