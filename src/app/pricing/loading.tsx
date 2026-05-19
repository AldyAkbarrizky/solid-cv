import { SiteHeader } from "@/components/layout/site-header";

function SkeletonBlock({ className = "" }: { className?: string }) {
  return <div className={`animate-pulse rounded-lg bg-slate-100 ${className}`} />;
}

export default function PricingLoading() {
  return (
    <main className="min-h-screen bg-background text-foreground">
      <SiteHeader backHref="/review" backLabel="Review CV" />

      <section className="mx-auto w-full max-w-6xl px-5 py-10 md:py-14">
        <div className="grid gap-6 lg:grid-cols-[1.05fr_0.95fr] lg:items-end">
          <div className="max-w-3xl">
            <SkeletonBlock className="h-4 w-32" />
            <SkeletonBlock className="mt-3 h-12 w-full max-w-xl" />
            <SkeletonBlock className="mt-4 h-5 w-full max-w-2xl" />
            <SkeletonBlock className="mt-2 h-5 w-10/12 max-w-xl" />
          </div>

          <div className="rounded-lg border border-slate-200 bg-white p-5">
            <SkeletonBlock className="h-7 w-40" />
            <div className="mt-5 grid gap-3 sm:grid-cols-3">
              <SkeletonBlock className="h-20 w-full" />
              <SkeletonBlock className="h-20 w-full" />
              <SkeletonBlock className="h-20 w-full" />
            </div>
            <SkeletonBlock className="mt-4 h-2 w-full rounded-full" />
          </div>
        </div>

        <div className="mt-8 grid gap-4 md:grid-cols-3">
          {Array.from({ length: 3 }).map((_, index) => (
            <div
              key={index}
              className="rounded-lg border border-slate-200 bg-white p-6"
            >
              <SkeletonBlock className="h-4 w-20" />
              <SkeletonBlock className="mt-4 h-10 w-36" />
              <SkeletonBlock className="mt-5 h-16 w-full" />
              <SkeletonBlock className="mt-5 h-32 w-full" />
              <SkeletonBlock className="mt-6 h-11 w-full" />
            </div>
          ))}
        </div>
      </section>
    </main>
  );
}
