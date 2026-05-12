/**
 * One-time helper to export the current generated lib/posts.ts into content/posts/*.html.
 * Run: npm run export:posts
 */
import { existsSync, mkdirSync, readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { writeContentPost } from "./lib/post-content.mjs";

const __dirname = dirname(fileURLToPath(import.meta.url));
const root = join(__dirname, "..");
const sourcePath = join(root, "lib", "posts.ts");
const contentDir = join(root, "content", "posts");

if (!existsSync(contentDir)) mkdirSync(contentDir, { recursive: true });

const source = readFileSync(sourcePath, "utf8");
const match =
  source.match(/const RAW_WP_POSTS:[^=]+ = (\[[\s\S]*?\n\]);/) ??
  source.match(/export const WP_POSTS:[^=]+ = (\[[\s\S]*?\n\]);/);

if (!match) {
  console.error("Could not locate posts array in lib/posts.ts.");
  process.exit(1);
}

const posts = JSON.parse(match[1]);
for (const post of posts) {
  const filePath = join(contentDir, `${post.id}.html`);
  writeContentPost(
    filePath,
    {
      id: post.id,
      title: post.title,
      excerpt: post.excerpt,
      dateIso: post.dateIso,
      category: post.category,
      status: "published",
    },
    post.contentHtml,
  );
}

console.log(`Exported ${posts.length} posts to content/posts`);
