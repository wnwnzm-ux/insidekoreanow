import type { NextRequest } from "next/server";
import { supabase } from "@/lib/supabase";
import type { GeneratedPlan } from "@/app/plan/types";

export async function POST(request: NextRequest) {
  const { plan } = (await request.json()) as { plan: GeneratedPlan };

  const id = crypto.randomUUID().replace(/-/g, "").slice(0, 10);

  const { error } = await supabase
    .from("plans")
    .insert({ id, plan_json: plan });

  if (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }

  return Response.json({ id });
}
