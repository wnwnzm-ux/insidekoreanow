import { WP_POSTS } from "./posts";

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
  thumbnailUrl?: string;
  category: BlogCategorySlug;
  /** WordPress HTML body (trusted site export). */
  contentHtml: string;
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

/** All posts (WordPress import via `lib/posts.ts`). */
export const BLOG_POSTS: BlogPost[] = WP_POSTS;

export function getFeaturedPosts(limit = 3): BlogPost[] {
  return BLOG_POSTS.filter((p) => p.category !== "uncategorized")
    .sort((a, b) => (a.dateIso < b.dateIso ? 1 : -1))
    .slice(0, limit);
}

export function filterBlogPosts(filterId: BlogFilterId): BlogPost[] {
  if (filterId === "all") return BLOG_POSTS;
  return BLOG_POSTS.filter((p) => p.category === filterId);
}
