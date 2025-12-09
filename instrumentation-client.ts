// This file configures the initialization of Sentry on the client.
// The added config here will be used whenever a users loads a page in their browser.
// https://docs.sentry.io/platforms/javascript/guides/nextjs/

import * as Sentry from "@sentry/nextjs";

const isProd = process.env.NODE_ENV === "production";

Sentry.init({
  dsn: "https://c2b872194266ad0556e1c953f6303e18@o4510506876403712.ingest.de.sentry.io/4510506877911120",

  // Add optional integrations for additional features
  integrations: [
    Sentry.replayIntegration(),
    Sentry.consoleLoggingIntegration({ levels: ["log", "warn", "error"] }),
  ],

  // Define how likely traces are sampled.
  //  - Development: 100% of traces for easier debugging
  //  - Production: 20% to reduce volume and cost
  tracesSampleRate: isProd ? 0.2 : 1.0,

  // Enable logs to be sent to Sentry
  enableLogs: true,

  // Define how likely Replay events are sampled.
  //  - Development: capture all sessions
  //  - Production: keep this lower for cost reasons
  replaysSessionSampleRate: isProd ? 0.05 : 1.0,

  // Define how likely Replay events are sampled when an error occurs.
  // Keep this at 100% so every error has an associated replay where possible.
  replaysOnErrorSampleRate: 1.0,

  // Enable sending user PII (Personally Identifiable Information)
  // https://docs.sentry.io/platforms/javascript/guides/nextjs/configuration/options/#sendDefaultPii
  sendDefaultPii: true,
});

export const onRouterTransitionStart = Sentry.captureRouterTransitionStart;