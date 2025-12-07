"use client";

import type { LucideIcon } from "lucide-react";
import { cn } from "@/lib/utils";

interface AppIconProps {
  icon: LucideIcon;
  className?: string;
  "aria-hidden"?: boolean;
}

export function AppIcon({ icon: Icon, className, "aria-hidden": ariaHidden = true }: AppIconProps) {
  return (
    <div
      className={cn(
        "inline-flex h-9 w-9 items-center justify-center border border-[var(--glass-border)] bg-[var(--card-glass)] text-primary",
        className
      )}
      aria-hidden={ariaHidden}
    >
      <Icon className="h-4 w-4" />
    </div>
  );
}
