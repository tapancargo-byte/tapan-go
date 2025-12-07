import { NextResponse } from "next/server";
import { withAuth } from "@/lib/api/withAuth";

// Operator-only test endpoint used to validate RBAC middleware.
// Customers should be denied, operators allowed, admins allowed via elevated privileges.
export const GET = withAuth(
  async (req, context) => {
    return NextResponse.json(
      {
        message: "Operator-only test endpoint",
        access: "granted",
        userId: context.userId,
        userRole: context.userRole,
      },
      { status: 200 },
    );
  },
  {
    allowedRoles: ["operator"],
  },
);
