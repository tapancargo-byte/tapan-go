import { NextResponse } from "next/server";
import { withRateLimit } from "@/lib/rateLimit";

async function handleRequest(req: Request) {
  return NextResponse.json(
    {
      ok: true,
      message: "Rate limit demo endpoint: request accepted",
    },
    { status: 200 },
  );
}

export const GET = withRateLimit("api", handleRequest);
export const POST = withRateLimit("api", handleRequest);
