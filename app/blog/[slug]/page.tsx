import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { BLOG_POSTS, getCategoryLabel } from "@/lib/blog-posts";
import { decodeHtmlEntities } from "@/lib/html";
import { SITE_NAME } from "@/lib/site";

type Props = { params: Promise<{ slug: string }> };

export async function generateStaticParams() {
  return BLOG_POSTS.map((p) => ({ slug: p.id }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const post = BLOG_POSTS.find((p) => p.id === slug);
  if (!post) return { title: "Post — InsideKoreaNow" };
  const title = decodeHtmlEntities(post.title);
  const description = decodeHtmlEntities(post.excerpt);
  const url = `/blog/${post.id}`;
  const images = post.thumbnailUrl ? [{ url: post.thumbnailUrl, alt: title }] : undefined;

  return {
    title,
    description,
    alternates: {
      canonical: url,
    },
    openGraph: {
      type: "article",
      url,
      siteName: SITE_NAME,
      title,
      description,
      publishedTime: `${post.dateIso}T00:00:00.000Z`,
      authors: [SITE_NAME],
      tags: [getCategoryLabel(post.category)],
      images,
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
      images: post.thumbnailUrl ? [post.thumbnailUrl] : undefined,
    },
  };
}

const CATEGORY_CTA: Record<string, { headline: string; sub: string; emoji: string }> = {
  "k-food": {
    headline: "Ready to eat your way through Korea?",
    sub: "Get a personalised food itinerary with insider tips — restaurants, markets, and hidden stalls picked just for you.",
    emoji: "🍜",
  },
  "k-culture": {
    headline: "Want to experience this for yourself?",
    sub: "Build a K-culture itinerary with fan cafés, concert venues, and filming locations tailored to your interests.",
    emoji: "🎤",
  },
  travel: {
    headline: "Planning a trip to Korea?",
    sub: "Skip the generic guides. Get a personalised day-by-day itinerary built around your style, budget, and must-sees.",
    emoji: "✈️",
  },
  living: {
    headline: "Visiting Korea soon?",
    sub: "Turn your research into a real itinerary — expert-curated stops, local tips, and a plan that fits your life.",
    emoji: "🏠",
  },
};

export default async function BlogPostPage({ params }: Props) {
  const { slug } = await params;
  const post = BLOG_POSTS.find((p) => p.id === slug);
  if (!post) notFound();

  const title = decodeHtmlEntities(post.title);
  const excerpt = decodeHtmlEntities(post.excerpt);
  const cta = CATEGORY_CTA[post.category] ?? CATEGORY_CTA.travel;

  return (
    <article className="border-b border-zinc-200 bg-white pb-16 pt-10 sm:pt-14">
      <div className="mx-auto max-w-3xl px-4 sm:px-6 lg:px-8">
        <Link
          href="/blog"
          className="inline-flex items-center gap-1 text-sm font-semibold text-teal-800 hover:text-teal-900"
        >
          <svg className="size-4 rotate-180" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
          </svg>
          Back to blog
        </Link>
        <header className="mt-8">
          <div className="flex flex-wrap items-center gap-2 text-sm text-slate-500">
            <time dateTime={post.dateIso}>{post.date}</time>
            <span aria-hidden>·</span>
            <span>{post.readTime}</span>
            {post.category !== "uncategorized" ? (
              <>
                <span aria-hidden>·</span>
                <span className="rounded-md bg-zinc-100 px-2 py-0.5 font-medium text-slate-600">
                  {getCategoryLabel(post.category)}
                </span>
              </>
            ) : null}
          </div>
          <h1 className="mt-4 text-3xl font-semibold tracking-tight text-slate-900 sm:text-4xl">{title}</h1>
          {excerpt ? <p className="mt-4 text-lg leading-relaxed text-slate-600">{excerpt}</p> : null}
        </header>

        <div
          className="wp-post-content entry-content mt-10 text-base leading-relaxed text-slate-800"
          dangerouslySetInnerHTML={{ __html: post.contentHtml }}
        />

        {/* Plan CTA */}
        <div className="mt-14 rounded-2xl bg-gradient-to-br from-teal-600 to-teal-800 p-8 text-white">
          <div className="flex items-start gap-4">
            <span className="text-4xl shrink-0">{cta.emoji}</span>
            <div className="flex-1">
              <h2 className="text-xl font-bold leading-snug">{cta.headline}</h2>
              <p className="mt-2 text-sm leading-relaxed text-teal-100">{cta.sub}</p>
              <div className="mt-5 flex flex-col gap-3 sm:flex-row sm:items-center">
                <Link
                  href="/plan"
                  className="inline-flex items-center justify-center gap-2 rounded-xl bg-white px-6 py-3 text-sm font-bold text-teal-700 shadow-sm transition hover:bg-teal-50 active:scale-95"
                >
                  Plan My Korea Trip
                  <svg className="size-4" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M10.293 3.293a1 1 0 011.414 0l6 6a1 1 0 010 1.414l-6 6a1 1 0 01-1.414-1.414L14.586 11H3a1 1 0 110-2h11.586l-4.293-4.293a1 1 0 010-1.414z" clipRule="evenodd" />
                  </svg>
                </Link>
                <p className="text-xs text-teal-300">Free · No sign-up · Ready in ~15 seconds</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </article>
  );
}
