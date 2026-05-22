"use client";

import Link from "next/link";
import { useEffect, useRef, useState, Suspense } from "react";
import { AuthButton } from "./AuthButton";

export function SiteHeader() {
  const [menuOpen, setMenuOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  // Close on outside tap
  useEffect(() => {
    if (!menuOpen) return;
    function handleClick(e: MouseEvent | TouchEvent) {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setMenuOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClick);
    document.addEventListener("touchstart", handleClick);
    return () => {
      document.removeEventListener("mousedown", handleClick);
      document.removeEventListener("touchstart", handleClick);
    };
  }, [menuOpen]);

  return (
    <header className="sticky top-0 z-50 border-b border-zinc-200/80 bg-white/80 backdrop-blur-md">
      <div className="mx-auto flex h-16 max-w-6xl items-center justify-between gap-4 px-4 sm:px-6 lg:px-8">
        <Link href="/" className="shrink-0 flex items-baseline gap-1 font-semibold tracking-tight">
          <span className="text-lg text-slate-900">Inside</span>
          <span className="text-lg text-teal-700">Korea</span>
          <span className="text-lg text-slate-900">Now</span>
        </Link>

        <nav className="hidden flex-1 items-center gap-2 md:flex" aria-label="Main">
          <Link
            href="/plan"
            className="rounded-full bg-teal-700 px-4 py-2 text-sm font-semibold text-white shadow-sm transition hover:bg-teal-800"
          >
            Plan a trip
          </Link>
          <Link
            href="/blog"
            className="rounded-lg px-3 py-2 text-sm font-medium text-slate-600 transition hover:bg-zinc-100 hover:text-slate-900"
          >
            Guides
          </Link>
        </nav>

        <div className="flex flex-1 items-center justify-end gap-2 md:flex-none">
          <div className="hidden sm:flex items-center">
            <Suspense fallback={
              <Link href="/login" className="rounded-lg px-3 py-2 text-sm font-medium text-slate-400">Sign in</Link>
            }>
              <AuthButton />
            </Suspense>
          </div>

          {/* Mobile menu */}
          <div ref={menuRef} className="relative md:hidden">
            <button
              onClick={() => setMenuOpen((o) => !o)}
              className="cursor-pointer rounded-lg border border-zinc-200 bg-white px-3 py-2 text-sm font-medium text-slate-700 shadow-sm"
              aria-expanded={menuOpen}
              aria-label="Menu"
            >
              Menu
            </button>

            {menuOpen && (
              <div
                className="absolute right-0 z-50 mt-2 w-52 overflow-hidden rounded-xl border border-zinc-200 bg-white py-2 shadow-lg"
                onClick={() => setMenuOpen(false)}
              >
                <Link
                  href="/plan"
                  className="block px-4 py-2.5 text-sm font-semibold text-teal-800 hover:bg-zinc-50"
                >
                  Plan a trip
                </Link>
                <Link
                  href="/blog"
                  className="block px-4 py-2.5 text-sm text-slate-700 hover:bg-zinc-50"
                >
                  Guides
                </Link>
                <Suspense fallback={
                  <Link href="/login" className="block px-4 py-2.5 text-sm text-slate-700 hover:bg-zinc-50">Sign in</Link>
                }>
                  <AuthButton mobile />
                </Suspense>
              </div>
            )}
          </div>
        </div>
      </div>
    </header>
  );
}
