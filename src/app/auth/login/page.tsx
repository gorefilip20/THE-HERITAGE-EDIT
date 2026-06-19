"use client";

import { useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { Loader2, Eye, EyeOff, Sparkles } from "lucide-react";

export default function LoginPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const redirect = searchParams.get("redirect") ?? "/";

  const [isRegister, setIsRegister] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      const payload: Record<string, string> = {
        action: isRegister ? "register" : "login",
        email,
        password,
      };
      if (isRegister) {
        payload.firstName = firstName;
        payload.lastName = lastName;
      }

      const res = await fetch("/api/auth", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error ?? "Authentication failed");
      }

      router.push(redirect);
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#FBFBFA] flex items-center justify-center px-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-10">
          <Link href="/" className="inline-block">
            <h1 className="text-xl font-serif tracking-[0.15em] text-[#0D2C22]">
              THE HERITAGE EDIT
            </h1>
          </Link>
        </div>

        <div className="bg-white rounded-xl border border-neutral-200 shadow-sm overflow-hidden">
          <div className="px-8 py-5 border-b border-neutral-100 bg-gradient-to-r from-[#0D2C22] to-[#2E1A47] text-center">
            <Sparkles className="h-5 w-5 text-amber-400 mx-auto mb-2" />
            <h2 className="text-sm font-sans font-semibold tracking-[0.15em] uppercase text-white">
              {isRegister ? "Create Account" : "Welcome Back"}
            </h2>
          </div>

          <form onSubmit={handleSubmit} className="p-8 space-y-5">
            {error && (
              <div className="p-3 rounded-lg bg-red-50 border border-red-100 text-sm font-sans text-red-700">
                {error}
              </div>
            )}

            {isRegister && (
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-[11px] font-sans font-medium tracking-[0.12em] uppercase text-neutral-400 mb-1.5">
                    First Name
                  </label>
                  <input
                    type="text"
                    value={firstName}
                    onChange={(e) => setFirstName(e.target.value)}
                    required
                    className="w-full h-11 px-3 rounded-lg border border-neutral-200 bg-white text-sm font-sans text-neutral-900 focus:outline-none focus:border-[#0D2C22] focus:ring-1 focus:ring-[#0D2C22]/20 transition-all"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-sans font-medium tracking-[0.12em] uppercase text-neutral-400 mb-1.5">
                    Last Name
                  </label>
                  <input
                    type="text"
                    value={lastName}
                    onChange={(e) => setLastName(e.target.value)}
                    required
                    className="w-full h-11 px-3 rounded-lg border border-neutral-200 bg-white text-sm font-sans text-neutral-900 focus:outline-none focus:border-[#0D2C22] focus:ring-1 focus:ring-[#0D2C22]/20 transition-all"
                  />
                </div>
              </div>
            )}

            <div>
              <label className="block text-[11px] font-sans font-medium tracking-[0.12em] uppercase text-neutral-400 mb-1.5">
                Email
              </label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="w-full h-11 px-3 rounded-lg border border-neutral-200 bg-white text-sm font-sans text-neutral-900 focus:outline-none focus:border-[#0D2C22] focus:ring-1 focus:ring-[#0D2C22]/20 transition-all"
              />
            </div>

            <div>
              <label className="block text-[11px] font-sans font-medium tracking-[0.12em] uppercase text-neutral-400 mb-1.5">
                Password
              </label>
              <div className="relative">
                <input
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  minLength={8}
                  className="w-full h-11 px-3 pr-10 rounded-lg border border-neutral-200 bg-white text-sm font-sans text-neutral-900 focus:outline-none focus:border-[#0D2C22] focus:ring-1 focus:ring-[#0D2C22]/20 transition-all"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-neutral-400 hover:text-neutral-600"
                >
                  {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full h-12 rounded-lg bg-[#0D2C22] text-white text-sm font-sans font-semibold tracking-wide flex items-center justify-center gap-2 hover:shadow-lg hover:shadow-[#0D2C22]/20 transition-all active:scale-[0.98] disabled:opacity-50"
            >
              {loading ? (
                <Loader2 size={16} className="animate-spin" />
              ) : isRegister ? (
                "Create Account"
              ) : (
                "Sign In"
              )}
            </button>

            <div className="text-center pt-2">
              <button
                type="button"
                onClick={() => {
                  setIsRegister(!isRegister);
                  setError(null);
                }}
                className="text-xs font-sans text-neutral-400 hover:text-[#0D2C22] transition-colors"
              >
                {isRegister
                  ? "Already have an account? Sign in"
                  : "New to The Heritage Edit? Create an account"}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
