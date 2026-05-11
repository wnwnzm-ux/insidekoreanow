"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { BlogCardThumbnail } from "@/app/components/BlogCardThumbnail";
import {
  BLOG_CATEGORY_FILTERS,
  type BlogFilterId,
  filterBlogPosts,
  getCategoryLabel,
} from "@/lib/blog-posts";
import { decodeHtmlEntities } from "@/lib/html";

export function BlogIndexClient() {
  const [active, setActive] = useState<BlogFilterId>("all");
  const posts = useMemo(() => filterBlogPosts(active), [active]);

  return (
    <div className="bg-zinc-50 pb-20 pt-10 sm:pt-14">
      <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
        <div className="max-w-2xl">
          <h1 className="text-3xl font-semibold tracking-tight text-slate-900 sm:text-4xl">Blog</h1>
          <p className="mt-3 text-lg leading-relaxed text-slate-600">
            Guides and notes for visiting or living in Korea—pick a topic to narrow the list.
          </p>
        </div>

        <div
          className="mt-10 flex flex-col gap-3 border-b border-zinc-200 pb-8"
          role="tablist"
          aria-label="Blog categories"
        >
          <div className="flex flex-wrap gap-2">
            {BLOG_CATEGORY_FILTERS.map((cat) => {
              const selected = active === cat.id;
              return (
                <button
                  key={cat.id}
                  type="button"
                  role="tab"
                  aria-selected={selected}
                  onClick={() => setActive(cat.id)}
                  className={`rounded-full border px-4 py-2 text-left text-sm font-medium transition ${
                    selected
                      ? "border-teal-700 bg-teal-700 text-white shadow-sm"
                      : "border-zinc-200 bg-white text-slate-700 hover:border-teal-200 hover:bg-teal-50/60"
                  }`}
                >
                  {cat.label}
                </button>
              );
            })}
          </div>
          <p className="text-sm text-slate-500">
            {BLOG_CATEGORY_FILTERS.find((c) => c.id === active)?.sublabel}
          </p>
        </div>

        {posts.length === 0 ? (
          <p className="mt-12 text-center text-slate-600">No posts in this category yet.</p>
        ) : (
          <ul className="mt-10 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {posts.map((post) => (
              <li key={post.id}>
                <article className="flex h-full flex-col overflow-hidden rounded-2xl border border-zinc-200 bg-white shadow-sm transition hover:shadow-md">
                  <Link
                    href={`/blog/${post.id}`}
                    className="group relative block aspect-[16/10] overflow-hidden"
                    aria-label={`Read ${decodeHtmlEntities(post.title)}`}
                  >
                    <BlogCardThumbnail post={post} />
                  </Link>
                  <div className="flex flex-1 flex-col p-6">
                    <div className="flex flex-wrap items-center gap-2 text-xs font-medium text-slate-500">
                      <time dateTime={post.dateIso}>{post.date}</time>
                      <span aria-hidden>·</span>
                      <span>{post.readTime}</span>
                      {post.category !== "uncategorized" ? (
                        <>
                          <span aria-hidden>·</span>
                          <span className="rounded-md bg-zinc-100 px-2 py-0.5 text-slate-600">
                            {getCategoryLabel(post.category)}
                          </span>
                        </>
                      ) : null}
                    </div>
                    <h2 className="mt-3 text-lg font-semibold leading-snug text-slate-900">
                      <Link href={`/blog/${post.id}`} className="hover:text-teal-800">
                        {decodeHtmlEntities(post.title)}
                      </Link>
                    </h2>
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
        )}
      </div>
    </div>
  );
}
