"use client";

import { useEffect, useState, Suspense } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { Loader2, CheckCircle2, Package, ShoppingBag, Mail } from "lucide-react";
import { formatPrice } from "@/lib/utils";

/* ──────────────────────────────────────────────────────────
   POST-PAYMENT SUCCESS PAGE
   Expected query params (set by the payment providers):
     ?provider=paystack&order=<orderNumber>
   The buyer's email is retrieved from the checkout store so
   the public lookup API can verify ownership without login.
   ────────────────────────────────────────────────────────── */
interface OrderLine {
  productName: string;
  productSlug: string;
  sku: string;
  size: string | null;
  color: string | null;
  quantity: number;
  unitPriceCents: number;
  image: string | null;
}

interface OrderSummary {
  id: string;
  orderNumber: string;
  status: string;
  paymentStatus: string;
  totalCents: number;
  currency: string;
  createdAt: string;
  guestEmail: string | null;
  items: OrderLine[];
}

interface CheckoutSnapshot {
  email: string;
  orderNumber: string;
  clearedAt: number;
}

const CHECKOUT_KEY = "heritage-checkout-success";

export default function SuccessPage() {
  return (
    <Suspense fallback={<SuccessFallback />}>
      <SuccessContent />
    </Suspense>
  );
}

function SuccessContent() {
  const searchParams = useSearchParams();
  const orderNumber = searchParams.get("order");
  const provider = searchParams.get("provider") ?? "paystack";

  const [order, setOrder] = useState<OrderSummary | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let snapshot: CheckoutSnapshot | null = null;
    try {
      snapshot = JSON.parse(localStorage.getItem(CHECKOUT_KEY) ?? "null");
    } catch {
      snapshot = null;
    }

    const email = snapshot?.email ?? "";
    const orderRef = orderNumber ?? snapshot?.orderNumber ?? "";

    if (!orderRef) {
      setLoading(false);
      setError("No order reference found in this page's address.");
      return;
    }

    const params = new URLSearchParams({ orderNumber: orderRef });
    if (email) params.set("email", email);

    fetch(`/api/orders/lookup?${params.toString()}`)
      .then((r) => r.json())
      .then((data) => {
        if (data.order) {
          setOrder(data.order);
        } else {
          setError(data.error ?? "We could not find this order.");
        }
      })
      .catch(() => setError("Network error — please check your email for confirmation."))
      .finally(() => setLoading(false));
  }, [orderNumber]);

  return (
    <div className="min-h-screen bg-ivory flex items-center justify-center px-5 py-16">
      <div className="w-full max-w-[560px] bg-white border border-slate-border">
        {/* Header */}
        <div className="px-8 py-8 border-b border-slate-border text-center bg-[#F6FBF6]">
          {loading ? (
            <Loader2 className="w-10 h-10 animate-spin text-heritage-green mx-auto mb-3" />
          ) : error ? (
            <Package className="w-10 h-10 text-neutral-400 mx-auto mb-3" />
          ) : (
            <CheckCircle2 className="w-10 h-10 text-heritage-green mx-auto mb-3" />
          )}
          <p className="text-[10px] font-sans font-semibold tracking-[0.3em] uppercase text-heritage-green/50 mb-2">
            Order {provider === "stripe" ? "via Stripe" : provider === "flutterwave" ? "via Flutterwave" : "Confirmed"}
          </p>
          <h1 className="font-serif italic text-[26px] text-obsidian">
            {loading ? "Verifying your order…" : error ? "Order Lookup" : "Thank You"}
          </h1>
        </div>

        <div className="p-8">
          {loading ? (
            <p className="text-sm text-neutral-500 text-center py-6">
              Please wait while we confirm your payment…
            </p>
          ) : error ? (
            <div className="text-center py-4">
              <p className="text-sm text-neutral-600 mb-4">{error}</p>
              <p className="text-xs text-neutral-400 mb-6">
                If you were charged, a confirmation email is on its way. You can
                also check your order history once signed in.
              </p>
              <Link
                href="/"
                className="inline-flex h-12 items-center px-8 bg-heritage-green text-white text-[11px] font-sans font-semibold tracking-[0.2em] uppercase hover:bg-[#124534] transition-colors"
              >
                Continue Shopping
              </Link>
            </div>
          ) : order ? (
            <>
              <p className="text-sm text-neutral-600 text-center">
                Your order{" "}
                <span className="font-semibold text-obsidian">{order.orderNumber}</span>{" "}
                has been received and is being prepared with care.
              </p>

              <div className="mt-6 rounded-lg border border-neutral-200 divide-y divide-neutral-100">
                {order.items.map((item, idx) => (
                  <div key={idx} className="flex items-center gap-4 p-4">
                    {item.image ? (
                      <img
                        src={item.image}
                        alt={item.productName}
                        className="w-14 h-16 object-cover rounded"
                      />
                    ) : (
                      <div className="w-14 h-16 rounded bg-neutral-100 flex items-center justify-center">
                        <Package className="w-5 h-5 text-neutral-300" />
                      </div>
                    )}
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-obsidian truncate">
                        {item.productName}
                      </p>
                      <p className="text-[11px] text-neutral-400">
                        {item.sku}
                        {item.size ? ` · ${item.size}` : ""}
                        {item.color ? ` · ${item.color}` : ""}
                        {` · Qty ${item.quantity}`}
                      </p>
                    </div>
                    <p className="text-sm font-medium text-obsidian">
                      {formatPrice(item.unitPriceCents * item.quantity, order.currency)}
                    </p>
                  </div>
                ))}
              </div>

              <div className="mt-6 flex items-center justify-between border-t border-neutral-200 pt-4">
                <span className="text-xs uppercase tracking-[0.15em] text-neutral-500 font-sans">
                  Order Total
                </span>
                <span className="text-lg font-serif text-heritage-green">
                  {formatPrice(order.totalCents, order.currency)}
                </span>
              </div>

              {order.guestEmail && (
                <p className="mt-4 flex items-center justify-center gap-2 text-xs text-neutral-500">
                  <Mail className="w-3.5 h-3.5" />
                  A confirmation will be sent to {order.guestEmail}
                </p>
              )}

              <div className="mt-6 flex flex-col sm:flex-row gap-3">
                <Link
                  href="/account/orders"
                  className="flex-1 h-12 items-center justify-center flex bg-heritage-green text-white text-[11px] font-sans font-semibold tracking-[0.2em] uppercase hover:bg-[#124534] transition-colors"
                >
                  View My Orders
                </Link>
                <Link
                  href="/"
                  className="flex-1 h-12 items-center justify-center flex border border-neutral-300 text-[11px] font-sans font-semibold tracking-[0.2em] uppercase text-obsidian hover:border-heritage-green hover:text-heritage-green transition-colors"
                >
                  <ShoppingBag className="w-4 h-4 mr-2" />
                  Continue Shopping
                </Link>
              </div>
            </>
          ) : null}
        </div>
      </div>
    </div>
  );
}

function SuccessFallback() {
  return (
    <div className="min-h-screen bg-ivory flex items-center justify-center px-5 py-16">
      <div className="w-full max-w-[560px] bg-white border border-slate-border">
        <div className="px-8 py-8 border-b border-slate-border text-center bg-[#F6FBF6]">
          <Loader2 className="w-10 h-10 animate-spin text-heritage-green mx-auto mb-3" />
          <p className="text-[10px] font-sans font-semibold tracking-[0.3em] uppercase text-heritage-green/50 mb-2">
            Order Confirmed
          </p>
          <h1 className="font-serif italic text-[26px] text-obsidian">
            Thank You
          </h1>
        </div>
        <div className="p-8">
          <p className="text-sm text-neutral-500 text-center py-6">
            Preparing your order summary…
          </p>
        </div>
      </div>
    </div>
  );
}
