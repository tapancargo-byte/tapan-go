"use client";

import React from "react";
import { cn } from "@/lib/utils";

interface StatBadgeProps {
  /** The stat value to display */
  value: string | number;
  /** Label describing the stat */
  label?: string;
  /** Visual variant */
  variant?: "default" | "success" | "warning" | "destructive" | "brand";
  /** Size */
  size?: "sm" | "md" | "lg";
  /** Optional icon */
  icon?: React.ReactNode;
  /** Show as inline or block */
  inline?: boolean;
  /** Additional className */
  className?: string;
}

const variantStyles = {
  default: "bg-secondary text-secondary-foreground",
  success: "bg-success/15 text-success border border-success/20",
  warning: "bg-warning/15 text-warning border border-warning/20",
  destructive: "bg-destructive/15 text-destructive border border-destructive/20",
  brand: "bg-brand/15 text-brand border border-brand/20",
};

const sizeStyles = {
  sm: {
    container: "px-2 py-1 text-xs gap-1",
    value: "font-semibold",
    label: "text-[10px]",
  },
  md: {
    container: "px-3 py-1.5 text-sm gap-1.5",
    value: "font-bold",
    label: "text-xs",
  },
  lg: {
    container: "px-4 py-2 text-base gap-2",
    value: "font-bold text-lg",
    label: "text-sm",
  },
};

/**
 * StatBadge - Displays statistics with consistent styling
 * 
 * Uses oklch-based theme colors for visual variants.
 */
export function StatBadge({
  value,
  label,
  variant = "default",
  size = "md",
  icon,
  inline = true,
  className,
}: StatBadgeProps) {
  const sizes = sizeStyles[size];

  return (
    <div
      className={cn(
        "rounded-md flex items-center",
        variantStyles[variant],
        sizes.container,
        inline ? "inline-flex" : "flex",
        className
      )}
    >
      {icon && (
        <span className="flex-shrink-0 opacity-80">{icon}</span>
      )}
      <span className={sizes.value}>{value}</span>
      {label && (
        <span
          className={cn(
            "opacity-70 uppercase tracking-wide",
            sizes.label
          )}
        >
          {label}
        </span>
      )}
    </div>
  );
}

/**
 * StatDisplay - Larger stat display for dashboards
 */
interface StatDisplayProps {
  value: string | number;
  label: string;
  description?: string;
  trend?: {
    value: string;
    direction: "up" | "down" | "neutral";
  };
  className?: string;
}

export function StatDisplay({
  value,
  label,
  description,
  trend,
  className,
}: StatDisplayProps) {
  const trendColors = {
    up: "text-success",
    down: "text-destructive",
    neutral: "text-muted-foreground",
  };

  return (
    <div className={cn("flex flex-col gap-1", className)}>
      <span className="text-xs uppercase tracking-widest text-muted-foreground font-medium">
        {label}
      </span>
      <div className="flex items-baseline gap-2">
        <span className="text-3xl font-bold text-foreground tabular-nums">
          {value}
        </span>
        {trend && (
          <span
            className={cn(
              "text-sm font-medium",
              trendColors[trend.direction]
            )}
          >
            {trend.value}
          </span>
        )}
      </div>
      {description && (
        <span className="text-sm text-muted-foreground">
          {description}
        </span>
      )}
    </div>
  );
}

export default StatBadge;
