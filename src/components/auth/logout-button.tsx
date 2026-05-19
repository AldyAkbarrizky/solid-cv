"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Loader2, LogOut } from "lucide-react";

import { Button } from "@/components/ui/button";
import { authClient } from "@/lib/auth-client";
import { cn } from "@/lib/utils";

type LogoutButtonProps = {
  variant?: "default" | "outline" | "ghost";
  size?: "default" | "sm" | "lg" | "icon";
  className?: string;
};

export function LogoutButton({
  variant = "outline",
  size = "sm",
  className,
}: LogoutButtonProps) {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);

  async function handleLogout() {
    setIsLoading(true);

    await authClient.signOut({
      fetchOptions: {
        onSuccess: () => {
          router.push("/");
          router.refresh();
        },
        onError: () => {
          setIsLoading(false);
          window.alert("Gagal logout. Coba beberapa saat lagi.");
        },
      },
    });
  }

  return (
    <Button
      type="button"
      variant={variant}
      size={size}
      className={cn("bg-white", className)}
      onClick={handleLogout}
      disabled={isLoading}
    >
      {isLoading ? (
        <>
          <Loader2 className="mr-1.5 h-4 w-4 animate-spin" />
          Logout
        </>
      ) : (
        <>
          <LogOut className="mr-1.5 h-4 w-4" />
          Logout
        </>
      )}
    </Button>
  );
}
