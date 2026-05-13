"use client";

import { useState, useEffect, useRef } from "react";
import type {
  TripAnswers,
  ExtendedAnswers,
  GeneratedPlan,
  AppStage,
} from "./types";
import { PlanStep2 } from "./PlanStep2";
import { PlanStep3 } from "./PlanStep3";
import { PlanStep4 } from "./PlanStep4";

// ── Static data ─────────────────────────────────────────────────────────────────

type Step = 1 | 2 | 3 | 4 | 5;

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

const LOADING_MESSAGES = [
  "Consulting insider knowledge...",
  "Planning your optimal route...",
  "Selecting hidden-gem spots...",
  "Adding local secrets...",
  "Finalising your expert plan...",
];

// ── Question sub-components ──────────────────────────────────────────────────────

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
        Next →
      </button>
    </>
  );
}

// ── Loading screen ───────────────────────────────────────────────────────────────

function GeneratingScreen() {
  const [msgIdx, setMsgIdx] = useState(0);

  useEffect(() => {
    const t = setInterval(() => {
      setMsgIdx((i) => (i + 1) % LOADING_MESSAGES.length);
    }, 2200);
    return () => clearInterval(t);
  }, []);

  return (
    <div className="flex flex-col items-center justify-center py-16 px-4 text-center">
      {/* Animated spinner */}
      <div className="relative mb-8">
        <div className="size-20 rounded-full border-4 border-teal-100" />
        <div className="absolute inset-0 size-20 rounded-full border-4 border-transparent border-t-teal-600 animate-spin" />
        <div className="absolute inset-0 flex items-center justify-center text-3xl">
          🇰🇷
        </div>
      </div>

      {/* Skeleton bars */}
      <div className="mb-8 w-full max-w-sm space-y-3">
        <div className="h-4 w-3/4 mx-auto rounded-full bg-teal-100 animate-pulse" />
        <div className="h-3 w-full rounded-full bg-slate-100 animate-pulse" />
        <div className="h-3 w-5/6 rounded-full bg-slate-100 animate-pulse" />
        <div className="h-3 w-4/6 rounded-full bg-slate-100 animate-pulse" />
        <div className="mt-4 h-4 w-2/3 mx-auto rounded-full bg-teal-100 animate-pulse" />
        <div className="h-3 w-full rounded-full bg-slate-100 animate-pulse" />
        <div className="h-3 w-5/6 rounded-full bg-slate-100 animate-pulse" />
      </div>

      <p className="text-base font-semibold text-teal-700">
        {LOADING_MESSAGES[msgIdx]}
      </p>
      <p className="mt-2 text-sm text-slate-400">
        Your expert itinerary is being crafted
      </p>
    </div>
  );
}

// ── Error screen ─────────────────────────────────────────────────────────────────

function ErrorScreen({
  message,
  onRetry,
}: {
  message: string;
  onRetry: () => void;
}) {
  return (
    <div className="flex flex-col items-center justify-center py-12 px-4 text-center">
      <div className="mb-4 text-5xl">😓</div>
      <h3 className="mb-2 text-lg font-bold text-slate-800">
        Something went wrong
      </h3>
      <p className="mb-6 text-sm text-slate-500 max-w-xs">{message}</p>
      <button
        onClick={onRetry}
        className="rounded-xl bg-teal-600 px-6 py-3 font-semibold text-white transition hover:bg-teal-700"
      >
        Try again
      </button>
    </div>
  );
}

// ── Main orchestrator ────────────────────────────────────────────────────────────

export function TripPlannerFlow() {
  const [stage, setStage] = useState<AppStage>("questions");
  const [qStep, setQStep] = useState<Step>(1);
  const [animKey, setAnimKey] = useState(0);
  const [answers, setAnswers] = useState<Partial<TripAnswers>>({
    days: 5,
    mustVisit: "",
  });
  const [extended, setExtended] = useState<Partial<ExtendedAnswers>>({});
  const [plan, setPlan] = useState<GeneratedPlan | null>(null);
  const [error, setError] = useState<string>("");

  const abortRef = useRef<AbortController | null>(null);

  const bumpAnim = () => setAnimKey((k: number) => k + 1);

  const goToQStep = (next: Step) => {
    setQStep(next);
    bumpAnim();
  };

  const selectAndAdvance = (field: keyof TripAnswers, value: string, next: Step) => {
    setAnswers((prev: Partial<TripAnswers>) => ({ ...prev, [field]: value }));
    setTimeout(() => goToQStep(next), 180);
  };

  const startGeneration = async (ext?: Partial<ExtendedAnswers>) => {
    const finalExtended = ext ?? extended;
    setExtended(finalExtended);
    setStage("generating");
    setError("");

    const ctrl = new AbortController();
    abortRef.current = ctrl;

    try {
      const res = await fetch("/api/generate-plan", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ answers, extended: finalExtended }),
        signal: ctrl.signal,
      });

      if (!res.ok) {
        throw new Error(`Request failed (${res.status})`);
      }

      const reader = res.body!.getReader();
      const decoder = new TextDecoder();
      let accumulated = "";

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        accumulated += decoder.decode(value, { stream: true });
      }
      accumulated += decoder.decode();

      const parsed = JSON.parse(accumulated) as GeneratedPlan;
      setPlan(parsed);
      setStage("plan");
    } catch (err) {
      if ((err as Error).name === "AbortError") return;
      setError(
        err instanceof Error
          ? err.message
          : "Something went wrong. Please try again."
      );
      setStage("generating"); // keep on generating screen, show error overlay
    }
  };

  // Progress bar — only shown during questions stage
  const progressPercent = (qStep / 5) * 100;
  const showProgress = stage === "questions";
  const showHeader = stage !== "generating" && stage !== "customize";

  return (
    <div
      className={`min-h-screen ${
        stage === "customize"
          ? "bg-slate-50"
          : "bg-gradient-to-b from-teal-50 to-white"
      }`}
    >
      {/* Hero header */}
      {showHeader && (
        <div className="px-4 pt-10 pb-6 text-center">
          <p className="mb-2 text-xs font-semibold uppercase tracking-widest text-teal-600">
            Your Personal Korea Travel Expert
          </p>
          <h1 className="text-2xl font-bold leading-snug text-slate-800 sm:text-3xl">
            {stage === "plan" || stage === "branch" || stage === "extra" ? (
              <>
                Korea trip,{" "}
                <span className="text-teal-600">curated for you</span>
              </>
            ) : (
              <>
                Your Korea trip,{" "}
                <span className="text-teal-600">planned by an expert</span>
              </>
            )}
          </h1>
          {stage === "questions" && (
            <p className="mt-2 text-sm text-slate-500">
              Answer 5 quick questions — we&apos;ll craft your perfect itinerary.
            </p>
          )}
          {(stage === "branch" || stage === "extra") && (
            <p className="mt-2 text-sm text-slate-500">
              Curated by Korea insiders, not algorithms
            </p>
          )}
        </div>
      )}

      {/* Progress bar (questions only) */}
      {showProgress && (
        <div className="mx-auto max-w-[600px] px-4 pb-5">
          <div className="mb-2 flex items-center justify-between text-xs text-slate-400">
            <span className="font-medium text-slate-600">
              {STEP_LABELS[qStep - 1]}
            </span>
            <span>
              {qStep} <span className="text-slate-300">/</span> 5
            </span>
          </div>
          <div className="h-1.5 w-full overflow-hidden rounded-full bg-teal-100">
            <div
              className="h-1.5 rounded-full bg-teal-500 transition-all duration-500 ease-out"
              style={{ width: `${progressPercent}%` }}
            />
          </div>
          <div className="mt-3 flex justify-center gap-1.5">
            {[1, 2, 3, 4, 5].map((s) => (
              <span
                key={s}
                className={`block h-1.5 rounded-full transition-all duration-300 ${
                  s < qStep
                    ? "w-4 bg-teal-500"
                    : s === qStep
                      ? "w-4 bg-teal-600"
                      : "w-1.5 bg-slate-200"
                }`}
              />
            ))}
          </div>
        </div>
      )}

      {/* ── Customize stage (full width) ──────────────────────────────────────── */}
      {stage === "customize" && plan && (
        <div className="mx-auto max-w-6xl px-4 pb-10">
          <PlanStep4
            plan={plan}
            onBack={() => setStage("plan")}
          />
        </div>
      )}

      {/* ── Generating stage ──────────────────────────────────────────────────── */}
      {stage === "generating" && (
        <div className="mx-auto max-w-[600px] px-4 pb-16">
          {error ? (
            <ErrorScreen
              message={error}
              onRetry={() => startGeneration(extended)}
            />
          ) : (
            <GeneratingScreen />
          )}
        </div>
      )}

      {/* ── Card stages (questions, branch, extra, plan) ─────────────────────── */}
      {(stage === "questions" ||
        stage === "branch" ||
        stage === "extra" ||
        stage === "plan") && (
        <div
          key={stage === "questions" ? animKey : stage}
          className={`mx-auto px-4 pb-16 ${
            stage === "plan" ? "max-w-2xl" : "max-w-[600px]"
          }`}
        >
          <div className="animate-slide-up rounded-2xl border border-slate-100 bg-white p-6 shadow-md">
            {/* Questions stage */}
            {stage === "questions" && (
              <>
                {qStep === 1 && (
                  <StepPurpose
                    selected={answers.purpose}
                    onSelect={(v) => selectAndAdvance("purpose", v, 2)}
                  />
                )}
                {qStep === 2 && (
                  <StepStyle
                    selected={answers.style}
                    onSelect={(v) => selectAndAdvance("style", v, 3)}
                  />
                )}
                {qStep === 3 && (
                  <StepCompanion
                    selected={answers.companion}
                    onSelect={(v) => selectAndAdvance("companion", v, 4)}
                  />
                )}
                {qStep === 4 && (
                  <StepDaysBudget
                    days={answers.days ?? 5}
                    budget={answers.budget}
                    onDaysChange={(d) =>
                      setAnswers((prev: Partial<TripAnswers>) => ({ ...prev, days: d }))
                    }
                    onBudgetChange={(b) =>
                      setAnswers((prev: Partial<TripAnswers>) => ({ ...prev, budget: b }))
                    }
                    onNext={() => goToQStep(5)}
                  />
                )}
                {qStep === 5 && (
                  <StepMustVisit
                    value={answers.mustVisit ?? ""}
                    onChange={(v) =>
                      setAnswers((prev: Partial<TripAnswers>) => ({
                        ...prev,
                        mustVisit: v,
                      }))
                    }
                    onSubmit={() => {
                      bumpAnim();
                      setStage("branch");
                    }}
                  />
                )}
              </>
            )}

            {/* Branch stage */}
            {(stage === "branch" || stage === "extra") && (
              <PlanStep2
                onBuildNow={() => startGeneration({})}
                onCustomizeMore={(ext) => startGeneration(ext)}
              />
            )}

            {/* Plan stage */}
            {stage === "plan" && plan && (
              <PlanStep3
                plan={plan}
                onCustomize={() => setStage("customize")}
              />
            )}
          </div>

          {/* Back button */}
          {(stage === "questions" && qStep > 1) && (
            <button
              onClick={() => goToQStep((qStep - 1) as Step)}
              className="mt-3 flex w-full items-center justify-center gap-1.5 py-2 text-sm text-slate-400 hover:text-slate-600 transition-colors"
            >
              <svg className="size-3.5" viewBox="0 0 20 20" fill="currentColor">
                <path
                  fillRule="evenodd"
                  d="M12.707 5.293a1 1 0 010 1.414L9.414 10l3.293 3.293a1 1 0 01-1.414 1.414l-4-4a1 1 0 010-1.414l4-4a1 1 0 011.414 0z"
                  clipRule="evenodd"
                />
              </svg>
              Back
            </button>
          )}
          {stage === "plan" && (
            <button
              onClick={() => setStage("branch")}
              className="mt-3 flex w-full items-center justify-center gap-1.5 py-2 text-sm text-slate-400 hover:text-slate-600 transition-colors"
            >
              <svg className="size-3.5" viewBox="0 0 20 20" fill="currentColor">
                <path
                  fillRule="evenodd"
                  d="M12.707 5.293a1 1 0 010 1.414L9.414 10l3.293 3.293a1 1 0 01-1.414 1.414l-4-4a1 1 0 010-1.414l4-4a1 1 0 011.414 0z"
                  clipRule="evenodd"
                />
              </svg>
              Regenerate plan
            </button>
          )}
        </div>
      )}
    </div>
  );
}
