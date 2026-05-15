import type { NextRequest } from "next/server";
import { getSupabase } from "@/lib/supabase";
import type { GeneratedPlan } from "@/app/plan/types";

export async function POST(request: NextRequest) {
  const { plan, mealPicks } = (await request.json()) as {
    plan: GeneratedPlan;
    mealPicks?: Record<string, unknown[]>;
  };

  const id = crypto.randomUUID().replace(/-/g, "").slice(0, 10);
  const planToSave = mealPicks ? { ...plan, _mealPicks: mealPicks } : plan;

  const { error } = await getSupabase()
    .from("plans")
    .insert({ id, plan_json: planToSave });

  if (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }

  return Response.json({ id });
}
