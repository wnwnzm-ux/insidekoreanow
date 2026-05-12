import { readdirSync, readFileSync, writeFileSync } from "node:fs";
import { basename, join } from "node:path";

export const VALID_CATEGORIES = new Set(["k-culture", "k-food", "living", "travel", "uncategorized"]);

export function stripTags(html) {
  return html.replace(/<[^>]+>/g, " ").replace(/\s+/g, " ").trim();
}

export function estimateReadTime(html) {
  const words = stripTags(html).split(/\s+/).filter(Boolean).length;
  const mins = Math.max(1, Math.round(words / 200));
  return `${mins} min read`;
}

export function formatDisplayDate(isoDate) {
  const d = new Date(`${isoDate}T12:00:00Z`);
  return d.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
}

export function slugify(value) {
  return String(value)
    .toLowerCase()
    .normalize("NFKD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/&/g, " and ")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 100);
}

export function normalizeCategory(value) {
  const normalized = String(value || "")
    .trim()
    .toLowerCase()
    .replace(/\s+/g, "-");

  const aliases = {
    "k-culture": "k-culture",
    kculture: "k-culture",
    culture: "k-culture",
    "k-food": "k-food",
    kfood: "k-food",
    food: "k-food",
    "living-in-korea": "living",
    living: "living",
    expat: "living",
    travel: "travel",
    uncategorized: "uncategorized",
  };

  return aliases[normalized] ?? "uncategorized";
}

export function inferCategory(keyword) {
  const text = String(keyword).toLowerCase();
  if (/(k-?pop|k-?drama|idol|concert|festival|netflix|drama|album|lightstick|beauty|olive young)/.test(text)) {
    return "k-culture";
  }
  if (/(food|restaurant|street food|cafe|coffee|bbq|kimbap|tteokbokki|snack|market|dish|eat)/.test(text)) {
    return "k-food";
  }
  if (/(visa|expat|cost of living|digital nomad|sim card|phone|airbnb|housing|grocery|payment|delivery)/.test(text)) {
    return "living";
  }
  if (/(travel|seoul|busan|jeju|gyeongju|palace|temple|hotel|subway|itinerary|things to do|destination)/.test(text)) {
    return "travel";
  }
  return "uncategorized";
}

export function categoryGradient(category) {
  switch (category) {
    case "k-culture":
      return "from-purple-500/85 to-indigo-800/90";
    case "k-food":
      return "from-orange-500/85 to-rose-700/90";
    case "living":
      return "from-teal-500/85 to-emerald-800/90";
    case "travel":
      return "from-blue-500/85 to-sky-800/90";
    default:
      return "from-slate-500/85 to-slate-800/85";
  }
}

const FIRST_IMAGE_SRC_PATTERN = /<img\b[^>]*\bsrc\s*=\s*(?:"([^"]+)"|'([^']+)'|([^'"\s>]+))/i;

export function extractFirstImageUrl(contentHtml) {
  const match = contentHtml.match(FIRST_IMAGE_SRC_PATTERN);
  const src = match?.[1] ?? match?.[2] ?? match?.[3];
  const decoded = src ? decodeHtmlAttribute(src) : undefined;
  return decoded && /^https?:\/\//i.test(decoded) ? decoded : undefined;
}

export function decodeHtmlAttribute(value) {
  return value
    .replace(/&amp;/g, "&")
    .replace(/&quot;/g, '"')
    .replace(/&#039;/g, "'")
    .replace(/&apos;/g, "'");
}

export function parseContentPost(raw, filePath) {
  if (!raw.startsWith("---\n")) {
    throw new Error(`${filePath} is missing frontmatter`);
  }

  const end = raw.indexOf("\n---\n", 4);
  if (end === -1) {
    throw new Error(`${filePath} frontmatter is not closed`);
  }

  const frontmatterRaw = raw.slice(4, end);
  const contentHtml = raw.slice(end + 5).trim();
  const frontmatter = parseFrontmatter(frontmatterRaw);
  const id = frontmatter.id || slugify(basename(filePath).replace(/\.(html|md)$/i, ""));
  const category = normalizeCategory(frontmatter.category);

  if (!VALID_CATEGORIES.has(category)) {
    throw new Error(`${filePath} has invalid category: ${frontmatter.category}`);
  }

  if (!frontmatter.title) throw new Error(`${filePath} is missing title`);
  if (!frontmatter.dateIso) throw new Error(`${filePath} is missing dateIso`);

  return {
    id,
    title: frontmatter.title,
    excerpt: frontmatter.excerpt || stripTags(contentHtml).slice(0, 220),
    date: formatDisplayDate(frontmatter.dateIso),
    dateIso: frontmatter.dateIso,
    readTime: estimateReadTime(contentHtml),
    gradient: categoryGradient(category),
    thumbnailUrl: frontmatter.thumbnailUrl || extractFirstImageUrl(contentHtml),
    category,
    status: frontmatter.status || "published",
    contentHtml,
  };
}

export function readContentPosts(contentDir) {
  const files = readdirSync(contentDir)
    .filter((file) => /\.(html|md)$/i.test(file))
    .sort();

  return files.map((file) => parseContentPost(readFileSync(join(contentDir, file), "utf8"), join(contentDir, file)));
}

export function writeContentPost(filePath, frontmatter, contentHtml) {
  const lines = ["---"];
  for (const [key, value] of Object.entries(frontmatter)) {
    if (value === undefined || value === null || value === "") continue;
    lines.push(`${key}: ${JSON.stringify(value)}`);
  }
  lines.push("---", "", contentHtml.trim(), "");
  writeFileSync(filePath, lines.join("\n"), "utf8");
}

function parseFrontmatter(frontmatterRaw) {
  const out = {};
  for (const line of frontmatterRaw.split(/\r?\n/)) {
    if (!line.trim() || line.trim().startsWith("#")) continue;
    const idx = line.indexOf(":");
    if (idx === -1) continue;
    const key = line.slice(0, idx).trim();
    const rawValue = line.slice(idx + 1).trim();
    out[key] = parseFrontmatterValue(rawValue);
  }
  return out;
}

function parseFrontmatterValue(value) {
  if (!value) return "";
  if (value.startsWith('"') || value.startsWith("[") || value === "true" || value === "false") {
    try {
      return JSON.parse(value);
    } catch {
      return value.replace(/^"|"$/g, "");
    }
  }
  return value;
}
