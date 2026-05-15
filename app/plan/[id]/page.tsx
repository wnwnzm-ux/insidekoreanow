import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { getSupabase } from "@/lib/supabase";
import type { GeneratedPlan } from "@/app/plan/types";
import type { RecommendedRestaurant } from "@/app/api/restaurants/recommend/route";
import { SharedPlanView } from "./SharedPlanView";

type Props = { params: Promise<{ id: string }> };
type StoredPlan = GeneratedPlan & { _mealPicks?: Record<string, (RecommendedRestaurant | null)[]> };

async function fetchStoredPlan(id: string): Promise<StoredPlan | null> {
  const { data, error } = await getSupabase()
    .from("plans")
    .select("plan_json")
    .eq("id", id)
    .single();

  if (error || !data) return null;
  return data.plan_json as StoredPlan;
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { id } = await params;
  const stored = await fetchStoredPlan(id);
  if (!stored) return { title: "Plan not found — InsideKoreaNow" };
  return {
    title: `${stored.title} — InsideKoreaNow`,
    description: stored.overview,
  };
}

export default async function SharedPlanPage({ params }: Props) {
  const { id } = await params;
  const stored = await fetchStoredPlan(id);
  if (!stored) notFound();

  const { _mealPicks, ...plan } = stored;

  return (
    <div className="min-h-screen bg-slate-50 pb-16 pt-8">
      <div className="mx-auto max-w-2xl px-4 sm:px-6">
        <div className="mb-6 flex items-center justify-between">
          <Link
            href="/plan"
            className="inline-flex items-center gap-1.5 rounded-xl bg-teal-600 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-teal-700"
          >
            <svg className="size-4" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M10.293 3.293a1 1 0 011.414 0l6 6a1 1 0 010 1.414l-6 6a1 1 0 01-1.414-1.414L14.586 11H3a1 1 0 110-2h11.586l-4.293-4.293a1 1 0 010-1.414z" clipRule="evenodd" />
            </svg>
            Create my own plan
          </Link>
          <span className="text-xs text-slate-400">Shared via InsideKoreaNow</span>
        </div>

        <SharedPlanView plan={plan} mealPicks={_mealPicks ?? {}} />

        <div className="mt-10 rounded-2xl bg-gradient-to-br from-teal-600 to-teal-800 p-6 text-center text-white">
          <p className="text-lg font-bold">Want a plan like this?</p>
          <p className="mt-1 text-sm text-teal-100">Answer 5 quick questions and get your personalised Korea itinerary in ~15 seconds.</p>
          <Link
            href="/plan"
            className="mt-4 inline-flex items-center gap-2 rounded-xl bg-white px-6 py-3 text-sm font-bold text-teal-700 transition hover:bg-teal-50"
          >
            Plan My Korea Trip
            <svg className="size-4" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M10.293 3.293a1 1 0 011.414 0l6 6a1 1 0 010 1.414l-6 6a1 1 0 01-1.414-1.414L14.586 11H3a1 1 0 110-2h11.586l-4.293-4.293a1 1 0 010-1.414z" clipRule="evenodd" />
            </svg>
          </Link>
          <p className="mt-2 text-xs text-teal-300">Free · No sign-up</p>
        </div>
      </div>
    </div>
  );
}
