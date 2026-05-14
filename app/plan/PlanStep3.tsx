"use client";

import { useState } from "react";
import type { GeneratedPlan, PlaceItem } from "./types";

type ShareState = "idle" | "saving" | "copied" | "error";

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
      {/* Step number */}
      <div className="absolute -left-3 top-4 flex size-6 items-center justify-center rounded-full bg-teal-600 text-xs font-bold text-white shadow-sm">
        {index + 1}
      </div>

      <div className="p-4 pl-6">
        {/* Header row */}
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
              <svg
                className={`size-4 transition-transform ${expanded ? "rotate-180" : ""}`}
                viewBox="0 0 20 20"
                fill="currentColor"
              >
                <path
                  fillRule="evenodd"
                  d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z"
                  clipRule="evenodd"
                />
              </svg>
            </button>
          )}
        </div>

        {/* Best time */}
        <div className="mt-2 flex items-center gap-1.5 text-xs text-slate-500">
          <span>🕐</span>
          <span className="font-medium text-slate-600">{place.bestTime}</span>
        </div>

        {/* Expert tip — always visible */}
        <div className="mt-3 rounded-xl bg-teal-50 p-3">
          <div className="flex items-center gap-1.5 mb-1">
            <span className="inline-flex items-center gap-1 rounded-full bg-teal-600 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide text-white">
              Expert Tip
            </span>
          </div>
          <p className="text-xs leading-relaxed text-teal-800">{place.expertTip}</p>
        </div>

        {/* Expandable section */}
        {expanded && hasExpandable && (
          <div className="mt-3 space-y-3 animate-slide-up">
            {place.insiderNote && (
              <div className="rounded-xl border border-amber-200 bg-amber-50 p-3">
                <div className="flex items-center gap-1.5 mb-1">
                  <span className="text-sm">💡</span>
                  <span className="text-xs font-bold text-amber-800 uppercase tracking-wide">
                    What tourists don&apos;t know
                  </span>
                </div>
                <p className="text-xs leading-relaxed text-amber-900">{place.insiderNote}</p>
              </div>
            )}
            {place.whyPicked && (
              <div className="rounded-xl bg-slate-50 p-3">
                <div className="flex items-center gap-1.5 mb-1">
                  <span className="text-sm">✓</span>
                  <span className="text-xs font-bold text-slate-600 uppercase tracking-wide">
                    Why we picked this for you
                  </span>
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

interface Props {
  plan: GeneratedPlan;
  onCustomize: () => void;
}

export function PlanStep3({ plan, onCustomize }: Props) {
  const [activeDay, setActiveDay] = useState(0);
  const currentDay = plan.days[activeDay];
  const [shareState, setShareState] = useState<ShareState>("idle");

  async function handleShare() {
    setShareState("saving");
    try {
      const res = await fetch("/api/save-plan", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ plan }),
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
          <span className="rounded-full bg-teal-500/40 px-2.5 py-0.5 text-xs font-bold uppercase tracking-wider">
            Your Expert Plan
          </span>
          <span className="rounded-full bg-teal-500/40 px-2.5 py-0.5 text-xs font-medium">
            {plan.days.length} days
          </span>
        </div>
        <h2 className="text-xl font-bold leading-snug">{plan.title}</h2>
        <p className="mt-2 text-sm leading-relaxed text-teal-100">{plan.overview}</p>

        {/* Expert note */}
        <div className="mt-4 flex gap-2.5 rounded-xl bg-teal-700/50 p-3">
          <span className="text-xl shrink-0">👨‍💼</span>
          <p className="text-xs leading-relaxed text-teal-100 italic">
            &ldquo;{plan.expertNote}&rdquo;
          </p>
        </div>
      </div>

      {/* Day tabs */}
      <div className="mb-5 -mx-1">
        <div className="flex gap-1.5 overflow-x-auto pb-1 scrollbar-hide px-1">
          {plan.days.map((day, i) => (
            <button
              key={day.day}
              onClick={() => setActiveDay(i)}
              className={`shrink-0 rounded-xl px-3.5 py-2 text-sm font-semibold transition-all ${
                activeDay === i
                  ? "bg-teal-600 text-white shadow-sm"
                  : "bg-slate-100 text-slate-600 hover:bg-teal-50 hover:text-teal-700"
              }`}
            >
              Day {day.day}
            </button>
          ))}
        </div>
      </div>

      {/* Day header */}
      {currentDay && (
        <>
          <div className="mb-4 flex items-center gap-2">
            <span className="flex size-7 items-center justify-center rounded-full bg-teal-600 text-xs font-bold text-white">
              {currentDay.day}
            </span>
            <h3 className="font-bold text-slate-800">{currentDay.theme}</h3>
          </div>

          {/* Place cards */}
          <div className="space-y-4 pl-3">
            {currentDay.places.map((place, i) => (
              <PlaceCard key={place.id} place={place} index={i} />
            ))}
          </div>
        </>
      )}

      {/* Pagination — prev/next day */}
      <div className="mt-6 flex items-center justify-between">
        <button
          onClick={() => setActiveDay((d) => Math.max(0, d - 1))}
          disabled={activeDay === 0}
          className="flex items-center gap-1.5 rounded-xl border border-slate-200 px-4 py-2.5 text-sm font-medium text-slate-600 transition hover:bg-slate-50 disabled:opacity-30"
        >
          <svg className="size-4" viewBox="0 0 20 20" fill="currentColor">
            <path fillRule="evenodd" d="M12.707 5.293a1 1 0 010 1.414L9.414 10l3.293 3.293a1 1 0 01-1.414 1.414l-4-4a1 1 0 010-1.414l4-4a1 1 0 011.414 0z" clipRule="evenodd" />
          </svg>
          Previous day
        </button>
        <button
          onClick={() => setActiveDay((d) => Math.min(plan.days.length - 1, d + 1))}
          disabled={activeDay === plan.days.length - 1}
          className="flex items-center gap-1.5 rounded-xl border border-slate-200 px-4 py-2.5 text-sm font-medium text-slate-600 transition hover:bg-slate-50 disabled:opacity-30"
        >
          Next day
          <svg className="size-4" viewBox="0 0 20 20" fill="currentColor">
            <path fillRule="evenodd" d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" clipRule="evenodd" />
          </svg>
        </button>
      </div>

      {/* CTA */}
      <div className="mt-6 rounded-2xl border-2 border-dashed border-teal-200 bg-teal-50 p-5 text-center">
        <p className="mb-1 text-sm font-semibold text-teal-800">
          Love the plan? Make it yours.
        </p>
        <p className="mb-4 text-xs text-teal-600">
          Remove places you don&apos;t want, add your own, reorder by day — or share with your travel crew.
        </p>
        <div className="flex flex-col gap-3 sm:flex-row sm:justify-center">
          <button
            onClick={onCustomize}
            className="rounded-xl bg-teal-600 px-6 py-3 font-semibold text-white transition hover:bg-teal-700"
          >
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
