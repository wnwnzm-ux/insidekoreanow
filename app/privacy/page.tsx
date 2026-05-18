import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Privacy Policy — InsideKoreaNow",
  description: "Privacy policy for InsideKoreaNow — how we collect and use data.",
};

export default function PrivacyPage() {
  return (
    <div className="min-h-screen bg-slate-50 py-12">
      <div className="mx-auto max-w-2xl px-4 sm:px-6">
        <h1 className="mb-2 text-3xl font-bold text-slate-900">Privacy Policy</h1>
        <p className="mb-8 text-sm text-slate-500">Last updated: May 2026</p>

        <div className="prose prose-slate max-w-none space-y-8 text-sm leading-relaxed text-slate-700">

          <section>
            <h2 className="mb-3 text-lg font-bold text-slate-800">1. Who We Are</h2>
            <p>
              InsideKoreaNow (<strong>insidekoreanow.com</strong>) is an English-language travel and culture
              guide for international visitors to South Korea. If you have any questions about this policy,
              contact us at{" "}
              <a href="mailto:Duja0518@gmail.com" className="text-teal-600 underline hover:text-teal-700">
                Duja0518@gmail.com
              </a>
              .
            </p>
          </section>

          <section>
            <h2 className="mb-3 text-lg font-bold text-slate-800">2. Information We Collect</h2>
            <p>We do not collect personal information directly. However, third-party services we use may collect data automatically:</p>
            <ul className="mt-2 list-disc space-y-1 pl-5">
              <li>
                <strong>Google Analytics</strong> — collects anonymised usage data (pages visited, session
                duration, device type) to help us understand how visitors use the site. No personally
                identifiable information is stored.
              </li>
              <li>
                <strong>Google AdSense</strong> — displays advertisements and may use cookies to serve ads
                relevant to your interests based on your browsing history.
              </li>
            </ul>
          </section>

          <section>
            <h2 className="mb-3 text-lg font-bold text-slate-800">3. Cookies</h2>
            <p>
              Cookies are small files stored on your device. We use cookies through Google Analytics and
              Google AdSense as described above. You can disable cookies in your browser settings at any
              time; however, some features of the site may not function correctly.
            </p>
          </section>

          <section>
            <h2 className="mb-3 text-lg font-bold text-slate-800">4. Third-Party Advertising</h2>
            <p>
              We use Google AdSense to display advertisements. Google may use the DoubleClick cookie to
              serve ads based on your prior visits to this site and other sites on the internet. You can
              opt out of personalised advertising by visiting{" "}
              <a
                href="https://www.google.com/settings/ads"
                target="_blank"
                rel="noopener noreferrer"
                className="text-teal-600 underline hover:text-teal-700"
              >
                Google Ads Settings
              </a>
              .
            </p>
          </section>

          <section>
            <h2 className="mb-3 text-lg font-bold text-slate-800">5. Third-Party Links</h2>
            <p>
              Our site may contain links to external websites (e.g. Google Maps, restaurant websites). We
              are not responsible for the privacy practices of those sites and encourage you to review
              their privacy policies.
            </p>
          </section>

          <section>
            <h2 className="mb-3 text-lg font-bold text-slate-800">6. Children&apos;s Privacy</h2>
            <p>
              InsideKoreaNow is not directed at children under 13. We do not knowingly collect personal
              information from children.
            </p>
          </section>

          <section>
            <h2 className="mb-3 text-lg font-bold text-slate-800">7. Changes to This Policy</h2>
            <p>
              We may update this Privacy Policy from time to time. Changes will be posted on this page
              with an updated date.
            </p>
          </section>

          <section>
            <h2 className="mb-3 text-lg font-bold text-slate-800">8. Contact</h2>
            <p>
              For any privacy-related questions, please email us at{" "}
              <a href="mailto:Duja0518@gmail.com" className="text-teal-600 underline hover:text-teal-700">
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
