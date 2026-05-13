import type { Metadata } from "next";
import { SITE_NAME } from "@/lib/site";
import { TripPlannerFlow } from "./TripPlannerFlow";

export const metadata: Metadata = {
  title: "Plan a trip",
  description: "Tell us about your trip and our Korea Travel Expert will build a personalised itinerary just for you.",
  alternates: {
    canonical: "/plan",
  },
  openGraph: {
    type: "website",
    url: "/plan",
    title: `Plan a trip | ${SITE_NAME}`,
    description: "Tell us about your trip and our Korea Travel Expert will build a personalised itinerary just for you.",
  },
  twitter: {
    card: "summary_large_image",
    title: `Plan a trip | ${SITE_NAME}`,
    description: "Tell us about your trip and our Korea Travel Expert will build a personalised itinerary just for you.",
  },
};

export default function PlanPage() {
  return <TripPlannerFlow />;
}
