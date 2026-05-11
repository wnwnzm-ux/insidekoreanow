import type { Metadata } from "next";
import { BlogIndexClient } from "./blog-index-client";
import { SITE_NAME } from "@/lib/site";

export const metadata: Metadata = {
  title: "Korea travel blog",
  description: "Guides on K-culture, food, living in Korea, and travel for international visitors.",
  alternates: {
    canonical: "/blog",
  },
  openGraph: {
    type: "website",
    url: "/blog",
    title: `Korea travel blog | ${SITE_NAME}`,
    description: "Guides on K-culture, food, living in Korea, and travel for international visitors.",
  },
  twitter: {
    card: "summary_large_image",
    title: `Korea travel blog | ${SITE_NAME}`,
    description: "Guides on K-culture, food, living in Korea, and travel for international visitors.",
  },
};

export default function BlogPage() {
  return <BlogIndexClient />;
}
