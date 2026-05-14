"use client";

import { useEffect, useRef } from "react";
import { APIProvider, Map, AdvancedMarker, useMap, useMapsLibrary } from "@vis.gl/react-google-maps";
import type { DayPlan } from "./types";
import { MockMap } from "./MockMap";

const NEIGHBORHOOD_LATLNG: Record<string, { lat: number; lng: number }> = {
  "Jongno": { lat: 37.5742, lng: 126.9791 },
  "Jongno-gu": { lat: 37.5742, lng: 126.9791 },
  "Bukchon": { lat: 37.5828, lng: 126.9831 },
  "Bukchon Hanok Village": { lat: 37.5828, lng: 126.9831 },
  "Insadong": { lat: 37.5744, lng: 126.9866 },
  "Gwangjang": { lat: 37.5700, lng: 127.0093 },
  "Gwangjang Market": { lat: 37.5700, lng: 127.0093 },
  "Dongdaemun": { lat: 37.5660, lng: 127.0094 },
  "Dongdaemun-gu": { lat: 37.5660, lng: 127.0094 },
  "Myeongdong": { lat: 37.5636, lng: 126.9834 },
  "Namdaemun": { lat: 37.5592, lng: 126.9777 },
  "Hongdae": { lat: 37.5572, lng: 126.9248 },
  "Mapo-gu": { lat: 37.5545, lng: 126.9147 },
  "Mangwon": { lat: 37.5518, lng: 126.9046 },
  "Sinchon": { lat: 37.5552, lng: 126.9368 },
  "Itaewon": { lat: 37.5340, lng: 126.9945 },
  "Yongsan": { lat: 37.5408, lng: 126.9646 },
  "Yongsan-gu": { lat: 37.5408, lng: 126.9646 },
  "Hannam": { lat: 37.5357, lng: 127.0025 },
  "Gangnam": { lat: 37.4979, lng: 127.0276 },
  "Gangnam-gu": { lat: 37.4979, lng: 127.0276 },
  "Apgujeong": { lat: 37.5275, lng: 127.0376 },
  "Cheongdam": { lat: 37.5276, lng: 127.0385 },
  "Sinsa": { lat: 37.5176, lng: 127.0214 },
  "Garosu-gil": { lat: 37.5176, lng: 127.0214 },
  "Jamsil": { lat: 37.5133, lng: 127.1001 },
  "Songpa-gu": { lat: 37.5144, lng: 127.1060 },
  "Yeouido": { lat: 37.5219, lng: 126.9245 },
  "Seongsu": { lat: 37.5446, lng: 127.0564 },
  "Seongsu-dong": { lat: 37.5446, lng: 127.0564 },
  "Euljiro": { lat: 37.5660, lng: 126.9954 },
  "Samcheong-dong": { lat: 37.5856, lng: 126.9803 },
  "Gyeongbokgung": { lat: 37.5796, lng: 126.9770 },
  "Changdeokgung": { lat: 37.5794, lng: 126.9910 },
  "Namsan": { lat: 37.5512, lng: 126.9882 },
  "N Seoul Tower": { lat: 37.5512, lng: 126.9882 },
  "Seoul": { lat: 37.5665, lng: 126.9780 },
};

function getLatLng(neighborhood: string): { lat: number; lng: number } {
  const exact = NEIGHBORHOOD_LATLNG[neighborhood];
  if (exact) return exact;
  const key = Object.keys(NEIGHBORHOOD_LATLNG).find(
    (k) =>
      neighborhood.toLowerCase().includes(k.toLowerCase()) ||
      k.toLowerCase().includes(neighborhood.toLowerCase())
  );
  return key ? NEIGHBORHOOD_LATLNG[key] : { lat: 37.5665, lng: 126.9780 };
}

export const DAY_COLORS = [
  "#0d9488",
  "#7c3aed",
  "#dc2626",
  "#d97706",
  "#2563eb",
  "#16a34a",
  "#db2777",
];

interface PinData {
  lat: number;
  lng: number;
  label: string;
  color: string;
  placeId: string;
  dayIndex: number;
}

function RouteLines({ pins }: { pins: PinData[] }) {
  const map = useMap();
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const mapsLib = useMapsLibrary("maps") as any;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const linesRef = useRef<any[]>([]);

  useEffect(() => {
    if (!map || !mapsLib) return;
    linesRef.current.forEach((l) => l.setMap(null));
    linesRef.current = [];

    const byDay: Record<number, PinData[]> = {};
    pins.forEach((p) => {
      (byDay[p.dayIndex] = byDay[p.dayIndex] ?? []).push(p);
    });

    Object.entries(byDay).forEach(([di, dayPins]) => {
      const color = DAY_COLORS[Number(di) % DAY_COLORS.length];
      for (let i = 0; i < dayPins.length - 1; i++) {
        const line = new mapsLib.Polyline({
          path: [
            { lat: dayPins[i].lat, lng: dayPins[i].lng },
            { lat: dayPins[i + 1].lat, lng: dayPins[i + 1].lng },
          ],
          strokeColor: color,
          strokeOpacity: 0.55,
          strokeWeight: 2.5,
          map,
        });
        linesRef.current.push(line);
      }
    });

    return () => linesRef.current.forEach((l) => l.setMap(null));
  }, [map, mapsLib, pins]);

  return null;
}

function MapMarkers({
  pins,
  highlightedPlaceId,
  onPinClick,
}: {
  pins: PinData[];
  highlightedPlaceId?: string;
  onPinClick?: (id: string) => void;
}) {
  return (
    <>
      {pins.map((pin) => {
        const isHighlighted = pin.placeId === highlightedPlaceId;
        return (
          <AdvancedMarker
            key={pin.placeId}
            position={{ lat: pin.lat, lng: pin.lng }}
            onClick={() => onPinClick?.(pin.placeId)}
          >
            <div
              style={{
                backgroundColor: pin.color,
                width: isHighlighted ? 30 : 26,
                height: isHighlighted ? 30 : 26,
                fontSize: isHighlighted ? 11 : 9,
                boxShadow: isHighlighted ? "0 0 0 3px white, 0 2px 8px rgba(0,0,0,0.3)" : "0 1px 4px rgba(0,0,0,0.25)",
              }}
              className="flex cursor-pointer items-center justify-center rounded-full font-bold text-white ring-2 ring-white transition-all"
            >
              {pin.label}
            </div>
          </AdvancedMarker>
        );
      })}
    </>
  );
}

interface Props {
  days: DayPlan[];
  activeDay: number;
  onPinClick?: (placeId: string) => void;
  highlightedPlaceId?: string;
}

export function PlanMap({ days, activeDay, onPinClick, highlightedPlaceId }: Props) {
  const apiKey = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY;

  if (!apiKey) {
    return (
      <MockMap
        days={days}
        activeDay={activeDay}
        onPinClick={onPinClick}
        highlightedPlaceId={highlightedPlaceId}
      />
    );
  }

  const allPins: PinData[] = [];
  days.forEach((day, di) => {
    day.places.forEach((place, pi) => {
      const pos = getLatLng(place.neighborhood);
      allPins.push({
        lat: pos.lat,
        lng: pos.lng,
        label: String(pi + 1),
        color: DAY_COLORS[di % DAY_COLORS.length],
        placeId: place.id,
        dayIndex: di,
      });
    });
  });

  const activePins =
    activeDay === 0 ? allPins : allPins.filter((p) => p.dayIndex === activeDay - 1);

  return (
    <div className="relative h-full w-full overflow-hidden rounded-2xl">
      <APIProvider apiKey={apiKey}>
        <Map
          defaultCenter={{ lat: 37.5665, lng: 126.978 }}
          defaultZoom={12}
          mapId="DEMO_MAP_ID"
          style={{ width: "100%", height: "100%" }}
          gestureHandling="cooperative"
          disableDefaultUI={false}
        >
          <RouteLines pins={activePins} />
          <MapMarkers
            pins={activePins}
            highlightedPlaceId={highlightedPlaceId}
            onPinClick={onPinClick}
          />
        </Map>
      </APIProvider>

      <div className="pointer-events-none absolute bottom-3 left-3 flex flex-wrap gap-1.5">
        {days.map((day, di) => (
          <span
            key={day.day}
            className="flex items-center gap-1 rounded-full px-2 py-0.5 text-xs font-medium text-white"
            style={{ backgroundColor: DAY_COLORS[di % DAY_COLORS.length] }}
          >
            Day {day.day}
          </span>
        ))}
      </div>
    </div>
  );
}
