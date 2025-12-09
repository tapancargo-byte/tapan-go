import { NextResponse } from "next/server";
import * as Sentry from "@sentry/nextjs";

export const dynamic = "force-dynamic";

// GET /api/sentry-self-test
// Lightweight endpoint to verify that Sentry is wired correctly.
// - Creates a top-level self-test span
// - Logs start/completion
// - Captures a synthetic error annotated as a self-test
export async function GET() {
  const { logger } = Sentry;

  return Sentry.startSpan(
    {
      op: "self-test",
      name: "sentry:self-test",
    },
    async (span) => {
      try {
        span.setAttribute("self_test", true);
        span.setAttribute("env", process.env.NODE_ENV ?? "unknown");

        logger.info("Sentry self-test started", {
          env: process.env.NODE_ENV ?? "unknown",
        });

        await Sentry.startSpan(
          {
            op: "self-test.step",
            name: "sentry:self-test:synthetic-operation",
          },
          async () => {
            // No-op synthetic step to show up in traces
          },
        );

        const syntheticError = new Error("Sentry self-test synthetic error");
        Sentry.captureException(syntheticError, {
          tags: { "self-test": "true" },
          extra: { source: "api/sentry-self-test" },
        });

        logger.info("Sentry self-test completed", { ok: true });

        return NextResponse.json(
          {
            ok: true,
            message:
              "Sentry self-test event sent. Check Sentry issues, performance, and logs for 'sentry:self-test'.",
          },
          { status: 200 },
        );
      } catch (error) {
        Sentry.captureException(error, {
          tags: { "self-test": "failed" },
          extra: { source: "api/sentry-self-test" },
        });

        logger.error(
          logger.fmt`Sentry self-test failed: ${
            error instanceof Error ? error.message : "unknown error"
          }`,
        );

        return NextResponse.json(
          {
            ok: false,
            error:
              "Sentry self-test failed. Check Sentry issues/logs for details (tag: self-test=failed).",
          },
          { status: 500 },
        );
      }
    },
  );
}
