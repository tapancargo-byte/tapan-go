"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabaseClient";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { BrandLogo } from "@/components/ui/brand-logo";
import {
  Plane,
  Truck,
  Package,
  MapPin,
  Clock,
  Shield,
  Mail,
  ArrowRight,
  MessageCircle,
  Ticket,
  ArrowUpRight,
  Globe,
  Facebook,
  Instagram,
} from "lucide-react";
import { motion } from "framer-motion";
import Lottie from "lottie-react";
import { MorphicNavbar } from "@/components/ui/morphic-navbar";
import { KiboSectionHeader } from "@/components/ui/kibo-primitives";
import { AppIcon } from "@/components/ui/app-icon";
import { HyperText } from "@/components/ui/hyper-text";
import { AnimatedShinyText } from "@/components/ui/animated-shiny-text";
import { SparklesText } from "@/components/ui/sparkles-text";
import { AiSupportChat } from "@/components/support/ai-support-chat";
import { LandingTicketForm } from "@/components/support/landing-ticket-form";
import { BorderBeam } from "@/components/ui/border-beam";
import { ShineBorder } from "@/components/ui/shine-border";
import { MagicCard } from "@/components/ui/magic-card";
import type { LucideIcon } from "lucide-react";
import {
  Drawer,
  DrawerContent,
  DrawerHeader,
  DrawerTitle,
  DrawerDescription,
  DrawerTrigger,
  DrawerClose,
} from "@/components/ui/drawer";

interface AuthState {
  checking: boolean;
  authed: boolean;
}

interface DashboardAuthOverlayProps {
  initialAuthed?: boolean;
}

// Tracking form component
function TrackingForm() {
  const router = useRouter();
  const [value, setValue] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const trimmed = value.trim();
    if (!trimmed) return;
    router.push(`/track?ref=${encodeURIComponent(trimmed)}`);
  };

  return (
    <form onSubmit={handleSubmit} className="flex gap-2">
      <Input
        aria-label="Tracking number"
        placeholder="Enter AWB or tracking number"
        value={value}
        onChange={(e) => setValue(e.target.value)}
        className="flex-1 h-12 text-sm bg-background"
      />
      <Button type="submit" className="h-12 px-6">
        Track
        <ArrowRight className="ml-2 h-4 w-4" />
      </Button>
    </form>
  );
}

// Service card component
function ServiceCard({
  icon,
  title,
  description,
}: {
  icon: LucideIcon;
  title: string;
  description: string;
}) {
  return (
    <MagicCard
      className="p-6 cursor-pointer border-transparent bg-card/50 backdrop-blur-sm"
      gradientColor="var(--accent-cool)"
      gradientOpacity={0.15}
    >
      <div className="relative z-10 flex items-start gap-4">
        <div className="p-3 rounded-lg bg-primary/10 text-primary">
          <AppIcon icon={icon} className="h-6 w-6" />
        </div>
        <div className="space-y-2">
          <h3 className="font-semibold text-foreground text-lg">{title}</h3>
          <p className="text-sm text-muted-foreground leading-relaxed">{description}</p>
        </div>
      </div>
      <BorderBeam
        size={100}
        duration={12}
        delay={9}
        borderWidth={1.5}
        colorFrom="transparent"
        colorTo="var(--primary)"
        className="opacity-0 group-hover:opacity-100 transition-opacity"
      />
    </MagicCard>
  );
}

function HeroConnectivityDiagram() {
  const [animationData, setAnimationData] = useState<any | null>(null);

  useEffect(() => {
    let cancelled = false;

    async function loadAnimation() {
      try {
        const response = await fetch("/assets/hero-truck.json");
        if (!response.ok) return;
        const data = await response.json();
        if (!cancelled) {
          setAnimationData(data);
        }
      } catch {
        // Ignore errors and fall back to static content
      }
    }

    void loadAnimation();

    return () => {
      cancelled = true;
    };
  }, []);

  return (
    <div className="relative flex h-[320px] w-full max-w-[520px] items-center justify-center overflow-hidden rounded-2xl border border-border/60 bg-card/80 p-6 shadow-xl backdrop-blur-md">
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_top,_var(--primary)_0,_transparent_55%)]/40" />
      {animationData ? (
        <Lottie
          animationData={animationData}
          loop
          autoplay
          className="relative z-10 w-full max-w-sm"
        />
      ) : (
        <div className="relative z-10 flex flex-col items-center gap-3 text-center">
          <div className="inline-flex items-center gap-2 rounded-full bg-primary/10 px-4 py-1 text-[11px] font-medium text-primary">
            <Truck className="h-4 w-4" />
            <span>Imphal ⇄ New Delhi line-haul</span>
          </div>
          <p className="text-[11px] text-muted-foreground max-w-xs">
            Live truck animation loading…
          </p>
        </div>
      )}
    </div>
  );
}

export function DashboardAuthOverlay({ initialAuthed = false }: DashboardAuthOverlayProps) {
  const [authState, setAuthState] = useState<AuthState>(() => ({
    checking: !initialAuthed,
    authed: initialAuthed,
  }));
  useEffect(() => {
    if (initialAuthed) {
      // If the server already knows the user is authenticated, skip the
      // client-side check to avoid briefly showing the overlay after refresh.
      return;
    }
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
  }, [initialAuthed]);

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
  if (!authState.checking && authState.authed) {
    return null;
  }

  const handleNavClick = (id: string) => {
    if (typeof document === "undefined") return;
    const el = document.getElementById(id);
    if (!el) return;
    el.scrollIntoView({ behavior: "smooth", block: "start" });
  };

  return (
    <div className="fixed inset-0 z-50 bg-background text-foreground overflow-y-auto">
      {/* Header */}
      <header className="sticky top-0 z-50 border-b border-[var(--glass-border)] bg-[var(--card-glass)] backdrop-blur-xl">
        <MorphicNavbar mode="landing" onNavClick={handleNavClick} />
      </header>

      <main>
        {/* Hero Section */}
        <section className="relative overflow-hidden bg-background pt-12 pb-20 lg:pt-20 lg:pb-32">
          <div
            className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_top,_var(--primary)_0,_transparent_60%)]/35"
            aria-hidden="true"
          />
          <div className="relative mx-auto max-w-6xl px-6">
            <div className="grid lg:grid-cols-2 gap-12 lg:gap-16 items-center">
              {/* Left - Content */}
              <motion.div
                className="space-y-10"
                initial={{ opacity: 0, y: 24 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.7, ease: "easeOut" }}
              >
                <div className="space-y-4">
                  <div className="inline-flex items-center gap-2 rounded-none border border-primary/20 bg-primary/5 px-3 py-1 text-xs font-medium text-primary backdrop-blur-sm">
                    <span className="flex h-2 w-2 rounded-full bg-primary animate-pulse" />
                    <AnimatedShinyText className="text-[11px] font-semibold">
                      Connecting the Northeast Corridor
                    </AnimatedShinyText>
                  </div>
                  <HyperText
                    as="h1"
                    className="font-extrabold tracking-tight text-transparent bg-clip-text bg-gradient-to-r from-primary to-accent text-5xl md:text-6xl lg:text-7xl leading-[1.1]"
                  >
                    {"The Logistics\nSTANDARD."}
                  </HyperText>
                  <p className="text-lg md:text-xl text-muted-foreground max-w-xl leading-relaxed">
                    15 years of dedicated service. The OG Imphal ⇄ New Delhi operator you can count on.
                  </p>
                </div>

                <div className="flex flex-col sm:flex-row gap-3 sm:gap-4">
                  <Button
                    asChild
                    size="lg"
                    className="h-11 px-6 text-sm md:text-base rounded-lg bg-primary hover:bg-primary/90 shadow-md shadow-primary/25 transition-colors"
                  >
                    <Link href="/track">
                      Track Shipment <ArrowUpRight className="ml-2 h-4 w-4" />
                    </Link>
                  </Button>
                  <Button
                    asChild
                    variant="outline"
                    size="lg"
                    className="h-11 px-6 text-sm md:text-base rounded-lg border-border hover:bg-muted/60 backdrop-blur-sm transition-colors"
                  >
                    <Link href="#contact">Contact Ops</Link>
                  </Button>
                </div>

                <div className="grid grid-cols-3 gap-8 pt-8 border-t border-border/40">
                  <div>
                    <p className="text-3xl font-bold text-foreground">15+</p>
                    <p className="text-xs uppercase tracking-wider text-muted-foreground mt-1">Years Service</p>
                  </div>
                  <div>
                    <p className="text-3xl font-bold text-foreground">100K+</p>
                    <p className="text-xs uppercase tracking-wider text-muted-foreground mt-1">Shipments</p>
                  </div>
                  <div>
                    <p className="text-3xl font-bold text-foreground">24/7</p>
                    <p className="text-xs uppercase tracking-wider text-muted-foreground mt-1">Support</p>
                  </div>
                </div>
              </motion.div>

              {/* Right - Animated Beam Connectivity */}
              <div className="relative hidden lg:flex items-center justify-center min-h-[400px]">
                <HeroConnectivityDiagram />
              </div>
            </div>
          </div>
        </section>

        {/* Highlights Bento Grid */}
        <section className="py-24 bg-muted/10 relative">
          <div className="absolute inset-0 bg-[radial-gradient(#e5e7eb_1px,transparent_1px)] [background-size:16px_16px] opacity-[0.1] dark:bg-[radial-gradient(#333_1px,transparent_1px)]" />
          <div className="mx-auto max-w-6xl px-6 relative z-10">
            <div className="mb-10 text-center space-y-2">
              <h2 className="text-3xl font-bold tracking-tight">Operations at a glance</h2>
              <SparklesText
                className="text-base md:text-lg font-medium text-muted-foreground max-w-2xl mx-auto"
                sparklesCount={12}
                colors={{ first: "#A07CFE", second: "#FE8FB5" }}
              >
                Live insights from our primary corridor.
              </SparklesText>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 h-auto md:h-[400px]">
              {/* Main KPI Card */}
              <ShineBorder
                className="md:col-span-2 md:row-span-2 relative overflow-hidden rounded-xl border bg-card p-8 flex flex-col justify-between"
                shineColor={["#A07CFE", "#FE8FB5", "#FFBE7B"]}
                duration={10}
                borderWidth={1}
              >
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div className="p-2 bg-primary/10 rounded-lg">
                      <Globe className="h-6 w-6 text-primary" />
                    </div>
                    <span className="text-xs font-medium px-2 py-1 rounded-full bg-green-500/10 text-green-500">
                      ● Network Stable
                    </span>
                  </div>
                  <div>
                    <h3 className="text-sm font-medium text-muted-foreground uppercase tracking-widest">Service Level</h3>
                    <div className="flex items-baseline gap-2 mt-1">
                      <span className="text-5xl font-bold text-foreground">98.2%</span>
                      <span className="text-sm text-emerald-500 font-medium">↑ 1.4%</span>
                    </div>
                    <p className="text-sm text-muted-foreground mt-2">
                      On-time delivery performance for Imphal ⇄ New Delhi route this week.
                    </p>
                  </div>
                </div>

                {/* Mini Chart Visual */}
                <div className="h-32 w-full mt-6 flex items-end gap-1">
                  {[40, 65, 50, 80, 55, 90, 75, 95, 85, 98].map((h, i) => (
                    <motion.div
                      key={i}
                      className="flex-1 bg-primary/20 hover:bg-primary/40 rounded-t-sm transition-colors"
                      initial={{ height: 0 }}
                      whileInView={{ height: `${h}%` }}
                      transition={{ delay: i * 0.05 }}
                    />
                  ))}
                </div>
              </ShineBorder>

              {/* Secondary Stats */}
              <div className="grid grid-rows-2 gap-6 h-full">
                <MagicCard className="p-6 flex flex-col justify-center" gradientColor="var(--accent-cool)" gradientOpacity={0.1}>
                  <div className="flex items-center gap-3 mb-2">
                    <Package className="h-5 w-5 text-accent" />
                    <span className="text-sm font-medium text-muted-foreground">Active Volume</span>
                  </div>
                  <p className="text-3xl font-bold">1,284</p>
                  <p className="text-xs text-muted-foreground">Parcels in transit</p>
                </MagicCard>

                <MagicCard className="p-6 flex flex-col justify-center" gradientColor="var(--accent-warm)" gradientOpacity={0.1}>
                  <div className="flex items-center gap-3 mb-2">
                    <Clock className="h-5 w-5 text-orange-500" />
                    <span className="text-sm font-medium text-muted-foreground">Avg Transit</span>
                  </div>
                  <p className="text-3xl font-bold">48h</p>
                  <p className="text-xs text-muted-foreground">Hub to Hub</p>
                </MagicCard>
              </div>
            </div>
          </div>
        </section>

        {/* Services Section */}
        <section id="services" className="py-20 bg-muted/30 border-y border-border">
          <div className="mx-auto max-w-6xl px-6">
            <div className="mb-12">
              <KiboSectionHeader
                title="Our Services"
                description="Comprehensive cargo solutions between Imphal and New Delhi, tailored to your business needs."
                align="center"
                size="lg"
              />
            </div>

            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-120px" }}
                transition={{ duration: 0.55, ease: "easeOut" }}
              >
                <ServiceCard
                  icon={Plane}
                  title="Air Cargo"
                  description="Rapid air freight between Imphal and New Delhi. Ideal for time-sensitive shipments, perishables, and urgent deliveries with real-time tracking."
                />
              </motion.div>
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-120px" }}
                transition={{ duration: 0.55, ease: "easeOut", delay: 0.05 }}
              >
                <ServiceCard
                  icon={Truck}
                  title="Road Transport"
                  description="Cost-effective overland cargo from New Delhi to Imphal and back. Perfect for bulk shipments and regular supply chain needs."
                />
              </motion.div>
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-120px" }}
                transition={{ duration: 0.55, ease: "easeOut", delay: 0.1 }}
              >
                <ServiceCard
                  icon={Package}
                  title="End-to-End Service"
                  description="Single-point coordination from pickup to delivery. We handle documentation, customs, and last-mile delivery across both routes."
                />
              </motion.div>
            </div>

            {/* Routes */}
            <div className="mt-12 grid md:grid-cols-2 gap-6">
              <MagicCard className="p-6 bg-card/50 backdrop-blur-sm" gradientColor="var(--accent-cool)" gradientOpacity={0.1}>
                <div className="flex items-center gap-4 mb-4">
                  <div className="p-2 rounded-full bg-primary/10 text-primary">
                    <AppIcon icon={MapPin} />
                  </div>
                  <h3 className="font-semibold text-lg">Imphal to New Delhi</h3>
                </div>
                <p className="text-sm text-muted-foreground leading-relaxed">
                  Regular departures from Imphal hub with consolidated freight options. Air cargo and road transport available.
                </p>
              </MagicCard>
              <MagicCard className="p-6 bg-card/50 backdrop-blur-sm" gradientColor="var(--accent-warm)" gradientOpacity={0.1}>
                <div className="flex items-center gap-4 mb-4">
                  <div className="p-2 rounded-full bg-primary/10 text-primary">
                    <AppIcon icon={MapPin} />
                  </div>
                  <h3 className="font-semibold text-lg">New Delhi to Imphal</h3>
                </div>
                <p className="text-sm text-muted-foreground leading-relaxed">
                  Scheduled services from Delhi hub to Imphal. Reliable transit times with secure handling throughout.
                </p>
              </MagicCard>
            </div>
          </div>
        </section>

        {/* Tracking Section */}
        <section id="tracking" className="py-20">
          <div className="mx-auto max-w-6xl px-6">
            <div className="grid lg:grid-cols-2 gap-12 items-center">
              <div className="space-y-6">
                <KiboSectionHeader
                  title="Track Your Shipment"
                  description="Enter your AWB or tracking number to get real-time status updates on your cargo."
                  align="left"
                  size="lg"
                />

                <TrackingForm />

                {/* Sample Tracking Events */}
                <MagicCard className="p-6 space-y-4 border-transparent bg-card/50 backdrop-blur-sm" gradientColor="var(--accent-cool)" gradientOpacity={0.15}>
                  <div className="flex items-center gap-2 text-sm font-medium text-muted-foreground">
                    <Clock className="h-4 w-4" />
                    Recent Tracking Events
                  </div>
                  <div className="space-y-3">
                    <div className="flex items-start gap-3">
                      <div className="w-2 h-2 mt-2 bg-primary" />
                      <div>
                        <p className="text-sm font-medium">Imphal to New Delhi — Departed</p>
                        <p className="text-xs text-muted-foreground">Line-haul in transit</p>
                      </div>
                    </div>
                    <div className="flex items-start gap-3">
                      <div className="w-2 h-2 mt-2 bg-primary" />
                      <div>
                        <p className="text-sm font-medium">Arrived at New Delhi Hub</p>
                        <p className="text-xs text-muted-foreground">Processing for delivery</p>
                      </div>
                    </div>
                    <div className="flex items-start gap-3">
                      <div className="w-2 h-2 mt-2 bg-accent" />
                      <div>
                        <p className="text-sm font-medium">Out for Delivery</p>
                        <p className="text-xs text-muted-foreground">Expected delivery today</p>
                      </div>
                    </div>
                  </div>
                </MagicCard>
              </div>

              <div className="hidden lg:block">
                <MagicCard className="p-8 bg-muted/30 space-y-6 border-transparent" gradientColor="var(--primary)" gradientOpacity={0.1}>
                  <div className="flex items-center justify-between">
                    <h3 className="font-semibold">Why Track With Us</h3>
                    <Shield className="h-5 w-5 text-primary" />
                  </div>
                  <div className="space-y-4">
                    <div className="flex items-start gap-3">
                      <AppIcon icon={Clock} className="h-8 w-8" />
                      <div>
                        <p className="font-medium text-sm">Real-time Updates</p>
                        <p className="text-xs text-muted-foreground">Live status from pickup to delivery</p>
                      </div>
                    </div>
                    <div className="flex items-start gap-3">
                      <AppIcon icon={MapPin} className="h-8 w-8" />
                      <div>
                        <p className="font-medium text-sm">Location Visibility</p>
                        <p className="text-xs text-muted-foreground">Know exactly where your cargo is</p>
                      </div>
                    </div>
                    <div className="flex items-start gap-3">
                      <AppIcon icon={Shield} className="h-8 w-8" />
                      <div>
                        <p className="font-medium text-sm">Secure Handling</p>
                        <p className="text-xs text-muted-foreground">Every shipment handled with care</p>
                      </div>
                    </div>
                  </div>
                </MagicCard>
              </div>
            </div>
          </div>
        </section>

        {/* Contact Section */}
        <section id="contact" className="py-20 bg-muted/30 border-y border-border">
          <div className="mx-auto max-w-6xl px-6">
            <div className="mb-10 text-center">
              <KiboSectionHeader
                title="Get In Touch"
                description="Ready to ship? Our ops team is available from 10:00 am to 9:00 pm IST for quotes, bookings, and shipment support."
                align="center"
                size="lg"
              />
            </div>

            <div className="relative mx-auto max-w-5xl overflow-hidden rounded-2xl border border-border/60 bg-card/90 shadow-xl backdrop-blur-xl">
              <div
                aria-hidden
                className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_top,_var(--primary)_0,_transparent_60%)]/14"
              />

              {/* Top grid: hubs + working hours, ContactPage-style boxes */}
              <div className="relative grid divide-y divide-border/60 md:grid-cols-3 md:divide-y-0 md:divide-x">
                {/* Imphal Hub */}
                <div className="flex flex-col justify-between">
                  <div className="flex items-center gap-3 border-b border-border/60 bg-muted/40 px-5 py-3">
                    <MapPin className="h-4 w-4 text-muted-foreground" />
                    <h2 className="text-xs font-semibold tracking-[0.16em] uppercase">
                      Imphal Hub
                    </h2>
                  </div>
                  <div className="space-y-3 px-5 py-6 text-sm text-muted-foreground">
                    <p className="font-mono text-[13px] text-foreground">
                      Singjamei Top Leikai, Imphal, Manipur 795008
                    </p>
                    <p className="text-xs text-muted-foreground/90">
                      For shipment questions and new enquiries, start with our AI assistant.
                    </p>
                    <div className="flex items-center gap-2">
                      <Mail className="h-4 w-4" />
                      <span className="font-mono text-[13px]">imphal@tapango.logistics</span>
                    </div>
                  </div>
                  <div className="border-t border-border/60 px-5 py-3 text-xs text-muted-foreground">
                    Primary Northeast operations hub.
                  </div>
                </div>

                {/* New Delhi Hub */}
                <div className="flex flex-col justify-between">
                  <div className="flex items-center gap-3 border-b border-border/60 bg-muted/40 px-5 py-3">
                    <MapPin className="h-4 w-4 text-muted-foreground" />
                    <h2 className="text-xs font-semibold tracking-[0.16em] uppercase">
                      New Delhi Hub
                    </h2>
                  </div>
                  <div className="space-y-3 px-5 py-6 text-sm text-muted-foreground">
                    <p className="font-mono text-[13px] leading-relaxed text-foreground">
                      2ND FLOOR FLAT NO 1498/2, GALI NO 3, Wazir Nagar, K.M. Pur, New Delhi, Delhi 110003
                    </p>
                    <p className="text-xs text-muted-foreground/90">
                      Use the AI chatbot for quick status checks and FAQs; our team will follow up by email when needed.
                    </p>
                    <div className="flex items-center gap-2">
                      <Mail className="h-4 w-4" />
                      <span className="font-mono text-[13px]">delhi@tapango.logistics</span>
                    </div>
                  </div>
                  <div className="border-t border-border/60 px-5 py-3 text-xs text-muted-foreground">
                    Secondary metro hub for line-haul and consolidation.
                  </div>
                </div>

                {/* Working Hours */}
                <div className="flex flex-col justify-between">
                  <div className="flex items-center gap-3 border-b border-border/60 bg-muted/40 px-5 py-3">
                    <Clock className="h-4 w-4 text-muted-foreground" />
                    <h2 className="text-xs font-semibold tracking-[0.16em] uppercase">
                      Working Hours
                    </h2>
                  </div>
                  <div className="space-y-3 px-5 py-6 text-sm text-muted-foreground">
                    <p className="font-mono text-[13px] text-foreground">
                      10:00 am - 9:00 pm IST
                    </p>
                    <p className="text-xs text-muted-foreground/90">
                      Ideal window for bookings, status checks, and delivery coordination across both hubs.
                    </p>
                  </div>
                  <div className="border-t border-border/60 px-5 py-3 text-xs text-muted-foreground">
                    For urgent after-hours issues, raise a ticket and our team will follow up.
                  </div>
                </div>
              </div>

              <div className="relative flex flex-col gap-6 border-t border-border/60 px-5 py-6 md:flex-row md:items-center md:justify-between md:px-8">
                <div className="max-w-md space-y-3">
                  <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-muted-foreground/80">
                    Support channels
                  </p>
                  <p className="text-sm text-muted-foreground">
                    Use the AI assistant for instant answers or create a ticket for shipment and invoice escalations.
                  </p>
                  <div className="flex flex-wrap items-center gap-3">
                    <Drawer>
                      <DrawerTrigger asChild>
                        <button
                          type="button"
                          className="flex items-center gap-2 rounded-full border border-border/70 bg-muted/60 px-4 py-2 text-xs font-medium text-foreground transition-colors hover:bg-accent hover:text-accent-foreground"
                        >
                          <MessageCircle className="h-4 w-4" aria-hidden="true" />
                          <span className="font-mono tracking-wide">AI ops assistant</span>
                        </button>
                      </DrawerTrigger>
                      <DrawerContent className="data-[vaul-drawer-direction=bottom]:rounded-none data-[vaul-drawer-direction=bottom]:border-t border-border bg-background">
                        <div className="mx-auto w-full max-w-3xl">
                          <DrawerHeader className="px-4 pt-4 pb-2">
                            <DrawerTitle className="text-sm font-semibold tracking-tight">
                              AI assistant
                            </DrawerTitle>
                            <DrawerDescription className="text-xs">
                              Ask about Tapan shipments, tracking references, and support. For account
                              changes or escalations, use the ticket option.
                            </DrawerDescription>
                          </DrawerHeader>
                          <div className="space-y-4 px-4 pb-4">
                            <AiSupportChat />
                            <div className="flex justify-end">
                              <DrawerClose asChild>
                                <button
                                  type="button"
                                  className="h-8 px-3 border border-border bg-card text-xs hover:bg-accent/40"
                                >
                                  Close
                                </button>
                              </DrawerClose>
                            </div>
                          </div>
                        </div>
                      </DrawerContent>
                    </Drawer>

                    <Drawer>
                      <DrawerTrigger asChild>
                        <button
                          type="button"
                          className="flex items-center gap-2 rounded-full border border-border/70 bg-muted/60 px-4 py-2 text-xs font-medium text-foreground transition-colors hover:bg-accent hover:text-accent-foreground"
                        >
                          <Ticket className="h-4 w-4" aria-hidden="true" />
                          <span className="font-mono tracking-wide">Raise ticket</span>
                        </button>
                      </DrawerTrigger>
                      <DrawerContent className="data-[vaul-drawer-direction=bottom]:rounded-none data-[vaul-drawer-direction=bottom]:border-t border-border bg-background">
                        <div className="mx-auto w-full max-w-3xl">
                          <DrawerHeader className="px-4 pt-4 pb-2">
                            <DrawerTitle className="text-sm font-semibold tracking-tight">
                              Raise a ticket
                            </DrawerTitle>
                            <DrawerDescription className="text-xs">
                              Create a support ticket for a shipment or invoice. Our ops team will
                              follow up over email.
                            </DrawerDescription>
                          </DrawerHeader>
                          <div className="space-y-4 px-4 pb-4">
                            <LandingTicketForm />
                            <div className="flex justify-end">
                              <DrawerClose asChild>
                                <button
                                  type="button"
                                  className="h-8 px-3 border border-border bg-card text-xs hover:bg-accent/40"
                                >
                                  Close
                                </button>
                              </DrawerClose>
                            </div>
                          </div>
                        </div>
                      </DrawerContent>
                    </Drawer>
                  </div>
                </div>

                <div className="space-y-3">
                  <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-muted-foreground/80">
                    Find us online
                  </p>
                  <div className="flex flex-wrap items-center gap-3">
                    <a
                      href="#"
                      target="_blank"
                      rel="noreferrer"
                      className="flex items-center gap-2 rounded-full border border-border/60 bg-muted/50 px-4 py-2 text-xs font-medium text-foreground/80 transition-colors hover:bg-accent hover:text-accent-foreground"
                    >
                      <Facebook className="h-4 w-4" aria-hidden="true" />
                      <span className="font-mono tracking-wide">Facebook</span>
                    </a>

                    <a
                      href="#"
                      target="_blank"
                      rel="noreferrer"
                      className="flex items-center gap-2 rounded-full border border-border/60 bg-muted/50 px-4 py-2 text-xs font-medium text-foreground/80 transition-colors hover:bg-accent hover:text-accent-foreground"
                    >
                      <Instagram className="h-4 w-4" aria-hidden="true" />
                      <span className="font-mono tracking-wide">Instagram</span>
                    </a>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        </main>

        {/* Footer */}
        <footer className="border-t border-border bg-background/95 backdrop-blur-sm py-10">
          <div className="mx-auto max-w-5xl px-6">
            <div className="flex flex-col items-center gap-4 text-center">
              <BrandLogo size="xs" />
              <p className="text-sm text-muted-foreground max-w-md">
                Tapan Associate keeps your Northeast cargo network visible and on schedule with a unified operations layer.
              </p>
            </div>

            <div className="mt-8 flex flex-wrap justify-center gap-6 text-xs md:text-sm text-muted-foreground">
              <button
                onClick={() => handleNavClick("services")}
                className="hover:text-foreground transition-colors"
              >
                Services
              </button>
              <button
                onClick={() => handleNavClick("tracking")}
                className="hover:text-foreground transition-colors"
              >
                Track
              </button>
              <button
                onClick={() => handleNavClick("contact")}
                className="hover:text-foreground transition-colors"
              >
                Contact
              </button>
              <Link href="/login" className="hover:text-foreground transition-colors">
                Login
              </Link>
            </div>

            <div className="mt-6 flex justify-center gap-4 text-muted-foreground">
              <a
                href="#"
                target="_blank"
                rel="noreferrer"
                aria-label="Visit Tapan Associate website"
                className="transition-colors hover:text-foreground"
              >
                <Globe className="h-5 w-5" />
              </a>
              <a
                href="#contact"
                aria-label="Contact operations"
                className="transition-colors hover:text-foreground"
              >
                <MessageCircle className="h-5 w-5" />
              </a>
            </div>

            <div className="mt-8 space-y-1 text-center text-xs text-muted-foreground">
              <p> {new Date().getFullYear()} Tapan Associate. All rights reserved.</p>
              <p>
                Imphal · New Delhi · <span className="text-foreground/80">Powered by Arra-Core</span>
              </p>
            </div>
          </div>
        </footer>
      </div>
    );
  }
