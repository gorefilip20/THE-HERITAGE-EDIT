"use client";

import { useState } from "react";
import Link from "next/link";
import { Loader2, ArrowLeft, Mail } from "lucide-react";
import HEMonogram from "@/components/brand/HEMonogram";

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      const res = await fetch("/api/auth/forgot-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });
      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error ?? "Something went wrong");
      }
      setSent(true);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong");
    } finally {
      setLoading(false);
    }
  };

  const inputClass =
    "w-full h-12 px-4 border border-slate-border bg-white text-[14px] text-obsidian outline-none focus:border-heritage-green transition-colors";
  const labelClass =
    "block text-[10px] font-sans font-semibold tracking-[0.15em] uppercase text-neutral-400 mb-2";

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
              Account Recovery
            </p>
            <h1 className="font-serif italic text-[26px] text-obsidian">
              Reset Password
            </h1>
          </div>

          {sent ? (
            <div className="p-8 text-center">
              <div className="w-14 h-14 mx-auto mb-5 bg-heritage-green/5 flex items-center justify-center">
                <Mail size={24} className="text-heritage-green" />
              </div>
              <p className="text-sm font-sans text-obsidian mb-2 font-medium">
                Check your inbox
              </p>
              <p className="text-[13px] font-sans text-neutral-500 leading-relaxed mb-6">
                If an account exists for <strong>{email}</strong>, we&apos;ve sent a password reset link. The link expires in 1 hour.
              </p>
              <Link
                href="/auth/login"
                className="inline-flex items-center gap-2 text-[12px] font-sans text-heritage-green font-medium hover:underline"
              >
                <ArrowLeft size={14} />
                Back to sign in
              </Link>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="p-8 space-y-5">
              <p className="text-[13px] font-sans text-neutral-500 leading-relaxed">
                Enter the email address associated with your account and we&apos;ll send you a link to reset your password.
              </p>

              {error && (
                <div className="p-3 bg-[#FBEAEA] border border-[#f3d3d3] text-[13px] font-sans text-[#b91c1c]">
                  {error}
                </div>
              )}

              <div>
                <label className={labelClass}>Email Address</label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  className={inputClass}
                  placeholder="your@email.com"
                />
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full h-12 bg-heritage-green text-white text-[11px] font-sans font-semibold tracking-[0.2em] uppercase flex items-center justify-center gap-2 hover:bg-[#163829] transition-colors disabled:opacity-50"
              >
                {loading ? <Loader2 size={16} className="animate-spin" /> : "Send Reset Link"}
              </button>
            </form>
          )}

          <div className="px-8 py-5 border-t border-slate-border text-center bg-ivory">
            <p className="text-[12px] font-sans text-neutral-500">
              Remember your password?{" "}
              <Link href="/auth/login" className="text-heritage-green font-medium hover:underline">
                Sign in
              </Link>
            </p>
          </div>
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
