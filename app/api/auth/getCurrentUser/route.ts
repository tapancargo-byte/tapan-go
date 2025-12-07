import { NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth";

/**
 * GET /api/auth/getCurrentUser
 * Returns the current authenticated user's information
 */
export async function GET() {
  try {
    const user = await getCurrentUser();

    if (!user) {
      return NextResponse.json(
        { 
          error: "Not authenticated",
          code: "UNAUTHORIZED",
          user: null 
        },
        { status: 401 }
      );
    }

    return NextResponse.json({
      ok: true,
      user: {
        id: user.id,
        email: user.email,
        role: user.role,
        name: user.name,
        location: user.location,
      },
    });
  } catch (error) {
    console.error("[getCurrentUser] Error:", error);
    return NextResponse.json(
      { 
        error: "Failed to get current user",
        code: "INTERNAL_ERROR",
        user: null 
      },
      { status: 500 }
    );
  }
}
