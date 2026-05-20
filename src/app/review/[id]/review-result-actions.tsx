"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import {
  CheckCircle2,
  ChevronDown,
  Copy,
  Download,
  FileText,
  Share2,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import {
  buildReviewPdfHtml,
  type ReviewExportPayload,
  type ReviewExportRecommendation,
} from "./review-result-export-template";

type ReviewResultActionsProps = {
  targetRole: string;
  jobRequirementSummary?: string | null;
  overallScore: number;
  summary: string;
  strengths: string[];
  weaknesses: string[];
  recommendations: ReviewExportRecommendation[];
  nextActions: string[];
  className?: string;
};

function toList(items: string[]) {
  if (items.length === 0) return "- Tidak ada data.";
  return items.map((item) => `- ${item}`).join("\n");
}

function sanitizeFilename(value: string) {
  return value
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 80);
}

function buildMarkdown({
  targetRole,
  jobRequirementSummary,
  overallScore,
  summary,
  strengths,
  weaknesses,
  recommendations,
  nextActions,
}: ReviewResultActionsProps) {
  const recommendationText =
    recommendations.length === 0
      ? "- Tidak ada rekomendasi."
      : recommendations
          .map((item, index) => {
            const example = item.exampleRewrite
              ? `\n  Contoh: ${item.exampleRewrite}`
              : "";

            return `${index + 1}. ${item.title} (${item.priority})\n   ${item.explanation}${example}`;
          })
          .join("\n\n");

  return `# Review CV untuk ${targetRole}

Skor CV: ${overallScore}/100

${jobRequirementSummary ? `## Requirement pekerjaan\n\n${jobRequirementSummary}\n\n` : ""}

## Ringkasan

${summary}

## Kekuatan CV

${toList(strengths)}

## Area yang perlu diperbaiki

${toList(weaknesses)}

## Rekomendasi perbaikan

${recommendationText}

## Langkah berikutnya

${toList(nextActions)}

---

Hasil ini bersifat rekomendasi dan tidak menjamin diterima kerja.
`;
}

export function ReviewResultActions(props: ReviewResultActionsProps) {
  const [copied, setCopied] = useState(false);
  const [isDownloadOpen, setIsDownloadOpen] = useState(false);
  const downloadMenuRef = useRef<HTMLDivElement | null>(null);
  const markdown = useMemo(() => buildMarkdown(props), [props]);
  const exportPayload = useMemo<ReviewExportPayload>(
    () => ({
      targetRole: props.targetRole,
      jobRequirementSummary: props.jobRequirementSummary,
      overallScore: props.overallScore,
      summary: props.summary,
      strengths: props.strengths,
      weaknesses: props.weaknesses,
      recommendations: props.recommendations,
      nextActions: props.nextActions,
    }),
    [
      props.nextActions,
      props.overallScore,
      props.recommendations,
      props.strengths,
      props.summary,
      props.targetRole,
      props.jobRequirementSummary,
      props.weaknesses,
    ],
  );

  useEffect(() => {
    if (!isDownloadOpen) {
      return;
    }

    function handlePointerDown(event: PointerEvent) {
      const target = event.target;
      if (!(target instanceof Node)) return;

      if (!downloadMenuRef.current?.contains(target)) {
        setIsDownloadOpen(false);
      }
    }

    function handleEscape(event: KeyboardEvent) {
      if (event.key === "Escape") {
        setIsDownloadOpen(false);
      }
    }

    document.addEventListener("pointerdown", handlePointerDown);
    document.addEventListener("keydown", handleEscape);

    return () => {
      document.removeEventListener("pointerdown", handlePointerDown);
      document.removeEventListener("keydown", handleEscape);
    };
  }, [isDownloadOpen]);

  async function handleCopyLink() {
    await navigator.clipboard.writeText(window.location.href);
    setCopied(true);
    window.setTimeout(() => setCopied(false), 1800);
  }

  async function handleShare() {
    const shareData = {
      title: `Review CV untuk ${props.targetRole}`,
      text: `Skor CV: ${props.overallScore}/100`,
      url: window.location.href,
    };

    if (navigator.share && navigator.canShare?.(shareData)) {
      await navigator.share(shareData);
      return;
    }

    await handleCopyLink();
  }

  function handleDownloadMarkdown() {
    const blob = new Blob([markdown], {
      type: "text/markdown;charset=utf-8",
    });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");

    link.href = url;
    link.download = `solid-cv-review-${sanitizeFilename(props.targetRole) || "hasil"}.md`;
    document.body.appendChild(link);
    link.click();
    link.remove();
    URL.revokeObjectURL(url);
    setIsDownloadOpen(false);
  }

  function handleDownloadPdf() {
    const html = buildReviewPdfHtml(exportPayload);
    const blob = new Blob([html], {
      type: "text/html;charset=utf-8",
    });
    const url = URL.createObjectURL(blob);
    const printWindow = window.open(url, "_blank");

    if (!printWindow) {
      URL.revokeObjectURL(url);
      return;
    }

    window.setTimeout(() => {
      URL.revokeObjectURL(url);
    }, 60_000);

    setIsDownloadOpen(false);
  }

  return (
    <div
      className={cn(
        "flex w-full gap-2 overflow-x-auto pb-1 sm:w-auto sm:overflow-visible sm:pb-0",
        props.className,
      )}
    >
      <Button
        type="button"
        variant="outline"
        size="sm"
        className="shrink-0 bg-white"
        onClick={handleCopyLink}
      >
        {copied ? (
          <CheckCircle2 className="mr-1.5 h-4 w-4 text-emerald-600" />
        ) : (
          <Copy className="mr-1.5 h-4 w-4" />
        )}
        {copied ? "Link disalin" : "Salin link"}
      </Button>

      <Button
        type="button"
        variant="outline"
        size="sm"
        className="shrink-0 bg-white"
        onClick={handleShare}
      >
        <Share2 className="mr-1.5 h-4 w-4" />
        Bagikan
      </Button>

      <div ref={downloadMenuRef} className="relative shrink-0">
        <Button
          type="button"
          variant="outline"
          size="sm"
          className="bg-white"
          aria-haspopup="menu"
          aria-expanded={isDownloadOpen}
          onClick={() => setIsDownloadOpen((prev) => !prev)}
        >
          <Download className="mr-1.5 h-4 w-4" />
          Unduh
          <ChevronDown className="ml-1 h-4 w-4" />
        </Button>

        {isDownloadOpen && (
          <div
            role="menu"
            className="absolute right-0 z-20 mt-2 w-44 rounded-lg border border-slate-200 bg-white p-1 shadow-lg"
          >
            <button
              type="button"
              role="menuitem"
              onClick={handleDownloadPdf}
              className="flex w-full items-center gap-2 rounded-md px-2.5 py-2 text-left text-sm text-slate-700 transition hover:bg-slate-100"
            >
              <Download className="h-4 w-4" />
              Unduh PDF
            </button>

            <button
              type="button"
              role="menuitem"
              onClick={handleDownloadMarkdown}
              className="mt-1 flex w-full items-center gap-2 rounded-md px-2.5 py-2 text-left text-sm text-slate-700 transition hover:bg-slate-100"
            >
              <FileText className="h-4 w-4" />
              Unduh Markdown
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
