"use client";

import { useEffect, useState, useMemo } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import { motion } from "framer-motion";
import {
  Package,
  ShieldCheck,
  Truck,
  MapPin,
  CheckCircle2,
  ExternalLink,
  ArrowLeft,
  Copy,
  Check,
} from "lucide-react";
import { cn, formatPrice, getImagePlaceholder } from "@/lib/utils";
import { Navbar } from "@/components/layout/Navbar";

/* ──────────────────────────────────────────────────────────
   TYPES
   ────────────────────────────────────────────────────────── */

interface OrderImage {
  id: string;
  url: string;
  alt: string | null;
}

interface OrderProduct {
  id: string;
  name: string;
  slug: string;
  sku: string;
  images: OrderImage[];
  brand: { name: string; slug: string };
}

interface OrderVariant {
  size: string;
  color: string | null;
}

interface OrderItem {
  id: string;
  orderId: string;
  productId: string;
  variantId: string | null;
  quantity: number;
  unitPriceCents: number;
  totalCents: number;
  product: OrderProduct;
  variant: OrderVariant | null;
}

interface ShippingAddress {
  id: string;
  firstName: string;
  lastName: string;
  line1: string;
  line2: string | null;
  city: string;
  state: string | null;
  postalCode: string;
  country: string;
  phone: string | null;
}

interface OrderUser {
  firstName: string;
  lastName: string;
  email: string;
}

interface Order {
  id: string;
  orderNumber: string;
  userId: string | null;
  guestEmail: string | null;
  status: string;
  paymentStatus: string;
  subtotalCents: number;
  shippingCents: number;
  taxCents: number;
  dutyCents: number;
  discountCents: number;
  totalCents: number;
  currency: string;
  shippingMethod: string | null;
  trackingNumber: string | null;
  trackingUrl: string | null;
  notes: string | null;
  createdAt: string;
  updatedAt: string;
  items: OrderItem[];
  shippingAddress: ShippingAddress | null;
  user: OrderUser | null;
}

/* ──────────────────────────────────────────────────────────
   MILESTONE DEFINITIONS
   ────────────────────────────────────────────────────────── */

interface Milestone {
  key: string;
  title: string;
  subtitle: string;
  icon: typeof Package;
  matchStatuses: string[];
}

const MILESTONES: Milestone[] = [
  {
    key: "received",
    title: "Order Received & Verified",
    subtitle: "Atelier Entry",
    icon: Package,
    matchStatuses: ["PENDING", "CONFIRMED"],
  },
  {
    key: "preparation",
    title: "Quality Control & Custom Packaging",
    subtitle: "Preparation",
    icon: ShieldCheck,
    matchStatuses: ["PROCESSING"],
  },
  {
    key: "transit",
    title: "Handed to DHL Express Courier",
    subtitle: "In Transit",
    icon: Truck,
    matchStatuses: ["SHIPPED"],
  },
  {
    key: "arriving",
    title: "Package Out for Local Delivery",
    subtitle: "Arriving Today",
    icon: MapPin,
    matchStatuses: [],
  },
  {
    key: "delivered",
    title: "Delivered to Residence",
    subtitle: "Completed",
    icon: CheckCircle2,
    matchStatuses: ["DELIVERED"],
  },
];

function getMilestoneIndex(status: string): number {
  const idx = MILESTONES.findIndex((m) =>
    m.matchStatuses.includes(status),
  );
  return idx === -1 ? 0 : idx;
}

/* ──────────────────────────────────────────────────────────
   HELPERS
   ────────────────────────────────────────────────────────── */

function formatDate(iso: string): string {
  return new Date(iso).toLocaleDateString("en-US", {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
  });
}

function formatDateTime(iso: string): string {
  return new Date(iso).toLocaleString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
    hour: "numeric",
    minute: "2-digit",
    hour12: true,
  });
}

function formatCountry(code: string): string {
  try {
    return new Intl.DisplayNames(["en"], { type: "region" }).of(code) ?? code;
  } catch {
    return code;
  }
}

const fadeUp = {
  initial: { opacity: 0, y: 20 },
  animate: { opacity: 1, y: 0 },
  transition: { duration: 0.5, ease: [0.16, 1, 0.3, 1] },
};

/* ──────────────────────────────────────────────────────────
   PAGE COMPONENT
   ────────────────────────────────────────────────────────── */

export default function OrderTrackingPage() {
  const params = useParams();
  const orderId = params.id as string;

  const [order, setOrder] = useState<Order | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [copiedTracking, setCopiedTracking] = useState(false);

  useEffect(() => {
    async function fetchOrder() {
      setLoading(true);
      setError(null);

      try {
        const res = await fetch(`/api/orders/${encodeURIComponent(orderId)}`);
        if (!res.ok) {
          const body = await res.json().catch(() => null);
          throw new Error(
            body?.error ?? `Order not found (${res.status})`,
          );
        }
        const data: Order = await res.json();
        setOrder(data);
      } catch (err) {
        setError(
          err instanceof Error ? err.message : "Failed to load order",
        );
      } finally {
        setLoading(false);
      }
    }

    if (orderId) fetchOrder();
  }, [orderId]);

  const activeMilestoneIndex = useMemo(
    () => (order ? getMilestoneIndex(order.status) : 0),
    [order],
  );

  const handleCopyTracking = async () => {
    if (!order?.trackingNumber) return;
    try {
      await navigator.clipboard.writeText(order.trackingNumber);
      setCopiedTracking(true);
      setTimeout(() => setCopiedTracking(false), 2000);
    } catch {
      /* clipboard not available */
    }
  };

  /* ── LOADING STATE ── */
  if (loading) {
    return (
      <>
        <Navbar />
        <main className="min-h-screen bg-ivory pt-28 lg:pt-32 pb-20">
          <div className="luxury-container max-w-4xl">
            <div className="flex flex-col items-center justify-center py-32">
              <div className="w-8 h-8 border-2 border-heritage-green/20 border-t-heritage-green rounded-full animate-spin" />
              <p className="mt-6 text-sm font-sans tracking-[0.1em] uppercase text-neutral-400">
                Retrieving your order details
              </p>
            </div>
          </div>
        </main>
      </>
    );
  }

  /* ── ERROR STATE ── */
  if (error || !order) {
    return (
      <>
        <Navbar />
        <main className="min-h-screen bg-ivory pt-28 lg:pt-32 pb-20">
          <div className="luxury-container max-w-4xl">
            <div className="flex flex-col items-center justify-center py-32 text-center">
              <div className="w-16 h-16 rounded-full bg-neutral-100 flex items-center justify-center mb-6">
                <Package size={24} strokeWidth={1.5} className="text-neutral-400" />
              </div>
              <h1 className="text-xl font-serif text-obsidian mb-3">
                Order Not Found
              </h1>
              <p className="text-sm font-sans text-neutral-500 max-w-md mb-8">
                {error ??
                  "We could not locate this order. Please verify your order number and ensure you are signed in to the correct account."}
              </p>
              <Link
                href="/shop"
                className="inline-flex items-center gap-2 text-xs font-sans font-medium tracking-[0.15em] uppercase text-heritage-green hover:text-heritage-green/80 transition-colors"
              >
                <ArrowLeft size={14} />
                Continue Shopping
              </Link>
            </div>
          </div>
        </main>
      </>
    );
  }

  /* ── COMPUTED VALUES ── */
  const isCancelled = order.status === "CANCELLED";
  const isRefunded = order.status === "REFUNDED";
  const recipientName = order.user
    ? `${order.user.firstName} ${order.user.lastName}`
    : order.shippingAddress
      ? `${order.shippingAddress.firstName} ${order.shippingAddress.lastName}`
      : "Guest";

  const statusLabel = isCancelled
    ? "Cancelled"
    : isRefunded
      ? "Refunded"
      : MILESTONES[activeMilestoneIndex]?.subtitle ?? "Processing";

  /* ── RENDER ── */
  return (
    <>
      <Navbar />
      <main className="min-h-screen bg-ivory pt-28 lg:pt-32 pb-20">
        <div className="luxury-container max-w-4xl">
          {/* ── BREADCRUMB ── */}
          <motion.nav {...fadeUp} className="mb-10">
            <Link
              href="/shop"
              className="inline-flex items-center gap-2 text-xs font-sans font-medium tracking-[0.15em] uppercase text-neutral-400 hover:text-obsidian transition-colors"
            >
              <ArrowLeft size={14} />
              Back to Shopping
            </Link>
          </motion.nav>

          {/* ── HEADER ── */}
          <motion.div
            {...fadeUp}
            transition={{ ...fadeUp.transition, delay: 0.05 }}
            className="mb-12"
          >
            <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4 mb-2">
              <div>
                <p className="text-[10px] font-sans font-semibold tracking-[0.3em] uppercase text-heritage-purple mb-2">
                  Order Tracking
                </p>
                <h1 className="text-2xl md:text-3xl font-serif text-obsidian">
                  {order.orderNumber}
                </h1>
              </div>
              <div className="text-right">
                <span
                  className={cn(
                    "inline-block px-4 py-1.5 text-[10px] font-sans font-semibold tracking-[0.2em] uppercase border",
                    isCancelled
                      ? "text-red-600 border-red-200 bg-red-50"
                      : isRefunded
                        ? "text-amber-600 border-amber-200 bg-amber-50"
                        : order.status === "DELIVERED"
                          ? "text-heritage-green border-heritage-green/20 bg-heritage-green/5"
                          : "text-obsidian border-obsidian/10 bg-white",
                  )}
                >
                  {statusLabel}
                </span>
              </div>
            </div>
            <div className="flex flex-wrap gap-x-6 gap-y-1 text-xs font-sans text-neutral-400 mt-3">
              <span>Placed {formatDate(order.createdAt)}</span>
              <span className="hidden sm:inline">·</span>
              <span>{recipientName}</span>
              <span className="hidden sm:inline">·</span>
              <span>{formatPrice(order.totalCents, order.currency)}</span>
            </div>
          </motion.div>

          {/* ── TIMELINE ── */}
          {!isCancelled && !isRefunded && (
            <motion.section
              {...fadeUp}
              transition={{ ...fadeUp.transition, delay: 0.1 }}
              className="bg-white border border-slate-border p-6 sm:p-10 mb-8"
            >
              <h2 className="text-[10px] font-sans font-semibold tracking-[0.3em] uppercase text-neutral-400 mb-10">
                Fulfillment Timeline
              </h2>

              <div className="relative ml-4 sm:ml-6">
                {/* Vertical line */}
                <div className="absolute left-[11px] top-2 bottom-2 w-[1.5px] bg-neutral-100" />

                {/* Progress fill */}
                <motion.div
                  className="absolute left-[11px] top-2 w-[1.5px] bg-heritage-green origin-top"
                  initial={{ height: 0 }}
                  animate={{
                    height:
                      activeMilestoneIndex === MILESTONES.length - 1
                        ? "100%"
                        : `${(activeMilestoneIndex / (MILESTONES.length - 1)) * 100}%`,
                  }}
                  transition={{ duration: 1, ease: [0.16, 1, 0.3, 1], delay: 0.3 }}
                />

                <div className="space-y-10">
                  {MILESTONES.map((milestone, idx) => {
                    const isCompleted = idx < activeMilestoneIndex;
                    const isActive = idx === activeMilestoneIndex;
                    const isPending = idx > activeMilestoneIndex;
                    const Icon = milestone.icon;

                    return (
                      <motion.div
                        key={milestone.key}
                        initial={{ opacity: 0, x: -12 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{
                          duration: 0.45,
                          ease: [0.16, 1, 0.3, 1],
                          delay: 0.15 + idx * 0.08,
                        }}
                        className="relative flex items-start gap-5"
                      >
                        {/* Node */}
                        <div
                          className={cn(
                            "relative z-10 flex items-center justify-center w-6 h-6 rounded-full shrink-0 transition-all duration-500",
                            isCompleted
                              ? "bg-heritage-green"
                              : isActive
                                ? "bg-heritage-green ring-4 ring-heritage-green/10"
                                : "bg-neutral-100 border border-neutral-200",
                          )}
                        >
                          {isCompleted ? (
                            <Check size={12} strokeWidth={2.5} className="text-white" />
                          ) : isActive ? (
                            <motion.div
                              className="w-2 h-2 rounded-full bg-white"
                              animate={{ scale: [1, 1.3, 1] }}
                              transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
                            />
                          ) : (
                            <div className="w-1.5 h-1.5 rounded-full bg-neutral-300" />
                          )}
                        </div>

                        {/* Content */}
                        <div className="pt-0.5 min-w-0">
                          <div className="flex items-center gap-3 mb-1">
                            <Icon
                              size={16}
                              strokeWidth={1.5}
                              className={cn(
                                "shrink-0 transition-colors duration-300",
                                isCompleted || isActive
                                  ? "text-heritage-green"
                                  : "text-neutral-300",
                              )}
                            />
                            <h3
                              className={cn(
                                "text-sm font-sans font-medium transition-colors duration-300",
                                isCompleted
                                  ? "text-obsidian/60"
                                  : isActive
                                    ? "text-obsidian"
                                    : "text-neutral-300",
                              )}
                            >
                              {milestone.title}
                            </h3>
                          </div>
                          <p
                            className={cn(
                              "text-[11px] font-sans tracking-[0.1em] uppercase ml-[28px] transition-colors duration-300",
                              isCompleted
                                ? "text-heritage-green/50"
                                : isActive
                                  ? "text-heritage-green"
                                  : "text-neutral-200",
                            )}
                          >
                            {milestone.subtitle}
                            {isActive && !isPending && (
                              <span className="ml-2 text-neutral-400 normal-case tracking-normal">
                                — {formatDateTime(order.updatedAt)}
                              </span>
                            )}
                          </p>
                        </div>
                      </motion.div>
                    );
                  })}
                </div>
              </div>
            </motion.section>
          )}

          {/* ── CANCELLED / REFUNDED BANNER ── */}
          {(isCancelled || isRefunded) && (
            <motion.div
              {...fadeUp}
              transition={{ ...fadeUp.transition, delay: 0.1 }}
              className={cn(
                "p-6 sm:p-10 mb-8 border",
                isCancelled
                  ? "bg-red-50/50 border-red-100"
                  : "bg-amber-50/50 border-amber-100",
              )}
            >
              <h2
                className={cn(
                  "text-lg font-serif mb-2",
                  isCancelled ? "text-red-700" : "text-amber-700",
                )}
              >
                {isCancelled ? "Order Cancelled" : "Order Refunded"}
              </h2>
              <p className="text-sm font-sans text-neutral-600">
                {isCancelled
                  ? "This order has been cancelled. If a payment was captured, a refund will be processed to your original payment method within 5–10 business days."
                  : "A refund has been issued to your original payment method. Please allow 5–10 business days for the funds to appear in your account."}
              </p>
              {order.notes && (
                <p className="text-xs font-sans text-neutral-500 mt-4 pt-4 border-t border-neutral-200">
                  {order.notes}
                </p>
              )}
            </motion.div>
          )}

          {/* ── LOGISTICS & TRACKING ── */}
          <motion.section
            {...fadeUp}
            transition={{ ...fadeUp.transition, delay: 0.15 }}
            className="bg-white border border-slate-border p-6 sm:p-10 mb-8"
          >
            <h2 className="text-[10px] font-sans font-semibold tracking-[0.3em] uppercase text-neutral-400 mb-8">
              Shipment Details
            </h2>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              {/* Tracking column */}
              <div className="space-y-6">
                {/* Tracking number */}
                <div>
                  <label className="block text-[10px] font-sans font-medium tracking-[0.2em] uppercase text-neutral-400 mb-2">
                    Tracking Number
                  </label>
                  {order.trackingNumber ? (
                    <div className="flex items-center gap-3">
                      <span className="text-sm font-mono font-medium text-obsidian tracking-wide">
                        {order.trackingNumber}
                      </span>
                      <button
                        onClick={handleCopyTracking}
                        className="p-1.5 text-neutral-400 hover:text-obsidian transition-colors"
                        aria-label="Copy tracking number"
                      >
                        {copiedTracking ? (
                          <Check size={14} strokeWidth={2} className="text-heritage-green" />
                        ) : (
                          <Copy size={14} strokeWidth={1.5} />
                        )}
                      </button>
                    </div>
                  ) : (
                    <p className="text-sm font-sans text-neutral-400 italic">
                      Awaiting carrier assignment
                    </p>
                  )}
                </div>

                {/* Carrier link */}
                <div>
                  <label className="block text-[10px] font-sans font-medium tracking-[0.2em] uppercase text-neutral-400 mb-2">
                    Carrier Tracking
                  </label>
                  {order.trackingUrl ? (
                    <a
                      href={order.trackingUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-2.5 px-5 py-3 bg-obsidian text-white text-xs font-sans font-medium tracking-[0.12em] uppercase hover:bg-obsidian/90 transition-colors"
                    >
                      Track with Carrier
                      <ExternalLink size={13} strokeWidth={1.5} />
                    </a>
                  ) : (
                    <p className="text-sm font-sans text-neutral-400 italic">
                      Tracking link will appear once your parcel ships
                    </p>
                  )}
                </div>

                {/* Shipping method */}
                <div>
                  <label className="block text-[10px] font-sans font-medium tracking-[0.2em] uppercase text-neutral-400 mb-2">
                    Shipping Method
                  </label>
                  <p className="text-sm font-sans text-obsidian">
                    {order.shippingMethod ?? "Standard Shipping"}
                  </p>
                </div>
              </div>

              {/* Delivery address column */}
              <div>
                <label className="block text-[10px] font-sans font-medium tracking-[0.2em] uppercase text-neutral-400 mb-2">
                  Delivery Address
                </label>
                {order.shippingAddress ? (
                  <address className="not-italic text-sm font-sans text-obsidian/80 leading-relaxed space-y-0.5">
                    <p className="font-medium text-obsidian">
                      {order.shippingAddress.firstName}{" "}
                      {order.shippingAddress.lastName}
                    </p>
                    <p>{order.shippingAddress.line1}</p>
                    {order.shippingAddress.line2 && (
                      <p>{order.shippingAddress.line2}</p>
                    )}
                    <p>
                      {order.shippingAddress.city}
                      {order.shippingAddress.state &&
                        `, ${order.shippingAddress.state}`}{" "}
                      {order.shippingAddress.postalCode}
                    </p>
                    <p>{formatCountry(order.shippingAddress.country)}</p>
                    {order.shippingAddress.phone && (
                      <p className="pt-1 text-neutral-500">
                        {order.shippingAddress.phone}
                      </p>
                    )}
                  </address>
                ) : (
                  <p className="text-sm font-sans text-neutral-400 italic">
                    Address not available
                  </p>
                )}
              </div>
            </div>
          </motion.section>

          {/* ── ITEMIZED MANIFEST ── */}
          <motion.section
            {...fadeUp}
            transition={{ ...fadeUp.transition, delay: 0.2 }}
            className="bg-white border border-slate-border p-6 sm:p-10 mb-8"
          >
            <h2 className="text-[10px] font-sans font-semibold tracking-[0.3em] uppercase text-neutral-400 mb-8">
              Shipment Manifest — {order.items.length}{" "}
              {order.items.length === 1 ? "Item" : "Items"}
            </h2>

            <div className="divide-y divide-slate-border">
              {order.items.map((item, idx) => {
                const imageUrl =
                  item.product.images[0]?.url ??
                  getImagePlaceholder(80, 100);

                return (
                  <motion.div
                    key={item.id}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{
                      duration: 0.4,
                      ease: [0.16, 1, 0.3, 1],
                      delay: 0.25 + idx * 0.06,
                    }}
                    className="flex gap-5 py-6 first:pt-0 last:pb-0"
                  >
                    {/* Product image */}
                    <Link
                      href={`/product/${item.product.slug}`}
                      className="relative w-[72px] h-[90px] sm:w-20 sm:h-[100px] bg-neutral-50 shrink-0 overflow-hidden group"
                    >
                      <Image
                        src={imageUrl}
                        alt={item.product.name}
                        fill
                        sizes="80px"
                        className="object-cover transition-transform duration-500 ease-luxury group-hover:scale-105"
                      />
                    </Link>

                    {/* Product details */}
                    <div className="flex-1 min-w-0">
                      <p className="text-[10px] font-sans font-medium tracking-[0.15em] uppercase text-neutral-400 mb-1">
                        {item.product.brand.name}
                      </p>
                      <Link
                        href={`/product/${item.product.slug}`}
                        className="text-sm font-serif text-obsidian hover:text-heritage-green transition-colors line-clamp-2"
                      >
                        {item.product.name}
                      </Link>

                      <div className="flex flex-wrap gap-x-4 gap-y-1 mt-2 text-xs font-sans text-neutral-500">
                        {item.variant?.size && (
                          <span>Size: {item.variant.size}</span>
                        )}
                        {item.variant?.color && (
                          <span>Color: {item.variant.color}</span>
                        )}
                        <span>Qty: {item.quantity}</span>
                      </div>

                      <p className="mt-1 text-[10px] font-mono text-neutral-400 tracking-wider">
                        {item.product.sku}
                      </p>
                    </div>

                    {/* Price */}
                    <div className="text-right shrink-0">
                      <p className="text-sm font-sans font-medium text-obsidian">
                        {formatPrice(item.totalCents, order.currency)}
                      </p>
                      {item.quantity > 1 && (
                        <p className="text-[11px] font-sans text-neutral-400 mt-0.5">
                          {formatPrice(item.unitPriceCents, order.currency)}{" "}
                          each
                        </p>
                      )}
                    </div>
                  </motion.div>
                );
              })}
            </div>
          </motion.section>

          {/* ── ORDER SUMMARY ── */}
          <motion.section
            {...fadeUp}
            transition={{ ...fadeUp.transition, delay: 0.25 }}
            className="bg-white border border-slate-border p-6 sm:p-10"
          >
            <h2 className="text-[10px] font-sans font-semibold tracking-[0.3em] uppercase text-neutral-400 mb-6">
              Order Summary
            </h2>

            <div className="space-y-3 text-sm font-sans">
              <div className="flex justify-between text-neutral-600">
                <span>Subtotal</span>
                <span>{formatPrice(order.subtotalCents, order.currency)}</span>
              </div>
              <div className="flex justify-between text-neutral-600">
                <span>Shipping</span>
                <span>
                  {order.shippingCents === 0
                    ? "Complimentary"
                    : formatPrice(order.shippingCents, order.currency)}
                </span>
              </div>
              {order.taxCents > 0 && (
                <div className="flex justify-between text-neutral-600">
                  <span>Tax</span>
                  <span>{formatPrice(order.taxCents, order.currency)}</span>
                </div>
              )}
              {order.dutyCents > 0 && (
                <div className="flex justify-between text-neutral-600">
                  <span>Import Duties</span>
                  <span>{formatPrice(order.dutyCents, order.currency)}</span>
                </div>
              )}
              {order.discountCents > 0 && (
                <div className="flex justify-between text-heritage-green">
                  <span>Discount</span>
                  <span>
                    −{formatPrice(order.discountCents, order.currency)}
                  </span>
                </div>
              )}
              <div className="flex justify-between pt-4 border-t border-slate-border text-obsidian font-medium">
                <span>Total</span>
                <span className="text-base">
                  {formatPrice(order.totalCents, order.currency)}
                </span>
              </div>
            </div>

            {/* Payment info */}
            <div className="mt-6 pt-6 border-t border-slate-border">
              <div className="flex items-center justify-between text-xs font-sans text-neutral-400">
                <span className="tracking-[0.1em] uppercase">
                  Payment{" "}
                  <span
                    className={cn(
                      "ml-1 px-2 py-0.5 text-[9px] font-semibold tracking-[0.15em] uppercase border",
                      order.paymentStatus === "CAPTURED"
                        ? "text-heritage-green border-heritage-green/20"
                        : order.paymentStatus === "FAILED"
                          ? "text-red-500 border-red-200"
                          : order.paymentStatus === "REFUNDED"
                            ? "text-amber-600 border-amber-200"
                            : "text-neutral-500 border-neutral-200",
                    )}
                  >
                    {order.paymentStatus}
                  </span>
                </span>
                <span>
                  Last updated {formatDateTime(order.updatedAt)}
                </span>
              </div>
            </div>
          </motion.section>

          {/* ── FOOTER ASSURANCE ── */}
          <motion.div
            {...fadeUp}
            transition={{ ...fadeUp.transition, delay: 0.3 }}
            className="mt-12 text-center"
          >
            <p className="text-[10px] font-sans tracking-[0.25em] uppercase text-neutral-300 mb-4">
              The Heritage Edit — Client Services
            </p>
            <p className="text-xs font-sans text-neutral-400 max-w-lg mx-auto leading-relaxed">
              For assistance with your order, please contact our dedicated team
              at{" "}
              <a
                href="mailto:concierge@theheritageedit.com"
                className="text-heritage-green hover:underline"
              >
                concierge@theheritageedit.com
              </a>
            </p>
          </motion.div>
        </div>
      </main>
    </>
  );
}
