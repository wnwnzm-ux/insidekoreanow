"use server";

import { redirect } from "next/navigation";
import { getSupabaseServer } from "@/lib/supabase-server";

export async function signInWithEmail(formData: FormData) {
  const email = formData.get("email") as string;
  const supabase = await getSupabaseServer();

  const { error } = await supabase.auth.signInWithOtp({
    email,
    options: {
      emailRedirectTo: `${process.env.NEXT_PUBLIC_SITE_URL}/auth/callback`,
    },
  });

  if (error) {
    redirect("/login?error=send");
  }

  redirect("/login?sent=1");
}

export async function signInWithGoogle() {
  const supabase = await getSupabaseServer();

  const { data, error } = await supabase.auth.signInWithOAuth({
    provider: "google",
    options: {
      redirectTo: `${process.env.NEXT_PUBLIC_SITE_URL}/auth/callback`,
    },
  });

  if (error || !data.url) {
    redirect("/login?error=oauth");
  }

  redirect(data.url);
}

export async function signOut() {
  const supabase = await getSupabaseServer();
  await supabase.auth.signOut();
  redirect("/");
}
