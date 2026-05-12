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

export default async function BlogPostPage({ params }: Props) {
  const { slug } = await params;
  const post = BLOG_POSTS.find((p) => p.id === slug);
  if (!post) notFound();

  const title = decodeHtmlEntities(post.title);
  const excerpt = decodeHtmlEntities(post.excerpt);

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
      </div>
    </article>
  );
}
