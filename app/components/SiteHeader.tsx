import Link from "next/link";

const mobileNavClass =
  "block px-4 py-2.5 text-sm text-slate-700 hover:bg-zinc-50";

export function SiteHeader() {
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
            Blog
          </Link>
        </nav>

        <div className="flex flex-1 items-center justify-end gap-2 md:flex-none">
          <Link
            href="#"
            className="hidden rounded-lg px-3 py-2 text-sm font-medium text-slate-600 transition hover:text-slate-900 sm:inline"
          >
            Sign in
          </Link>

          <details className="relative md:hidden">
            <summary className="cursor-pointer list-none rounded-lg border border-zinc-200 bg-white px-3 py-2 text-sm font-medium text-slate-700 shadow-sm [&::-webkit-details-marker]:hidden">
              Menu
            </summary>
            <div className="absolute right-0 z-50 mt-2 w-52 overflow-hidden rounded-xl border border-zinc-200 bg-white py-2 shadow-lg">
              <Link href="/plan" className={`${mobileNavClass} font-semibold text-teal-800`}>
                Plan a trip
              </Link>
              <Link href="/blog" className={mobileNavClass}>
                Blog
              </Link>
              <Link href="#" className={mobileNavClass}>
                Sign in
              </Link>
            </div>
          </details>
        </div>
      </div>
    </header>
  );
}
