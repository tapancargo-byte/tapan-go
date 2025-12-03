import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";

export type UserRole = "admin" | "operator" | "customer";

export interface User {
  id: string;
  email?: string;
  role: UserRole;
  name?: string;
}

/**
 * Get the current authenticated user with role
 * Server-side only - use in Server Components and API routes
 */
export async function getCurrentUser(): Promise<User | null> {
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

  if (!session) return null;

  const { data: userData } = await supabase
    .from("users")
    .select("role, name")
    .eq("id", session.user.id)
    .maybeSingle();

  return {
    id: session.user.id,
    email: session.user.email,
    role: (userData?.role || "customer") as UserRole,
    name: userData?.name,
  };
}

/**
 * Require authentication and optionally a specific role
 * Throws error if not authenticated or wrong role
 * Use in Server Components and API routes
 */
export async function requireAuth(requiredRole?: UserRole): Promise<User> {
  const user = await getCurrentUser();

  if (!user) {
    throw new Error("Unauthorized - Please login");
  }

  if (requiredRole && user.role !== requiredRole && user.role !== "admin") {
    throw new Error(`Forbidden - Requires ${requiredRole} role`);
  }

  return user;
}

/**
 * Check if user has a specific permission
 */
export function hasPermission(user: User | null, permission: string): boolean {
  if (!user) return false;
  
  // Admins have all permissions
  if (user.role === "admin") return true;
  
  // Define permissions per role
  const rolePermissions: Record<UserRole, string[]> = {
    admin: ["*"],
    operator: [
      "shipments.create",
      "shipments.update",
      "shipments.read",
      "scans.create",
      "manifests.create",
      "manifests.read",
    ],
    customer: [
      "shipments.read.own",
      "invoices.read.own",
      "track.read",
    ],
  };
  
  const permissions = rolePermissions[user.role] || [];
  return permissions.includes("*") || permissions.includes(permission);
}
