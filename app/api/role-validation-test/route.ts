
import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";
import { NextResponse } from "next/server";

export async function GET(req: Request) {
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

  const { data: { session } } = await supabase.auth.getSession();
  
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  // Get query param for expected role
  const { searchParams } = new URL(req.url);
  const expectedRole = searchParams.get("role");

  // In this system, all authenticated users are treated as 'admin' or 'operator'
  // Let's fetch the actual user role
  const { data: user } = await supabase
    .from("users")
    .select("role")
    .eq("id", session.user.id)
    .single();

  const actualRole = user?.role || "user";

  if (expectedRole && actualRole !== expectedRole) {
    return NextResponse.json({ 
      authorized: false, 
      role: actualRole,
      message: `User has role ${actualRole}, expected ${expectedRole}` 
    }, { status: 403 });
  }

  return NextResponse.json({ 
    authorized: true, 
    role: actualRole,
    user: {
      id: session.user.id,
      email: session.user.email
    }
  });
}
