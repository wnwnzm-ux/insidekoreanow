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

  return `You are a Korea travel expert who has lived in Seoul for 10 years with deep insider knowledge of every neighbourhood. Create a highly personalised ${days}-day Korea itinerary for this traveller.

TRAVELLER PROFILE:
- Main goal: ${PURPOSE_LABELS[answers.purpose] ?? answers.purpose}
- Travel style: ${STYLE_LABELS[answers.style] ?? answers.style}
- Travelling with: ${COMPANION_LABELS[answers.companion] ?? answers.companion}
- Duration: ${answers.days} days${answers.days > 7 ? " (plan the first 7 days in detail)" : ""}
- Daily budget: ${BUDGET_LABELS[answers.budget] ?? answers.budget}
- Must-visit requests: ${answers.mustVisit || "none specified"}${extras ? `\n- ${extras}` : ""}

Return ONLY a valid JSON object — absolutely no markdown fences, no explanation before or after, no trailing text. Start your response with { and end with }.

Use this exact JSON structure:

{
  "title": "Catchy trip title in 6 words or fewer",
  "overview": "2–3 sentences describing this curated itinerary and why it fits them perfectly",
  "expertNote": "A warm 1–2 sentence personal message from you as their Korea insider, explaining your curation philosophy for their specific trip",
  "days": [
    {
      "day": 1,
      "theme": "Evocative day title (e.g. 'Old Seoul & Hidden Alleys')",
      "places": [
        {
          "id": "d1_p1",
          "name": "Exact English name of place",
          "category": "food OR attraction OR shopping OR cafe OR neighborhood",
          "neighborhood": "Seoul district name (e.g. Jongno, Hongdae, Gangnam-gu)",
          "duration": "X hours",
          "bestTime": "Specific best time (e.g. 'Weekday 9–11am before crowds', 'Golden hour 5–6pm')",
          "expertTip": "One hyper-specific, actionable insider tip — exact stall number, what to order by name, hidden entrance, which staff member to ask",
          "insiderNote": "What 95% of tourists completely miss — genuine local knowledge that changes the experience",
          "whyPicked": "One sentence: why this exact place for this specific traveller profile",
          "emoji": "one relevant emoji"
        }
      ]
    }
  ]
}

Rules (follow precisely):
1. Include exactly ${days} day objects
2. Include 4–5 place objects per day
3. Sequence places geographically within each day to minimise travel time
4. Naturally weave in meal stops (breakfast, lunch, dinner) across each day
5. Expert tips must name specific items, stalls, times, or techniques — no generic advice
6. Insider notes must reveal something the average tourist truly doesn't know
7. Budget rule: ${answers.budget === "budget" ? "prioritise free attractions; food under ₩15,000 per meal; no paid tours" : answers.budget === "luxury" ? "premium dining (₩80,000+ per meal), private tours, exclusive venues, rooftop experiences" : "mix paid attractions (₩10,000–30,000) with free spots; mid-range dining ₩15,000–50,000"}
8. Companion rule: ${answers.companion === "family" ? "every place must be child-friendly with age-appropriate activities" : answers.companion === "couple" ? "prioritise romantic settings, intimate restaurants, scenic couples' spots" : answers.companion === "solo" ? "include social-friendly places, solo-safe areas, traveller meetup spots" : "group-friendly venues, sharable food experiences, activities 3+ people enjoy"}
${answers.mustVisit ? "9. Incorporate the must-visit requests into the most logically appropriate day" : ""}`;
}

export async function POST(request: NextRequest) {
  const body = (await request.json()) as {
    answers: TripAnswers;
    extended?: Partial<ExtendedAnswers>;
  };
  const { answers, extended } = body;

  const client = new Anthropic();

  const messageStream = client.messages.stream({
    model: "claude-sonnet-4-6",
    max_tokens: 8000,
    messages: [{ role: "user", content: buildPrompt(answers, extended) }],
  });

  const readable = new ReadableStream({
    start(controller) {
      messageStream.on("text", (text) => {
        controller.enqueue(new TextEncoder().encode(text));
      });
      messageStream.on("error", (err) => {
        controller.error(err);
      });
      messageStream.finalMessage().then(() => {
        controller.close();
      });
    },
    cancel() {
      messageStream.abort();
    },
  });

  return new Response(readable, {
    headers: { "Content-Type": "text/plain; charset=utf-8" },
  });
}
