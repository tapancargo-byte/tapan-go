import Link from "next/link";
import type { Metadata } from "next";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { LoginForm } from "@/components/auth/login-form";

export const metadata: Metadata = {
  title: "Login - Tapan Go",
  description: "Sign in to access the Tapan Go cargo network dashboard.",
};

export default function LoginPage() {
  return (
    <div className="min-h-screen flex flex-col bg-background">
      <header className="border-b border-border">
        <div className="flex items-center justify-between px-6 lg:px-8 py-4 max-w-6xl mx-auto">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-lg bg-gradient-to-br from-orange-500 to-orange-600 flex items-center justify-center text-xl font-display">
              📦
            </div>
            <div className="flex flex-col">
              <span className="text-base font-display font-bold tracking-wide">
                TAPAN GO
              </span>
              <span className="text-xs uppercase tracking-widest text-muted-foreground">
                Cargo Network Console
              </span>
            </div>
          </div>

          <Button asChild variant="ghost" size="sm" className="h-9 px-3">
            <Link href="/">Back to overview</Link>
          </Button>
        </div>
      </header>

      <main className="flex-1 flex items-center justify-center px-4 py-8 lg:py-10">
        <div className="w-full max-w-5xl grid gap-8 lg:gap-10 lg:grid-cols-[1.15fr_minmax(0,1fr)] items-center">
          <section className="space-y-5 max-w-lg order-2 lg:order-1">
            <div className="inline-flex items-center gap-2 rounded-full border border-border/60 bg-background/60 px-3 py-1 text-[10px] md:text-[11px] tracking-[0.18em] uppercase text-muted-foreground">
              <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
              <span>Ops access · Internal use only · Imphal ↔ New Delhi</span>
            </div>
            <h1 className="text-2xl md:text-3xl font-display font-bold leading-tight">
              Sign in to Tapan Go ops console.
            </h1>
            <p className="text-sm text-muted-foreground max-w-prose leading-relaxed">
              Use your staff or partner account to follow cargo between Imphal and
              New Delhi and manage key bookings and updates.
            </p>
            <ul className="text-[11px] md:text-xs text-muted-foreground space-y-1">
              <li>See today&apos;s shipments, lanes, and exceptions in one place.</li>
              <li>Coordinate air, land, and doorstep pick &amp; drop across the network.</li>
              <li>Restricted to Tapan Go operations teams and trusted partners.</li>
            </ul>
          </section>

          <section className="w-full max-w-md ml-auto order-1 lg:order-2">
            <Card className="p-6 bg-card/90 border-border/80 shadow-[0_18px_60px_rgba(0,0,0,0.7)]">
              <div className="mb-4 space-y-1">
                <h2 className="text-sm font-semibold">Login</h2>
                <p className="text-xs text-muted-foreground">
                  Enter your email and password to continue.
                </p>
              </div>

              <LoginForm />

              <div className="mt-3 flex justify-end">
                <button
                  type="button"
                  className="text-[11px] text-muted-foreground hover:text-foreground underline-offset-4 hover:underline"
                >
                  Forgot password?
                </button>
              </div>
            </Card>
          </section>
        </div>
      </main>
    </div>
  );
}
