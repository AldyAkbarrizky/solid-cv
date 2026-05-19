"use client";

import { useMemo, useState } from "react";
import { CheckCircle2, Copy, Download, Share2 } from "lucide-react";

import { Button } from "@/components/ui/button";

type ReviewResultActionsProps = {
  targetRole: string;
  overallScore: number;
  summary: string;
  strengths: string[];
  weaknesses: string[];
  recommendations: {
    priority: "high" | "medium" | "low";
    title: string;
    explanation: string;
    exampleRewrite?: string;
  }[];
  nextActions: string[];
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
  const markdown = useMemo(() => buildMarkdown(props), [props]);

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
  }

  return (
    <div className="flex flex-wrap gap-2">
      <Button
        type="button"
        variant="outline"
        size="sm"
        className="bg-white"
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
        className="bg-white"
        onClick={handleShare}
      >
        <Share2 className="mr-1.5 h-4 w-4" />
        Bagikan
      </Button>

      <Button
        type="button"
        variant="outline"
        size="sm"
        className="bg-white"
        onClick={handleDownloadMarkdown}
      >
        <Download className="mr-1.5 h-4 w-4" />
        Unduh markdown
      </Button>
    </div>
  );
}
