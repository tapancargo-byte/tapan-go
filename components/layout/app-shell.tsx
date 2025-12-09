"use client";

import { SidebarProvider, useSidebar } from "./sidebar-context";
import { AppSidebar } from "./app-sidebar";
import { AppHeader } from "./app-header";
import { cn } from "@/lib/utils";

function AppShellContent({ children }: { children: React.ReactNode }) {
  const { isCollapsed } = useSidebar();

  return (
    <div className="min-h-screen bg-muted/20 dark:bg-muted/10">
      <AppSidebar />
      <div
        className={cn(
          "flex min-h-screen flex-col transition-all duration-300",
          isCollapsed ? "lg:pl-[70px]" : "lg:pl-64"
        )}
      >
        <AppHeader />
        <main className="flex-1 p-6">{children}</main>
      </div>
    </div>
  );
}

export default function AppShell({ children }: { children: React.ReactNode }) {
  return (
    <SidebarProvider>
      <AppShellContent>{children}</AppShellContent>
    </SidebarProvider>
  );
}
