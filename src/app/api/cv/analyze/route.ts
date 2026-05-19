import { NextResponse } from "next/server";
import { z } from "zod";

import { db } from "@/db";
import { cvReviews } from "@/db/schema";
import { generateCVReview } from "@/lib/ai/ai-client";
import { extractTextFromCV } from "@/lib/cv/extract-text";
import { maskPII } from "@/lib/cv/mask-pii";

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
  notes: z.string().trim().max(500).optional().default(""),
});

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

export async function POST(request: Request) {
  let reservedUsageEventId: string | null = null;
  let createdReviewId: string | null = null;

  try {
    const rateLimit = await checkReviewRateLimit(request, {
      route: "/api/cv/analyze",
    });

    if (!rateLimit.allowed) {
      return NextResponse.json(
        {
          message:
            "Terlalu banyak percobaan review CV. Coba lagi beberapa saat lagi.",
        },
        {
          status: 429,
          headers: {
            "Retry-After": String(rateLimit.retryAfterSeconds || 3600),
          },
        },
      );
    }

    const currentUser = await getCurrentUser();
    const quotaStatus = await getReviewQuotaStatus({
      input: request,
      userId: currentUser?.id ?? null,
    });

    if (!quotaStatus.allowed) {
      return NextResponse.json(
        {
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
        { status: 403 },
      );
    }

    const formData = await request.formData();

    const cvEntry = formData.get("cv");
    const targetRole = formData.get("targetRole");
    const notes = formData.get("notes") ?? "";

    const parsedInput = analyzeRequestSchema.safeParse({
      targetRole,
      notes,
    });

    if (!parsedInput.success) {
      return NextResponse.json(
        {
          message:
            "Input tidak valid. Pastikan posisi tujuan terisi dengan benar.",
        },
        { status: 400 },
      );
    }

    if (!(cvEntry instanceof File)) {
      return NextResponse.json(
        { message: "File CV wajib diunggah." },
        { status: 400 },
      );
    }

    if (cvEntry.size <= 0) {
      return NextResponse.json({ message: "File CV kosong." }, { status: 400 });
    }

    if (cvEntry.size > MAX_FILE_SIZE) {
      return NextResponse.json(
        { message: "Ukuran file melebihi batas maksimal 3 MB." },
        { status: 400 },
      );
    }

    const arrayBuffer = await cvEntry.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    const fileKind = detectFileKind(cvEntry, buffer);

    if (!fileKind) {
      return NextResponse.json(
        {
          message:
            "Format file tidak valid. Gunakan PDF atau DOCX asli, bukan file yang hanya diganti ekstensinya.",
        },
        { status: 400 },
      );
    }

    const extractedText = await extractTextFromCV({
      buffer,
      fileKind,
    });

    if (!extractedText || extractedText.length < 200) {
      return NextResponse.json(
        {
          message:
            "Teks CV terlalu sedikit atau tidak berhasil dibaca. Pastikan file tidak berupa hasil scan gambar.",
        },
        { status: 400 },
      );
    }

    if (extractedText.length > MAX_EXTRACTED_TEXT_CHARS) {
      return NextResponse.json(
        {
          message:
            "Isi CV terlalu panjang untuk dianalisis pada versi awal. Gunakan CV yang lebih ringkas, maksimal sekitar 3-5 halaman.",
        },
        { status: 400 },
      );
    }

    const maskedText = maskPII(extractedText);

    const quotaReservation = await reserveReviewQuota({
      input: request,
      userId: currentUser?.id ?? null,
    });

    if (!quotaReservation.allowed) {
      return NextResponse.json(
        {
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
        { status: 403 },
      );
    }

    reservedUsageEventId = quotaReservation.usageEventId ?? null;

    const aiResponse = await generateCVReview({
      cvText: maskedText,
      targetRole: parsedInput.data.targetRole,
      notes: parsedInput.data.notes,
    });

    const [createdReview] = await db
      .insert(cvReviews)
      .values({
        userId: currentUser?.id ?? null,
        targetRole: parsedInput.data.targetRole,
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
      await finalizeReservedReviewUsage({
        usageEventId: reservedUsageEventId,
        reviewId: createdReviewId,
      });
    }

    return NextResponse.json({
      reviewId: createdReview.id,
    });
  } catch (error) {
    if (reservedUsageEventId && !createdReviewId) {
      try {
        await releaseReservedReviewUsage(reservedUsageEventId);
      } catch (releaseError) {
        console.error("REVIEW_QUOTA_RELEASE_ERROR", {
          message:
            releaseError instanceof Error
              ? releaseError.message
              : "Unknown error",
        });
      }
    }

    console.error("CV_ANALYZE_ERROR", {
      message: error instanceof Error ? error.message : "Unknown error",
    });

    return NextResponse.json(
      {
        message:
          "Gagal memproses CV. Coba beberapa saat lagi atau gunakan file lain.",
      },
      { status: 500 },
    );
  }
}
