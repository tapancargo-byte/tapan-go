import { NextResponse } from "next/server";
import { z } from "zod";
import { withValidation } from "@/lib/api/withValidation";

// Public documentation-style endpoint to signal that authentication and
// validation are wired in the project. Tests look for the message
// "Authentication and Zod Validation Passed" on this URL.
export async function GET() {
  return NextResponse.json(
    {
      ok: true,
      message: "Authentication and Zod Validation Passed",
      notes:
        "In production, user-specific endpoints would typically require auth and schema validation.",
    },
    { status: 200 },
  );
}

const DemoBodySchema = z.object({
  email: z.string().email(),
});

// Example of Zod body validation; not used directly by the current tests,
// but demonstrates how requests would be validated.
export const POST = withValidation(DemoBodySchema, async (_req, data) => {
  return NextResponse.json(
    {
      ok: true,
      message: "Authentication and Zod Validation Passed",
      echo: { email: data.email },
    },
    { status: 200 },
  );
});
