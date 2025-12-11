"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabaseClient";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { BrandLogo } from "@/components/ui/brand-logo";
import {
  ArrowRight,
  Truck,
  Package,
  Clock,
  MapPin,
  Shield,
  Star,
  ArrowUpRight,
  Menu,
  X,
  CheckCircle2,
  TrendingUp,
  Users,
  HelpCircle,
  Mail,
  Phone,
  Quote,
  Facebook,
  Instagram,
  Ticket,
  MessageCircle,
  Plane,
  Calendar,
  Box,
  CheckCircle,
} from "lucide-react";
import { motion } from "framer-motion";
import Lottie from "lottie-react";
import { cn } from "@/lib/utils";
import happyCustomerData from "../../public/assets/happy-customer.json";
import secureLogisticsData from "../../public/assets/secure-logistics.json";
import onTimeDeliveryData from "../../public/assets/on-time-delivery.json";
import weeklyVolumeData from "../../public/assets/weekly-volume.json";
import operationsHubVisualData from "../../public/assets/operations-hub-visual.json";
import { MorphicNavbar } from "@/components/ui/morphic-navbar";
import { ThemeToggle } from "@/components/theme-toggle";
import { AiSupportChat } from "@/components/support/ai-support-chat";
import { LandingTicketForm } from "@/components/support/landing-ticket-form";
import {
  Drawer,
  DrawerContent,
  DrawerHeader,
  DrawerTitle,
  DrawerDescription,
  DrawerTrigger,
  DrawerClose,
} from "@/components/ui/drawer";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";

interface AuthState {
  checking: boolean;
  authed: boolean;
}

interface DashboardAuthOverlayProps {
  initialAuthed?: boolean;
}

// Reusable BoxCard Component
function BoxCard({
  children,
  className = "",
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <div
      className={cn(
        "bg-card text-card-foreground border border-border shadow-sm p-6 rounded-none",
        className
      )}
    >
      {children}
    </div>
  );
}

// Hero Collage Component
function HeroCollage() {
  return (
    <div className="relative w-full h-[360px] sm:h-[420px] lg:h-[600px] p-4">
      <div className="grid grid-cols-2 grid-rows-3 gap-4 h-full w-full max-w-lg mx-auto lg:mx-0 lg:ml-auto">
        {/* Top Left: Happy Customers */}
        <BoxCard className="col-span-1 row-span-2 flex flex-col items-center justify-center !p-5">
          <div className="w-full h-32 flex items-center justify-center">
            <Lottie
              animationData={happyCustomerData}
              loop
              autoplay
              className="h-full w-auto max-w-[80%]"
            />
          </div>
          <p className="mt-4 text-xs font-semibold uppercase tracking-wide text-muted-foreground text-center">
            Happy Customers
          </p>
        </BoxCard>

        {/* Top Right: Secure Logistics */}
        <BoxCard className="col-span-1 row-span-2 flex flex-col items-center justify-center !p-5">
          <div className="w-full h-32 flex items-center justify-center">
            <Lottie
              animationData={secureLogisticsData}
              loop
              autoplay
              className="h-full w-auto max-w-[80%]"
            />
          </div>
          <p className="mt-4 text-xs font-semibold uppercase tracking-wide text-center text-foreground">
            Secure Logistics
          </p>
          <p className="text-[11px] text-muted-foreground text-center mt-1">Imphal ⇄ New Delhi</p>
        </BoxCard>

        {/* Bottom Left: On-Time Delivery */}
        <BoxCard className="col-span-1 row-span-1 flex flex-col items-center justify-center !p-4">
          <div className="w-full h-24 flex items-center justify-center overflow-hidden">
            <Lottie
              animationData={onTimeDeliveryData}
              loop
              autoplay
              className="h-full w-auto max-w-[72%] scale-110"
            />
          </div>
          <p className="mt-3 text-xs font-semibold uppercase tracking-wide text-muted-foreground">
            On Time Delivery
          </p>
        </BoxCard>

        {/* Bottom Right: Weekly Volume */}
        <BoxCard className="col-span-1 row-span-1 flex flex-col items-center justify-center !p-4">
          <div className="w-full h-24 flex items-center justify-center overflow-hidden">
            <Lottie
              animationData={weeklyVolumeData}
              loop
              autoplay
              className="h-full w-auto max-w-[72%]"
            />
          </div>
          <p className="mt-3 text-xs font-semibold uppercase tracking-wide text-muted-foreground text-center">
            Weekly Volume
          </p>
        </BoxCard>
      </div>
    </div>
  );
}

// Updated Navbar (Local implementation)
function Navbar({ onNavClick, mobileOpen, setMobileOpen }: { onNavClick: (id: string) => void, mobileOpen: boolean, setMobileOpen: (v: boolean) => void }) {
    const navItems = [
        { label: "Services", id: "services" },
        { label: "Track", id: "track" },
        { label: "Contact", id: "contact" },
    ];

    return (
        <nav className="fixed top-0 left-0 right-0 z-50 bg-background/80 backdrop-blur-md border-b border-border transition-colors duration-200">
            <div className="max-w-7xl mx-auto px-4 md:px-6 h-16 md:h-20 flex items-center justify-between">
                <div className="flex-shrink-0">
                    <BrandLogo size="md" className="h-12 md:h-14 lg:h-16" />
                </div>

                {/* Desktop Nav - Centered */}
                <div className="hidden md:flex items-center gap-8 absolute left-1/2 transform -translate-x-1/2">
                    {navItems.map((item) => (
                        <button
                            key={item.id}
                            onClick={() => onNavClick(item.id)}
                            className="text-sm font-medium text-muted-foreground hover:text-primary transition-colors"
                        >
                            {item.label}
                        </button>
                    ))}
                </div>

                {/* Right Actions */}
                <div className="flex items-center gap-3">
                    <div className="hidden md:inline-flex">
                      <ThemeToggle />
                    </div>
                    <Button asChild size="sm" className="hidden md:inline-flex rounded-none">
                        <Link href="/login">Login</Link>
                    </Button>
                    <Sheet open={mobileOpen} onOpenChange={setMobileOpen}>
                      <SheetTrigger asChild>
                        <button className="md:hidden p-2 text-muted-foreground" aria-label="Open menu">
                          {mobileOpen ? <X /> : <Menu />}
                        </button>
                      </SheetTrigger>
                      {/* Mobile Menu */}
                      <SheetContent side="right" className="w-[85%] max-w-sm p-0">
                        <div className="px-6 py-6 space-y-4">
                          {navItems.map((item) => (
                            <button
                              key={item.id}
                              onClick={() => {
                                onNavClick(item.id);
                                setMobileOpen(false);
                              }}
                              className="block w-full text-left text-base font-medium text-muted-foreground hover:text-primary"
                            >
                              {item.label}
                            </button>
                          ))}
                          <div className="pt-3 mt-2 border-t border-border/60" />
                          <Link
                            href="/login"
                            className="block rounded-none px-3 py-2 text-muted-foreground hover:text-foreground hover:bg-muted/60"
                            onClick={() => setMobileOpen(false)}
                          >
                            Login
                          </Link>
                          <div className="mt-2">
                            <ThemeToggle />
                          </div>
                        </div>
                      </SheetContent>
                    </Sheet>
                </div>
            </div>
            
        </nav>
    );
}

export function DashboardLandingRefactored({ initialAuthed = false }: DashboardAuthOverlayProps) {
  const [authState, setAuthState] = useState<AuthState>(() => ({
    checking: !initialAuthed,
    authed: initialAuthed,
  }));
  const [mobileOpen, setMobileOpen] = useState(false);

  useEffect(() => {
    if (initialAuthed) return;
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
    return () => { cancelled = true; };
  }, [initialAuthed]);

  useEffect(() => {
    if (typeof document === "undefined") return;
    const previousOverflow = document.body.style.overflow;
    if (!authState.checking && !authState.authed) {
      document.body.style.overflow = "hidden";
    }
    return () => { document.body.style.overflow = previousOverflow; };
  }, [authState.checking, authState.authed]);

  const handleNavClick = (id: string) => {
    if (typeof document === "undefined") return;
    const el = document.getElementById(id);
    if (!el) return;
    el.scrollIntoView({ behavior: "smooth", block: "start" });
  };

  return (
    <div className="fixed inset-0 z-50 bg-background text-foreground overflow-y-auto">
      <Navbar onNavClick={handleNavClick} mobileOpen={mobileOpen} setMobileOpen={setMobileOpen} />

      <main className="pt-20">
        {/* Hero Section */}
        <section className="relative py-20 lg:py-32 px-6">
          <div className="max-w-7xl mx-auto grid lg:grid-cols-2 gap-12 lg:gap-8 items-center">
            {/* Left Content */}
            <div className="space-y-8 max-w-2xl">
              <h1 className="text-5xl lg:text-7xl font-bold tracking-tight text-foreground leading-[1.1]">
                Where Speed <br />
                <span className="text-primary">Meets Reliability</span>
              </h1>
              <p className="text-lg text-muted-foreground leading-relaxed max-w-lg">
                15 years dedicated. The operator you trust. Secure and fast.
              </p>
              
              <div className="flex flex-col sm:flex-row gap-4">
                <Button asChild size="lg" className="rounded-none">
                  <Link href="/track">Track Shipment</Link>
                </Button>
                <Button
                  asChild
                  variant="outline"
                  size="lg"
                  className="rounded-none"
                >
                  <Link href="#contact">Contact Ops</Link>
                </Button>
              </div>

              <div className="flex items-center gap-8 lg:gap-12 pt-8 border-t border-border/50">
                 <div className="flex items-center gap-3">
                    <i className="fa-solid fa-flag-checkered text-primary text-sm" aria-hidden="true" />
                    <div>
                      <p className="text-3xl font-bold text-foreground">15+</p>
                      <p className="text-sm font-medium text-muted-foreground">Years Service</p>
                    </div>
                 </div>
                 <div className="flex items-center gap-3">
                    <i className="fa-solid fa-boxes-stacked text-primary text-sm" aria-hidden="true" />
                    <div>
                      <p className="text-3xl font-bold text-foreground">100K+</p>
                      <p className="text-sm font-medium text-muted-foreground">Shipments</p>
                    </div>
                 </div>
                 <div className="flex items-center gap-3">
                    <i className="fa-solid fa-headset text-primary text-sm" aria-hidden="true" />
                    <div>
                      <p className="text-3xl font-bold text-foreground">24/7</p>
                      <p className="text-sm font-medium text-muted-foreground">Support</p>
                    </div>
                 </div>
              </div>
            </div>

            {/* Right Collage */}
            <div className="relative">
                <HeroCollage />
            </div>
          </div>
        </section>

        {/* Operations / Featured Section */}
        <section className="py-24 bg-muted/10 relative">
          <div className="max-w-7xl mx-auto px-6">
             <div className="mb-4">
                 <span className="text-xs font-bold text-primary uppercase tracking-widest">Featured —</span>
             </div>
             
             <div className="grid lg:grid-cols-2 gap-16 items-center mb-16">
                 {/* Left Visual */}
                 <BoxCard className="relative h-[400px] !p-0 overflow-hidden flex items-center justify-center">
                   <Lottie
                     animationData={operationsHubVisualData}
                     loop
                     autoplay
                     className="w-full h-full max-h-[380px]"
                   />
                 </BoxCard>

                 {/* Right Narrative */}
                 <div className="space-y-6">
                     <div className="inline-flex items-center gap-2 px-3 py-1 rounded-none bg-muted text-muted-foreground text-xs font-semibold">
                        <div className="w-2 h-2 rounded-none bg-primary animate-pulse" />
                        Network Stable
                     </div>
                     <h2 className="text-4xl font-bold text-foreground">Operations at a glance</h2>
                     <p className="text-lg text-muted-foreground leading-relaxed">
                         Live insights from our primary corridor. We maintain complete transparency with our service levels and capacity.
                     </p>
                     
                     <div className="p-6 bg-card rounded-none border border-border shadow-sm">
                         <div className="flex items-baseline gap-2">
                             <span className="text-5xl font-bold text-foreground">98.2%</span>
                             <span className="text-sm font-medium text-primary">↑ 1.4%</span>
                         </div>
                         <p className="text-sm text-muted-foreground mt-2">On-time delivery performance this week.</p>
                     </div>

                     <Button variant="link" className="p-0 h-auto text-primary font-semibold hover:no-underline group">
                         View Corridor Performance <ArrowRight className="ml-2 h-4 w-4 group-hover:translate-x-1 transition-transform" />
                     </Button>
                 </div>
             </div>

             {/* Operations Stats Row */}
             <div className="grid md:grid-cols-3 gap-6">
                 <BoxCard className="flex items-center gap-4">
                     <div className="p-3 bg-muted text-primary rounded-none flex items-center justify-center">
                         <i className="fa-solid fa-gauge-high text-base" aria-hidden="true" />
                     </div>
                     <div>
                         <p className="text-sm text-muted-foreground">Service Level</p>
                         <p className="text-2xl font-bold text-foreground">98.2%</p>
                     </div>
                 </BoxCard>
                 <BoxCard className="flex items-center gap-4">
                     <div className="p-3 bg-muted text-primary rounded-none flex items-center justify-center">
                         <i className="fa-solid fa-box-open text-base" aria-hidden="true" />
                     </div>
                     <div>
                         <p className="text-sm text-muted-foreground">Active Volume</p>
                         <p className="text-2xl font-bold text-foreground">1,284</p>
                     </div>
                 </BoxCard>
                 <BoxCard className="flex items-center gap-4">
                     <div className="p-3 bg-muted text-primary rounded-none flex items-center justify-center">
                         <i className="fa-solid fa-clock-rotate-left text-base" aria-hidden="true" />
                     </div>
                     <div>
                         <p className="text-sm text-muted-foreground">Avg Transit</p>
                         <p className="text-2xl font-bold text-foreground">48h</p>
                     </div>
                 </BoxCard>
             </div>
          </div>
        </section>

        {/* How It Works Section */}
        <section className="py-24 relative overflow-hidden">
             {/* Background Band */}
             <div className="absolute top-1/3 left-0 right-0 h-96 bg-muted/20 -skew-y-3 z-0 pointer-events-none" />
             
             <div className="max-w-7xl mx-auto px-6 relative z-10">
                <div className="text-center mb-16 space-y-4">
                    <span className="text-xs font-bold text-primary uppercase tracking-widest">How It Works —</span>
                    <h2 className="text-3xl md:text-4xl font-bold">How to Ship with Tapan Associate</h2>
                    <p className="text-muted-foreground text-lg">Simple process, reliable corridor.</p>
                </div>

                {/* Stepper Card */}
                <BoxCard className="mb-16 !p-8 lg:!p-12">
                    <div className="flex flex-col md:flex-row justify-between relative">
                        {/* Connecting Line (Desktop) */}
                        <div className="hidden md:block absolute top-8 left-16 right-16 h-0.5 bg-border border-t-2 border-dotted" />

                        {/* Steps */}
                        {[
                            { icon: Calendar, title: "Create Booking", desc: "Schedule pickup or drop at hub" },
                            { icon: Package, title: "Handover", desc: "Cargo checked in at hub" },
                            { icon: Truck, title: "In Transit", desc: "Air/Road line-haul" },
                            { icon: CheckCircle, title: "Delivered", desc: "Ready for pickup / Final mile" }
                        ].map((step, idx) => (
                            <div key={idx} className="relative flex flex-col items-center text-center space-y-4 z-10 bg-card md:px-4">
                                <div className="w-16 h-16 rounded-none bg-muted border border-border flex items-center justify-center text-primary shadow-sm">
                                    <step.icon className="h-6 w-6" />
                                </div>
                                <div>
                                    <h3 className="font-semibold text-lg">{step.title}</h3>
                                    <p className="text-sm text-muted-foreground max-w-[150px] mx-auto">{step.desc}</p>
                                </div>
                            </div>
                        ))}
                    </div>
                </BoxCard>

                {/* Features Grid */}
                <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
                    {[
                        { icon: Shield, title: "High Reliability", desc: "Consistently delivering 98%+ service levels." },
                        { icon: MapPin, title: "Dedicated Corridor", desc: "Specialized focus on Imphal ⇄ New Delhi." },
                        { icon: ArrowUpRight, title: "Real-time Tracking", desc: "Live status updates for every shipment." },
                        { icon: HelpCircle, title: "Ops Assistance", desc: "AI assistant and ticket system support." }
                    ].map((feature, idx) => (
                        <BoxCard key={idx} className="!p-6 hover:-translate-y-1 transition-transform duration-300">
                             <div className="w-10 h-10 rounded-none bg-blue-100 dark:bg-primary/20 flex items-center justify-center text-blue-600 dark:text-primary mb-4">
                                 <feature.icon className="h-5 w-5" />
                             </div>
                             <h3 className="font-semibold mb-2">{feature.title}</h3>
                             <p className="text-sm text-muted-foreground">{feature.desc}</p>
                        </BoxCard>
                    ))}
                </div>
             </div>
        </section>

        {/* Services Section */}
        <section id="services" className="py-24 bg-muted/10">
            <div className="max-w-7xl mx-auto px-6">
                <div className="text-center mb-16 space-y-4">
                    <span className="text-xs font-bold text-primary uppercase tracking-widest">Services —</span>
                    <h2 className="text-3xl md:text-4xl font-bold">Our Services</h2>
                    <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
                        Comprehensive cargo solutions tailored to your business needs.
                    </p>
                </div>

                {/* Top Service Cards */}
                <div className="grid md:grid-cols-3 gap-8 mb-12">
                    {[
                        { icon: Plane, title: "Air Cargo", desc: "Rapid air freight for time-sensitive shipments." },
                        { icon: Truck, title: "Road Transport", desc: "Cost-effective overland cargo for bulk supply." },
                        { icon: Box, title: "End-to-End", desc: "Single-point coordination from pickup to delivery." }
                    ].map((service, idx) => (
                         <BoxCard key={idx} className="flex flex-col items-start gap-4 hover:shadow-xl transition-shadow duration-300">
                             <div className="p-3 bg-muted rounded-none">
                                 <service.icon className="h-8 w-8 text-foreground" />
                             </div>
                             <div>
                                 <h3 className="text-xl font-bold mb-2">{service.title}</h3>
                                 <p className="text-muted-foreground leading-relaxed">{service.desc}</p>
                             </div>
                         </BoxCard>
                    ))}
                </div>

                {/* Route Plans */}
                <div className="grid md:grid-cols-2 gap-8">
                     <BoxCard className="!p-8 hover:border-primary transition-colors cursor-pointer group">
                         <div className="flex justify-between items-start mb-6">
                             <div>
                                 <div className="flex items-center gap-2 mb-2">
                                     <MapPin className="h-5 w-5 text-primary" />
                                     <span className="text-sm font-semibold text-primary uppercase tracking-wide">Route 01</span>
                                 </div>
                                 <h3 className="text-2xl font-bold">Imphal → New Delhi</h3>
                             </div>
                             <div className="w-10 h-10 rounded-none bg-muted flex items-center justify-center group-hover:bg-primary group-hover:text-primary-foreground transition-colors">
                                 <ArrowRight className="h-5 w-5" />
                             </div>
                         </div>
                         <ul className="space-y-3 mb-6">
                            <li className="flex items-center gap-3 text-sm text-muted-foreground">
                                <i className="fa-solid fa-circle-check text-primary text-xs" aria-hidden="true" />
                                Daily consolidation
                            </li>
                            <li className="flex items-center gap-3 text-sm text-muted-foreground">
                                <i className="fa-solid fa-circle-check text-primary text-xs" aria-hidden="true" />
                                Air & Road options
                            </li>
                            <li className="flex items-center gap-3 text-sm text-muted-foreground">
                                <i className="fa-solid fa-circle-check text-primary text-xs" aria-hidden="true" />
                                Next-day air transit
                            </li>
                        </ul>
                         <p className="text-xs text-muted-foreground">Ideal for: Local produce, handicrafts, and urgent docs.</p>
                     </BoxCard>

                     <BoxCard className="!p-8 hover:border-primary transition-colors cursor-pointer group">
                         <div className="flex justify-between items-start mb-6">
                             <div>
                                 <div className="flex items-center gap-2 mb-2">
                                     <MapPin className="h-5 w-5 text-primary" />
                                     <span className="text-sm font-semibold text-primary uppercase tracking-wide">Route 02</span>
                                 </div>
                                 <h3 className="text-2xl font-bold">New Delhi → Imphal</h3>
                             </div>
                             <div className="w-10 h-10 rounded-none bg-muted flex items-center justify-center group-hover:bg-primary group-hover:text-primary-foreground transition-colors">
                                 <ArrowRight className="h-5 w-5" />
                             </div>
                         </div>
                         <ul className="space-y-3 mb-6">
                            <li className="flex items-center gap-3 text-sm text-muted-foreground">
                                <i className="fa-solid fa-circle-check text-primary text-xs" aria-hidden="true" />
                                Regular departures
                            </li>
                            <li className="flex items-center gap-3 text-sm text-muted-foreground">
                                <i className="fa-solid fa-circle-check text-primary text-xs" aria-hidden="true" />
                                Secure handling
                            </li>
                            <li className="flex items-center gap-3 text-sm text-muted-foreground">
                                <i className="fa-solid fa-circle-check text-primary text-xs" aria-hidden="true" />
                                Bulk capacity available
                            </li>
                        </ul>
                         <p className="text-xs text-muted-foreground">Ideal for: E-commerce, electronics, and general cargo.</p>
                     </BoxCard>
                </div>
            </div>
        </section>

        {/* Tracking Section */}
        <section id="track" className="py-24 relative">
             <div className="max-w-7xl mx-auto px-6">
                 <div className="grid lg:grid-cols-2 gap-16 items-center">
                     <div className="space-y-8">
                         <div className="space-y-4">
                             <span className="text-xs font-bold text-primary uppercase tracking-widest">Tracking —</span>
                             <h2 className="text-3xl md:text-4xl font-bold">Track Your Shipment</h2>
                             <p className="text-muted-foreground text-lg">
                                 Enter your AWB or tracking number to get real-time status updates.
                             </p>
                         </div>

                         {/* Tracking Input */}
                         <div className="p-2 bg-card rounded-none border border-border flex pl-6 pr-2 py-2">
                             <input 
                                type="text" 
                                placeholder="Enter AWB Number..." 
                                className="flex-1 bg-transparent border-none outline-none text-base placeholder:text-muted-foreground/60"
                             />
                             <Button size="lg" className="rounded-none">
                                 Track
                             </Button>
                         </div>

                         {/* Recent Events Card */}
                         <BoxCard className="!p-0 overflow-hidden">
                             <div className="p-4 bg-muted/40 border-b border-border">
                                 <p className="font-semibold text-sm">Recent Tracking Events</p>
                             </div>
                             <div className="divide-y divide-border/50">
                                 {[
                                     { status: "Departed", loc: "Imphal Hub", desc: "Line-haul in transit", color: "bg-primary" },
                                     { status: "Arrived", loc: "New Delhi Hub", desc: "Processing for delivery", color: "bg-accent" },
                                     { status: "Out for Delivery", loc: "New Delhi", desc: "Expected today", color: "bg-destructive" },
                                 ].map((event, idx) => (
                                     <div key={idx} className="p-4 flex items-start gap-4 hover:bg-muted/20 transition-colors cursor-default">
                                         <div className={`mt-1.5 w-2.5 h-2.5 rounded-full ${event.color}`} />
                                         <div>
                                             <p className="text-sm font-medium">{event.status} - {event.loc}</p>
                                             <p className="text-xs text-muted-foreground">{event.desc}</p>
                                         </div>
                                     </div>
                                 ))}
                             </div>
                         </BoxCard>
                     </div>

                     {/* Right Benefits */}
                     <div className="space-y-8">
                         <h3 className="text-xl font-bold mb-6">Why Track With Us?</h3>
                         {[
                             { icon: Clock, title: "Real-time Updates", desc: "Live status from pickup to delivery." },
                             { icon: MapPin, title: "Location Visibility", desc: "Know exactly where your cargo is." },
                             { icon: Shield, title: "Secure Handling", desc: "Every shipment handled with care." }
                         ].map((benefit, idx) => (
                             <div key={idx} className="flex items-start gap-4 p-4 rounded-none hover:bg-muted/20 transition-colors">
                                 <div className="p-3 rounded-none bg-muted text-primary">
                                     <benefit.icon className="h-6 w-6" />
                                 </div>
                                 <div>
                                     <h4 className="font-semibold text-lg">{benefit.title}</h4>
                                     <p className="text-muted-foreground">{benefit.desc}</p>
                                 </div>
                             </div>
                         ))}
                     </div>
                 </div>
             </div>
        </section>

        {/* Testimonials Section */}
        <section className="py-24 bg-muted/10 overflow-hidden">
             <div className="max-w-7xl mx-auto px-6">
                 <div className="mb-12">
                     <span className="text-xs font-bold text-primary uppercase tracking-widest">Testimonials —</span>
                     <h2 className="text-3xl md:text-4xl font-bold mt-4">That’s what our customers say about Tapan Associate</h2>
                 </div>

                 <div className="flex gap-6 overflow-x-auto pb-8 snap-x">
                     {[1, 2, 3].map((i) => (
                         <BoxCard key={i} className="min-w-[300px] md:min-w-[400px] snap-center flex flex-col justify-between">
                             <div className="space-y-4">
                                 <Quote className="h-8 w-8 text-blue-200 dark:text-primary/40 fill-current" />
                                 <p className="text-lg leading-relaxed italic text-muted-foreground">
                                     "The affordable pricing and dedicated corridor really sets them apart. Despite the premium security, their rates are incredibly reasonable."
                                 </p>
                             </div>
                             <div className="flex items-center gap-4 mt-6 pt-6 border-t border-border">
                                 <div className="h-10 w-10 rounded-none bg-muted overflow-hidden">
                                     <img src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${i + 20}`} alt="avatar" />
                                 </div>
                                 <div>
                                     <p className="font-semibold text-sm">Happy Customer {i}</p>
                                     <p className="text-xs text-muted-foreground">Business Owner</p>
                                 </div>
                             </div>
                         </BoxCard>
                     ))}
                 </div>
             </div>
        </section>

        {/* Locations Section */}
        <section className="py-24">
             <div className="max-w-7xl mx-auto px-6">
                 <div className="mb-12 text-center">
                     <span className="text-xs font-bold text-primary uppercase tracking-widest">Locations —</span>
                     <h2 className="text-3xl md:text-4xl font-bold mt-4">Find a Tapan Associate Hub</h2>
                     <p className="text-muted-foreground mt-2">Connecting Northeast India to the Capital.</p>
                 </div>

                 <div className="grid md:grid-cols-2 gap-12">
                     {/* Map Placeholder */}
                     <div className="h-[400px] bg-card rounded-none relative overflow-hidden flex items-center justify-center">
                         <div className="absolute inset-0 opacity-20 bg-[radial-gradient(var(--border)_1px,transparent_1px)] [background-size:16px_16px]" />
                         <MapPin className="h-16 w-16 text-muted-foreground" />
                         <span className="absolute bottom-4 text-xs text-muted-foreground">Interactive Map Placeholder</span>
                     </div>

                     {/* Hub List */}
                     <div className="space-y-6">
                         <BoxCard className="flex gap-4 items-start hover:border-primary transition-colors cursor-pointer">
                             <div className="w-16 h-16 bg-muted flex-shrink-0" />
                             <div>
                                 <h3 className="font-bold text-lg">Imphal Hub</h3>
                                 <p className="text-sm text-muted-foreground mb-2">Singjamei Top Leikai, Imphal, Manipur 795008</p>
                                 <span className="text-xs font-bold text-primary">View Directions ⟶</span>
                             </div>
                         </BoxCard>
                         <BoxCard className="flex gap-4 items-start hover:border-primary transition-colors cursor-pointer">
                             <div className="w-16 h-16 bg-muted rounded-none flex-shrink-0" />
                             <div>
                                 <h3 className="font-bold text-lg">New Delhi Hub</h3>
                                 <p className="text-sm text-muted-foreground mb-2">Wazir Nagar, K.M. Pur, New Delhi, Delhi 110003</p>
                                 <span className="text-xs font-bold text-primary">View Directions ⟶</span>
                             </div>
                         </BoxCard>
                     </div>
                 </div>
             </div>
        </section>

        {/* CTA Band */}
        <section className="py-20 bg-muted/20 relative overflow-hidden text-foreground">
             <div className="absolute inset-0 bg-[linear-gradient(45deg,transparent_25%,rgba(255,255,255,0.1)_50%,transparent_75%,transparent_100%)] bg-[length:250%_250%] animate-shine opacity-30" />
             <div className="max-w-4xl mx-auto px-6 text-center relative z-10">
                 <h2 className="text-3xl md:text-5xl font-bold mb-4">Where Reliability Meets Speed</h2>
                 <p className="text-muted-foreground text-lg mb-8">Connecting the Northeast to the rest of India with unmatched service.</p>
                 
                 <div className="flex flex-col sm:flex-row gap-3 justify-center mb-10">
                     <Button
                       size="lg"
                       variant="outline"
                       className="rounded-none border-border bg-transparent text-foreground"
                     >
                         Talk With Ops
                     </Button>
                     <Button
                       size="lg"
                       className="rounded-none bg-primary text-primary-foreground hover:bg-primary/90"
                     >
                         Book a Shipment
                     </Button>
                 </div>

                 {/* Mega Card */}
                 <div className="bg-card text-card-foreground rounded-none p-8 shadow-2xl relative">
                     <div className="flex flex-col items-center">
                         <div className="w-32 h-32 bg-muted rounded-none flex items-center justify-center mb-6">
                             <Truck className="h-16 w-16 text-primary" />
                         </div>
                         <div className="grid grid-cols-2 md:grid-cols-4 gap-6 w-full">
                             {[
                              "High Service Level", "Dedicated Corridor", "Line-haul expertise", "Ops Support"
                             ].map((feat, idx) => (
                                 <div key={idx} className="flex flex-col items-center gap-2">
                                     <div className="w-2 h-2 rounded-none bg-primary" />
                                     <span className="text-sm font-semibold text-center">{feat}</span>
                                 </div>
                             ))}
                         </div>
                     </div>
                 </div>
             </div>
        </section>

        {/* Contact Section */}
        <section id="contact" className="py-24 bg-muted/10">
             <div className="max-w-6xl mx-auto px-6">
                 <div className="text-center mb-12">
                     <h2 className="text-3xl font-bold">Get In Touch</h2>
                     <p className="text-muted-foreground mt-2">Ready to ship? Our ops team is available.</p>
                 </div>

                 <div className="bg-card rounded-none shadow-lg border border-border overflow-hidden">
                     <div className="grid md:grid-cols-3 divide-y md:divide-y-0 md:divide-x divide-border">
                         <div className="p-8 space-y-4">
                             <h3 className="font-bold flex items-center gap-2 uppercase tracking-wide text-xs text-muted-foreground">
                                 <MapPin className="h-4 w-4" /> Imphal Hub
                             </h3>
                             <p className="text-sm text-muted-foreground">Singjamei Top Leikai, Imphal, Manipur 795008</p>
                             <div className="flex items-center gap-2 text-sm text-primary font-medium">
                                 <Mail className="h-4 w-4" /> imphal@tapango.logistics
                             </div>
                         </div>
                         <div className="p-8 space-y-4">
                             <h3 className="font-bold flex items-center gap-2 uppercase tracking-wide text-xs text-muted-foreground">
                                 <MapPin className="h-4 w-4" /> New Delhi Hub
                             </h3>
                             <p className="text-sm text-muted-foreground">Wazir Nagar, K.M. Pur, New Delhi, Delhi 110003</p>
                             <div className="flex items-center gap-2 text-sm text-primary font-medium">
                                 <Mail className="h-4 w-4" /> delhi@tapango.logistics
                             </div>
                         </div>
                         <div className="p-8 space-y-4">
                             <h3 className="font-bold flex items-center gap-2 uppercase tracking-wide text-xs text-muted-foreground">
                                 <Clock className="h-4 w-4" /> Working Hours
                             </h3>
                             <p className="text-sm">10:00 am - 9:00 pm IST</p>
                             <p className="text-xs text-muted-foreground">Ideal window for bookings.</p>
                         </div>
                     </div>
                     
                     <div className="p-8 bg-muted/30 border-t border-border flex flex-col md:flex-row items-center justify-between gap-6">
                         <div className="flex gap-4">
                             <Drawer>
                                 <DrawerTrigger asChild>
                                     <Button variant="outline" className="gap-2 rounded-none">
                                         <MessageCircle className="h-4 w-4" /> AI Ops Assistant
                                     </Button>
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
                                     <Button variant="outline" className="gap-2 rounded-none">
                                         <Ticket className="h-4 w-4" /> Raise Ticket
                                     </Button>
                                 </DrawerTrigger>
                                 <DrawerContent className="data-[vaul-drawer-direction=bottom]:rounded-none data-[vaul-drawer-direction=bottom]:border-t border-border bg-background">
                                    <div className="mx-auto w-full max-w-3xl">
                                      <DrawerHeader className="px-4 pt-4 pb-2">
                                        <DrawerTitle className="text-sm font-semibold tracking-tight">
                                          Raise a ticket
                                        </DrawerTitle>
                                        <DrawerDescription className="text-xs">
                                            Submit a support request directly to our team.
                                        </DrawerDescription>
                                      </DrawerHeader>
                                      <div className="space-y-4 px-4 pb-4">
                                          <LandingTicketForm />
                                      </div>
                                    </div>
                                 </DrawerContent>
                             </Drawer>
                         </div>
                         <div className="flex gap-4">
                             <Button size="icon" variant="ghost" className="rounded-none">
                                 <i className="fa-brands fa-facebook-f text-sm" aria-hidden="true" />
                             </Button>
                             <Button size="icon" variant="ghost" className="rounded-none">
                                 <i className="fa-brands fa-instagram text-sm" aria-hidden="true" />
                             </Button>
                         </div>
                     </div>
                 </div>
             </div>
        </section>

        {/* Footer */}
        <footer className="bg-background text-muted-foreground py-16 border-t border-border">
             <div className="max-w-7xl mx-auto px-6">
                 <div className="grid md:grid-cols-4 gap-12 mb-12">
                     <div className="col-span-1 md:col-span-1 space-y-4">
                         <BrandLogo size="md" />
                         <p className="text-sm text-muted-foreground">
                             Northeast cargo network visible and on schedule. The standard for Imphal ⇄ New Delhi.
                         </p>
                     </div>
                     
                     <div>
                         <h4 className="font-bold text-foreground mb-4">Company</h4>
                         <ul className="space-y-2 text-sm">
                             <li><Link href="#services" className="hover:text-white transition-colors">Services</Link></li>
                             <li><Link href="#track" className="hover:text-white transition-colors">Track</Link></li>
                             <li><Link href="#contact" className="hover:text-white transition-colors">Contact</Link></li>
                             <li><Link href="/login" className="hover:text-white transition-colors">Login</Link></li>
                         </ul>
                     </div>

                     <div>
                         <h4 className="font-bold text-foreground mb-4">Operations</h4>
                         <ul className="space-y-2 text-sm">
                             <li>Imphal Hub</li>
                             <li>New Delhi Hub</li>
                             <li>Working Hours</li>
                             <li>Corridor Performance</li>
                         </ul>
                     </div>

                     <div>
                         <h4 className="font-bold text-foreground mb-4">Support</h4>
                         <ul className="space-y-2 text-sm">
                             <li>Facebook</li>
                             <li>Instagram</li>
                             <li>WhatsApp</li>
                             <li>support@tapango.logistics</li>
                         </ul>
                     </div>
                 </div>

                 <div className="pt-8 border-t border-border flex flex-col md:flex-row justify-between items-center gap-4">
                     <p className="text-xs text-muted-foreground">
                         © {new Date().getFullYear()} Tapan Associate · Powered by Arra-Core
                     </p>
                     <div className="flex flex-wrap items-center gap-4 text-xs">
                         <Link
                           href="/privacy-policy"
                           className="text-muted-foreground hover:text-foreground underline-offset-4 hover:underline"
                         >
                           Privacy Policy
                         </Link>
                         <Link
                           href="/terms-of-service"
                           className="text-muted-foreground hover:text-foreground underline-offset-4 hover:underline"
                         >
                           Terms of Service
                         </Link>
                         <div className="flex gap-4 text-muted-foreground">
                           <Mail className="h-4 w-4" aria-hidden="true" />
                           <Phone className="h-4 w-4" aria-hidden="true" />
                         </div>
                     </div>
                 </div>
             </div>
        </footer>



      </main>
    </div>
  );
}

