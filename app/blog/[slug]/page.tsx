import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { BLOG_POSTS, getCategoryLabel } from "@/lib/blog-posts";

type Props = { params: Promise<{ slug: string }> };

export async function generateStaticParams() {
  return BLOG_POSTS.map((p) => ({ slug: p.id }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const post = BLOG_POSTS.find((p) => p.id === slug);
  if (!post) return { title: "Post — InsideKoreaNow" };
  return {
    title: `${post.title} — InsideKoreaNow`,
    description: post.excerpt,
  };
}

export default async function BlogPostPage({ params }: Props) {
  const { slug } = await params;
  const post = BLOG_POSTS.find((p) => p.id === slug);
  if (!post) notFound();

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
          <h1 className="mt-4 text-3xl font-semibold tracking-tight text-slate-900 sm:text-4xl">{post.title}</h1>
          <p className="mt-4 text-lg leading-relaxed text-slate-600">{post.excerpt}</p>
        </header>
        <div
          className={`relative mt-10 aspect-[2/1] overflow-hidden rounded-2xl bg-gradient-to-br ${post.gradient}`}
        >
          <div className="absolute inset-0 bg-[url('data:image/svg+xml,%3Csvg%20width%3D%2260%22%20height%3D%2260%22%20viewBox%3D%220%200%2060%2060%22%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%3E%3Cg%20fill%3D%22none%22%20fill-rule%3D%22evenodd%22%3E%3Cg%20fill%3D%22%23ffffff%22%20fill-opacity%3D%220.08%22%3E%3Cpath%20d%3D%22M36%2034v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6%2034v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6%204V0H4v4H0v2h4v4h2V6h4V4H6z%22%2F%3E%3C%2Fg%3E%3C%2Fg%3E%3C%2Fsvg%3E')]" />
        </div>
        <div className="prose prose-slate mt-10 max-w-none">
          <p className="text-slate-600">
            Full article content will go here. This placeholder page exists so links from the blog index work
            while you wire up CMS or MDX.
          </p>
        </div>
      </div>
    </article>
  );
}
