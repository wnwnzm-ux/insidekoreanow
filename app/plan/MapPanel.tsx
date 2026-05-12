"use client";

import { useEffect, useRef } from "react";
import {
  APIProvider,
  Map,
  AdvancedMarker,
  useMap,
  Pin,
} from "@vis.gl/react-google-maps";
import { CATEGORIES, type PlanItem } from "./data";

const API_KEY = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY ?? "";

const SEOUL_CENTER = { lat: 37.5665, lng: 126.978 };

// ── Route polyline drawn via Maps JS API ──────────────────────────────────────

function RoutePolyline({ points }: { points: google.maps.LatLngLiteral[] }) {
  const map = useMap();
  const polylineRef = useRef<google.maps.Polyline | null>(null);

  useEffect(() => {
    if (!map || points.length < 2) {
      polylineRef.current?.setMap(null);
      return;
    }

    if (!polylineRef.current) {
      polylineRef.current = new google.maps.Polyline({
        strokeColor: "#0f766e",
        strokeOpacity: 0.8,
        strokeWeight: 3,
        icons: [
          {
            icon: { path: google.maps.SymbolPath.FORWARD_CLOSED_ARROW, scale: 3 },
            offset: "50%",
            repeat: "120px",
          },
        ],
      });
    }

    polylineRef.current.setPath(points);
    polylineRef.current.setMap(map);

    return () => {
      polylineRef.current?.setMap(null);
    };
  }, [map, points]);

  return null;
}

// ── Map with markers ──────────────────────────────────────────────────────────

function PlanMap({ dayItems }: { dayItems: PlanItem[] }) {
  const catMap = Object.fromEntries(CATEGORIES.map((c) => [c.id, c]));
  const points = dayItems.map((i) => ({ lat: i.place.lat, lng: i.place.lng }));

  // Fit bounds when items change
  const map = useMap();
  useEffect(() => {
    if (!map || dayItems.length === 0) return;
    if (dayItems.length === 1) {
      map.panTo({ lat: dayItems[0].place.lat, lng: dayItems[0].place.lng });
      map.setZoom(15);
      return;
    }
    const bounds = new google.maps.LatLngBounds();
    dayItems.forEach((i) => bounds.extend({ lat: i.place.lat, lng: i.place.lng }));
    map.fitBounds(bounds, 60);
  }, [map, dayItems]);

  return (
    <>
      <RoutePolyline points={points} />
      {dayItems.map((item, idx) => (
        <AdvancedMarker
          key={item.id}
          position={{ lat: item.place.lat, lng: item.place.lng }}
          title={item.place.name}
        >
          <Pin
            background="#ff4d4d"
            borderColor="#cc0000"
            glyphColor="white"
            glyph={String(idx + 1)}
          />
        </AdvancedMarker>
      ))}
    </>
  );
}

// ── Mock map fallback (no API key) ────────────────────────────────────────────

function MockMap({ dayItems, activeDay }: { dayItems: PlanItem[]; activeDay: number }) {
  const catMap = Object.fromEntries(CATEGORIES.map((c) => [c.id, c]));

  function toSvgCoords(lat: number, lng: number) {
    const x = ((lng - 126.9) / (127.08 - 126.9)) * 340 + 10;
    const normalizedY = ((37.61 - lat) / (37.61 - 37.49)) * 260 + 10;
    return { x: Math.max(10, Math.min(350, x)), y: Math.max(10, Math.min(270, normalizedY)) };
  }

  const points = dayItems.map((item) => ({
    ...toSvgCoords(item.place.lat, item.place.lng),
    item,
  }));

  return (
    <div className="relative flex-1 overflow-hidden bg-slate-50">
      {dayItems.length === 0 ? (
        <div className="flex h-full flex-col items-center justify-center gap-2 text-center">
          <div className="text-4xl">🗺️</div>
          <p className="text-sm font-medium text-slate-500">Your route will appear here</p>
          <p className="text-xs text-slate-400">Add places to Day {activeDay}</p>
        </div>
      ) : (
        <svg viewBox="0 0 360 280" className="h-full w-full" style={{ background: "#f1f5f9" }}>
          {[0, 1, 2, 3].map((i) => (
            <line key={`h${i}`} x1="0" y1={70 * i + 10} x2="360" y2={70 * i + 10} stroke="#e2e8f0" strokeWidth="1" />
          ))}
          {[0, 1, 2, 3, 4].map((i) => (
            <line key={`v${i}`} x1={85 * i + 10} y1="0" x2={85 * i + 10} y2="280" stroke="#e2e8f0" strokeWidth="1" />
          ))}
          {points.length > 1 && (
            <polyline
              points={points.map((p) => `${p.x},${p.y}`).join(" ")}
              fill="none"
              stroke="#0f766e"
              strokeWidth="2"
              strokeDasharray="5,3"
              opacity="0.7"
            />
          )}
          {points.map((p, idx) => (
            <g key={p.item.id}>
              <circle cx={p.x} cy={p.y} r="14" fill="#0f766e" opacity="0.15" />
              <circle cx={p.x} cy={p.y} r="9" fill="#0f766e" />
              <text x={p.x} y={p.y + 4} textAnchor="middle" fontSize="9" fill="white" fontWeight="bold">
                {idx + 1}
              </text>
              <text
                x={p.x}
                y={p.y + 22}
                textAnchor="middle"
                fontSize="7.5"
                fill="#1e293b"
                fontWeight="500"
                style={{ filter: "drop-shadow(0 0 2px white)" }}
              >
                {p.item.place.name.length > 14 ? p.item.place.name.slice(0, 13) + "…" : p.item.place.name}
              </text>
            </g>
          ))}
        </svg>
      )}
      <div className="absolute bottom-2 right-2 rounded-full bg-white/80 px-2 py-1 text-[10px] text-slate-400 shadow backdrop-blur">
        Map preview (mock) · Add Google Maps API key to enable
      </div>
    </div>
  );
}

// ── Root export ───────────────────────────────────────────────────────────────

export function MapPanel({ planItems, activeDay }: { planItems: PlanItem[]; activeDay: number }) {
  const dayItems = planItems.filter((i) => i.day === activeDay).sort((a, b) => a.order - b.order);
  const catMap = Object.fromEntries(CATEGORIES.map((c) => [c.id, c]));

  return (
    <div className="flex h-full flex-col overflow-hidden rounded-2xl border border-zinc-200 bg-white shadow-sm">
      <div className="border-b border-zinc-100 px-4 py-3">
        <h2 className="text-sm font-semibold text-slate-900">Route — Day {activeDay}</h2>
        <p className="text-xs text-slate-500">
          {dayItems.length === 0
            ? "Add places to see your route"
            : `${dayItems.length} stop${dayItems.length !== 1 ? "s" : ""}`}
        </p>
      </div>

      {/* Map area */}
      <div className="relative flex-1 overflow-hidden">
        {API_KEY ? (
          <APIProvider apiKey={API_KEY}>
            <Map
              mapId="insidekoreanow-plan"
              defaultCenter={SEOUL_CENTER}
              defaultZoom={12}
              gestureHandling="greedy"
              disableDefaultUI={false}
              className="h-full w-full"
            >
              <PlanMap dayItems={dayItems} />
            </Map>
          </APIProvider>
        ) : (
          <MockMap dayItems={dayItems} activeDay={activeDay} />
        )}
      </div>

      {/* Stop list */}
      {dayItems.length > 0 && (
        <div className="border-t border-zinc-100 p-3">
          <div className="space-y-1.5">
            {dayItems.map((item, idx) => {
              const cat = catMap[item.place.category];
              return (
                <div key={item.id} className="flex items-center gap-2 text-xs text-slate-600">
                  <span className="flex size-5 shrink-0 items-center justify-center rounded-full bg-teal-700 text-[10px] font-bold text-white">
                    {idx + 1}
                  </span>
                  <span>{cat?.emoji}</span>
                  <span className="font-medium">{item.place.name}</span>
                  <span className="ml-auto text-slate-400">{item.place.neighborhood}</span>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
