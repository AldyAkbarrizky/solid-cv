"use client";

import { FormEvent, useMemo, useState } from "react";
import { AlertCircle, CheckCircle2, FileUp, Loader2, X } from "lucide-react";

import { Alert, AlertDescription } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import Link from "next/link";

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

export function ReviewForm() {
  const [file, setFile] = useState<File | null>(null);
  const [targetRole, setTargetRole] = useState("");
  const [notes, setNotes] = useState("");
  const [consent, setConsent] = useState(false);
  const [error, setError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

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

    try {
      const formData = new FormData();
      formData.append("cv", file);
      formData.append("targetRole", targetRole.trim());
      formData.append("notes", notes.trim());

      const response = await fetch("/api/cv/analyze", {
        method: "POST",
        body: formData,
      });

      const result = await response.json();

      if (!response.ok) {
        if (response.status === 403) {
          window.setTimeout(() => {
            window.location.reload();
          }, 800);
        }

        throw new Error(result?.message || "Gagal menganalisis CV.");
      }

      window.location.href = `/review/${result.reviewId}`;
    } catch (err) {
      const message =
        err instanceof Error
          ? err.message
          : "Terjadi kesalahan saat memproses CV.";

      setError(message);
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

          <div className="grid gap-2">
            <Label htmlFor="notes">Catatan tambahan</Label>
            <Textarea
              id="notes"
              name="notes"
              value={notes}
              onChange={(event) => setNotes(event.target.value)}
              placeholder="Opsional. Contoh: Saya fresh graduate, ingin apply role junior backend."
              className="min-h-24 bg-white"
            />
          </div>

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
