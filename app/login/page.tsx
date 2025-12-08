import type { Metadata } from "next";
import { LoginPageRefactored } from "@/components/auth/login-page-refactored";

export const metadata: Metadata = {
  title: "Login - Tapan Associate",
  description: "Sign in to access the Tapan Associate cargo network dashboard.",
};

export default function LoginPage() {
  return <LoginPageRefactored />;
}

