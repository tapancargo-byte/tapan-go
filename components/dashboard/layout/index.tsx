import React from "react";
import { cn } from "@/lib/utils";

interface DashboardPageLayoutProps {
  children: React.ReactNode;
  header: {
    title: string;
    description?: string;
    icon: React.ElementType;
  };
  /** Optional className for the main container */
  className?: string;
}

/**
 * DashboardPageLayout - Consistent page layout for dashboard pages
 * 
 * Uses the design system tokens for spacing, typography, and colors.
 */
export default function DashboardPageLayout({
  children,
  header,
  className,
}: DashboardPageLayoutProps) {
  return (
    <div className={cn("flex flex-col relative w-full gap-1 min-h-full", className)}>
      {/* Page Header */}
      <div className="flex items-center lg:items-baseline gap-3 md:gap-4 px-4 md:px-6 py-4 md:pb-5 lg:pt-8 ring-1 ring-border/50 sticky top-header-mobile lg:top-0 bg-background/95 backdrop-blur-sm z-10 print:hidden">
        <div className="max-lg:contents bg-brand/10 size-8 md:size-10 flex items-center justify-center my-auto">
          <header.icon className="ml-1 lg:ml-0 text-brand size-5 md:size-6" />
        </div>
        <div className="flex-1 min-w-0">
          <h1 className="text-xl lg:text-3xl font-display font-bold tracking-wide leading-tight text-foreground">
            {header.title}
          </h1>
          {header.description && (
            <p className="mt-1 text-xs md:text-sm text-muted-foreground">
              {header.description}
            </p>
          )}
        </div>
      </div>
      
      {/* Page Content */}
      <div className="min-h-full flex-1 flex flex-col gap-4 md:gap-6 px-4 lg:px-6 py-4 md:py-6 pb-24 lg:pb-8 ring-1 ring-border/30 bg-background overflow-x-hidden">
        {children}
      </div>
    </div>
  );
}

export { DashboardPageLayout as DashboardLayout };
