"use client";

import { useState } from "react";
import type { ExtendedAnswers } from "./types";

interface Props {
  onBuildNow: () => void;
  onCustomizeMore: (extended: Partial<ExtendedAnswers>) => void;
}

const DIETARY_OPTIONS = [
  { id: "vegetarian", label: "Vegetarian", emoji: "🥗" },
  { id: "vegan", label: "Vegan", emoji: "🌱" },
  { id: "halal", label: "Halal", emoji: "☪️" },
  { id: "gluten-free", label: "Gluten-free", emoji: "🌾" },
  { id: "allergies", label: "Allergies / Other", emoji: "⚠️" },
];

const TRANSPORT_OPTIONS = [
  { id: "walking", label: "Walk everywhere", desc: "Keep it to walkable distances", emoji: "🚶" },
  { id: "subway", label: "Subway-first", desc: "Fast, cheap, easy to navigate", emoji: "🚇" },
  { id: "taxi", label: "Taxis & Rides", desc: "Comfort over cost", emoji: "🚕" },
  { id: "mix", label: "Mix it up", desc: "Whatever works best each time", emoji: "🔀" },
];

export function PlanStep2({ onBuildNow, onCustomizeMore }: Props) {
  const [showExtra, setShowExtra] = useState(false);
  const [dietary, setDietary] = useState<string[]>([]);
  const [transport, setTransport] = useState("");
  const [accommodation, setAccommodation] = useState("");
  const [avoid, setAvoid] = useState("");
  const [kpopSites, setKpopSites] = useState("");

  const toggleDietary = (id: string) => {
    setDietary((prev) =>
      prev.includes(id) ? prev.filter((d) => d !== id) : [...prev, id]
    );
  };

  const handleSubmitExtra = () => {
    onCustomizeMore({ dietary, transport, accommodation, avoid, kpopSites });
  };

  if (showExtra) {
    return (
      <div className="animate-slide-up">
        {/* Extra questions header */}
        <div className="mb-6 text-center">
          <span className="inline-flex items-center gap-1.5 rounded-full bg-teal-100 px-3 py-1 text-xs font-semibold text-teal-700">
            Fine-tune your preferences
          </span>
          <h2 className="mt-3 text-xl font-bold text-slate-800">
            A few more details
          </h2>
          <p className="mt-1 text-sm text-slate-500">
            Skip anything that doesn&apos;t apply — all optional.
          </p>
        </div>

        {/* Dietary */}
        <div className="mb-5">
          <p className="mb-2 text-sm font-semibold text-slate-700">
            Dietary restrictions?
          </p>
          <div className="flex flex-wrap gap-2">
            {DIETARY_OPTIONS.map((opt) => (
              <button
                key={opt.id}
                onClick={() => toggleDietary(opt.id)}
                className={`flex items-center gap-1.5 rounded-full border px-3 py-1.5 text-sm transition-all ${
                  dietary.includes(opt.id)
                    ? "border-teal-500 bg-teal-50 font-semibold text-teal-700"
                    : "border-slate-200 text-slate-600 hover:border-teal-300"
                }`}
              >
                <span>{opt.emoji}</span>
                {opt.label}
              </button>
            ))}
          </div>
        </div>

        {/* Transport */}
        <div className="mb-5">
          <p className="mb-2 text-sm font-semibold text-slate-700">
            Preferred transport?
          </p>
          <div className="grid grid-cols-2 gap-2">
            {TRANSPORT_OPTIONS.map((opt) => (
              <button
                key={opt.id}
                onClick={() => setTransport(opt.id)}
                className={`flex items-center gap-2.5 rounded-xl border-2 p-3 text-left transition-all ${
                  transport === opt.id
                    ? "border-teal-500 bg-teal-50"
                    : "border-slate-200 hover:border-teal-300"
                }`}
              >
                <span className="text-xl">{opt.emoji}</span>
                <div>
                  <p className="text-sm font-semibold text-slate-800">{opt.label}</p>
                  <p className="text-xs text-slate-500">{opt.desc}</p>
                </div>
              </button>
            ))}
          </div>
        </div>

        {/* Accommodation */}
        <div className="mb-5">
          <label className="mb-2 block text-sm font-semibold text-slate-700">
            Preferred accommodation area?
          </label>
          <input
            type="text"
            value={accommodation}
            onChange={(e) => setAccommodation(e.target.value)}
            placeholder="e.g. Myeongdong, Hongdae, near Gangnam..."
            className="w-full rounded-xl border-2 border-slate-200 px-4 py-2.5 text-sm text-slate-800 placeholder:text-slate-400 focus:border-teal-500 focus:outline-none"
          />
        </div>

        {/* Avoid */}
        <div className="mb-5">
          <label className="mb-2 block text-sm font-semibold text-slate-700">
            Anything you want to avoid?
          </label>
          <input
            type="text"
            value={avoid}
            onChange={(e) => setAvoid(e.target.value)}
            placeholder="e.g. tourist traps, spicy food, crowded malls..."
            className="w-full rounded-xl border-2 border-slate-200 px-4 py-2.5 text-sm text-slate-800 placeholder:text-slate-400 focus:border-teal-500 focus:outline-none"
          />
        </div>

        {/* K-pop sites */}
        <div className="mb-6">
          <label className="mb-2 block text-sm font-semibold text-slate-700">
            Specific K-pop idols or K-drama filming locations?
          </label>
          <input
            type="text"
            value={kpopSites}
            onChange={(e) => setKpopSites(e.target.value)}
            placeholder="e.g. BTS army bomb wall, Crash Landing on You café..."
            className="w-full rounded-xl border-2 border-slate-200 px-4 py-2.5 text-sm text-slate-800 placeholder:text-slate-400 focus:border-teal-500 focus:outline-none"
          />
        </div>

        <button
          onClick={handleSubmitExtra}
          className="w-full rounded-xl bg-teal-600 py-3.5 font-semibold text-white transition hover:bg-teal-700"
        >
          Build My Expert Plan →
        </button>
      </div>
    );
  }

  return (
    <div className="animate-slide-up">
      {/* Congrats header */}
      <div className="mb-8 text-center">
        <div className="mb-3 text-4xl">🎉</div>
        <h2 className="text-xl font-bold text-slate-800">
          Great — we have everything we need!
        </h2>
        <p className="mt-2 text-sm text-slate-500">
          Our Korea expert is ready to craft your itinerary. Want to go straight
          to your plan, or add a few more personal touches first?
        </p>
      </div>

      {/* Option A — build now */}
      <button
        onClick={onBuildNow}
        className="mb-3 w-full rounded-2xl bg-teal-600 p-5 text-left transition hover:bg-teal-700 group"
      >
        <div className="flex items-start justify-between">
          <div>
            <p className="text-base font-bold text-white">Build my plan now</p>
            <p className="mt-1 text-sm text-teal-100">
              Generate your personalised expert itinerary right away
            </p>
          </div>
          <span className="mt-0.5 text-2xl group-hover:translate-x-0.5 transition-transform">
            ⚡
          </span>
        </div>
        <div className="mt-3 flex gap-2">
          <span className="rounded-full bg-teal-500/50 px-2.5 py-0.5 text-xs font-medium text-white">
            ~30 seconds
          </span>
          <span className="rounded-full bg-teal-500/50 px-2.5 py-0.5 text-xs font-medium text-white">
            Instant
          </span>
        </div>
      </button>

      {/* Option B — customize more */}
      <button
        onClick={() => setShowExtra(true)}
        className="w-full rounded-2xl border-2 border-slate-200 p-5 text-left transition hover:border-teal-300 hover:bg-slate-50"
      >
        <div className="flex items-start justify-between">
          <div>
            <p className="text-base font-bold text-slate-800">
              Let me add more details
            </p>
            <p className="mt-1 text-sm text-slate-500">
              Dietary needs, transport prefs, K-pop spots, and more
            </p>
          </div>
          <span className="mt-0.5 text-2xl">🔧</span>
        </div>
        <div className="mt-3 flex gap-2">
          <span className="rounded-full bg-slate-100 px-2.5 py-0.5 text-xs font-medium text-slate-500">
            5 extra questions
          </span>
          <span className="rounded-full bg-slate-100 px-2.5 py-0.5 text-xs font-medium text-slate-500">
            More personalised
          </span>
        </div>
      </button>

      <p className="mt-4 text-center text-xs text-slate-400">
        Curated by Korea insiders, not algorithms
      </p>
    </div>
  );
}
