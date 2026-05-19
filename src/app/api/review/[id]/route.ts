import { NextResponse } from "next/server";
import { and, eq } from "drizzle-orm";

import { db } from "@/db";
import { cvReviews } from "@/db/schema";
import { getCurrentUser } from "@/lib/session";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

type DeleteReviewRouteContext = {
  params: Promise<{
    id: string;
  }>;
};

export async function DELETE(
  _request: Request,
  context: DeleteReviewRouteContext,
) {
  try {
    const currentUser = await getCurrentUser();

    if (!currentUser?.id) {
      return NextResponse.json(
        { message: "Anda perlu login untuk menghapus hasil review." },
        { status: 401 },
      );
    }

    const { id } = await context.params;

    const [deletedReview] = await db
      .delete(cvReviews)
      .where(and(eq(cvReviews.id, id), eq(cvReviews.userId, currentUser.id)))
      .returning({
        id: cvReviews.id,
      });

    if (!deletedReview) {
      return NextResponse.json(
        { message: "Hasil review tidak ditemukan." },
        { status: 404 },
      );
    }

    return NextResponse.json({
      message: "Hasil review berhasil dihapus.",
    });
  } catch (error) {
    console.error("DELETE_REVIEW_ERROR", {
      message: error instanceof Error ? error.message : "Unknown error",
    });

    return NextResponse.json(
      {
        message: "Gagal menghapus hasil review.",
      },
      { status: 500 },
    );
  }
}
