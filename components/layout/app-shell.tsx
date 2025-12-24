"use client";

import * as React from "react";
import { SidebarProvider, SidebarInset } from "@/components/ui/sidebar";
import { DashboardSidebar } from "@/components/dashboard/sidebar";
import { AppHeader } from "./app-header";

export default function AppShell({ children }: { children: React.ReactNode }) {
  // Use a cookie or default state for sidebar defaultOpen if needed, but Shadcn handles it.

  return (
    <SidebarProvider>
      <DashboardSidebar />
      <SidebarInset className="bg-background transition-all duration-300 ease-in-out">
        <AppHeader />
        <main className="flex-1 p-6 overflow-x-hidden pt-4">
          {children}
        </main>
      </SidebarInset>
    </SidebarProvider>
  );
}
