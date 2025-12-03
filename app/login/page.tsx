import Link from "next/link";
import type { Metadata } from "next";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { LoginForm } from "@/components/auth/login-form";
import { BrandLogo } from "@/components/ui/brand-logo";
import { ThemeToggle } from "@/components/theme-toggle";
import LockIcon from "@/components/icons/lock";
import { LoginVisualPanel } from "@/components/auth/login-visual-panel";

export const metadata: Metadata = {
  title: "Login - Tapan Associate",
  description: "Sign in to access the Tapan Associate cargo network dashboard.",
};

export default function LoginPage() {
  return (
    <div className="min-h-screen bg-background flex flex-col">
      <header className="border-b border-border/60 bg-background/95">
        <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-4 sm:px-6 lg:px-8">
          <div className="flex items-center">
            <BrandLogo size="xs" priority />
          </div>
          <div className="flex items-center gap-3">
            <ThemeToggle />
            <Button
              asChild
              variant="ghost"
              size="sm"
              className="h-9 px-3 text-[0.75rem] tracking-[0.16em] uppercase"
            >
              <Link href="/">Back to landing</Link>
            </Button>
          </div>
        </div>
      </header>

      <main className="flex-1 flex items-center justify-center px-4 sm:px-6 lg:px-8">
        <div className="grid w-full max-w-4xl gap-8 items-center lg:grid-cols-[minmax(0,1.1fr)_minmax(0,0.9fr)]">
          <LoginVisualPanel />

          <div className="flex justify-center">
            <div className="w-full max-w-sm space-y-6">
              <div className="space-y-2">
                <div className="inline-flex items-center gap-2 rounded-full border border-border/80 bg-background/80 px-2 py-1 text-[0.65rem] uppercase tracking-[0.18em] text-muted-foreground">
                  <span className="flex h-5 w-5 items-center justify-center rounded-full bg-primary/10">
                    <LockIcon className="h-3 w-3 text-primary" />
                  </span>
                  <span>Operations portal</span>
                </div>
                <div className="space-y-1">
                  <h1 className="text-base font-semibold leading-tight">Sign in to Tapan Associate</h1>
                  <p className="text-xs text-muted-foreground">
                    Use your work email and password to access the cargo dashboard.
                  </p>
                </div>
              </div>

              <Card className="p-6 bg-card/90 border-border/80 shadow-2xl">
                <LoginForm />
              </Card>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
