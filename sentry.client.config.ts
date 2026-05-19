import * as Sentry from "@sentry/nextjs";

Sentry.init({
  dsn: process.env.NEXT_PUBLIC_SENTRY_DSN,

  enabled: Boolean(process.env.NEXT_PUBLIC_SENTRY_DSN),

  tracesSampleRate: 0.1,

  // Replays: 10% session normal, 100% session yang ada error
  replaysSessionSampleRate: 0.1,
  replaysOnErrorSampleRate: 1.0,

  integrations: [Sentry.replayIntegration()],

  debug: false,
});
