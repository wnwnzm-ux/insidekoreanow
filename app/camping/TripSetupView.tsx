"use client";

import { useState } from "react";
import type { CampTrip } from "./types";

interface Props {
  trip: CampTrip | null;
  onSave: (trip: CampTrip) => void;
  onBack: () => void;
}

export function TripSetupView({ trip, onSave, onBack }: Props) {
  const today = new Date().toISOString().split("T")[0];
  const tomorrow = new Date(Date.now() + 86400000).toISOString().split("T")[0];

  const [name, setName] = useState(trip?.name ?? "");
  const [location, setLocation] = useState(trip?.location ?? "");
  const [startDate, setStartDate] = useState(trip?.startDate ?? today);
  const [endDate, setEndDate] = useState(trip?.endDate ?? tomorrow);
  const [groupSize, setGroupSize] = useState(trip?.groupSize ?? 2);

  function handleSave() {
    if (!name.trim() || !location.trim()) {
      alert("여행 이름과 장소를 입력해주세요.");
      return;
    }
    onSave({
      id: trip?.id ?? `trip-${Date.now()}`,
      name: name.trim(),
      location: location.trim(),
      startDate,
      endDate,
      groupSize,
      createdAt: trip?.createdAt ?? new Date().toISOString(),
    });
    onBack();
  }

  return (
    <div className="flex flex-col min-h-full">
      {/* Header */}
      <div className="sticky top-0 bg-white/90 backdrop-blur-sm z-10 px-4 pt-4 pb-3 border-b border-gray-100">
        <div className="flex items-center gap-3">
          <button onClick={onBack} className="text-emerald-600 font-medium text-sm active:opacity-60">
            ← 뒤로
          </button>
          <h2 className="font-bold text-gray-900 text-lg flex-1">여행 정보 설정</h2>
          <button
            onClick={handleSave}
            className="bg-emerald-500 text-white text-sm font-semibold px-4 py-1.5 rounded-full active:bg-emerald-600"
          >
            저장
          </button>
        </div>
      </div>

      <div className="flex-1 px-4 py-5 flex flex-col gap-5">
        {/* Trip name */}
        <div>
          <label className="text-xs font-semibold text-gray-500 uppercase tracking-wide block mb-1.5">
            여행 이름
          </label>
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="예: 지리산 여름 캠핑"
            className="w-full rounded-xl border border-gray-200 px-4 py-3 text-base focus:outline-none focus:ring-2 focus:ring-emerald-400"
          />
        </div>

        {/* Location */}
        <div>
          <label className="text-xs font-semibold text-gray-500 uppercase tracking-wide block mb-1.5">
            캠핑 장소
          </label>
          <input
            type="text"
            value={location}
            onChange={(e) => setLocation(e.target.value)}
            placeholder="예: 강원도 평창 오토캠핑장"
            className="w-full rounded-xl border border-gray-200 px-4 py-3 text-base focus:outline-none focus:ring-2 focus:ring-emerald-400"
          />
        </div>

        {/* Dates */}
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="text-xs font-semibold text-gray-500 uppercase tracking-wide block mb-1.5">
              출발일
            </label>
            <input
              type="date"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
              className="w-full rounded-xl border border-gray-200 px-3 py-3 text-base focus:outline-none focus:ring-2 focus:ring-emerald-400"
            />
          </div>
          <div>
            <label className="text-xs font-semibold text-gray-500 uppercase tracking-wide block mb-1.5">
              귀가일
            </label>
            <input
              type="date"
              value={endDate}
              min={startDate}
              onChange={(e) => setEndDate(e.target.value)}
              className="w-full rounded-xl border border-gray-200 px-3 py-3 text-base focus:outline-none focus:ring-2 focus:ring-emerald-400"
            />
          </div>
        </div>

        {/* Group size */}
        <div>
          <label className="text-xs font-semibold text-gray-500 uppercase tracking-wide block mb-1.5">
            인원수
          </label>
          <div className="flex items-center gap-4 bg-gray-50 rounded-xl p-4">
            <button
              onClick={() => setGroupSize((n) => Math.max(1, n - 1))}
              className="w-10 h-10 rounded-full bg-white shadow-sm text-xl font-bold text-gray-600 flex items-center justify-center active:bg-gray-100"
            >
              −
            </button>
            <div className="flex-1 text-center">
              <span className="text-3xl font-bold text-gray-800">{groupSize}</span>
              <span className="text-gray-500 ml-1">명</span>
            </div>
            <button
              onClick={() => setGroupSize((n) => Math.min(20, n + 1))}
              className="w-10 h-10 rounded-full bg-white shadow-sm text-xl font-bold text-gray-600 flex items-center justify-center active:bg-gray-100"
            >
              +
            </button>
          </div>
        </div>

        {/* Campsite tips */}
        <div className="rounded-2xl bg-amber-50 border border-amber-100 p-4">
          <p className="text-sm font-semibold text-amber-700 mb-2">🏕️ 추천 캠핑 사이트</p>
          <ul className="text-xs text-amber-600 space-y-1">
            <li>• <strong>국립공원 캠핑 예약:</strong> reservation.knps.or.kr</li>
            <li>• <strong>오토캠핑장 통합 예약:</strong> gocamping.or.kr</li>
            <li>• <strong>숲나들e (산림청):</strong> foresttrip.go.kr</li>
          </ul>
        </div>
      </div>
    </div>
  );
}
