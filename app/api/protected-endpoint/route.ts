import { NextResponse } from "next/server";
import { withAuth } from "@/lib/api/withAuth";

// Simple protected endpoint to demonstrate authentication enforcement.
export const GET = withAuth(async (req, context) => {
  return NextResponse.json(
    {
      ok: true,
      message: "Protected endpoint accessed",
      userId: context.userId,
      userRole: context.userRole,
    },
    { status: 200 },
  );
});
