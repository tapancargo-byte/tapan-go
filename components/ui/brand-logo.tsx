"use client";

import React from "react";
import Image from "next/image";
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

  const logoSrc = "/assets/tapan-go-logo.png";

  return (
    <div className={cn("relative flex-shrink-0", config.className, className)}>
      <Image
        src={logoSrc}
        alt="Tapan Go - Cargo Network"
        width={config.width}
        height={config.height}
        className="h-full w-auto object-contain"
        priority={priority}
      />
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
