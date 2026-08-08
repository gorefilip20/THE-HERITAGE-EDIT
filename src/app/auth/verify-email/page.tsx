"use client";

import { useEffect, useState, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import { Loader2, Check, AlertCircle } from "lucide-react";
import HEMonogram from "@/components/brand/HEMonogram";

function VerifyEmailContent() {
  const searchParams = useSearchParams();
  const token = searchParams.get("token");
  const [status, setStatus] = useState<"loading" | "success" | "error">(token ? "loading" : "error");
  const [message, setMessage] = useState(token ? "" : "No verification token provided.");

  useEffect(() => {
    if (!token) return;

    fetch("/api/auth/verify-email", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ token }),
    })
      .then(async (res) => {
        const data = await res.json();
        if (!res.ok) throw new Error(data.error ?? "Verification failed");
        setStatus("success");
        setMessage(data.message);
      })
      .catch((err) => {
        setStatus("error");
        setMessage(err instanceof Error ? err.message : "Verification failed");
      });
  }, [token]);

  return (
    <div className="p-8 text-center">
      {status === "loading" && (
        <>
          <Loader2 size={32} className="mx-auto mb-4 animate-spin text-heritage-green" />
          <p className="text-sm font-sans text-neutral-500">Verifying your email...</p>
        </>
      )}
      {status === "success" && (
        <>
          <div className="w-14 h-14 mx-auto mb-5 bg-emerald-50 flex items-center justify-center">
            <Check size={24} className="text-emerald-600" />
          </div>
          <p className="text-sm font-sans text-obsidian mb-2 font-medium">Email verified</p>
          <p className="text-[13px] font-sans text-neutral-500 mb-6">
            Your email has been verified. Welcome to The Heritage Edit.
          </p>
          <Link
            href="/shop"
            className="inline-flex items-center justify-center h-12 px-8 bg-heritage-green text-white text-[11px] font-sans font-semibold tracking-[0.2em] uppercase hover:bg-[#163829] transition-colors"
          >
            Explore the Collection
          </Link>
        </>
      )}
      {status === "error" && (
        <>
          <div className="w-14 h-14 mx-auto mb-5 bg-[#FBEAEA] flex items-center justify-center">
            <AlertCircle size={24} className="text-[#b91c1c]" />
          </div>
          <p className="text-sm font-sans text-obsidian mb-2 font-medium">Verification failed</p>
          <p className="text-[13px] font-sans text-neutral-500 mb-6">{message}</p>
          <Link
            href="/auth/login"
            className="text-[12px] font-sans text-heritage-green font-medium hover:underline"
          >
            Sign in to request a new verification email
          </Link>
        </>
      )}
    </div>
  );
}

export default function VerifyEmailPage() {
  return (
    <div className="min-h-screen bg-ivory flex items-center justify-center px-5 py-16">
      <div className="w-full max-w-[440px]">
        <div className="text-center mb-10">
          <Link href="/" className="inline-flex flex-col items-center gap-3">
            <HEMonogram variant="dark" size={48} />
            <span className="font-serif text-lg tracking-[0.14em] text-heritage-green">
              THE HERITAGE EDIT
            </span>
          </Link>
        </div>

        <div className="bg-white border border-slate-border">
          <div className="px-8 py-6 border-b border-slate-border text-center">
            <p className="text-[10px] font-sans font-semibold tracking-[0.3em] uppercase text-heritage-green/50 mb-2">
              Account
            </p>
            <h1 className="font-serif italic text-[26px] text-obsidian">
              Email Verification
            </h1>
          </div>

          <Suspense fallback={<div className="p-8 flex justify-center"><Loader2 className="animate-spin text-heritage-green" /></div>}>
            <VerifyEmailContent />
          </Suspense>
        </div>

        <p className="text-center mt-6 text-[11px] font-sans text-neutral-400">
          <Link href="/" className="hover:text-obsidian transition-colors">
            &larr; Return to store
          </Link>
        </p>
      </div>
    </div>
  );
}
