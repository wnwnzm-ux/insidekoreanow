import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "About — InsideKoreaNow",
  description: "InsideKoreaNow is an English-language Korea travel guide built for international visitors who want real, local insights.",
};

export default function AboutPage() {
  return (
    <div className="min-h-screen bg-slate-50 py-12">
      <div className="mx-auto max-w-2xl px-4 sm:px-6">
        <h1 className="mb-2 text-3xl font-bold text-slate-900">About InsideKoreaNow</h1>
        <p className="mb-10 text-sm text-slate-500">Korea travel, from the inside out.</p>

        <div className="space-y-10 text-sm leading-relaxed text-slate-700">

          <section>
            <h2 className="mb-3 text-lg font-bold text-slate-800">What We Do</h2>
            <p>
              InsideKoreaNow is an English-language travel and culture guide for international
              visitors to South Korea. We publish practical, up-to-date guides covering where to
              go, what to eat, how to get around, and how to make the most of every day — whether
              you&apos;re spending a weekend in Seoul or a month exploring the whole country.
            </p>
            <p className="mt-3">
              Beyond static guides, we built a free AI-powered trip planner that creates
              personalised day-by-day Korea itineraries in seconds — tailored to your travel
              style, budget, and interests.
            </p>
          </section>

          <section>
            <h2 className="mb-3 text-lg font-bold text-slate-800">Our Approach</h2>
            <p>
              Korea travel content online is often outdated, vague, or written for people who
              already know the country. We write for first-time and returning visitors alike —
              with specific recommendations, honest context, and the kind of detail that actually
              helps you plan.
            </p>
            <p className="mt-3">
              Every guide is written or reviewed with international travelers in mind. We focus
              on practical English-language information: how to pay, what apps to download, how
              public transport works, what the local etiquette is, and where locals actually eat.
            </p>
          </section>

          <section>
            <h2 className="mb-3 text-lg font-bold text-slate-800">Who We Are</h2>
            <p>
              InsideKoreaNow is independently run by a small team passionate about helping
              international visitors experience Korea beyond the tourist brochure. We are based
              in Korea and update our content regularly to reflect current prices, openings,
              and local trends.
            </p>
          </section>

          <section>
            <h2 className="mb-3 text-lg font-bold text-slate-800">What We Cover</h2>
            <ul className="list-disc space-y-1 pl-5">
              <li><strong>Travel guides</strong> — Seoul, Busan, Jeju, and beyond</li>
              <li><strong>K-Food</strong> — restaurants, street food, markets, recipes</li>
              <li><strong>K-Culture</strong> — K-pop, K-drama, festivals, fan experiences</li>
              <li><strong>Living in Korea</strong> — transport, payments, apps, everyday tips</li>
              <li><strong>Trip planning</strong> — free AI-powered personalised itineraries</li>
            </ul>
          </section>

          <section>
            <h2 className="mb-3 text-lg font-bold text-slate-800">Get in Touch</h2>
            <p>
              Have a question, correction, or collaboration inquiry? We&apos;d love to hear from you.
              Reach us at{" "}
              <a
                href="mailto:Duja0518@gmail.com"
                className="text-teal-600 underline hover:text-teal-700"
              >
                Duja0518@gmail.com
              </a>
              .
            </p>
          </section>

        </div>

        <div className="mt-10 border-t border-slate-200 pt-6">
          <Link href="/" className="text-sm text-teal-600 hover:text-teal-700">
            ← Back to InsideKoreaNow
          </Link>
        </div>
      </div>
    </div>
  );
}
