/**
 * Cleanup job: hapus cv_reviews yang sudah melewati expires_at.
 *
 * Dipanggil oleh Vercel Cron setiap hari jam 03:00 UTC (lihat vercel.json).
 * Bisa juga dipanggil manual dengan curl saat butuh pembersihan mendesak.
 *
 * Auth: pakai header  Authorization: Bearer {CRON_SECRET}
 * CRON_SECRET di-set di environment variable (Vercel auto-menyediakan ini
 * untuk cron jobs, atau bisa diisi manual di .env.local untuk testing).
 *
 * Selain cv_reviews, job ini juga membersihkan review_attempts yang sudah
 * lebih dari 48 jam — ini data rate-limit yang tidak perlu disimpan lama.
 */

import { NextResponse } from "next/server";
import { lt } from "drizzle-orm";

import { db } from "@/db";
import { cvReviews, reviewAttempts } from "@/db/schema";
import { captureError } from "@/lib/observability";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

function isAuthorized(request: Request): boolean {
  const secret = process.env.CRON_SECRET;

  if (!secret) {
    // Kalau CRON_SECRET tidak diset, tolak semua request untuk safety
    return false;
  }

  const authHeader = request.headers.get("authorization");
  return authHeader === `Bearer ${secret}`;
}

export async function POST(request: Request) {
  if (!isAuthorized(request)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const now = new Date();

    // Hapus cv_reviews yang expires_at-nya sudah lewat
    const deletedReviews = await db
      .delete(cvReviews)
      .where(lt(cvReviews.expiresAt, now))
      .returning({ id: cvReviews.id });

    // Hapus review_attempts lebih dari 48 jam (batas maksimum rate-limit window)
    const cutoff48h = new Date(now.getTime() - 48 * 60 * 60 * 1000);
    const deletedAttempts = await db
      .delete(reviewAttempts)
      .where(lt(reviewAttempts.createdAt, cutoff48h))
      .returning({ id: reviewAttempts.id });

    const result = {
      deletedReviews: deletedReviews.length,
      deletedAttempts: deletedAttempts.length,
      runAt: now.toISOString(),
    };

    console.log("CLEANUP_JOB_DONE", result);

    return NextResponse.json(result);
  } catch (error) {
    captureError("CLEANUP_JOB_ERROR", error);
    return NextResponse.json(
      { error: "Cleanup failed" },
      { status: 500 },
    );
  }
}
