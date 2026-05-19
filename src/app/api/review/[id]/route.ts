import { NextResponse } from "next/server";
import { eq } from "drizzle-orm";

import { db } from "@/db";
import { cvReviews } from "@/db/schema";

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
    const { id } = await context.params;

    const [deletedReview] = await db
      .delete(cvReviews)
      .where(eq(cvReviews.id, id))
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
