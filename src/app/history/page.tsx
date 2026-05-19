import Link from "next/link";
import { desc, eq } from "drizzle-orm";

import { db } from "@/db";
import { cvReviews } from "@/db/schema";
import { getCurrentUser } from "@/lib/session";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Metadata } from "next";
import { SiteHeader } from "@/components/layout/site-header";

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

  return (
    <main className="min-h-screen bg-background text-foreground">
      <SiteHeader backHref="/review" backLabel="Review CV baru" />

      <section className="mx-auto w-full max-w-5xl px-5 py-10">
        <h1 className="text-3xl font-semibold tracking-tight text-slate-950">
          Riwayat Review CV
        </h1>
        <p className="mt-2 text-sm text-slate-600">
          Menampilkan hasil review yang tersimpan di akun Anda.
        </p>

        <div className="mt-6 grid gap-4">
          {reviews.length > 0 ? (
            reviews.map((review) => (
              <Link key={review.id} href={`/review/${review.id}`}>
                <Card className="micro-lift bg-white">
                  <CardContent className="flex flex-col gap-3 p-5 sm:flex-row sm:items-center sm:justify-between">
                    <div>
                      <p className="font-semibold text-slate-950">
                        {review.targetRole}
                      </p>
                      <p className="mt-1 text-sm text-muted-foreground">
                        {new Intl.DateTimeFormat("id-ID", {
                          dateStyle: "medium",
                          timeStyle: "short",
                        }).format(review.createdAt)}
                      </p>
                    </div>

                    <div className="text-left sm:text-right">
                      <p className="text-sm text-muted-foreground">Skor</p>
                      <p className="text-2xl font-semibold text-primary">
                        {review.overallScore}
                      </p>
                    </div>
                  </CardContent>
                </Card>
              </Link>
            ))
          ) : (
            <Card className="bg-white">
              <CardContent className="p-6">
                <p className="text-sm text-slate-600">
                  Belum ada riwayat review.
                </p>
              </CardContent>
            </Card>
          )}
        </div>
      </section>
    </main>
  );
}
