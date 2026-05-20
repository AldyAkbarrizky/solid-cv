"use client";

import { useState } from "react";
import { AlertCircle, Download, Loader2, WandSparkles } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { readNdjsonStream } from "@/lib/client/read-ndjson-stream";

type AtsCvDownloadButtonProps = {
  reviewId: string;
  targetRole: string;
  disabledReason?: string;
};

type AtsStreamEvent =
  | {
      type: "progress";
      progress: number;
      stage: string;
      message: string;
    }
  | {
      type: "done";
      progress: number;
      filename: string;
      pdfBase64: string;
    }
  | {
      type: "error";
      progress: number;
      status: number;
      message: string;
    };

function sanitizeFilename(value: string) {
  return value
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 80);
}

function getFilenameFromDisposition(disposition: string | null) {
  const match = disposition?.match(/filename="([^"]+)"/);
  return match?.[1];
}

export function AtsCvDownloadButton({
  reviewId,
  targetRole,
  disabledReason,
}: AtsCvDownloadButtonProps) {
  const [isGenerating, setIsGenerating] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [progress, setProgress] = useState(0);
  const [progressLabel, setProgressLabel] = useState("");

  async function handleDownload() {
    if (isGenerating || disabledReason) return;

    setIsGenerating(true);
    setErrorMessage(null);
    setProgress(4);
    setProgressLabel("Menyiapkan CV ATS.");

    try {
      const response = await fetch(`/api/review/${reviewId}/ats-cv?stream=1`, {
        method: "POST",
      });

      if (!response.ok) {
        const result = await response.json().catch(() => null);
        throw new Error(result?.message || "Gagal membuat CV ATS.");
      }

      let doneFilename = "";
      let doneBase64 = "";
      let streamError = "";

      await readNdjsonStream<AtsStreamEvent>(response, (event) => {
        if (event.type === "progress") {
          setProgress(Math.max(0, Math.min(100, event.progress)));
          setProgressLabel(event.message);
          return;
        }

        if (event.type === "done") {
          doneFilename = event.filename;
          doneBase64 = event.pdfBase64;
          setProgress(100);
          setProgressLabel("CV ATS siap diunduh.");
          return;
        }

        streamError = event.message;
        setProgress(Math.max(0, Math.min(100, event.progress || 100)));
        setProgressLabel("Pembuatan CV ATS berhenti.");
      });

      if (streamError) {
        throw new Error(streamError);
      }

      if (!doneBase64) {
        throw new Error("Gagal menyiapkan file PDF ATS.");
      }

      const byteChars = atob(doneBase64);
      const byteNumbers = new Array(byteChars.length);
      for (let i = 0; i < byteChars.length; i += 1) {
        byteNumbers[i] = byteChars.charCodeAt(i);
      }

      const blob = new Blob([new Uint8Array(byteNumbers)], {
        type: "application/pdf",
      });

      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");
      const filename =
        doneFilename ||
        getFilenameFromDisposition(response.headers.get("Content-Disposition")) ||
        `solid-cv-ats-${sanitizeFilename(targetRole) || "hasil"}.pdf`;

      link.href = url;
      link.download = filename;
      document.body.appendChild(link);
      link.click();
      link.remove();
      URL.revokeObjectURL(url);
    } catch (error) {
      setErrorMessage(
        error instanceof Error ? error.message : "Gagal membuat CV ATS.",
      );
      setProgress(0);
      setProgressLabel("");
    } finally {
      setIsGenerating(false);
    }
  }

  return (
    <div className="space-y-2">
      <Button
        type="button"
        size="lg"
        onClick={handleDownload}
        disabled={isGenerating || Boolean(disabledReason)}
        className="h-11 w-full justify-center bg-emerald-500 px-5 text-slate-950 shadow-emerald-950/20 hover:bg-emerald-400 hover:shadow-emerald-500/25 sm:w-auto"
      >
        {isGenerating ? (
          <>
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            Membuat CV ATS
          </>
        ) : (
          <>
            <WandSparkles className="mr-2 h-4 w-4" />
            Unduh CV ATS PDF
            <Download className="ml-2 h-4 w-4" />
          </>
        )}
      </Button>

      {isGenerating && (
        <div className="rounded-md border border-emerald-300/40 bg-emerald-500/10 p-2.5">
          <div className="mb-1.5 flex items-center justify-between text-[11px]">
            <span className="text-emerald-700">
              {progressLabel || "Membuat CV ATS"}
            </span>
            <span className="font-semibold text-emerald-700">{progress}%</span>
          </div>
          <Progress value={progress} className="h-1.5 bg-emerald-100/50" />
        </div>
      )}

      {(disabledReason || errorMessage) && (
        <div className="flex items-start gap-2 text-xs leading-5 text-amber-700">
          <AlertCircle className="mt-0.5 h-3.5 w-3.5 shrink-0" />
          <span>{disabledReason || errorMessage}</span>
        </div>
      )}
    </div>
  );
}
