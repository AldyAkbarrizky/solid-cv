import { NextResponse } from "next/server";
import { z } from "zod";

import { db } from "@/db";
import { cvReviews } from "@/db/schema";
import { generateCVReview } from "@/lib/ai/ai-client";
import { extractTextFromCV } from "@/lib/cv/extract-text";
import { maskPII } from "@/lib/cv/mask-pii";

import { captureError, captureWarning } from "@/lib/observability";
import { checkReviewRateLimit } from "@/lib/security/rate-limit";
import { getReviewExpiresAt } from "@/lib/review/retention";
import { getCurrentUser } from "@/lib/session";
import {
  finalizeReservedReviewUsage,
  getReviewQuotaStatus,
  releaseReservedReviewUsage,
  reserveReviewQuota,
} from "@/lib/quota/review-quota";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const MAX_FILE_SIZE = 3 * 1024 * 1024;
const MAX_EXTRACTED_TEXT_CHARS = 32_000;

const analyzeRequestSchema = z.object({
  targetRole: z.string().trim().min(3).max(120),
  jobRequirement: z.string().trim().max(4000).optional().default(""),
  notes: z.string().trim().max(4000).optional().default(""),
});

type AnalyzeProgressEvent = {
  type: "progress";
  progress: number;
  stage: string;
  message: string;
};

type AnalyzeDoneEvent = {
  type: "done";
  progress: 100;
  reviewId: string;
};

type AnalyzeErrorEvent = {
  type: "error";
  progress: number;
  status: number;
  message: string;
  retryAfterSeconds?: number;
};

type AnalyzeStreamEvent =
  | AnalyzeProgressEvent
  | AnalyzeDoneEvent
  | AnalyzeErrorEvent;

type AnalyzeSuccessResult = {
  reviewId: string;
};

class AnalyzeHttpError extends Error {
  status: number;
  responseBody: Record<string, unknown>;
  responseHeaders?: Record<string, string>;

  constructor(
    status: number,
    message: string,
    options?: {
      responseBody?: Record<string, unknown>;
      responseHeaders?: Record<string, string>;
    },
  ) {
    super(message);
    this.status = status;
    this.responseBody = options?.responseBody ?? { message };
    this.responseHeaders = options?.responseHeaders;
  }
}

function getFileExtension(filename: string) {
  return filename.split(".").pop()?.toLowerCase();
}

function detectFileKind(file: File, buffer: Buffer): "pdf" | "docx" | null {
  const extension = getFileExtension(file.name);

  const startsWithPdfMagicBytes = buffer.subarray(0, 4).toString() === "%PDF";
  const startsWithZipMagicBytes = buffer.subarray(0, 2).toString() === "PK";

  if (
    extension === "pdf" &&
    file.type === "application/pdf" &&
    startsWithPdfMagicBytes
  ) {
    return "pdf";
  }

  if (
    extension === "docx" &&
    file.type ===
      "application/vnd.openxmlformats-officedocument.wordprocessingml.document" &&
    startsWithZipMagicBytes
  ) {
    return "docx";
  }

  return null;
}

function toErrorMessage(error: unknown) {
  if (error instanceof AnalyzeHttpError) {
    const rawMessage = error.responseBody.message;
    return typeof rawMessage === "string" ? rawMessage : error.message;
  }

  if (error instanceof Error) {
    return error.message;
  }

  return "Gagal memproses CV. Coba beberapa saat lagi atau gunakan file lain.";
}

async function runAnalyzeCV(
  request: Request,
  onProgress?: (event: AnalyzeProgressEvent) => void,
): Promise<AnalyzeSuccessResult> {
  let reservedUsageEventId: string | null = null;
  let createdReviewId: string | null = null;

  const updateProgress = (
    progress: number,
    stage: string,
    message: string,
  ) => {
    onProgress?.({ type: "progress", progress, stage, message });
  };

  try {
    updateProgress(6, "rate-limit", "Memeriksa batas percobaan.");

    const rateLimit = await checkReviewRateLimit(request, {
      route: "/api/cv/analyze",
    });

    if (!rateLimit.allowed) {
      throw new AnalyzeHttpError(
        429,
        "Terlalu banyak percobaan review CV. Coba lagi beberapa saat lagi.",
        {
          responseBody: {
            message:
              "Terlalu banyak percobaan review CV. Coba lagi beberapa saat lagi.",
          },
          responseHeaders: {
            "Retry-After": String(rateLimit.retryAfterSeconds || 3600),
          },
        },
      );
    }

    updateProgress(14, "quota-check", "Memeriksa kuota review.");

    const currentUser = await getCurrentUser();
    const quotaStatus = await getReviewQuotaStatus({
      input: request,
      userId: currentUser?.id ?? null,
    });

    if (!quotaStatus.allowed) {
      throw new AnalyzeHttpError(
        403,
        currentUser
          ? "Kuota review CV bulan ini sudah habis."
          : "Kuota guest sudah habis. Masuk untuk mendapatkan kuota review tambahan.",
        {
          responseBody: {
            message: currentUser
              ? "Kuota review CV bulan ini sudah habis."
              : "Kuota guest sudah habis. Masuk untuk mendapatkan kuota review tambahan.",
            quota: {
              planCode: quotaStatus.planCode,
              limit: quotaStatus.limit,
              used: quotaStatus.used,
              remaining: quotaStatus.remaining,
              periodEnd: quotaStatus.periodEnd,
            },
          },
        },
      );
    }

    updateProgress(22, "form-parse", "Membaca data upload.");

    const formData = await request.formData();
    const cvEntry = formData.get("cv");
    const targetRole = formData.get("targetRole");
    const jobRequirement = formData.get("jobRequirement") ?? "";
    const notes = formData.get("notes") ?? "";

    const parsedInput = analyzeRequestSchema.safeParse({
      targetRole,
      jobRequirement,
      notes,
    });

    if (!parsedInput.success) {
      const fieldErrors = parsedInput.error.flatten().fieldErrors;

      if (fieldErrors.targetRole?.length) {
        throw new AnalyzeHttpError(
          400,
          "Posisi tujuan tidak valid. Isi minimal 3 karakter dan maksimal 120 karakter.",
        );
      }

      if (fieldErrors.jobRequirement?.length) {
        throw new AnalyzeHttpError(
          400,
          "Requirement pekerjaan terlalu panjang. Maksimal 4000 karakter.",
        );
      }

      if (fieldErrors.notes?.length) {
        throw new AnalyzeHttpError(
          400,
          "Catatan tambahan terlalu panjang. Maksimal 4000 karakter.",
        );
      }

      throw new AnalyzeHttpError(
        400,
        "Input tidak valid. Periksa kembali data yang Anda isi.",
      );
    }

    if (!(cvEntry instanceof File)) {
      throw new AnalyzeHttpError(400, "File CV wajib diunggah.");
    }

    if (cvEntry.size <= 0) {
      throw new AnalyzeHttpError(400, "File CV kosong.");
    }

    if (cvEntry.size > MAX_FILE_SIZE) {
      throw new AnalyzeHttpError(
        400,
        "Ukuran file melebihi batas maksimal 3 MB.",
      );
    }

    updateProgress(32, "file-validate", "Memvalidasi format file.");

    const arrayBuffer = await cvEntry.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);
    const fileKind = detectFileKind(cvEntry, buffer);

    if (!fileKind) {
      throw new AnalyzeHttpError(
        400,
        "Format file tidak valid. Gunakan PDF atau DOCX asli, bukan file yang hanya diganti ekstensinya.",
      );
    }

    updateProgress(46, "extract-text", "Mengekstrak teks dari CV.");

    const extractedText = await extractTextFromCV({
      buffer,
      fileKind,
    });

    if (!extractedText || extractedText.length < 200) {
      captureWarning("CV_TEXT_EXTRACTION_SHORT", {
        charCount: extractedText?.length ?? 0,
        fileKind,
      });

      throw new AnalyzeHttpError(
        400,
        "Teks CV terlalu sedikit atau tidak berhasil dibaca. Pastikan file tidak berupa hasil scan gambar.",
      );
    }

    if (extractedText.length > MAX_EXTRACTED_TEXT_CHARS) {
      throw new AnalyzeHttpError(
        400,
        "Isi CV terlalu panjang untuk dianalisis pada versi awal. Gunakan CV yang lebih ringkas, maksimal sekitar 3-5 halaman.",
      );
    }

    updateProgress(56, "mask-pii", "Melakukan masking data sensitif.");
    const maskedText = maskPII(extractedText);

    updateProgress(66, "quota-reserve", "Mengunci kuota review.");

    const quotaReservation = await reserveReviewQuota({
      input: request,
      userId: currentUser?.id ?? null,
    });

    if (!quotaReservation.allowed) {
      throw new AnalyzeHttpError(
        403,
        currentUser
          ? "Kuota review CV bulan ini sudah habis."
          : "Kuota guest sudah habis. Masuk untuk mendapatkan kuota review tambahan.",
        {
          responseBody: {
            message: currentUser
              ? "Kuota review CV bulan ini sudah habis."
              : "Kuota guest sudah habis. Masuk untuk mendapatkan kuota review tambahan.",
            quota: {
              planCode: quotaReservation.planCode,
              limit: quotaReservation.limit,
              used: quotaReservation.used,
              remaining: quotaReservation.remaining,
              periodEnd: quotaReservation.periodEnd,
            },
          },
        },
      );
    }

    reservedUsageEventId = quotaReservation.usageEventId ?? null;

    updateProgress(80, "ai-review", "Menganalisis CV dengan AI.");

    const aiResponse = await generateCVReview({
      cvText: maskedText,
      targetRole: parsedInput.data.targetRole,
      jobRequirement: parsedInput.data.jobRequirement,
      notes: parsedInput.data.notes,
    });

    updateProgress(90, "save-review", "Menyimpan hasil review.");

    const [createdReview] = await db
      .insert(cvReviews)
      .values({
        userId: currentUser?.id ?? null,
        targetRole: parsedInput.data.targetRole,
        jobRequirement: parsedInput.data.jobRequirement || null,
        cvSourceMaskedText: maskedText,
        overallScore: aiResponse.result.overallScore,
        resultJson: aiResponse.result,
        aiProvider: aiResponse.provider,
        aiModel: aiResponse.model,
        inputTokens: aiResponse.inputTokens,
        outputTokens: aiResponse.outputTokens,
        expiresAt: getReviewExpiresAt(),
      })
      .returning({
        id: cvReviews.id,
      });

    createdReviewId = createdReview.id;

    if (reservedUsageEventId) {
      updateProgress(96, "quota-finalize", "Menyelesaikan pencatatan kuota.");
      await finalizeReservedReviewUsage({
        usageEventId: reservedUsageEventId,
        reviewId: createdReviewId,
      });
    }

    updateProgress(100, "done", "Analisis selesai.");

    return {
      reviewId: createdReview.id,
    };
  } catch (error) {
    if (reservedUsageEventId && !createdReviewId) {
      try {
        await releaseReservedReviewUsage(reservedUsageEventId);
      } catch (releaseError) {
        captureError("REVIEW_QUOTA_RELEASE_ERROR", releaseError);
      }
    }

    if (error instanceof AnalyzeHttpError) {
      throw error;
    }

    captureError("CV_ANALYZE_ERROR", error);
    throw new AnalyzeHttpError(
      500,
      "Gagal memproses CV. Coba beberapa saat lagi atau gunakan file lain.",
    );
  }
}

function jsonErrorResponse(error: AnalyzeHttpError) {
  return NextResponse.json(error.responseBody, {
    status: error.status,
    headers: error.responseHeaders,
  });
}

function streamAnalyzeResponse(request: Request) {
  const encoder = new TextEncoder();

  const stream = new ReadableStream<Uint8Array>({
    start(controller) {
      const emit = (event: AnalyzeStreamEvent) => {
        controller.enqueue(encoder.encode(`${JSON.stringify(event)}\n`));
      };

      void (async () => {
        try {
          emit({
            type: "progress",
            progress: 2,
            stage: "start",
            message: "Menyiapkan analisis CV.",
          });

          const result = await runAnalyzeCV(request, (event) => emit(event));

          emit({
            type: "done",
            progress: 100,
            reviewId: result.reviewId,
          });
        } catch (error) {
          const status = error instanceof AnalyzeHttpError ? error.status : 500;
          const retryAfterRaw =
            error instanceof AnalyzeHttpError
              ? error.responseHeaders?.["Retry-After"]
              : undefined;
          const retryAfterSeconds = retryAfterRaw
            ? Number.parseInt(retryAfterRaw, 10)
            : undefined;

          emit({
            type: "error",
            progress: 100,
            status,
            message: toErrorMessage(error),
            retryAfterSeconds:
              Number.isFinite(retryAfterSeconds) && retryAfterSeconds
                ? retryAfterSeconds
                : undefined,
          });
        } finally {
          controller.close();
        }
      })();
    },
  });

  return new Response(stream, {
    headers: {
      "Content-Type": "application/x-ndjson; charset=utf-8",
      "Cache-Control": "no-store, no-transform",
      Connection: "keep-alive",
    },
  });
}

export async function POST(request: Request) {
  const isStreamMode = new URL(request.url).searchParams.get("stream") === "1";

  if (isStreamMode) {
    return streamAnalyzeResponse(request);
  }

  try {
    const result = await runAnalyzeCV(request);

    return NextResponse.json({
      reviewId: result.reviewId,
    });
  } catch (error) {
    if (error instanceof AnalyzeHttpError) {
      return jsonErrorResponse(error);
    }

    captureError("CV_ANALYZE_ERROR", error);

    return NextResponse.json(
      {
        message:
          "Gagal memproses CV. Coba beberapa saat lagi atau gunakan file lain.",
      },
      { status: 500 },
    );
  }
}
