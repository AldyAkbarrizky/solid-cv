import { SiteHeader } from "@/components/layout/site-header";

function SkeletonBlock({ className = "" }: { className?: string }) {
  return <div className={`animate-pulse rounded-lg bg-slate-100 ${className}`} />;
}

export default function ReviewResultLoading() {
  return (
    <main className="min-h-screen bg-background text-foreground">
      <SiteHeader backHref="/review" backLabel="Review CV lain" />

      <section className="mx-auto w-full max-w-6xl px-5 py-8 md:py-12">
        <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
          <div className="w-full max-w-2xl">
            <SkeletonBlock className="h-4 w-32" />
            <SkeletonBlock className="mt-3 h-10 w-full" />
          </div>
          <div className="flex gap-2">
            <SkeletonBlock className="h-8 w-28" />
            <SkeletonBlock className="h-8 w-32" />
          </div>
        </div>

        <div className="grid gap-6 lg:grid-cols-[360px_1fr]">
          <div className="rounded-lg border border-slate-200 bg-white p-6">
            <SkeletonBlock className="mx-auto h-44 w-44 rounded-full" />
            <SkeletonBlock className="mx-auto mt-6 h-6 w-32" />
            <SkeletonBlock className="mt-6 h-24 w-full" />
            <SkeletonBlock className="mt-5 h-16 w-full" />
          </div>

          <div className="grid gap-6">
            <div className="rounded-lg border border-slate-200 bg-white p-6">
              <SkeletonBlock className="h-5 w-44" />
              <SkeletonBlock className="mt-5 h-4 w-full" />
              <SkeletonBlock className="mt-3 h-4 w-11/12" />
              <SkeletonBlock className="mt-3 h-4 w-10/12" />
              <div className="mt-6 grid gap-3 sm:grid-cols-2">
                <SkeletonBlock className="h-24 w-full" />
                <SkeletonBlock className="h-24 w-full" />
              </div>
            </div>

            <div className="rounded-lg border border-slate-200 bg-white p-6">
              <SkeletonBlock className="h-7 w-40" />
              <div className="mt-5 grid gap-4">
                {Array.from({ length: 5 }).map((_, index) => (
                  <SkeletonBlock key={index} className="h-16 w-full" />
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}
