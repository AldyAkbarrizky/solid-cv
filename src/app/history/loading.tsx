import { SiteHeader } from "@/components/layout/site-header";

function SkeletonBlock({ className = "" }: { className?: string }) {
  return <div className={`animate-pulse rounded-lg bg-slate-100 ${className}`} />;
}

export default function HistoryLoading() {
  return (
    <main className="min-h-screen bg-background text-foreground">
      <SiteHeader backHref="/review" backLabel="Review CV baru" />

      <section className="mx-auto w-full max-w-6xl px-5 py-10 md:py-14">
        <div className="grid gap-5 md:grid-cols-[1fr_auto] md:items-end">
          <div className="max-w-3xl">
            <SkeletonBlock className="h-4 w-36" />
            <SkeletonBlock className="mt-3 h-12 w-80 max-w-full" />
            <SkeletonBlock className="mt-4 h-5 w-full max-w-2xl" />
          </div>
          <div className="flex gap-2">
            <SkeletonBlock className="h-11 w-32" />
            <SkeletonBlock className="h-11 w-32" />
          </div>
        </div>

        <div className="mt-8 grid gap-4 md:grid-cols-3">
          {Array.from({ length: 3 }).map((_, index) => (
            <div
              key={index}
              className="rounded-lg border border-slate-200 bg-white p-5"
            >
              <SkeletonBlock className="h-4 w-28" />
              <SkeletonBlock className="mt-4 h-9 w-20" />
              <SkeletonBlock className="mt-2 h-4 w-32" />
            </div>
          ))}
        </div>

        <div className="mt-5 rounded-lg border border-slate-200 bg-white p-5">
          <SkeletonBlock className="h-10 w-full" />
          <div className="mt-4 flex gap-2">
            {Array.from({ length: 5 }).map((_, index) => (
              <SkeletonBlock key={index} className="h-7 w-16 rounded-full" />
            ))}
          </div>
        </div>

        <div className="mt-5 grid gap-4">
          {Array.from({ length: 4 }).map((_, index) => (
            <SkeletonBlock key={index} className="h-32 w-full" />
          ))}
        </div>
      </section>
    </main>
  );
}
