"use client";

import { useState } from "react";

type Step = 1 | 2 | 3 | 4 | 5;

interface TripAnswers {
  purpose: string;
  style: string;
  companion: string;
  days: number;
  budget: string;
  mustVisit: string;
}

const PURPOSES = [
  { id: "kpop", label: "K-pop Pilgrimage", emoji: "🎤" },
  { id: "food", label: "Food Adventure", emoji: "🍜" },
  { id: "shopping", label: "Shopping", emoji: "🛍️" },
  { id: "nature", label: "Nature & Healing", emoji: "🌿" },
  { id: "culture", label: "Culture Experience", emoji: "🏯" },
  { id: "nightlife", label: "Nightlife", emoji: "🌃" },
];

const STYLES = [
  { id: "packed", label: "Packed & Busy", desc: "Max activities every day", emoji: "⚡" },
  { id: "relaxed", label: "Relaxed & Slow", desc: "Take it easy, enjoy each moment", emoji: "☕" },
  { id: "mix", label: "Mix of Both", desc: "Balance sightseeing with downtime", emoji: "⚖️" },
];

const COMPANIONS = [
  { id: "solo", label: "Solo", emoji: "🧳" },
  { id: "couple", label: "Couple", emoji: "💑" },
  { id: "friends", label: "Friends", emoji: "👯" },
  { id: "family", label: "Family with Kids", emoji: "👨‍👩‍👧" },
];

const BUDGETS = [
  { id: "budget", label: "Budget", desc: "Under $80 / day" },
  { id: "mid", label: "Mid-range", desc: "$80 – $200 / day" },
  { id: "luxury", label: "Luxury", desc: "$200+ / day" },
];

const STEP_LABELS = [
  "What's your main goal?",
  "How do you like to travel?",
  "Who's coming along?",
  "Duration & budget",
  "Any must-visits?",
];

export function TripPlannerFlow() {
  const [step, setStep] = useState<Step>(1);
  const [animKey, setAnimKey] = useState(0);
  const [answers, setAnswers] = useState<Partial<TripAnswers>>({
    days: 5,
    mustVisit: "",
  });

  const goToStep = (next: Step) => {
    setStep(next);
    setAnimKey((k: number) => k + 1);
  };

  const selectAndAdvance = (field: keyof TripAnswers, value: string, next: Step) => {
    setAnswers((prev: Partial<TripAnswers>) => ({ ...prev, [field]: value }));
    setTimeout(() => goToStep(next), 180);
  };

  const progressPercent = (step / 5) * 100;

  return (
    <div className="min-h-screen bg-gradient-to-b from-teal-50 to-white">
      {/* Hero header */}
      <div className="px-4 pt-10 pb-8 text-center">
        <p className="mb-2 text-xs font-semibold uppercase tracking-widest text-teal-600">
          Korea Travel Expert
        </p>
        <h1 className="text-2xl font-bold leading-snug text-slate-800 sm:text-3xl">
          Your Korea trip,{" "}
          <span className="text-teal-600">planned by an expert</span>
        </h1>
        <p className="mt-2 text-sm text-slate-500">
          Answer 5 quick questions — we'll craft your perfect itinerary.
        </p>
      </div>

      {/* Progress bar */}
      <div className="mx-auto max-w-[600px] px-4 pb-5">
        <div className="mb-2 flex items-center justify-between text-xs text-slate-400">
          <span className="font-medium text-slate-600">
            {STEP_LABELS[step - 1]}
          </span>
          <span>
            {step} <span className="text-slate-300">/</span> 5
          </span>
        </div>
        <div className="h-1.5 w-full overflow-hidden rounded-full bg-teal-100">
          <div
            className="h-1.5 rounded-full bg-teal-500 transition-all duration-500 ease-out"
            style={{ width: `${progressPercent}%` }}
          />
        </div>

        {/* Step dots */}
        <div className="mt-3 flex justify-center gap-1.5">
          {[1, 2, 3, 4, 5].map((s) => (
            <span
              key={s}
              className={`block h-1.5 rounded-full transition-all duration-300 ${
                s < step
                  ? "w-4 bg-teal-500"
                  : s === step
                    ? "w-4 bg-teal-600"
                    : "w-1.5 bg-slate-200"
              }`}
            />
          ))}
        </div>
      </div>

      {/* Question card */}
      <div key={animKey} className="mx-auto max-w-[600px] px-4 pb-16">
        <div className="animate-slide-up rounded-2xl border border-slate-100 bg-white p-6 shadow-md">
          {step === 1 && (
            <StepPurpose
              selected={answers.purpose}
              onSelect={(v) => selectAndAdvance("purpose", v, 2)}
            />
          )}
          {step === 2 && (
            <StepStyle
              selected={answers.style}
              onSelect={(v) => selectAndAdvance("style", v, 3)}
            />
          )}
          {step === 3 && (
            <StepCompanion
              selected={answers.companion}
              onSelect={(v) => selectAndAdvance("companion", v, 4)}
            />
          )}
          {step === 4 && (
            <StepDaysBudget
              days={answers.days ?? 5}
              budget={answers.budget}
              onDaysChange={(d) => setAnswers((prev: Partial<TripAnswers>) => ({ ...prev, days: d }))}
              onBudgetChange={(b) => setAnswers((prev: Partial<TripAnswers>) => ({ ...prev, budget: b }))}
              onNext={() => goToStep(5)}
            />
          )}
          {step === 5 && (
            <StepMustVisit
              value={answers.mustVisit ?? ""}
              onChange={(v) => setAnswers((prev: Partial<TripAnswers>) => ({ ...prev, mustVisit: v }))}
              onSubmit={() => {
                // TODO: Step 2 — show plan options
                console.log("Trip answers:", answers);
              }}
            />
          )}
        </div>

        {/* Back button */}
        {step > 1 && (
          <button
            onClick={() => goToStep((step - 1) as Step)}
            className="mt-3 flex w-full items-center justify-center gap-1.5 py-2 text-sm text-slate-400 hover:text-slate-600 transition-colors"
          >
            <svg className="size-3.5" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M12.707 5.293a1 1 0 010 1.414L9.414 10l3.293 3.293a1 1 0 01-1.414 1.414l-4-4a1 1 0 010-1.414l4-4a1 1 0 011.414 0z" clipRule="evenodd" />
            </svg>
            Back
          </button>
        )}
      </div>
    </div>
  );
}

// ── Sub-components ──────────────────────────────────────────────────────────────

function QuestionHeading({ children }: { children: React.ReactNode }) {
  return <h2 className="mb-5 text-lg font-bold text-slate-800">{children}</h2>;
}

function StepPurpose({
  selected,
  onSelect,
}: {
  selected?: string;
  onSelect: (v: string) => void;
}) {
  return (
    <>
      <QuestionHeading>What&apos;s the main purpose of your trip?</QuestionHeading>
      <div className="grid grid-cols-2 gap-2.5">
        {PURPOSES.map((p) => (
          <button
            key={p.id}
            onClick={() => onSelect(p.id)}
            className={`flex flex-col items-start gap-2 rounded-xl border-2 p-4 text-left transition-all active:scale-95 ${
              selected === p.id
                ? "border-teal-500 bg-teal-50 shadow-sm"
                : "border-slate-200 hover:border-teal-300 hover:bg-slate-50"
            }`}
          >
            <span className="text-2xl">{p.emoji}</span>
            <span className="text-sm font-semibold leading-tight text-slate-700">
              {p.label}
            </span>
          </button>
        ))}
      </div>
    </>
  );
}

function StepStyle({
  selected,
  onSelect,
}: {
  selected?: string;
  onSelect: (v: string) => void;
}) {
  return (
    <>
      <QuestionHeading>How do you like to travel?</QuestionHeading>
      <div className="flex flex-col gap-2.5">
        {STYLES.map((s) => (
          <button
            key={s.id}
            onClick={() => onSelect(s.id)}
            className={`flex items-center gap-4 rounded-xl border-2 p-4 text-left transition-all active:scale-95 ${
              selected === s.id
                ? "border-teal-500 bg-teal-50 shadow-sm"
                : "border-slate-200 hover:border-teal-300 hover:bg-slate-50"
            }`}
          >
            <span className="text-3xl">{s.emoji}</span>
            <div>
              <p className="font-semibold text-slate-800">{s.label}</p>
              <p className="text-sm text-slate-500">{s.desc}</p>
            </div>
          </button>
        ))}
      </div>
    </>
  );
}

function StepCompanion({
  selected,
  onSelect,
}: {
  selected?: string;
  onSelect: (v: string) => void;
}) {
  return (
    <>
      <QuestionHeading>Who are you traveling with?</QuestionHeading>
      <div className="grid grid-cols-2 gap-2.5">
        {COMPANIONS.map((c) => (
          <button
            key={c.id}
            onClick={() => onSelect(c.id)}
            className={`flex flex-col items-center gap-2 rounded-xl border-2 px-4 py-5 transition-all active:scale-95 ${
              selected === c.id
                ? "border-teal-500 bg-teal-50 shadow-sm"
                : "border-slate-200 hover:border-teal-300 hover:bg-slate-50"
            }`}
          >
            <span className="text-3xl">{c.emoji}</span>
            <span className="text-sm font-semibold text-slate-700">{c.label}</span>
          </button>
        ))}
      </div>
    </>
  );
}

function StepDaysBudget({
  days,
  budget,
  onDaysChange,
  onBudgetChange,
  onNext,
}: {
  days: number;
  budget?: string;
  onDaysChange: (d: number) => void;
  onBudgetChange: (b: string) => void;
  onNext: () => void;
}) {
  return (
    <>
      <QuestionHeading>How long & what&apos;s your budget?</QuestionHeading>

      {/* Duration stepper */}
      <p className="mb-2 text-xs font-semibold uppercase tracking-wider text-slate-400">
        Trip Duration
      </p>
      <div className="mb-6 flex items-center gap-4">
        <button
          onClick={() => onDaysChange(Math.max(1, days - 1))}
          className="flex size-10 items-center justify-center rounded-full border border-slate-200 text-lg text-slate-600 transition hover:bg-slate-50 active:bg-slate-100"
          aria-label="Fewer days"
        >
          −
        </button>
        <span className="w-24 text-center text-2xl font-bold text-slate-800">
          {days} {days === 1 ? "day" : "days"}
        </span>
        <button
          onClick={() => onDaysChange(Math.min(21, days + 1))}
          className="flex size-10 items-center justify-center rounded-full border border-slate-200 text-lg text-slate-600 transition hover:bg-slate-50 active:bg-slate-100"
          aria-label="More days"
        >
          +
        </button>
      </div>

      {/* Budget */}
      <p className="mb-2 text-xs font-semibold uppercase tracking-wider text-slate-400">
        Daily Budget
      </p>
      <div className="mb-6 flex flex-col gap-2">
        {BUDGETS.map((b) => (
          <button
            key={b.id}
            onClick={() => onBudgetChange(b.id)}
            className={`flex items-center justify-between rounded-xl border-2 px-4 py-3 transition-all ${
              budget === b.id
                ? "border-teal-500 bg-teal-50 shadow-sm"
                : "border-slate-200 hover:border-teal-300 hover:bg-slate-50"
            }`}
          >
            <span className="font-semibold text-slate-800">{b.label}</span>
            <span className="text-sm text-slate-500">{b.desc}</span>
          </button>
        ))}
      </div>

      <button
        onClick={onNext}
        disabled={!budget}
        className="w-full rounded-xl bg-teal-600 py-3.5 font-semibold text-white transition hover:bg-teal-700 disabled:cursor-not-allowed disabled:opacity-40"
      >
        Continue →
      </button>
    </>
  );
}

function StepMustVisit({
  value,
  onChange,
  onSubmit,
}: {
  value: string;
  onChange: (v: string) => void;
  onSubmit: () => void;
}) {
  return (
    <>
      <QuestionHeading>Any must-visit places?</QuestionHeading>
      <p className="mb-4 text-sm text-slate-500">
        Specific neighbourhoods, restaurants, landmarks — anything on your radar.
        Skip if you have nothing in mind.
      </p>
      <textarea
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder="e.g. Hongdae, Bukchon Hanok Village, fried chicken alley in Myeongdong..."
        rows={4}
        className="w-full resize-none rounded-xl border-2 border-slate-200 p-4 text-sm text-slate-800 placeholder:text-slate-400 focus:border-teal-500 focus:outline-none"
      />
      <p className="mt-2 mb-5 text-xs text-slate-400">
        You can always refine this later — we&apos;ll build a great plan either way.
      </p>
      <button
        onClick={onSubmit}
        className="w-full rounded-xl bg-teal-600 py-3.5 font-semibold text-white transition hover:bg-teal-700"
      >
        Build My Plan →
      </button>
    </>
  );
}
