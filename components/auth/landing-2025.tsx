"use client";

import { useRef, useState, cloneElement, useEffect } from "react";
import Link from "next/link";
import { motion, useReducedMotion, useScroll, useTransform, Variants } from "framer-motion";
import Lottie from "lottie-react";
import Image from "next/image";
import {
  ArrowRight,
  CheckCircle2,
  Menu,
  ChevronRight,
  MapPin,
  Phone,
  Mail,
  Instagram,
  Facebook,
  Twitter,
  Search,
  Plane,
  Truck,
  Sparkles,
  Box,
  Bot,
  MessageSquareText
} from "lucide-react";

import heroAnimation from "@/public/assets/hero-lottie-new.json";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { AiAssistantCard } from "@/components/ui/ai-assistant-card";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { ThemeToggle } from "@/components/theme-toggle";

// Standard Animations
const fadeInUp: Variants = {
  hidden: { opacity: 0, y: 20 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { type: "spring", stiffness: 100, damping: 20 }
  },
};

const staggerContainer: Variants = {
  hidden: {},
  visible: {
    transition: { staggerChildren: 0.1 },
  },
};

export function Landing2025() {
  const shouldReduceMotion = useReducedMotion();
  const [isChatOpen, setIsChatOpen] = useState(false);
  const { scrollY } = useScroll();

  // Navbar Logic: Animate OPACITY of a background layer, not the color string itself (to support vars)
  const headerOpacity = useTransform(scrollY, [0, 50], [0, 1]);
  const headerY = useTransform(scrollY, [0, 50], [0, 0]);

  const servicesRef = useRef<HTMLElement | null>(null);
  const trackRef = useRef<HTMLElement | null>(null);
  const aboutRef = useRef<HTMLElement | null>(null);
  const contactRef = useRef<HTMLElement | null>(null);

  const handleNavClick = (section: string) => {
    const map: Record<string, React.RefObject<HTMLElement>> = {
      services: servicesRef,
      track: trackRef,
      about: aboutRef,
      contact: contactRef,
    };
    const target = map[section]?.current;
    if (!target) return;
    const offset = target.offsetTop - 100;
    window.scrollTo({ top: offset, behavior: shouldReduceMotion ? "auto" : "smooth" });
  };

  const handleLogoClick = () => {
    window.scrollTo({ top: 0, behavior: shouldReduceMotion ? "auto" : "smooth" });
  };

  const MotionSection = shouldReduceMotion ? "section" : motion.section;
  const MotionDiv = shouldReduceMotion ? "div" : motion.div;

  return (
    <div className="min-h-screen bg-background text-foreground font-sans overflow-x-hidden selection:bg-primary/20 selection:text-primary">

      {/* Pattern Background */}
      <div className="fixed inset-0 z-[-1] opacity-[0.03] pointer-events-none"
        style={{ backgroundImage: 'radial-gradient(currentColor 1px, transparent 1px)', backgroundSize: '32px 32px' }} />

      {/* Navbar with Opacity Layer Fix */}
      <motion.header
        className="fixed top-0 left-0 right-0 z-50 w-full h-24 flex items-center"
        style={{ y: headerY }}
      >
        {/* Animated Background Layer */}
        <motion.div
          className="absolute inset-0 bg-background/95 backdrop-blur-md border-b border-border shadow-sm"
          style={{ opacity: headerOpacity }}
        />

        <div className="mx-auto flex w-full max-w-7xl items-center justify-between px-6 lg:px-12 relative z-10">

          {/* Logo */}
          <div
            className="flex items-center gap-3 cursor-pointer group"
            onClick={handleLogoClick}
          >
            <div className="h-11 w-11 bg-primary/10 rounded-lg flex items-center justify-center border border-primary/20 group-hover:bg-primary/20 transition-colors">
              <Box className="h-6 w-6 text-primary" />
            </div>
            <div className="flex flex-col justify-center">
              <span className="font-bold text-2xl leading-none tracking-tight">
                TAC<span className="text-primary">.</span>
              </span>
              <span className="text-xs text-muted-foreground font-medium uppercase tracking-widest mt-1">
                Tapan Associate Cargo
              </span>
            </div>
          </div>

          {/* Desktop Nav */}
          <nav className="hidden lg:flex items-center gap-10 text-sm font-medium">
            {["Services", "Track", "About", "Contact"].map((item) => (
              <button
                key={item}
                onClick={() => handleNavClick(item.toLowerCase())}
                className="hover:text-primary transition-colors py-2 relative group"
              >
                {item}
                <span className="absolute bottom-0 left-0 w-full h-[2px] bg-primary scale-x-0 group-hover:scale-x-100 transition-transform origin-left" />
              </button>
            ))}
          </nav>

          {/* Actions */}
          <div className="flex items-center gap-4">
            <ThemeToggle />
            <div className="hidden sm:flex gap-3">
              <Link href="/login">
                <Button variant="ghost" className="font-medium hover:bg-primary/5">Log in</Button>
              </Link>
              <Link href="/login?mode=signup">
                <Button className="font-medium shadow-md shadow-primary/20 hover:shadow-primary/40 transition-shadow">
                  Get Started
                </Button>
              </Link>
            </div>

            {/* Mobile Menu */}
            <Sheet>
              <SheetTrigger asChild>
                <Button variant="ghost" size="icon" className="lg:hidden">
                  <Menu className="h-6 w-6" />
                </Button>
              </SheetTrigger>
              <SheetContent side="right" className="w-[300px]">
                <nav className="flex flex-col gap-6 mt-12">
                  {["Services", "Track", "About", "Contact"].map((item) => (
                    <button
                      key={item}
                      onClick={() => handleNavClick(item.toLowerCase())}
                      className="text-2xl font-medium text-left hover:text-primary transition-colors border-b border-border pb-4"
                    >
                      {item}
                    </button>
                  ))}
                  <div className="mt-8 space-y-4">
                    <Link href="/login" className="block"><Button variant="outline" className="w-full">Log in</Button></Link>
                    <Link href="/login?mode=signup" className="block"><Button className="w-full">Get Started</Button></Link>
                  </div>
                </nav>
              </SheetContent>
            </Sheet>
          </div>
        </div>
      </motion.header>

      <main className="flex flex-col pt-24">

        {/* Hero Section */}
        <MotionSection
          id="hero"
          className="container max-w-7xl mx-auto px-6 py-12 lg:py-24 grid lg:grid-cols-2 gap-12 items-center min-h-[calc(100vh-6rem)]"
          initial="hidden"
          animate="visible"
          variants={staggerContainer}
        >
          <MotionDiv variants={fadeInUp} className="space-y-8 order-2 lg:order-1">
            <Badge variant="outline" className="px-4 py-2 text-sm font-medium border-primary/20 bg-primary/5 text-primary rounded-full w-fit flex items-center gap-2">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-primary opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-primary"></span>
              </span>
              New Delhi <span className="mx-2 text-muted-foreground/50">|</span> Imphal
            </Badge>

            <h1 className="text-5xl sm:text-6xl lg:text-8xl font-bold tracking-tighter text-balance leading-[0.95] drop-shadow-xl">
              Bridging <br />
              <span className="text-primary neon-text-glow">Distances.</span>
            </h1>

            <p className="text-lg md:text-xl text-muted-foreground max-w-lg leading-relaxed border-l-4 border-primary/20 pl-6">
              Your dedicated logistics partner connecting the Capital <strong>(New Delhi)</strong> to the Heart of Manipur <strong>(Imphal)</strong>.
              Fast, Secure, and Reliable since 2012.
            </p>

            <div className="flex flex-col sm:flex-row gap-4 pt-4">
              <Button size="xl" className="shadow-2xl shadow-primary/20 hover:scale-105 transition-transform" onClick={() => handleNavClick('track')}>
                Track Shipment
              </Button>
              <Button size="xl" variant="outline" className="border-2 hover:bg-muted/50" onClick={() => handleNavClick('contact')}>
                Get a Quote
              </Button>
            </div>

            <div className="pt-8 flex items-center gap-8 text-sm font-medium text-muted-foreground">
              <div className="flex flex-col">
                <span className="text-2xl font-bold text-foreground">24h</span>
                <span>Dispatch</span>
              </div>
              <div className="w-px h-8 bg-border"></div>
              <div className="flex flex-col">
                <span className="text-2xl font-bold text-foreground">100%</span>
                <span>Safe</span>
              </div>
              <div className="w-px h-8 bg-border"></div>
              <div className="flex flex-col">
                <span className="text-2xl font-bold text-foreground">Daily</span>
                <span>Updates</span>
              </div>
            </div>
          </MotionDiv>

          <MotionDiv variants={fadeInUp} className="order-1 lg:order-2 flex justify-center lg:justify-end relative">
            <div className="absolute inset-0 bg-gradient-to-tr from-primary/20 to-transparent blur-[100px] rounded-full opacity-60 pointer-events-none" />
            <div className="relative z-10 w-full max-w-2xl transform scale-110">
              <Lottie
                animationData={heroAnimation}
                loop={true}
                className="w-full h-auto drop-shadow-2xl"
              />
            </div>
          </MotionDiv>
        </MotionSection>

        {/* Services Section */}
        <MotionSection
          id="services"
          ref={servicesRef as any}
          className="py-24 bg-muted/30"
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-100px" }}
          variants={staggerContainer}
        >
          <div className="container max-w-7xl mx-auto px-6">
            <div className="text-center max-w-2xl mx-auto mb-16 space-y-4">
              <h2 className="text-4xl font-bold tracking-tight">Services Built for Manipur</h2>
              <p className="text-lg text-muted-foreground">We understand the unique logistics challenges of the Northeast.</p>
            </div>

            <div className="grid md:grid-cols-2 gap-8 lg:gap-12">
              {/* Air Cargo */}
              <Card className="glass-card border-white/10 relative hover:shadow-2xl hover:-translate-y-2 transition-all duration-500 group overflow-hidden bg-background/40 backdrop-blur-sm">
                <div className="absolute top-0 right-0 p-8 opacity-5 group-hover:opacity-20 transition-opacity duration-500">
                  <Plane className="w-48 h-48 text-primary blur-2xl" />
                </div>
                <CardHeader className="relative z-10">
                  <div className="h-16 w-16 rounded-2xl bg-primary/10 flex items-center justify-center mb-6 ring-1 ring-primary/20 shadow-[0_0_15px_rgba(139,92,246,0.2)]">
                    <Plane className="h-8 w-8 text-primary" />
                  </div>
                  <CardTitle className="text-4xl font-display tracking-tight">Air Cargo</CardTitle>
                  <CardDescription className="text-lg font-medium text-primary/80">Next-Day Connectivity</CardDescription>
                </CardHeader>
                <CardContent className="space-y-8 relative z-10">
                  <p className="text-muted-foreground text-lg leading-relaxed font-light">
                    The lifeline for urgent shipments. Medicines, documents, perishables, and high-value electronics moved securely from Delhi to Imphal.
                  </p>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="flex gap-2 items-center text-sm font-medium"><div className="p-1 rounded-full bg-primary/10"><CheckCircle2 className="h-4 w-4 text-primary" /></div> 24-48 Hrs Delivery</div>
                    <div className="flex gap-2 items-center text-sm font-medium"><div className="p-1 rounded-full bg-primary/10"><CheckCircle2 className="h-4 w-4 text-primary" /></div> Sensitive Handling</div>
                  </div>
                </CardContent>
              </Card>

              {/* Surface Cargo */}
              <Card className="glass-card border-white/10 relative hover:shadow-2xl hover:-translate-y-2 transition-all duration-500 group overflow-hidden bg-background/40 backdrop-blur-sm">
                <div className="absolute top-0 right-0 p-8 opacity-5 group-hover:opacity-20 transition-opacity duration-500">
                  <Truck className="w-48 h-48 text-secondary-foreground blur-2xl" />
                </div>
                <CardHeader className="relative z-10">
                  <div className="h-16 w-16 rounded-2xl bg-secondary/80 flex items-center justify-center mb-6 ring-1 ring-white/10 shadow-lg">
                    <Truck className="h-8 w-8 text-secondary-foreground" />
                  </div>
                  <CardTitle className="text-4xl font-display tracking-tight">Surface Cargo</CardTitle>
                  <CardDescription className="text-lg font-medium">Heavy & Bulk Transport</CardDescription>
                </CardHeader>
                <CardContent className="space-y-8 relative z-10">
                  <p className="text-muted-foreground text-lg leading-relaxed font-light">
                    Cost-effective road transport solutions for bulk goods, household shifting, and commercial inventory.
                  </p>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="flex gap-2 items-center text-sm font-medium"><div className="p-1 rounded-full bg-green-500/10"><CheckCircle2 className="h-4 w-4 text-green-500" /></div> Door-to-Door</div>
                    <div className="flex gap-2 items-center text-sm font-medium"><div className="p-1 rounded-full bg-green-500/10"><CheckCircle2 className="h-4 w-4 text-green-500" /></div> Real-time Tracking</div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </MotionSection>

        {/* Tracking Section */}
        <MotionSection
          id="track"
          ref={trackRef as any}
          className="py-24"
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
          variants={staggerContainer}
        >
          <div className="container max-w-5xl mx-auto px-6">
            <div className="relative rounded-[2.5rem] overflow-hidden border border-border bg-card shadow-2xl p-8 lg:p-16 text-center ring-1 ring-border/50">
              <div className="absolute inset-0 bg-gradient-to-b from-primary/5 to-transparent pointer-events-none" />

              <div className="relative z-10 space-y-8">
                <div className="space-y-4">
                  <Badge className="bg-primary/10 text-primary border-primary/20 hover:bg-primary/20 mb-2">TAC TRACKER</Badge>
                  <h2 className="text-4xl lg:text-5xl font-bold tracking-tight">Where is your parcel?</h2>
                  <p className="text-muted-foreground text-lg max-w-xl mx-auto">
                    Enter your consignment number to get status updates.
                  </p>
                </div>

                <div className="max-w-xl mx-auto flex gap-2">
                  <div className="relative flex-1 group">
                    <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground group-focus-within:text-primary transition-colors" />
                    <Input
                      placeholder="Enter LR Number (e.g. 88592)"
                      className="pl-12 h-14 text-lg bg-background border-input shadow-sm focus-visible:ring-primary/30"
                    />
                  </div>
                  <Button size="xl" className="h-14 px-8 rounded-xl font-bold">Track</Button>
                </div>
              </div>
            </div>
          </div>
        </MotionSection>

        {/* Contact Section - Updated Addresses */}
        <MotionSection
          id="contact"
          ref={contactRef as any}
          className="py-24"
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
          variants={staggerContainer}
        >
          <div className="container max-w-7xl mx-auto px-6 grid lg:grid-cols-2 gap-16">
            <div className="space-y-8">
              <h2 className="text-4xl font-bold">Contact Us</h2>
              <p className="text-xl text-muted-foreground">Visit our offices for booking or inquiries.</p>

              <div className="grid sm:grid-cols-2 gap-6">
                {/* New Delhi Office */}
                <Card className="hover:border-primary/50 transition-colors">
                  <CardHeader>
                    <MapPin className="h-8 w-8 text-primary mb-2" />
                    <CardTitle className="text-lg">New Delhi (HQ)</CardTitle>
                  </CardHeader>
                  <CardContent className="text-sm text-muted-foreground space-y-2 leading-relaxed">
                    <p>1498, GF, Gali no 3</p>
                    <p>Wazir Nagar, Kotla Mubarakpur</p>
                    <p>New Delhi, Delhi 110003</p>
                    <div className="pt-2 font-semibold text-foreground">+91 98765 43210</div>
                  </CardContent>
                </Card>

                {/* Imphal Office */}
                <Card className="hover:border-primary/50 transition-colors">
                  <CardHeader>
                    <MapPin className="h-8 w-8 text-primary mb-2" />
                    <CardTitle className="text-lg">Imphal Office</CardTitle>
                  </CardHeader>
                  <CardContent className="text-sm text-muted-foreground space-y-2 leading-relaxed">
                    <p>Singjamei Top Leikai</p>
                    <p>Imphal, Manipur 795008</p>
                    <div className="pt-4 font-semibold text-foreground">+91 98561 23456</div>
                  </CardContent>
                </Card>
              </div>

              <Card className="bg-primary/5 border-primary/10">
                <CardContent className="flex items-center gap-4 p-6">
                  <Mail className="h-6 w-6 text-primary" />
                  <div>
                    <div className="font-bold">Email Support</div>
                    <div className="text-sm text-muted-foreground">support@tac-cargo.com</div>
                  </div>
                </CardContent>
              </Card>
            </div>

            <div>
              <Card className="shadow-2xl border-t-4 border-t-primary">
                <CardHeader>
                  <CardTitle>Get a Quote</CardTitle>
                  <CardDescription>Fill out the form below and we will get back to you.</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <label className="text-sm font-medium">Name</label>
                      <Input placeholder="Your Name" />
                    </div>
                    <div className="space-y-2">
                      <label className="text-sm font-medium">Phone</label>
                      <Input placeholder="+91..." />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Pickup City</label>
                    <Input placeholder="e.g. New Delhi" />
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Message</label>
                    <textarea className="w-full min-h-[120px] rounded-md border border-input bg-background px-3 py-2 text-sm placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring" placeholder="Describe your shipment..." />
                  </div>
                  <Button size="lg" className="w-full font-bold">Request Quote</Button>
                </CardContent>
              </Card>
            </div>
          </div>
        </MotionSection>
      </main>

      {/* Footer */}
      <footer className="border-t border-border bg-muted/10 py-12">
        <div className="container max-w-7xl mx-auto px-6 flex flex-col md:flex-row justify-between items-center gap-6">
          <div className="text-center md:text-left">
            <div className="font-bold text-xl">TAC.</div>
            <div className="text-sm text-muted-foreground mt-2">© {new Date().getFullYear()} Tapan Associate Cargo. <br /> All rights reserved.</div>
          </div>

          <div className="flex gap-4">
            <Link href="#" className="p-2 hover:bg-primary/10 rounded-full transition-colors"><Instagram className="h-5 w-5 text-muted-foreground hover:text-primary" /></Link>
            <Link href="#" className="p-2 hover:bg-primary/10 rounded-full transition-colors"><Facebook className="h-5 w-5 text-muted-foreground hover:text-primary" /></Link>
            <Link href="#" className="p-2 hover:bg-primary/10 rounded-full transition-colors"><Twitter className="h-5 w-5 text-muted-foreground hover:text-primary" /></Link>
          </div>
        </div>
      </footer>

      {/* Amazing AI Assistant Button */}
      <div className="fixed bottom-6 right-6 z-50">
        <div className={`transition-all duration-300 origin-bottom-right ${isChatOpen ? 'opacity-100 scale-100' : 'opacity-0 scale-95 pointer-events-none'}`}>
          {isChatOpen && (
            <AiAssistantCard
              className="h-[500px] w-[350px] rounded-2xl border bg-background shadow-2xl mb-4"
              wrapCloseButton={(button: any) => cloneElement(button, { onClick: () => setIsChatOpen(false) })}
            />
          )}
        </div>

        <div className="relative group">
          {/* Tooltip */}
          <div className="absolute right-full mr-4 top-1/2 -translate-y-1/2 px-3 py-1.5 bg-foreground text-background text-sm font-bold rounded-lg opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap pointer-events-none">
            Chat with AI
            <div className="absolute right-[-4px] top-1/2 -translate-y-1/2 w-2 h-2 bg-foreground rotate-45" />
          </div>

          <Button
            size="icon"
            className="h-16 w-16 rounded-full shadow-2xl bg-gradient-to-tr from-primary to-blue-600 text-white hover:shadow-primary/50 hover:scale-110 transition-all duration-300 border-4 border-background/50 backdrop-blur-sm"
            onClick={() => setIsChatOpen(!isChatOpen)}
          >
            {isChatOpen ? <ChevronRight className="h-8 w-8 rotate-90" /> : <MessageSquareText className="h-8 w-8" />}
          </Button>

          {/* Notification Dot */}
          {!isChatOpen && (
            <span className="absolute top-0 right-0 h-4 w-4 bg-red-500 border-2 border-background rounded-full animate-bounce" />
          )}
        </div>
      </div>
    </div>
  );
}
