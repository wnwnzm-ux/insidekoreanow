export type BlogCategorySlug = "k-culture" | "k-food" | "living" | "travel" | "uncategorized";

export type BlogFilterId = "all" | BlogCategorySlug;

export interface BlogPost {
  id: string;
  title: string;
  excerpt: string;
  date: string;
  dateIso: string;
  readTime: string;
  gradient: string;
  category: BlogCategorySlug;
}

/** Filters shown in the blog UI. `uncategorized` is intentionally omitted. */
export const BLOG_CATEGORY_FILTERS: {
  id: Exclude<BlogFilterId, "uncategorized">;
  label: string;
  sublabel: string;
}[] = [
  { id: "all", label: "All", sublabel: "Every published guide" },
  {
    id: "k-culture",
    label: "K-Culture",
    sublabel: "K-pop, K-drama, Festivals, Shows",
  },
  {
    id: "k-food",
    label: "K-Food",
    sublabel: "Food, Restaurants, Street food, Cafes",
  },
  {
    id: "living",
    label: "Living in Korea",
    sublabel: "Life tips, Visa, Costs, Expat life",
  },
  {
    id: "travel",
    label: "Travel",
    sublabel: "Destinations, Sightseeing, Transport, Hotels",
  },
];

const categoryShortLabel: Record<Exclude<BlogCategorySlug, "uncategorized">, string> = {
  "k-culture": "K-Culture",
  "k-food": "K-Food",
  living: "Living in Korea",
  travel: "Travel",
};

export function getCategoryLabel(category: BlogCategorySlug): string {
  if (category === "uncategorized") return "Uncategorized";
  return categoryShortLabel[category];
}

export const BLOG_POSTS: BlogPost[] = [
  {
    id: "seoul-first-week",
    title: "First week in Seoul: a calm, realistic itinerary",
    excerpt: "Neighborhood pacing, transit passes, and where to eat when you are jet-lagged.",
    date: "May 8, 2026",
    dateIso: "2026-05-08",
    readTime: "8 min read",
    gradient: "from-teal-500/90 to-emerald-700/90",
    category: "travel",
  },
  {
    id: "cafe-culture",
    title: "Korean café culture without the overwhelm",
    excerpt: "Ordering, seating norms, and the tiny phrases that make visits smoother.",
    date: "May 2, 2026",
    dateIso: "2026-05-02",
    readTime: "5 min read",
    gradient: "from-rose-500/85 to-orange-600/85",
    category: "k-food",
  },
  {
    id: "modern-korea-day",
    title: "Beyond palaces: modern Korea in a day",
    excerpt: "Contemporary art districts, river walks, and evening city views worth the detour.",
    date: "Apr 24, 2026",
    dateIso: "2026-04-24",
    readTime: "10 min read",
    gradient: "from-indigo-500/90 to-violet-700/90",
    category: "travel",
  },
  {
    id: "kpop-neighborhoods",
    title: "K-pop neighborhoods worth a slow walk",
    excerpt: "Company buildings, pop-up spaces, and how to enjoy fandom spots respectfully.",
    date: "Apr 18, 2026",
    dateIso: "2026-04-18",
    readTime: "7 min read",
    gradient: "from-fuchsia-500/85 to-pink-700/85",
    category: "k-culture",
  },
  {
    id: "drama-locations",
    title: "Iconic K-drama filming locations you can actually visit",
    excerpt: "A shortlist that pairs well with coffee breaks and easy subway hops.",
    date: "Apr 10, 2026",
    dateIso: "2026-04-10",
    readTime: "9 min read",
    gradient: "from-sky-500/85 to-blue-800/85",
    category: "k-culture",
  },
  {
    id: "gwangjang-bite",
    title: "Gwangjang Market: what to order first",
    excerpt: "Bindaetteok, mayak gimbap, and how to navigate busy stalls without stress.",
    date: "Apr 2, 2026",
    dateIso: "2026-04-02",
    readTime: "6 min read",
    gradient: "from-amber-500/90 to-red-700/90",
    category: "k-food",
  },
  {
    id: "visa-basics",
    title: "Visa basics for short stays and working holidays",
    excerpt: "Clear distinctions, common mistakes, and where to double-check official rules.",
    date: "Mar 22, 2026",
    dateIso: "2026-03-22",
    readTime: "12 min read",
    gradient: "from-slate-500/85 to-slate-800/85",
    category: "living",
  },
  {
    id: "monthly-budget",
    title: "Seoul monthly costs: a realistic expat-style snapshot",
    excerpt: "Housing ranges, groceries, transport, and small lifestyle choices that add up.",
    date: "Mar 14, 2026",
    dateIso: "2026-03-14",
    readTime: "11 min read",
    gradient: "from-emerald-600/85 to-teal-900/85",
    category: "living",
  },
  {
    id: "jeju-transport",
    title: "Jeju without a car: buses, taxis, and pacing",
    excerpt: "How to structure days when you are relying on public transport and daylight.",
    date: "Mar 5, 2026",
    dateIso: "2026-03-05",
    readTime: "10 min read",
    gradient: "from-cyan-500/80 to-teal-700/85",
    category: "travel",
  },
  {
    id: "editors-notebook",
    title: "Editor’s notebook: small observations from the week",
    excerpt: "Quick notes we have not filed into a full guide yet—still useful if you are curious.",
    date: "Feb 28, 2026",
    dateIso: "2026-02-28",
    readTime: "3 min read",
    gradient: "from-zinc-400/90 to-zinc-600/90",
    category: "uncategorized",
  },
];

export function getFeaturedPosts(limit = 3): BlogPost[] {
  return BLOG_POSTS.filter((p) => p.category !== "uncategorized")
    .sort((a, b) => (a.dateIso < b.dateIso ? 1 : -1))
    .slice(0, limit);
}

export function filterBlogPosts(filterId: BlogFilterId): BlogPost[] {
  if (filterId === "all") return BLOG_POSTS;
  return BLOG_POSTS.filter((p) => p.category === filterId);
}
