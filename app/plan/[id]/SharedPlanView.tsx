"use client";

import type { GeneratedPlan, PlaceItem } from "@/app/plan/types";

const CATEGORY_STYLES: Record<string, { bg: string; text: string; label: string }> = {
  food: { bg: "bg-orange-100", text: "text-orange-700", label: "Food" },
  attraction: { bg: "bg-teal-100", text: "text-teal-700", label: "Attraction" },
  shopping: { bg: "bg-pink-100", text: "text-pink-700", label: "Shopping" },
  cafe: { bg: "bg-amber-100", text: "text-amber-700", label: "Café" },
  neighborhood: { bg: "bg-slate-100", text: "text-slate-600", label: "Explore" },
};

function PlaceCard({ place, index }: { place: PlaceItem; index: number }) {
  const cat = CATEGORY_STYLES[place.category] ?? CATEGORY_STYLES.attraction;

  return (
    <div className="relative rounded-2xl border border-slate-100 bg-white shadow-sm">
      <div className="absolute -left-3 top-4 flex size-6 items-center justify-center rounded-full bg-teal-600 text-xs font-bold text-white shadow-sm">
        {index + 1}
      </div>
      <div className="p-4 pl-6">
        <div className="flex items-start gap-2">
          <span className="text-2xl leading-none">{place.emoji}</span>
          <div>
            <h3 className="font-bold text-slate-800 leading-tight">{place.name}</h3>
            <div className="mt-1 flex flex-wrap items-center gap-1.5 text-xs text-slate-500">
              <span className={`rounded-full px-2 py-0.5 font-medium ${cat.bg} ${cat.text}`}>
                {cat.label}
              </span>
              <span>📍 {place.neighborhood}</span>
              <span>⏱ {place.duration}</span>
            </div>
          </div>
        </div>
        <div className="mt-2 flex items-center gap-1.5 text-xs text-slate-500">
          <span>🕐</span>
          <span className="font-medium text-slate-600">{place.bestTime}</span>
        </div>
        <div className="mt-3 rounded-xl bg-teal-50 p-3">
          <span className="inline-flex items-center gap-1 rounded-full bg-teal-600 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide text-white">
            Expert Tip
          </span>
          <p className="mt-1 text-xs leading-relaxed text-teal-800">{place.expertTip}</p>
        </div>
      </div>
    </div>
  );
}

export function SharedPlanView({ plan }: { plan: GeneratedPlan }) {
  return (
    <div>
      {/* Plan hero */}
      <div className="mb-6 rounded-2xl bg-gradient-to-br from-teal-600 to-teal-800 p-6 text-white">
        <div className="mb-2 flex items-center gap-2">
          <span className="rounded-full bg-teal-500/40 px-2.5 py-0.5 text-xs font-bold uppercase tracking-wider">
            Korea Itinerary
          </span>
          <span className="rounded-full bg-teal-500/40 px-2.5 py-0.5 text-xs font-medium">
            {plan.days.length} {plan.days.length === 1 ? "day" : "days"}
          </span>
        </div>
        <h2 className="text-xl font-bold leading-snug">{plan.title}</h2>
        <p className="mt-2 text-sm leading-relaxed text-teal-100">{plan.overview}</p>
        <div className="mt-4 flex gap-2.5 rounded-xl bg-teal-700/50 p-3">
          <span className="text-xl shrink-0">👨‍💼</span>
          <p className="text-xs leading-relaxed text-teal-100 italic">
            &ldquo;{plan.expertNote}&rdquo;
          </p>
        </div>
      </div>

      {/* All days — scrolling list */}
      <div className="space-y-8">
        {plan.days.map((day) => (
          <div key={day.day}>
            <div className="mb-4 flex items-center gap-2">
              <span className="flex size-7 items-center justify-center rounded-full bg-teal-600 text-xs font-bold text-white">
                {day.day}
              </span>
              <h3 className="font-bold text-slate-800">{day.theme}</h3>
            </div>
            <div className="space-y-4 pl-3">
              {day.places.map((place, i) => (
                <PlaceCard key={place.id} place={place} index={i} />
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
