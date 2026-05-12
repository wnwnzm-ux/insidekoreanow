/**
 * Builds lib/posts.ts from content/posts/*.html.
 * Run: npm run sync:posts
 */
import { existsSync, writeFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { readContentPosts } from "./lib/post-content.mjs";

const __dirname = dirname(fileURLToPath(import.meta.url));
const root = join(__dirname, "..");
const contentDir = join(root, "content", "posts");
const outPath = join(root, "lib", "posts.ts");

if (!existsSync(contentDir)) {
  console.error("No content/posts directory found.");
  process.exit(1);
}

const posts = readContentPosts(contentDir)
  .filter((post) => post.status !== "draft")
  .map(({ status: _status, ...post }) => post)
  .sort((a, b) => (a.dateIso < b.dateIso ? 1 : -1));

const header = `/**
 * Auto-generated from content/posts.
 * Re-run: npm run sync:posts
 */
import type { BlogPost } from "./blog-posts";

export const WP_POSTS: BlogPost[] = `;

writeFileSync(outPath, `${header}${JSON.stringify(posts, null, 2)};\n`, "utf8");
console.log(`Wrote lib/posts.ts with ${posts.length} published posts from content/posts`);
