import { notFound } from "next/navigation";
import { eq } from "drizzle-orm";
import { AlertTriangle, CheckCircle2, Lightbulb, Target } from "lucide-react";

import { db } from "@/db";
import { cvReviews } from "@/db/schema";
import { CVReviewResult } from "@/lib/ai/cv-review-types";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import { isReviewExpired } from "@/lib/review/retention";
import { DeleteReviewButton } from "./delete-review-button";
import { getCurrentUser } from "@/lib/session";
import { SiteHeader } from "@/components/layout/site-header";
import { Metadata } from "next";

type ReviewResultPageProps = {
  params: Promise<{
    id: string;
  }>;
};

function getPriorityLabel(priority: "high" | "medium" | "low") {
  if (priority === "high") return "Prioritas tinggi";
  if (priority === "medium") return "Prioritas sedang";
  return "Prioritas rendah";
}

function getScoreLabel(score: number) {
  if (score >= 80) return "Kuat";
  if (score >= 65) return "Cukup baik";
  if (score >= 50) return "Perlu diperbaiki";
  return "Butuh perbaikan besar";
}

const sectionLabels: Record<keyof CVReviewResult["sectionScores"], string> = {
  structure: "Struktur",
  clarity: "Kejelasan",
  roleRelevance: "Relevansi role",
  atsReadability: "Keterbacaan ATS",
  achievementImpact: "Dampak capaian",
};

function getScoreTier(score: number) {
  if (score >= 80) return "high";
  if (score >= 65) return "mid";
  if (score >= 50) return "low";
  return "critical";
}

function getOverallScoreTheme(score: number) {
  const tier = getScoreTier(score);

  if (tier === "high") {
    return {
      card: "border-emerald-200 bg-emerald-50/35",
      score: "text-emerald-700",
      badge:
        "border-emerald-200 bg-emerald-100 text-emerald-700 hover:bg-emerald-100",
      track: "bg-emerald-100",
      fill: "bg-emerald-600",
    };
  }

  if (tier === "mid") {
    return {
      card: "border-sky-200 bg-sky-50/35",
      score: "text-sky-700",
      badge: "border-sky-200 bg-sky-100 text-sky-700 hover:bg-sky-100",
      track: "bg-sky-100",
      fill: "bg-sky-600",
    };
  }

  if (tier === "low") {
    return {
      card: "border-amber-200 bg-amber-50/40",
      score: "text-amber-700",
      badge: "border-amber-200 bg-amber-100 text-amber-700 hover:bg-amber-100",
      track: "bg-amber-100",
      fill: "bg-amber-600",
    };
  }

  return {
    card: "border-rose-200 bg-rose-50/40",
    score: "text-rose-700",
    badge: "border-rose-200 bg-rose-100 text-rose-700 hover:bg-rose-100",
    track: "bg-rose-100",
    fill: "bg-rose-600",
  };
}

function getSectionTone(score: number) {
  const tier = getScoreTier(score);

  if (tier === "high") {
    return {
      valueText: "text-emerald-700",
      bar: "bg-emerald-600",
      track: "bg-emerald-100",
    };
  }

  if (tier === "mid") {
    return {
      valueText: "text-sky-700",
      bar: "bg-sky-600",
      track: "bg-sky-100",
    };
  }

  if (tier === "low") {
    return {
      valueText: "text-amber-700",
      bar: "bg-amber-600",
      track: "bg-amber-100",
    };
  }

  return {
    valueText: "text-rose-700",
    bar: "bg-rose-600",
    track: "bg-rose-100",
  };
}

function getPriorityBadgeClasses(priority: "high" | "medium" | "low") {
  if (priority === "high") {
    return "border-rose-200 bg-rose-100 text-rose-700 hover:bg-rose-100";
  }
  if (priority === "medium") {
    return "border-amber-200 bg-amber-100 text-amber-700 hover:bg-amber-100";
  }
  return "border-emerald-200 bg-emerald-100 text-emerald-700 hover:bg-emerald-100";
}

export default async function ReviewResultPage({
  params,
}: ReviewResultPageProps) {
  const { id } = await params;

  const [review] = await db
    .select()
    .from(cvReviews)
    .where(eq(cvReviews.id, id))
    .limit(1);

  if (!review) {
    notFound();
  }

  if (isReviewExpired(review.expiresAt)) {
    notFound();
  }

  const currentUser = await getCurrentUser();

  if (review.userId && review.userId !== currentUser?.id) {
    notFound();
  }

  const result = review.resultJson as CVReviewResult;
  const overallScoreTheme = getOverallScoreTheme(result.overallScore);

  return (
    <main className="min-h-screen bg-[linear-gradient(180deg,#f8fafc_0%,#f1f5f9_100%)] text-foreground">
      <SiteHeader backHref="/review" backLabel="Review CV lain" />

      <section className="mx-auto w-full max-w-5xl px-5 py-10 md:py-14">
        <div className="mb-6 flex justify-end">
          <DeleteReviewButton reviewId={review.id} />
        </div>
        <div className="grid gap-6 md:grid-cols-[0.8fr_1.2fr]">
          <Card className={cn("rounded-lg shadow-sm", overallScoreTheme.card)}>
            <CardContent className="p-6">
              <p className="text-sm font-medium text-primary">Skor CV</p>

              <div className="mt-4 flex items-end gap-2">
                <span
                  className={cn(
                    "text-6xl font-semibold tracking-tight",
                    overallScoreTheme.score,
                  )}
                >
                  {result.overallScore}
                </span>
                <span className="pb-2 text-lg font-medium text-muted-foreground">
                  /100
                </span>
              </div>

              <div
                className={cn(
                  "mt-4 h-2 overflow-hidden rounded-full",
                  overallScoreTheme.track,
                )}
              >
                <div
                  className={cn(
                    "h-full rounded-full score-fill",
                    overallScoreTheme.fill,
                  )}
                  style={{
                    width: `${result.overallScore}%`,
                    animationDelay: "120ms",
                  }}
                />
              </div>

              <Badge className={cn("mt-4 border", overallScoreTheme.badge)}>
                {getScoreLabel(result.overallScore)}
              </Badge>

              <div className="mt-6 rounded-lg border border-slate-200 bg-white/70 p-4">
                <p className="text-sm font-semibold text-slate-950">
                  Posisi tujuan
                </p>
                <p className="mt-1 text-sm text-slate-600">
                  {review.targetRole}
                </p>
              </div>

              <p className="mt-5 text-xs leading-5 text-muted-foreground">
                Hasil ini bersifat rekomendasi dan tidak menjamin diterima
                kerja.
              </p>

              {review.expiresAt && (
                <p className="mt-2 text-xs leading-5 text-muted-foreground">
                  Hasil review ini tersimpan sementara hingga{" "}
                  {new Intl.DateTimeFormat("id-ID", {
                    dateStyle: "medium",
                    timeStyle: "short",
                  }).format(review.expiresAt)}
                  .
                </p>
              )}
            </CardContent>
          </Card>

          <Card className="rounded-lg border-slate-200 bg-white shadow-sm">
            <CardContent className="p-6">
              <p className="text-sm font-medium text-primary">
                Ringkasan analisis
              </p>
              <h1 className="mt-3 text-3xl font-semibold tracking-tight text-slate-950">
                Review CV untuk {review.targetRole}
              </h1>
              <p className="mt-4 text-base leading-7 text-slate-600">
                {result.summary}
              </p>
            </CardContent>
          </Card>
        </div>

        <div className="mt-6 grid gap-4 md:grid-cols-5">
          {Object.entries(result.sectionScores).map(([key, value], index) => {
            const tone = getSectionTone(value);

            return (
              <Card
                key={key}
                className="rounded-lg border-slate-200 bg-white shadow-sm"
              >
                <CardContent className="p-4">
                  <p className="text-xs font-medium uppercase tracking-[0.12em] text-muted-foreground">
                    {
                      sectionLabels[
                        key as keyof CVReviewResult["sectionScores"]
                      ]
                    }
                  </p>
                  <p
                    className={cn(
                      "mt-3 text-2xl font-semibold",
                      tone.valueText,
                    )}
                  >
                    {value}
                  </p>
                  <div
                    className={cn(
                      "mt-3 h-1.5 overflow-hidden rounded-full",
                      tone.track,
                    )}
                  >
                    <div
                      className={cn("h-full rounded-full score-fill", tone.bar)}
                      style={{
                        width: `${value}%`,
                        animationDelay: `${160 + index * 60}ms`,
                      }}
                    />
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>

        <div className="mt-6 grid gap-6 md:grid-cols-2">
          <Card className="rounded-lg border-emerald-200 bg-emerald-50/35 shadow-sm">
            <CardContent className="p-6">
              <div className="flex items-center gap-2">
                <CheckCircle2 className="h-5 w-5 text-emerald-700" />
                <h2 className="text-xl font-semibold text-slate-950">
                  Kekuatan CV
                </h2>
              </div>

              <div className="mt-5 space-y-3">
                {result.strengths.length > 0 ? (
                  result.strengths.map((item) => (
                    <div key={item} className="flex gap-3">
                      <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-emerald-700" />
                      <p className="text-sm leading-6 text-slate-600">{item}</p>
                    </div>
                  ))
                ) : (
                  <p className="text-sm text-muted-foreground">
                    Tidak ada kekuatan spesifik yang terdeteksi.
                  </p>
                )}
              </div>
            </CardContent>
          </Card>

          <Card className="rounded-lg border-amber-200 bg-amber-50/40 shadow-sm">
            <CardContent className="p-6">
              <div className="flex items-center gap-2">
                <AlertTriangle className="h-5 w-5 text-amber-700" />
                <h2 className="text-xl font-semibold text-slate-950">
                  Area yang perlu diperbaiki
                </h2>
              </div>

              <div className="mt-5 space-y-3">
                {result.weaknesses.length > 0 ? (
                  result.weaknesses.map((item) => (
                    <div key={item} className="flex gap-3">
                      <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0 text-amber-700" />
                      <p className="text-sm leading-6 text-slate-600">{item}</p>
                    </div>
                  ))
                ) : (
                  <p className="text-sm text-muted-foreground">
                    Tidak ada kelemahan spesifik yang terdeteksi.
                  </p>
                )}
              </div>
            </CardContent>
          </Card>
        </div>

        <Card className="mt-6 rounded-lg border-slate-200 bg-white shadow-sm">
          <CardContent className="p-6">
            <div className="flex items-center gap-2">
              <Lightbulb className="h-5 w-5 text-primary" />
              <h2 className="text-xl font-semibold text-slate-950">
                Rekomendasi perbaikan
              </h2>
            </div>

            <div className="mt-5 divide-y rounded-lg border">
              {result.recommendations.map((item, index) => (
                <div key={`${item.title}-${index}`} className="p-4">
                  <div className="flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between">
                    <h3 className="font-semibold text-slate-950">
                      {item.title}
                    </h3>
                    <Badge
                      variant="outline"
                      className={cn(
                        "border",
                        getPriorityBadgeClasses(item.priority),
                      )}
                    >
                      {getPriorityLabel(item.priority)}
                    </Badge>
                  </div>

                  <p className="mt-2 text-sm leading-6 text-slate-600">
                    {item.explanation}
                  </p>

                  {item.exampleRewrite && (
                    <div className="mt-3 rounded-lg bg-slate-50 p-4">
                      <p className="text-xs font-semibold uppercase tracking-[0.12em] text-muted-foreground">
                        Contoh penulisan
                      </p>
                      <p className="mt-2 text-sm leading-6 text-slate-700">
                        {item.exampleRewrite}
                      </p>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        <div className="mt-6 grid gap-6 md:grid-cols-2">
          <Card className="rounded-lg border-slate-200 bg-white shadow-sm">
            <CardContent className="p-6">
              <div className="flex items-center gap-2">
                <Target className="h-5 w-5 text-primary" />
                <h2 className="text-xl font-semibold text-slate-950">
                  Keyword yang bisa dipertimbangkan
                </h2>
              </div>

              <div className="mt-5 flex flex-wrap gap-2">
                {result.missingKeywords.length > 0 ? (
                  result.missingKeywords.map((keyword) => (
                    <Badge
                      key={keyword}
                      variant="secondary"
                      className="bg-sky-100 text-sky-700 hover:bg-sky-100"
                    >
                      {keyword}
                    </Badge>
                  ))
                ) : (
                  <p className="text-sm text-muted-foreground">
                    Tidak ada keyword tambahan yang terdeteksi.
                  </p>
                )}
              </div>
            </CardContent>
          </Card>

          <Card className="rounded-lg border-slate-200 bg-white shadow-sm">
            <CardContent className="p-6">
              <h2 className="text-xl font-semibold text-slate-950">
                Langkah berikutnya
              </h2>

              <div className="mt-5 space-y-3">
                {result.nextActions.map((action) => (
                  <div key={action} className="flex gap-3">
                    <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-emerald-700" />
                    <p className="text-sm leading-6 text-slate-600">{action}</p>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      </section>
    </main>
  );
}

export const metadata: Metadata = {
  robots: {
    index: false,
    follow: false,
  },
};
