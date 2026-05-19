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

  async function handleCheckout() {
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

      window.alert(message);
      setIsLoading(false);
    }
  }

  return (
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
        "Bayar dengan Duitku"
      )}
    </Button>
  );
}
