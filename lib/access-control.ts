import type { UserRole } from "@/types/auth";

export type AppRole = UserRole;

export interface RouteAccessRule {
  /** Glob-style path matcher, e.g. /admin, /settings, /reports */
  pattern: string;
  /** Minimum role required to access this route */
  minRole: AppRole;
}

export const PROTECTED_ROUTES: RouteAccessRule[] = [
  {
    pattern: "/admin",
    minRole: "admin",
  },
  {
    pattern: "/settings",
    minRole: "admin",
  },
  {
    pattern: "/analytics",
    minRole: "manager",
  },
  {
    pattern: "/reports",
    minRole: "manager",
  },
  {
    pattern: "/alerts",
    minRole: "manager",
  },
];

const ROLE_ORDER: AppRole[] = ["viewer", "operator", "manager", "admin"];

export function hasRoleAtLeast(userRole: string | null | undefined, required: AppRole): boolean {
  if (!userRole) return false;
  const normalized = userRole.toLowerCase() as AppRole;
  const userIndex = ROLE_ORDER.indexOf(normalized);
  const requiredIndex = ROLE_ORDER.indexOf(required);
  if (userIndex === -1 || requiredIndex === -1) return false;
  return userIndex >= requiredIndex;
}

export function matchProtectedRoute(pathname: string): RouteAccessRule | null {
  const match = PROTECTED_ROUTES.find((rule) => pathname.startsWith(rule.pattern));
  return match ?? null;
}
