"use client";

import { useState } from "react";
import type { ReactNode } from "react";
import type { GeneratedPlan, PlaceItem } from "./types";
import type { RecommendedRestaurant } from "@/app/api/restaurants/recommend/route";

const THEME_BADGE: Record<string, { bg: string; text: string }> = {
  "Michelin-listed": { bg: "bg-red-100", text: "text-red-700" },
  "TV Feature": { bg: "bg-purple-100", text: "text-purple-700" },
  "Hidden Gem": { bg: "bg-emerald-100", text: "text-emerald-700" },
  "Foodie Favorite": { bg: "bg-orange-100", text: "text-orange-700" },
};

function MealCard({ r, label }: { r: RecommendedRestaurant; label: "Lunch" | "Dinner" }) {
  const dish = r.recommended_menu?.[0];
  const topTheme = (r.travel_theme ?? []).find((t) => t in THEME_BADGE);
  const badge = topTheme ? THEME_BADGE[topTheme] : null;
  const isLunch = label === "Lunch";

  return (
    <div className="relative rounded-2xl border border-orange-100 bg-orange-50/60 shadow-sm">
      <div className={`absolute -left-3 top-4 flex items-center justify-center rounded-full px-2 py-0.5 text-[10px] font-bold text-white shadow-sm ${isLunch ? "bg-amber-500" : "bg-orange-600"}`}>
        {label}
      </div>
      <div className="flex items-start justify-between gap-3 p-4 pl-6">
        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-1.5">
            <span className="text-xl leading-none">🍽️</span>
            <h3 className="font-bold text-slate-800">{r.name}</h3>
            {r.korean_name && <span className="text-xs text-slate-400">{r.korean_name}</span>}
          </div>
          <div className="mt-1 flex flex-wrap items-center gap-1.5">
            {badge && topTheme && (
              <span className={`rounded-full px-2 py-0.5 text-[10px] font-bold ${badge.bg} ${badge.text}`}>
                {topTheme}
              </span>
            )}
            {r.district && <span className="text-xs text-slate-500">📍 {r.district}</span>}
          </div>
          {dish && (
            <p className="mt-1 text-xs text-slate-600">
              <span className="font-medium">Try:</span> {dish.name}
              {dish.korean_name && <span className="text-slate-400"> ({dish.korean_name})</span>}
            </p>
          )}
        </div>
        {r.maps_url && (
          <a
            href={r.maps_url}
            target="_blank"
            rel="noopener noreferrer"
            className="shrink-0 flex items-center gap-1 rounded-lg border border-teal-200 bg-teal-50 px-2.5 py-1.5 text-[11px] font-semibold text-teal-700 hover:bg-teal-100 transition-colors"
          >
            <svg className="size-3" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M5.05 4.05a7 7 0 119.9 9.9L10 18.9l-4.95-4.95a7 7 0 010-9.9zM10 11a2 2 0 100-4 2 2 0 000 4z" clipRule="evenodd" />
            </svg>
            Map
          </a>
        )}
      </div>
    </div>
  );
}

function MealCardSkeleton({ label }: { label: string }) {
  return (
    <div className="relative rounded-2xl border border-orange-100 bg-orange-50/40 p-4 pl-6">
      <div className="absolute -left-3 top-4 rounded-full bg-amber-200 px-2 py-0.5 text-[10px] font-bold text-white">
        {label}
      </div>
      <div className="h-4 w-1/3 animate-pulse rounded-full bg-orange-100" />
      <div className="mt-2 h-3 w-1/4 animate-pulse rounded-full bg-orange-50" />
    </div>
  );
}

const CATEGORY_STYLES: Record<string, { bg: string; text: string; label: string }> = {
  food: { bg: "bg-orange-100", text: "text-orange-700", label: "Food" },
  attraction: { bg: "bg-teal-100", text: "text-teal-700", label: "Attraction" },
  shopping: { bg: "bg-pink-100", text: "text-pink-700", label: "Shopping" },
  cafe: { bg: "bg-amber-100", text: "text-amber-700", label: "Café" },
  neighborhood: { bg: "bg-slate-100", text: "text-slate-600", label: "Explore" },
};

function PlaceCard({ place, index }: { place: PlaceItem; index: number }) {
  const [expanded, setExpanded] = useState(false);
  const cat = CATEGORY_STYLES[place.category] ?? CATEGORY_STYLES.attraction;
  const hasExpandable = !!place.insiderNote || !!place.whyPicked;

  return (
    <div className="relative rounded-2xl border border-slate-100 bg-white shadow-sm transition hover:shadow-md">
      <div className="absolute -left-3 top-4 flex size-6 items-center justify-center rounded-full bg-teal-600 text-xs font-bold text-white shadow-sm">
        {index + 1}
      </div>

      <div className="p-4 pl-6">
        <div className="flex items-start justify-between gap-2">
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
          {hasExpandable && (
            <button
              onClick={() => setExpanded((e) => !e)}
              className="shrink-0 rounded-full p-1 text-slate-400 hover:bg-slate-100 hover:text-slate-600 transition"
              aria-label="Toggle details"
            >
              <svg className={`size-4 transition-transform ${expanded ? "rotate-180" : ""}`} viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clipRule="evenodd" />
              </svg>
            </button>
          )}
        </div>

        <div className="mt-2 flex items-center gap-1.5 text-xs text-slate-500">
          <span>🕐</span>
          <span className="font-medium text-slate-600">{place.bestTime}</span>
        </div>

        <div className="mt-3 rounded-xl bg-teal-50 p-3">
          <div className="mb-1">
            <span className="inline-flex items-center gap-1 rounded-full bg-teal-600 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide text-white">
              Expert Tip
            </span>
          </div>
          <p className="text-xs leading-relaxed text-teal-800">{place.expertTip}</p>
        </div>

        {expanded && hasExpandable && (
          <div className="mt-3 space-y-3 animate-slide-up">
            {place.insiderNote && (
              <div className="rounded-xl border border-amber-200 bg-amber-50 p-3">
                <div className="flex items-center gap-1.5 mb-1">
                  <span className="text-sm">💡</span>
                  <span className="text-xs font-bold text-amber-800 uppercase tracking-wide">What tourists don&apos;t know</span>
                </div>
                <p className="text-xs leading-relaxed text-amber-900">{place.insiderNote}</p>
              </div>
            )}
            {place.whyPicked && (
              <div className="rounded-xl bg-slate-50 p-3">
                <div className="flex items-center gap-1.5 mb-1">
                  <span className="text-sm">✓</span>
                  <span className="text-xs font-bold text-slate-600 uppercase tracking-wide">Why we picked this for you</span>
                </div>
                <p className="text-xs leading-relaxed text-slate-700">{place.whyPicked}</p>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

type ShareState = "idle" | "saving" | "copied" | "error";

interface Props {
  plan: GeneratedPlan;
  onCustomize: () => void;
  mealPicks?: Record<number, (RecommendedRestaurant | null)[]>;
}

function DaySection({ day, dayIndex, meals }: {
  day: GeneratedPlan["days"][0];
  dayIndex: number;
  meals: (RecommendedRestaurant | null)[] | undefined;
}) {
  const places = day.places;
  const fetched = meals !== undefined;
  const lunch = meals?.[0] ?? null;
  const dinner = meals?.[1] ?? null;
  const lunchAfterIdx = Math.max(1, Math.ceil(places.length / 2));
  const nodes: ReactNode[] = [];
  let lunchInserted = false;

  places.forEach((place, i) => {
    nodes.push(<PlaceCard key={place.id} place={place} index={i} />);
    if (i + 1 === lunchAfterIdx) {
      lunchInserted = true;
      if (!fetched) nodes.push(<MealCardSkeleton key={`${dayIndex}-l-skel`} label="Lunch" />);
      else if (lunch) nodes.push(<MealCard key={`${dayIndex}-l-${lunch.id}`} r={lunch} label="Lunch" />);
    }
  });

  if (!lunchInserted) {
    if (!fetched) nodes.push(<MealCardSkeleton key={`${dayIndex}-l-skel`} label="Lunch" />);
    else if (lunch) nodes.push(<MealCard key={`${dayIndex}-l-${lunch.id}`} r={lunch} label="Lunch" />);
  }

  if (!fetched) nodes.push(<MealCardSkeleton key={`${dayIndex}-d-skel`} label="Dinner" />);
  else if (dinner) nodes.push(<MealCard key={`${dayIndex}-d-${dinner.id}`} r={dinner} label="Dinner" />);

  return (
    <div>
      {/* Day header bar */}
      <div className="mb-5 flex items-center gap-3">
        <div className="flex items-center gap-2.5 rounded-2xl bg-teal-600 px-4 py-2.5 shadow-sm">
          <span className="text-xs font-bold uppercase tracking-widest text-teal-200">Day</span>
          <span className="text-xl font-bold text-white leading-none">{day.day}</span>
        </div>
        <div className="flex-1">
          <h3 className="font-bold text-slate-800 leading-snug">{day.theme}</h3>
          <p className="text-xs text-slate-400">{places.length} stops</p>
        </div>
      </div>
      <div className="space-y-4 pl-3">
        {nodes}
      </div>
    </div>
  );
}

export function PlanStep3({ plan, onCustomize, mealPicks }: Props) {
  const [shareState, setShareState] = useState<ShareState>("idle");
  const [activeDay, setActiveDay] = useState(0);

  async function handleShare() {
    setShareState("saving");
    try {
      const res = await fetch("/api/save-plan", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ plan, mealPicks }),
      });
      if (!res.ok) throw new Error("save failed");
      const { id } = await res.json() as { id: string };
      const url = `${window.location.origin}/plan/${id}`;
      await navigator.clipboard.writeText(url);
      setShareState("copied");
      setTimeout(() => setShareState("idle"), 3000);
    } catch {
      setShareState("error");
      setTimeout(() => setShareState("idle"), 3000);
    }
  }

  return (
    <div className="animate-slide-up">
      {/* Plan hero */}
      <div className="mb-6 rounded-2xl bg-gradient-to-br from-teal-600 to-teal-800 p-6 text-white">
        <div className="mb-2 flex items-center gap-2">
          <span className="rounded-full bg-teal-500/40 px-2.5 py-0.5 text-xs font-bold uppercase tracking-wider">Your Expert Plan</span>
          <span className="rounded-full bg-teal-500/40 px-2.5 py-0.5 text-xs font-medium">
            {plan.days.length} {plan.days.length === 1 ? "day" : "days"}
          </span>
        </div>
        <h2 className="text-xl font-bold leading-snug">{plan.title}</h2>
        <p className="mt-2 text-sm leading-relaxed text-teal-100">{plan.overview}</p>
        <div className="mt-4 flex gap-2.5 rounded-xl bg-teal-700/50 p-3">
          <span className="text-xl shrink-0">👨‍💼</span>
          <p className="text-xs leading-relaxed text-teal-100 italic">&ldquo;{plan.expertNote}&rdquo;</p>
        </div>
      </div>

      {/* Day tabs */}
      <div className="mb-5 flex gap-2 overflow-x-auto pb-1">
        {plan.days.map((day, i) => {
          const mealsReady = mealPicks?.[i] !== undefined;
          return (
            <button
              key={day.day}
              onClick={() => setActiveDay(i)}
              className={`flex shrink-0 items-center gap-2 rounded-xl border px-4 py-2.5 text-sm font-semibold transition ${
                activeDay === i
                  ? "border-teal-600 bg-teal-600 text-white shadow-sm"
                  : "border-slate-200 bg-white text-slate-600 hover:border-teal-300 hover:bg-teal-50"
              }`}
            >
              <span>Day {day.day}</span>
              {!mealsReady && (
                <span className="size-1.5 animate-pulse rounded-full bg-current opacity-60" />
              )}
            </button>
          );
        })}
      </div>

      {/* Active day content */}
      <DaySection
        key={activeDay}
        day={plan.days[activeDay]}
        dayIndex={activeDay}
        meals={mealPicks?.[activeDay]}
      />

      {/* CTA */}
      <div className="mt-8 rounded-2xl border-2 border-dashed border-teal-200 bg-teal-50 p-5 text-center">
        <p className="mb-1 text-sm font-semibold text-teal-800">Love the plan? Make it yours.</p>
        <p className="mb-4 text-xs text-teal-600">Remove places you don&apos;t want, add your own, reorder by day — or share with your travel crew.</p>
        <div className="flex flex-col gap-3 sm:flex-row sm:justify-center">
          <button onClick={onCustomize} className="rounded-xl bg-teal-600 px-6 py-3 font-semibold text-white transition hover:bg-teal-700">
            Customize This Plan →
          </button>
          <button
            onClick={handleShare}
            disabled={shareState === "saving"}
            className="flex items-center justify-center gap-2 rounded-xl border-2 border-teal-600 px-6 py-3 font-semibold text-teal-700 transition hover:bg-teal-50 disabled:opacity-60"
          >
            {shareState === "saving" && (
              <svg className="size-4 animate-spin" viewBox="0 0 24 24" fill="none">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z" />
              </svg>
            )}
            {shareState === "copied" && "✓ Link copied!"}
            {shareState === "error" && "Failed — try again"}
            {shareState === "idle" && (
              <>
                <svg className="size-4" viewBox="0 0 20 20" fill="currentColor">
                  <path d="M15 8a3 3 0 10-2.977-2.63l-4.94 2.47a3 3 0 100 4.319l4.94 2.47a3 3 0 10.895-1.789l-4.94-2.47a3.027 3.027 0 000-.74l4.94-2.47C13.456 7.68 14.19 8 15 8z" />
                </svg>
                Share Plan
              </>
            )}
            {shareState === "saving" && "Saving…"}
          </button>
        </div>
      </div>
    </div>
  );
}
