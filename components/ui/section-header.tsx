"use client";

import React from "react";
import { cn } from "@/lib/utils";

interface SectionHeaderProps {
  /** Section label (smaller, uppercase) */
  label?: string;
  /** Main title */
  title: string;
  /** Optional subtitle/description */
  subtitle?: string;
  /** Size variant */
  size?: "sm" | "md" | "lg";
  /** Alignment */
  align?: "left" | "center" | "right";
  /** Additional className */
  className?: string;
  /** Icon to display before title */
  icon?: React.ReactNode;
}

const sizeStyles = {
  sm: {
    label: "text-xs tracking-widest mb-1",
    title: "text-lg font-semibold",
    subtitle: "text-sm mt-1",
  },
  md: {
    label: "text-xs tracking-widest mb-2",
    title: "text-2xl font-bold",
    subtitle: "text-base mt-2",
  },
  lg: {
    label: "text-sm tracking-widest mb-3",
    title: "text-4xl font-bold",
    subtitle: "text-lg mt-3",
  },
};

const alignStyles = {
  left: "text-left items-start",
  center: "text-center items-center",
  right: "text-right items-end",
};

/**
 * SectionHeader - Consistent section headings with proper hierarchy
 * 
 * Implements the typography scale and uses theme colors.
 */
export function SectionHeader({
  label,
  title,
  subtitle,
  size = "md",
  align = "left",
  className,
  icon,
}: SectionHeaderProps) {
  const styles = sizeStyles[size];

  return (
    <div
      className={cn(
        "flex flex-col",
        alignStyles[align],
        className
      )}
    >
      {label && (
        <span
          className={cn(
            "uppercase text-muted-foreground font-medium",
            styles.label
          )}
        >
          {label}
        </span>
      )}
      <h2
        className={cn(
          "text-foreground leading-tight flex items-center gap-3",
          styles.title
        )}
      >
        {icon && (
          <span className="text-brand flex-shrink-0">{icon}</span>
        )}
        {title}
      </h2>
      {subtitle && (
        <p
          className={cn(
            "text-muted-foreground",
            styles.subtitle
          )}
        >
          {subtitle}
        </p>
      )}
    </div>
  );
}

export default SectionHeader;
