import type { Metadata } from "next";
import { Suspense } from "react";
import { BlogIndexClient } from "./blog-index-client";
import { SITE_NAME } from "@/lib/site";

export const metadata: Metadata = {
  title: "Korea travel guides",
  description: "Practical insider guides on Korean food, transport, culture, and travel—written for international visitors.",
  alternates: {
    canonical: "/blog",
  },
  openGraph: {
    type: "website",
    url: "/blog",
    title: `Korea travel guides | ${SITE_NAME}`,
    description: "Practical insider guides on Korean food, transport, culture, and travel—written for international visitors.",
  },
  twitter: {
    card: "summary_large_image",
    title: `Korea travel guides | ${SITE_NAME}`,
    description: "Practical insider guides on Korean food, transport, culture, and travel—written for international visitors.",
  },
};

export default function BlogPage() {
  return (
    <Suspense>
      <BlogIndexClient />
    </Suspense>
  );
}
