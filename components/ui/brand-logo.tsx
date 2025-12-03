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

  const style = styleConfig[size] ?? styleConfig.md;

  return (
    <div className={cn("relative flex-shrink-0", config.className, className)}>
      <div className="flex h-full items-center gap-3">
        <div
          className={cn(
            "flex items-center justify-center rounded-md border border-border/60 bg-background/90",
            style.icon,
          )}
          aria-hidden="true"
        >
          <svg
            viewBox="0 0 56 56"
            xmlns="http://www.w3.org/2000/svg"
            className="h-full w-full text-primary"
          >
            <path
              d="M28 8L48 18V38L28 48L8 38V18L28 8Z"
              stroke="currentColor"
              strokeWidth="2.5"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
            <path
              d="M28 8V28M28 28L48 18M28 28L8 18"
              stroke="currentColor"
              strokeWidth="2.5"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
            <path
              d="M8 38L18 43.5"
              stroke="currentColor"
              strokeWidth="2.5"
              strokeLinecap="round"
            />
            <path
              d="M48 38L38 43.5"
              stroke="currentColor"
              strokeWidth="2.5"
              strokeLinecap="round"
            />
          </svg>
        </div>

        <div className="flex flex-col gap-1">
          <div className="flex items-center gap-2">
            <span
              className={cn(
                "font-semibold tracking-tight text-foreground uppercase",
                style.tapanText,
              )}
            >
              TAPAN
            </span>
            <span
              className={cn(
                "text-primary",
                style.dividerText,
              )}
            >
              |
            </span>
            <span
              className={cn(
                "tracking-wide text-muted-foreground uppercase",
                style.associateText,
              )}
            >
              Associate
            </span>
          </div>
          <div className="flex gap-1">
            <div
              className={cn(
                "rounded-full bg-primary",
                style.bar1,
              )}
            />
            <div
              className={cn(
                "rounded-full bg-primary/70",
                style.bar2,
              )}
            />
            <div
              className={cn(
                "rounded-full bg-primary/40",
                style.bar3,
              )}
            />
          </div>
        </div>
      </div>
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
