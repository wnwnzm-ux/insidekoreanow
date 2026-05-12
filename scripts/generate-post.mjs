/**
 * Generates a single content/posts/*.html draft/published post using Anthropic.
 *
 * Usage:
 *   npm run generate:post -- "best things to do in Gyeongju Korea"
 *   npm run generate:post -- "best cafes in Seongsu Seoul" -- --category k-food --no-images
 */
import { existsSync, mkdirSync, writeFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import {
  inferCategory,
  normalizeCategory,
  slugify,
  writeContentPost,
} from "./lib/post-content.mjs";

const __dirname = dirname(fileURLToPath(import.meta.url));
const root = join(__dirname, "..");
const contentDir = join(root, "content", "posts");

const { keyword, options } = parseArgs(process.argv.slice(2));
if (!keyword) {
  usage();
  process.exit(1);
}

const anthropicKey = process.env.ANTHROPIC_API_KEY;
if (!anthropicKey && !options.stub) {
  console.error("ANTHROPIC_API_KEY is required. Use --stub to create a placeholder without API calls.");
  process.exit(1);
}

if (!existsSync(contentDir)) mkdirSync(contentDir, { recursive: true });

const requestedCategory = options.category ? normalizeCategory(options.category) : inferCategory(keyword);
const generated = options.stub
  ? buildStubPost(keyword, requestedCategory)
  : await generateWithAnthropic(keyword, requestedCategory, anthropicKey);

const category = options.category ? requestedCategory : normalizeCategory(generated.category || requestedCategory);
const slug = slugify(generated.slug || generated.title || keyword);
const filePath = join(contentDir, `${slug}.html`);

if (existsSync(filePath) && !options.force) {
  console.error(`Post already exists: content/posts/${slug}.html (use --force to overwrite)`);
  process.exit(1);
}

const images = options.noImages ? [] : await fetchUnsplashImages(keyword);
const contentHtml = insertImages(generated.bodyHtml, images);
const thumbnailUrl = images[0]?.url;
const dateIso = options.date || new Date().toISOString().slice(0, 10);

if (options.dryRun) {
  console.log(JSON.stringify({ slug, category, thumbnailUrl, title: generated.title }, null, 2));
  process.exit(0);
}

writeContentPost(
  filePath,
  {
    id: slug,
    title: generated.title,
    excerpt: generated.excerpt || generated.metaDescription,
    metaDescription: generated.metaDescription || generated.excerpt,
    dateIso,
    category,
    status: options.status || "published",
    tags: generated.tags || [],
    keyword,
    thumbnailUrl,
  },
  contentHtml,
);

writeFileSync(
  join(contentDir, `${slug}.notes.json`),
  JSON.stringify({ keyword, generatedAt: new Date().toISOString(), images }, null, 2),
  "utf8",
);

console.log(`Created content/posts/${slug}.html`);
console.log("Run npm run sync:posts to rebuild lib/posts.ts.");

function parseArgs(args) {
  const options = {
    noImages: false,
    force: false,
    dryRun: false,
    stub: false,
  };
  const positional = [];

  for (let i = 0; i < args.length; i++) {
    const arg = args[i];
    if (arg === "--") continue;
    else if (arg === "--no-images") options.noImages = true;
    else if (arg === "--force") options.force = true;
    else if (arg === "--dry-run") options.dryRun = true;
    else if (arg === "--stub") options.stub = true;
    else if (arg === "--category") options.category = args[++i];
    else if (arg === "--status") options.status = args[++i];
    else if (arg === "--date") options.date = args[++i];
    else positional.push(arg);
  }

  return { keyword: positional.join(" ").trim(), options };
}

function usage() {
  console.log(`Usage: npm run generate:post -- "keyword" [-- --category travel --no-images --force]`);
}

async function generateWithAnthropic(keyword, category, apiKey) {
  const model = process.env.ANTHROPIC_MODEL || "claude-3-5-sonnet-latest";
  const res = await fetch("https://api.anthropic.com/v1/messages", {
    method: "POST",
    headers: {
      "content-type": "application/json",
      "x-api-key": apiKey,
      "anthropic-version": "2023-06-01",
    },
    body: JSON.stringify({
      model,
      max_tokens: 6000,
      temperature: 0.4,
      messages: [
        {
          role: "user",
          content: buildPrompt(keyword, category),
        },
      ],
    }),
  });

  if (!res.ok) {
    throw new Error(`Anthropic request failed: ${res.status} ${await res.text()}`);
  }

  const data = await res.json();
  const text = data.content?.map((part) => part.text).join("\n") ?? "";
  return parseJsonResponse(text);
}

function buildPrompt(keyword, category) {
  return `You write SEO travel content for InsideKoreaNow, an English-language Korea travel platform for foreign visitors.

Keyword: ${keyword}
Category slug: ${category}

Return strict JSON only with:
{
  "title": "SEO title under 65 chars",
  "slug": "lowercase-url-slug",
  "excerpt": "150-160 character excerpt",
  "metaDescription": "150-160 character meta description",
  "category": "${category}",
  "tags": ["tag1", "tag2"],
  "bodyHtml": "<article body HTML only>"
}

Body requirements:
- 1500 to 2000 words in natural English.
- Helpful local-friend tone for first-time Korea visitors.
- Use h2/h3 headings, paragraphs, lists, and a final FAQ section.
- Include practical details, transportation tips, etiquette, prices when useful, and common mistakes.
- Do not invent official opening hours or exact prices unless framed as approximate.
- Do not include markdown fences. JSON only.`;
}

function parseJsonResponse(text) {
  const cleaned = text.trim().replace(/^```json\s*/i, "").replace(/```$/i, "").trim();
  const start = cleaned.indexOf("{");
  const end = cleaned.lastIndexOf("}");
  if (start === -1 || end === -1) throw new Error("Anthropic response did not contain JSON.");
  return JSON.parse(cleaned.slice(start, end + 1));
}

function buildStubPost(keyword, category) {
  const title = keyword
    .split(/\s+/)
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(" ");

  return {
    title,
    slug: slugify(keyword),
    excerpt: `A practical Korea guide for ${keyword}.`,
    metaDescription: `A practical Korea guide for ${keyword}.`,
    category,
    tags: [category, "Korea"],
    bodyHtml: `<h2>${title}</h2>\n<p>Write the full article here.</p>\n<h2>FAQ</h2>\n<h3>Is this guide good for first-time visitors?</h3>\n<p>Yes. It is designed for international travelers visiting Korea.</p>`,
  };
}

async function fetchUnsplashImages(keyword) {
  const key = process.env.UNSPLASH_ACCESS_KEY;
  if (!key) return [];

  const url = new URL("https://api.unsplash.com/search/photos");
  url.searchParams.set("query", `${keyword} Korea`);
  url.searchParams.set("per_page", "5");
  url.searchParams.set("orientation", "landscape");
  url.searchParams.set("client_id", key);

  const res = await fetch(url);
  if (!res.ok) throw new Error(`Unsplash request failed: ${res.status} ${await res.text()}`);
  const data = await res.json();
  const seen = new Set();

  return (data.results || [])
    .filter((photo) => {
      if (!photo.id || seen.has(photo.id)) return false;
      seen.add(photo.id);
      return true;
    })
    .slice(0, 3)
    .map((photo) => ({
      id: photo.id,
      url: `${photo.urls.raw}&w=800&q=80&auto=format&fit=crop`,
      alt: photo.alt_description || keyword,
      creditName: photo.user?.name,
      creditUrl: photo.user?.links?.html,
    }));
}

function insertImages(bodyHtml, images) {
  if (!images.length) return bodyHtml;
  let out = bodyHtml;
  const figures = images.map(imageToFigure);

  out = out.replace(/<\/p>/i, `</p>\n${figures[0]}`);
  for (let i = 1; i < figures.length; i++) {
    const h2Matches = [...out.matchAll(/<h2\b[^>]*>/gi)];
    const target = h2Matches[i]?.index;
    if (target === undefined) out += `\n${figures[i]}`;
    else out = `${out.slice(0, target)}${figures[i]}\n${out.slice(target)}`;
  }
  return out;
}

function imageToFigure(image) {
  const credit = image.creditName
    ? `<figcaption>Photo by <a href="${image.creditUrl}?utm_source=insidekoreanow&amp;utm_medium=referral" target="_blank" rel="noopener">${escapeHtml(image.creditName)}</a> on Unsplash</figcaption>`
    : "";
  return `<figure class="wp-block-image"><img src="${image.url}" alt="${escapeHtml(image.alt)}" loading="lazy" width="800" />${credit}</figure>`;
}

function escapeHtml(value) {
  return String(value)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}
