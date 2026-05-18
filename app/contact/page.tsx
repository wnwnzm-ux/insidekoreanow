import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Contact — InsideKoreaNow",
  description: "Get in touch with the InsideKoreaNow team.",
};

export default function ContactPage() {
  return (
    <div className="min-h-screen bg-slate-50 py-12">
      <div className="mx-auto max-w-xl px-4 sm:px-6">
        <h1 className="mb-2 text-3xl font-bold text-slate-900">Contact Us</h1>
        <p className="mb-10 text-slate-500">We&apos;d love to hear from you.</p>

        <div className="rounded-2xl border border-slate-100 bg-white p-8 shadow-sm space-y-6">
          <div>
            <h2 className="mb-1 text-sm font-semibold uppercase tracking-wider text-slate-400">
              General enquiries
            </h2>
            <a
              href="mailto:Duja0518@gmail.com"
              className="text-lg font-semibold text-teal-600 hover:text-teal-700 transition-colors"
            >
              Duja0518@gmail.com
            </a>
          </div>

          <div>
            <h2 className="mb-1 text-sm font-semibold uppercase tracking-wider text-slate-400">
              What we can help with
            </h2>
            <ul className="mt-2 space-y-1 text-sm text-slate-600 list-disc pl-4">
              <li>Content corrections or suggestions</li>
              <li>Partnership and collaboration enquiries</li>
              <li>Advertising enquiries</li>
              <li>Any other questions about InsideKoreaNow</li>
            </ul>
          </div>

          <p className="text-xs text-slate-400">
            We aim to respond within 2–3 business days.
          </p>
        </div>

        <div className="mt-8 border-t border-slate-200 pt-6">
          <Link href="/" className="text-sm text-teal-600 hover:text-teal-700">
            ← Back to InsideKoreaNow
          </Link>
        </div>
      </div>
    </div>
  );
}
