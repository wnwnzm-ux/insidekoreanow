import type { Metadata } from "next";
import Link from "next/link";
import { BlogCardThumbnail } from "@/app/components/BlogCardThumbnail";
import { getFeaturedPosts } from "@/lib/blog-posts";
import { decodeHtmlEntities } from "@/lib/html";
import { SITE_DESCRIPTION, SITE_NAME } from "@/lib/site";

export const metadata: Metadata = {
  title: "Korea travel guides for international visitors",
  description: SITE_DESCRIPTION,
  alternates: {
    canonical: "/",
  },
  openGraph: {
    type: "website",
    url: "/",
    title: `${SITE_NAME} - Korea travel guides for international visitors`,
    description: SITE_DESCRIPTION,
  },
  twitter: {
    card: "summary_large_image",
    title: `${SITE_NAME} - Korea travel guides for international visitors`,
    description: SITE_DESCRIPTION,
  },
};

const categories = [
  {
    title: "K-Culture",
    description: "K-pop, K-drama, Festivals, Shows",
    href: "/blog",
    icon: (
      <svg className="size-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          d="M12 21v-8.25M15.75 21v-8.25M8.25 21v-8.25M3 9l9-6 9 6m-1.5 12V10.332A48.36 48.36 0 0012 9.75c-2.551 0-5.056.2-7.5.582V21"
        />
      </svg>
    ),
  },
  {
    title: "K-Food",
    description: "Food, Restaurants, Street food, Cafes",
    href: "/blog",
    icon: (
      <svg className="size-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          d="M12 8.25v-1.5m0 1.5c-1.355 0-2.697.056-4.024.166C6.845 8.51 6 9.473 6 10.608v2.513m6-4.87c1.355 0 2.697.055 4.024.165C17.155 8.51 18 9.473 18 10.608v2.513m-18 0h4.001m0 0h16m-16 0v1.646c0 1.104.896 2 2 2h12a2 2 0 002-2v-1.646m0 0h4"
        />
      </svg>
    ),
  },
  {
    title: "Living in Korea",
    description: "Life tips, Visa, Costs, Expat life",
    href: "/blog",
    icon: (
      <svg className="size-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          d="M2.25 12l8.954-8.955c.44-.439 1.152-.439 1.591 0L21.75 12M4.5 9.75v10.125c0 .621.504 1.125 1.125 1.125H9.75v-4.875c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125V21h4.125c.621 0 1.125-.504 1.125-1.125V9.75M8.25 21h8.25"
        />
      </svg>
    ),
  },
  {
    title: "Travel",
    description: "Destinations, Sightseeing, Transport, Hotels",
    href: "/blog",
    icon: (
      <svg className="size-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          d="M12 21a9.004 9.004 0 008.716-6.747M12 21a9.004 9.004 0 01-8.716-6.747M12 21c2.485 0 4.5-4.03 4.5-9S14.485 3 12 3m0 18c-2.485 0-4.5-4.03-4.5-9S9.515 3 12 3m0 0a8.997 8.997 0 017.843 4.582M12 3a8.997 8.997 0 00-7.843 4.582m15.686 0A11.953 11.953 0 0112 10.5c-2.998 0-5.74-1.1-7.843-2.918m15.686 0A8.959 8.959 0 0121 12c0 .778-.099 1.533-.284 2.253m0 0A17.919 17.919 0 0112 16.5c-3.162 0-6.133-.815-8.716-2.247m0 0A9.015 9.015 0 013 12c0-1.605.42-3.113 1.157-4.418"
        />
      </svg>
    ),
  },
];

export default function Home() {
  const featuredPosts = getFeaturedPosts(3);

  return (
    <div className="flex min-h-full flex-col bg-zinc-50 text-slate-900">
      <main className="flex-1">
        <section className="relative overflow-hidden border-b border-zinc-200 bg-white">
          <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_80%_60%_at_50%_-10%,rgba(15,118,110,0.14),transparent)]" />
          <div className="relative mx-auto max-w-6xl px-4 pb-20 pt-16 sm:px-6 sm:pb-24 sm:pt-20 lg:px-8 lg:pb-28 lg:pt-24">
            <p className="text-center text-sm font-medium uppercase tracking-widest text-teal-700">
              Korea Travel Expert
            </p>
            <h1 className="mx-auto mt-4 max-w-3xl text-center text-4xl font-semibold tracking-tight text-balance text-slate-900 sm:text-5xl sm:leading-tight">
              Your Korea Trip,{" "}
              <span className="text-teal-600">Planned by an Expert</span>
            </h1>
            <p className="mx-auto mt-5 max-w-xl text-center text-lg leading-relaxed text-pretty text-slate-600">
              Skip the tourist traps. Get a personalized Korea itinerary built by local insiders — in seconds.
            </p>

            <div className="mt-10 flex flex-col items-center gap-3">
              <Link
                href="/plan"
                className="inline-flex items-center gap-2 rounded-2xl bg-teal-600 px-8 py-4 text-base font-bold text-white shadow-md transition hover:bg-teal-700 hover:shadow-lg active:scale-95"
              >
                Plan My Korea Trip
                <svg className="size-5" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M10.293 3.293a1 1 0 011.414 0l6 6a1 1 0 010 1.414l-6 6a1 1 0 01-1.414-1.414L14.586 11H3a1 1 0 110-2h11.586l-4.293-4.293a1 1 0 010-1.414z" clipRule="evenodd" />
                </svg>
              </Link>
              <p className="text-sm text-slate-400">
                Free · No sign-up required · Built for you
              </p>
            </div>
          </div>
        </section>

        <section id="categories" className="border-b border-zinc-200 bg-zinc-50 py-16 sm:py-20">
          <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
            <div className="max-w-2xl">
              <h2 className="text-2xl font-semibold tracking-tight text-slate-900 sm:text-3xl">
                Browse by category
              </h2>
              <p className="mt-3 text-slate-600">
                Pick a topic and dig into curated articles—no fluff, just what helps you move through Korea
                comfortably.
              </p>
            </div>
            <ul className="mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
              {categories.map((cat) => (
                <li key={cat.title}>
                  <Link
                    href={cat.href}
                    className="group flex h-full flex-col rounded-2xl border border-zinc-200 bg-white p-6 shadow-sm transition hover:-translate-y-0.5 hover:border-teal-200 hover:shadow-md"
                  >
                    <span className="inline-flex size-11 items-center justify-center rounded-xl bg-teal-50 text-teal-800 ring-1 ring-teal-100 transition group-hover:bg-teal-100">
                      {cat.icon}
                    </span>
                    <h3 className="mt-4 text-lg font-semibold text-slate-900">{cat.title}</h3>
                    <p className="mt-2 flex-1 text-sm leading-relaxed text-slate-600">{cat.description}</p>
                    <span className="mt-4 inline-flex items-center gap-1 text-sm font-semibold text-teal-800">
                      View articles
                      <svg className="size-4 transition group-hover:translate-x-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
                      </svg>
                    </span>
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </section>

        <section id="blog" className="bg-white py-16 sm:py-20">
          <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
            <div className="flex flex-col items-start justify-between gap-6 sm:flex-row sm:items-end">
              <div className="max-w-2xl">
                <h2 className="text-2xl font-semibold tracking-tight text-slate-900 sm:text-3xl">
                  Latest from the blog
                </h2>
                <p className="mt-3 text-slate-600">
                  Fresh guides and field notes—updated regularly as Korea’s seasons and scenes shift.
                </p>
              </div>
              <Link
                href="/blog"
                className="inline-flex items-center gap-1 text-sm font-semibold text-teal-800 hover:text-teal-900"
              >
                View all posts
                <svg className="size-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
                </svg>
              </Link>
            </div>

            <ul className="mt-10 grid gap-6 lg:grid-cols-3">
              {featuredPosts.map((post) => (
                <li key={post.id}>
                  <article className="flex h-full flex-col overflow-hidden rounded-2xl border border-zinc-200 bg-zinc-50 shadow-sm transition hover:shadow-md">
                    <Link
                      href={`/blog/${post.id}`}
                      className="group relative block aspect-[16/10] overflow-hidden"
                      aria-label={`Read ${decodeHtmlEntities(post.title)}`}
                    >
                      <BlogCardThumbnail post={post} />
                    </Link>
                    <div className="flex flex-1 flex-col p-6">
                      <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-xs font-medium text-slate-500">
                        <time dateTime={post.dateIso}>{post.date}</time>
                        <span aria-hidden>·</span>
                        <span>{post.readTime}</span>
                      </div>
                      <h3 className="mt-3 text-lg font-semibold leading-snug text-slate-900">
                        <Link href={`/blog/${post.id}`} className="hover:text-teal-800">
                          {decodeHtmlEntities(post.title)}
                        </Link>
                      </h3>
                      <p className="mt-2 flex-1 text-sm leading-relaxed text-slate-600">
                        {decodeHtmlEntities(post.excerpt)}
                      </p>
                      <Link
                        href={`/blog/${post.id}`}
                        className="mt-4 inline-flex text-sm font-semibold text-teal-800 hover:text-teal-900"
                      >
                        Read article
                      </Link>
                    </div>
                  </article>
                </li>
              ))}
            </ul>
          </div>
        </section>
      </main>

      <footer className="border-t border-zinc-200 bg-zinc-50 py-8">
        <div className="mx-auto flex max-w-6xl flex-col items-center justify-between gap-4 px-4 text-sm text-slate-500 sm:flex-row sm:px-6 lg:px-8">
          <p>© {new Date().getFullYear()} InsideKoreaNow. For international travelers.</p>
          <nav className="flex gap-4" aria-label="Footer">
            <Link href="/privacy" className="hover:text-slate-800">
              Privacy
            </Link>
            <Link href="/contact" className="hover:text-slate-800">
              Contact
            </Link>
          </nav>
        </div>
      </footer>
    </div>
  );
}
