import Anthropic from "@anthropic-ai/sdk";
import type { NextRequest } from "next/server";
import type { TripAnswers, ExtendedAnswers } from "@/app/plan/types";

export const maxDuration = 60;

// Cached system prompt — same for all day calls so caching kicks in after day 1
const SYSTEM_PROMPT = `You are a Korea travel expert and local insider who has lived in Korea for 10 years, deeply familiar with Seoul, Busan, Jeju, and Gyeongju.

OUTPUT FORMAT: Return ONLY valid minified JSON. No markdown, no explanation, no whitespace between tokens. Single line.

When generating Day 1, include the plan header:
{"title":"6 words max","overview":"2 sentences","expertNote":"1 personal sentence","day":{"day":1,"theme":"Day title","places":[{"id":"d1_p1","name":"Place name","category":"food|attraction|shopping|cafe|neighborhood","neighborhood":"District","duration":"X hours","bestTime":"best time 8 words max","expertTip":"specific tip 15 words max","emoji":"🍜"},{"id":"d1_p2","name":"...","category":"...","neighborhood":"...","duration":"...","bestTime":"...","expertTip":"...","emoji":"..."},{"id":"d1_p3","name":"...","category":"...","neighborhood":"...","duration":"...","bestTime":"...","expertTip":"...","emoji":"..."}]}}

For days 2+, just the day object:
{"day":2,"theme":"Day title","places":[{"id":"d2_p1","name":"...","category":"...","neighborhood":"...","duration":"...","bestTime":"...","expertTip":"...","emoji":"..."},{"id":"d2_p2","name":"...","category":"...","neighborhood":"...","duration":"...","bestTime":"...","expertTip":"...","emoji":"..."},{"id":"d2_p3","name":"...","category":"...","neighborhood":"...","duration":"...","bestTime":"...","expertTip":"...","emoji":"..."}]}

RULES:
- Exactly 3 places per day
- Sequence places geographically to minimise transit
- Expert tips: specific dish names, stall numbers, exact times — never generic
- Each place id follows pattern d{day}_p{position}

SEOUL AREAS:
- Jongno: palaces, Bukchon, Insadong, Ikseon-dong, Cheonggyecheon
- Hongdae: indie cafes, street performers, Mangwon Market nearby
- Gangnam: COEX, Cheongdam, Apgujeong, luxury shopping
- Sinsa: Garosu-gil boutiques, European cafes
- Itaewon: international food, Haebangchon, rooftop bars, near Namsan
- Myeongdong: K-beauty, street food, Namdaemun nearby
- Seongsu-dong: converted factory cafes, artisan workshops
- Euljiro: retro bars, printing alleys, pojangmacha
- Yongsan: War Memorial, electronics, Dragon Hill Spa
- Jamsil: Lotte World, Sky Walk, Seokchon Lake
- Yeouido: Han River, Noryangjin Fish Market, cherry blossoms
- Namsan: N Seoul Tower, cable car, Namsangol Hanok Village
- Bukchon: hanok alleys, morning photography, Onion Anguk
- Mangwon: Fritz Coffee, local market, Han River 10min
- Dongdaemun: DDP, night fashion market
- Insadong: pottery, antiques, Ssamziegil, tea houses

BUSAN AREAS:
- Haeundae: famous beach, Dongbaek Island, upscale hotels, APEC park
- Gamcheon: pastel hillside art village, winding alleys, murals, Little Prince statue
- Jagalchi: Korea's largest seafood market, raw fish, haenyeo stalls
- Gwangalli: Gwangan Bridge night views, beach bars, local vibe
- Seomyeon: Busan's commercial heart, underground shopping, food alleys
- Nampo-dong / BIFF Square: Gukje Market, street food, cinema history
- Beomeosa Temple: ancient mountain temple, Geumjeong Fortress hiking
- Haedong Yonggungsa: dramatic seaside temple on coastal cliffs
- Centum City: Shinsegae (world's largest dept store), culture complex
- Taejongdae: dramatic cliff park, lighthouse, sea views

JEJU AREAS:
- Jeju City / Dongmun Market: traditional market, black pork, hallabong
- Hallasan: Korea's highest peak, volcanic crater hike
- Seongsan Ilchulbong: UNESCO sunrise peak, village below
- Hyeopjae / Hamdeok Beach: turquoise water, lava rock coastline
- Olle Trail: coastal walking routes, village paths
- Manjanggul Cave: UNESCO lava tube, underground walk
- Jungmun: resort area, Cheonjeyeon Falls, Teddy Bear Museum`;

const SEOUL_AREAS = [
  "Jongno / Bukchon / historic palace district",
  "Hongdae / Mapo / youthful west Seoul",
  "Gangnam / Sinsa / upscale south of river",
  "Itaewon / Namsan / international hub",
  "Seongsu-dong / Euljiro / creative east Seoul",
  "Myeongdong / Namdaemun / bustling city centre",
  "Yeouido / Han River parks / Noryangjin fish market",
  "Jamsil / Olympic Park / Seokchon Lake",
  "Dongdaemun / Wangsimni / night fashion district",
  "Mangwon / Hapjeong / local café culture west Seoul",
];

const BUSAN_AREAS = [
  "Gamcheon Culture Village / pastel hillside art village",
  "Jagalchi Fish Market / Nampo-dong / Korea's largest seafood market",
  "Haeundae Beach / Dongbaek Island / Busan's most famous coast",
  "Gwangalli Beach / Gwangan Bridge night views",
  "Seomyeon / Bujeon-dong / Busan's commercial heart",
  "Beomeosa Temple / Geumjeong Mountain / ancient mountain temple",
  "BIFF Square / Gukje Market / street food and cinema history",
  "Haedong Yonggungsa / dramatic seaside temple on coastal cliffs",
  "Centum City / Shinsegae / world's largest department store",
  "Taejongdae / cliff park / lighthouse and sea views",
];

const JEJU_AREAS = [
  "Jeju City / Dongmun Market / traditional market and black pork",
  "Seongsan Ilchulbong / UNESCO sunrise peak",
  "Hallasan / Korea's highest peak volcanic crater hike",
  "Hyeopjae Beach / turquoise water and lava rock coast",
  "Manjanggul Cave / UNESCO lava tube underground walk",
  "Jungmun / Cheonjeyeon Falls / resort area",
  "Olle Trail coastal walking routes and village paths",
];

function detectCities(mustVisit = "", accommodation = ""): string[] {
  const text = (mustVisit + " " + accommodation).toLowerCase();
  const cities: string[] = [];
  if (/busan|부산/.test(text)) cities.push("busan");
  if (/jeju|제주/.test(text)) cities.push("jeju");
  if (!cities.length || /seoul|서울/.test(text)) cities.push("seoul");
  return cities;
}

function buildDayAreas(cities: string[], totalDays: number): string[] {
  if (cities.length === 1) {
    const map: Record<string, string[]> = { seoul: SEOUL_AREAS, busan: BUSAN_AREAS, jeju: JEJU_AREAS };
    return map[cities[0]] ?? SEOUL_AREAS;
  }

  // Multi-city: split days proportionally
  const areas: string[] = [];
  const perCity = Math.ceil(totalDays / cities.length);
  for (const city of cities) {
    const map: Record<string, string[]> = { seoul: SEOUL_AREAS, busan: BUSAN_AREAS, jeju: JEJU_AREAS };
    const pool = map[city] ?? SEOUL_AREAS;
    for (let i = 0; i < perCity; i++) areas.push(pool[i % pool.length]);
  }
  return areas;
}

const PURPOSE_LABELS: Record<string, string> = {
  kpop: "K-pop fan (idol agencies, fan cafes, merch)",
  food: "food lover (street food, markets, restaurants)",
  shopping: "shopper (fashion, cosmetics, electronics)",
  nature: "nature seeker (hiking, temples, parks)",
  culture: "culture explorer (palaces, museums, history)",
  nightlife: "nightlife lover (bars, clubs, night markets)",
};

const STYLE_LABELS: Record<string, string> = {
  packed: "packed schedule, max activities",
  relaxed: "relaxed, 3 highlights per day",
  mix: "mix of busy and slow",
};

const COMPANION_LABELS: Record<string, string> = {
  solo: "solo traveller",
  couple: "couple (romantic spots)",
  friends: "friends group",
  family: "family with kids",
};

const BUDGET_LABELS: Record<string, string> = {
  budget: "budget ($60-80/day)",
  mid: "mid-range ($80-200/day)",
  luxury: "luxury ($200+/day)",
};

export async function POST(request: NextRequest) {
  try {
    const body = (await request.json()) as {
      answers: TripAnswers;
      extended?: Partial<ExtendedAnswers>;
      day: number;
      totalDays: number;
      isFirst: boolean;
    };
    const { answers, extended, day, totalDays, isFirst } = body;

    const cities = detectCities(answers.mustVisit, extended?.accommodation);
    const dayAreas = buildDayAreas(cities, totalDays);
    const area = dayAreas[(day - 1) % dayAreas.length];
    const cityContext = cities.includes("busan") && !cities.includes("seoul")
      ? "Busan, South Korea"
      : cities.includes("jeju")
      ? "Jeju Island, South Korea"
      : cities.length > 1
      ? cities.map(c => c.charAt(0).toUpperCase() + c.slice(1)).join(" + ") + ", South Korea"
      : "Seoul, South Korea";
    const extras = extended
      ? [
          extended.dietary?.length ? `dietary: ${extended.dietary.join(", ")}` : null,
          extended.accommodation ? `staying in: ${extended.accommodation}` : null,
          extended.avoid ? `avoid: ${extended.avoid}` : null,
          extended.kpopSites ? `kpop interests: ${extended.kpopSites}` : null,
        ]
          .filter(Boolean)
          .join(", ")
      : "";

    const userMessage = isFirst
      ? `Day 1 of ${totalDays}. Destination: ${cityContext}. Area focus: ${area}.
Traveller: ${PURPOSE_LABELS[answers.purpose] ?? answers.purpose}, ${STYLE_LABELS[answers.style] ?? answers.style}, ${COMPANION_LABELS[answers.companion] ?? answers.companion}, ${BUDGET_LABELS[answers.budget] ?? answers.budget}.${answers.mustVisit ? ` Must-visit: ${answers.mustVisit}.` : ""}${extras ? ` ${extras}.` : ""}
Include plan header (title, overview, expertNote) + Day 1 with 3 places.`
      : `Day ${day} of ${totalDays}. Destination: ${cityContext}. Area focus: ${area}.
Traveller: ${PURPOSE_LABELS[answers.purpose] ?? answers.purpose}, ${STYLE_LABELS[answers.style] ?? answers.style}, ${COMPANION_LABELS[answers.companion] ?? answers.companion}, ${BUDGET_LABELS[answers.budget] ?? answers.budget}.${answers.mustVisit ? ` Must-visit: ${answers.mustVisit}.` : ""}
Generate Day ${day} with 3 places. Different area from previous days.`;

    const client = new Anthropic();

    const response = await client.messages.create({
      model: "claude-haiku-4-5-20251001",
      max_tokens: isFirst ? 1000 : 800,
      system: [{ type: "text", text: SYSTEM_PROMPT, cache_control: { type: "ephemeral" } }],
      messages: [
        { role: "user", content: userMessage },
        { role: "assistant", content: "{" },
      ],
    });

    const text = response.content[0].type === "text" ? response.content[0].text : "";
    const full = "{" + text;

    // Validate JSON is parseable; if not, return 422 with the raw output so we can diagnose
    try {
      JSON.parse(full);
    } catch {
      return new Response(
        JSON.stringify({ error: "model_json_invalid", raw: full.slice(0, 600), stop_reason: response.stop_reason }),
        { status: 422, headers: { "Content-Type": "application/json" } }
      );
    }

    return new Response(full, {
      headers: { "Content-Type": "application/json" },
    });
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);
    return new Response(
      JSON.stringify({ error: "server_error", message }),
      { status: 500, headers: { "Content-Type": "application/json" } }
    );
  }
}
