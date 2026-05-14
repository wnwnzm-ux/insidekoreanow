import Anthropic from "@anthropic-ai/sdk";
import type { NextRequest } from "next/server";
import type { TripAnswers, ExtendedAnswers } from "@/app/plan/types";

// ── Static system prompt (cached) ────────────────────────────────────────────
// This content never changes between requests so Anthropic caches it after the
// first call, reducing input-token cost by ~90% on subsequent requests.
const SYSTEM_PROMPT = `You are a Korea travel expert and local insider who has lived in Seoul for 10 years. You have intimate knowledge of every neighbourhood, hidden gems, local pricing, and the kind of tips that only residents know.

Your task is to create highly personalised Korea itineraries in JSON format.

OUTPUT FORMAT:
Return ONLY a valid JSON object. No markdown fences, no explanation, no extra text before or after. Start your response with { and end with }.

JSON SCHEMA (follow exactly):
{
  "title": "Catchy trip title, 6 words or fewer",
  "overview": "2 sentences: what this itinerary covers and why it fits this traveller",
  "expertNote": "1 warm, personal sentence from you as their Korea insider",
  "days": [
    {
      "day": 1,
      "theme": "Evocative day title (e.g. 'Old Seoul & Hidden Alleys')",
      "places": [
        {
          "id": "d1_p1",
          "name": "Exact English name of the place",
          "category": "food OR attraction OR shopping OR cafe OR neighborhood",
          "neighborhood": "Seoul district name — see guide below",
          "duration": "X hours",
          "bestTime": "Specific best time, 10 words max",
          "expertTip": "Hyper-specific insider tip: exact dish name, stall number, hidden entrance, or technique — 25 words max",
          "emoji": "one relevant emoji"
        }
      ]
    }
  ]
}

ITINERARY RULES:
1. Sequence places geographically within each day to minimise transit time
2. Weave in natural meal stops (breakfast, lunch, dinner) across each day
3. Expert tips must name specific items, times, or techniques — never generic advice
4. Each day should have a coherent geographic focus to avoid excessive travel
5. Place IDs follow pattern d{day}_p{position} (e.g. d1_p1, d1_p2, d2_p1)
6. Maximum 3 places per day — quality over quantity

SEOUL NEIGHBOURHOOD GUIDE (use these exact names in the neighborhood field):
- Jongno: Historic core of Seoul — Gyeongbokgung Palace, Bukchon Hanok Village, Insadong craft street, Ikseon-dong hanok bars, Changdeokgung, Tosokchon, Tongin Market, Ihwa Mural Village, Cheonggyecheon Stream starts here
- Hongdae: Youthful university district — indie cafes, street performers, live music venues, underground fashion, Anthracite Coffee, Mangwon Market nearby, Palsaik BBQ
- Gangnam: Upscale south of the river — COEX Starfield Library, Cheongdam luxury flagships, Apgujeong boutiques, Lotte World Tower (Jamsil border)
- Sinsa: Garosu-gil tree-lined boulevard — Korean designer boutiques, European-style cafes, calmer Gangnam vibe, autumn ginkgo trees
- Itaewon: International hub — diverse restaurants (Middle Eastern, Mexican, Italian), Haebangchon expat village, antique shops, rooftop bars, near Namsan
- Myeongdong: Busy shopping street — K-beauty cosmetics, street food stalls (tteokbokki, hotteok), Myeongdong Kyoja noodles, Namdaemun Market close by
- Seongsu-dong: Brooklyn of Seoul — converted factory cafes, luxury brand pop-ups, artisan workshops, handmade sneakers, Ttukseom riverside
- Euljiro: Retro industrial revival — vintage bars, printing district alleys, neon-lit pojangmacha, Cheonggyecheon Stream walk
- Yongsan: Central transport hub — electronics market (Yongsan), War Memorial of Korea (free), Dragon Hill Spa, convenient location
- Jamsil: East Seoul entertainment — Lotte World Theme Park, Lotte World Tower Sky Walk, Seokchon Lake, Olympic Park
- Yeouido: River island — Han River cycling and picnics, Noryangjin Fish Market, Seonyudo Park, IFC Mall, cherry blossoms in spring
- Namsan: Central hill — N Seoul Tower, cable car or hiking trail, love locks, Namsangol Hanok Village at base
- Samcheong-dong: Gallery district — contemporary art galleries, emerging Korean artists, quiet cafes, connects to Bukchon
- Bukchon: Hanok village area — preserved traditional houses, narrow alleys, morning light photography, Onion Anguk bakery
- Mangwon: Local residential Mapo — Mangwon Market weekend stalls, Fritz Coffee cult following, authentic neighbourhood life, Han River 10 min walk
- Dongdaemun: Night fashion district — DDP Zaha Hadid building (lit at night), wholesale fashion market opens 10pm, fabric shopping
- Insadong: Traditional culture street — celadon pottery, antique shops, Ssamziegil courtyard, traditional tea houses, Korean-script Starbucks
- Namdaemun: Historic market — largest traditional market, ginseng, street food, wholesale goods, near Myeongdong`;

// ── Dynamic user message builder ──────────────────────────────────────────────

const PURPOSE_LABELS: Record<string, string> = {
  kpop: "K-pop Pilgrimage (idol agencies, concert venues, fan cafes, merch shops)",
  food: "Food Adventure (street food markets, traditional cuisine, trendy restaurants)",
  shopping: "Shopping (fashion districts, cosmetics, electronics, unique souvenirs)",
  nature: "Nature & Healing (hiking, temples, scenic parks, wellness retreats)",
  culture: "Culture Experience (palaces, museums, traditional arts, historical sites)",
  nightlife: "Nightlife (rooftop bars, club districts, night markets, live jazz)",
};

const STYLE_LABELS: Record<string, string> = {
  packed: "Packed & Busy — max activities per day, efficient routing, early starts",
  relaxed: "Relaxed & Slow — 2–3 highlights per day, linger over meals, explore freely",
  mix: "Mix of Both — 3–4 main activities, some free time, no rushing",
};

const COMPANION_LABELS: Record<string, string> = {
  solo: "Solo traveler (social spots, safe neighborhoods, easy navigation)",
  couple: "Couple (romantic ambiance, intimate restaurants, scenic viewpoints)",
  friends: "Friends group (sharable food, fun activities, group-friendly venues)",
  family: "Family with kids (all ages, kid-friendly pacing, educational and fun)",
};

const BUDGET_LABELS: Record<string, string> = {
  budget: "Budget-conscious ($60–80/day — free attractions, street food, guesthouses)",
  mid: "Mid-range ($80–200/day — mix of paid and free, mid-range restaurants)",
  luxury: "Luxury ($200+/day — premium experiences, fine dining, 5-star service)",
};

function buildUserMessage(answers: TripAnswers, extended?: Partial<ExtendedAnswers>): string {
  const days = Math.min(answers.days, 7);
  const extras = extended
    ? [
        extended.dietary?.length ? `Dietary restrictions: ${extended.dietary.join(", ")}` : null,
        extended.transport ? `Transport preference: ${extended.transport}` : null,
        extended.accommodation ? `Accommodation area: ${extended.accommodation}` : null,
        extended.avoid ? `Things to avoid: ${extended.avoid}` : null,
        extended.kpopSites ? `K-pop / drama interests: ${extended.kpopSites}` : null,
      ]
        .filter(Boolean)
        .join("\n- ")
    : null;

  const budgetRule =
    answers.budget === "budget"
      ? "Prioritise free attractions; food under ₩15,000 per meal; no paid tours"
      : answers.budget === "luxury"
      ? "Premium dining ₩80,000+ per meal; private tours; exclusive rooftop venues"
      : "Mix paid attractions ₩10,000–30,000 with free spots; dining ₩15,000–50,000";

  const companionRule =
    answers.companion === "family"
      ? "Every place must be child-friendly with age-appropriate activities"
      : answers.companion === "couple"
      ? "Prioritise romantic settings, intimate restaurants, scenic couples' spots"
      : answers.companion === "solo"
      ? "Include social-friendly places, solo-safe areas, traveller meetup spots"
      : "Group-friendly venues, sharable food experiences, activities 3+ people enjoy";

  return `Create a ${days}-day Korea itinerary for this traveller.

TRAVELLER PROFILE:
- Main goal: ${PURPOSE_LABELS[answers.purpose] ?? answers.purpose}
- Travel style: ${STYLE_LABELS[answers.style] ?? answers.style}
- Travelling with: ${COMPANION_LABELS[answers.companion] ?? answers.companion}
- Duration: ${answers.days} days${answers.days > 7 ? " (plan the first 7 days)" : ""}
- Daily budget: ${BUDGET_LABELS[answers.budget] ?? answers.budget}
- Must-visit: ${answers.mustVisit || "none"}${extras ? `\n- ${extras}` : ""}

PERSONALISATION RULES:
- Budget: ${budgetRule}
- Companion: ${companionRule}${answers.mustVisit ? "\n- Include must-visit requests in the most logical day" : ""}

OUTPUT: Exactly ${days} day objects, exactly 3 place objects per day.`;
}

export async function POST(request: NextRequest) {
  const body = (await request.json()) as {
    answers: TripAnswers;
    extended?: Partial<ExtendedAnswers>;
  };
  const { answers, extended } = body;

  const client = new Anthropic();

  const anthropicStream = await client.messages.create({
    model: "claude-haiku-4-5-20251001",
    max_tokens: 5000,
    stream: true,
    system: [
      {
        type: "text",
        text: SYSTEM_PROMPT,
        cache_control: { type: "ephemeral" },
      },
    ],
    messages: [{ role: "user", content: buildUserMessage(answers, extended) }],
  });

  const readable = new ReadableStream({
    async start(controller) {
      try {
        for await (const event of anthropicStream) {
          if (
            event.type === "content_block_delta" &&
            event.delta.type === "text_delta"
          ) {
            controller.enqueue(new TextEncoder().encode(event.delta.text));
          }
        }
        controller.close();
      } catch (err) {
        controller.error(err);
      }
    },
  });

  return new Response(readable, {
    headers: { "Content-Type": "text/plain; charset=utf-8" },
  });
}
