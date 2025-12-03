import * as React from "react";
import { cn } from "@/lib/utils";

interface GlassCardProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?: "default" | "elevated" | "subtle";
  blur?: "sm" | "md" | "lg" | "xl";
}

export function GlassCard({
  className,
  variant = "default",
  blur = "md",
  children,
  ...props
}: GlassCardProps) {
  const blurClasses = {
    sm: "backdrop-blur-sm",
    md: "backdrop-blur-md",
    lg: "backdrop-blur-lg",
    xl: "backdrop-blur-xl",
  };

  const variantClasses = {
    default: "bg-background/60 border-border/50",
    elevated:
      "bg-gradient-to-br from-background/70 to-background/40 border-border/30 shadow-lg shadow-brand/5",
    subtle: "bg-background/40 border-border/20",
  };

  return (
    <div
      className={cn(
        "rounded-lg border backdrop-saturate-150",
        "transition-all duration-300 ease-out",
        "hover:bg-background/70 hover:border-border/60",
        "hover:shadow-xl hover:shadow-brand/10",
        blurClasses[blur],
        variantClasses[variant],
        className
      )}
      {...props}
    >
      {children}
    </div>
  );
}

export function GlassCardHeader({
  className,
  ...props
}: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={cn("flex flex-col space-y-1.5 p-6", className)}
      {...props}
    />
  );
}

export function GlassCardTitle({
  className,
  ...props
}: React.HTMLAttributes<HTMLHeadingElement>) {
  return (
    <h3
      className={cn(
        "text-2xl font-semibold leading-none tracking-tight",
        "bg-gradient-to-r from-foreground to-foreground/70 bg-clip-text",
        className
      )}
      {...props}
    />
  );
}

export function GlassCardDescription({
  className,
  ...props
}: React.HTMLAttributes<HTMLParagraphElement>) {
  return (
    <p
      className={cn("text-sm text-muted-foreground", className)}
      {...props}
    />
  );
}

export function GlassCardContent({
  className,
  ...props
}: React.HTMLAttributes<HTMLDivElement>) {
  return <div className={cn("p-6 pt-0", className)} {...props} />;
}

export function GlassCardFooter({
  className,
  ...props
}: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={cn("flex items-center p-6 pt-0", className)}
      {...props}
    />
  );
}
