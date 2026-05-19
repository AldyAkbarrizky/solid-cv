import Link from "next/link";
import { desc, eq } from "drizzle-orm";

import { db } from "@/db";
import { cvReviews } from "@/db/schema";
import { getCurrentUser } from "@/lib/session";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Metadata } from "next";
import { SiteHeader } from "@/components/layout/site-header";
import { HistoryReviewList } from "./history-review-list";

export const metadata: Metadata = {
  title: "Riwayat Review - Solid CV",
  description: "Lihat riwayat hasil review CV yang tersimpan di akun Anda.",
  robots: {
    index: false,
    follow: false,
  },
};

export default async function HistoryPage() {
  const user = await getCurrentUser();

  if (!user) {
    return (
      <main className="min-h-screen bg-background text-foreground">
        <SiteHeader />

        <section className="flex min-h-[calc(100vh-72px)] items-center justify-center px-5">
          <Card className="w-full max-w-md bg-white">
            <CardContent className="p-6 text-center">
              <h1 className="text-xl font-semibold text-slate-950">
                Masuk diperlukan
              </h1>
              <p className="mt-2 text-sm leading-6 text-slate-600">
                Masuk terlebih dahulu untuk melihat riwayat review CV.
              </p>
              <Button asChild className="mt-5">
                <Link href="/login">Masuk</Link>
              </Button>
            </CardContent>
          </Card>
        </section>
      </main>
    );
  }

  const reviews = await db
    .select()
    .from(cvReviews)
    .where(eq(cvReviews.userId, user.id))
    .orderBy(desc(cvReviews.createdAt))
    .limit(20);

  const reviewItems = reviews.map((review) => ({
    id: review.id,
    targetRole: review.targetRole,
    overallScore: review.overallScore,
    createdAt: review.createdAt.toISOString(),
    createdAtLabel: new Intl.DateTimeFormat("id-ID", {
      dateStyle: "medium",
      timeStyle: "short",
    }).format(review.createdAt),
    aiProvider: review.aiProvider,
    aiModel: review.aiModel,
  }));

  return (
    <main className="min-h-screen bg-background text-foreground">
      <SiteHeader backHref="/review" backLabel="Review CV baru" />

      <section className="mx-auto w-full max-w-6xl px-5 py-10 md:py-14">
        <div className="grid gap-5 md:grid-cols-[1fr_auto] md:items-end">
          <div className="max-w-3xl">
            <p className="text-sm font-medium text-primary">
              Riwayat tersimpan
            </p>
            <h1 className="mt-3 text-3xl font-semibold tracking-tight text-slate-950 md:text-5xl md:leading-tight">
              Riwayat Review CV
            </h1>
            <p className="mt-4 text-base leading-7 text-slate-600">
              Cari hasil review lama, bandingkan skor antar posisi, dan buka
              kembali rekomendasi yang pernah dibuat.
            </p>
          </div>

          <Button asChild className="h-11">
            <Link href="/review">Review CV baru</Link>
          </Button>
        </div>

        {reviewItems.length > 0 ? (
          <HistoryReviewList reviews={reviewItems} />
        ) : (
          <Card className="mt-8 rounded-lg bg-white shadow-sm">
            <CardContent className="p-6 text-center">
              <p className="font-semibold text-slate-950">
                Belum ada riwayat review.
              </p>
              <p className="mt-2 text-sm leading-6 text-slate-600">
                Setelah analisis CV selesai, hasilnya akan muncul di halaman
                ini.
              </p>
              <Button asChild className="mt-5">
                <Link href="/review">Mulai review pertama</Link>
              </Button>
            </CardContent>
          </Card>
        )}
      </section>
    </main>
  );
}
