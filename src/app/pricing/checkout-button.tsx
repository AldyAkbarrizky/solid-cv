"use client";

import { useState } from "react";
import { Loader2 } from "lucide-react";

import { Button } from "@/components/ui/button";

type CheckoutButtonProps = {
  planCode: string;
  disabled?: boolean;
};

export function CheckoutButton({ planCode, disabled }: CheckoutButtonProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  async function handleCheckout() {
    setErrorMessage(null);
    setIsLoading(true);

    try {
      const response = await fetch("/api/billing/checkout", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          planCode,
        }),
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result?.message || "Gagal membuat pembayaran.");
      }

      window.location.href = result.paymentUrl;
    } catch (error) {
      const message =
        error instanceof Error ? error.message : "Gagal membuat pembayaran.";

      setErrorMessage(message);
      setIsLoading(false);
    }
  }

  return (
    <>
      <Button
        type="button"
        className="h-11 w-full"
        onClick={handleCheckout}
        disabled={disabled || isLoading}
      >
        {isLoading ? (
          <>
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            Membuat pembayaran
          </>
        ) : (
          "Bayar"
        )}
      </Button>
      {errorMessage && (
        <p className="mt-2 text-center text-sm text-destructive">
          {errorMessage}
        </p>
      )}
    </>
  );
}
