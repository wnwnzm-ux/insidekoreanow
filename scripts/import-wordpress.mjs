/**
 * Reads discovertherealkorea.WordPress.*.xml from project root and writes lib/posts.ts
 * Run: node scripts/import-wordpress.mjs
 */
import { readFileSync, writeFileSync, readdirSync } from "node:fs";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";
import { XMLParser } from "fast-xml-parser";

const __dirname = dirname(fileURLToPath(import.meta.url));
const root = join(__dirname, "..");

const xmlName = readdirSync(root).find((f) => f.startsWith("discovertherealkorea.WordPress.") && f.endsWith(".xml"));
if (!xmlName) {
  console.error("No discovertherealkorea.WordPress.*.xml in project root.");
  process.exit(1);
}

const CATEGORY_ORDER = ["k-culture", "k-food", "living-in-korea", "travel"];

const CATEGORY_OVERRIDES = {
  "olive-young-must-haves-2025-k-beauty-souvenirs": "k-culture",
  "cost-of-living-seoul-vs-busan-2025-data": "living",
  "korean-convenience-store-foods-2025": "k-food",
  "top-7-must-try-korean-street-foods-in-seoul": "k-food",
  "how-to-make-authentic-korean-kimbap-step-by-step-2": "k-food",
  "five-types-of-korean-kimbap-2025": "k-food",
  "how-to-make-authentic-korean-kimbap-step-by-step": "k-food",
  "jeju-cutlassfish-best-restaurants-2025": "k-food",
  "korean-convenience-store-snacks-2025": "k-food",
  "where-kidols-shop-and-cafes-seoul-2025": "k-culture",
  "netflix-korea-2026-upcoming-kdramas": "k-culture",
  "netflix-kdramas-late-2025-lineup": "k-culture",
  "netflix-korea-2025-2026-kdrama-lineup": "k-culture",
  "where-to-take-kpop-dance-classes-seoul": "k-culture",
  "kpop-cafes-theme-stores-hongdae-myeongdong-2025": "k-culture",
  "filming-locations-of-your-favorite-k-dramas-you-can-actually-visit": "k-culture",
  "kpop-landmarks-in-seoul-2025": "k-culture",
  "how-to-get-sim-card-in-korea-2025": "living",
  "traditional-korean-dishes-you-should-try-once-in-your-life": "k-food",
  "escape-room-culture-in-seoul-2025": "k-culture",
  "best-korean-bbq-restaurants-in-seoul": "k-food",
  "hongdae-street-food-guide-seoul": "k-food",
  "kpop-demon-hunters-everland-2025": "k-culture",
};

/** @returns {"k-culture"|"k-food"|"living"|"travel"|"uncategorized"} */
function mapWpCategoryNicenames(nicenames) {
  const set = new Set(nicenames);
  for (const nicename of CATEGORY_ORDER) {
    if (set.has(nicename)) {
      return nicename === "living-in-korea" ? "living" : nicename;
    }
  }
  return "uncategorized";
}

function stripTags(html) {
  return html.replace(/<[^>]+>/g, " ").replace(/\s+/g, " ").trim();
}

function estimateReadTime(html) {
  const words = stripTags(html).split(/\s+/).filter(Boolean).length;
  const mins = Math.max(1, Math.round(words / 200));
  return `${mins} min read`;
}

function formatDisplayDate(isoDate) {
  const d = new Date(isoDate + "T12:00:00Z");
  return d.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
}

const GRADIENTS = [
  "from-teal-500/90 to-emerald-700/90",
  "from-rose-500/85 to-orange-600/85",
  "from-indigo-500/90 to-violet-700/90",
  "from-fuchsia-500/85 to-pink-700/85",
  "from-sky-500/85 to-blue-800/85",
  "from-amber-500/90 to-red-700/90",
  "from-slate-500/85 to-slate-800/85",
  "from-emerald-600/85 to-teal-900/85",
  "from-cyan-500/80 to-teal-700/85",
  "from-orange-500/85 to-rose-700/85",
  "from-violet-500/85 to-indigo-800/90",
  "from-lime-600/80 to-emerald-800/85",
];

function gradientForSlug(slug) {
  let h = 0;
  for (let i = 0; i < slug.length; i++) h = (h * 31 + slug.charCodeAt(i)) >>> 0;
  return GRADIENTS[h % GRADIENTS.length];
}

const parser = new XMLParser({
  ignoreAttributes: false,
  attributeNamePrefix: "@_",
  textNodeName: "#text",
  cdataPropName: "__cdata",
  isArray: (name) => ["item", "category", "wp:postmeta", "wp:comment"].includes(name),
});

const xml = readFileSync(join(root, xmlName), "utf8");
const doc = parser.parse(xml);
const channel = doc.rss.channel;
const rawItems = channel.item;
const items = Array.isArray(rawItems) ? rawItems : rawItems ? [rawItems] : [];

/** @type {import("../lib/blog-posts").BlogPost[]} */
const posts = [];
const usedSlugs = new Set();

for (const item of items) {
  const postType = getCdata(item, "wp:post_type") ?? item["wp:post_type"];
  const status = getCdata(item, "wp:status") ?? item["wp:status"];
  if (postType !== "post" || status !== "publish") continue;

  const title = textOf(item.title);
  let slug = getCdata(item, "wp:post_name") ?? item["wp:post_name"] ?? "";
  slug = String(slug).trim();
  if (!slug) slug = `post-${getCdata(item, "wp:post_id") ?? "unknown"}`;

  let uniqueSlug = slug;
  let n = 2;
  while (usedSlugs.has(uniqueSlug)) {
    uniqueSlug = `${slug}-${n++}`;
  }
  usedSlugs.add(uniqueSlug);

  const dateRaw = getCdata(item, "wp:post_date_gmt") ?? getCdata(item, "wp:post_date") ?? "";
  const dateIso = normalizeToIsoDate(dateRaw);
  const date = formatDisplayDate(dateIso);

  const contentHtml = getCdata(item, "content:encoded") ?? "";
  const excerptRaw = getCdata(item, "excerpt:encoded") ?? "";
  const excerpt = stripTags(excerptRaw) || stripTags(contentHtml).slice(0, 220) + (stripTags(contentHtml).length > 220 ? "…" : "");

  const catNices = collectCategoryNicenames(item.category);
  const category = CATEGORY_OVERRIDES[uniqueSlug] ?? mapWpCategoryNicenames(catNices);

  posts.push({
    id: uniqueSlug,
    title,
    excerpt,
    date,
    dateIso,
    readTime: estimateReadTime(contentHtml),
    gradient: gradientForSlug(uniqueSlug),
    category,
    contentHtml,
  });
}

posts.sort((a, b) => (a.dateIso < b.dateIso ? 1 : -1));

const header = `/**
 * Auto-generated from WordPress export (${xmlName}).
 * Re-run: npm run import:wp
 */
import type { BlogPost } from "./blog-posts";

const RAW_WP_POSTS: Omit<BlogPost, "thumbnailUrl">[] = `;

const body = JSON.stringify(posts, null, 2);
const footer = `;

const FIRST_IMAGE_SRC_PATTERN = /<img\\b[^>]*\\bsrc\\s*=\\s*(?:"([^"]+)"|'([^']+)'|([^'"\\s>]+))/i;

function extractFirstImageUrl(contentHtml: string): string | undefined {
  const match = contentHtml.match(FIRST_IMAGE_SRC_PATTERN);
  const src = match?.[1] ?? match?.[2] ?? match?.[3];
  return src ? decodeHtmlAttribute(src) : undefined;
}

function decodeHtmlAttribute(value: string): string {
  return value
    .replace(/&amp;/g, "&")
    .replace(/&quot;/g, '"')
    .replace(/&#039;/g, "'")
    .replace(/&apos;/g, "'");
}

function categoryGradientForPost(category: BlogPost["category"]): string {
  switch (category) {
    case "k-culture":
      return "from-purple-500/85 to-indigo-800/90";
    case "k-food":
      return "from-orange-500/85 to-rose-700/90";
    case "living":
      return "from-teal-500/85 to-emerald-800/90";
    case "travel":
      return "from-blue-500/85 to-sky-800/90";
    case "uncategorized":
      return "from-slate-500/85 to-slate-800/85";
  }
}

export const WP_POSTS: BlogPost[] = RAW_WP_POSTS.map((post) => ({
  ...post,
  gradient: categoryGradientForPost(post.category),
  thumbnailUrl: extractFirstImageUrl(post.contentHtml),
}));
`;
const out = header + body + footer;
writeFileSync(join(root, "lib", "posts.ts"), out, "utf8");
console.log(`Wrote lib/posts.ts with ${posts.length} published posts from ${xmlName}`);

function getCdata(obj, key) {
  const v = obj[key];
  if (v == null) return "";
  if (typeof v === "string") return v;
  if (typeof v === "object" && "__cdata" in v) return v.__cdata ?? "";
  if (typeof v === "object" && "#text" in v) return v["#text"] ?? "";
  return String(v);
}

function textOf(v) {
  if (v == null) return "";
  if (typeof v === "string") return v.trim();
  if (typeof v === "object" && "__cdata" in v) return String(v.__cdata ?? "").trim();
  if (typeof v === "object" && "#text" in v) return String(v["#text"] ?? "").trim();
  return String(v).trim();
}

function collectCategoryNicenames(cat) {
  if (!cat) return [];
  const arr = Array.isArray(cat) ? cat : [cat];
  const out = [];
  for (const c of arr) {
    if (c && typeof c === "object" && c["@_domain"] === "category" && c["@_nicename"]) {
      out.push(String(c["@_nicename"]));
    }
  }
  return out;
}

/** "2025-10-20 10:43:06" or "0000-00-00 00:00:00" -> YYYY-MM-DD */
function normalizeToIsoDate(raw) {
  const s = String(raw).trim();
  const m = s.match(/^(\d{4})-(\d{2})-(\d{2})/);
  if (m) return `${m[1]}-${m[2]}-${m[3]}`;
  return "1970-01-01";
}
