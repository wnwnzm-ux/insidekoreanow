import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { getSupabaseServer } from "@/lib/supabase-server";
import { signInWithEmail } from "@/app/auth/actions";
import { SITE_NAME } from "@/lib/site";

export const metadata: Metadata = {
  title: `Sign in | ${SITE_NAME}`,
  robots: { index: false },
};

export default async function LoginPage({
  searchParams,
}: {
  searchParams: Promise<{ sent?: string; error?: string }>;
}) {
  const supabase = await getSupabaseServer();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (user) redirect("/");

  const params = await searchParams;
  const sent = params.sent === "1";
  const error = params.error;

  return (
    <div className="flex min-h-[calc(100vh-64px)] items-center justify-center bg-zinc-50 px-4">
      <div className="w-full max-w-sm">
        <div className="rounded-2xl border border-zinc-200 bg-white p-8 shadow-sm">
          <h1 className="text-2xl font-semibold tracking-tight text-slate-900">
            Sign in
          </h1>
          <p className="mt-1.5 text-sm text-slate-500">
            Save and revisit your Korea trip plans.
          </p>

          {sent ? (
            <div className="mt-6 rounded-xl bg-teal-50 px-4 py-5 text-sm text-teal-800">
              <p className="font-semibold">Check your email ✉️</p>
              <p className="mt-1.5 text-teal-700">
                We sent you a magic link. Click it to sign in — no password needed.
              </p>
              <p className="mt-3 text-xs text-teal-500">
                Didn&apos;t get it? Check your spam folder, or{" "}
                <a href="/login" className="underline underline-offset-2">try again</a>.
              </p>
            </div>
          ) : (
            <>
              {error && (
                <p className="mt-4 rounded-lg bg-red-50 px-3 py-2.5 text-sm text-red-700">
                  {error === "auth"
                    ? "The link has expired or is invalid. Please request a new one."
                    : "Something went wrong. Please try again."}
                </p>
              )}

              <form action={signInWithEmail} className="mt-6 space-y-3">
                <div>
                  <label
                    htmlFor="email"
                    className="block text-sm font-medium text-slate-700"
                  >
                    Email address
                  </label>
                  <input
                    id="email"
                    name="email"
                    type="email"
                    required
                    autoComplete="email"
                    placeholder="you@example.com"
                    className="mt-1.5 w-full rounded-xl border border-zinc-200 bg-white px-3.5 py-2.5 text-sm text-slate-900 placeholder:text-slate-400 focus:border-teal-500 focus:outline-none focus:ring-2 focus:ring-teal-500/20"
                  />
                </div>
                <button
                  type="submit"
                  className="w-full rounded-xl bg-teal-600 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:bg-teal-700 active:scale-[0.98]"
                >
                  Sign in with email
                </button>
              </form>

              <p className="mt-4 text-center text-xs text-slate-400">
                We&apos;ll send a one-click sign-in link — no password needed.
              </p>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
