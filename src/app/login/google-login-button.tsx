"use client";

import { useState } from "react";
import { Loader2 } from "lucide-react";

import { Button } from "@/components/ui/button";
import { authClient } from "@/lib/auth-client";

export function GoogleLoginButton() {
  const [isLoading, setIsLoading] = useState(false);

  async function handleLogin() {
    setIsLoading(true);

    try {
      await authClient.signIn.social({
        provider: "google",
        callbackURL: "/review",
      });
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <Button
      type="button"
      variant="outline"
      className="h-11 w-full justify-center bg-white"
      onClick={handleLogin}
      disabled={isLoading}
    >
      {isLoading ? (
        <>
          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
          Mengarahkan ke Google
        </>
      ) : (
        "Masuk dengan Google"
      )}
    </Button>
  );
}
