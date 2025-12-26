import * as React from "react"
import { cva, type VariantProps } from "class-variance-authority"
import { cn } from "@/lib/utils"

// Dashboard Layout Component
interface DashboardLayoutPremiumProps extends React.HTMLAttributes<HTMLDivElement> {
  backgroundEffects?: boolean
  gridPattern?: boolean
  header?: {
    title: string
    description?: string
    icon?: React.ReactNode
    action?: React.ReactNode
  }
  sidebar?: React.ReactNode
}

function DashboardLayoutPremium({
  className,
  backgroundEffects = true,
  gridPattern = true,
  header,
  sidebar,
  children,
  ...props
}: DashboardLayoutPremiumProps) {
  return (
    <div className={cn("min-h-screen relative", className)} {...props}>
      {/* Background Effects */}
      {backgroundEffects && (
        <>
          <div className="fixed inset-0 gradient-mesh opacity-30 pointer-events-none" />
          <div className="fixed top-20 left-20 w-72 h-72 bg-primary/5 rounded-full blur-3xl animate-float" />
          <div className="fixed bottom-20 right-20 w-96 h-96 bg-accent/5 rounded-full blur-3xl animate-float" style={{ animationDelay: "2s" }} />
        </>
      )}
      
      {/* Grid Pattern */}
      {gridPattern && (
        <div className="fixed inset-0 opacity-[0.02] pointer-events-none">
          <div className="absolute inset-0" style={{
            backgroundImage: `
              linear-gradient(rgba(0,0,0,0.1) 1px, transparent 1px),
              linear-gradient(90deg, rgba(0,0,0,0.1) 1px, transparent 1px)
            `,
            backgroundSize: '20px 20px'
          }} />
        </div>
      )}

      <div className="relative z-10 flex min-h-screen">
        {/* Sidebar */}
        {sidebar && (
          <aside className="w-64 flex-shrink-0">
            {sidebar}
          </aside>
        )}

        {/* Main Content */}
        <main className="flex-1 flex flex-col">
          {/* Header */}
          {header && (
            <header className="border-b border-border/50 bg-background/80 backdrop-blur-sm sticky top-0 z-20">
              <div className="px-6 py-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    {header.icon && (
                      <div className="flex-shrink-0">
                        {header.icon}
                      </div>
                    )}
                    <div>
                      <h1 className="text-2xl font-bold font-display text-gradient-primary">
                        {header.title}
                      </h1>
                      {header.description && (
                        <p className="text-sm text-muted-foreground mt-1">
                          {header.description}
                        </p>
                      )}
                    </div>
                  </div>
                  {header.action && (
                    <div className="flex-shrink-0">
                      {header.action}
                    </div>
                  )}
                </div>
              </div>
            </header>
          )}

          {/* Page Content */}
          <div className="flex-1 p-6">
            {children}
          </div>
        </main>
      </div>
    </div>
  )
}

// Grid Layout Component
const gridVariants = cva(
  "grid gap-6",
  {
    variants: {
      cols: {
        1: "grid-cols-1",
        2: "grid-cols-1 md:grid-cols-2",
        3: "grid-cols-1 md:grid-cols-2 lg:grid-cols-3",
        4: "grid-cols-1 md:grid-cols-2 lg:grid-cols-4",
        6: "grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6",
        12: "grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-12",
      },
      gap: {
        sm: "gap-3",
        md: "gap-4",
        lg: "gap-6",
        xl: "gap-8",
      },
    },
    defaultVariants: {
      cols: 3,
      gap: "lg",
    },
  }
)

interface GridLayoutPremiumProps 
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof gridVariants> {}

function GridLayoutPremium({ 
  className, 
  cols, 
  gap, 
  ...props 
}: GridLayoutPremiumProps) {
  return (
    <div
      className={cn(gridVariants({ cols, gap }), className)}
      {...props}
    />
  )
}

// Section Component
const sectionVariants = cva(
  "space-y-6",
  {
    variants: {
      variant: {
        default: "",
        elevated: "p-6 rounded-xl bg-surface-elevated shadow-elevation-1",
        glass: "p-6 rounded-xl glass-panel",
      },
    },
    defaultVariants: {
      variant: "default",
    },
  }
)

interface SectionPremiumProps 
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof sectionVariants> {
  title?: string
  description?: string
  action?: React.ReactNode
}

function SectionPremium({ 
  className, 
  variant,
  title,
  description,
  action,
  children,
  ...props 
}: SectionPremiumProps) {
  return (
    <section
      className={cn(sectionVariants({ variant }), className)}
      {...props}
    >
      {(title || description || action) && (
        <div className="flex items-start justify-between">
          <div className="space-y-1">
            {title && (
              <h2 className="text-xl font-semibold font-display">
                {title}
              </h2>
            )}
            {description && (
              <p className="text-sm text-muted-foreground">
                {description}
              </p>
            )}
          </div>
          {action && (
            <div className="flex-shrink-0">
              {action}
            </div>
          )}
        </div>
      )}
      {children}
    </section>
  )
}

// Stats Grid Component
interface StatItem {
  label: string
  value: string | number
  change?: string
  trend?: "up" | "down" | "neutral"
  icon?: React.ReactNode
  description?: string
}

interface StatsGridPremiumProps extends React.HTMLAttributes<HTMLDivElement> {
  stats: StatItem[]
  animated?: boolean
}

function StatsGridPremium({ 
  className,
  stats,
  animated = true,
  ...props 
}: StatsGridPremiumProps) {
  return (
    <GridLayoutPremium
      cols={stats.length <= 2 ? 2 : stats.length <= 4 ? 4 : 6}
      className={cn("mb-8", className)}
      {...props}
    >
      {stats.map((stat, index) => (
        <div
          key={stat.label}
          className={cn(
            "p-6 rounded-xl bg-card border border-border/50 shadow-elevation-1",
            "hover:shadow-elevation-2 hover:-translate-y-0.5 transition-all duration-300",
            animated && `animate-fade-in-stagger-${Math.min(index + 1, 4)}`
          )}
        >
          <div className="flex items-start justify-between">
            <div className="space-y-2">
              <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
                {stat.label}
              </p>
              <div className="flex items-baseline space-x-2">
                <p className="text-2xl font-bold font-display">
                  {stat.value}
                </p>
                {stat.change && stat.trend && (
                  <span className={cn(
                    "text-xs font-medium",
                    stat.trend === "up" && "text-success",
                    stat.trend === "down" && "text-destructive",
                    stat.trend === "neutral" && "text-muted-foreground"
                  )}>
                    {stat.change}
                  </span>
                )}
              </div>
              {stat.description && (
                <p className="text-xs text-muted-foreground">
                  {stat.description}
                </p>
              )}
            </div>
            {stat.icon && (
              <div className="flex-shrink-0 p-2 rounded-lg bg-primary/10 text-primary">
                {stat.icon}
              </div>
            )}
          </div>
        </div>
      ))}
    </GridLayoutPremium>
  )
}

// Content Container Component
const containerVariants = cva(
  "mx-auto",
  {
    variants: {
      width: {
        sm: "max-w-2xl",
        md: "max-w-4xl",
        lg: "max-w-6xl",
        xl: "max-w-7xl",
        full: "max-w-full",
      },
      padding: {
        none: "",
        sm: "px-4",
        md: "px-6",
        lg: "px-8",
      },
    },
    defaultVariants: {
      width: "xl",
      padding: "lg",
    },
  }
)

interface ContentContainerPremiumProps 
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof containerVariants> {}

function ContentContainerPremium({ 
  className, 
  width, 
  padding, 
  ...props 
}: ContentContainerPremiumProps) {
  return (
    <div
      className={cn(containerVariants({ width, padding }), className)}
      {...props}
    />
  )
}

// Page Transition Component
interface PageTransitionPremiumProps extends React.HTMLAttributes<HTMLDivElement> {
  delay?: number
}

function PageTransitionPremium({ 
  className,
  delay = 0,
  children,
  ...props 
}: PageTransitionPremiumProps) {
  return (
    <div
      className={cn("animate-fade-in-up", className)}
      style={{ animationDelay: `${delay}ms` }}
      {...props}
    >
      {children}
    </div>
  )
}

export {
  DashboardLayoutPremium,
  GridLayoutPremium,
  SectionPremium,
  StatsGridPremium,
  ContentContainerPremium,
  PageTransitionPremium,
}

