"use client"

import { CSSProperties, FC, ReactNode } from "react"

import { cn } from "@/lib/utils"

interface AnimatedShinyTextProps {
  children: ReactNode
  className?: string
  shimmerWidth?: number
}

export const AnimatedShinyText: FC<AnimatedShinyTextProps> = ({
  children,
  className,
  shimmerWidth = 100,
}) => {
  return (
    <span
      style={
        {
          "--shimmer-width": `${shimmerWidth}px`,
        } as CSSProperties
      }
      className={cn(
        // High-contrast readable base color (driven by the gradient)
        "font-semibold text-transparent",
        // Shimmer overlay
        "animate-shiny-text bg-clip-text bg-no-repeat [background-position:0_0] [background-size:var(--shimmer-width)_100%] [transition:background-position_1s_cubic-bezier(.6,.6,0,1)_infinite]",
        // Use `foreground` so it's dark on light theme and bright on dark theme
        "bg-gradient-to-r from-foreground/60 via-foreground via-50% to-foreground/60 dark:from-foreground/60 dark:via-foreground dark:to-foreground/60",
        className
      )}
    >
      {children}
    </span>
  )
}
