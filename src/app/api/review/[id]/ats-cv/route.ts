import { NextResponse } from "next/server";
import { eq } from "drizzle-orm";

import { db } from "@/db";
import { cvReviews } from "@/db/schema";
import { getCurrentUser } from "@/lib/session";
import { captureError } from "@/lib/observability";
import { isReviewExpired } from "@/lib/review/retention";
import { CVReviewResultSchema } from "@/lib/ai/cv-review-types";
import { generateATSCV } from "@/lib/ai/ai-client";
import { generateAtsCvPdf } from "@/lib/pdf/ats-cv-pdf";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

type GenerateATSCVRouteContext = {
  params: Promise<{
    id: string;
  }>;
};

type AtsProgressEvent = {
  type: "progress";
  progress: number;
  stage: string;
  message: string;
};

type AtsDoneEvent = {
  type: "done";
  progress: 100;
  filename: string;
  pdfBase64: string;
};

type AtsErrorEvent = {
  type: "error";
  progress: number;
  status: number;
  message: string;
};

type AtsStreamEvent = AtsProgressEvent | AtsDoneEvent | AtsErrorEvent;

type AtsResult = {
  pdfBuffer: Buffer;
  filename: string;
};

class AtsHttpError extends Error {
  status: number;
  responseBody: Record<string, unknown>;

  constructor(status: number, message: string) {
    super(message);
    this.status = status;
    this.responseBody = { message };
  }
}

function sanitizeFilename(value: string) {
  return value
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 80);
}

async function runGenerateAtsCv(
  reviewId: string,
  onProgress?: (event: AtsProgressEvent) => void,
): Promise<AtsResult> {
  const updateProgress = (
    progress: number,
    stage: string,
    message: string,
  ) => {
    onProgress?.({ type: "progress", progress, stage, message });
  };

  try {
    updateProgress(10, "load-review", "Memuat data hasil review.");

    const [review] = await db
      .select()
      .from(cvReviews)
      .where(eq(cvReviews.id, reviewId))
      .limit(1);

    if (!review) {
      throw new AtsHttpError(404, "Hasil review tidak ditemukan.");
    }

    if (isReviewExpired(review.expiresAt)) {
      throw new AtsHttpError(410, "Hasil review sudah kedaluwarsa.");
    }

    updateProgress(22, "access-check", "Memeriksa akses pengguna.");
    const currentUser = await getCurrentUser();

    if (review.userId && review.userId !== currentUser?.id) {
      throw new AtsHttpError(
        403,
        "Anda tidak memiliki akses ke hasil review ini.",
      );
    }

    if (!review.cvSourceMaskedText) {
      throw new AtsHttpError(
        400,
        "Review ini belum memiliki data sumber CV untuk generate ATS. Silakan review ulang CV terbaru.",
      );
    }

    const parsedReviewResult = CVReviewResultSchema.safeParse(review.resultJson);

    if (!parsedReviewResult.success) {
      throw new AtsHttpError(
        400,
        "Format hasil review tidak valid untuk generate ATS CV.",
      );
    }

    updateProgress(70, "ai-generate", "Menyusun CV ATS dari data CV dan review.");

    const atsResponse = await generateATSCV({
      cvText: review.cvSourceMaskedText,
      targetRole: review.targetRole,
      jobRequirement: review.jobRequirement || undefined,
      reviewResult: parsedReviewResult.data,
    });

    updateProgress(90, "pdf-generate", "Membuat file PDF CV ATS.");

    const pdfBuffer = generateAtsCvPdf(atsResponse.result);
    const filename = `solid-cv-ats-${sanitizeFilename(review.targetRole) || "hasil"}.pdf`;

    updateProgress(100, "done", "CV ATS siap diunduh.");

    return {
      pdfBuffer,
      filename,
    };
  } catch (error) {
    if (error instanceof AtsHttpError) {
      throw error;
    }

    captureError("GENERATE_ATS_CV_ERROR", error);
    throw new AtsHttpError(500, "Gagal membuat CV ATS. Silakan coba lagi.");
  }
}

function streamAtsResponse(reviewId: string) {
  const encoder = new TextEncoder();

  const stream = new ReadableStream<Uint8Array>({
    start(controller) {
      const emit = (event: AtsStreamEvent) => {
        controller.enqueue(encoder.encode(`${JSON.stringify(event)}\n`));
      };

      void (async () => {
        try {
          emit({
            type: "progress",
            progress: 4,
            stage: "start",
            message: "Menyiapkan pembuatan CV ATS.",
          });

          const result = await runGenerateAtsCv(reviewId, (event) => emit(event));

          emit({
            type: "done",
            progress: 100,
            filename: result.filename,
            pdfBase64: result.pdfBuffer.toString("base64"),
          });
        } catch (error) {
          emit({
            type: "error",
            progress: 100,
            status: error instanceof AtsHttpError ? error.status : 500,
            message:
              error instanceof AtsHttpError
                ? error.message
                : "Gagal membuat CV ATS. Silakan coba lagi.",
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

export async function POST(
  request: Request,
  context: GenerateATSCVRouteContext,
) {
  const { id } = await context.params;
  const isStreamMode = new URL(request.url).searchParams.get("stream") === "1";

  if (isStreamMode) {
    return streamAtsResponse(id);
  }

  try {
    const result = await runGenerateAtsCv(id);

    return new NextResponse(new Uint8Array(result.pdfBuffer), {
      headers: {
        "Content-Type": "application/pdf",
        "Content-Disposition": `attachment; filename="${result.filename}"`,
        "Cache-Control": "no-store",
      },
    });
  } catch (error) {
    if (error instanceof AtsHttpError) {
      return NextResponse.json(error.responseBody, { status: error.status });
    }

    captureError("GENERATE_ATS_CV_ERROR", error);

    return NextResponse.json(
      { message: "Gagal membuat CV ATS. Silakan coba lagi." },
      { status: 500 },
    );
  }
}
