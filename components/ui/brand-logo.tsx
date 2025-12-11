"use client";

import React from "react";
import { cn } from "@/lib/utils";

interface BrandLogoProps {
  /** Size preset */
  size?: "xs" | "sm" | "md" | "lg" | "xl" | "2xl";
  /** Additional className */
  className?: string;
  /** Priority loading for above-the-fold logos */
  priority?: boolean;
}

/**
 * Size configuration for the logo
 * The logo images contain both icon and text, so we just need to control dimensions
 */
const sizeConfig = {
  xs: { width: 96, height: 32, className: "h-6" },
  sm: { width: 128, height: 40, className: "h-10" },
  md: { width: 160, height: 48, className: "h-12" },
  lg: { width: 192, height: 56, className: "h-14" },
  xl: { width: 224, height: 64, className: "h-16" },
  "2xl": { width: 320, height: 96, className: "h-24" },
};

const styleConfig = {
  xs: {
    icon: "w-7 h-7",
    tapanText: "text-base",
    associateText: "text-[0.6rem]",
    dividerText: "text-xs",
    bar1: "h-0.5 w-8",
    bar2: "h-0.5 w-6",
    bar3: "h-0.5 w-4",
  },
  sm: {
    icon: "w-8 h-8",
    tapanText: "text-lg",
    associateText: "text-xs",
    dividerText: "text-sm",
    bar1: "h-0.5 w-10",
    bar2: "h-0.5 w-8",
    bar3: "h-0.5 w-5",
  },
  md: {
    icon: "w-9 h-9",
    tapanText: "text-xl",
    associateText: "text-sm",
    dividerText: "text-base",
    bar1: "h-1 w-12",
    bar2: "h-1 w-9",
    bar3: "h-1 w-6",
  },
  lg: {
    icon: "w-10 h-10",
    tapanText: "text-2xl",
    associateText: "text-base",
    dividerText: "text-lg",
    bar1: "h-1 w-16",
    bar2: "h-1 w-12",
    bar3: "h-1 w-8",
  },
  xl: {
    icon: "w-12 h-12",
    tapanText: "text-3xl",
    associateText: "text-lg",
    dividerText: "text-xl",
    bar1: "h-1.5 w-20",
    bar2: "h-1.5 w-14",
    bar3: "h-1.5 w-10",
  },
  "2xl": {
    icon: "w-14 h-14",
    tapanText: "text-4xl",
    associateText: "text-xl",
    dividerText: "text-2xl",
    bar1: "h-2 w-24",
    bar2: "h-2 w-18",
    bar3: "h-2 w-12",
  },
} as const;

/**
 * BrandLogo - Theme-aware logo component for Tapan Go
 * 
 * Automatically switches between light and dark theme logos.
 * The logo images contain both the icon and text.
 */
export function BrandLogo({
  size = "md",
  className,
  priority = false,
}: BrandLogoProps) {
  const [mounted, setMounted] = React.useState(false);
  const config = sizeConfig[size];

  // Prevent hydration mismatch
  React.useEffect(() => {
    setMounted(true);
  }, []);

  // Show placeholder during SSR to prevent flash
  if (!mounted) {
    return (
      <div 
        className={cn("animate-pulse bg-muted rounded", config.className, className)}
        style={{ width: config.width, aspectRatio: `${config.width}/${config.height}` }}
        aria-label="Tapan Go"
      />
    );
  }

  return (
    <div className={cn("relative flex-shrink-0", config.className, className)} aria-label="Tapan Associate">
      {size === "xs" ? (
        <svg
          viewBox="0 0 128 128"
          xmlns="http://www.w3.org/2000/svg"
          className="h-full w-auto"
          role="img"
          aria-hidden="true"
        >
          <defs>
            <g id="box-icon">
              <path d="M0,21 L32,0 L64,21 L32,42 Z" fill="var(--foreground)" />
              <path d="M0,21 L32,42 L32,80 L0,59 Z" fill="var(--foreground)" />
              <path d="M32,42 L64,21 L64,59 L32,80 Z" fill="var(--foreground)" />
              <path d="M0,21 L32,42 L64,21" fill="none" stroke="var(--background)" strokeWidth="5" strokeLinejoin="round" strokeLinecap="round"/>
              <line x1="32" y1="42" x2="32" y2="80" stroke="var(--background)" strokeWidth="5" strokeLinecap="round" />
              <path d="M8,40 L25,50 L25,58 L8,48 Z" fill="var(--background)" opacity="1" />
            </g>
          </defs>
          <g transform="translate(16, 18) scale(1.2)">
            <use href="#box-icon" x="0" y="0" />
            <use href="#box-icon" x="45" y="35" />
          </g>
        </svg>
      ) : (
        <svg
          viewBox="0 0 600 400"
          xmlns="http://www.w3.org/2000/svg"
          className="h-full w-auto"
          role="img"
          aria-label="Tapan Associate"
        >
          <defs>
            <g id="box-icon">
              <path d="M0,21 L32,0 L64,21 L32,42 Z" fill="var(--foreground)" />
              <path d="M0,21 L32,42 L32,80 L0,59 Z" fill="var(--foreground)" />
              <path d="M32,42 L64,21 L64,59 L32,80 Z" fill="var(--foreground)" />
              <path d="M0,21 L32,42 L64,21" fill="none" stroke="var(--background)" strokeWidth="5" strokeLinejoin="round" strokeLinecap="round"/>
              <line x1="32" y1="42" x2="32" y2="80" stroke="var(--background)" strokeWidth="5" strokeLinecap="round" />
              <path d="M8,40 L25,50 L25,58 L8,48 Z" fill="var(--background)" opacity="1" />
            </g>
          </defs>
          <g transform="translate(40, 90)">
            <g>
              <text style={{ fontFamily: "Outfit, Futura, 'Century Gothic', sans-serif", fontWeight: 700, fill: "var(--foreground)" }}>
                <tspan x="0" y="100" fontSize="110" letterSpacing="-4">Tapan</tspan>
                <tspan x="2" y="190" fontSize="92" letterSpacing="-3" opacity="0.9">Associate</tspan>
              </text>
            </g>
            <g transform="translate(340, -40) scale(0.9)">
              <use href="#box-icon" x="0" y="0" />
              <use href="#box-icon" x="45" y="35" />
            </g>
          </g>
        </svg>
      )}
    </div>
  );
}

/**
 * BrandLogoLink - BrandLogo wrapped in an accessible link
 */
interface BrandLogoLinkProps extends BrandLogoProps {
  href?: string;
}

export function BrandLogoLink({
  href = "/",
  ...props
}: BrandLogoLinkProps) {
  return (
    <a
      href={href}
      className="inline-flex items-center hover:opacity-90 transition-opacity focus:outline-none focus-visible:ring-2 focus-visible:ring-brand focus-visible:ring-offset-2 focus-visible:ring-offset-background rounded-sm"
      aria-label="Tapan Go - Home"
    >
      <BrandLogo {...props} />
    </a>
  );
}

export default BrandLogo;
