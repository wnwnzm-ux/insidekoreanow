import Link from "next/link";
import { getSupabaseServer } from "@/lib/supabase-server";
import { signOut } from "@/app/auth/actions";

export async function AuthButton({ mobile = false }: { mobile?: boolean }) {
  const supabase = await getSupabaseServer();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const linkClass = mobile
    ? "block px-4 py-2.5 text-sm text-slate-700 hover:bg-zinc-50"
    : "rounded-lg px-3 py-2 text-sm font-medium text-slate-600 transition hover:text-slate-900";

  if (!user) {
    return (
      <Link href="/login" className={linkClass}>
        Sign in
      </Link>
    );
  }

  const email = user.email ?? "";
  const initial = email.charAt(0).toUpperCase();

  return (
    <div className={mobile ? "border-t border-zinc-100 pt-1 mt-1" : "flex items-center gap-2"}>
      {!mobile && (
        <span className="inline-flex size-8 items-center justify-center rounded-full bg-teal-100 text-xs font-semibold text-teal-800">
          {initial}
        </span>
      )}
      {mobile && (
        <span className="block px-4 py-2 text-xs text-slate-400">{email}</span>
      )}
      <form action={signOut}>
        <button
          type="submit"
          className={mobile ? `${linkClass} w-full text-left` : "rounded-lg px-3 py-2 text-sm font-medium text-slate-600 transition hover:text-slate-900"}
        >
          Sign out
        </button>
      </form>
    </div>
  );
}
