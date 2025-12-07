import type { Metadata } from "next";
import { LoginForm } from "@/components/login-form";
import { LoginVisualPanel } from "@/components/auth/login-visual-panel";
import { Card, CardContent } from "@/components/ui/card";
import { MorphicNavbar } from "@/components/ui/morphic-navbar";
import { KiboSectionHeader } from "@/components/ui/kibo-primitives";

export const metadata: Metadata = {
  title: "Login - Tapan Associate",
  description: "Sign in to access the Tapan Associate cargo network dashboard.",
};

export default function LoginPage() {
  return (
    <div className="min-h-screen bg-background flex flex-col">
      {/* Minimal Header */}
      <header className="fixed top-0 left-0 right-0 z-50 bg-background/90 backdrop-blur-sm border-b border-border/40">
        <MorphicNavbar mode="login" />
      </header>

      {/* Main Content - Centered Layout */}
      <main className="flex-1 flex items-center justify-center pt-20 pb-10 px-6 md:px-10">
        <div className="w-full max-w-sm md:max-w-4xl">
          <Card className="overflow-hidden border border-border bg-card shadow-sm">
            <CardContent className="grid p-0 md:grid-cols-2">
              {/* Left - Animation */}
              <div className="bg-card relative hidden md:block">
                <div className="h-full w-full p-6 md:p-8">
                  <LoginVisualPanel />
                </div>
              </div>

              {/* Right - Login Form */}
              <div className="p-6 md:p-8 flex items-center justify-center">
                <div className="w-full max-w-md space-y-6">
                  {/* Header */}
                  <div className="mb-2">
                    <KiboSectionHeader
                      title="Welcome back"
                      description="Use your Tapan Associate credentials to access the cargo dashboard."
                      align="left"
                      size="sm"
                    />
                  </div>

                  {/* Form */}
                  <LoginForm />
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  );
}

