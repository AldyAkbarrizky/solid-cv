import type { CSSProperties } from "react";
import { Metadata } from "next";
import { notFound } from "next/navigation";
import { eq } from "drizzle-orm";
import {
  AlertTriangle,
  CalendarDays,
  CheckCircle2,
  Clock3,
  FileText,
  Lightbulb,
  Target,
} from "lucide-react";

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
import { ReviewResultActions } from "./review-result-actions";

type ReviewResultPageProps = {
  params: Promise<{
    id: string;
  }>;
};

type SectionScoreKey = keyof CVReviewResult["sectionScores"];

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

const sectionLabels: Record<SectionScoreKey, string> = {
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
      score: "text-emerald-700",
      badge:
        "border-emerald-200 bg-emerald-100 text-emerald-700 hover:bg-emerald-100",
      ring: "text-emerald-700",
      statusSurface: "border-emerald-200 bg-emerald-50/35",
    };
  }

  if (tier === "mid") {
    return {
      score: "text-sky-700",
      badge: "border-sky-200 bg-sky-100 text-sky-700 hover:bg-sky-100",
      ring: "text-sky-700",
      statusSurface: "border-sky-200 bg-sky-50/35",
    };
  }

  if (tier === "low") {
    return {
      score: "text-amber-700",
      badge: "border-amber-200 bg-amber-100 text-amber-700 hover:bg-amber-100",
      ring: "text-amber-700",
      statusSurface: "border-amber-200 bg-amber-50/40",
    };
  }

  return {
    score: "text-rose-700",
    badge: "border-rose-200 bg-rose-100 text-rose-700 hover:bg-rose-100",
    ring: "text-rose-700",
    statusSurface: "border-rose-200 bg-rose-50/40",
  };
}

function getSectionTone(score: number) {
  const tier = getScoreTier(score);

  if (tier === "high") {
    return {
      valueText: "text-emerald-700",
      bar: "bg-emerald-600",
      track: "bg-emerald-100",
      dot: "bg-emerald-600",
    };
  }

  if (tier === "mid") {
    return {
      valueText: "text-sky-700",
      bar: "bg-sky-600",
      track: "bg-sky-100",
      dot: "bg-sky-600",
    };
  }

  if (tier === "low") {
    return {
      valueText: "text-amber-700",
      bar: "bg-amber-600",
      track: "bg-amber-100",
      dot: "bg-amber-600",
    };
  }

  return {
    valueText: "text-rose-700",
    bar: "bg-rose-600",
    track: "bg-rose-100",
    dot: "bg-rose-600",
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

function formatDateTime(date: Date) {
  return new Intl.DateTimeFormat("id-ID", {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(date);
}

function getSectionScoreEntries(sectionScores: CVReviewResult["sectionScores"]) {
  return (Object.entries(sectionScores) as [SectionScoreKey, number][]).map(
    ([key, value]) => ({
      key,
      label: sectionLabels[key],
      value,
      labelStatus: getScoreLabel(value),
      tone: getSectionTone(value),
    }),
  );
}

function ScoreRing({
  score,
  theme,
}: {
  score: number;
  theme: ReturnType<typeof getOverallScoreTheme>;
}) {
  const clampedScore = Math.max(0, Math.min(100, score));
  const radius = 54;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference - (clampedScore / 100) * circumference;
  const ringStyle = {
    "--score-ring-circumference": circumference,
    "--score-ring-offset": offset,
    strokeDasharray: circumference,
    strokeDashoffset: offset,
  } as CSSProperties;

  return (
    <div className="relative mx-auto h-44 w-44">
      <svg
        aria-hidden="true"
        viewBox="0 0 140 140"
        className="h-full w-full -rotate-90"
      >
        <circle
          cx="70"
          cy="70"
          r={radius}
          fill="none"
          stroke="currentColor"
          strokeWidth="10"
          className="text-white/10"
        />
        <circle
          cx="70"
          cy="70"
          r={radius}
          fill="none"
          stroke="currentColor"
          strokeLinecap="round"
          strokeWidth="10"
          className={cn("score-ring-progress", theme.ring)}
          style={ringStyle}
        />
      </svg>

      <div className="absolute inset-0 flex flex-col items-center justify-center text-center">
        <p className="text-xs font-semibold uppercase tracking-[0.14em] text-muted-foreground">
          Skor CV
        </p>
        <div className="mt-1 flex items-end justify-center gap-1">
          <span
            className={cn(
              "text-5xl font-semibold tracking-tight",
              theme.score,
            )}
          >
            {score}
          </span>
          <span className="pb-1.5 text-base font-medium text-muted-foreground">
            /100
          </span>
        </div>
      </div>
    </div>
  );
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
  const sectionScoreEntries = getSectionScoreEntries(result.sectionScores);
  const lowestSectionScores = [...sectionScoreEntries]
    .sort((a, b) => a.value - b.value)
    .slice(0, 2);
  const canDelete = Boolean(currentUser?.id && review.userId === currentUser.id);

  return (
    <main className="min-h-screen bg-background text-foreground">
      <SiteHeader backHref="/review" backLabel="Review CV lain" />

      <section className="mx-auto w-full max-w-6xl px-5 py-8 md:py-12">
        <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <p className="text-sm font-medium text-primary">Hasil review CV</p>
            <h1 className="mt-2 max-w-3xl text-3xl font-semibold leading-tight tracking-tight text-slate-950 md:text-4xl">
              Review CV untuk {review.targetRole}
            </h1>
          </div>

          <div className="w-full sm:w-auto">
            <ReviewResultActions
              targetRole={review.targetRole}
              jobRequirementSummary={result.jobRequirementSummary}
              overallScore={result.overallScore}
              summary={result.summary}
              strengths={result.strengths}
              weaknesses={result.weaknesses}
              recommendations={result.recommendations}
              nextActions={result.nextActions}
              className="sm:justify-end"
            />
            {canDelete && (
              <div className="mt-2 flex sm:justify-end">
                <DeleteReviewButton reviewId={review.id} />
              </div>
            )}
          </div>
        </div>

        <div className="grid gap-6 lg:grid-cols-[360px_1fr]">
          <Card className="rounded-lg border-slate-200 bg-white shadow-sm">
            <CardContent className="p-6">
              <ScoreRing score={result.overallScore} theme={overallScoreTheme} />

              <div className="mt-6 flex justify-center">
                <Badge className={cn("border", overallScoreTheme.badge)}>
                  {getScoreLabel(result.overallScore)}
                </Badge>
              </div>

              <div
                className={cn(
                  "mt-6 rounded-lg border p-4",
                  overallScoreTheme.statusSurface,
                )}
              >
                <div className="flex items-start gap-3">
                  <FileText className="mt-0.5 h-4 w-4 shrink-0 text-primary" />
                  <div>
                    <p className="text-sm font-semibold text-slate-950">
                      Posisi tujuan
                    </p>
                    <p className="mt-1 text-sm leading-6 text-slate-600">
                      {review.targetRole}
                    </p>
                  </div>
                </div>
              </div>

              <div className="mt-5 space-y-3 text-xs leading-5 text-muted-foreground">
                <div className="flex gap-2">
                  <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-emerald-700" />
                  <p>
                    Hasil ini bersifat rekomendasi dan tidak menjamin diterima
                    kerja.
                  </p>
                </div>

                {review.expiresAt && (
                  <div className="flex gap-2">
                    <Clock3 className="mt-0.5 h-4 w-4 shrink-0 text-amber-700" />
                    <p>
                      Tersimpan sementara hingga{" "}
                      {formatDateTime(review.expiresAt)}.
                    </p>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          <div className="grid gap-6">
            <Card className="rounded-lg border-slate-200 bg-white shadow-sm">
              <CardContent className="p-6 md:p-7">
                <div className="flex items-center gap-2">
                  <Lightbulb className="h-5 w-5 text-primary" />
                  <p className="text-sm font-medium text-primary">
                    Ringkasan analisis
                  </p>
                </div>

                <p className="mt-4 max-w-3xl text-base leading-8 text-slate-600">
                  {result.summary}
                </p>

                {(result.jobRequirementSummary || review.jobRequirement) && (
                  <div className="mt-5 rounded-lg border border-slate-200 bg-slate-50 p-4">
                    <p className="text-xs font-semibold uppercase tracking-[0.12em] text-muted-foreground">
                      Requirement pekerjaan
                    </p>
                    <p className="mt-2 text-sm leading-6 text-slate-700">
                      {result.jobRequirementSummary || review.jobRequirement}
                    </p>
                  </div>
                )}

                <div className="mt-6 grid gap-3 sm:grid-cols-2">
                  {lowestSectionScores.map((section) => (
                    <div
                      key={section.key}
                      className="rounded-lg border border-slate-200 bg-slate-50 p-4"
                    >
                      <p className="text-xs font-semibold uppercase tracking-[0.12em] text-muted-foreground">
                        Prioritas skor
                      </p>
                      <div className="mt-2 flex items-center justify-between gap-4">
                        <p className="text-sm font-semibold text-slate-950">
                          {section.label}
                        </p>
                        <p
                          className={cn(
                            "text-lg font-semibold",
                            section.tone.valueText,
                          )}
                        >
                          {section.value}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>

                <div className="mt-6 grid gap-3 border-t pt-5 text-sm text-muted-foreground sm:grid-cols-1">
                  <div className="flex min-w-0 items-center gap-2">
                    <CalendarDays className="h-4 w-4 text-primary" />
                    <span className="truncate">
                      Dibuat {formatDateTime(review.createdAt)}
                    </span>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="rounded-lg border-slate-200 bg-white shadow-sm">
              <CardContent className="p-6">
                <div className="flex flex-col gap-1 sm:flex-row sm:items-end sm:justify-between">
                  <div>
                    <p className="text-sm font-medium text-primary">
                      Detail skor
                    </p>
                    <h2 className="mt-1 text-xl font-semibold text-slate-950">
                      Bagian yang dinilai
                    </h2>
                  </div>
                  <p className="text-sm text-muted-foreground">
                    Skala 0 sampai 100
                  </p>
                </div>

                <div className="mt-5 grid gap-4">
                  {sectionScoreEntries.map((section, index) => (
                    <div
                      key={section.key}
                      className="grid gap-2 rounded-lg border border-slate-200 bg-slate-50 p-4 sm:grid-cols-[180px_1fr_88px] sm:items-center"
                    >
                      <div className="flex items-center gap-3">
                        <span
                          className={cn(
                            "h-2.5 w-2.5 rounded-full",
                            section.tone.dot,
                          )}
                          aria-hidden="true"
                        />
                        <p className="font-medium text-slate-950">
                          {section.label}
                        </p>
                      </div>

                      <div
                        className={cn(
                          "h-2 overflow-hidden rounded-full",
                          section.tone.track,
                        )}
                      >
                        <div
                          className={cn(
                            "h-full rounded-full score-fill",
                            section.tone.bar,
                          )}
                          style={{
                            width: `${section.value}%`,
                            animationDelay: `${140 + index * 70}ms`,
                          }}
                        />
                      </div>

                      <div className="flex items-baseline justify-between gap-2 sm:justify-end">
                        <span className="text-xs text-muted-foreground sm:hidden">
                          {section.labelStatus}
                        </span>
                        <span
                          className={cn(
                            "text-lg font-semibold",
                            section.tone.valueText,
                          )}
                        >
                          {section.value}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </div>

        <div className="mt-6 grid gap-6 lg:grid-cols-2">
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

        {result.redFlags.length > 0 && (
          <Card className="mt-6 rounded-lg border-rose-200 bg-rose-50/40 shadow-sm">
            <CardContent className="p-6">
              <div className="flex items-center gap-2">
                <AlertTriangle className="h-5 w-5 text-rose-700" />
                <h2 className="text-xl font-semibold text-slate-950">
                  Catatan risiko
                </h2>
              </div>

              <div className="mt-5 grid gap-3 sm:grid-cols-2">
                {result.redFlags.map((item) => (
                  <div key={item} className="flex gap-3">
                    <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0 text-rose-700" />
                    <p className="text-sm leading-6 text-slate-600">{item}</p>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}

        <Card className="mt-6 rounded-lg border-slate-200 bg-white shadow-sm">
          <CardContent className="p-6 md:p-7">
            <div className="flex flex-col gap-1 sm:flex-row sm:items-end sm:justify-between">
              <div className="flex items-center gap-2">
                <Lightbulb className="h-5 w-5 text-primary" />
                <h2 className="text-xl font-semibold text-slate-950">
                  Rekomendasi perbaikan
                </h2>
              </div>
              <p className="text-sm text-muted-foreground">
                Urut berdasarkan prioritas tindakan
              </p>
            </div>

            <div className="mt-6 grid gap-4">
              {result.recommendations.map((item, index) => (
                <div
                  key={`${item.title}-${index}`}
                  className="rounded-lg border border-slate-200 bg-slate-50 p-4 md:p-5"
                >
                  <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                    <div className="flex gap-3">
                      <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full border border-primary/35 bg-primary/10 text-sm font-semibold text-primary">
                        {index + 1}
                      </div>
                      <div>
                        <h3 className="font-semibold text-slate-950">
                          {item.title}
                        </h3>
                        <p className="mt-2 text-sm leading-6 text-slate-600">
                          {item.explanation}
                        </p>
                      </div>
                    </div>

                    <Badge
                      variant="outline"
                      className={cn(
                        "w-fit shrink-0 border",
                        getPriorityBadgeClasses(item.priority),
                      )}
                    >
                      {getPriorityLabel(item.priority)}
                    </Badge>
                  </div>

                  {item.exampleRewrite && (
                    <div className="mt-4 rounded-lg border border-slate-200 bg-white p-4">
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

        <div className="mt-6 grid gap-6 lg:grid-cols-[0.95fr_1.05fr]">
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
                {result.nextActions.length > 0 ? (
                  result.nextActions.map((action) => (
                    <div key={action} className="flex gap-3">
                      <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-emerald-700" />
                      <p className="text-sm leading-6 text-slate-600">
                        {action}
                      </p>
                    </div>
                  ))
                ) : (
                  <p className="text-sm text-muted-foreground">
                    Tidak ada langkah berikutnya yang terdeteksi.
                  </p>
                )}
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
