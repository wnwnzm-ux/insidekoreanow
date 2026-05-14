"use client";

import { useState } from "react";
import type { PlaceItem, DayPlan } from "./types";
import type { RecommendedRestaurant } from "@/app/api/restaurants/recommend/route";
import { MockMap } from "./MockMap";
import { AddPlaceDrawer } from "./AddPlaceDrawer";

const CATEGORY_STYLES: Record<string, { bg: string; text: string }> = {
  food: { bg: "bg-orange-100", text: "text-orange-700" },
  attraction: { bg: "bg-teal-100", text: "text-teal-700" },
  shopping: { bg: "bg-pink-100", text: "text-pink-700" },
  cafe: { bg: "bg-amber-100", text: "text-amber-700" },
  neighborhood: { bg: "bg-slate-100", text: "text-slate-600" },
};

function PlaceRow({
  place,
  index,
  total,
  onMoveUp,
  onMoveDown,
  onDelete,
  isHighlighted,
  onClick,
}: {
  place: PlaceItem;
  index: number;
  total: number;
  onMoveUp: () => void;
  onMoveDown: () => void;
  onDelete: () => void;
  isHighlighted: boolean;
  onClick: () => void;
}) {
  const cat = CATEGORY_STYLES[place.category] ?? CATEGORY_STYLES.attraction;

  return (
    <div
      onClick={onClick}
      className={`flex items-center gap-3 rounded-xl border-2 p-3 transition-all cursor-pointer ${
        isHighlighted
          ? "border-teal-400 bg-teal-50 shadow-sm"
          : "border-slate-100 bg-white hover:border-teal-200 hover:bg-slate-50"
      }`}
    >
      <span className="flex size-6 shrink-0 items-center justify-center rounded-full bg-teal-600 text-xs font-bold text-white">
        {index + 1}
      </span>

      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-1.5 flex-wrap">
          <span className="text-base leading-none">{place.emoji}</span>
          <span className="font-semibold text-sm text-slate-800 truncate">{place.name}</span>
          <span className={`shrink-0 rounded-full px-1.5 py-0.5 text-[10px] font-medium ${cat.bg} ${cat.text}`}>
            {place.category}
          </span>
        </div>
        <p className="mt-0.5 text-xs text-slate-500 truncate">
          📍 {place.neighborhood} · ⏱ {place.duration}
        </p>
      </div>

      <div className="flex items-center gap-1 shrink-0">
        <button
          onClick={(e) => { e.stopPropagation(); onMoveUp(); }}
          disabled={index === 0}
          className="flex size-6 items-center justify-center rounded text-slate-400 hover:bg-slate-100 hover:text-slate-700 disabled:opacity-20 transition"
          title="Move up"
        >
          <svg className="size-3.5" viewBox="0 0 20 20" fill="currentColor">
            <path fillRule="evenodd" d="M14.707 12.707a1 1 0 01-1.414 0L10 9.414l-3.293 3.293a1 1 0 01-1.414-1.414l4-4a1 1 0 011.414 0l4 4a1 1 0 010 1.414z" clipRule="evenodd" />
          </svg>
        </button>
        <button
          onClick={(e) => { e.stopPropagation(); onMoveDown(); }}
          disabled={index === total - 1}
          className="flex size-6 items-center justify-center rounded text-slate-400 hover:bg-slate-100 hover:text-slate-700 disabled:opacity-20 transition"
          title="Move down"
        >
          <svg className="size-3.5" viewBox="0 0 20 20" fill="currentColor">
            <path fillRule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clipRule="evenodd" />
          </svg>
        </button>
        <button
          onClick={(e) => { e.stopPropagation(); onDelete(); }}
          className="flex size-6 items-center justify-center rounded text-slate-300 hover:bg-red-50 hover:text-red-500 transition"
          title="Remove"
        >
          <svg className="size-3.5" viewBox="0 0 20 20" fill="currentColor">
            <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
          </svg>
        </button>
      </div>
    </div>
  );
}

interface Props {
  days: DayPlan[];
  setDays: (days: DayPlan[]) => void;
  onBack: () => void;
  mealPicks?: Record<number, RecommendedRestaurant[]>;
}

export function PlanStep4({ days, setDays, onBack, mealPicks }: Props) {
  const [activeDay, setActiveDay] = useState(0);
  const [mobileTab, setMobileTab] = useState<"plan" | "map">("plan");
  const [highlightedId, setHighlightedId] = useState<string>("");
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [saved, setSaved] = useState(false);

  const existingNames = new Set(days.flatMap((d) => d.places.map((p) => p.name)));

  const movePlace = (dayIdx: number, placeIdx: number, dir: -1 | 1) => {
    const next = days.map((d) => ({ ...d, places: [...d.places] }));
    const places = next[dayIdx].places;
    const target = placeIdx + dir;
    if (target < 0 || target >= places.length) return;
    [places[placeIdx], places[target]] = [places[target], places[placeIdx]];
    setDays(next);
  };

  const deletePlace = (dayIdx: number, placeIdx: number) => {
    const next = days.map((d) => ({ ...d, places: [...d.places] }));
    next[dayIdx].places.splice(placeIdx, 1);
    setDays(next);
  };

  const addPlace = (place: PlaceItem) => {
    const next = days.map((d) => ({ ...d, places: [...d.places] }));
    next[activeDay].places.push(place);
    setDays(next);
  };

  const handleSave = () => {
    setSaved(true);
    setTimeout(() => setSaved(false), 2500);
  };

  const totalPlaces = days.reduce((s, d) => s + d.places.length, 0);

  return (
    <>
      <div className="flex h-full flex-col">
        {/* Toolbar */}
        <div className="flex items-center justify-between gap-3 py-3">
          <div>
            <h2 className="font-bold text-slate-800">Customize Your Plan</h2>
            <p className="text-xs text-slate-500">{totalPlaces} places · {days.length} days</p>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={onBack}
              className="rounded-xl border border-slate-200 px-3 py-2 text-sm text-slate-600 hover:bg-slate-50 transition"
            >
              ← Plan
            </button>
            <button
              onClick={handleSave}
              className={`rounded-xl px-4 py-2 text-sm font-semibold transition ${
                saved ? "bg-green-500 text-white" : "bg-teal-600 text-white hover:bg-teal-700"
              }`}
            >
              {saved ? "✓ Saved!" : "Save Plan"}
            </button>
          </div>
        </div>

        {/* Mobile tab toggle */}
        <div className="mb-3 flex rounded-xl bg-slate-100 p-1 lg:hidden">
          <button
            onClick={() => setMobileTab("plan")}
            className={`flex-1 rounded-lg py-2 text-sm font-semibold transition ${
              mobileTab === "plan" ? "bg-white shadow-sm text-teal-700" : "text-slate-500"
            }`}
          >
            📋 Itinerary
          </button>
          <button
            onClick={() => setMobileTab("map")}
            className={`flex-1 rounded-lg py-2 text-sm font-semibold transition ${
              mobileTab === "map" ? "bg-white shadow-sm text-teal-700" : "text-slate-500"
            }`}
          >
            🗺️ Map
          </button>
        </div>

        {/* Main content */}
        <div className="flex flex-1 gap-4 min-h-0">
          {/* Left: Plan list */}
          <div className={`flex flex-col gap-3 overflow-y-auto lg:flex lg:w-1/2 w-full ${mobileTab === "plan" ? "flex" : "hidden"}`}>
            {/* Day tabs */}
            <div className="flex gap-1.5 overflow-x-auto pb-1">
              {days.map((day, i) => (
                <button
                  key={day.day}
                  onClick={() => setActiveDay(i)}
                  className={`shrink-0 rounded-xl px-3 py-1.5 text-sm font-semibold transition ${
                    activeDay === i
                      ? "bg-teal-600 text-white"
                      : "bg-slate-100 text-slate-600 hover:bg-teal-50"
                  }`}
                >
                  Day {day.day}
                </button>
              ))}
            </div>

            {/* Day header */}
            <div className="flex items-center gap-2">
              <span className="flex size-6 items-center justify-center rounded-full bg-teal-600 text-xs font-bold text-white">
                {days[activeDay]?.day}
              </span>
              <span className="font-semibold text-slate-800 text-sm">
                {days[activeDay]?.theme}
              </span>
            </div>

            {/* Place rows */}
            <div className="space-y-2">
              {days[activeDay]?.places.map((place, pi) => (
                <PlaceRow
                  key={place.id}
                  place={place}
                  index={pi}
                  total={days[activeDay].places.length}
                  onMoveUp={() => movePlace(activeDay, pi, -1)}
                  onMoveDown={() => movePlace(activeDay, pi, 1)}
                  onDelete={() => deletePlace(activeDay, pi)}
                  isHighlighted={highlightedId === place.id}
                  onClick={() => setHighlightedId((id) => (id === place.id ? "" : place.id))}
                />
              ))}
            </div>

            {/* Empty state */}
            {days[activeDay]?.places.length === 0 && (
              <div className="rounded-xl border-2 border-dashed border-slate-200 py-8 text-center text-sm text-slate-400">
                All places removed. This day is free!
              </div>
            )}

            {/* Meal picks from curated DB */}
            {(mealPicks?.[activeDay]?.length ?? 0) > 0 && (
              <div className="rounded-xl border border-slate-100 bg-slate-50 p-3">
                <div className="mb-2 flex items-center gap-1.5">
                  <span className="text-sm">🍽️</span>
                  <span className="text-xs font-bold uppercase tracking-wider text-slate-500">Meal Picks</span>
                </div>
                <div className="space-y-2">
                  {mealPicks![activeDay].map((r, i) => {
                    const dish = r.recommended_menu?.[0];
                    return (
                      <div key={r.id} className="flex items-center gap-3 rounded-lg border border-slate-200 bg-white p-2.5">
                        <span className={`flex size-5 shrink-0 items-center justify-center rounded-full text-[10px] font-bold ${i === 0 ? "bg-amber-100 text-amber-700" : "bg-purple-100 text-purple-700"}`}>
                          {i === 0 ? "L" : "D"}
                        </span>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-1.5">
                            <span className="text-xs font-bold text-slate-500">{i === 0 ? "Lunch" : "Dinner"}</span>
                            <span className="font-semibold text-sm text-slate-800 truncate">{r.name}</span>
                            {r.korean_name && <span className="text-[11px] text-slate-400 truncate">{r.korean_name}</span>}
                          </div>
                          <p className="text-[11px] text-slate-400 truncate">
                            📍 {r.district ?? r.neighborhood ?? "Seoul"}
                            {dish && <> · {dish.name}</>}
                          </p>
                        </div>
                        {r.maps_url && (
                          <a href={r.maps_url} target="_blank" rel="noopener noreferrer"
                            className="shrink-0 rounded-md border border-teal-200 bg-teal-50 px-2 py-1 text-[10px] font-semibold text-teal-700 hover:bg-teal-100 transition-colors">
                            Map
                          </a>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Add a place button */}
            <button
              onClick={() => setDrawerOpen(true)}
              className="flex w-full items-center justify-center gap-2 rounded-xl border-2 border-dashed border-teal-300 py-3 text-sm font-semibold text-teal-600 transition hover:border-teal-500 hover:bg-teal-50"
            >
              <svg className="size-4" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M10 5a1 1 0 011 1v3h3a1 1 0 110 2h-3v3a1 1 0 11-2 0v-3H6a1 1 0 110-2h3V6a1 1 0 011-1z" clipRule="evenodd" />
              </svg>
              Add a place to Day {days[activeDay]?.day}
            </button>

            {/* Summary */}
            <div className="mt-1 rounded-xl bg-slate-50 p-4 text-sm">
              <p className="font-semibold text-slate-700 mb-2">Plan summary</p>
              <div className="space-y-1">
                {days.map((day) => (
                  <div key={day.day} className="flex justify-between text-xs text-slate-600">
                    <span>Day {day.day}: {day.theme}</span>
                    <span className="text-slate-400">{day.places.length} stops</span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Right: Mock map */}
          <div className={`lg:flex lg:w-1/2 flex-col min-h-[400px] lg:min-h-0 w-full ${mobileTab === "map" ? "flex" : "hidden"}`}>
            <p className="mb-2 text-xs font-medium text-slate-500">
              Click a pin to highlight · dashed lines show daily route
            </p>
            <div className="flex-1 min-h-[360px]">
              <MockMap
                days={days}
                activeDay={activeDay + 1}
                highlightedPlaceId={highlightedId}
                onPinClick={(id) => setHighlightedId((prev) => (prev === id ? "" : id))}
              />
            </div>
          </div>
        </div>
      </div>

      {/* Add place drawer */}
      <AddPlaceDrawer
        open={drawerOpen}
        onClose={() => setDrawerOpen(false)}
        onAdd={(place) => {
          addPlace(place);
          setDrawerOpen(false);
        }}
        existingNames={existingNames}
        activeDay={activeDay}
      />
    </>
  );
}
