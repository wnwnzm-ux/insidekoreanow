"use client";

import { useState } from "react";
import { useCampingStore } from "./useCampingStore";
import { HomeView } from "./HomeView";
import { TripSetupView } from "./TripSetupView";
import { ChecklistView } from "./ChecklistView";
import { MealsView } from "./MealsView";
import { SummaryView } from "./SummaryView";
import type { AppView } from "./types";

const NAV_ITEMS: { view: AppView; label: string; emoji: string }[] = [
  { view: "home", label: "홈", emoji: "🏠" },
  { view: "checklist", label: "체크리스트", emoji: "✅" },
  { view: "meals", label: "식단", emoji: "🍽️" },
  { view: "summary", label: "요약", emoji: "📊" },
];

export function CampingApp() {
  const [view, setView] = useState<AppView>("home");
  const store = useCampingStore();

  return (
    <div className="flex flex-col bg-gray-50" style={{ minHeight: "100dvh" }}>
      {/* Scrollable content area */}
      <div className="flex-1 overflow-y-auto pb-20">
        {view === "home" && (
          <HomeView
            trip={store.data.trip}
            progress={store.progress}
            checkedItems={store.checkedItems}
            totalItems={store.totalItems}
            mealsCount={store.data.meals.length}
            onNavigate={setView}
            onReset={store.resetAll}
          />
        )}
        {view === "trip-setup" && (
          <TripSetupView
            trip={store.data.trip}
            onSave={store.setTrip}
            onBack={() => setView("home")}
          />
        )}
        {view === "checklist" && (
          <ChecklistView
            checklists={store.data.checklists}
            onToggle={store.toggleItem}
            onAddItem={store.addCustomItem}
            onDeleteItem={store.deleteCustomItem}
            onBack={() => setView("home")}
          />
        )}
        {view === "meals" && (
          <MealsView
            trip={store.data.trip}
            meals={store.data.meals}
            onUpsertMeal={store.upsertMeal}
            onDeleteMeal={store.deleteMeal}
            onBack={() => setView("home")}
          />
        )}
        {view === "summary" && (
          <SummaryView
            trip={store.data.trip}
            checklists={store.data.checklists}
            meals={store.data.meals}
            progress={store.progress}
            onBack={() => setView("home")}
          />
        )}
      </div>

      {/* Bottom tab bar — iOS style */}
      <div
        className="fixed bottom-0 left-0 right-0 bg-white/90 backdrop-blur-md border-t border-gray-100 flex"
        style={{ paddingBottom: "env(safe-area-inset-bottom, 0px)" }}
      >
        {NAV_ITEMS.map(({ view: v, label, emoji }) => {
          const isActive = view === v || (v === "home" && view === "trip-setup");
          return (
            <button
              key={v}
              onClick={() => setView(v)}
              className={`flex-1 flex flex-col items-center justify-center py-2 gap-0.5 transition-colors ${
                isActive ? "text-emerald-600" : "text-gray-400"
              }`}
            >
              <span className="text-xl">{emoji}</span>
              <span className="text-[10px] font-medium">{label}</span>
            </button>
          );
        })}
      </div>
    </div>
  );
}
