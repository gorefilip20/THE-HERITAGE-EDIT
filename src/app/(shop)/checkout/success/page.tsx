"use client";

import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { Suspense, useEffect, useState } from "react";
import { CheckCircle2, Loader2, XCircle } from "lucide-react";

function SuccessContent() {
  const searchParams = useSearchParams();
  const transactionId = searchParams.get("transaction_id");
  const txRef = searchParams.get("tx_ref") ?? "";
  const [state, setState] = useState<"checking" | "success" | "failed">("checking");
  const [message, setMessage] = useState("Confirming your payment securely...");

  useEffect(() => {
    if (!transactionId) {
      setState("failed");
      setMessage("No Flutterwave transaction reference was provided.");
      return;
    }

    let cancelled = false;
    fetch(`/api/checkout/flutterwave/verify?transaction_id=${encodeURIComponent(transactionId)}&tx_ref=${encodeURIComponent(txRef)}`)
      .then(async (response) => {
        const data = await response.json();
        if (cancelled) return;
        if (!response.ok || !data.verified) {
          setState("failed");
          setMessage(data.error ?? "We could not confirm this payment.");
          return;
        }
        setState("success");
        setMessage(data.captured ? "Your order has been confirmed." : "Your payment was verified successfully.");
      })
      .catch(() => {
        if (!cancelled) {
          setState("failed");
          setMessage("We could not reach the payment verification service. Please contact support.");
        }
      });

    return () => { cancelled = true; };
  }, [transactionId, txRef]);

  return (
    <main className="min-h-[60vh] flex items-center justify-center px-6 py-20">
      <div className="max-w-md text-center">
        {state === "checking" && <Loader2 className="mx-auto mb-6 animate-spin text-heritage-green" size={42} strokeWidth={1.5} />}
        {state === "success" && <CheckCircle2 className="mx-auto mb-6 text-heritage-green" size={54} strokeWidth={1.25} />}
        {state === "failed" && <XCircle className="mx-auto mb-6 text-red-600" size={54} strokeWidth={1.25} />}
        <p className="text-[10px] uppercase tracking-[0.25em] text-neutral-400">Flutterwave payment</p>
        <h1 className="mt-3 text-3xl font-serif text-obsidian">{state === "success" ? "Thank you for your order" : state === "failed" ? "Payment needs attention" : "Checking payment"}</h1>
        <p className="mt-4 text-sm leading-6 text-neutral-500">{message}</p>
        <div className="mt-8 flex justify-center gap-3">
          <Link href="/" className="luxury-button-primary">Continue shopping</Link>
          {state === "failed" && <Link href="/checkout" className="luxury-button-secondary">Return to checkout</Link>}
        </div>
      </div>
    </main>
  );
}

export default function FlutterwaveSuccessPage() {
  return <Suspense fallback={<main className="min-h-[60vh]" />}><SuccessContent /></Suspense>;
}
