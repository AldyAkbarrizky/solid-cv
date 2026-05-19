import * as Sentry from "@sentry/nextjs";

Sentry.init({
  dsn: process.env.SENTRY_DSN,

  // Hanya aktif kalau DSN diisi
  enabled: Boolean(process.env.SENTRY_DSN),

  // Sample rate untuk performance tracing (0 = off, 1 = semua request)
  tracesSampleRate: 0.1,

  // Jangan log debug ke console di production
  debug: false,
});
