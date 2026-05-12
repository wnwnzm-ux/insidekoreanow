"use client";

import { useState, useRef } from "react";
import { CATEGORIES, PLACES, getPlacesByCategory, type Place, type PlaceCategory, type PlanItem } from "./data";
import { MapPanel } from "./MapPanel";

// ── Helpers ────────────────────────────────────────────────────────────────────

function StarRating({ rating }: { rating: number }) {
  return (
    <span className="flex items-center gap-1 text-xs text-amber-500">
      <svg className="size-3 fill-current" viewBox="0 0 20 20">
        <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
      </svg>
      {rating.toFixed(1)}
    </span>
  );
}

const PRICE_COLOR: Record<string, string> = {
  "$": "text-green-600",
  "$$": "text-amber-600",
  "$$$": "text-orange-600",
  "$$$$": "text-red-600",
};

// ── Left Column: Category Panel ────────────────────────────────────────────────

function CategoryPanel({ onAdd, planItems }: { onAdd: (place: Place) => void; planItems: PlanItem[] }) {
  const [activeCategory, setActiveCategory] = useState<PlaceCategory>("accommodation");
  const places = getPlacesByCategory(activeCategory);
  const addedIds = new Set(planItems.map((i) => i.place.id));

  return (
    <div className="flex h-full flex-col overflow-hidden rounded-2xl border border-zinc-200 bg-white shadow-sm">
      {/* Category Tabs */}
      <div className="border-b border-zinc-100 px-3 pt-3">
        <div className="flex flex-wrap gap-1.5 pb-3">
          {CATEGORIES.map((cat) => (
            <button
              key={cat.id}
              onClick={() => setActiveCategory(cat.id)}
              className={`flex items-center gap-1.5 rounded-full px-3 py-1.5 text-xs font-medium transition ${
                activeCategory === cat.id
                  ? "bg-teal-700 text-white shadow-sm"
                  : "bg-zinc-100 text-slate-600 hover:bg-zinc-200"
              }`}
            >
              <span>{cat.emoji}</span>
              <span>{cat.label}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Place Cards */}
      <div className="flex-1 overflow-y-auto p-3">
        <div className="space-y-2">
          {places.map((place) => {
            const added = addedIds.has(place.id);
            return (
              <div
                key={place.id}
                className="group rounded-xl border border-zinc-100 bg-zinc-50 p-3 transition hover:border-teal-200 hover:bg-white hover:shadow-sm"
              >
                <div className="flex items-start justify-between gap-2">
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-semibold text-slate-900">{place.name}</p>
                    <p className="mt-0.5 text-xs text-slate-500">{place.location}</p>
                  </div>
                  <button
                    onClick={() => !added && onAdd(place)}
                    disabled={added}
                    className={`flex size-7 shrink-0 items-center justify-center rounded-full text-sm font-bold transition ${
                      added
                        ? "bg-teal-100 text-teal-600 cursor-default"
                        : "bg-teal-700 text-white hover:bg-teal-800 active:scale-95"
                    }`}
                    title={added ? "Already in plan" : "Add to plan"}
                  >
                    {added ? "✓" : "+"}
                  </button>
                </div>
                <p className="mt-1.5 line-clamp-2 text-xs leading-relaxed text-slate-500">
                  {place.description}
                </p>
                <div className="mt-2 flex items-center gap-2">
                  <StarRating rating={place.rating} />
                  <span className={`text-xs font-medium ${PRICE_COLOR[place.priceRange]}`}>
                    {place.priceRange}
                  </span>
                  <div className="flex flex-wrap gap-1">
                    {place.tags.slice(0, 2).map((tag) => (
                      <span key={tag} className="rounded-full bg-zinc-200 px-2 py-0.5 text-[10px] text-slate-600">
                        {tag}
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

// ── Middle Column: My Plan ─────────────────────────────────────────────────────

function MyPlan({
  planItems,
  totalDays,
  activeDay,
  onDayChange,
  onRemove,
  onReorder,
}: {
  planItems: PlanItem[];
  totalDays: number;
  activeDay: number;
  onDayChange: (day: number) => void;
  onRemove: (id: string) => void;
  onReorder: (items: PlanItem[]) => void;
}) {
  const dayItems = planItems.filter((i) => i.day === activeDay).sort((a, b) => a.order - b.order);

  // Drag state
  const dragId = useRef<string | null>(null);
  const dragOverId = useRef<string | null>(null);

  function handleDragStart(id: string) {
    dragId.current = id;
  }

  function handleDragOver(e: React.DragEvent, id: string) {
    e.preventDefault();
    dragOverId.current = id;
  }

  function handleDrop() {
    if (!dragId.current || !dragOverId.current || dragId.current === dragOverId.current) return;

    const fromIndex = dayItems.findIndex((i) => i.id === dragId.current);
    const toIndex = dayItems.findIndex((i) => i.id === dragOverId.current);
    if (fromIndex === -1 || toIndex === -1) return;

    const reordered = [...dayItems];
    const [moved] = reordered.splice(fromIndex, 1);
    reordered.splice(toIndex, 0, moved);

    const updated = reordered.map((item, idx) => ({ ...item, order: idx }));
    const otherDays = planItems.filter((i) => i.day !== activeDay);
    onReorder([...otherDays, ...updated]);

    dragId.current = null;
    dragOverId.current = null;
  }

  const catMap = Object.fromEntries(CATEGORIES.map((c) => [c.id, c]));

  return (
    <div className="flex h-full flex-col overflow-hidden rounded-2xl border border-zinc-200 bg-white shadow-sm">
      {/* Header */}
      <div className="border-b border-zinc-100 px-4 py-3">
        <h2 className="text-sm font-semibold text-slate-900">My Plan</h2>
        <p className="text-xs text-slate-500">{planItems.length} place{planItems.length !== 1 ? "s" : ""} added</p>
      </div>

      {/* Day Tabs */}
      <div className="border-b border-zinc-100 px-3 pt-2">
        <div className="flex gap-1 overflow-x-auto pb-2">
          {Array.from({ length: totalDays }, (_, i) => i + 1).map((day) => {
            const count = planItems.filter((p) => p.day === day).length;
            return (
              <button
                key={day}
                onClick={() => onDayChange(day)}
                className={`flex shrink-0 flex-col items-center rounded-xl px-3 py-1.5 text-xs font-medium transition ${
                  activeDay === day
                    ? "bg-teal-700 text-white"
                    : "bg-zinc-100 text-slate-600 hover:bg-zinc-200"
                }`}
              >
                <span>Day {day}</span>
                {count > 0 && (
                  <span className={`mt-0.5 text-[10px] font-bold ${activeDay === day ? "text-teal-200" : "text-teal-700"}`}>
                    {count}
                  </span>
                )}
              </button>
            );
          })}
        </div>
      </div>

      {/* Items */}
      <div className="flex-1 overflow-y-auto p-3">
        {dayItems.length === 0 ? (
          <div className="flex h-full flex-col items-center justify-center gap-2 text-center">
            <div className="text-3xl">📍</div>
            <p className="text-sm font-medium text-slate-600">No places for Day {activeDay}</p>
            <p className="text-xs text-slate-400">Add places from the left panel</p>
          </div>
        ) : (
          <div className="space-y-2">
            {dayItems.map((item, idx) => {
              const cat = catMap[item.place.category];
              return (
                <div
                  key={item.id}
                  draggable
                  onDragStart={() => handleDragStart(item.id)}
                  onDragOver={(e) => handleDragOver(e, item.id)}
                  onDrop={handleDrop}
                  className="group flex cursor-grab items-start gap-2 rounded-xl border border-zinc-100 bg-zinc-50 p-3 transition hover:border-teal-200 hover:bg-white hover:shadow-sm active:cursor-grabbing"
                >
                  {/* Order badge */}
                  <div className="flex size-6 shrink-0 items-center justify-center rounded-full bg-teal-700 text-[11px] font-bold text-white">
                    {idx + 1}
                  </div>

                  {/* Info */}
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-1.5">
                      <span className="text-sm">{cat?.emoji}</span>
                      <p className="truncate text-sm font-semibold text-slate-900">{item.place.name}</p>
                    </div>
                    <p className="mt-0.5 text-xs text-slate-500">{item.place.location}</p>
                  </div>

                  {/* Drag handle + delete */}
                  <div className="flex shrink-0 items-center gap-1 opacity-0 transition group-hover:opacity-100">
                    <svg className="size-4 text-slate-300" fill="currentColor" viewBox="0 0 20 20">
                      <path d="M7 2a2 2 0 1 0 .001 4.001A2 2 0 0 0 7 2zm0 6a2 2 0 1 0 .001 4.001A2 2 0 0 0 7 8zm0 6a2 2 0 1 0 .001 4.001A2 2 0 0 0 7 14zm6-8a2 2 0 1 0-.001-4.001A2 2 0 0 0 13 6zm0 2a2 2 0 1 0 .001 4.001A2 2 0 0 0 13 8zm0 6a2 2 0 1 0 .001 4.001A2 2 0 0 0 13 14z" />
                    </svg>
                    <button
                      onClick={() => onRemove(item.id)}
                      className="flex size-6 items-center justify-center rounded-full text-slate-400 transition hover:bg-red-50 hover:text-red-500"
                    >
                      <svg className="size-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                      </svg>
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}

// ── Root Component ─────────────────────────────────────────────────────────────

export function PlannerClient() {
  const [totalDays, setTotalDays] = useState(3);
  const [activeDay, setActiveDay] = useState(1);
  const [planItems, setPlanItems] = useState<PlanItem[]>([]);
  const nextId = useRef(1);

  function addPlace(place: Place) {
    setPlanItems((prev) => {
      const dayItems = prev.filter((i) => i.day === activeDay);
      return [
        ...prev,
        {
          id: `item-${nextId.current++}`,
          place,
          day: activeDay,
          order: dayItems.length,
        },
      ];
    });
  }

  function removeItem(id: string) {
    setPlanItems((prev) => prev.filter((i) => i.id !== id));
  }

  function handleDaysChange(days: number) {
    setTotalDays(days);
    if (activeDay > days) setActiveDay(days);
    // Remove items from days that no longer exist
    setPlanItems((prev) => prev.filter((i) => i.day <= days));
  }

  return (
    <div className="flex min-h-screen flex-col bg-zinc-50">
      {/* Top bar */}
      <div className="border-b border-zinc-200 bg-white px-4 py-3 shadow-sm sm:px-6 lg:px-8">
        <div className="mx-auto flex max-w-[1400px] flex-wrap items-center justify-between gap-3">
          <div>
            <h1 className="text-lg font-semibold text-slate-900">Plan your Korea trip</h1>
            <p className="text-xs text-slate-500">Pick places → build your itinerary → visualize your route</p>
          </div>
          <div className="flex items-center gap-2">
            <label className="text-xs font-medium text-slate-600">Trip duration:</label>
            <select
              value={totalDays}
              onChange={(e) => handleDaysChange(Number(e.target.value))}
              className="rounded-lg border border-zinc-200 bg-white px-2.5 py-1.5 text-sm text-slate-800 shadow-sm focus:outline-none focus:ring-2 focus:ring-teal-600/20"
            >
              {[1, 2, 3, 4, 5, 6, 7, 10, 14].map((d) => (
                <option key={d} value={d}>
                  {d} {d === 1 ? "day" : "days"}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* 3-column layout */}
      <div className="mx-auto w-full max-w-[1400px] flex-1 px-4 py-4 sm:px-6 lg:px-8">
        <div className="grid h-[calc(100vh-140px)] grid-cols-1 gap-4 lg:grid-cols-[320px_1fr_320px]">
          {/* Left */}
          <CategoryPanel onAdd={addPlace} planItems={planItems} />

          {/* Middle */}
          <MyPlan
            planItems={planItems}
            totalDays={totalDays}
            activeDay={activeDay}
            onDayChange={setActiveDay}
            onRemove={removeItem}
            onReorder={setPlanItems}
          />

          {/* Right */}
          <MapPanel planItems={planItems} activeDay={activeDay} />
        </div>
      </div>
    </div>
  );
}
