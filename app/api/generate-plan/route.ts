import Anthropic from "@anthropic-ai/sdk";
import type { NextRequest } from "next/server";
import type { TripAnswers, ExtendedAnswers } from "@/app/plan/types";


const PURPOSE_LABELS: Record<string, string> = {
  kpop: "K-pop Pilgrimage (idol agencies, concert venues, fan cafes, merch shops)",
  food: "Food Adventure (street food markets, traditional cuisine, trendy restaurants)",
  shopping: "Shopping (fashion districts, cosmetics, electronics, unique souvenirs)",
  nature: "Nature & Healing (hiking, temples, scenic parks, wellness retreats)",
  culture: "Culture Experience (palaces, museums, traditional arts, historical sites)",
  nightlife: "Nightlife (rooftop bars, club districts, night markets, live jazz)",
};

const STYLE_LABELS: Record<string, string> = {
  packed: "Packed & Busy — 5–6 activities per day, efficient routing, early starts",
  relaxed: "Relaxed & Slow — 2–3 highlights per day, linger over meals, explore freely",
  mix: "Mix of Both — 3–4 main activities, some free time, no rushing",
};

const COMPANION_LABELS: Record<string, string> = {
  solo: "Solo traveler (open to social spots, safe neighborhoods, easy navigation)",
  couple: "Couple (romantic ambiance, intimate restaurants, scenic viewpoints)",
  friends: "Friends group (shareable food spots, fun activities, group-friendly venues)",
  family: "Family with kids (all ages, kid-friendly pacing, educational and fun mix)",
};

const BUDGET_LABELS: Record<string, string> = {
  budget: "Budget-conscious ($60–80/day total — free attractions, street food, guesthouses)",
  mid: "Mid-range ($80–200/day — mix of paid and free, mid-range restaurants)",
  luxury: "Luxury ($200+/day — premium experiences, fine dining, 5-star service)",
};

function buildPrompt(answers: TripAnswers, extended?: Partial<ExtendedAnswers>): string {
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

  return `You are a Korea travel expert. Create a personalised ${days}-day Korea itinerary.

TRAVELLER PROFILE:
- Main goal: ${PURPOSE_LABELS[answers.purpose] ?? answers.purpose}
- Travel style: ${STYLE_LABELS[answers.style] ?? answers.style}
- Travelling with: ${COMPANION_LABELS[answers.companion] ?? answers.companion}
- Duration: ${answers.days} days${answers.days > 7 ? " (plan the first 7 days)" : ""}
- Daily budget: ${BUDGET_LABELS[answers.budget] ?? answers.budget}
- Must-visit: ${answers.mustVisit || "none"}${extras ? `\n- ${extras}` : ""}

Return ONLY valid JSON — no markdown, no extra text. Start with { end with }.

{
  "title": "Trip title, 6 words max",
  "overview": "2 sentences: what this itinerary covers and why it fits this traveller",
  "expertNote": "1 sentence personal message as their Korea insider",
  "days": [
    {
      "day": 1,
      "theme": "Day title (e.g. 'Old Seoul & Hidden Alleys')",
      "places": [
        {
          "id": "d1_p1",
          "name": "Place name in English",
          "category": "food OR attraction OR shopping OR cafe OR neighborhood",
          "neighborhood": "Seoul district (e.g. Jongno, Hongdae, Gangnam-gu)",
          "duration": "X hours",
          "bestTime": "Best time to visit, 10 words max",
          "expertTip": "Specific insider tip: exact item, stall, or technique, 25 words max",
          "emoji": "one emoji"
        }
      ]
    }
  ]
}

Rules:
1. Exactly ${days} day objects
2. Exactly 4 place objects per day
3. Sequence places geographically to minimise travel time
4. Include meal stops naturally across each day
5. Budget: ${answers.budget === "budget" ? "free attractions; food under ₩15,000 per meal" : answers.budget === "luxury" ? "premium dining ₩80,000+, private tours, exclusive venues" : "mix paid (₩10,000–30,000) with free; dining ₩15,000–50,000"}
6. Companion: ${answers.companion === "family" ? "child-friendly, all ages" : answers.companion === "couple" ? "romantic settings, intimate spots" : answers.companion === "solo" ? "social-friendly, solo-safe areas" : "group-friendly, sharable experiences"}
${answers.mustVisit ? "7. Include must-visit requests in the most logical day" : ""}`;
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
    max_tokens: 3000,
    stream: true,
    messages: [{ role: "user", content: buildPrompt(answers, extended) }],
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
