"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { Loader2, RefreshCw } from "lucide-react";
import { Button } from "@/components/ui/button";

type StatusPollerProps = {
  initialStatus: string;
};

const MAX_AUTO_POLLS = 8;
const POLL_INTERVAL_MS = 6000;

export function StatusPoller({ initialStatus }: StatusPollerProps) {
  const router = useRouter();
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [pollCount, setPollCount] = useState(0);
  const pollRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const isPending = initialStatus === "pending";

  const doRefresh = useCallback(() => {
    setIsRefreshing(true);
    router.refresh();
    setTimeout(() => setIsRefreshing(false), 1500);
  }, [router]);

  // Auto-poll while pending
  useEffect(() => {
    if (!isPending || pollCount >= MAX_AUTO_POLLS) return;

    pollRef.current = setTimeout(() => {
      setPollCount((c) => c + 1);
      doRefresh();
    }, POLL_INTERVAL_MS);

    return () => {
      if (pollRef.current) clearTimeout(pollRef.current);
    };
  }, [isPending, pollCount, doRefresh]);

  if (!isPending) return null;

  return (
    <div className="mt-5 flex flex-col gap-3">
      <Button
        type="button"
        variant="outline"
        className="w-full bg-white sm:w-auto"
        onClick={doRefresh}
        disabled={isRefreshing}
      >
        {isRefreshing ? (
          <>
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            Memperbarui...
          </>
        ) : (
          <>
            <RefreshCw className="mr-2 h-4 w-4" />
            Cek Status
          </>
        )}
      </Button>
      {pollCount < MAX_AUTO_POLLS ? (
        <p className="text-xs text-muted-foreground">
          Halaman akan otomatis diperbarui setiap beberapa detik.
        </p>
      ) : (
        <p className="text-xs text-muted-foreground">
          Status belum berubah. Kalau sudah bayar, coba refresh manual atau
          hubungi support jika lebih dari 10 menit.
        </p>
      )}
    </div>
  );
}
