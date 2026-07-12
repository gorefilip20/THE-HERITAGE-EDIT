"use client";

import { useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { Loader2, Eye, EyeOff } from "lucide-react";

export function AuthForm({ mode }: { mode: "login" | "register" }) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const redirect = searchParams.get("redirect") ?? "/account";
  const isRegister = mode === "register";

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
      if (!res.ok) throw new Error(data.error ?? "Authentication failed");

      router.push(redirect);
      router.refresh();
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
        {/* Wordmark */}
        <div className="text-center mb-10">
          <Link
            href="/"
            className="font-serif text-lg tracking-[0.14em] text-heritage-green"
          >
            THE HERITAGE EDIT
          </Link>
        </div>

        <div className="bg-white border border-slate-border">
          {/* Header */}
          <div className="px-8 py-6 border-b border-slate-border text-center">
            <p className="text-[10px] font-sans font-semibold tracking-[0.3em] uppercase text-heritage-green/50 mb-2">
              {isRegister ? "Join the Inner Circle" : "Members"}
            </p>
            <h1 className="font-serif italic text-[26px] text-obsidian">
              {isRegister ? "Create Account" : "Welcome Back"}
            </h1>
          </div>

          <form onSubmit={handleSubmit} className="p-8 space-y-5">
            {error && (
              <div className="p-3 bg-[#FBEAEA] border border-[#f3d3d3] text-[13px] font-sans text-[#b91c1c]">
                {error}
              </div>
            )}

            {isRegister && (
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className={labelClass}>First Name</label>
                  <input
                    type="text"
                    value={firstName}
                    onChange={(e) => setFirstName(e.target.value)}
                    required
                    className={inputClass}
                  />
                </div>
                <div>
                  <label className={labelClass}>Last Name</label>
                  <input
                    type="text"
                    value={lastName}
                    onChange={(e) => setLastName(e.target.value)}
                    required
                    className={inputClass}
                  />
                </div>
              </div>
            )}

            <div>
              <label className={labelClass}>Email</label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className={inputClass}
              />
            </div>

            <div>
              <label className={labelClass}>Password</label>
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
                  aria-label={showPassword ? "Hide password" : "Show password"}
                >
                  {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
              {isRegister && (
                <p className="mt-2 text-[11px] font-sans text-neutral-400">
                  Minimum 8 characters.
                </p>
              )}
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full h-12 bg-heritage-green text-white text-[11px] font-sans font-semibold tracking-[0.2em] uppercase flex items-center justify-center gap-2 hover:bg-[#124534] transition-colors active:scale-[0.99] disabled:opacity-50"
            >
              {loading ? (
                <Loader2 size={16} className="animate-spin" />
              ) : isRegister ? (
                "Create Account"
              ) : (
                "Sign In"
              )}
            </button>
          </form>

          {/* Footer */}
          <div className="px-8 py-5 border-t border-slate-border text-center bg-ivory">
            {isRegister ? (
              <p className="text-[12px] font-sans text-neutral-500">
                Already have an account?{" "}
                <Link
                  href="/auth/login"
                  className="text-heritage-green font-medium hover:underline"
                >
                  Sign in
                </Link>
              </p>
            ) : (
              <p className="text-[12px] font-sans text-neutral-500">
                New to The Heritage Edit?{" "}
                <Link
                  href="/auth/register"
                  className="text-heritage-green font-medium hover:underline"
                >
                  Create an account
                </Link>
              </p>
            )}
          </div>
        </div>

        <p className="text-center mt-6 text-[11px] font-sans text-neutral-400">
          <Link href="/" className="hover:text-obsidian transition-colors">
            ← Return to store
          </Link>
        </p>
      </div>
    </div>
  );
}
