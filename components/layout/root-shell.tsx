"use client";

import { useEffect, useState } from "react";
import { usePathname, useRouter } from "next/navigation";
import { SidebarProvider } from "@/components/ui/sidebar";
import { MobileHeader } from "@/components/dashboard/mobile-header";
import { DashboardSidebar } from "@/components/dashboard/sidebar";
import Widget from "@/components/dashboard/widget";
import Notifications from "@/components/dashboard/notifications";
import { MobileChat } from "@/components/chat/mobile-chat";
import Chat from "@/components/chat";
import type { Notification as DashboardNotification, WidgetData } from "@/types/dashboard";
import { Button } from "@/components/ui/button";
import { ChevronLeft } from "lucide-react";
import { cn } from "@/lib/utils";

interface RootShellProps {
  children: React.ReactNode;
  notifications: DashboardNotification[];
  defaultWidgetData: WidgetData;
}

export function RootShell({
  children,
  notifications,
  defaultWidgetData,
}: RootShellProps) {
  const pathname = usePathname();
  const [isRightPanelOpen, setIsRightPanelOpen] = useState(true);
  const router = useRouter();

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      const rawKey = event.key;
      if (!rawKey || typeof rawKey !== "string") {
        return;
      }

      const key = rawKey.toLowerCase();
      const isMeta = event.metaKey || event.ctrlKey;

      if (!isMeta || key !== "k") return;

      const target = event.target as HTMLElement | null;
      const tagName = target?.tagName;
      if (
        tagName === "INPUT" ||
        tagName === "TEXTAREA" ||
        tagName === "SELECT" ||
        target?.isContentEditable
      ) {
        return;
      }

      event.preventDefault();
      if (pathname !== "/search") {
        router.push("/search");
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [pathname, router]);

  const isStandaloneRoute =
    pathname === "/login" ||
    pathname === "/track" ||
    pathname.startsWith("/support/customer");

  if (isStandaloneRoute) {
    // For standalone routes (like /login, /track, customer support), render without dashboard chrome.
    return <>{children}</>;
  }

  return (
    <SidebarProvider>
      {/* Mobile Header - only visible on mobile */}
      <MobileHeader notifications={notifications} />

      {/* Desktop Layout */}
      <div className="w-full grid grid-cols-1 lg:grid-cols-12 gap-gap lg:px-sides relative">
        <div className="hidden lg:block col-span-2 top-0 relative">
          <DashboardSidebar />
        </div>
        <div
          className={cn(
            "col-span-1 transition-all duration-300 ease-in-out",
            isRightPanelOpen ? "lg:col-span-7" : "lg:col-span-10"
          )}
        >
          {children}
        </div>
        <div
          className={cn(
            "hidden lg:block transition-all duration-300 ease-in-out",
            isRightPanelOpen ? "col-span-3 opacity-100" : "col-span-0 opacity-0 w-0 overflow-hidden"
          )}
        >
          <div className="space-y-gap py-sides min-h-screen max-h-screen sticky top-0 overflow-clip">
            <Widget
              widgetData={defaultWidgetData}
              onCollapse={() => setIsRightPanelOpen(false)}
            />
            <Notifications initialNotifications={notifications} />
            <Chat />
          </div>
        </div>

        {/* Floating expand button for right panel */}
        {!isRightPanelOpen && (
          <Button
            variant="outline"
            size="icon"
            className="hidden lg:flex fixed right-4 top-4 z-50 shadow-lg bg-background hover:bg-accent"
            onClick={() => setIsRightPanelOpen(true)}
          >
            <ChevronLeft className="h-4 w-4" />
            <span className="sr-only">Expand panel</span>
          </Button>
        )}
      </div>

      {/* Mobile Chat - floating CTA with drawer */}
      <MobileChat />
    </SidebarProvider>
  );
}
