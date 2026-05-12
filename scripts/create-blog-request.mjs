/**
 * Writes a blog generation request file used by the GitHub Actions workflow.
 *
 * Usage:
 *   node scripts/create-blog-request.mjs "how to use Kakao Taxi in Korea as a foreigner" --category living
 */
import { mkdirSync, writeFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { inferCategory, normalizeCategory, slugify } from "./lib/post-content.mjs";

const __dirname = dirname(fileURLToPath(import.meta.url));
const root = join(__dirname, "..");
const requestPath = join(root, ".github", "blog-post-request.json");
const { keyword, options } = parseArgs(process.argv.slice(2));

if (!keyword) {
  console.error("Usage: node scripts/create-blog-request.mjs \"keyword\" [--category living --status published]");
  process.exit(1);
}

const category = options.category && options.category !== "auto" ? normalizeCategory(options.category) : inferCategory(keyword);
const request = {
  keyword,
  category: options.category || "auto",
  resolvedCategory: category,
  status: options.status || "published",
  noImages: Boolean(options.noImages),
  force: Boolean(options.force),
  requestSlug: slugify(keyword),
  requestedAt: new Date().toISOString(),
};

mkdirSync(dirname(requestPath), { recursive: true });
writeFileSync(requestPath, `${JSON.stringify(request, null, 2)}\n`, "utf8");
console.log(`Wrote ${requestPath}`);
console.log(JSON.stringify(request, null, 2));

function parseArgs(args) {
  const options = {
    noImages: false,
    force: false,
  };
  const positional = [];

  for (let i = 0; i < args.length; i++) {
    const arg = args[i];
    if (arg === "--") continue;
    else if (arg === "--no-images") options.noImages = true;
    else if (arg === "--force") options.force = true;
    else if (arg === "--category") options.category = args[++i];
    else if (arg === "--status") options.status = args[++i];
    else positional.push(arg);
  }

  return { keyword: positional.join(" ").trim(), options };
}
