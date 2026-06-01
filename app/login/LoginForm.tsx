"use client";

import { useState } from "react";
import { getSupabaseBrowser } from "@/lib/supabase-browser";

export function LoginForm({ initialError }: { initialError?: string }) {
  const [email, setEmail] = useState("");
  const [sent, setSent] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(initialError ?? "");

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError("");

    const supabase = getSupabaseBrowser();
    const { error: err } = await supabase.auth.signInWithOtp({
      email,
      options: {
        emailRedirectTo: `${window.location.origin}/auth/callback`,
      },
    });

    if (err) {
      setError("Couldn't send the link. Please try again.");
    } else {
      setSent(true);
    }
    setLoading(false);
  }

  if (sent) {
    return (
      <div className="rounded-xl bg-teal-50 px-4 py-5 text-sm text-teal-800 mt-6">
        <p className="font-semibold">Check your email ✉️</p>
        <p className="mt-1.5 text-teal-700">
          We sent a sign-in link to <span className="font-medium">{email}</span>. Click it to continue.
        </p>
        <p className="mt-3 text-xs text-teal-500">
          Didn&apos;t get it? Check spam, or{" "}
          <button
            onClick={() => { setSent(false); setError(""); }}
            className="underline underline-offset-2"
          >
            try again
          </button>.
        </p>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="mt-6 space-y-3">
      {error && (
        <p className="rounded-lg bg-red-50 px-3 py-2.5 text-sm text-red-700">
          {error === "auth"
            ? "The link has expired or is invalid. Please request a new one."
            : error}
        </p>
      )}
      <div>
        <label htmlFor="email" className="block text-sm font-medium text-slate-700">
          Email address
        </label>
        <input
          id="email"
          type="email"
          required
          autoComplete="email"
          placeholder="you@example.com"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="mt-1.5 w-full rounded-xl border border-zinc-200 bg-white px-3.5 py-2.5 text-sm text-slate-900 placeholder:text-slate-400 focus:border-teal-500 focus:outline-none focus:ring-2 focus:ring-teal-500/20"
        />
      </div>
      <button
        type="submit"
        disabled={loading}
        className="w-full rounded-xl bg-teal-600 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:bg-teal-700 active:scale-[0.98] disabled:opacity-60"
      >
        {loading ? "Sending…" : "Sign in with email"}
      </button>
      <p className="text-center text-xs text-slate-400">
        We&apos;ll send a one-click sign-in link — no password needed.
      </p>
    </form>
  );
}
