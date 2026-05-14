"use client";

import { useState, useMemo, useEffect } from "react";
import { CURATED_PLACES } from "./curatedPlaces";
import type { PlaceItem } from "./types";
import type { RecommendedRestaurant } from "@/app/api/restaurants/recommend/route";

const CATEGORIES = [
  { id: "all", label: "All" },
  { id: "food", label: "🍜 Food" },
  { id: "attraction", label: "🏯 Attraction" },
  { id: "shopping", label: "🛍️ Shopping" },
  { id: "cafe", label: "☕ Café" },
  { id: "neighborhood", label: "🏘️ Explore" },
];

interface Props {
  open: boolean;
  onClose: () => void;
  onAdd: (place: PlaceItem) => void;
  onAddMeal?: (restaurant: RecommendedRestaurant, slot: 0 | 1) => void;
  activeMealPicks?: (RecommendedRestaurant | null)[];
  existingNames: Set<string>;
  activeDay?: number;
}

export function AddPlaceDrawer({ open, onClose, onAdd, onAddMeal, activeMealPicks, existingNames, activeDay = 0 }: Props) {
  const [category, setCategory] = useState("all");
  const [query, setQuery] = useState("");
  const [dbFoods, setDbFoods] = useState<RecommendedRestaurant[]>([]);
  const [dbLoading, setDbLoading] = useState(false);

  // Fetch DB restaurants when Food tab is selected
  useEffect(() => {
    if (category !== "food") return;
    setDbLoading(true);
    const params = new URLSearchParams({ city: "Seoul", day: String(activeDay + 1), limit: "20" });
    fetch(`/api/restaurants/recommend?${params}`)
      .then((r) => r.json())
      .then((data: { restaurants: RecommendedRestaurant[] }) => { setDbFoods(data.restaurants ?? []); setDbLoading(false); })
      .catch(() => setDbLoading(false));
  }, [category, activeDay]);

  const filtered = useMemo(() => {
    const q = query.toLowerCase().trim();
    return CURATED_PLACES.filter((p) => {
      const matchCat = category === "all" || p.category === category;
      const matchQ =
        !q ||
        p.name.toLowerCase().includes(q) ||
        p.neighborhood.toLowerCase().includes(q) ||
        p.tags.some((t) => t.toLowerCase().includes(q));
      return matchCat && matchQ;
    });
  }, [category, query]);

  const handleAdd = (p: typeof CURATED_PLACES[0]) => {
    const place: PlaceItem = {
      ...p,
      id: `curated_${Date.now()}_${Math.random().toString(36).slice(2, 6)}`,
      whyPicked: "Added from curated list",
    };
    onAdd(place);
  };

  const handleAddDb = (r: RecommendedRestaurant) => {
    const dish = r.recommended_menu?.[0];
    const place: PlaceItem = {
      id: `db_${r.id}_${Date.now()}`,
      name: r.name,
      category: "food",
      neighborhood: r.district ?? r.neighborhood ?? "Seoul",
      duration: "1 hour",
      bestTime: "",
      expertTip: dish ? `Try: ${dish.name}${dish.korean_name ? ` (${dish.korean_name})` : ""}` : (r.description ?? ""),
      insiderNote: r.why_visit ?? undefined,
      whyPicked: r.travel_theme?.[0] ?? undefined,
      emoji: "🍽️",
    };
    onAdd(place);
  };

  const THEME_BADGE: Record<string, { bg: string; text: string }> = {
    "Michelin-listed": { bg: "bg-red-100", text: "text-red-700" },
    "TV Feature": { bg: "bg-purple-100", text: "text-purple-700" },
    "Hidden Gem": { bg: "bg-emerald-100", text: "text-emerald-700" },
    "Foodie Favorite": { bg: "bg-orange-100", text: "text-orange-700" },
  };

  const filteredDb = useMemo(() => {
    const q = query.toLowerCase().trim();
    if (!q) return dbFoods;
    return dbFoods.filter((r) =>
      r.name.toLowerCase().includes(q) ||
      (r.korean_name ?? "").toLowerCase().includes(q) ||
      (r.district ?? "").toLowerCase().includes(q)
    );
  }, [dbFoods, query]);

  return (
    <>
      {/* Backdrop */}
      <div
        className={`fixed inset-0 z-40 bg-black/40 transition-opacity duration-300 ${
          open ? "opacity-100" : "pointer-events-none opacity-0"
        }`}
        onClick={onClose}
      />

      {/* Drawer */}
      <div
        className={`fixed inset-x-0 bottom-0 z-50 flex flex-col rounded-t-2xl bg-white shadow-2xl transition-transform duration-300 ${
          open ? "translate-y-0" : "translate-y-full"
        }`}
        style={{ maxHeight: "82vh" }}
      >
        {/* Handle */}
        <div className="flex justify-center pt-3 pb-1">
          <div className="h-1 w-10 rounded-full bg-slate-200" />
        </div>

        {/* Header */}
        <div className="flex items-center justify-between px-4 py-3">
          <div>
            <h3 className="font-bold text-slate-800">Add a place</h3>
            <p className="text-xs text-slate-500">{filtered.length} spots available</p>
          </div>
          <button
            onClick={onClose}
            className="flex size-8 items-center justify-center rounded-full text-slate-400 hover:bg-slate-100 hover:text-slate-600 transition"
          >
            <svg className="size-5" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
            </svg>
          </button>
        </div>

        {/* Search */}
        <div className="px-4 pb-2">
          <div className="relative">
            <svg className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-slate-400" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M8 4a4 4 0 100 8 4 4 0 000-8zM2 8a6 6 0 1110.89 3.476l4.817 4.817a1 1 0 01-1.414 1.414l-4.816-4.816A6 6 0 012 8z" clipRule="evenodd" />
            </svg>
            <input
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search by name, area, or vibe..."
              className="w-full rounded-xl border border-slate-200 py-2.5 pl-9 pr-4 text-sm text-slate-800 placeholder:text-slate-400 focus:border-teal-500 focus:outline-none"
            />
          </div>
        </div>

        {/* Category filter */}
        <div className="flex gap-2 overflow-x-auto px-4 pb-4 pt-2">
          {CATEGORIES.map((cat) => (
            <button
              key={cat.id}
              onClick={() => setCategory(cat.id)}
              className={`shrink-0 rounded-full px-4 py-2 text-sm font-semibold transition ${
                category === cat.id
                  ? "bg-teal-600 text-white"
                  : "bg-slate-100 text-slate-600 hover:bg-teal-50 hover:text-teal-700"
              }`}
            >
              {cat.label}
            </button>
          ))}
        </div>

        {/* Place list */}
        <div className="flex-1 overflow-y-auto px-4 pb-6">
          {/* Food tab: show DB restaurants */}
          {category === "food" ? (
            dbLoading ? (
              <div className="space-y-2 pt-2">
                {[1,2,3].map((i) => <div key={i} className="h-16 rounded-xl bg-slate-100 animate-pulse" />)}
              </div>
            ) : filteredDb.length === 0 ? (
              <div className="py-12 text-center text-sm text-slate-400">No restaurants found for this area.</div>
            ) : (
              <div className="space-y-2 pt-1">
                <p className="text-[11px] text-slate-400 mb-2">
                  Showing curated picks near <span className="font-semibold text-slate-600">Day {activeDay + 1}</span>&apos;s area
                </p>
                {filteredDb.map((r) => {
                  const already = existingNames.has(r.name);
                  const dish = r.recommended_menu?.[0];
                  const topTheme = (r.travel_theme ?? []).find((t) => t in THEME_BADGE);
                  const badge = topTheme ? THEME_BADGE[topTheme] : null;
                  return (
                    <div key={r.id} className="flex items-start gap-3 rounded-xl border border-slate-100 bg-white p-3 shadow-sm">
                      <span className="text-xl shrink-0 mt-0.5">🍽️</span>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-baseline gap-1.5 flex-wrap">
                          <p className="font-semibold text-sm text-slate-800">{r.name}</p>
                          {r.korean_name && <span className="text-[11px] text-slate-400">{r.korean_name}</span>}
                        </div>
                        <div className="mt-0.5 flex flex-wrap items-center gap-1.5">
                          {badge && topTheme && <span className={`rounded-full px-1.5 py-0.5 text-[10px] font-bold ${badge.bg} ${badge.text}`}>{topTheme}</span>}
                          {r.district && <span className="text-[11px] text-slate-400">📍 {r.district}</span>}
                        </div>
                        {dish && <p className="mt-0.5 text-xs text-teal-700 truncate">Try: {dish.name}{dish.korean_name ? ` (${dish.korean_name})` : ""}</p>}
                      </div>
                      {onAddMeal ? (
                        <div className="flex shrink-0 flex-col gap-1">
                          {(() => {
                            const isLunch = activeMealPicks?.[0]?.name === r.name;
                            const isDinner = activeMealPicks?.[1]?.name === r.name;
                            return (
                              <>
                                <button
                                  onClick={() => !isLunch && onAddMeal(r, 0)}
                                  disabled={isLunch}
                                  className={`rounded-lg px-2.5 py-1 text-[11px] font-semibold transition ${isLunch ? "bg-amber-100 text-amber-600 cursor-default" : "bg-amber-500 text-white hover:bg-amber-600 active:scale-95"}`}
                                >
                                  {isLunch ? "✓ Lunch" : "+ Lunch"}
                                </button>
                                <button
                                  onClick={() => !isDinner && onAddMeal(r, 1)}
                                  disabled={isDinner}
                                  className={`rounded-lg px-2.5 py-1 text-[11px] font-semibold transition ${isDinner ? "bg-orange-100 text-orange-600 cursor-default" : "bg-orange-500 text-white hover:bg-orange-600 active:scale-95"}`}
                                >
                                  {isDinner ? "✓ Dinner" : "+ Dinner"}
                                </button>
                              </>
                            );
                          })()}
                        </div>
                      ) : (
                        <button
                          onClick={() => !already && handleAddDb(r)}
                          disabled={already}
                          className={`shrink-0 rounded-lg px-3 py-1.5 text-xs font-semibold transition ${already ? "bg-slate-100 text-slate-400 cursor-default" : "bg-teal-600 text-white hover:bg-teal-700 active:scale-95"}`}
                        >
                          {already ? "✓ Added" : "+ Add"}
                        </button>
                      )}
                    </div>
                  );
                })}
              </div>
            )
          ) : (
            /* Non-food tabs: use curatedPlaces as before */
            <>
              {filtered.length === 0 && (
                <div className="py-12 text-center text-sm text-slate-400">No places match your search.</div>
              )}
              <div className="space-y-2">
                {filtered.map((place) => {
                  const already = existingNames.has(place.name);
                  return (
                    <div key={place.name} className="flex items-center gap-3 rounded-xl border border-slate-100 bg-white p-3 shadow-sm">
                      <span className="text-2xl shrink-0">{place.emoji}</span>
                      <div className="flex-1 min-w-0">
                        <p className="font-semibold text-sm text-slate-800 truncate">{place.name}</p>
                        <p className="text-xs text-slate-500 truncate">📍 {place.neighborhood} · ⏱ {place.duration}</p>
                        <p className="mt-0.5 text-xs text-teal-700 line-clamp-1">{place.expertTip}</p>
                      </div>
                      <button
                        onClick={() => !already && handleAdd(place)}
                        disabled={already}
                        className={`shrink-0 rounded-lg px-3 py-1.5 text-xs font-semibold transition ${already ? "bg-slate-100 text-slate-400 cursor-default" : "bg-teal-600 text-white hover:bg-teal-700 active:scale-95"}`}
                      >
                        {already ? "✓ Added" : "+ Add"}
                      </button>
                    </div>
                  );
                })}
              </div>
            </>
          )}
        </div>
      </div>
    </>
  );
}
