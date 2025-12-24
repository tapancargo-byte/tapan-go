"use client";

import Link from "next/link";
import { ArrowRight, ChevronRight, Package, Star, TrendingUp, Truck } from "lucide-react";
import { motion } from "framer-motion";

import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Safari } from "@/components/ui/safari";
import { GridPattern } from "@/components/ui/grid-pattern";
import { BorderBeam } from "@/components/ui/border-beam";
import { cn } from "@/lib/utils";

function HeroPill() {
  return (
    <motion.a
      href="#new-features"
      className="flex w-auto items-center space-x-2 rounded-full bg-primary/10 px-2 py-1 ring-1 ring-accent whitespace-pre"
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.8 }}
    >
      <Badge variant="secondary" className="rounded-full px-2 py-0.5 text-xs">
        NEW
      </Badge>
      <span className="text-xs font-medium text-primary sm:text-sm">
        Introducing Corridor Intelligence
      </span>
      <ChevronRight className="h-4 w-4 text-muted-foreground" />
    </motion.a>
  );
}

function HeroContent() {
  return (
    <div className="flex flex-col items-center text-center space-y-8 max-w-4xl mx-auto z-10 relative px-4">
      <HeroPill />
      
      <motion.h1 
        className="text-5xl md:text-7xl lg:text-8xl font-bold tracking-tight text-foreground leading-[1.1] md:leading-tight"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8, delay: 0.1 }}
      >
        Reliable Cargo. <br />
        <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary to-blue-600">
          Without Guesswork.
        </span>
      </motion.h1>

      <motion.p 
        className="text-lg md:text-xl text-muted-foreground max-w-2xl leading-relaxed"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8, delay: 0.2 }}
      >
        Northeast to All India. We combine industrial precision with modern tracking for a logistics experience that just works.
      </motion.p>

      <motion.div 
        className="flex flex-col sm:flex-row items-center gap-4 w-full justify-center"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8, delay: 0.3 }}
      >
        <Button asChild size="lg" className="h-12 px-8 rounded-full text-base shadow-lg shadow-primary/20 hover:shadow-primary/30 transition-all">
          <Link href="/track">
            Track Shipment <ArrowRight className="ml-2 h-4 w-4" />
          </Link>
        </Button>
        <Button asChild variant="outline" size="lg" className="h-12 px-8 rounded-full text-base bg-background/50 backdrop-blur-sm border-muted-foreground/20 hover:bg-muted/50">
          <Link href="#contact">
            Contact Ops
          </Link>
        </Button>
      </motion.div>

      <motion.div 
        className="pt-8 flex items-center justify-center gap-6 md:gap-12 text-sm text-muted-foreground/80"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 1, delay: 0.5 }}
      >
        <div className="flex items-center gap-2">
          <Star className="h-4 w-4 text-orange-400 fill-orange-400" />
          <span className="font-medium">4.9/5 Rating</span>
        </div>
        <div className="hidden sm:flex items-center gap-2">
          <Truck className="h-4 w-4" />
          <span className="font-medium">48h Avg Transit</span>
        </div>
        <div className="flex items-center gap-2">
          <Package className="h-4 w-4" />
          <span className="font-medium">50K+ Monthly</span>
        </div>
      </motion.div>
    </div>
  );
}

function HeroVisual() {
  return (
    <motion.div
      className="relative mt-16 mx-auto max-w-6xl w-full px-4 sm:px-6 lg:px-8 z-10"
      initial={{ opacity: 0, y: 40, scale: 0.95 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      transition={{ duration: 1, delay: 0.4 }}
    >
      <div className="rounded-xl border border-border/40 bg-background/50 backdrop-blur-xl shadow-2xl overflow-hidden relative">
        <BorderBeam size={250} duration={12} delay={9} colorFrom="var(--primary)" colorTo="var(--accent)" />
        <Safari 
          url="dashboard.tapango.com" 
          className="w-full shadow-none border-none bg-transparent"
          imageSrc="/assets/dashboard-preview.png" // Placeholder, will fallback if missing but Safari handles styling
        />
        
        {/* Floating Stats Card - Overlay */}
        <div className="absolute -bottom-12 -right-4 md:bottom-8 md:right-8 bg-background/90 backdrop-blur-md border border-border p-4 rounded-xl shadow-xl hidden md:block">
          <div className="flex items-center gap-4">
            <div className="h-10 w-10 rounded-full bg-green-100 dark:bg-green-900/30 flex items-center justify-center">
              <TrendingUp className="h-5 w-5 text-green-600 dark:text-green-400" />
            </div>
            <div>
              <p className="text-xs text-muted-foreground uppercase font-semibold">On-Time Rate</p>
              <p className="text-xl font-bold">98.2%</p>
            </div>
          </div>
        </div>
      </div>
      
      {/* Background Glow */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-3/4 h-3/4 bg-primary/20 blur-[120px] rounded-full -z-10" />
    </motion.div>
  );
}

export function LandingHero() {
  return (
    <section className="relative min-h-[100vh] flex flex-col justify-center pt-32 pb-24 overflow-hidden">
      <GridPattern
        width={50}
        height={50}
        x={-1}
        y={-1}
        className={cn(
          "[mask-image:linear-gradient(to_bottom,white,transparent,transparent)] opacity-50",
          "h-[80vh]" // Limit height so it fades out
        )}
      />
      
      <div className="absolute inset-0 bg-gradient-to-b from-transparent via-background/50 to-background pointer-events-none" />

      <HeroContent />
      <HeroVisual />
    </section>
  );
}
