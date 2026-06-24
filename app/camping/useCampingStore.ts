"use client";

import { useState, useEffect, useCallback } from "react";
import type { CampingData, CampTrip, ChecklistCategory, MealPlan } from "./types";
import { getDefaultChecklists } from "./defaultChecklists";

const STORAGE_KEY = "camping-app-data";

function loadFromStorage(): CampingData {
  if (typeof window === "undefined") {
    return { trip: null, checklists: getDefaultChecklists(), meals: [] };
  }
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) return JSON.parse(raw) as CampingData;
  } catch {}
  return { trip: null, checklists: getDefaultChecklists(), meals: [] };
}

export function useCampingStore() {
  const [data, setData] = useState<CampingData>(() => loadFromStorage());

  const persist = useCallback((next: CampingData) => {
    setData(next);
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
    } catch {}
  }, []);

  const setTrip = useCallback(
    (trip: CampTrip) => persist({ ...data, trip }),
    [data, persist]
  );

  const toggleItem = useCallback(
    (categoryId: string, itemId: string) => {
      const checklists = data.checklists.map((cat) => {
        if (cat.id !== categoryId) return cat;
        return {
          ...cat,
          items: cat.items.map((item) =>
            item.id === itemId ? { ...item, checked: !item.checked } : item
          ),
        };
      });
      persist({ ...data, checklists });
    },
    [data, persist]
  );

  const addCustomItem = useCallback(
    (categoryId: string, label: string) => {
      const id = `custom-${Date.now()}`;
      const checklists = data.checklists.map((cat) => {
        if (cat.id !== categoryId) return cat;
        return {
          ...cat,
          items: [...cat.items, { id, label, checked: false, custom: true }],
        };
      });
      persist({ ...data, checklists });
    },
    [data, persist]
  );

  const deleteCustomItem = useCallback(
    (categoryId: string, itemId: string) => {
      const checklists = data.checklists.map((cat) => {
        if (cat.id !== categoryId) return cat;
        return {
          ...cat,
          items: cat.items.filter((item) => item.id !== itemId),
        };
      });
      persist({ ...data, checklists });
    },
    [data, persist]
  );

  const upsertMeal = useCallback(
    (meal: MealPlan) => {
      const meals = data.meals.filter((m) => m.id !== meal.id);
      persist({ ...data, meals: [...meals, meal] });
    },
    [data, persist]
  );

  const deleteMeal = useCallback(
    (mealId: string) => {
      persist({ ...data, meals: data.meals.filter((m) => m.id !== mealId) });
    },
    [data, persist]
  );

  const resetAll = useCallback(() => {
    const fresh: CampingData = { trip: null, checklists: getDefaultChecklists(), meals: [] };
    persist(fresh);
  }, [persist]);

  const totalItems = data.checklists.reduce((acc, cat) => acc + cat.items.length, 0);
  const checkedItems = data.checklists.reduce(
    (acc, cat) => acc + cat.items.filter((i) => i.checked).length,
    0
  );

  return {
    data,
    setTrip,
    toggleItem,
    addCustomItem,
    deleteCustomItem,
    upsertMeal,
    deleteMeal,
    resetAll,
    progress: totalItems > 0 ? Math.round((checkedItems / totalItems) * 100) : 0,
    checkedItems,
    totalItems,
  };
}
