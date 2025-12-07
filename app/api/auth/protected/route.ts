import { NextResponse } from "next/server";
import { z } from "zod";
import { withAuthAndValidation } from "@/lib/api/withAuth";

const BodySchema = z.object({
  action: z.literal("ping"),
});

// Authenticated + validated endpoint to showcase combined middleware behavior.
export const POST = withAuthAndValidation(
  BodySchema,
  async (req, data, context) => {
    return NextResponse.json(
      {
        ok: true,
        message: "Authentication and Zod Validation Passed",
        userId: context.userId,
        userRole: context.userRole,
        action: data.action,
      },
      { status: 200 },
    );
  },
);

// Provide a lightweight GET handler mainly so navigation to this URL
// returns a helpful description instead of a 405.
export async function GET() {
  return NextResponse.json(
    {
      ok: true,
      info:
        "Use POST with JSON { action: 'ping' } and a valid session to exercise auth + Zod validation.",
    },
    { status: 200 },
  );
}
