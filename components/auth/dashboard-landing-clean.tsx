"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { motion } from "motion/react";
import Lottie from "lottie-react";
import { supabase } from "@/lib/supabaseClient";
import { Button } from "@/components/ui/button";
import { ThemeToggle } from "@/components/theme-toggle";

interface AuthState {
  checking: boolean;
  authed: boolean;
}

export function DashboardAuthOverlay() {
  const [authState, setAuthState] = useState<AuthState>({
    checking: true,
    authed: false,
  });
  const [animationData, setAnimationData] = useState<any | null>(null);

  useEffect(() => {
    let cancelled = false;

    async function checkSession() {
      try {
        const { data, error } = await supabase.auth.getUser();
        if (cancelled) return;
        if (error || !data?.user) {
          setAuthState({ checking: false, authed: false });
        } else {
          setAuthState({ checking: false, authed: true });
        }
      } catch {
        if (cancelled) return;
        setAuthState({ checking: false, authed: false });
      }
    }

    void checkSession();

    return () => {
      cancelled = true;
    };
  }, []);

  useEffect(() => {
    let active = true;

    async function loadAnimation() {
      try {
        const res = await fetch("/assets/landing.json");
        if (!res.ok) return;
        const data = await res.json();
        if (active) {
          setAnimationData(data);
        }
      } catch (error) {
        console.error("Failed to load landing animation", error);
      }
    }

    void loadAnimation();

    return () => {
      active = false;
    };
  }, []);

  // Lock body scroll while overlay is visible so the page doesn't scroll underneath.
  useEffect(() => {
    if (typeof document === "undefined") return;

    const previousOverflow = document.body.style.overflow;

    if (!authState.checking && !authState.authed) {
      document.body.style.overflow = "hidden";
    }

    return () => {
      document.body.style.overflow = previousOverflow;
    };
  }, [authState.checking, authState.authed]);

  // Show the overlay by default (including while checking), and only hide it
  // once we know the user is authenticated. This prevents the underlying
  // dashboard from flashing briefly on page refresh.
  if (authState.checking || authState.authed) {
    return null;
  }

  return (
    <div className="fixed inset-0 z-50 bg-background flex flex-col overflow-hidden">
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

          <div className="flex items-center gap-3">
            <ThemeToggle />
            <Button
              asChild
              size="sm"
              className="h-9 px-4 font-semibold shadow-sm"
            >
              <Link href="/login">Login</Link>
            </Button>
          </div>
        </div>
      </header>

      <main className="flex-1 flex items-start lg:items-center justify-center px-4 sm:px-6 lg:px-10 py-8 lg:py-14">
        <div className="w-full max-w-7xl mx-auto py-4 lg:py-10">
          <div className="rounded-[2.25rem] border border-border/50 bg-pop/60 px-6 py-7 lg:px-12 lg:py-10 shadow-[0_24px_80px_rgba(0,0,0,0.2)]">
            <motion.div
              className="grid gap-10 lg:gap-14 lg:grid-cols-[minmax(0,1.25fr)_minmax(0,1fr)] items-center"
              initial={{ opacity: 0, y: 24 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, ease: "easeOut" }}
            >
            <section className="space-y-5 max-w-md border-l border-border/40 pl-6">
              <div className="inline-flex items-center gap-2 rounded-full border border-border/60 bg-background/60 px-3 py-1 text-[10px] md:text-[11px] tracking-[0.18em] uppercase text-muted-foreground">
                <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
                <span>Internal cargo console · Imphal ↔ New Delhi · Northeast India</span>
              </div>
              <h1 className="text-3xl md:text-4xl lg:text-[2.6rem] font-display font-bold leading-tight">
                Cargo control for Imphal ↔ New Delhi.
              </h1>
              <p className="text-sm md:text-base text-muted-foreground max-w-prose leading-relaxed">
                Run daily air and land loads, pick &amp; drop runs, and last-mile
                updates for the Manipur community from a single internal console.
              </p>
              <ul className="text-[11px] md:text-xs text-muted-foreground space-y-1">
                <li>See today&apos;s lanes, loads, and exceptions in one place.</li>
                <li>Track bookings, handovers, and delivery status end-to-end.</li>
                <li>Restricted to Tapan Go ops teams and trusted partners.</li>
              </ul>

              <div className="pt-3 flex flex-wrap gap-2">
                <Button asChild size="sm" className="px-4 font-semibold">
                  <Link href="/login">Login to dashboard</Link>
                </Button>
                <Button
                  asChild
                  size="sm"
                  variant="outline"
                  className="text-xs"
                >
                  <Link href="/login">Use staff or partner account</Link>
                </Button>
              </div>
            </section>

            <section className="w-full max-w-lg lg:ml-auto">
              <motion.div
                className="relative aspect-[16/10] w-full rounded-2xl border border-border/60 bg-gradient-to-br from-card/40 via-card/10 to-background shadow-[0_18px_60px_rgba(0,0,0,0.55)] overflow-hidden"
                animate={{ y: [0, -6, 0] }}
                transition={{ duration: 8, repeat: Infinity, repeatType: "mirror", ease: "easeInOut" }}
              >
                <div className="pointer-events-none absolute inset-x-4 top-3 flex items-center justify-between text-[9px] md:text-[10px] tracking-[0.18em] uppercase text-muted-foreground/80">
                  <span className="flex items-center gap-2">
                    <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
                    Live cargo activity
                  </span>
                  <span className="rounded-full border border-border/60 bg-background/70 px-2 py-0.5">
                    Imphal ↔ New Delhi
                  </span>
                </div>
                <div className="relative flex h-full w-full items-center justify-center px-5 pb-5 pt-8">
                  {animationData ? (
                    <Lottie
                      animationData={animationData}
                      loop
                      autoplay
                      className="w-[140%] h-[140%] max-w-none"
                    />
                  ) : (
                    <span className="text-[10px] md:text-xs tracking-[0.2em] uppercase text-muted-foreground/70">
                      Loading animation
                    </span>
                  )}
                </div>
              </motion.div>
            </section>
          </motion.div>
          </div>
        </div>
      </main>

      <footer className="border-t border-border text-[10px] md:text-xs text-muted-foreground">
        <div className="max-w-6xl mx-auto px-6 lg:px-8 py-3 flex flex-col md:flex-row items-center justify-between gap-2">
          <span>Tapan Go · Internal cargo operations dashboard</span>
          <span>
            For authorized staff and partners managing shipments between Imphal,
            New Delhi and Northeast India.
          </span>
        </div>
      </footer>
    </div>
  );
}
