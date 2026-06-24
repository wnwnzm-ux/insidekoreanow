"use client";

import { useState } from "react";
import type { ChecklistCategory } from "./types";

interface Props {
  checklists: ChecklistCategory[];
  onToggle: (categoryId: string, itemId: string) => void;
  onAddItem: (categoryId: string, label: string) => void;
  onDeleteItem: (categoryId: string, itemId: string) => void;
  onBack: () => void;
}

export function ChecklistView({ checklists, onToggle, onAddItem, onDeleteItem, onBack }: Props) {
  const [activeCategory, setActiveCategory] = useState<string | null>(checklists[0]?.id ?? null);
  const [newItemText, setNewItemText] = useState("");
  const [addingTo, setAddingTo] = useState<string | null>(null);

  const currentCat = checklists.find((c) => c.id === activeCategory);
  const catProgress = currentCat
    ? Math.round((currentCat.items.filter((i) => i.checked).length / currentCat.items.length) * 100)
    : 0;

  function handleAdd(categoryId: string) {
    if (!newItemText.trim()) return;
    onAddItem(categoryId, newItemText.trim());
    setNewItemText("");
    setAddingTo(null);
  }

  return (
    <div className="flex flex-col min-h-full">
      {/* Header */}
      <div className="sticky top-0 bg-white/90 backdrop-blur-sm z-10 px-4 pt-4 pb-3 border-b border-gray-100">
        <div className="flex items-center gap-3 mb-3">
          <button onClick={onBack} className="text-emerald-600 font-medium text-sm active:opacity-60">
            ← 뒤로
          </button>
          <h2 className="font-bold text-gray-900 text-lg">준비물 체크리스트</h2>
        </div>
        {/* Category tabs */}
        <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-hide" style={{ scrollbarWidth: "none" }}>
          {checklists.map((cat) => {
            const done = cat.items.filter((i) => i.checked).length;
            const isActive = cat.id === activeCategory;
            return (
              <button
                key={cat.id}
                onClick={() => setActiveCategory(cat.id)}
                className={`flex-shrink-0 flex items-center gap-1.5 px-3 py-1.5 rounded-full text-sm font-medium transition-colors ${
                  isActive
                    ? "bg-emerald-500 text-white"
                    : "bg-gray-100 text-gray-600"
                }`}
              >
                <span>{cat.emoji}</span>
                <span className="whitespace-nowrap">{cat.name}</span>
                <span
                  className={`text-xs rounded-full px-1.5 py-0.5 ${
                    isActive ? "bg-emerald-400 text-white" : "bg-gray-200 text-gray-500"
                  }`}
                >
                  {done}/{cat.items.length}
                </span>
              </button>
            );
          })}
        </div>
      </div>

      {currentCat && (
        <div className="flex-1 px-4 py-4">
          {/* Category progress */}
          <div className="flex items-center justify-between mb-3">
            <h3 className="font-bold text-gray-800">
              {currentCat.emoji} {currentCat.name}
            </h3>
            <span className="text-sm font-bold text-emerald-600">{catProgress}%</span>
          </div>
          <div className="w-full bg-gray-100 rounded-full h-1.5 mb-4">
            <div
              className="bg-emerald-500 h-1.5 rounded-full transition-all duration-300"
              style={{ width: `${catProgress}%` }}
            />
          </div>

          {/* Items */}
          <div className="space-y-2">
            {currentCat.items.map((item) => (
              <div
                key={item.id}
                className="flex items-center gap-3 bg-white rounded-xl border border-gray-100 px-4 py-3 shadow-sm"
              >
                <button
                  onClick={() => onToggle(currentCat.id, item.id)}
                  className={`w-6 h-6 rounded-full border-2 flex items-center justify-center flex-shrink-0 transition-colors ${
                    item.checked
                      ? "bg-emerald-500 border-emerald-500"
                      : "border-gray-300 bg-white"
                  }`}
                >
                  {item.checked && (
                    <svg className="w-3.5 h-3.5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                    </svg>
                  )}
                </button>
                <span
                  className={`flex-1 text-sm ${
                    item.checked ? "line-through text-gray-300" : "text-gray-700"
                  }`}
                >
                  {item.label}
                </span>
                {item.custom && (
                  <button
                    onClick={() => onDeleteItem(currentCat.id, item.id)}
                    className="text-gray-300 text-lg leading-none active:text-red-400 p-1"
                  >
                    ×
                  </button>
                )}
              </div>
            ))}
          </div>

          {/* Add item */}
          <div className="mt-4">
            {addingTo === currentCat.id ? (
              <div className="flex gap-2">
                <input
                  autoFocus
                  type="text"
                  value={newItemText}
                  onChange={(e) => setNewItemText(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter") handleAdd(currentCat.id);
                    if (e.key === "Escape") setAddingTo(null);
                  }}
                  placeholder="항목 이름 입력"
                  className="flex-1 rounded-xl border border-gray-200 px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-400"
                />
                <button
                  onClick={() => handleAdd(currentCat.id)}
                  className="bg-emerald-500 text-white px-4 py-2.5 rounded-xl text-sm font-semibold active:bg-emerald-600"
                >
                  추가
                </button>
                <button
                  onClick={() => setAddingTo(null)}
                  className="text-gray-400 px-2 active:text-gray-600"
                >
                  취소
                </button>
              </div>
            ) : (
              <button
                onClick={() => setAddingTo(currentCat.id)}
                className="w-full rounded-xl border-2 border-dashed border-gray-200 py-3 text-sm text-gray-400 font-medium active:border-emerald-300 active:text-emerald-500"
              >
                + 항목 직접 추가
              </button>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
