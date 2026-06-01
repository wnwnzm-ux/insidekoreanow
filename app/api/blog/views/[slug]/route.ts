import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

const sb = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY ?? process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  const { slug } = await params;
  const { data } = await sb.from("post_views").select("count").eq("slug", slug).single();
  return NextResponse.json({ count: (data as { count: number } | null)?.count ?? 0 });
}

export async function POST(
  _req: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  const { slug } = await params;
  const { data, error } = await sb.rpc("increment_post_view", { p_slug: slug });
  if (error) return NextResponse.json({ count: 0 });
  return NextResponse.json({ count: data as number });
}
