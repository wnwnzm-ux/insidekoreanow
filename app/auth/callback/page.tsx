"use client";

import { useEffect, useRef } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import type { EmailOtpType } from "@supabase/supabase-js";
import { getSupabaseBrowser } from "@/lib/supabase-browser";

function CallbackInner() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const ran = useRef(false);

  useEffect(() => {
    if (ran.current) return;
    ran.current = true;

    const token_hash = searchParams.get("token_hash");
    const type = searchParams.get("type") as EmailOtpType | null;
    const code = searchParams.get("code");
    const next = searchParams.get("next") ?? "/";
    const supabase = getSupabaseBrowser();

    async function exchange() {
      if (token_hash && type) {
        const { error } = await supabase.auth.verifyOtp({ token_hash, type });
        if (!error) { router.replace(next); return; }
      }
      if (code) {
        const { error } = await supabase.auth.exchangeCodeForSession(code);
        if (!error) { router.replace(next); return; }
      }
      router.replace("/login?error=auth");
    }

    exchange();
  }, [router, searchParams]);

  return (
    <div className="flex min-h-screen items-center justify-center bg-zinc-50">
      <div className="flex flex-col items-center gap-4 text-center">
        <div className="size-10 rounded-full border-4 border-teal-100 border-t-teal-600 animate-spin" />
        <p className="text-sm text-slate-500">Signing you in…</p>
      </div>
    </div>
  );
}

import { Suspense } from "react";

export default function AuthCallbackPage() {
  return (
    <Suspense fallback={
      <div className="flex min-h-screen items-center justify-center bg-zinc-50">
        <div className="size-10 rounded-full border-4 border-teal-100 border-t-teal-600 animate-spin" />
      </div>
    }>
      <CallbackInner />
    </Suspense>
  );
}
