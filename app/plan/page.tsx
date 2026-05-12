import type { Metadata } from "next";
import { SITE_NAME } from "@/lib/site";
import { PlannerClient } from "./PlannerClient";

export const metadata: Metadata = {
  title: "Plan a trip",
  description: "Build your perfect Korea itinerary — pick places, organize by day, and visualize your route.",
  alternates: {
    canonical: "/plan",
  },
  openGraph: {
    type: "website",
    url: "/plan",
    title: `Plan a trip | ${SITE_NAME}`,
    description: "Build your perfect Korea itinerary — pick places, organize by day, and visualize your route.",
  },
  twitter: {
    card: "summary_large_image",
    title: `Plan a trip | ${SITE_NAME}`,
    description: "Build your perfect Korea itinerary — pick places, organize by day, and visualize your route.",
  },
};

export default function PlanPage() {
  return <PlannerClient />;
}
