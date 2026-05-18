import type { NextRequest } from "next/server";
import { getSupabase } from "@/lib/supabase";

export const runtime = "nodejs";

// Planner day-index (0-based, mod 10) → Seoul districts (fallback when no neighborhoods passed)
const DISTRICT_BY_DAY: string[][] = [
  ["Jongrogu", "Jongrugu"],       // 0 Jongno / Bukchon / historic palace
  ["Mapogu"],                      // 1 Hongdae / Mapo / youthful west
  ["Gangnamgu", "Seochogu"],      // 2 Gangnam / Sinsa / upscale south
  ["Yongsangu"],                   // 3 Itaewon / Namsan / international hub
  ["Seongdonggu", "Junggu"],      // 4 Seongsu-dong / Euljiro / creative east
  ["Junggu"],                      // 5 Myeongdong / Namdaemun / city centre
  ["Yeongdeungpogu"],             // 6 Yeouido / Han River / Noryangjin
  ["Songpagu"],                    // 7 Jamsil / Olympic Park
  ["Dongdaemungu"],               // 8 Dongdaemun / night fashion
  ["Mapogu"],                      // 9 Mangwon / Hapjeong / local café
];

// Common AI-generated neighborhood names → DB district values
const NEIGHBORHOOD_TO_DISTRICT: Record<string, string[]> = {
  jongno: ["Jongrogu", "Jongrugu"],
  bukchon: ["Jongrogu", "Jongrugu"],
  insadong: ["Jongrogu"],
  ikseon: ["Jongrogu"],
  changdeok: ["Jongrogu"],
  gyeongbokgung: ["Jongrogu"],
  hongdae: ["Mapogu"],
  mapo: ["Mapogu"],
  mangwon: ["Mapogu"],
  hapjeong: ["Mapogu"],
  sangsu: ["Mapogu"],
  gangnam: ["Gangnamgu"],
  apgujeong: ["Gangnamgu"],
  cheongdam: ["Gangnamgu"],
  sinsa: ["Seochogu"],
  garosu: ["Seochogu"],
  itaewon: ["Yongsangu"],
  namsan: ["Yongsangu"],
  hannam: ["Yongsangu"],
  yongsan: ["Yongsangu"],
  seongsu: ["Seongdonggu"],
  euljiro: ["Junggu"],
  myeongdong: ["Junggu"],
  namdaemun: ["Junggu"],
  dongdaemun: ["Dongdaemungu"],
  yeouido: ["Yeongdeungpogu"],
  noryangjin: ["Yeongdeungpogu"],
  jamsil: ["Songpagu"],
  olympic: ["Songpagu"],
};

function neighborhoodsToDistricts(neighborhoods: string[]): string[] {
  const districts = neighborhoods.flatMap(
    (n) => NEIGHBORHOOD_TO_DISTRICT[n.toLowerCase().trim()] ?? []
  );
  return districts.length > 0 ? [...new Set(districts)] : [];
}

// travel_theme values ranked by curation quality (best first)
const QUALITY_RANK: Record<string, number> = {
  "Michelin-listed": 0,
  "TV Feature": 1,
  "Media Pick": 2,
  "Press Pick": 3,
  "Hidden Gem": 4,
  "Foodie Favorite": 5,
  "Curated List": 6,
  "Creator Pick": 7,
  "Local Favorite": 8,
};

function themeScore(themes: string[]): number {
  let best = 999;
  for (const t of themes) {
    const rank = QUALITY_RANK[t];
    if (rank !== undefined && rank < best) best = rank;
  }
  return best;
}

export interface RecommendedRestaurant {
  id: number;
  name: string;
  korean_name: string | null;
  district: string | null;
  neighborhood: string | null;
  food_type: string[];
  travel_theme: string[];
  description: string | null;
  why_visit: string | null;
  recommended_menu: { name: string; korean_name: string }[];
  maps_url: string | null;
  foreigner_friendly: boolean | null;
  reservation_needed: boolean | null;
}

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);

  const city = searchParams.get("city") ?? "Seoul";
  const day = Math.max(1, parseInt(searchParams.get("day") ?? "1", 10));
  const limit = Math.min(10, parseInt(searchParams.get("limit") ?? "3", 10));
  const budget = searchParams.get("budget") ?? "mid"; // budget | mid | luxury
  const purpose = searchParams.get("purpose") ?? "";
  const neighborhoodsParam = searchParams.get("neighborhoods") ?? "";

  const supabase = getSupabase();

  const dayIndex = (day - 1) % DISTRICT_BY_DAY.length;
  const mappedDistricts = neighborhoodsParam
    ? neighborhoodsToDistricts(neighborhoodsParam.split(","))
    : [];
  const districts = mappedDistricts.length > 0 ? mappedDistricts : DISTRICT_BY_DAY[dayIndex];

  const SELECT_COLS =
    "id, name, korean_name, district, neighborhood, food_type, travel_theme, description, why_visit, recommended_menu, maps_url, foreigner_friendly, reservation_needed";

  // Primary query: city + district match, over-fetch for re-ranking
  let query = supabase
    .from("restaurants")
    .select(SELECT_COLS)
    .eq("city", city)
    .in("district", districts);

  // For luxury budget, prefer Michelin-listed restaurants
  if (budget === "luxury") {
    query = query.overlaps("travel_theme", ["Michelin-listed", "Fine Casual"]);
  }

  // For food-focused trips, also accept restaurants with any quality theme
  // (no extra filter needed — quality sorting handles this)

  const { data, error } = await query.limit(limit * 4);

  if (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }

  let pool = data ?? [];

  // Fallback: if the district has too few results, broaden to full city
  if (pool.length < limit) {
    const { data: cityWide } = await supabase
      .from("restaurants")
      .select(SELECT_COLS)
      .eq("city", city)
      .not("district", "in", `(${districts.join(",")})`)
      .limit(limit * 2);

    pool = [...pool, ...(cityWide ?? [])];
  }

  // Re-rank by quality theme, then shuffle within same tier for variety
  const ranked = [...pool].sort((a, b) => {
    const diff = themeScore(a.travel_theme ?? []) - themeScore(b.travel_theme ?? []);
    if (diff !== 0) return diff;
    return Math.random() - 0.5; // randomise within same quality tier
  });

  const restaurants: RecommendedRestaurant[] = ranked.slice(0, limit);

  // Claude context format: compact text for injecting into AI prompts
  if (searchParams.get("format") === "context") {
    const lines = restaurants.map((r) => {
      const dish = r.recommended_menu?.[0];
      const dishStr = dish ? ` | Try: ${dish.name}` : "";
      const theme = r.travel_theme?.[0] ?? "";
      return `- ${r.name} (${r.korean_name ?? ""}) — ${r.district ?? city}${dishStr}${theme ? ` [${theme}]` : ""}`;
    });
    return new Response(lines.join("\n"), {
      headers: { "Content-Type": "text/plain" },
    });
  }

  return Response.json({ restaurants, district: districts, day });
}
