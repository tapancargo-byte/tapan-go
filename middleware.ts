import { createServerClient } from "@supabase/ssr";
import { type NextRequest, NextResponse } from "next/server";
import { hasRoleAtLeast, matchProtectedRoute } from "@/lib/access-control";

// Public routes that don't require authentication
const PUBLIC_ROUTES = [
  "/",
  "/login",
  "/track",
  "/privacy-policy",
  "/terms-of-service",
  "/api/public",
  // Meta / WhatsApp webhooks (must be publicly accessible for verification callbacks)
  "/api/webhooks/whatsapp",
  "/api/meta-data-deletion",
  // Only expose dev seeding endpoint in development
  ...(process.env.NODE_ENV === "development"
    ? ["/api/dev/seed-test-users"]
    : []),
];

// API routes that need special handling
const API_ROUTES_PREFIX = "/api/";

function isSafeRedirect(path: string): boolean {
  if (!path) return false;
  // Only allow internal paths
  if (!path.startsWith("/")) return false;
  if (path.startsWith("//")) return false;
  // Disallow protocol-prefixed values like http:// or https://
  if (/^[a-zA-Z][a-zA-Z0-9+.-]*:/.test(path)) return false;
  return true;
}

export async function middleware(request: NextRequest) {
  let response = NextResponse.next({
    request: {
      headers: request.headers,
    },
  });

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        get(name: string) {
          return request.cookies.get(name)?.value;
        },
        set(name: string, value: string, options: any) {
          request.cookies.set({ name, value, ...options });
          response = NextResponse.next({
            request: {
              headers: request.headers,
            },
          });
          response.cookies.set({ name, value, ...options });
        },
        remove(name: string, options: any) {
          request.cookies.set({ name, value: "", ...options });
          response = NextResponse.next({
            request: {
              headers: request.headers,
            },
          });
          response.cookies.set({ name, value: "", ...options });
        },
      },
    }
  );

  // Refresh session if expired
  const {
    data: { session },
  } = await supabase.auth.getSession();

  const pathname = request.nextUrl.pathname;

  const protectedRule = matchProtectedRoute(pathname);
  const needsUserForPage = Boolean(protectedRule);
  const needsUserForApi = pathname.startsWith(API_ROUTES_PREFIX);

  let userData: { role?: string | null; location?: string | null } | null = null;

  // Allow public routes
  const isPublicRoute = PUBLIC_ROUTES.some((route) => {
    if (route === "/") {
      return pathname === "/";
    }
    return pathname === route || pathname.startsWith(`${route}/`);
  });

  if (isPublicRoute) {
    return response;
  }

  // Check if user is authenticated for protected routes
  if (!session) {
    // For API routes, return 401 instead of redirect
    if (pathname.startsWith(API_ROUTES_PREFIX)) {
      return NextResponse.json(
        { error: "Unauthorized", code: "UNAUTHORIZED" },
        { status: 401 }
      );
    }

    const redirectUrl = new URL("/login", request.url);
    if (isSafeRedirect(pathname)) {
      redirectUrl.searchParams.set("redirect", pathname);
    }
    return NextResponse.redirect(redirectUrl);
  }

  if (needsUserForPage || needsUserForApi) {
    const { data } = await supabase
      .from("users")
      .select("role, location")
      .eq("id", session.user.id)
      .maybeSingle();

    if (!data) {
      if (needsUserForApi) {
        return NextResponse.json(
          { error: "User not found in system", code: "USER_NOT_FOUND" },
          { status: 403 }
        );
      }

      const redirectUrl = new URL("/login", request.url);
      if (isSafeRedirect(pathname)) {
        redirectUrl.searchParams.set("redirect", pathname);
      }
      return NextResponse.redirect(redirectUrl);
    }

    userData = data;
  }

  if (protectedRule && !hasRoleAtLeast(userData?.role ?? null, protectedRule.minRole)) {
    const redirectUrl = new URL("/dashboard", request.url);
    return NextResponse.redirect(redirectUrl);
  }

  // Optimize: Only fetch user data from DB for API routes or if absolutely necessary
  // For page navigation, we trust the session (RLS will handle data access security)
  if (pathname.startsWith(API_ROUTES_PREFIX)) {
    if (!userData?.role) {
      return NextResponse.json(
        { error: "User role not configured", code: "INVALID_USER_STATE" },
        { status: 403 }
      );
    }

    if (!userData.location) {
      return NextResponse.json(
        { error: "User location not configured", code: "INVALID_USER_STATE" },
        { status: 403 }
      );
    }

    // Add user context to headers for API routes
    response.headers.set("X-User-Role", userData.role);
    response.headers.set("X-User-ID", session.user.id);
    response.headers.set("X-User-Location", userData.location);
  }

  return response;
}

export const config = {
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
  ],
};
