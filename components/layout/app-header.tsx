"use client";

import { cn } from "@/lib/utils";
import { ThemeToggle } from "@/components/theme-toggle";
import { SidebarTrigger, useSidebar } from "@/components/ui/sidebar";
import { Separator } from "@/components/ui/separator";

export function AppHeader() {
  const { isMobile } = useSidebar();

  return (
    <header
      className={cn(
        "sticky top-0 z-10 flex h-14 shrink-0 items-center gap-2 border-b bg-background/60 px-4 backdrop-blur-md transition-all placeholder:text-muted-foreground focus-visible:outline-hidden data-[state=open]:bg-sidebar-accent data-[state=open]:text-sidebar-accent-foreground",
      )}
    >
      <div className="flex flex-1 items-center gap-2">
        <SidebarTrigger />
        <Separator orientation="vertical" className="mr-2 h-4" />
        {/* Placeholder for Dynamic Breadcrumbs - can be added later */}
        <span className="text-sm font-medium neon-text-glow text-primary/80">
          Ops Command
        </span>
      </div>

      <div className="flex items-center gap-4">
        <ThemeToggle />
      </div>
    </header>
  );
}
