import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Plan a trip — InsideKoreaNow",
  description: "Start planning your Korea itinerary with InsideKoreaNow.",
};

export default function PlanPage() {
  return (
    <div className="border-b border-zinc-200 bg-white pb-20 pt-10 sm:pt-14">
      <div className="mx-auto max-w-3xl px-4 sm:px-6 lg:px-8">
        <h1 className="text-3xl font-semibold tracking-tight text-slate-900 sm:text-4xl">Plan a trip</h1>
        <p className="mt-4 text-lg leading-relaxed text-slate-600">
          This is a starter page for your trip planner. Next, you can add itinerary tools, saved places, or
          links into your guides.
        </p>
        <div className="mt-8 flex flex-wrap gap-3">
          <Link
            href="/blog"
            className="rounded-full bg-teal-700 px-5 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:bg-teal-800"
          >
            Read the blog
          </Link>
          <Link
            href="/"
            className="rounded-full border border-zinc-200 bg-white px-5 py-2.5 text-sm font-semibold text-slate-800 transition hover:bg-zinc-50"
          >
            Back home
          </Link>
        </div>
      </div>
    </div>
  );
}
