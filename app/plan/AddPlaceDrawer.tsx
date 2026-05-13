"use client";

import { useState, useMemo } from "react";
import { CURATED_PLACES } from "./curatedPlaces";
import type { PlaceItem } from "./types";

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
  existingNames: Set<string>;
}

export function AddPlaceDrawer({ open, onClose, onAdd, existingNames }: Props) {
  const [category, setCategory] = useState("all");
  const [query, setQuery] = useState("");

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
        <div className="flex gap-1.5 overflow-x-auto px-4 pb-3 pt-1">
          {CATEGORIES.map((cat) => (
            <button
              key={cat.id}
              onClick={() => setCategory(cat.id)}
              className={`shrink-0 rounded-full px-3 py-1.5 text-xs font-semibold transition ${
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
          {filtered.length === 0 && (
            <div className="py-12 text-center text-sm text-slate-400">
              No places match your search.
            </div>
          )}

          <div className="space-y-2">
            {filtered.map((place) => {
              const already = existingNames.has(place.name);
              return (
                <div
                  key={place.name}
                  className="flex items-center gap-3 rounded-xl border border-slate-100 bg-white p-3 shadow-sm"
                >
                  <span className="text-2xl shrink-0">{place.emoji}</span>

                  <div className="flex-1 min-w-0">
                    <p className="font-semibold text-sm text-slate-800 truncate">
                      {place.name}
                    </p>
                    <p className="text-xs text-slate-500 truncate">
                      📍 {place.neighborhood} · ⏱ {place.duration}
                    </p>
                    <p className="mt-0.5 text-xs text-teal-700 line-clamp-1">
                      {place.expertTip}
                    </p>
                  </div>

                  <button
                    onClick={() => !already && handleAdd(place)}
                    disabled={already}
                    className={`shrink-0 rounded-lg px-3 py-1.5 text-xs font-semibold transition ${
                      already
                        ? "bg-slate-100 text-slate-400 cursor-default"
                        : "bg-teal-600 text-white hover:bg-teal-700 active:scale-95"
                    }`}
                  >
                    {already ? "✓ Added" : "+ Add"}
                  </button>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </>
  );
}
