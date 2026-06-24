"use client";

import { useState } from "react";
import type { MealPlan, CampTrip } from "./types";

interface Props {
  trip: CampTrip | null;
  meals: MealPlan[];
  onUpsertMeal: (meal: MealPlan) => void;
  onDeleteMeal: (id: string) => void;
  onBack: () => void;
}

const MEAL_TYPES: { key: MealPlan["mealType"]; label: string; emoji: string }[] = [
  { key: "breakfast", label: "아침", emoji: "🌅" },
  { key: "lunch", label: "점심", emoji: "☀️" },
  { key: "dinner", label: "저녁", emoji: "🌙" },
  { key: "snack", label: "간식", emoji: "🍪" },
];

const MEAL_SUGGESTIONS: Record<MealPlan["mealType"], string[]> = {
  breakfast: ["라면 + 계란", "토스트 & 커피", "죽", "컵라면", "바나나 & 프로틴바"],
  lunch: ["삼겹살 & 쌈채소", "불고기 버거", "비빔밥", "컵라면 & 주먹밥", "샌드위치"],
  dinner: ["삼겹살 파티", "부대찌개", "닭볶음탕", "바베큐 갈비", "해물 파전"],
  snack: ["군고구마", "마시멜로 구이", "과자 & 음료", "떡볶이", "핫도그"],
};

function getTripDays(trip: CampTrip | null): number[] {
  if (!trip) return [1, 2];
  const days =
    Math.max(
      1,
      Math.round(
        (new Date(trip.endDate).getTime() - new Date(trip.startDate).getTime()) /
          (1000 * 60 * 60 * 24)
      ) + 1
    );
  return Array.from({ length: days }, (_, i) => i + 1);
}

function getDayLabel(trip: CampTrip | null, day: number): string {
  if (!trip) return `Day ${day}`;
  const date = new Date(trip.startDate);
  date.setDate(date.getDate() + day - 1);
  return `${day}일차 (${date.getMonth() + 1}/${date.getDate()})`;
}

interface MealModalProps {
  day: number;
  mealType: MealPlan["mealType"];
  existing: MealPlan | null;
  onSave: (meal: MealPlan) => void;
  onClose: () => void;
}

function MealModal({ day, mealType, existing, onSave, onClose }: MealModalProps) {
  const typeInfo = MEAL_TYPES.find((t) => t.key === mealType)!;
  const [menu, setMenu] = useState(existing?.menu ?? "");
  const [ingredients, setIngredients] = useState(existing?.ingredients.join(", ") ?? "");

  function handleSave() {
    if (!menu.trim()) return;
    onSave({
      id: existing?.id ?? `meal-${Date.now()}`,
      day,
      mealType,
      menu: menu.trim(),
      ingredients: ingredients.split(",").map((s) => s.trim()).filter(Boolean),
    });
    onClose();
  }

  return (
    <div className="fixed inset-0 bg-black/40 z-50 flex items-end justify-center" onClick={onClose}>
      <div
        className="bg-white rounded-t-3xl w-full max-w-lg p-5 pb-safe"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="w-10 h-1 bg-gray-200 rounded-full mx-auto mb-4" />
        <h3 className="font-bold text-gray-900 text-lg mb-4">
          {typeInfo.emoji} {day}일차 {typeInfo.label}
        </h3>

        <div className="mb-4">
          <label className="text-xs font-semibold text-gray-500 uppercase tracking-wide block mb-1.5">
            메뉴
          </label>
          <input
            type="text"
            autoFocus
            value={menu}
            onChange={(e) => setMenu(e.target.value)}
            placeholder="예: 삼겹살 + 쌈채소"
            className="w-full rounded-xl border border-gray-200 px-4 py-3 text-base focus:outline-none focus:ring-2 focus:ring-emerald-400"
          />
          <div className="flex flex-wrap gap-2 mt-2">
            {MEAL_SUGGESTIONS[mealType].map((s) => (
              <button
                key={s}
                onClick={() => setMenu(s)}
                className="text-xs bg-gray-100 text-gray-600 px-3 py-1 rounded-full active:bg-emerald-100 active:text-emerald-600"
              >
                {s}
              </button>
            ))}
          </div>
        </div>

        <div className="mb-5">
          <label className="text-xs font-semibold text-gray-500 uppercase tracking-wide block mb-1.5">
            재료 (쉼표로 구분)
          </label>
          <input
            type="text"
            value={ingredients}
            onChange={(e) => setIngredients(e.target.value)}
            placeholder="예: 삼겹살 500g, 상추, 쌈장, 마늘"
            className="w-full rounded-xl border border-gray-200 px-4 py-3 text-base focus:outline-none focus:ring-2 focus:ring-emerald-400"
          />
        </div>

        <div className="flex gap-3">
          <button
            onClick={onClose}
            className="flex-1 py-3 rounded-xl border border-gray-200 text-gray-500 font-semibold active:bg-gray-50"
          >
            취소
          </button>
          <button
            onClick={handleSave}
            className="flex-1 py-3 rounded-xl bg-emerald-500 text-white font-semibold active:bg-emerald-600"
          >
            저장
          </button>
        </div>
      </div>
    </div>
  );
}

export function MealsView({ trip, meals, onUpsertMeal, onDeleteMeal, onBack }: Props) {
  const days = getTripDays(trip);
  const [activeDay, setActiveDay] = useState(1);
  const [modal, setModal] = useState<{ day: number; mealType: MealPlan["mealType"] } | null>(null);

  const getMeal = (day: number, mealType: MealPlan["mealType"]) =>
    meals.find((m) => m.day === day && m.mealType === mealType) ?? null;

  const activeMeal = modal ? getMeal(modal.day, modal.mealType) : null;

  // Gather all ingredients for shopping list
  const allIngredients = meals.flatMap((m) => m.ingredients).filter(Boolean);
  const uniqueIngredients = [...new Set(allIngredients)];

  return (
    <div className="flex flex-col min-h-full">
      {/* Header */}
      <div className="sticky top-0 bg-white/90 backdrop-blur-sm z-10 px-4 pt-4 pb-3 border-b border-gray-100">
        <div className="flex items-center gap-3 mb-3">
          <button onClick={onBack} className="text-emerald-600 font-medium text-sm active:opacity-60">
            ← 뒤로
          </button>
          <h2 className="font-bold text-gray-900 text-lg">식단 플랜</h2>
        </div>
        {/* Day tabs */}
        <div className="flex gap-2 overflow-x-auto pb-1" style={{ scrollbarWidth: "none" }}>
          {days.map((day) => (
            <button
              key={day}
              onClick={() => setActiveDay(day)}
              className={`flex-shrink-0 px-4 py-1.5 rounded-full text-sm font-medium transition-colors ${
                activeDay === day
                  ? "bg-emerald-500 text-white"
                  : "bg-gray-100 text-gray-600"
              }`}
            >
              {getDayLabel(trip, day)}
            </button>
          ))}
        </div>
      </div>

      <div className="flex-1 px-4 py-4">
        <div className="space-y-3">
          {MEAL_TYPES.map(({ key, label, emoji }) => {
            const meal = getMeal(activeDay, key);
            return (
              <div key={key} className="rounded-2xl bg-white border border-gray-100 shadow-sm overflow-hidden">
                <div className="flex items-center justify-between px-4 py-3 bg-gray-50 border-b border-gray-100">
                  <span className="font-semibold text-gray-700 text-sm">
                    {emoji} {label}
                  </span>
                  {meal && (
                    <button
                      onClick={() => onDeleteMeal(meal.id)}
                      className="text-xs text-gray-300 active:text-red-400"
                    >
                      삭제
                    </button>
                  )}
                </div>
                {meal ? (
                  <button
                    onClick={() => setModal({ day: activeDay, mealType: key })}
                    className="w-full px-4 py-3 text-left active:bg-gray-50"
                  >
                    <p className="font-medium text-gray-800">{meal.menu}</p>
                    {meal.ingredients.length > 0 && (
                      <p className="text-xs text-gray-400 mt-0.5">
                        재료: {meal.ingredients.join(", ")}
                      </p>
                    )}
                  </button>
                ) : (
                  <button
                    onClick={() => setModal({ day: activeDay, mealType: key })}
                    className="w-full px-4 py-3 text-left text-sm text-gray-400 active:bg-gray-50"
                  >
                    + 메뉴 추가하기
                  </button>
                )}
              </div>
            );
          })}
        </div>

        {/* Shopping list */}
        {uniqueIngredients.length > 0 && (
          <div className="mt-6">
            <h3 className="font-bold text-gray-700 mb-3">🛒 장보기 목록</h3>
            <div className="rounded-2xl bg-amber-50 border border-amber-100 p-4">
              <div className="flex flex-wrap gap-2">
                {uniqueIngredients.map((ing) => (
                  <span key={ing} className="bg-white border border-amber-200 text-amber-700 text-xs px-3 py-1.5 rounded-full">
                    {ing}
                  </span>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>

      {modal && (
        <MealModal
          day={modal.day}
          mealType={modal.mealType}
          existing={activeMeal}
          onSave={onUpsertMeal}
          onClose={() => setModal(null)}
        />
      )}
    </div>
  );
}
