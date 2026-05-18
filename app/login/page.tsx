import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { getSupabaseServer } from "@/lib/supabase-server";
import { signInWithEmail, signInWithGoogle } from "@/app/auth/actions";
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
            <div className="mt-6 rounded-xl bg-teal-50 px-4 py-4 text-sm text-teal-800">
              <p className="font-semibold">Check your email</p>
              <p className="mt-1 text-teal-700">
                We sent you a magic link. Click it to sign in — no password needed.
              </p>
            </div>
          ) : (
            <>
              {error && (
                <p className="mt-4 rounded-lg bg-red-50 px-3 py-2.5 text-sm text-red-700">
                  Something went wrong. Please try again.
                </p>
              )}

              {/* Google OAuth */}
              <form action={signInWithGoogle} className="mt-6">
                <button
                  type="submit"
                  className="flex w-full items-center justify-center gap-3 rounded-xl border border-zinc-200 bg-white px-4 py-2.5 text-sm font-medium text-slate-700 shadow-sm transition hover:bg-zinc-50"
                >
                  <svg className="size-5" viewBox="0 0 24 24">
                    <path
                      fill="#4285F4"
                      d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                    />
                    <path
                      fill="#34A853"
                      d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                    />
                    <path
                      fill="#FBBC05"
                      d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.84z"
                    />
                    <path
                      fill="#EA4335"
                      d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                    />
                  </svg>
                  Continue with Google
                </button>
              </form>

              <div className="my-5 flex items-center gap-3">
                <div className="h-px flex-1 bg-zinc-200" />
                <span className="text-xs text-slate-400">or</span>
                <div className="h-px flex-1 bg-zinc-200" />
              </div>

              {/* Magic link */}
              <form action={signInWithEmail} className="space-y-3">
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
                  Send magic link
                </button>
              </form>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
