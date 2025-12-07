import { NextResponse } from "next/server";
import { withAuth } from "@/lib/api/withAuth";

export const GET = withAuth(async (req, context) => {
  return NextResponse.json(
    {
      ok: true,
      message: "Protected resource accessed",
      userId: context.userId,
    },
    { status: 200 },
  );
});
