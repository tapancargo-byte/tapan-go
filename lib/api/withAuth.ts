import { NextResponse } from "next/server";
import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";

export type UserRole = "admin" | "operator" | "customer";

export interface AuthContext {
  userId: string;
  userRole: UserRole;
  userEmail?: string;
}

interface WithAuthOptions {
  requiredRole?: UserRole;
  allowedRoles?: UserRole[];
}

/**
 * API middleware for authentication and authorization
 * Validates session and checks user role
 * 
 * @example
 * export const POST = withAuth(
 *   async (req, context) => {
 *     const { userId, userRole } = context;
 *     return NextResponse.json({ userId });
 *   },
 *   { requiredRole: "admin" }
 * );
 */
export function withAuth(
  handler: (
    req: Request,
    context: AuthContext
  ) => Promise<NextResponse>,
  options?: WithAuthOptions
) {
  return async (req: Request) => {
    try {
      const cookieStore = cookies();

      const supabase = createServerClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
        {
          cookies: {
            get(name: string) {
              return cookieStore.get(name)?.value;
            },
          },
        }
      );

      const {
        data: { session },
      } = await supabase.auth.getSession();

      if (!session) {
        return NextResponse.json(
          {
            error: "Unauthorized - Authentication required",
            code: "UNAUTHORIZED",
          },
          { status: 401 }
        );
      }

      const { data: userData } = await supabase
        .from("users")
        .select("role")
        .eq("id", session.user.id)
        .maybeSingle();

      const userRole = (userData?.role || "customer") as UserRole;

      // Check required role
      if (options?.requiredRole) {
        if (userRole !== options.requiredRole && userRole !== "admin") {
          return NextResponse.json(
            {
              error: `Forbidden - Requires ${options.requiredRole} role`,
              code: "FORBIDDEN",
            },
            { status: 403 }
          );
        }
      }

      // Check allowed roles
      if (options?.allowedRoles && options.allowedRoles.length > 0) {
        if (!options.allowedRoles.includes(userRole) && userRole !== "admin") {
          return NextResponse.json(
            {
              error: `Forbidden - Requires one of: ${options.allowedRoles.join(", ")}`,
              code: "FORBIDDEN",
            },
            { status: 403 }
          );
        }
      }

      const context: AuthContext = {
        userId: session.user.id,
        userRole,
        userEmail: session.user.email,
      };

      return await handler(req, context);
    } catch (error) {
      console.error("[API Auth Error]", error);
      return NextResponse.json(
        {
          error: "Internal server error",
          code: "INTERNAL_ERROR",
        },
        { status: 500 }
      );
    }
  };
}

/**
 * Combine auth and validation
 */
export function withAuthAndValidation<T extends import("zod").ZodSchema>(
  schema: T,
  handler: (
    req: Request,
    data: import("zod").infer<T>,
    context: AuthContext
  ) => Promise<NextResponse>,
  options?: WithAuthOptions
) {
  return withAuth(async (req, authContext) => {
    try {
      const body = await req.json();
      const validated = schema.parse(body);
      return await handler(req, validated, authContext);
    } catch (error) {
      if (error instanceof Error && error.name === "ZodError") {
        return NextResponse.json(
          {
            error: "Validation failed",
            code: "VALIDATION_ERROR",
          },
          { status: 400 }
        );
      }
      throw error;
    }
  }, options);
}
