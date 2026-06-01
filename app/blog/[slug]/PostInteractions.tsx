"use client";

import { useEffect, useRef, useState } from "react";
import { getSupabaseBrowser } from "@/lib/supabase-browser";

// ── View counter ────────────────────────────────────────────────────────────

export function PostViewCounter({ slug }: { slug: string }) {
  const [count, setCount] = useState<number | null>(null);
  const ran = useRef(false);

  useEffect(() => {
    if (ran.current) return;
    ran.current = true;

    // Only count once per browser session per post
    const key = `viewed:${slug}`;
    const method = sessionStorage.getItem(key) ? "GET" : "POST";
    sessionStorage.setItem(key, "1");

    const url = `/api/blog/views/${slug}`;
    if (method === "POST") {
      fetch(url, { method: "POST" })
        .then((r) => r.json())
        .then((d) => setCount(d.count))
        .catch(() => null);
    } else {
      fetch(url)
        .then((r) => r.json())
        .then((d) => setCount(d.count))
        .catch(() => null);
    }
  }, [slug]);

  if (count === null) return null;

  return (
    <span className="inline-flex items-center gap-1 text-slate-400">
      <svg className="size-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M2.036 12.322a1.012 1.012 0 010-.639C3.423 7.51 7.36 4.5 12 4.5c4.638 0 8.573 3.007 9.963 7.178.07.207.07.431 0 .639C20.577 16.49 16.64 19.5 12 19.5c-4.638 0-8.573-3.007-9.964-7.178z" />
        <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
      </svg>
      {count.toLocaleString()}
    </span>
  );
}

// ── Comments ────────────────────────────────────────────────────────────────

interface Comment {
  id: string;
  user_email: string;
  content: string;
  created_at: string;
}

interface SupabaseUser {
  id: string;
  email?: string;
}

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
}

function avatar(email: string) {
  return email.slice(0, 2).toUpperCase();
}

export function CommentsSection({ slug }: { slug: string }) {
  const [comments, setComments] = useState<Comment[]>([]);
  const [user, setUser] = useState<SupabaseUser | null>(null);
  const [text, setText] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    const sb = getSupabaseBrowser();
    sb.auth.getUser().then(({ data }) => setUser(data.user ?? null));

    sb.from("comments")
      .select("id, user_email, content, created_at")
      .eq("post_slug", slug)
      .order("created_at", { ascending: true })
      .then(({ data }) => { if (data) setComments(data as Comment[]); });
  }, [slug]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!text.trim()) return;
    setSubmitting(true);
    setError("");

    const sb = getSupabaseBrowser();
    const { data: { user: u } } = await sb.auth.getUser();
    if (!u) { setError("Please sign in to comment."); setSubmitting(false); return; }

    const { error: err } = await sb.from("comments").insert({
      post_slug: slug,
      user_id: u.id,
      user_email: u.email ?? "anonymous",
      content: text.trim(),
    });

    if (err) {
      setError("Couldn't post the comment. Please try again.");
    } else {
      setText("");
      const sb2 = getSupabaseBrowser();
      const { data } = await sb2
        .from("comments")
        .select("id, user_email, content, created_at")
        .eq("post_slug", slug)
        .order("created_at", { ascending: true });
      if (data) setComments(data as Comment[]);
    }
    setSubmitting(false);
  }

  async function handleDelete(id: string) {
    const sb = getSupabaseBrowser();
    await sb.from("comments").delete().eq("id", id);
    setComments((prev) => prev.filter((c) => c.id !== id));
  }

  return (
    <section className="mt-14 border-t border-zinc-200 pt-10">
      <h2 className="text-lg font-semibold text-slate-900">
        Comments
        {comments.length > 0 && (
          <span className="ml-2 rounded-full bg-zinc-100 px-2.5 py-0.5 text-sm font-normal text-slate-500">
            {comments.length}
          </span>
        )}
      </h2>

      {/* Comment list */}
      {comments.length === 0 ? (
        <p className="mt-4 text-sm text-slate-400">No comments yet — be the first!</p>
      ) : (
        <ul className="mt-5 space-y-5">
          {comments.map((c) => (
            <li key={c.id} className="flex gap-3">
              <div className="flex size-8 shrink-0 items-center justify-center rounded-full bg-teal-100 text-xs font-semibold text-teal-800">
                {avatar(c.user_email)}
              </div>
              <div className="flex-1 rounded-xl bg-zinc-50 px-4 py-3 text-sm">
                <div className="flex items-center justify-between gap-2">
                  <span className="font-medium text-slate-700">{c.user_email}</span>
                  <div className="flex items-center gap-2">
                    <time className="text-xs text-slate-400">{formatDate(c.created_at)}</time>
                    {user?.email === c.user_email && (
                      <button
                        onClick={() => handleDelete(c.id)}
                        className="text-xs text-red-400 hover:text-red-600"
                        aria-label="Delete comment"
                      >
                        Delete
                      </button>
                    )}
                  </div>
                </div>
                <p className="mt-1.5 whitespace-pre-wrap text-slate-600">{c.content}</p>
              </div>
            </li>
          ))}
        </ul>
      )}

      {/* Comment form */}
      <div className="mt-8">
        {user ? (
          <form onSubmit={handleSubmit} className="space-y-3">
            <p className="text-sm text-slate-500">
              Commenting as <span className="font-medium text-slate-700">{user.email}</span>
            </p>
            {error && (
              <p className="rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700">{error}</p>
            )}
            <textarea
              value={text}
              onChange={(e) => setText(e.target.value)}
              placeholder="Share your thoughts..."
              rows={3}
              className="w-full resize-none rounded-xl border border-zinc-200 bg-white px-3.5 py-2.5 text-sm text-slate-900 placeholder:text-slate-400 focus:border-teal-500 focus:outline-none focus:ring-2 focus:ring-teal-500/20"
            />
            <button
              type="submit"
              disabled={submitting || !text.trim()}
              className="rounded-xl bg-teal-600 px-5 py-2 text-sm font-semibold text-white shadow-sm transition hover:bg-teal-700 disabled:opacity-50"
            >
              {submitting ? "Posting…" : "Post comment"}
            </button>
          </form>
        ) : (
          <div className="rounded-xl border border-zinc-200 bg-zinc-50 px-5 py-4 text-sm text-slate-500">
            <a href="/login" className="font-semibold text-teal-700 hover:underline">Sign in</a>{" "}
            to leave a comment.
          </div>
        )}
      </div>
    </section>
  );
}
