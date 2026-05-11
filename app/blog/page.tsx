import type { Metadata } from "next";
import { BlogIndexClient } from "./blog-index-client";

export const metadata: Metadata = {
  title: "Blog — InsideKoreaNow",
  description: "Guides on K-culture, food, living in Korea, and travel for international visitors.",
};

export default function BlogPage() {
  return <BlogIndexClient />;
}
