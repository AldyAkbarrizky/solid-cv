"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Loader2, RefreshCw } from "lucide-react";

import { Button } from "@/components/ui/button";

type CheckPaymentStatusButtonProps = {
  paymentOrderId: string;
};

export function CheckPaymentStatusButton({
  paymentOrderId,
}: CheckPaymentStatusButtonProps) {
  const router = useRouter();
  const [isChecking, setIsChecking] = useState(false);

  async function handleCheckStatus() {
    setIsChecking(true);

    try {
      const response = await fetch(
        `/api/admin/payments/${paymentOrderId}/check-status`,
        {
          method: "POST",
        },
      );

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result?.message || "Gagal mengecek status.");
      }

      router.refresh();
    } catch (error) {
      const message =
        error instanceof Error ? error.message : "Gagal mengecek status.";

      window.alert(message);
    } finally {
      setIsChecking(false);
    }
  }

  return (
    <Button
      type="button"
      variant="outline"
      size="sm"
      className="bg-white"
      onClick={handleCheckStatus}
      disabled={isChecking}
    >
      {isChecking ? (
        <>
          <Loader2 className="mr-1.5 h-4 w-4 animate-spin" />
          Checking
        </>
      ) : (
        <>
          <RefreshCw className="mr-1.5 h-4 w-4" />
          Check Duitku
        </>
      )}
    </Button>
  );
}
