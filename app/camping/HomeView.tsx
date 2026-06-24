"use client";

import type { CampTrip } from "./types";
import type { AppView } from "./types";

interface Props {
  trip: CampTrip | null;
  progress: number;
  checkedItems: number;
  totalItems: number;
  mealsCount: number;
  onNavigate: (view: AppView) => void;
  onReset: () => void;
}

export function HomeView({ trip, progress, checkedItems, totalItems, mealsCount, onNavigate, onReset }: Props) {
  const tripDays =
    trip
      ? Math.max(
          1,
          Math.round(
            (new Date(trip.endDate).getTime() - new Date(trip.startDate).getTime()) /
              (1000 * 60 * 60 * 24)
          ) + 1
        )
      : null;

  return (
    <div className="flex flex-col gap-4 px-4 pt-4 pb-safe">
      {/* Hero */}
      <div className="rounded-2xl bg-gradient-to-br from-green-600 to-emerald-800 p-5 text-white shadow-lg">
        <div className="text-3xl mb-1">⛺</div>
        <h1 className="text-2xl font-bold">캠핑 플래너</h1>
        <p className="text-green-100 text-sm mt-1">준비물 체크부터 식단 계획까지</p>
      </div>

      {/* Trip card */}
      {trip ? (
        <div
          className="rounded-2xl bg-white border border-gray-100 shadow-sm p-4 active:bg-gray-50"
          onClick={() => onNavigate("trip-setup")}
        >
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs text-gray-400 font-medium uppercase tracking-wide">내 캠핑 여행</p>
              <p className="font-bold text-gray-900 text-lg mt-0.5">{trip.name}</p>
              <p className="text-gray-500 text-sm">{trip.location}</p>
            </div>
            <div className="text-right">
              <div className="text-2xl font-bold text-emerald-600">{tripDays}</div>
              <div className="text-xs text-gray-400">박 {(tripDays ?? 0) - 1}일</div>
            </div>
          </div>
          <div className="mt-3 flex items-center gap-3 text-sm text-gray-500">
            <span>📅 {trip.startDate} ~ {trip.endDate}</span>
            <span>👥 {trip.groupSize}명</span>
          </div>
        </div>
      ) : (
        <button
          onClick={() => onNavigate("trip-setup")}
          className="rounded-2xl border-2 border-dashed border-emerald-300 bg-emerald-50 p-5 text-center active:bg-emerald-100"
        >
          <div className="text-2xl mb-1">📋</div>
          <p className="font-semibold text-emerald-700">여행 정보 입력하기</p>
          <p className="text-sm text-emerald-500 mt-0.5">날짜, 장소, 인원을 설정하세요</p>
        </button>
      )}

      {/* Progress bar */}
      <div className="rounded-2xl bg-white border border-gray-100 shadow-sm p-4">
        <div className="flex justify-between items-center mb-2">
          <span className="font-semibold text-gray-700">준비물 체크리스트</span>
          <span className="text-sm font-bold text-emerald-600">{checkedItems}/{totalItems}</span>
        </div>
        <div className="w-full bg-gray-100 rounded-full h-2.5 mb-3">
          <div
            className="bg-gradient-to-r from-emerald-400 to-green-500 h-2.5 rounded-full transition-all duration-500"
            style={{ width: `${progress}%` }}
          />
        </div>
        <p className="text-xs text-gray-400">
          {progress === 100 ? "✅ 모든 준비 완료!" : `${100 - progress}% 남았어요`}
        </p>
      </div>

      {/* Nav buttons */}
      <div className="grid grid-cols-2 gap-3">
        <button
          onClick={() => onNavigate("checklist")}
          className="rounded-2xl bg-white border border-gray-100 shadow-sm p-4 text-left active:bg-gray-50"
        >
          <div className="text-2xl mb-2">✅</div>
          <p className="font-semibold text-gray-800">준비물 체크</p>
          <p className="text-xs text-gray-400 mt-0.5">카테고리별 관리</p>
        </button>
        <button
          onClick={() => onNavigate("meals")}
          className="rounded-2xl bg-white border border-gray-100 shadow-sm p-4 text-left active:bg-gray-50"
        >
          <div className="text-2xl mb-2">🍽️</div>
          <p className="font-semibold text-gray-800">식단 플랜</p>
          <p className="text-xs text-gray-400 mt-0.5">{mealsCount > 0 ? `${mealsCount}개 메뉴 계획됨` : "끼니별 메뉴 계획"}</p>
        </button>
        <button
          onClick={() => onNavigate("summary")}
          className="rounded-2xl bg-white border border-gray-100 shadow-sm p-4 text-left active:bg-gray-50"
        >
          <div className="text-2xl mb-2">📊</div>
          <p className="font-semibold text-gray-800">요약 보기</p>
          <p className="text-xs text-gray-400 mt-0.5">전체 계획 확인</p>
        </button>
        <button
          onClick={() => onNavigate("trip-setup")}
          className="rounded-2xl bg-white border border-gray-100 shadow-sm p-4 text-left active:bg-gray-50"
        >
          <div className="text-2xl mb-2">⚙️</div>
          <p className="font-semibold text-gray-800">여행 설정</p>
          <p className="text-xs text-gray-400 mt-0.5">정보 수정하기</p>
        </button>
      </div>

      {/* Reset */}
      <button
        onClick={() => {
          if (confirm("모든 데이터를 초기화할까요?")) onReset();
        }}
        className="text-xs text-gray-300 text-center py-2 active:text-red-400"
      >
        초기화
      </button>
    </div>
  );
}
