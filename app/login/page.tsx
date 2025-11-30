import Link from "next/link";
import type { Metadata } from "next";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { LoginForm } from "@/components/auth/login-form";
import { BrandLogo } from "@/components/ui/brand-logo";
import { ThemeToggle } from "@/components/theme-toggle";

export const metadata: Metadata = {
  title: "Login - Tapan Go",
  description: "Sign in to access the Tapan Go cargo network dashboard.",
};

export default function LoginPage() {
  return (
    <div className="min-h-screen flex flex-col bg-background">
      <header className="border-b border-border/60 bg-background/95">
        <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-4 sm:px-6 lg:px-8">
          <div className="flex items-center">
            <BrandLogo size="xs" priority />
          </div>
          <div className="flex items-center gap-3">
            <ThemeToggle />
            <Button asChild variant="ghost" size="sm" className="h-9 px-3 text-[0.75rem] tracking-[0.16em] uppercase">
              <Link href="/">Back to landing</Link>
            </Button>
          </div>
        </div>
      </header>

      <main className="flex-1 flex items-center justify-center px-4 py-8 lg:py-10">
        <div className="w-full max-w-md">
          <Card className="p-6 bg-card/90 border-border/80 shadow-[0_18px_60px_rgba(0,0,0,0.7)]">
            <div className="mb-4 space-y-1">
              <h2 className="text-sm font-semibold">Login</h2>
              <p className="text-xs text-muted-foreground">
                Enter your email and password to continue.
              </p>
            </div>

            <LoginForm />
          </Card>
        </div>
      </main>
    </div>
  );
}
