"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabaseClient";
import { Button } from "@/components/ui/button";
import { ThemeToggle } from "@/components/theme-toggle";
import {
  BentoGridWithFeatures,
  type BentoFeature,
} from "@/components/ui/bento-grid";
import { Card, CardContent } from "@/components/ui/card";
import { CategoryList, type Category } from "@/components/ui/category-list";
import { Input } from "@/components/ui/input";
import { Shield, Users } from "lucide-react";
import { FinancialHero } from "@/components/ui/hero-section";
import { BrandLogo } from "@/components/ui/brand-logo";
import { AboutApps } from "@/components/ui/about";
import { Footer } from "../ui/footer";

interface AuthState {
  checking: boolean;
  authed: boolean;
}

function HeroInlineTracking() {
  const router = useRouter();
  const [value, setValue] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const trimmed = value.trim();
    if (!trimmed) return;
    router.push(`/track?ref=${encodeURIComponent(trimmed)}`);
  };

  return (
    <div className="mt-4 space-y-2">
      <p className="text-xs text-muted-foreground">
        Enter a shipment reference or barcode to see live status. No login needed.
      </p>
      <form
        onSubmit={handleSubmit}
        className="flex flex-col gap-2 sm:flex-row sm:items-center"
      >
        <Input
          aria-label="Shipment reference or barcode number"
          placeholder="AWB or reference number"
          value={value}
          onChange={(e) => setValue(e.target.value)}
          className="flex-1 h-10 text-sm"
        />
        <Button
          type="submit"
          size="sm"
          className="px-5 py-2 text-[0.7rem] tracking-[0.16em]"
        >
          Track
        </Button>
      </form>
    </div>
  );
}

function HeroLottieCard() {
  const borderRef = useRef<HTMLDivElement | null>(null);

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    const border = borderRef.current;
    if (!border) return;
    const rect = border.getBoundingClientRect();
    const x = e.clientX - rect.left - rect.width / 2;
    const y = e.clientY - rect.top - rect.height / 2;
    const angle = Math.atan2(y, x);
    border.style.setProperty("--rotation", `${angle}rad`);
  };

  const handleMouseLeave = () => {
    const border = borderRef.current;
    if (!border) return;
    border.style.setProperty("--rotation", "0deg");
  };

  const pattern =
    `linear-gradient(45deg, var(--pattern-color1) 25%, transparent 25%, transparent 75%, var(--pattern-color2) 75%),` +
    `linear-gradient(-45deg, var(--pattern-color2) 25%, transparent 25%, transparent 75%, var(--pattern-color1) 75%)`;

  const borderGradient =
    "conic-gradient(from var(--rotation,0deg), var(--border-color-2) 0deg, var(--border-color-2) 90deg, var(--border-bg-color) 90deg, var(--border-bg-color) 360deg)";

  return (
    <div
      ref={borderRef}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      className="relative h-full w-full"
    >
      <div
        style={{
          width: "100%",
          height: "100%",
          borderRadius: "1rem",
          border: "3px solid transparent",
          backgroundOrigin: "border-box",
          backgroundClip: "padding-box, border-box",
          backgroundImage: `linear-gradient(var(--card-bg-color), var(--card-bg-color)), ${borderGradient}`,
          padding: 16,
          boxSizing: "border-box",
          display: "flex",
          alignItems: "stretch",
          justifyContent: "stretch",
        } as React.CSSProperties}
      >
        <div
          style={{
            width: "100%",
            height: "100%",
            borderRadius: "0.9rem",
            background: "var(--card-bg-color)",
            overflow: "hidden",
            boxSizing: "border-box",
            backgroundImage: pattern,
            backgroundSize: "20.84px 20.84px",
          } as React.CSSProperties}
          className="relative flex h-full w-full items-center justify-center px-6 pb-8 pt-10"
        >
          <div className="pointer-events-none absolute inset-x-6 top-3 flex items-center justify-between text-[0.6rem] tracking-[0.2em] uppercase text-muted-foreground/80">
            <span className="flex items-center gap-2">
              <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse" />
              Cargo activity
            </span>
            <span className="rounded-full border border-border/60 bg-background/70 px-2 py-0.5">
              Imphal ↔ New Delhi
            </span>
          </div>
          <div className="relative flex h-full w-full items-center justify-center">
            <span className="text-[0.65rem] tracking-[0.2em] uppercase text-muted-foreground/70">
              Visual telemetry placeholder
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}

export function DashboardAuthOverlay() {
  const [authState, setAuthState] = useState<AuthState>({
    checking: true,
    authed: false,
  });
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

  // Removed Lottie animation loading; keeping hero visual static for now.

  // Lock body scroll for underlying dashboard while allowing the overlay itself to scroll.
  useEffect(() => {
    if (typeof document === "undefined") return;

    const previousOverflow = document.body.style.overflow;

    if (!authState.authed) {
      document.body.style.overflow = "hidden";
    }

    return () => {
      document.body.style.overflow = previousOverflow;
    };
  }, [authState.authed]);

  // Show the overlay by default (including while checking), and only hide it
  // once we know the user is authenticated. This prevents the underlying
  // dashboard from flashing briefly on page refresh.
  if (authState.authed) {
    return null;
  }

  const handleNavClick = (id: string) => {
    if (typeof document === "undefined") return;
    const el = document.getElementById(id);
    if (!el) return;
    el.scrollIntoView({ behavior: "smooth", block: "start" });
  };

  const servicesFeatures: BentoFeature[] = [
    {
      id: "services-text",
      title: "Services for Northeast lanes",
      description:
        "Direct line-haul and air movements between Imphal, Guwahati, Siliguri and New Delhi.",
      content: (
        <ul className="space-y-1 text-[0.75rem] text-muted-foreground">
          <li>• Scheduled runs tuned for Northeast routes.</li>
          <li>• Pickup and delivery windows agreed up front.</li>
          <li>• Single point of contact from booking to delivery.</li>
        </ul>
      ),
      className: "col-span-1 md:col-span-3 lg:col-span-3",
    },
    {
      id: "services-media",
      title: undefined,
      description: undefined,
      content: (
        <div className="flex h-40 md:h-48 items-center justify-center rounded-xl border border-dashed border-border/60 text-[0.7rem] text-muted-foreground">
          Media placeholder – add service route image, Lottie or video
        </div>
      ),
      className: "col-span-1 md:col-span-3 lg:col-span-3",
    },
  ];

  const trackingFeatures: BentoFeature[] = [
    {
      id: "tracking-text",
      title: "Live shipment tracking",
      description:
        "Simple, reference-based tracking so your team always knows where a load is.",
      content: (
        <ul className="space-y-1 text-[0.75rem] text-muted-foreground">
          <li>• Status and location at a glance.</li>
          <li>• Alerts when a shipment arrives late or stalls.</li>
          <li>• Public tracking available at /track.</li>
        </ul>
      ),
      className: "glass-panel col-span-1 md:col-span-3 lg:col-span-3",
    },
    {
      id: "tracking-media",
      title: undefined,
      description: undefined,
      content: (
        <div className="flex h-40 md:h-48 items-center justify-center rounded-xl border border-dashed border-border/60 text-[0.7rem] text-muted-foreground">
          Media placeholder – add map, tracking UI or Lottie timeline
        </div>
      ),
      className: "glass-panel col-span-1 md:col-span-3 lg:col-span-3",
    },
  ];

  const networkFeatures: BentoFeature[] = [
    {
      id: "network-text",
      title: "Northeast–Delhi network",
      description:
        "Hubs and fleet across Imphal, Guwahati, Siliguri and New Delhi for predictable transits.",
      content: (
        <ul className="space-y-1 text-[0.75rem] text-muted-foreground">
          <li>• Dedicated Northeast–Delhi line-haul corridors.</li>
          <li>• Secure hubs with consistent departures.</li>
          <li>• Capacity tuned for regional demand.</li>
        </ul>
      ),
      className: "glass-panel col-span-1 md:col-span-3 lg:col-span-3",
    },
    {
      id: "network-media",
      title: undefined,
      description: undefined,
      content: (
        <div className="flex h-40 md:h-48 items-center justify-center rounded-xl border border-dashed border-border/60 text-[0.7rem] text-muted-foreground">
          Media placeholder – add network map or lane visualisation
        </div>
      ),
      className: "glass-panel col-span-1 md:col-span-3 lg:col-span-3",
    },
  ];

  const supportCategories: Category[] = [
    {
      id: 1,
      title: "Shipment delays",
      subtitle: "Escalate when a load is running late or has stopped moving.",
      featured: true,
    },
    {
      id: 2,
      title: "Delivery & POD",
      subtitle: "Questions on delivery status, proof of delivery or reattempts.",
    },
    {
      id: 3,
      title: "Documents & billing",
      subtitle: "Invoices, GST, e-way bills and supporting documentation.",
    },
    {
      id: 4,
      title: "Claims & damage",
      subtitle: "Log an incident when freight is short, pilfered or damaged.",
    },
  ];

  return (
    <div className="fixed inset-0 z-50 bg-background text-foreground">
      <div className="relative flex h-full flex-col">
        {/* HUD-style navbar */}
        <header className="fixed inset-x-0 top-0 z-40 glass-panel border-b border-border/60 bg-background/95">
          <div className="mx-auto flex h-16 md:h-20 max-w-6xl items-center justify-between px-4 sm:px-6 lg:px-8">
            <div className="flex items-center">
              <BrandLogo size="xs" priority />
            </div>

            <nav
              className="hidden md:flex items-center gap-8 text-[0.65rem] uppercase tracking-[0.24em] text-foreground/70"
              aria-label="Primary"
            >
              <button
                type="button"
                onClick={() => handleNavClick("services")}
                className="hover:text-primary transition-colors"
              >
                Services
              </button>
              <button
                type="button"
                onClick={() => handleNavClick("tracking")}
                className="hover:text-primary transition-colors"
              >
                Tracking
              </button>
              <button
                type="button"
                onClick={() => handleNavClick("network")}
                className="hover:text-primary transition-colors"
              >
                Network
              </button>
              <button
                type="button"
                onClick={() => handleNavClick("support")}
                className="hover:text-primary transition-colors"
              >
                Support
              </button>
              <button
                type="button"
                onClick={() => handleNavClick("about")}
                className="hover:text-primary transition-colors"
              >
                About
              </button>
            </nav>

            <div className="flex items-center gap-3">
              <ThemeToggle />
              <Button
                asChild
                size="sm"
                className="h-8 px-4 text-[0.65rem] font-semibold tracking-[0.2em] uppercase"
              >
                <Link href="/login">Ops login</Link>
              </Button>
            </div>
          </div>
        </header>

        <main className="flex-1 pt-20 md:pt-24 overflow-y-auto">
          {/* Hero section */}
          <section className="relative flex min-h-[70vh] items-center justify-center overflow-hidden">
            {/* Ambient background grid (neutral, no orange band) */}
            <div
              className="pointer-events-none absolute inset-0 opacity-[0.08]"
              style={{
                backgroundImage:
                  "linear-gradient(rgba(255,255,255,0.03) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.03) 1px, transparent 1px)",
                backgroundSize: "40px 40px",
              }}
            />
            {/* Scanning line overlay */}
            <div className="scan-line pointer-events-none" />

            <div className="relative z-10 w-full">
              <FinancialHero
                title={
                  <>
                    15 Years on the
                    <br />
                    <span className="text-primary">Northeast–Delhi Link</span>
                  </>
                }
                description={
                  <p className="max-w-prose text-sm leading-relaxed text-foreground/80 md:text-base">
                    15 years of trusted air and road cargo between Imphal and Delhi.
                  </p>
                }
                buttonText="Track shipment"
                buttonLink="/track"
                rightContent={<HeroLottieCard />}
              />
            </div>
          </section>

          <section className="border-t border-border/40 bg-background/90 py-4">
            <div className="mx-auto flex max-w-6xl flex-col gap-3 px-6 text-[0.7rem] text-muted-foreground md:flex-row md:items-center md:justify-between md:text-xs">
              <p className="hud-text text-[0.65rem] tracking-[0.24em] uppercase text-muted-foreground">
                Operational overview
              </p>
              <div className="flex flex-1 flex-wrap gap-4 md:justify-end">
                <div className="flex items-baseline gap-2">
                  <span className="text-sm font-semibold text-foreground">98.4%</span>
                  <span className="text-[0.65rem] uppercase tracking-[0.16em] text-muted-foreground">
                    On-time last 90 days
                  </span>
                </div>
                <div className="flex items-baseline gap-2">
                  <span className="text-sm font-semibold text-foreground">4</span>
                  <span className="text-[0.65rem] uppercase tracking-[0.16em] text-muted-foreground">
                    Core cities · Imphal · Guwahati · Siliguri · Delhi
                  </span>
                </div>
                <div className="flex items-baseline gap-2">
                  <span className="h-2 w-2 rounded-full bg-emerald-500" />
                  <span className="text-[0.65rem] uppercase tracking-[0.16em] text-muted-foreground">
                    Live lanes monitored · Northeast ↔ Delhi
                  </span>
                </div>
              </div>
            </div>
          </section>

          {/* Services section */}
          <section
            id="services"
            className="border-t border-border/60 bg-pop/40 py-12 scroll-mt-24"
          >
            <div className="mx-auto max-w-6xl px-6 space-y-6">
              <div className="flex flex-col gap-3 md:flex-row md:items-end md:justify-between">
                <div className="max-w-md space-y-2">
                  <p className="hud-text text-[0.7rem] tracking-[0.24em] text-muted-foreground uppercase">
                    Services
                  </p>
                  <p className="text-sm text-muted-foreground">
                    How Tapan Go moves freight between Northeast cities and New Delhi.
                  </p>
                </div>
                <p className="text-[0.7rem] font-mono text-muted-foreground/80 tracking-[0.16em] uppercase">
                  SYS_V.2.0.4 · LIVE
                </p>
              </div>

              <BentoGridWithFeatures
                className="bg-transparent"
                features={servicesFeatures}
              />
            </div>
          </section>

          {/* Tracking section */}
          <section
            id="tracking"
            className="border-t border-border/40 bg-background py-12 scroll-mt-24"
          >
            <div className="mx-auto grid max-w-6xl gap-8 px-6 md:grid-cols-[minmax(0,1.4fr)_minmax(0,1.15fr)] md:items-start">
              <div className="space-y-4">
                <div className="max-w-md space-y-2">
                  <p className="hud-text text-[0.7rem] tracking-[0.24em] text-muted-foreground uppercase">
                    Tracking
                  </p>
                  <p className="text-sm text-muted-foreground">
                    Keep customers and internal teams aligned with simple, live tracking and
                    clear status signals.
                  </p>
                </div>

                <Card className="glass-panel border-border/60 bg-pop/40">
                  <CardContent className="space-y-4 pt-4">
                    <div className="flex items-center justify-between gap-4">
                      <div>
                        <p className="text-[0.7rem] font-mono uppercase tracking-[0.2em] text-muted-foreground">
                          On-time deliveries · last 90 days
                        </p>
                        <p className="mt-2 text-3xl font-semibold text-foreground">98.4%</p>
                      </div>
                      <div className="relative flex h-16 w-16 items-center justify-center rounded-full border border-primary/40 bg-pop">
                        <Shield className="h-7 w-7 text-primary" strokeWidth={1.25} />
                      </div>
                    </div>
                    <p className="text-[0.75rem] text-muted-foreground">
                      Based on confirmed departures and arrivals across Imphal, Guwahati,
                      Siliguri and New Delhi.
                    </p>
                  </CardContent>
                </Card>

                <Card className="glass-panel border-border/60">
                  <CardContent className="space-y-3 pt-4">
                    <p className="text-[0.7rem] font-mono uppercase tracking-[0.2em] text-muted-foreground">
                      Recent tracking events
                    </p>
                    <div className="space-y-1 text-[0.75rem] text-muted-foreground">
                      <p>· IMH → DEL line-haul departed · 04:12</p>
                      <p>· Guwahati hub arrival scan · 01:47</p>
                      <p>· Siliguri delivery out for run · Yesterday, 16:05</p>
                    </div>
                  </CardContent>
                </Card>
              </div>

              <div>
                <Card className="glass-panel border-border/60">
                  <CardContent className="bg-pop/40 p-4">
                    <div className="relative w-full overflow-hidden rounded-xl border border-border/60 aspect-[16/9]">
                      <Image
                        src="/assets/tracking-map.jpeg"
                        alt="Map visual showing Tapan Go tracking lanes between Northeast cities and Delhi"
                        fill
                        className="object-cover"
                        priority={false}
                      />
                      <div className="pointer-events-none absolute inset-x-4 top-3 flex items-center justify-between text-[0.6rem] tracking-[0.2em] uppercase text-muted-foreground/80">
                        <span>Tracking lanes overview</span>
                        <span className="rounded-full border border-border/60 bg-background/80 px-2 py-0.5">
                          Imphal · Guwahati · Siliguri · Delhi
                        </span>
                      </div>
                      <div className="pointer-events-none absolute inset-x-4 bottom-3 flex items-center justify-between text-[0.6rem] text-muted-foreground/80">
                        <span className="flex items-center gap-1">
                          <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse" />
                          Live lane focus
                        </span>
                        <span>Illustrative map</span>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </div>
          </section>

          {/* Network section */}
          <section
            id="network"
            className="border-t border-border/40 bg-pop/40 py-12 scroll-mt-24"
          >
            <div className="mx-auto max-w-6xl px-6 space-y-6">
              <div className="max-w-md space-y-2">
                <p className="hud-text text-[0.7rem] tracking-[0.24em] text-muted-foreground uppercase">
                  Network
                </p>
                <p className="text-sm text-muted-foreground">
                  The Northeast–Delhi hub and lane structure behind your shipments.
                </p>
              </div>

              <BentoGridWithFeatures
                className="bg-transparent"
                features={networkFeatures}
              />
            </div>
          </section>

          {/* Support section */}
          <section
            id="support"
            className="border-t border-border/40 bg-background py-12 scroll-mt-24"
          >
            <div className="mx-auto max-w-6xl px-6 space-y-8">
              <div className="max-w-md space-y-2">
                <p className="hud-text text-[0.7rem] tracking-[0.24em] text-muted-foreground uppercase">
                  Support
                </p>
                <p className="text-sm text-muted-foreground">
                  When something goes wrong, how Tapan Go helps you recover quickly.
                </p>
              </div>

              <CategoryList
                title="Support channels"
                subtitle="for customers & partners"
                categories={supportCategories}
                headerIcon={<Users className="h-8 w-8" />}
                className="bg-transparent p-0"
              />
            </div>
          </section>

          {/* About section */}
          <section
            id="about"
            className="border-t border-border/40 bg-background py-10 scroll-mt-24"
          >
            <div className="mx-auto max-w-6xl px-6">
              <AboutApps />
            </div>
          </section>

          <div className="border-t border-border bg-background/95">
            <div className="mx-auto max-w-6xl px-0 py-6">
              <Footer />
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}
