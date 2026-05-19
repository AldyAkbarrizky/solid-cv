"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import {
  ArrowRight,
  CalendarDays,
  FileText,
  Search,
  SlidersHorizontal,
} from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";

type HistoryReviewItem = {
  id: string;
  targetRole: string;
  overallScore: number;
  createdAt: string;
  createdAtLabel: string;
  aiProvider: string;
  aiModel: string;
};

type HistoryReviewListProps = {
  reviews: HistoryReviewItem[];
};

type ScoreFilter = "all" | "strong" | "good" | "needs-work" | "critical";
type SortMode = "newest" | "oldest" | "score-high" | "score-low";

const scoreFilters: { value: ScoreFilter; label: string }[] = [
  { value: "all", label: "Semua" },
  { value: "strong", label: "80+" },
  { value: "good", label: "65-79" },
  { value: "needs-work", label: "50-64" },
  { value: "critical", label: "<50" },
];

function getScoreTone(score: number) {
  if (score >= 80) {
    return {
      label: "Kuat",
      card: "border-emerald-200 bg-emerald-50/35",
      score: "text-emerald-700",
      badge: "border-emerald-200 bg-emerald-100 text-emerald-700 hover:bg-emerald-100",
      fill: "bg-emerald-500",
      track: "bg-emerald-950/30",
    };
  }

  if (score >= 65) {
    return {
      label: "Baik",
      card: "border-sky-200 bg-sky-50/35",
      score: "text-sky-700",
      badge: "border-sky-200 bg-sky-100 text-sky-700 hover:bg-sky-100",
      fill: "bg-sky-500",
      track: "bg-sky-950/30",
    };
  }

  if (score >= 50) {
    return {
      label: "Perlu dirapikan",
      card: "border-amber-200 bg-amber-50/40",
      score: "text-amber-700",
      badge: "border-amber-200 bg-amber-100 text-amber-700 hover:bg-amber-100",
      fill: "bg-amber-500",
      track: "bg-amber-950/30",
    };
  }

  return {
    label: "Prioritas tinggi",
    card: "border-rose-200 bg-rose-50/40",
    score: "text-rose-700",
    badge: "border-rose-200 bg-rose-100 text-rose-700 hover:bg-rose-100",
    fill: "bg-rose-500",
    track: "bg-rose-950/30",
  };
}

function matchesScoreFilter(score: number, filter: ScoreFilter) {
  if (filter === "strong") return score >= 80;
  if (filter === "good") return score >= 65 && score < 80;
  if (filter === "needs-work") return score >= 50 && score < 65;
  if (filter === "critical") return score < 50;
  return true;
}

function getAverageScore(reviews: HistoryReviewItem[]) {
  if (reviews.length === 0) return 0;

  const total = reviews.reduce((sum, review) => sum + review.overallScore, 0);
  return Math.round(total / reviews.length);
}

export function HistoryReviewList({ reviews }: HistoryReviewListProps) {
  const [query, setQuery] = useState("");
  const [scoreFilter, setScoreFilter] = useState<ScoreFilter>("all");
  const [sortMode, setSortMode] = useState<SortMode>("newest");

  const filteredReviews = useMemo(() => {
    const normalizedQuery = query.trim().toLowerCase();

    return reviews
      .filter((review) => {
        const searchableText = [
          review.targetRole,
          review.createdAtLabel,
          review.aiProvider,
          review.aiModel,
          String(review.overallScore),
        ]
          .join(" ")
          .toLowerCase();

        return (
          (!normalizedQuery || searchableText.includes(normalizedQuery)) &&
          matchesScoreFilter(review.overallScore, scoreFilter)
        );
      })
      .sort((a, b) => {
        if (sortMode === "oldest") {
          return (
            new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()
          );
        }

        if (sortMode === "score-high") {
          return b.overallScore - a.overallScore;
        }

        if (sortMode === "score-low") {
          return a.overallScore - b.overallScore;
        }

        return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
      });
  }, [query, reviews, scoreFilter, sortMode]);

  const averageScore = getAverageScore(reviews);
  const highestScore = reviews.reduce(
    (highest, review) => Math.max(highest, review.overallScore),
    0,
  );
  const needsWorkCount = reviews.filter((review) => review.overallScore < 65)
    .length;

  return (
    <div className="mt-8 space-y-5">
      <div className="grid gap-4 md:grid-cols-3">
        {[
          {
            label: "Total review",
            value: reviews.length,
            tone: "text-primary",
            helper: "hasil tersimpan",
          },
          {
            label: "Rata-rata skor",
            value: averageScore,
            tone: getScoreTone(averageScore).score,
            helper: "dari semua review",
          },
          {
            label: "Perlu perhatian",
            value: needsWorkCount,
            tone: needsWorkCount > 0 ? "text-amber-700" : "text-emerald-700",
            helper: `skor terbaik ${highestScore || "-"}`,
          },
        ].map((item) => (
          <Card key={item.label} className="rounded-lg bg-white shadow-sm">
            <CardContent className="p-5">
              <p className="text-xs font-semibold uppercase tracking-[0.12em] text-muted-foreground">
                {item.label}
              </p>
              <p className={cn("mt-3 text-3xl font-semibold", item.tone)}>
                {item.value}
              </p>
              <p className="mt-1 text-sm text-slate-600">{item.helper}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      <Card className="rounded-lg border-slate-200 bg-white shadow-sm">
        <CardContent className="p-5">
          <div className="grid gap-4 lg:grid-cols-[1fr_auto] lg:items-end">
            <div>
              <label
                htmlFor="history-search"
                className="text-sm font-medium text-slate-950"
              >
                Cari riwayat
              </label>
              <div className="relative mt-2">
                <Search className="pointer-events-none absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <Input
                  id="history-search"
                  value={query}
                  onChange={(event) => setQuery(event.target.value)}
                  placeholder="Cari posisi, tanggal, provider, atau skor"
                  className="h-10 bg-white pl-9"
                />
              </div>
            </div>

            <div className="grid gap-3 sm:grid-cols-2">
              <label className="grid gap-2 text-sm font-medium text-slate-950">
                Filter skor
                <select
                  value={scoreFilter}
                  onChange={(event) =>
                    setScoreFilter(event.target.value as ScoreFilter)
                  }
                  className="h-10 rounded-lg border border-input bg-card px-3 text-sm text-foreground outline-none transition focus:border-ring focus:ring-3 focus:ring-ring/50"
                >
                  {scoreFilters.map((filter) => (
                    <option key={filter.value} value={filter.value}>
                      {filter.label}
                    </option>
                  ))}
                </select>
              </label>

              <label className="grid gap-2 text-sm font-medium text-slate-950">
                Urutkan
                <select
                  value={sortMode}
                  onChange={(event) => setSortMode(event.target.value as SortMode)}
                  className="h-10 rounded-lg border border-input bg-card px-3 text-sm text-foreground outline-none transition focus:border-ring focus:ring-3 focus:ring-ring/50"
                >
                  <option value="newest">Terbaru</option>
                  <option value="oldest">Terlama</option>
                  <option value="score-high">Skor tertinggi</option>
                  <option value="score-low">Skor terendah</option>
                </select>
              </label>
            </div>
          </div>

          <div className="mt-4 flex flex-wrap gap-2">
            {scoreFilters.map((filter) => (
              <button
                key={filter.value}
                type="button"
                onClick={() => setScoreFilter(filter.value)}
                className={cn(
                  "rounded-full border px-3 py-1 text-xs font-medium transition hover:-translate-y-0.5",
                  scoreFilter === filter.value
                    ? "border-primary bg-primary text-primary-foreground"
                    : "border-border bg-muted/50 text-muted-foreground hover:text-foreground",
                )}
              >
                {filter.label}
              </button>
            ))}
          </div>
        </CardContent>
      </Card>

      <div className="flex items-center justify-between gap-3">
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <SlidersHorizontal className="h-4 w-4" />
          {filteredReviews.length} dari {reviews.length} review ditampilkan
        </div>
      </div>

      {filteredReviews.length > 0 ? (
        <div className="grid gap-4">
          {filteredReviews.map((review) => {
            const tone = getScoreTone(review.overallScore);

            return (
              <Link key={review.id} href={`/review/${review.id}`}>
                <Card
                  className={cn(
                    "micro-lift rounded-lg shadow-sm transition",
                    tone.card,
                  )}
                >
                  <CardContent className="grid gap-5 p-5 md:grid-cols-[1fr_180px] md:items-center">
                    <div className="min-w-0">
                      <div className="flex flex-wrap items-center gap-2">
                        <Badge className={cn("border", tone.badge)}>
                          {tone.label}
                        </Badge>
                        <span className="flex items-center gap-1.5 text-xs text-muted-foreground">
                          <CalendarDays className="h-3.5 w-3.5" />
                          {review.createdAtLabel}
                        </span>
                      </div>

                      <div className="mt-4 flex gap-3">
                        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-secondary text-primary">
                          <FileText className="h-5 w-5" />
                        </div>
                        <div className="min-w-0">
                          <h2 className="truncate text-lg font-semibold tracking-tight text-slate-950">
                            {review.targetRole}
                          </h2>
                          <p className="mt-1 text-sm leading-6 text-slate-600">
                            Dianalisis dengan {review.aiProvider} ·{" "}
                            {review.aiModel}
                          </p>
                        </div>
                      </div>
                    </div>

                    <div>
                      <div className="flex items-end justify-between gap-3 md:justify-end">
                        <div className="md:text-right">
                          <p className="text-xs font-medium uppercase tracking-[0.12em] text-muted-foreground">
                            Skor CV
                          </p>
                          <p
                            className={cn(
                              "mt-1 text-4xl font-semibold tabular-nums",
                              tone.score,
                            )}
                          >
                            {review.overallScore}
                            <span className="text-base text-muted-foreground">
                              /100
                            </span>
                          </p>
                        </div>
                        <ArrowRight className="mb-2 h-4 w-4 text-muted-foreground" />
                      </div>

                      <div
                        className={cn(
                          "mt-3 h-2 overflow-hidden rounded-full",
                          tone.track,
                        )}
                      >
                        <div
                          className={cn("h-full rounded-full", tone.fill)}
                          style={{ width: `${review.overallScore}%` }}
                        />
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </Link>
            );
          })}
        </div>
      ) : (
        <Card className="rounded-lg border-slate-200 bg-white shadow-sm">
          <CardContent className="p-6 text-center">
            <p className="font-semibold text-slate-950">
              Tidak ada review yang cocok.
            </p>
            <p className="mt-2 text-sm leading-6 text-slate-600">
              Coba ubah kata kunci pencarian atau filter skor.
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
