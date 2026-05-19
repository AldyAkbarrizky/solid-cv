"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Loader2, Trash2 } from "lucide-react";

import { Button } from "@/components/ui/button";

type DeleteReviewButtonProps = {
  reviewId: string;
};

export function DeleteReviewButton({ reviewId }: DeleteReviewButtonProps) {
  const router = useRouter();
  const [isDeleting, setIsDeleting] = useState(false);

  async function handleDelete() {
    const confirmed = window.confirm(
      "Hapus hasil review ini? Data hasil analisis akan dihapus dari database.",
    );

    if (!confirmed) return;

    setIsDeleting(true);

    try {
      const response = await fetch(`/api/review/${reviewId}`, {
        method: "DELETE",
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result?.message || "Gagal menghapus hasil review.");
      }

      router.replace("/review?deleted=1");
      router.refresh();
    } catch (error) {
      const message =
        error instanceof Error
          ? error.message
          : "Gagal menghapus hasil review.";

      window.alert(message);
    } finally {
      setIsDeleting(false);
    }
  }

  return (
    <Button
      type="button"
      variant="outline"
      size="sm"
      className="border-rose-200 bg-white text-rose-700 hover:bg-rose-50 hover:text-rose-800"
      onClick={handleDelete}
      disabled={isDeleting}
    >
      {isDeleting ? (
        <>
          <Loader2 className="mr-1.5 h-4 w-4 animate-spin" />
          Menghapus
        </>
      ) : (
        <>
          <Trash2 className="mr-1.5 h-4 w-4" />
          Hapus hasil
        </>
      )}
    </Button>
  );
}
