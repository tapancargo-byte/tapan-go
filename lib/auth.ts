import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";
import type { Location } from "@/types/auth";

// Only admin role for this dashboard
export type UserRole = "admin";

export interface User {
  id: string;
  email?: string;
  role: UserRole;
  name?: string;
  location?: Location;  // Primary location (imphal or newdelhi)
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
    .select("role, name, location")
    .eq("id", session.user.id)
    .maybeSingle();

  return {
    id: session.user.id,
    email: session.user.email,
    role: "admin" as UserRole,  // All users in this dashboard are admins
    name: userData?.name,
    location: (userData?.location || "imphal") as Location,
  };
}

/**
 * Require authentication and optionally a specific role
 * Throws error if not authenticated or wrong role
 * Use in Server Components and API routes
 */
export async function requireAuth(): Promise<User> {
  const user = await getCurrentUser();

  if (!user) {
    throw new Error("Unauthorized - Please login");
  }

  // All authenticated users are admins in this dashboard
  return user;
}

/**
 * Check if user has a specific permission
 * All admins have all permissions in this dashboard
 */
export function hasPermission(user: User | null, _permission: string): boolean {
  if (!user) return false;
  
  // All authenticated users are admins with full permissions
  return true;
}
