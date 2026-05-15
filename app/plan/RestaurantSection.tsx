"use client";

import { useState, useEffect } from "react";
import type { RecommendedRestaurant } from "@/app/api/restaurants/recommend/route";

const THEME_BADGE: Record<string, { bg: string; text: string }> = {
  "Michelin-listed": { bg: "bg-red-100", text: "text-red-700" },
  "TV Feature":      { bg: "bg-purple-100", text: "text-purple-700" },
  "Media Pick":      { bg: "bg-blue-100", text: "text-blue-700" },
  "Press Pick":      { bg: "bg-blue-100", text: "text-blue-700" },
  "Hidden Gem":      { bg: "bg-emerald-100", text: "text-emerald-700" },
  "Foodie Favorite": { bg: "bg-orange-100", text: "text-orange-700" },
};

function RestaurantCard({ restaurant }: { restaurant: RecommendedRestaurant }) {
  const dish = restaurant.recommended_menu?.[0];
  const topTheme = (restaurant.travel_theme ?? []).find((t) => t in THEME_BADGE);
  const badge = topTheme ? THEME_BADGE[topTheme] : null;

  return (
    <div className="flex items-start justify-between gap-3 rounded-xl border border-slate-100 bg-white p-3.5 shadow-sm">
      <div className="flex-1 min-w-0">
        {/* Name row */}
        <div className="flex items-baseline gap-1.5 flex-wrap">
          <span className="font-semibold text-sm text-slate-800 leading-tight">
            {restaurant.name}
          </span>
          {restaurant.korean_name && (
            <span className="text-[11px] text-slate-400 shrink-0">
              {restaurant.korean_name}
            </span>
          )}
        </div>

        {/* Meta row */}
        <div className="mt-1 flex flex-wrap items-center gap-1.5">
          {badge && topTheme && (
            <span
              className={`rounded-full px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide ${badge.bg} ${badge.text}`}
            >
              {topTheme}
            </span>
          )}
          {restaurant.district && (
            <span className="text-[11px] text-slate-400">
              📍 {restaurant.district}
            </span>
          )}
          {restaurant.reservation_needed && (
            <span className="text-[11px] text-amber-600 font-medium">
              Reservation recommended
            </span>
          )}
        </div>

        {/* Recommended dish */}
        {dish && (
          <p className="mt-1.5 text-xs text-slate-600 leading-snug">
            <span className="font-medium text-slate-700">Try: </span>
            {dish.name}
            {dish.korean_name && (
              <span className="text-slate-400"> ({dish.korean_name})</span>
            )}
          </p>
        )}
      </div>

      {/* Maps link */}
      {restaurant.maps_url && (
        <a
          href={restaurant.maps_url}
          target="_blank"
          rel="noopener noreferrer"
          className="shrink-0 flex items-center gap-1 rounded-lg border border-teal-200 bg-teal-50 px-2.5 py-1.5 text-[11px] font-semibold text-teal-700 hover:bg-teal-100 transition-colors"
          aria-label={`View ${restaurant.name} on Google Maps`}
        >
          <svg className="size-3" viewBox="0 0 20 20" fill="currentColor">
            <path
              fillRule="evenodd"
              d="M5.05 4.05a7 7 0 119.9 9.9L10 18.9l-4.95-4.95a7 7 0 010-9.9zM10 11a2 2 0 100-4 2 2 0 000 4z"
              clipRule="evenodd"
            />
          </svg>
          Map
        </a>
      )}
    </div>
  );
}

function SkeletonCard() {
  return (
    <div className="rounded-xl border border-slate-100 bg-white p-3.5 shadow-sm space-y-2 animate-pulse">
      <div className="flex gap-2">
        <div className="h-3 w-32 rounded-full bg-slate-100" />
        <div className="h-3 w-16 rounded-full bg-slate-100" />
      </div>
      <div className="h-2.5 w-48 rounded-full bg-slate-100" />
    </div>
  );
}

interface Props {
  /** 0-based day index matching the active tab in PlanStep3 */
  dayIndex: number;
  city?: string;
  budget?: string;
}

export function RestaurantSection({ dayIndex, city = "Seoul", budget = "mid" }: Props) {
  // Cache results by key so the loading state is derived without synchronous setState in effect
  const [cache, setCache] = useState<Record<string, RecommendedRestaurant[] | "error">>({});
  const cacheKey = `${dayIndex}-${city}-${budget}`;
  const cached = cache[cacheKey];
  const status = cached === undefined ? "loading" : cached === "error" ? "error" : cached.length === 0 ? "empty" : "ok";
  const restaurants = Array.isArray(cached) ? cached : [];

  useEffect(() => {
    if (cache[cacheKey] !== undefined) return;
    let cancelled = false;
    const params = new URLSearchParams({ city, day: String(dayIndex + 1), budget, limit: "3" });
    fetch(`/api/restaurants/recommend?${params}`)
      .then((r) => {
        if (!r.ok) throw new Error(r.statusText);
        return r.json() as Promise<{ restaurants: RecommendedRestaurant[] }>;
      })
      .then(({ restaurants: data }) => {
        if (!cancelled) setCache((prev) => ({ ...prev, [cacheKey]: data }));
      })
      .catch(() => {
        if (!cancelled) setCache((prev) => ({ ...prev, [cacheKey]: "error" }));
      });
    return () => { cancelled = true; };
  }, [dayIndex, city, budget, cacheKey, cache]);

  // Don't render anything if DB isn't ready yet or returns empty
  if (status === "empty" || status === "error") return null;

  return (
    <div className="mt-6">
      <div className="mb-3 flex items-center gap-2">
        <span className="text-base" aria-hidden>🍽️</span>
        <h4 className="text-sm font-bold text-slate-700">Where to Eat Today</h4>
        <span className="ml-auto text-[11px] text-slate-400 italic">Curated picks</span>
      </div>

      <div className="space-y-2.5">
        {status === "loading" ? (
          <>
            <SkeletonCard />
            <SkeletonCard />
            <SkeletonCard />
          </>
        ) : (
          restaurants.map((r) => <RestaurantCard key={r.id} restaurant={r} />)
        )}
      </div>
    </div>
  );
}
