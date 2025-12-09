import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabaseServer";
import { LoginPageRefactored } from "@/components/auth/login-page-refactored";

export const metadata: Metadata = {
  title: "Login - Tapan Associate",
  description: "Sign in to access the Tapan Associate cargo network dashboard.",
};

export default async function LoginPage() {
  const supabase = await createClient();
  const {
    data: { session },
  } = await supabase.auth.getSession();

  if (session) {
    redirect("/dashboard");
  }

  return <LoginPageRefactored />;
}
