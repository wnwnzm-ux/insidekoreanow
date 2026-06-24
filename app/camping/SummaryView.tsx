"use client";

import type { CampTrip, ChecklistCategory, MealPlan } from "./types";

interface Props {
  trip: CampTrip | null;
  checklists: ChecklistCategory[];
  meals: MealPlan[];
  progress: number;
  onBack: () => void;
}

const MEAL_TYPE_LABELS: Record<string, string> = {
  breakfast: "아침",
  lunch: "점심",
  dinner: "저녁",
  snack: "간식",
};

export function SummaryView({ trip, checklists, meals, progress, onBack }: Props) {
  const unchecked = checklists.flatMap((cat) =>
    cat.items.filter((i) => !i.checked).map((i) => ({ cat: cat.name, item: i.label }))
  );

  const allIngredients = meals.flatMap((m) => m.ingredients).filter(Boolean);
  const uniqueIngredients = [...new Set(allIngredients)];

  const tripDays = trip
    ? Math.max(
        1,
        Math.round(
          (new Date(trip.endDate).getTime() - new Date(trip.startDate).getTime()) /
            (1000 * 60 * 60 * 24)
        ) + 1
      )
    : null;

  return (
    <div className="flex flex-col min-h-full">
      {/* Header */}
      <div className="sticky top-0 bg-white/90 backdrop-blur-sm z-10 px-4 pt-4 pb-3 border-b border-gray-100">
        <div className="flex items-center gap-3">
          <button onClick={onBack} className="text-emerald-600 font-medium text-sm active:opacity-60">
            ← 뒤로
          </button>
          <h2 className="font-bold text-gray-900 text-lg">전체 요약</h2>
        </div>
      </div>

      <div className="flex-1 px-4 py-4 space-y-5">
        {/* Trip info */}
        {trip ? (
          <div className="rounded-2xl bg-gradient-to-br from-emerald-50 to-green-100 border border-emerald-100 p-4">
            <p className="text-xs font-semibold text-emerald-600 uppercase tracking-wide mb-1">여행 정보</p>
            <p className="font-bold text-gray-900 text-xl">{trip.name}</p>
            <p className="text-gray-600">{trip.location}</p>
            <div className="flex gap-4 mt-2 text-sm text-gray-500">
              <span>📅 {trip.startDate} ~ {trip.endDate}</span>
              <span>👥 {trip.groupSize}명</span>
              <span>🌙 {(tripDays ?? 1) - 1}박 {tripDays}일</span>
            </div>
          </div>
        ) : (
          <div className="rounded-2xl bg-gray-50 border border-gray-100 p-4 text-gray-400 text-center text-sm">
            여행 정보를 입력해주세요
          </div>
        )}

        {/* Progress */}
        <div className="rounded-2xl bg-white border border-gray-100 shadow-sm p-4">
          <div className="flex justify-between items-center mb-2">
            <p className="font-semibold text-gray-700">준비물 진행률</p>
            <span className="text-lg font-bold text-emerald-600">{progress}%</span>
          </div>
          <div className="w-full bg-gray-100 rounded-full h-3">
            <div
              className="bg-gradient-to-r from-emerald-400 to-green-500 h-3 rounded-full transition-all"
              style={{ width: `${progress}%` }}
            />
          </div>
          {progress < 100 && unchecked.length > 0 && (
            <div className="mt-3">
              <p className="text-xs font-semibold text-gray-400 mb-1.5">미완료 항목</p>
              <div className="space-y-1">
                {unchecked.slice(0, 6).map(({ cat, item }, idx) => (
                  <p key={idx} className="text-xs text-gray-500">
                    <span className="text-gray-300">{cat}</span> · {item}
                  </p>
                ))}
                {unchecked.length > 6 && (
                  <p className="text-xs text-gray-400">외 {unchecked.length - 6}개 더...</p>
                )}
              </div>
            </div>
          )}
          {progress === 100 && (
            <p className="text-emerald-600 font-semibold text-sm mt-2">✅ 준비 완료! 출발해요!</p>
          )}
        </div>

        {/* Meals summary */}
        {meals.length > 0 && (
          <div className="rounded-2xl bg-white border border-gray-100 shadow-sm p-4">
            <p className="font-semibold text-gray-700 mb-3">🍽️ 식단 계획</p>
            <div className="space-y-2">
              {meals
                .sort((a, b) => a.day - b.day || a.mealType.localeCompare(b.mealType))
                .map((m) => (
                  <div key={m.id} className="flex items-center gap-2 text-sm">
                    <span className="text-gray-400 w-16 flex-shrink-0">
                      {m.day}일 {MEAL_TYPE_LABELS[m.mealType]}
                    </span>
                    <span className="font-medium text-gray-700">{m.menu}</span>
                  </div>
                ))}
            </div>
          </div>
        )}

        {/* Shopping list */}
        {uniqueIngredients.length > 0 && (
          <div className="rounded-2xl bg-amber-50 border border-amber-100 p-4">
            <p className="font-semibold text-amber-700 mb-2">🛒 총 장보기 목록</p>
            <div className="flex flex-wrap gap-2">
              {uniqueIngredients.map((ing) => (
                <span key={ing} className="bg-white border border-amber-200 text-amber-700 text-xs px-3 py-1.5 rounded-full">
                  {ing}
                </span>
              ))}
            </div>
          </div>
        )}

        {/* Checklist per category */}
        <div>
          <p className="font-semibold text-gray-700 mb-3">📋 카테고리별 현황</p>
          <div className="space-y-2">
            {checklists.map((cat) => {
              const done = cat.items.filter((i) => i.checked).length;
              const pct = Math.round((done / cat.items.length) * 100);
              return (
                <div key={cat.id} className="flex items-center gap-3 bg-white rounded-xl border border-gray-100 px-4 py-3 shadow-sm">
                  <span className="text-lg">{cat.emoji}</span>
                  <div className="flex-1 min-w-0">
                    <div className="flex justify-between text-sm mb-1">
                      <span className="font-medium text-gray-700 truncate">{cat.name}</span>
                      <span className="text-gray-400 flex-shrink-0 ml-2">{done}/{cat.items.length}</span>
                    </div>
                    <div className="w-full bg-gray-100 rounded-full h-1.5">
                      <div
                        className="bg-emerald-400 h-1.5 rounded-full"
                        style={{ width: `${pct}%` }}
                      />
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}
