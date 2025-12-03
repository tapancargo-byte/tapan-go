"use client";

import { useEffect, useState } from "react";
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
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { CategoryList, type Category } from "@/components/ui/category-list";
import { Input } from "@/components/ui/input";
import ShieldIcon from "@/components/icons/shield";
import UsersIcon from "@/components/icons/users";
import Lottie from "lottie-react";
import landingAnimation from "@/public/assets/landing.json";
import { FinancialHero } from "@/components/ui/hero-section";
import { BrandLogo } from "@/components/ui/brand-logo";
import { AboutApps } from "@/components/ui/about";
import { ServiceRouteVisual } from "@/components/ui/visuals/service-route-visual";
import { NetworkMapVisual } from "@/components/ui/visuals/network-map-visual";
import { ScrollProgress } from "@/components/ui/scroll-progress";
import { RippleButton } from "@/components/ui/ripple-button";
import { AnimatedCard } from "@/components/ui/animated-card";
import { Marquee } from "@/components/ui/marquee";
import { TextAnimate } from "@/components/ui/text-animate";

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
        <RippleButton
          type="submit"
          className="h-10 px-5 text-[0.7rem] tracking-[0.16em]"
        >
          Track
        </RippleButton>
      </form>
    </div>
  );
}

function HeroLottieCard() {
  return (
    <div className="relative w-full max-w-2xl mx-auto">
      <div className="pointer-events-none absolute -inset-x-6 -top-8 h-32 bg-gradient-to-tr from-primary/20 via-sky-500/5 to-transparent blur-3xl" />
      <AnimatedCard
        enableHover
        hoverScale={1.02}
        className="relative w-full aspect-[16/9] overflow-hidden border-border/70 bg-pop p-0 shadow-lg shadow-black/10"
      >
        <div className="relative flex h-full flex-col">
          <div className="flex flex-1 flex-col gap-4 px-4 py-4">
            <div className="grid grid-cols-[minmax(0,1.4fr)_minmax(0,1.1fr)] gap-3 items-stretch">
              <div className="rounded-lg bg-background/80 p-3 text-[0.7rem] text-muted-foreground">
                <p className="text-[0.6rem] font-mono uppercase tracking-[0.2em] text-muted-foreground">
                  On-time deliveries · last 90 days
                </p>
                <p className="mt-2 text-3xl font-semibold text-foreground">98.4%</p>
                <p className="mt-1 text-[0.7rem] text-muted-foreground/90">
                  Across the Imphal–Delhi corridor.
                </p>
                <div className="mt-3 h-1.5 w-full overflow-hidden rounded-full bg-border/60">
                  <div className="h-full w-[82%] rounded-full bg-primary" />
                </div>
              </div>

              <div className="relative flex items-center justify-center rounded-lg bg-background">
                <Lottie
                  animationData={landingAnimation}
                  loop
                  autoplay
                  style={{ width: "86%", height: "86%" }}
                />
              </div>
            </div>

            <div className="flex items-center justify-between rounded-lg bg-background/80 px-3 py-2 text-[0.65rem] text-muted-foreground">
              <div className="flex items-baseline gap-2">
                <span className="text-sm font-medium text-foreground">27</span>
                <span className="text-[0.6rem] uppercase tracking-[0.18em]">Active loads</span>
              </div>
              <div className="h-4 w-px bg-border/60" />
              <div className="flex items-baseline gap-2">
                <span className="text-sm font-medium text-foreground">4</span>
                <span className="text-[0.6rem] uppercase tracking-[0.18em]">Lanes monitored</span>
              </div>
            </div>
          </div>
        </div>
      </AnimatedCard>
    </div>
  );
}

function TrustedByMarquee() {
  const items = [
    {
      label: "Imphal retail cluster",
      dotClass: "bg-success",
    },
    {
      label: "Delhi consolidation partners",
      dotClass: "bg-primary/80",
    },
    {
      label: "Imphal–Delhi FMCG shippers",
      dotClass: "bg-warning",
    },
    {
      label: "Northeast e-commerce shippers",
      dotClass: "bg-accent",
    },
  ];

  return (
    <section className="border-t border-border/40 bg-background/90 py-4">
      <div className="mx-auto max-w-6xl px-6 space-y-3 text-[0.7rem] text-muted-foreground md:text-xs">
        <p className="hud-text text-[0.65rem] tracking-[0.24em] uppercase text-muted-foreground">
          Trusted by operations teams at
        </p>
        <div className="relative">
          <Marquee
            className="rounded-full border border-border/40 bg-pop/40 [--duration:32s]"
            pauseOnHover
          >
            <div className="flex items-center gap-6 px-6">
              {items.map((item) => (
                <span
                  key={item.label}
                  className="inline-flex items-center gap-2 rounded-full border border-border/60 bg-background/80 px-4 py-1.5 text-[0.7rem] text-foreground/80"
                >
                  <span className={`h-2 w-2 rounded-full ${item.dotClass}`} />
                  {item.label}
                </span>
              ))}
            </div>
          </Marquee>
          <div className="pointer-events-none absolute inset-y-0 left-0 w-16 bg-gradient-to-r from-background to-transparent z-10" />
          <div className="pointer-events-none absolute inset-y-0 right-0 w-16 bg-gradient-to-l from-background to-transparent z-10" />
        </div>
      </div>
    </section>
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

  const handleNavClick = (id: string) => {
    if (typeof document === "undefined") return;
    const el = document.getElementById(id);
    if (!el) return;
    el.scrollIntoView({ behavior: "smooth", block: "start" });
  };

  const servicesFeatures: BentoFeature[] = [
    {
      id: "services-text",
      title: "Services for Imphal–Delhi lane",
      description:
        "Direct air and road departures between Imphal and New Delhi.",
      content: (
        <ul className="space-y-1 text-[0.75rem] text-muted-foreground">
          <li>• Scheduled departures on the Imphal–Delhi corridor.</li>
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
        <div className="h-40 md:h-48 w-full">
          <ServiceRouteVisual />
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
        <div className="flex h-40 md:h-48 flex-col justify-between rounded-xl border border-border/60 bg-pop/40 p-4">
          <div className="flex items-center justify-between text-[0.7rem] text-muted-foreground">
            <span className="font-mono uppercase tracking-[0.18em]">Sample lane</span>
            <span className="rounded-full border border-border/60 bg-background/80 px-2 py-0.5 text-[0.65rem]">
              IMH · DEL
            </span>
          </div>
          <div className="space-y-3 text-[0.7rem] text-muted-foreground">
            <div className="flex items-center gap-3">
              <span className="h-2 w-2 rounded-full bg-success" />
              <span>Booked & pickup confirmed</span>
            </div>
            <div className="flex items-center gap-3">
              <span className="h-2 w-2 rounded-full bg-primary" />
              <span>In line-haul to Delhi hub</span>
            </div>
            <div className="flex items-center gap-3">
              <span className="h-2 w-2 rounded-full bg-warning" />
              <span>At Delhi hub · out for delivery</span>
            </div>
          </div>
          <div className="h-1.5 overflow-hidden rounded-full bg-border/60">
            <div className="h-full w-3/4 rounded-full bg-primary" />
          </div>
        </div>
      ),
      className: "glass-panel col-span-1 md:col-span-3 lg:col-span-3",
    },
  ];

  const networkFeatures: BentoFeature[] = [
    {
      id: "network-text",
      title: "Imphal–Delhi network",
      description:
        "Hubs and fleet anchored in Imphal and New Delhi for predictable transits.",
      content: (
        <ul className="space-y-1 text-[0.75rem] text-muted-foreground">
          <li>• Dedicated Imphal–Delhi line-haul corridor.</li>
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
        <div className="h-40 md:h-48 w-full">
          <NetworkMapVisual />
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
      <ScrollProgress />
      <div className="relative flex h-full flex-col">
        <header className="border-b border-border/60 bg-background/95">
          <div className="mx-auto flex h-14 md:h-16 max-w-6xl items-center justify-between px-6">
            <div className="flex items-center">
              <BrandLogo size="xs" />
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

        <main className="flex-1 pt-6 md:pt-8 overflow-y-auto">
          {/* Hero section */}
          <section className="relative flex min-h-[70vh] items-center justify-center overflow-hidden">
            <div className="relative z-10 w-full">
              <FinancialHero
                overline={
                  <p className="hud-text text-[0.7rem] tracking-[0.24em] text-muted-foreground uppercase">
                    Northeast cargo operations
                  </p>
                }
                title={
                  <div className="space-y-1">
                    <div>
                      <TextAnimate
                        as="span"
                        by="word"
                        animation="blurInUp"
                        duration={0.8}
                        className="inline-block mr-2"
                      >
                        15 Years Connecting
                      </TextAnimate>
                      <TextAnimate
                        as="span"
                        by="word"
                        animation="blurInUp"
                        duration={0.8}
                        className="inline-block text-primary"
                      >
                        Imphal & Delhi
                      </TextAnimate>
                    </div>
                    <TextAnimate
                      as="span"
                      by="word"
                      animation="blurInUp"
                      duration={0.8}
                      className="block"
                    >
                      With Speed and Trust
                    </TextAnimate>
                  </div>
                }
                stats={
                  <div className="flex flex-wrap items-center gap-2 text-[0.7rem] text-muted-foreground/90">
                    <span className="inline-flex items-center gap-2 rounded-full border border-border/60 bg-background/80 px-3 py-1">
                      <span className="h-1.5 w-1.5 rounded-full bg-success" />
                      98.4% on-time · last 90 days
                    </span>
                    <span className="inline-flex items-center gap-2 rounded-full border border-border/60 bg-background/80 px-3 py-1">
                      <span className="h-1.5 w-1.5 rounded-full bg-primary/80" />
                      Direct corridor · Imphal · New Delhi
                    </span>
                  </div>
                }
                description={
                  <p className="text-sm leading-relaxed text-foreground/80 sm:text-base md:text-lg">
                    The most experienced cargo partner for air & road shipments between Imphal and Delhi.
                  </p>
                }
                buttonText="Track shipment"
                buttonLink="/track"
                rightContent={<HeroLottieCard />}
              />
              <div className="mx-auto mt-10 w-full max-w-6xl px-6 md:px-10">
                <div className="max-w-3xl">
                  <HeroInlineTracking />
                </div>
              </div>
            </div>
          </section>

          <TrustedByMarquee />

          {/* Services section */}
          <section
            id="services"
            className="border-t border-border/60 bg-pop/40 py-10 sm:py-12 lg:py-16 scroll-mt-24"
          >
            <div className="mx-auto max-w-6xl px-6 space-y-6">
              <div className="flex flex-col gap-3 md:flex-row md:items-end md:justify-between">
                <div className="max-w-md space-y-2">
                  <p className="hud-text text-[0.7rem] tracking-[0.24em] text-muted-foreground uppercase">
                    Services
                  </p>
                  <TextAnimate
                    as="p"
                    by="word"
                    animation="blurInUp"
                    duration={0.6}
                    className="text-sm text-muted-foreground sm:text-base"
                  >
                    How Tapan Associate moves freight between Imphal and New Delhi.
                  </TextAnimate>
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
            className="border-t border-border/40 bg-background py-10 sm:py-12 lg:py-16 scroll-mt-24"
          >
            <div className="mx-auto grid max-w-6xl gap-8 px-6 md:grid-cols-[minmax(0,1.4fr)_minmax(0,1.15fr)] md:items-start">
              <div className="space-y-4">
                <div className="max-w-md space-y-2">
                  <p className="hud-text text-[0.7rem] tracking-[0.24em] text-muted-foreground uppercase">
                    Tracking
                  </p>
                  <TextAnimate
                    as="p"
                    by="word"
                    animation="blurInUp"
                    duration={0.6}
                    className="text-sm text-muted-foreground sm:text-base"
                  >
                    Live shipment status from pickup in Imphal to delivery in New Delhi.
                  </TextAnimate>
                </div>

                <AnimatedCard className="glass-panel border-border/60 bg-pop/40">
                  <div className="space-y-4 pt-4">
                    <div className="flex items-center justify-between gap-4">
                      <div>
                        <p className="text-[0.7rem] font-mono uppercase tracking-[0.2em] text-muted-foreground">
                          On-time deliveries · last 90 days
                        </p>
                        <p className="mt-2 text-3xl font-semibold text-foreground">98.4%</p>
                      </div>
                      <div className="relative flex h-16 w-16 items-center justify-center border border-primary/40 bg-pop">
                        <ShieldIcon className="h-7 w-7 text-primary" strokeWidth={1.25} />
                      </div>
                    </div>
                    <p className="text-[0.75rem] text-muted-foreground">
                      Based on confirmed departures and arrivals between Imphal and New Delhi.
                    </p>
                  </div>
                </AnimatedCard>

                <AnimatedCard className="glass-panel border-border/60">
                  <div className="space-y-3 pt-4">
                    <p className="text-[0.7rem] font-mono uppercase tracking-[0.2em] text-muted-foreground">
                      Recent tracking events
                    </p>
                    <div className="space-y-1 text-[0.75rem] text-muted-foreground">
                      <p>· IMH → DEL line-haul departed · 04:12</p>
                      <p>· IMH → DEL line-haul arrived at Delhi hub · 09:45</p>
                      <p>· Exception ticket acknowledged by ops desk · Today, 11:15</p>
                    </div>
                  </div>
                </AnimatedCard>
              </div>

              <div className="md:self-end">
                <AnimatedCard className="glass-panel border-border/60 bg-pop/40 p-4">
                    <div className="relative w-full overflow-hidden border border-border/60 aspect-[16/9]">
                      <Image
                        src="/assets/tracking-map.jpeg"
                        alt="Map visual showing Tapan Associate tracking lanes between Northeast cities and Delhi"
                        fill
                        className="object-cover"
                        priority={false}
                      />
                      <div className="pointer-events-none absolute inset-x-4 top-3 flex items-center justify-between text-[0.6rem] tracking-[0.2em] uppercase text-muted-foreground/80">
                        <span>Tracking lanes overview</span>
                        <span className="border border-border/60 bg-background/80 px-2 py-0.5">
                          Imphal · New Delhi
                        </span>
                      </div>
                      <div className="pointer-events-none absolute inset-x-4 bottom-3 flex items-center justify-between text-[0.6rem] text-muted-foreground/80">
                        <span className="flex items-center gap-1">
                          <span className="h-1.5 w-1.5 bg-success animate-pulse" />
                          Live lane focus
                        </span>
                        <span>Illustrative map</span>
                      </div>
                    </div>
                  </AnimatedCard>
              </div>
            </div>
          </section>

          {/* Network section */}
          <section
            id="network"
            className="border-t border-border/40 bg-pop/40 py-10 sm:py-12 lg:py-16 scroll-mt-24"
          >
            <div className="mx-auto max-w-6xl px-6 space-y-6">
              <div className="max-w-md space-y-2">
                <p className="hud-text text-[0.7rem] tracking-[0.24em] text-muted-foreground uppercase">
                  Network
                </p>
                <TextAnimate
                  as="p"
                  by="word"
                  animation="blurInUp"
                  duration={0.6}
                  className="text-sm text-muted-foreground sm:text-base"
                >
                  The Imphal–Delhi line-haul and hub structure behind your shipments.
                </TextAnimate>
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
            className="border-t border-border/40 bg-background py-10 sm:py-12 lg:py-16 scroll-mt-24"
          >
            <div className="mx-auto max-w-6xl px-6 space-y-8">
              <div className="max-w-md space-y-2">
                <p className="hud-text text-[0.7rem] tracking-[0.24em] text-muted-foreground uppercase">
                  Support
                </p>
                <TextAnimate
                  as="p"
                  by="word"
                  animation="blurInUp"
                  duration={0.6}
                  className="text-sm text-muted-foreground sm:text-base"
                >
                  When something goes wrong on the Imphal–Delhi lane, how Tapan Associate helps you recover quickly.
                </TextAnimate>
              </div>

              <CategoryList
                title="Support channels"
                subtitle="for customers & partners"
                categories={supportCategories}
                headerIcon={<UsersIcon className="h-8 w-8" />}
                className="bg-transparent p-0"
              />
            </div>
          </section>

          {/* About section */}
          <section
            id="about"
            className="border-t border-border/40 bg-background py-8 sm:py-10 lg:py-12 scroll-mt-24"
          >
            <div className="mx-auto max-w-6xl px-6">
              <AboutApps />
            </div>
          </section>

          <footer className="border-t border-border/60 bg-background/95">
            <div className="mx-auto max-w-6xl px-6 py-5 space-y-3 text-[0.7rem] text-muted-foreground">
              <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
                <div className="flex items-center gap-3">
                  <BrandLogo size="xs" />
                </div>

                <div className="flex flex-col items-start gap-1 text-[0.65rem] md:items-end">
                  <span className="text-muted-foreground/80">
                    Powered by <span className="font-medium text-foreground">Arra-Core</span>.
                  </span>
                </div>
              </div>

              <div className="flex flex-wrap items-center justify-between gap-3 text-[0.65rem] text-muted-foreground/80">
                <nav className="flex flex-wrap items-center gap-x-4 gap-y-1">
                  <button
                    type="button"
                    onClick={() => handleNavClick("services")}
                    className="hover:text-foreground transition-colors"
                  >
                    Services
                  </button>
                  <button
                    type="button"
                    onClick={() => handleNavClick("tracking")}
                    className="hover:text-foreground transition-colors"
                  >
                    Tracking
                  </button>
                  <button
                    type="button"
                    onClick={() => handleNavClick("network")}
                    className="hover:text-foreground transition-colors"
                  >
                    Network
                  </button>
                  <button
                    type="button"
                    onClick={() => handleNavClick("support")}
                    className="hover:text-foreground transition-colors"
                  >
                    Support
                  </button>
                  <button
                    type="button"
                    onClick={() => handleNavClick("about")}
                    className="hover:text-foreground transition-colors"
                  >
                    About
                  </button>
                </nav>

                <span> {new Date().getFullYear()} Tapan Associate</span>
              </div>
            </div>
          </footer>
        </main>
      </div>
    </div>
  );
}
