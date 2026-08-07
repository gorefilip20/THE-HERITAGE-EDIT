"use client";

import { useState, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { Loader2, Eye, EyeOff, Check } from "lucide-react";
import HEMonogram from "@/components/brand/HEMonogram";

function ResetPasswordForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const token = searchParams.get("token");

  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (password !== confirmPassword) {
      setError("Passwords do not match");
      return;
    }

    setLoading(true);
    try {
      const res = await fetch("/api/auth/reset-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ token, password }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "Something went wrong");
      setSuccess(true);
      setTimeout(() => router.push("/auth/login"), 3000);
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

  if (!token) {
    return (
      <div className="p-8 text-center">
        <p className="text-sm font-sans text-[#b91c1c] mb-4">Invalid reset link. Please request a new one.</p>
        <Link href="/auth/forgot-password" className="text-[12px] font-sans text-heritage-green font-medium hover:underline">
          Request new reset link
        </Link>
      </div>
    );
  }

  if (success) {
    return (
      <div className="p-8 text-center">
        <div className="w-14 h-14 mx-auto mb-5 bg-emerald-50 flex items-center justify-center">
          <Check size={24} className="text-emerald-600" />
        </div>
        <p className="text-sm font-sans text-obsidian mb-2 font-medium">Password reset successfully</p>
        <p className="text-[13px] font-sans text-neutral-500">Redirecting you to sign in...</p>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="p-8 space-y-5">
      {error && (
        <div className="p-3 bg-[#FBEAEA] border border-[#f3d3d3] text-[13px] font-sans text-[#b91c1c]">
          {error}
        </div>
      )}

      <div>
        <label className={labelClass}>New Password</label>
        <div className="relative">
          <input
            type={showPassword ? "text" : "password"}
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            minLength={8}
            className={inputClass + " pr-11"}
          />
          <button
            type="button"
            onClick={() => setShowPassword(!showPassword)}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-neutral-400 hover:text-obsidian transition-colors"
          >
            {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
          </button>
        </div>
        <p className="mt-2 text-[11px] font-sans text-neutral-400">Minimum 8 characters.</p>
      </div>

      <div>
        <label className={labelClass}>Confirm Password</label>
        <input
          type={showPassword ? "text" : "password"}
          value={confirmPassword}
          onChange={(e) => setConfirmPassword(e.target.value)}
          required
          minLength={8}
          className={inputClass}
        />
      </div>

      <button
        type="submit"
        disabled={loading}
        className="w-full h-12 bg-heritage-green text-white text-[11px] font-sans font-semibold tracking-[0.2em] uppercase flex items-center justify-center gap-2 hover:bg-[#163829] transition-colors disabled:opacity-50"
      >
        {loading ? <Loader2 size={16} className="animate-spin" /> : "Reset Password"}
      </button>
    </form>
  );
}

export default function ResetPasswordPage() {
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
              New Password
            </h1>
          </div>

          <Suspense fallback={<div className="p-8 flex justify-center"><Loader2 className="animate-spin text-heritage-green" /></div>}>
            <ResetPasswordForm />
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
