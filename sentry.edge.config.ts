// This file configures the initialization of Sentry for edge features (middleware, edge routes, and so on).
// The config you add here will be used whenever one of the edge features is loaded.
// Note that this config is unrelated to the Vercel Edge Runtime and is also required when running locally.
// https://docs.sentry.io/platforms/javascript/guides/nextjs/

import * as Sentry from "@sentry/nextjs";

const isProd = process.env.NODE_ENV === "production";

Sentry.init({
  dsn: "https://c2b872194266ad0556e1c953f6303e18@o4510506876403712.ingest.de.sentry.io/4510506877911120",

  // Define how likely traces are sampled.
  //  - Development: 100% of traces
  //  - Production: 20% to balance visibility and cost
  tracesSampleRate: isProd ? 0.2 : 1.0,

  // Enable logs to be sent to Sentry
  enableLogs: true,

  integrations: [
    Sentry.consoleLoggingIntegration({ levels: ["log", "warn", "error"] }),
  ],

  // Enable sending user PII (Personally Identifiable Information)
  // https://docs.sentry.io/platforms/javascript/guides/nextjs/configuration/options/#sendDefaultPii
  sendDefaultPii: true,
});
