"use client";

import type { ReactNode } from "react";
import { motion } from "framer-motion";

interface KiboSectionHeaderProps {
  eyebrow?: string;
  title: string;
  description?: string;
  align?: "left" | "center";
  size?: "sm" | "lg";
}

export function KiboSectionHeader({
  eyebrow,
  title,
  description,
  align = "left",
  size = "lg",
}: KiboSectionHeaderProps) {
  const alignment =
    align === "center" ? "items-center text-center" : "items-start text-left";
  const descriptionMaxWidth =
    align === "center" ? "max-w-2xl mx-auto" : "max-w-xl";
  const titleClass =
    size === "sm"
      ? "text-2xl font-semibold text-foreground"
      : "text-3xl font-bold text-foreground";

  return (
    <div className={`flex flex-col gap-2 ${alignment}`}>
      {eyebrow ? (
        <p className="text-xs font-semibold tracking-[0.18em] text-foreground/70 uppercase">
          {eyebrow}
        </p>
      ) : null}
      <h2 className={titleClass}>{title}</h2>
      {description ? (
        <p className={`text-sm text-muted-foreground ${descriptionMaxWidth}`}>
          {description}
        </p>
      ) : null}
    </div>
  );
}

interface KiboMetricCardProps {
  children: ReactNode;
  className?: string;
}

export function KiboMetricCard({ children, className }: KiboMetricCardProps) {
  const base =
    "border border-border bg-card p-5 flex flex-col justify-between transition-colors";
  const merged = className ? `${base} ${className}` : base;
  return (
    <motion.div
      className={merged}
      whileHover={{ y: -4 }}
      whileTap={{ y: -1 }}
      transition={{ type: "spring", stiffness: 260, damping: 20, mass: 0.6 }}
    >
      {children}
    </motion.div>
  );
}

interface KiboContactCardProps {
  children: ReactNode;
  className?: string;
}

export function KiboContactCard({
  children,
  className,
}: KiboContactCardProps) {
  const base = "p-6 border border-border bg-card transition-colors";
  const merged = className ? `${base} ${className}` : base;
  return (
    <motion.div
      className={merged}
      whileHover={{ y: -3 }}
      whileTap={{ y: -1 }}
      transition={{ type: "spring", stiffness: 260, damping: 22, mass: 0.7 }}
    >
      {children}
    </motion.div>
  );
}

interface KiboPillProps {
  children: ReactNode;
  className?: string;
}

export function KiboPill({ children, className }: KiboPillProps) {
  const base =
    "inline-flex items-center gap-2 border border-[var(--glass-border)] bg-[var(--card-glass)] px-3 py-1 text-xs text-muted-foreground";
  const merged = className ? `${base} ${className}` : base;
  return <span className={merged}>{children}</span>;
}
