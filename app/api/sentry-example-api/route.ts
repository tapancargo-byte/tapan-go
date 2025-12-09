import { NextResponse } from "next/server";
import * as Sentry from "@sentry/nextjs";

export const dynamic = "force-dynamic";

class SentryExampleAPIError extends Error {
  constructor(message: string | undefined) {
    super(message);
    this.name = "SentryExampleAPIError";
  }
}

// A faulty API route to test Sentry's error monitoring
export async function GET() {
  const { logger } = Sentry;

  return Sentry.startSpan(
    {
      op: "http.server",
      name: "GET /api/sentry-example-api",
    },
    async () => {
      logger.info("Handling Sentry example API request", { route: "/api/sentry-example-api" });

      try {
        throw new SentryExampleAPIError(
          "This error is raised on the backend called by the example page.",
        );
      } catch (error) {
        Sentry.captureException(error);

        logger.error(
          logger.fmt`Sentry example API error thrown: ${
            error instanceof Error ? error.message : "unknown error"
          }`,
        );

        return NextResponse.json(
          { error: "Sentry example API error triggered" },
          { status: 500 },
        );
      }
    },
  );
}
