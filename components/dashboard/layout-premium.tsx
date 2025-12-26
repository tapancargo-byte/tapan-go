import * as React from "react"
import { cn } from "@/lib/utils"
import { CardPremium, CardHeaderPremium, CardTitlePremium, CardDescriptionPremium } from "@/components/ui/card-premium"

interface DashboardLayoutPremiumProps {
  children: React.ReactNode
  header?: {
    title: string
    description?: string
    icon?: React.ComponentType<{ className?: string }>
    action?: React.ReactNode
  }
  sidebar?: React.ReactNode
  className?: string
}

export function DashboardLayoutPremium({
  children,
  header,
  sidebar,
  className,
}: DashboardLayoutPremiumProps) {
  return (
    <div className={cn("min-h-screen bg-background", className)}>
      {/* Background Effects */}
      <div className="fixed inset-0 -z-10">
        {/* Gradient Mesh Background */}
        <div className="absolute inset-0 gradient-mesh opacity-30" />
        
        {/* Animated Orbs */}
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-primary/5 rounded-full blur-3xl animate-float" />
        <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-accent/5 rounded-full blur-3xl animate-float" style={{ animationDelay: "2s" }} />
        
        {/* Grid Pattern */}
        <div 
          className="absolute inset-0 opacity-[0.02]"
          style={{
            backgroundImage: `
              linear-gradient(hsl(var(--foreground)) 1px, transparent 1px),
              linear-gradient(90deg, hsl(var(--foreground)) 1px, transparent 1px)
            `,
            backgroundSize: "50px 50px",
          }}
        />
      </div>

      <div className="relative flex min-h-screen">
        {/* Sidebar */}
        {sidebar && (
          <aside className="w-64 border-r border-border/50 bg-surface/80 backdrop-blur-xl">
            {sidebar}
          </aside>
        )}

        {/* Main Content */}
        <main className="flex-1 flex flex-col">
          {/* Header */}
          {header && (
            <header className="sticky top-0 z-40 border-b border-border/50 bg-background/80 backdrop-blur-xl">
              <div className="container mx-auto px-6 py-6">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-4">
                    {header.icon && (
                      <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-primary/10 text-primary">
                        <header.icon className="h-6 w-6" />
                      </div>
                    )}
                    <div>
                      <h1 className="text-3xl font-bold font-display text-gradient-primary">
                        {header.title}
                      </h1>
                      {header.description && (
                        <p className="text-muted-foreground mt-1">
                          {header.description}
                        </p>
                      )}
                    </div>
                  </div>
                  {header.action && (
                    <div className="flex items-center space-x-4">
                      {header.action}
                    </div>
                  )}
                </div>
              </div>
            </header>
          )}

          {/* Content Area */}
          <div className="flex-1 container mx-auto px-6 py-8">
            {children}
          </div>
        </main>
      </div>
    </div>
  )
}

// Premium Grid Layout Component
interface GridLayoutProps {
  children: React.ReactNode
  columns?: 1 | 2 | 3 | 4 | 6 | 12
  gap?: "sm" | "md" | "lg" | "xl"
  className?: string
}

export function GridLayoutPremium({
  children,
  columns = 3,
  gap = "md",
  className,
}: GridLayoutProps) {
  const gridCols = {
    1: "grid-cols-1",
    2: "grid-cols-1 md:grid-cols-2",
    3: "grid-cols-1 md:grid-cols-2 lg:grid-cols-3",
    4: "grid-cols-1 md:grid-cols-2 lg:grid-cols-4",
    6: "grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6",
    12: "grid-cols-12",
  }

  const gapSizes = {
    sm: "gap-4",
    md: "gap-6",
    lg: "gap-8",
    xl: "gap-12",
  }

  return (
    <div className={cn(
      "grid",
      gridCols[columns],
      gapSizes[gap],
      className
    )}>
      {children}
    </div>
  )
}

// Premium Section Component
interface SectionProps {
  children: React.ReactNode
  title?: string
  description?: string
  action?: React.ReactNode
  className?: string
  variant?: "default" | "elevated" | "glass"
}

export function SectionPremium({
  children,
  title,
  description,
  action,
  className,
  variant = "default",
}: SectionProps) {
  const variants = {
    default: "",
    elevated: "bg-surface-elevated/50 backdrop-blur-sm rounded-2xl p-8 border border-border/30",
    glass: "glass-panel rounded-2xl p-8",
  }

  return (
    <section className={cn(variants[variant], className)}>
      {(title || description || action) && (
        <div className="flex items-center justify-between mb-6">
          <div>
            {title && (
              <h2 className="text-2xl font-bold font-display text-gradient-primary mb-2">
                {title}
              </h2>
            )}
            {description && (
              <p className="text-muted-foreground">
                {description}
              </p>
            )}
          </div>
          {action && (
            <div className="flex items-center space-x-4">
              {action}
            </div>
          )}
        </div>
      )}
      {children}
    </section>
  )
}

// Premium Stats Grid Component
interface StatsGridProps {
  stats: Array<{
    label: string
    value: string | number
    change?: string
    trend?: "up" | "down" | "neutral"
    icon?: React.ReactNode
    description?: string
  }>
  className?: string
}

export function StatsGridPremium({ stats, className }: StatsGridProps) {
  return (
    <GridLayoutPremium columns={stats.length > 4 ? 4 : stats.length} className={className}>
      {stats.map((stat, index) => (
        <CardPremium
          key={index}
          variant="premium"
          className="animate-fade-in-up"
          style={{ animationDelay: `${index * 0.1}s` }}
        >
          <CardHeaderPremium>
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                {stat.icon && (
                  <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10 text-primary">
                    {stat.icon}
                  </div>
                )}
                <div>
                  <p className="text-sm font-medium text-muted-foreground uppercase tracking-wider">
                    {stat.label}
                  </p>
                  <div className="flex items-baseline space-x-2 mt-1">
                    <p className="text-2xl font-bold font-display">
                      {stat.value}
                    </p>
                    {stat.change && stat.trend && (
                      <span className={cn(
                        "text-sm font-medium",
                        stat.trend === "up" && "text-success",
                        stat.trend === "down" && "text-destructive",
                        stat.trend === "neutral" && "text-muted-foreground"
                      )}>
                        {stat.change}
                      </span>
                    )}
                  </div>
                  {stat.description && (
                    <p className="text-xs text-muted-foreground mt-1">
                      {stat.description}
                    </p>
                  )}
                </div>
              </div>
            </div>
          </CardHeaderPremium>
        </CardPremium>
      ))}
    </GridLayoutPremium>
  )
}

// Premium Content Container
interface ContentContainerProps {
  children: React.ReactNode
  maxWidth?: "sm" | "md" | "lg" | "xl" | "2xl" | "full"
  className?: string
}

export function ContentContainerPremium({
  children,
  maxWidth = "full",
  className,
}: ContentContainerProps) {
  const maxWidths = {
    sm: "max-w-sm",
    md: "max-w-md",
    lg: "max-w-lg",
    xl: "max-w-xl",
    "2xl": "max-w-2xl",
    full: "max-w-full",
  }

  return (
    <div className={cn(
      "mx-auto w-full",
      maxWidths[maxWidth],
      className
    )}>
      {children}
    </div>
  )
}

// Premium Page Transition Wrapper
interface PageTransitionProps {
  children: React.ReactNode
  className?: string
}

export function PageTransitionPremium({ children, className }: PageTransitionProps) {
  return (
    <div className={cn(
      "animate-fade-in-up",
      className
    )}>
      {children}
    </div>
  )
}

