"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import type {
  TripAnswers,
  ExtendedAnswers,
  GeneratedPlan,
  AppStage,
  DayPlan,
} from "./types";
import { PlanStep2 } from "./PlanStep2";
import { PlanStep3 } from "./PlanStep3";
import { PlanStep4 } from "./PlanStep4";

// ── localStorage ─────────────────────────────────────────────────────────────────

const STORAGE_KEY = "ikn_korea_plan_v2";

interface SavedState {
  answers: Partial<TripAnswers>;
  extended: Partial<ExtendedAnswers>;
  plan: GeneratedPlan | null;
  customDays: DayPlan[] | null;
  stage: AppStage;
}

function loadSaved(): SavedState | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? (JSON.parse(raw) as SavedState) : null;
  } catch {
    return null;
  }
}

function saveToDisk(state: SavedState) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  } catch { /* quota exceeded — ignore */ }
}

function clearSaved() {
  try { localStorage.removeItem(STORAGE_KEY); } catch { /* ignore */ }
}

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

function StepPurpose({ selected, onSelect }: { selected?: string; onSelect: (v: string) => void }) {
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
            <span className="text-sm font-semibold leading-tight text-slate-700">{p.label}</span>
          </button>
        ))}
      </div>
    </>
  );
}

function StepStyle({ selected, onSelect }: { selected?: string; onSelect: (v: string) => void }) {
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

function StepCompanion({ selected, onSelect }: { selected?: string; onSelect: (v: string) => void }) {
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
  days, budget, onDaysChange, onBudgetChange, onNext,
}: {
  days: number; budget?: string;
  onDaysChange: (d: number) => void; onBudgetChange: (b: string) => void; onNext: () => void;
}) {
  return (
    <>
      <QuestionHeading>How long & what&apos;s your budget?</QuestionHeading>
      <p className="mb-2 text-xs font-semibold uppercase tracking-wider text-slate-400">Trip Duration</p>
      <div className="mb-6 flex items-center gap-4">
        <button onClick={() => onDaysChange(Math.max(1, days - 1))} className="flex size-10 items-center justify-center rounded-full border border-slate-200 text-lg text-slate-600 transition hover:bg-slate-50 active:bg-slate-100" aria-label="Fewer days">−</button>
        <span className="w-24 text-center text-2xl font-bold text-slate-800">{days} {days === 1 ? "day" : "days"}</span>
        <button onClick={() => onDaysChange(Math.min(21, days + 1))} className="flex size-10 items-center justify-center rounded-full border border-slate-200 text-lg text-slate-600 transition hover:bg-slate-50 active:bg-slate-100" aria-label="More days">+</button>
      </div>
      <p className="mb-2 text-xs font-semibold uppercase tracking-wider text-slate-400">Daily Budget</p>
      <div className="mb-6 flex flex-col gap-2">
        {BUDGETS.map((b) => (
          <button key={b.id} onClick={() => onBudgetChange(b.id)} className={`flex items-center justify-between rounded-xl border-2 px-4 py-3 transition-all ${budget === b.id ? "border-teal-500 bg-teal-50 shadow-sm" : "border-slate-200 hover:border-teal-300 hover:bg-slate-50"}`}>
            <span className="font-semibold text-slate-800">{b.label}</span>
            <span className="text-sm text-slate-500">{b.desc}</span>
          </button>
        ))}
      </div>
      <button onClick={onNext} disabled={!budget} className="w-full rounded-xl bg-teal-600 py-3.5 font-semibold text-white transition hover:bg-teal-700 disabled:cursor-not-allowed disabled:opacity-40">Continue →</button>
    </>
  );
}

function StepMustVisit({ value, onChange, onSubmit }: { value: string; onChange: (v: string) => void; onSubmit: () => void }) {
  return (
    <>
      <QuestionHeading>Any must-visit places?</QuestionHeading>
      <p className="mb-4 text-sm text-slate-500">Specific neighbourhoods, restaurants, landmarks — anything on your radar. Skip if you have nothing in mind.</p>
      <textarea value={value} onChange={(e) => onChange(e.target.value)} placeholder="e.g. Hongdae, Bukchon Hanok Village, fried chicken alley in Myeongdong..." rows={4} className="w-full resize-none rounded-xl border-2 border-slate-200 p-4 text-sm text-slate-800 placeholder:text-slate-400 focus:border-teal-500 focus:outline-none" />
      <p className="mt-2 mb-5 text-xs text-slate-400">You can always refine this later — we&apos;ll build a great plan either way.</p>
      <button onClick={onSubmit} className="w-full rounded-xl bg-teal-600 py-3.5 font-semibold text-white transition hover:bg-teal-700">Next →</button>
    </>
  );
}

// ── Loading / Error screens ───────────────────────────────────────────────────────

function GeneratingScreen({ progress }: { progress: number }) {
  const [msgIdx, setMsgIdx] = useState(0);
  useEffect(() => {
    const t = setInterval(() => setMsgIdx((i) => (i + 1) % LOADING_MESSAGES.length), 2200);
    return () => clearInterval(t);
  }, []);

  const pct = Math.round(progress);

  return (
    <div className="flex flex-col items-center justify-center py-16 px-4 text-center">
      {/* Spinner with % inside */}
      <div className="relative mb-8">
        <div className="size-20 rounded-full border-4 border-teal-100" />
        <div className="absolute inset-0 size-20 rounded-full border-4 border-transparent border-t-teal-600 animate-spin" />
        <div className="absolute inset-0 flex items-center justify-center">
          <span className="text-sm font-bold text-teal-700">{pct}%</span>
        </div>
      </div>

      {/* Progress bar */}
      <div className="mb-6 w-full max-w-sm">
        <div className="h-2 w-full overflow-hidden rounded-full bg-teal-100">
          <div
            className="h-2 rounded-full bg-teal-500 transition-all duration-500 ease-out"
            style={{ width: `${pct}%` }}
          />
        </div>
        <p className="mt-2 text-right text-xs text-slate-400">{pct}% complete</p>
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

      <p className="text-base font-semibold text-teal-700">{LOADING_MESSAGES[msgIdx]}</p>
      <p className="mt-2 text-sm text-slate-400">Your expert itinerary is being crafted</p>
    </div>
  );
}

function ErrorScreen({ message, onRetry }: { message: string; onRetry: () => void }) {
  return (
    <div className="flex flex-col items-center justify-center py-12 px-4 text-center">
      <div className="mb-4 text-5xl">😓</div>
      <h3 className="mb-2 text-lg font-bold text-slate-800">Something went wrong</h3>
      <p className="mb-6 text-sm text-slate-500 max-w-xs">{message}</p>
      <button onClick={onRetry} className="rounded-xl bg-teal-600 px-6 py-3 font-semibold text-white transition hover:bg-teal-700">Try again</button>
    </div>
  );
}

// ── Main orchestrator ────────────────────────────────────────────────────────────

export function TripPlannerFlow() {
  // ── Initialise from localStorage ──────────────────────────────────────────────
  const [stage, setStage] = useState<AppStage>(() => {
    const s = loadSaved();
    const saved = s?.stage;
    return saved && saved !== "generating" ? saved : "questions";
  });
  const [qStep, setQStep] = useState<Step>(1);
  const [animKey, setAnimKey] = useState(0);
  const [answers, setAnswers] = useState<Partial<TripAnswers>>(() => {
    return loadSaved()?.answers ?? { days: 5, mustVisit: "" };
  });
  const [extended, setExtended] = useState<Partial<ExtendedAnswers>>(() => {
    return loadSaved()?.extended ?? {};
  });
  const [plan, setPlan] = useState<GeneratedPlan | null>(() => {
    return loadSaved()?.plan ?? null;
  });
  const [customDays, setCustomDays] = useState<DayPlan[] | null>(() => {
    return loadSaved()?.customDays ?? null;
  });
  const [error, setError] = useState<string>("");
  const [genProgress, setGenProgress] = useState(0);

  const abortRef = useRef<AbortController | null>(null);
  const progressTimerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  // ── Persist to localStorage on every relevant change ──────────────────────────
  useEffect(() => {
    // Don't overwrite a valid stage with "generating" — save as "branch" so
    // the user can retry or pick a different path on return.
    const stageToSave: AppStage = stage === "generating" ? "branch" : stage;
    saveToDisk({ answers, extended, plan, customDays, stage: stageToSave });
  }, [answers, extended, plan, customDays, stage]);

  // ── Helpers ───────────────────────────────────────────────────────────────────
  const bumpAnim = () => setAnimKey((k: number) => k + 1);

  const goToQStep = (next: Step) => { setQStep(next); bumpAnim(); };

  const selectAndAdvance = (field: keyof TripAnswers, value: string, next: Step) => {
    setAnswers((prev: Partial<TripAnswers>) => ({ ...prev, [field]: value }));
    setTimeout(() => goToQStep(next), 180);
  };

  const startOver = () => {
    clearSaved();
    setStage("questions");
    setQStep(1);
    setAnswers({ days: 5, mustVisit: "" });
    setExtended({});
    setPlan(null);
    setCustomDays(null);
    setError("");
    bumpAnim();
  };

  const startGeneration = useCallback(async (ext?: Partial<ExtendedAnswers>) => {
    const finalExtended = ext ?? extended;
    setExtended(finalExtended);
    setStage("generating");
    setError("");
    setGenProgress(0);

    if (progressTimerRef.current) clearInterval(progressTimerRef.current);
    progressTimerRef.current = setInterval(() => {
      setGenProgress((p) => p + (90 - p) * 0.06);
    }, 300);

    const ctrl = new AbortController();
    abortRef.current = ctrl;

    const totalDays = answers.days ?? 5;

    const fetchDay = async (day: number, isFirst: boolean) => {
      const res = await fetch("/api/generate-plan", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ answers, extended: finalExtended, day, totalDays, isFirst }),
        signal: ctrl.signal,
      });
      const rawText = await res.text();
      if (!res.ok) throw new Error(`Could not generate day ${day}. Please try again.`);
      try {
        const parsed = JSON.parse(rawText) as unknown;
        setGenProgress((p) => Math.min(90, p + 90 / totalDays));
        return parsed;
      } catch {
        throw new Error(`Could not generate day ${day}. Please try again.`);
      }
    };

    try {
      // All days in parallel — each takes ~2-3s, well within 10s limit
      const results = await Promise.all(
        Array.from({ length: totalDays }, (_, i) => fetchDay(i + 1, i === 0))
      );

      clearInterval(progressTimerRef.current!);
      setGenProgress(100);

      type FirstDay = { title: string; overview: string; expertNote: string; day: DayPlan };
      const first = results[0] as FirstDay;
      const assembled: GeneratedPlan = {
        title: first.title ?? "Your Korea Itinerary",
        overview: first.overview ?? "",
        expertNote: first.expertNote ?? "",
        days: results.map((r, i) => (i === 0 ? first.day : (r as DayPlan))),
      };

      setPlan(assembled);
      setCustomDays(null);
      setTimeout(() => setStage("plan"), 500);
    } catch (err) {
      clearInterval(progressTimerRef.current!);
      if ((err as Error).name === "AbortError") return;
      setError("Something went wrong generating your plan. Please try again.");
      setStage("generating");
    }
  }, [answers, extended]);

  // Days used in Step 4: prefer customised version, else fall back to plan
  const activeDays = customDays ?? plan?.days ?? [];
  const setActiveDays = (next: DayPlan[]) => setCustomDays(next);

  const progressPercent = (qStep / 5) * 100;
  const showProgress = stage === "questions";
  const showHeader = stage !== "generating" && stage !== "customize";
  const hasSavedPlan = plan !== null;

  return (
    <div className={`min-h-screen ${stage === "customize" ? "bg-slate-50" : "bg-gradient-to-b from-teal-50 to-white"}`}>

      {/* Hero header */}
      {showHeader && (
        <div className="px-4 pt-10 pb-6 text-center">
          <p className="mb-2 text-xs font-semibold uppercase tracking-widest text-teal-600">
            Your Personal Korea Travel Expert
          </p>
          <h1 className="text-2xl font-bold leading-snug text-slate-800 sm:text-3xl">
            {stage === "plan" || stage === "branch" || stage === "extra" ? (
              <>Korea trip, <span className="text-teal-600">curated for you</span></>
            ) : (
              <>Your Korea trip, <span className="text-teal-600">planned by an expert</span></>
            )}
          </h1>
          {stage === "questions" && (
            <p className="mt-2 text-sm text-slate-500">
              Answer 5 quick questions — we&apos;ll craft your perfect itinerary.
            </p>
          )}
          {(stage === "branch" || stage === "extra") && (
            <p className="mt-2 text-sm text-slate-500">Curated by Korea insiders, not algorithms</p>
          )}

          {/* Start over link — shown whenever there's something saved */}
          {hasSavedPlan && stage !== "questions" && (
            <button
              onClick={startOver}
              className="mt-3 text-xs text-slate-400 underline underline-offset-2 hover:text-slate-600 transition"
            >
              Start over
            </button>
          )}
        </div>
      )}

      {/* Resume banner — shown when user first lands with a saved plan */}
      {stage === "questions" && hasSavedPlan && qStep === 1 && (
        <div className="mx-auto max-w-[600px] px-4 mb-4">
          <div className="flex items-center justify-between gap-3 rounded-xl bg-teal-50 border border-teal-200 px-4 py-3">
            <p className="text-sm text-teal-800">
              <span className="font-semibold">You have a saved plan.</span> Want to continue where you left off?
            </p>
            <div className="flex gap-2 shrink-0">
              <button
                onClick={() => setStage("plan")}
                className="rounded-lg bg-teal-600 px-3 py-1.5 text-xs font-semibold text-white hover:bg-teal-700 transition"
              >
                Resume
              </button>
              <button
                onClick={startOver}
                className="rounded-lg border border-teal-300 px-3 py-1.5 text-xs font-semibold text-teal-700 hover:bg-teal-100 transition"
              >
                Start over
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Progress bar */}
      {showProgress && (
        <div className="mx-auto max-w-[600px] px-4 pb-5">
          <div className="mb-2 flex items-center justify-between text-xs text-slate-400">
            <span className="font-medium text-slate-600">{STEP_LABELS[qStep - 1]}</span>
            <span>{qStep} <span className="text-slate-300">/</span> 5</span>
          </div>
          <div className="h-1.5 w-full overflow-hidden rounded-full bg-teal-100">
            <div className="h-1.5 rounded-full bg-teal-500 transition-all duration-500 ease-out" style={{ width: `${progressPercent}%` }} />
          </div>
          <div className="mt-3 flex justify-center gap-1.5">
            {[1, 2, 3, 4, 5].map((s) => (
              <span key={s} className={`block h-1.5 rounded-full transition-all duration-300 ${s < qStep ? "w-4 bg-teal-500" : s === qStep ? "w-4 bg-teal-600" : "w-1.5 bg-slate-200"}`} />
            ))}
          </div>
        </div>
      )}

      {/* ── Customize stage ───────────────────────────────────────────────────── */}
      {stage === "customize" && plan && (
        <div className="mx-auto max-w-6xl px-4 pb-10">
          <PlanStep4
            days={activeDays}
            setDays={setActiveDays}
            onBack={() => setStage("plan")}
          />
        </div>
      )}

      {/* ── Generating stage ──────────────────────────────────────────────────── */}
      {stage === "generating" && (
        <div className="mx-auto max-w-[600px] px-4 pb-16">
          {error ? (
            <ErrorScreen message={error} onRetry={() => startGeneration(extended)} />
          ) : (
            <GeneratingScreen progress={genProgress} />
          )}
        </div>
      )}

      {/* ── Card stages ───────────────────────────────────────────────────────── */}
      {(stage === "questions" || stage === "branch" || stage === "extra" || stage === "plan") && (
        <div
          key={stage === "questions" ? animKey : stage}
          className={`mx-auto px-4 pb-16 ${stage === "plan" ? "max-w-2xl" : "max-w-[600px]"}`}
        >
          <div className="animate-slide-up rounded-2xl border border-slate-100 bg-white p-6 shadow-md">
            {/* Questions */}
            {stage === "questions" && (
              <>
                {qStep === 1 && <StepPurpose selected={answers.purpose} onSelect={(v) => selectAndAdvance("purpose", v, 2)} />}
                {qStep === 2 && <StepStyle selected={answers.style} onSelect={(v) => selectAndAdvance("style", v, 3)} />}
                {qStep === 3 && <StepCompanion selected={answers.companion} onSelect={(v) => selectAndAdvance("companion", v, 4)} />}
                {qStep === 4 && (
                  <StepDaysBudget
                    days={answers.days ?? 5}
                    budget={answers.budget}
                    onDaysChange={(d) => setAnswers((prev: Partial<TripAnswers>) => ({ ...prev, days: d }))}
                    onBudgetChange={(b) => setAnswers((prev: Partial<TripAnswers>) => ({ ...prev, budget: b }))}
                    onNext={() => goToQStep(5)}
                  />
                )}
                {qStep === 5 && (
                  <StepMustVisit
                    value={answers.mustVisit ?? ""}
                    onChange={(v) => setAnswers((prev: Partial<TripAnswers>) => ({ ...prev, mustVisit: v }))}
                    onSubmit={() => { bumpAnim(); setStage("branch"); }}
                  />
                )}
              </>
            )}

            {/* Branch */}
            {(stage === "branch" || stage === "extra") && (
              <PlanStep2
                onBuildNow={() => startGeneration({})}
                onCustomizeMore={(ext) => startGeneration(ext)}
                onBack={() => { setStage("questions"); goToQStep(5); }}
              />
            )}

            {/* Plan */}
            {stage === "plan" && plan && (
              <PlanStep3
                plan={{ ...plan, days: activeDays }}
                onCustomize={() => setStage("customize")}
              />
            )}
          </div>

          {/* Back / utility buttons */}
          {stage === "questions" && qStep > 1 && (
            <button onClick={() => goToQStep((qStep - 1) as Step)} className="mt-3 flex w-full items-center justify-center gap-1.5 py-2 text-sm text-slate-400 hover:text-slate-600 transition-colors">
              <svg className="size-3.5" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M12.707 5.293a1 1 0 010 1.414L9.414 10l3.293 3.293a1 1 0 01-1.414 1.414l-4-4a1 1 0 010-1.414l4-4a1 1 0 011.414 0z" clipRule="evenodd" /></svg>
              Back
            </button>
          )}
          {stage === "plan" && (
            <button onClick={() => setStage("branch")} className="mt-3 flex w-full items-center justify-center gap-1.5 py-2 text-sm text-slate-400 hover:text-slate-600 transition-colors">
              <svg className="size-3.5" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M12.707 5.293a1 1 0 010 1.414L9.414 10l3.293 3.293a1 1 0 01-1.414 1.414l-4-4a1 1 0 010-1.414l4-4a1 1 0 011.414 0z" clipRule="evenodd" /></svg>
              Regenerate plan
            </button>
          )}
        </div>
      )}
    </div>
  );
}
