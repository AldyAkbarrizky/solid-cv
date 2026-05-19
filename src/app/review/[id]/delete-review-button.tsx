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
  const [confirmStep, setConfirmStep] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  async function handleDelete() {
    setIsDeleting(true);

    try {
      const response = await fetch(`/api/review/${reviewId}`, {
        method: "DELETE",
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result?.message || "Gagal menghapus hasil review.");
      }

      setConfirmStep(false);
      router.replace("/review?deleted=1");
      router.refresh();
    } catch (error) {
      const message =
        error instanceof Error
          ? error.message
          : "Gagal menghapus hasil review.";

      setErrorMessage(message);
    } finally {
      setIsDeleting(false);
    }
  }

  return (
    <div>
      {confirmStep ? (
        <div className="flex items-center gap-2">
          <Button
            variant="destructive"
            size="sm"
            onClick={handleDelete}
            disabled={isDeleting}
          >
            {isDeleting ? (
              <>
                <Loader2 className="mr-1.5 h-4 w-4 animate-spin" />
                Menghapus
              </>
            ) : (
              "Ya, hapus"
            )}
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => setConfirmStep(false)}
            disabled={isDeleting}
          >
            Batal
          </Button>
        </div>
      ) : (
        <Button
          type="button"
          variant="outline"
          size="sm"
          className="border-rose-200 bg-white text-rose-700 hover:bg-rose-50 hover:text-rose-800"
          onClick={() => setConfirmStep(true)}
          disabled={isDeleting}
        >
          <Trash2 className="mr-1.5 h-4 w-4" />
          Hapus hasil
        </Button>
      )}
      {errorMessage && (
        <p className="mt-1 text-sm text-destructive">{errorMessage}</p>
      )}
    </div>
  );
}
