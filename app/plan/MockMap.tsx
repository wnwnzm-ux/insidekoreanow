"use client";

import type { PlaceItem, DayPlan } from "./types";

const NEIGHBORHOOD_POSITIONS: Record<string, [number, number]> = {
  // North / palace area
  "Jongno": [235, 130], "Jongno-gu": [235, 130],
  "Bukchon": [252, 112], "Bukchon Hanok Village": [252, 112],
  "Insadong": [225, 145], "Ikseon-dong": [230, 148], "Ikseon": [230, 148],
  "Samcheong-dong": [242, 118], "Samcheong": [242, 118],
  "Gyeongbokgung": [220, 118], "Changdeokgung": [258, 118],
  "Anguk": [245, 122],
  // East / market
  "Gwangjang": [290, 138], "Gwangjang Market": [290, 138],
  "Dongdaemun": [310, 148], "Dongdaemun-gu": [310, 148],
  "Euljiro": [240, 162],
  // Center / Myeongdong
  "Myeongdong": [220, 178], "Namdaemun": [205, 192],
  // West / Hongdae area
  "Hongdae": [108, 172], "Mapo-gu": [100, 195],
  "Mangwon": [105, 210], "Mangwon Market": [105, 210],
  "Hapjeong": [108, 188], "Sangsu": [112, 182],
  "Sinchon": [128, 182],
  // South / Itaewon
  "Itaewon": [168, 222], "Yongsan": [188, 212], "Yongsan-gu": [188, 212],
  "Hannam": [215, 235], "Namsan": [205, 210], "N Seoul Tower": [205, 210],
  "Noksapyeong": [160, 230],
  // Southeast / Seongsu
  "Seongsu": [335, 225], "Seongsu-dong": [335, 225],
  // Gangnam
  "Gangnam": [272, 318], "Gangnam-gu": [272, 318],
  "Apgujeong": [248, 308], "Cheongdam": [270, 310],
  "Sinsa": [240, 320], "Garosu-gil": [242, 322],
  "Daechi": [310, 325], "Dogok": [295, 335],
  // Seocho
  "Seocho": [240, 340], "Seocho-gu": [240, 340],
  // Yeouido / Noryangjin
  "Yeouido": [142, 265], "Noryangjin": [165, 285],
  // Jamsil / Olympic
  "Jamsil": [372, 302], "Songpa-gu": [358, 328],
  "Olympic Park": [390, 310],
  // Fallback
  "Seoul": [235, 200],
};

function getPosition(neighborhood: string): [number, number] {
  if (!neighborhood) return [235, 200];
  const exact = NEIGHBORHOOD_POSITIONS[neighborhood];
  if (exact) return exact;
  // Case-insensitive substring match
  const lower = neighborhood.toLowerCase();
  const key = Object.keys(NEIGHBORHOOD_POSITIONS).find((k) => {
    const kl = k.toLowerCase();
    return lower.includes(kl) || kl.includes(lower);
  });
  return key ? NEIGHBORHOOD_POSITIONS[key] : [235, 200];
}

const DAY_COLORS = [
  "#0d9488", "#7c3aed", "#dc2626", "#d97706", "#2563eb", "#16a34a", "#db2777",
];

interface PinData {
  x: number;
  y: number;
  label: string;
  color: string;
  place: PlaceItem;
  dayIndex: number;
}

interface MealEntry {
  id: number;
  name: string;
  neighborhood: string | null;
  maps_url: string | null;
}

interface Props {
  days: DayPlan[];
  activeDay: number;
  onPinClick?: (placeId: string) => void;
  highlightedPlaceId?: string;
  meals?: (MealEntry | null)[];
}

export function MockMap({ days, activeDay, onPinClick, highlightedPlaceId, meals }: Props) {
  const pins: PinData[] = [];
  // Track how many pins per bucket position, spread them radially
  const offsets: Record<string, number> = {};

  days.forEach((day, di) => {
    day.places.forEach((place, pi) => {
      const [bx, by] = getPosition(place.neighborhood);
      const key = `${Math.round(bx)},${Math.round(by)}`;
      const slot = offsets[key] ?? 0;
      offsets[key] = slot + 1;
      const angle = (slot * Math.PI * 2) / 5;
      const r = slot > 0 ? 22 : 0;
      pins.push({
        x: bx + Math.cos(angle) * r,
        y: by + Math.sin(angle) * r,
        label: String(pi + 1),
        color: DAY_COLORS[di % DAY_COLORS.length],
        place,
        dayIndex: di,
      });
    });
  });

  const activePins = activeDay === 0 ? pins : pins.filter((p) => p.dayIndex === activeDay - 1);

  // Meal pins
  const mealPins = (meals ?? [])
    .map((r, i) => {
      if (!r) return null;
      const [bx, by] = getPosition(r.neighborhood ?? "Seoul");
      const key = `${Math.round(bx)},${Math.round(by)}`;
      const slot = offsets[key] ?? 0;
      offsets[key] = slot + 1;
      const angle = (slot * Math.PI * 2) / 5;
      const mr = slot > 0 ? 22 : 0;
      return {
        x: bx + Math.cos(angle) * mr,
        y: by + Math.sin(angle) * mr,
        label: i === 0 ? "L" : "D",
        color: i === 0 ? "#f59e0b" : "#ea580c",
        name: r.name,
        id: r.id,
      };
    })
    .filter((m): m is NonNullable<typeof m> => m !== null);

  return (
    <div className="relative h-full w-full overflow-hidden rounded-2xl bg-slate-100">
      <svg viewBox="0 0 500 420" className="h-full w-full" style={{ fontFamily: "inherit" }}>
        {/* Background */}
        <rect width="500" height="420" fill="#f1f5f9" />
        {/* Grid */}
        {Array.from({ length: 12 }, (_, i) => (
          <line key={`h${i}`} x1="0" y1={i * 35} x2="500" y2={i * 35} stroke="#e2e8f0" strokeWidth="0.5" />
        ))}
        {Array.from({ length: 15 }, (_, i) => (
          <line key={`v${i}`} x1={i * 35} y1="0" x2={i * 35} y2="420" stroke="#e2e8f0" strokeWidth="0.5" />
        ))}
        {/* Han River */}
        <path
          d="M0 258 Q80 248 160 262 Q240 278 320 268 Q400 255 500 262 L500 285 Q400 278 320 292 Q240 302 160 288 Q80 274 0 282 Z"
          fill="#bfdbfe" opacity="0.8"
        />
        <text x="175" y="278" fontSize="9" fill="#93c5fd" textAnchor="middle" fontWeight="600">Han River</text>

        {/* District labels */}
        {([
          [252, 106, "Bukchon"], [222, 124, "Jongno"], [295, 132, "Gwangjang"],
          [312, 142, "Dongdaemun"], [104, 165, "Hongdae"], [218, 172, "Myeongdong"],
          [165, 216, "Itaewon"], [275, 312, "Gangnam"], [375, 295, "Jamsil"],
          [140, 258, "Yeouido"], [337, 218, "Seongsu"],
        ] as [number, number, string][]).map(([x, y, label]) => (
          <text key={label} x={x} y={y} fontSize="8.5" fill="#94a3b8" textAnchor="middle">{label}</text>
        ))}

        {/* Route lines — bold red */}
        {activePins.length > 1 &&
          activePins.slice(0, -1).map((pin, i) => {
            const next = activePins[i + 1];
            if (pin.dayIndex !== next.dayIndex) return null;
            return (
              <line
                key={`route-${i}`}
                x1={pin.x} y1={pin.y} x2={next.x} y2={next.y}
                stroke="#ef4444" strokeWidth="3" strokeLinecap="round" opacity="0.85"
              />
            );
          })}

        {/* Place pins */}
        {activePins.map((pin) => {
          const isHighlighted = pin.place.id === highlightedPlaceId;
          const r = isHighlighted ? 12 : 10;
          return (
            <g key={pin.place.id} onClick={() => onPinClick?.(pin.place.id)} style={{ cursor: "pointer" }}>
              <circle
                cx={pin.x} cy={pin.y} r={r}
                fill={pin.color} stroke="white" strokeWidth="2"
                opacity={isHighlighted ? 1 : 0.9}
              />
              <text
                x={pin.x} y={pin.y + 1}
                textAnchor="middle" dominantBaseline="middle"
                fontSize="8" fontWeight="700" fill="white"
              >
                {pin.label}
              </text>
            </g>
          );
        })}

        {/* Meal pins */}
        {mealPins.map((pin) => (
          <g key={`meal-${pin.id}-${pin.label}`}>
            <circle cx={pin.x} cy={pin.y} r={10} fill={pin.color} stroke="white" strokeWidth="2" opacity="0.9" />
            <text
              x={pin.x} y={pin.y + 1}
              textAnchor="middle" dominantBaseline="middle"
              fontSize="8" fontWeight="700" fill="white"
            >
              {pin.label}
            </text>
          </g>
        ))}
      </svg>

      {/* Legend */}
      <div className="absolute bottom-3 left-3 right-3 flex flex-wrap gap-1.5">
        {days.map((day, di) => (
          <span
            key={day.day}
            className="flex items-center gap-1 rounded-full px-2 py-0.5 text-xs font-medium text-white"
            style={{ backgroundColor: DAY_COLORS[di % DAY_COLORS.length] }}
          >
            Day {day.day}
          </span>
        ))}
        {mealPins.length > 0 && (
          <>
            <span className="flex items-center gap-1 rounded-full bg-amber-400 px-2 py-0.5 text-xs font-medium text-white">L Lunch</span>
            <span className="flex items-center gap-1 rounded-full bg-orange-600 px-2 py-0.5 text-xs font-medium text-white">D Dinner</span>
          </>
        )}
      </div>

      <div className="pointer-events-none absolute top-2 right-2 rounded bg-white/60 px-1.5 py-0.5 text-[10px] text-slate-400">
        Preview map
      </div>
    </div>
  );
}
