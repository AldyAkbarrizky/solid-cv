/**
 * Thin observability wrapper.
 *
 * - Selalu log ke console (existing behaviour tetap jalan).
 * - Kalau SENTRY_DSN diisi, error/warning juga dikirim ke Sentry.
 * - Kalau DSN tidak ada, Sentry SDK adalah no-op — tidak ada overhead.
 *
 * Usage:
 *   import { captureError, captureWarning } from "@/lib/observability";
 *   captureError("CV_ANALYZE_ERROR", error, { userId, fileSize });
 *   captureWarning("CV_TEXT_EXTRACTION_SHORT", { charCount, fileKind });
 */

import * as Sentry from "@sentry/nextjs";

type ErrorContext = Record<string, unknown>;

/**
 * Log error ke console + Sentry (jika dikonfigurasi).
 * Gunakan ini sebagai pengganti console.error untuk error yang perlu dilacak.
 */
export function captureError(
  label: string,
  error: unknown,
  context?: ErrorContext,
): void {
  const message = error instanceof Error ? error.message : String(error);
  console.error(label, { message, ...context });

  Sentry.withScope((scope) => {
    scope.setTag("label", label);
    if (context) scope.setExtras(context);
    if (error instanceof Error) {
      Sentry.captureException(error);
    } else {
      Sentry.captureMessage(`${label}: ${message}`, "error");
    }
  });
}

/**
 * Log warning ke console + Sentry (jika dikonfigurasi).
 * Gunakan ini sebagai pengganti console.warn untuk signal yang perlu perhatian.
 */
export function captureWarning(label: string, context?: ErrorContext): void {
  console.warn(label, context ?? {});

  Sentry.withScope((scope) => {
    scope.setTag("label", label);
    if (context) scope.setExtras(context);
    Sentry.captureMessage(label, "warning");
  });
}
