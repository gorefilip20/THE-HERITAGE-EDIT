"use client";

import { FormEvent, useState } from "react";

export default function AdminSetupPage() {
  const [token, setToken] = useState("");
  const [status, setStatus] = useState<string>("");
  const [busy, setBusy] = useState(false);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setStatus("");
    setBusy(true);

    try {
      const response = await fetch("/api/setup/admin", {
        method: "POST",
        headers: { "x-admin-setup-token": token },
      });
      const body = await response.json().catch(() => ({}));
      if (!response.ok) {
        setStatus(body.error ?? "Activation failed. Check the token and deployment.");
        return;
      }
      setStatus("Admin account activated. Remove all ADMIN_SETUP_* variables from Hostinger and redeploy now.");
      setToken("");
    } catch {
      setStatus("The activation request could not be completed. Check that the latest deployment is live.");
    } finally {
      setBusy(false);
    }
  }

  return (
    <main className="min-h-screen bg-[#f7f3ee] px-6 py-16 text-[#1b1715]">
      <div className="mx-auto max-w-md rounded-2xl border border-black/10 bg-white p-8 shadow-xl">
        <p className="text-xs font-semibold uppercase tracking-[0.24em] text-[#6c4a45]">THE HERITAGE EDIT</p>
        <h1 className="mt-4 font-serif text-4xl">Activate admin access</h1>
        <p className="mt-4 text-sm leading-6 text-black/60">
          This one-time page uses the setup token configured in Hostinger. It does not ask for or display your admin password.
        </p>
        <form onSubmit={handleSubmit} className="mt-8 space-y-4">
          <label className="block text-sm font-medium">
            Setup token
            <input
              type="password"
              value={token}
              onChange={(event) => setToken(event.target.value)}
              required
              autoComplete="off"
              className="mt-2 h-12 w-full rounded-xl border border-black/15 px-4 outline-none focus:border-[#6c4a45]"
              placeholder="Enter the Hostinger ADMIN_SETUP_TOKEN"
            />
          </label>
          <button
            type="submit"
            disabled={busy}
            className="h-12 w-full rounded-xl bg-[#1b1715] text-sm font-semibold uppercase tracking-[0.16em] text-white transition hover:bg-[#6c4a45] disabled:cursor-not-allowed disabled:opacity-50"
          >
            {busy ? "Activating…" : "Activate admin account"}
          </button>
        </form>
        {status && <p className="mt-5 rounded-xl bg-black/[0.04] p-4 text-sm leading-6">{status}</p>}
      </div>
    </main>
  );
}
