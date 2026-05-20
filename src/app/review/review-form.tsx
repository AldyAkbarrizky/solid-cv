"use client";

import { FormEvent, useMemo, useRef, useState } from "react";
import {
  AlertCircle,
  Bold,
  CheckCircle2,
  FileUp,
  Heading2,
  List,
  ListOrdered,
  Loader2,
  Quote,
  X,
} from "lucide-react";

import { Alert, AlertDescription } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Progress } from "@/components/ui/progress";
import { Textarea } from "@/components/ui/textarea";
import Link from "next/link";
import { readNdjsonStream } from "@/lib/client/read-ndjson-stream";

const MAX_FILE_SIZE = 3 * 1024 * 1024;

const allowedTypes = [
  "application/pdf",
  "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
];

function formatFileSize(size: number) {
  if (size < 1024 * 1024) {
    return `${Math.round(size / 1024)} KB`;
  }

  return `${(size / (1024 * 1024)).toFixed(1)} MB`;
}

function isValidFile(file: File) {
  const extension = file.name.split(".").pop()?.toLowerCase();

  const validExtension = extension === "pdf" || extension === "docx";
  const validMime = allowedTypes.includes(file.type);

  return validExtension && validMime && file.size <= MAX_FILE_SIZE;
}

type FormatAction =
  | "bold"
  | "heading"
  | "unordered-list"
  | "ordered-list"
  | "quote";

type StructuredTextareaProps = {
  id: string;
  name: string;
  label: string;
  placeholder: string;
  value: string;
  maxLength?: number;
  helperText?: string;
  rows?: number;
  onChange: (value: string) => void;
};

type AnalyzeStreamEvent =
  | {
      type: "progress";
      progress: number;
      stage: string;
      message: string;
    }
  | {
      type: "done";
      progress: number;
      reviewId: string;
    }
  | {
      type: "error";
      progress: number;
      status: number;
      message: string;
      retryAfterSeconds?: number;
    };

function applyPrefixPerLine(
  input: string,
  selectionStart: number,
  selectionEnd: number,
  prefixFactory: (index: number) => string,
) {
  const blockStart = input.lastIndexOf("\n", selectionStart - 1) + 1;
  const blockEnd = input.indexOf("\n", selectionEnd);
  const safeBlockEnd = blockEnd === -1 ? input.length : blockEnd;

  const before = input.slice(0, blockStart);
  const block = input.slice(blockStart, safeBlockEnd);
  const after = input.slice(safeBlockEnd);

  const formattedBlock = block
    .split("\n")
    .map((line, index) => {
      const content = line.trim();
      if (!content) return line;
      return `${prefixFactory(index)}${content}`;
    })
    .join("\n");

  const nextValue = `${before}${formattedBlock}${after}`;
  return {
    nextValue,
    nextSelectionStart: blockStart,
    nextSelectionEnd: blockStart + formattedBlock.length,
  };
}

function applyInlineWrap(
  input: string,
  selectionStart: number,
  selectionEnd: number,
  token: string,
) {
  const selected = input.slice(selectionStart, selectionEnd);

  if (!selected) {
    const fallback = "teks";
    const insertion = `${token}${fallback}${token}`;
    const nextValue =
      input.slice(0, selectionStart) + insertion + input.slice(selectionEnd);

    return {
      nextValue,
      nextSelectionStart: selectionStart + token.length,
      nextSelectionEnd: selectionStart + token.length + fallback.length,
    };
  }

  const nextValue =
    input.slice(0, selectionStart) +
    `${token}${selected}${token}` +
    input.slice(selectionEnd);

  return {
    nextValue,
    nextSelectionStart: selectionStart + token.length,
    nextSelectionEnd: selectionEnd + token.length,
  };
}

function StructuredTextarea({
  id,
  name,
  label,
  placeholder,
  value,
  maxLength = 4000,
  helperText,
  rows = 6,
  onChange,
}: StructuredTextareaProps) {
  const textareaRef = useRef<HTMLTextAreaElement | null>(null);

  function focusWithSelection(start: number, end: number) {
    const el = textareaRef.current;
    if (!el) return;
    el.focus();
    window.requestAnimationFrame(() => {
      el.setSelectionRange(start, end);
    });
  }

  function handleFormat(action: FormatAction) {
    const el = textareaRef.current;
    if (!el) return;

    const selectionStart = el.selectionStart ?? 0;
    const selectionEnd = el.selectionEnd ?? selectionStart;
    let result: {
      nextValue: string;
      nextSelectionStart: number;
      nextSelectionEnd: number;
    };

    switch (action) {
      case "bold":
        result = applyInlineWrap(value, selectionStart, selectionEnd, "**");
        break;
      case "heading":
        result = applyPrefixPerLine(
          value,
          selectionStart,
          selectionEnd,
          () => "## ",
        );
        break;
      case "unordered-list":
        result = applyPrefixPerLine(
          value,
          selectionStart,
          selectionEnd,
          () => "- ",
        );
        break;
      case "ordered-list":
        result = applyPrefixPerLine(
          value,
          selectionStart,
          selectionEnd,
          (index) => `${index + 1}. `,
        );
        break;
      case "quote":
        result = applyPrefixPerLine(
          value,
          selectionStart,
          selectionEnd,
          () => "> ",
        );
        break;
      default:
        return;
    }

    onChange(result.nextValue);
    focusWithSelection(result.nextSelectionStart, result.nextSelectionEnd);
  }

  return (
    <div className="grid gap-2">
      <Label htmlFor={id}>{label}</Label>

      <div className="rounded-lg border border-slate-300 bg-white">
        <div className="flex flex-wrap items-center gap-1 border-b border-slate-200 p-2">
          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={() => handleFormat("bold")}
            aria-label="Format bold"
          >
            <Bold className="h-4 w-4" />
          </Button>
          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={() => handleFormat("heading")}
            aria-label="Tambah heading"
          >
            <Heading2 className="h-4 w-4" />
          </Button>
          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={() => handleFormat("unordered-list")}
            aria-label="Tambah bullet list"
          >
            <List className="h-4 w-4" />
          </Button>
          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={() => handleFormat("ordered-list")}
            aria-label="Tambah numbered list"
          >
            <ListOrdered className="h-4 w-4" />
          </Button>
          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={() => handleFormat("quote")}
            aria-label="Tambah quote"
          >
            <Quote className="h-4 w-4" />
          </Button>
        </div>

        <Textarea
          ref={textareaRef}
          id={id}
          name={name}
          value={value}
          onChange={(event) => onChange(event.target.value)}
          maxLength={maxLength}
          rows={rows}
          placeholder={placeholder}
          className="min-h-28 border-0 bg-transparent focus-visible:ring-0"
        />
      </div>

      {helperText && (
        <p className="text-xs leading-5 text-muted-foreground">{helperText}</p>
      )}

      <p className="text-right text-[11px] text-muted-foreground">
        {value.length}/{maxLength}
      </p>
    </div>
  );
}

export function ReviewForm() {
  const [file, setFile] = useState<File | null>(null);
  const [targetRole, setTargetRole] = useState("");
  const [jobRequirement, setJobRequirement] = useState("");
  const [notes, setNotes] = useState("");
  const [consent, setConsent] = useState(false);
  const [error, setError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitProgress, setSubmitProgress] = useState(0);
  const [submitProgressLabel, setSubmitProgressLabel] = useState("");

  const fileStatus = useMemo(() => {
    if (!file) return null;

    if (file.size > MAX_FILE_SIZE) {
      return {
        valid: false,
        message: "Ukuran file melebihi batas maksimal 3 MB.",
      };
    }

    if (!isValidFile(file)) {
      return {
        valid: false,
        message: "Format file tidak valid. Gunakan PDF atau DOCX.",
      };
    }

    return {
      valid: true,
      message: "File siap dianalisis.",
    };
  }, [file]);

  const canSubmit =
    Boolean(file) &&
    Boolean(fileStatus?.valid) &&
    targetRole.trim().length >= 3 &&
    consent &&
    !isSubmitting;

  function handleFileChange(event: React.ChangeEvent<HTMLInputElement>) {
    setError("");

    const selectedFile = event.target.files?.[0];

    if (!selectedFile) {
      setFile(null);
      return;
    }

    setFile(selectedFile);
  }

  function removeFile() {
    setFile(null);
    setError("");
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (!file) {
      setError("Upload CV terlebih dahulu.");
      return;
    }

    if (!fileStatus?.valid) {
      setError(fileStatus?.message || "File tidak valid.");
      return;
    }

    if (targetRole.trim().length < 3) {
      setError("Isi posisi tujuan dengan minimal 3 karakter.");
      return;
    }

    if (!consent) {
      setError("Anda perlu menyetujui pemrosesan sementara file CV.");
      return;
    }

    setIsSubmitting(true);
    setError("");
    setSubmitProgress(2);
    setSubmitProgressLabel("Menyiapkan analisis CV.");

    try {
      const formData = new FormData();
      formData.append("cv", file);
      formData.append("targetRole", targetRole.trim());
      formData.append("jobRequirement", jobRequirement.trim());
      formData.append("notes", notes.trim());

      const response = await fetch("/api/cv/analyze?stream=1", {
        method: "POST",
        body: formData,
      });

      if (!response.ok) {
        const result = await response.json().catch(() => null);

        if (response.status === 403) {
          window.setTimeout(() => {
            window.location.reload();
          }, 800);
        }

        throw new Error(result?.message || "Gagal menganalisis CV.");
      }

      let doneReviewId = "";
      let streamError = "";
      let streamErrorStatus = 0;

      await readNdjsonStream<AnalyzeStreamEvent>(response, (event) => {
        if (event.type === "progress") {
          setSubmitProgress(Math.max(0, Math.min(100, event.progress)));
          setSubmitProgressLabel(event.message);
          return;
        }

        if (event.type === "done") {
          doneReviewId = event.reviewId;
          setSubmitProgress(100);
          setSubmitProgressLabel("Analisis selesai.");
          return;
        }

        streamError = event.message;
        streamErrorStatus = event.status;
        setSubmitProgress(Math.max(0, Math.min(100, event.progress || 100)));
        setSubmitProgressLabel("Analisis berhenti.");
      });

      if (streamError) {
        if (streamErrorStatus === 403) {
          window.setTimeout(() => {
            window.location.reload();
          }, 800);
        }

        throw new Error(streamError);
      }

      if (!doneReviewId) {
        throw new Error(
          "Respons analisis tidak lengkap. Silakan coba analisis ulang.",
        );
      }

      window.location.href = `/review/${doneReviewId}`;
    } catch (err) {
      const message =
        err instanceof Error
          ? err.message
          : "Terjadi kesalahan saat memproses CV.";

      setError(message);
      setSubmitProgress(0);
      setSubmitProgressLabel("");
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <Card className="rounded-lg border-slate-200 bg-white py-0 shadow-sm">
      <CardContent className="p-5 md:p-6">
        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <Label htmlFor="cv">File CV</Label>

            <div className="mt-2 rounded-lg border border-dashed border-slate-300 bg-slate-50 p-5">
              {!file ? (
                <div className="flex flex-col items-center justify-center text-center">
                  <div className="flex h-11 w-11 items-center justify-center rounded-lg bg-white text-primary shadow-sm">
                    <FileUp className="h-5 w-5" />
                  </div>

                  <p className="mt-4 text-sm font-medium text-slate-950">
                    Upload file CV
                  </p>
                  <p className="mt-1 text-xs leading-5 text-muted-foreground">
                    Format PDF atau DOCX, maksimal 3 MB.
                  </p>

                  <Input
                    id="cv"
                    name="cv"
                    type="file"
                    accept=".pdf,.docx,application/pdf,application/vnd.openxmlformats-officedocument.wordprocessingml.document"
                    onChange={handleFileChange}
                    className="mt-4 max-w-xs bg-white"
                  />
                </div>
              ) : (
                <div className="flex items-start justify-between gap-4">
                  <div className="min-w-0">
                    <p className="truncate text-sm font-semibold text-slate-950">
                      {file.name}
                    </p>
                    <p className="mt-1 text-xs text-muted-foreground">
                      {formatFileSize(file.size)}
                    </p>

                    {fileStatus && (
                      <div className="mt-3 flex items-start gap-2">
                        {fileStatus.valid ? (
                          <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-emerald-600" />
                        ) : (
                          <AlertCircle className="mt-0.5 h-4 w-4 shrink-0 text-destructive" />
                        )}
                        <p
                          className={
                            fileStatus.valid
                              ? "text-sm text-emerald-700"
                              : "text-sm text-destructive"
                          }
                        >
                          {fileStatus.message}
                        </p>
                      </div>
                    )}
                  </div>

                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    onClick={removeFile}
                    aria-label="Hapus file"
                  >
                    <X className="h-4 w-4" />
                  </Button>
                </div>
              )}
            </div>

            <div className="mt-3 rounded-lg border border-slate-200 bg-white p-3">
              <p className="text-xs font-semibold uppercase tracking-[0.12em] text-slate-500">
                Batas file
              </p>
              <div className="mt-2 grid gap-2 text-sm text-slate-600">
                <div className="flex items-center justify-between border-b pb-2">
                  <span>PDF</span>
                  <span className="font-medium text-slate-900">Maks. 3 MB</span>
                </div>
                <div className="flex items-center justify-between">
                  <span>DOCX</span>
                  <span className="font-medium text-slate-900">Maks. 3 MB</span>
                </div>
              </div>
            </div>
          </div>

          <div className="grid gap-2">
            <Label htmlFor="targetRole">
              Posisi yang dituju
              <span className="text-destructive" aria-hidden="true">
                *
              </span>
            </Label>
            <Input
              id="targetRole"
              name="targetRole"
              value={targetRole}
              onChange={(event) => setTargetRole(event.target.value)}
              placeholder="Contoh: Frontend Developer, Data Analyst, Admin Finance"
              className="bg-white"
            />
            <p className="text-xs leading-5 text-muted-foreground">
              Semakin spesifik posisi yang diisi, semakin kontekstual hasil
              review yang bisa diberikan.
            </p>
          </div>

          <StructuredTextarea
            id="jobRequirement"
            name="jobRequirement"
            label="Requirement pekerjaan (opsional)"
            value={jobRequirement}
            onChange={setJobRequirement}
            placeholder="Contoh: Wajib memahami React, TypeScript, REST API, testing, dan pengalaman minimal 2 tahun."
            helperText="Boleh isi ringkasan requirement dari lowongan kerja agar analisis lebih akurat terhadap posisi yang dituju."
            rows={8}
          />

          <StructuredTextarea
            id="notes"
            name="notes"
            label="Catatan tambahan"
            value={notes}
            onChange={setNotes}
            placeholder="Opsional. Contoh: Saya fresh graduate, ingin apply role junior backend."
            helperText="Gunakan bullet atau numbering untuk catatan penting agar konteks analisis lebih jelas."
            rows={6}
          />

          <div className="flex items-start gap-3 rounded-lg border bg-slate-50 p-4">
            <Checkbox
              id="consent"
              checked={consent}
              onCheckedChange={(value) => setConsent(Boolean(value))}
            />
            <div className="grid gap-1.5 leading-none">
              <Label
                htmlFor="consent"
                className="cursor-pointer text-sm font-medium text-slate-950"
              >
                Saya menyetujui pemrosesan sementara file CV.
              </Label>
              <p className="text-xs leading-5 text-muted-foreground">
                File digunakan untuk proses analisis dan tidak disimpan sebagai
                dokumen permanen setelah proses selesai. Saya juga memahami
                hasil analisis bersifat rekomendasi. Lihat{" "}
                <Link href="/privacy" className="font-medium text-primary">
                  Privacy Policy
                </Link>
                ,{" "}
                <Link href="/terms" className="font-medium text-primary">
                  Terms
                </Link>
                , atau{" "}
                <Link href="/contact" className="font-medium text-primary">
                  Contact
                </Link>
                .
              </p>
            </div>
          </div>

          {error && (
            <Alert variant="destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          {isSubmitting && (
            <div className="rounded-lg border border-primary/25 bg-primary/5 p-3">
              <div className="mb-2 flex items-center justify-between text-xs">
                <span className="font-medium text-slate-700">
                  {submitProgressLabel || "Memproses analisis"}
                </span>
                <span className="font-semibold text-primary">
                  {submitProgress}%
                </span>
              </div>
              <Progress value={submitProgress} className="h-2" />
            </div>
          )}

          <Button
            type="submit"
            disabled={!canSubmit}
            className="h-11 w-full justify-center"
          >
            {isSubmitting ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Memproses CV
              </>
            ) : (
              "Analisis CV"
            )}
          </Button>

          <p className="text-center text-xs leading-5 text-muted-foreground">
            Hasil analisis bersifat rekomendasi
          </p>
        </form>
      </CardContent>
    </Card>
  );
}
