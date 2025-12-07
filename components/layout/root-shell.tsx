"use client";

import { useEffect, useState } from "react";
import { usePathname, useRouter } from "next/navigation";
import dynamic from "next/dynamic";
import { SidebarProvider } from "@/components/ui/sidebar";
import { DashboardSidebar } from "@/components/dashboard/sidebar";

// Lazy load mobile header (only needed on mobile)
const MobileHeader = dynamic(
  () => import("@/components/dashboard/mobile-header").then((mod) => ({ default: mod.MobileHeader })),
  { ssr: false }
);
import { TapanAssociateProvider } from "@/components/layout/tapan-associate-context";
import type { Notification as DashboardNotification, WidgetData } from "@/types/dashboard";
import { Button } from "@/components/ui/button";
import { ChevronLeft } from "lucide-react";
import { cn } from "@/lib/utils";
import { Skeleton } from "@/components/ui/skeleton";

// Lazy load non-critical right panel widgets
const Widget = dynamic(() => import("@/components/dashboard/widget"), {
  loading: () => <Skeleton className="h-32 w-full" />,
  ssr: false,
});

const TapanGoWidget = dynamic(
  () => import("@/components/dashboard/widget").then((mod) => ({ default: mod.TapanGoWidget })),
  { loading: () => <Skeleton className="h-16 w-full" />, ssr: false }
);

const TapanAssociateSidebarWidget = dynamic(
  () => import("@/components/dashboard/tapan-associate-widget").then((mod) => ({ default: mod.TapanAssociateSidebarWidget })),
  { loading: () => <Skeleton className="h-48 w-full" />, ssr: false }
);

const TapanAssociateDrawerLauncher = dynamic(
  () => import("@/components/layout/tapan-associate-drawer").then((mod) => ({ default: mod.TapanAssociateDrawerLauncher })),
  { ssr: false }
);

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
      <TapanAssociateProvider>
        {/* Background gradient halos behind the dashboard */}
        <div className="pointer-events-none fixed inset-0 -z-10">
          <div className="absolute -left-40 -top-40 h-80 w-80 rounded-full bg-accent-blue/35 blur-3xl" />
          <div className="absolute -right-48 -top-24 h-96 w-96 rounded-full bg-brand/25 blur-3xl" />
        </div>
        {/* Mobile Header - only visible on mobile */}
        <div className="print:hidden">
          <MobileHeader notifications={notifications} />
        </div>

        {/* Desktop Layout */}
        <div className="w-full grid grid-cols-1 lg:grid-cols-12 gap-gap lg:px-sides relative lg:h-screen lg:overflow-hidden print:block print:px-0 print:py-0 print:h-auto">
          <div className="col-span-1 lg:col-span-2 top-0 relative print:hidden">
            <DashboardSidebar />
          </div>
          <div
            className={cn(
              "col-span-1 transition-all duration-300 ease-in-out lg:h-screen lg:overflow-y-auto print:col-span-12 print:h-auto print:overflow-visible print:px-0 print:py-0",
              isRightPanelOpen ? "lg:col-span-7" : "lg:col-span-10"
            )}
          >
            {children}
          </div>
          <div
            className={cn(
              "hidden lg:block transition-all duration-300 ease-in-out lg:h-screen print:hidden",
              isRightPanelOpen ? "col-span-3 opacity-100" : "col-span-0 opacity-0 w-0 overflow-hidden"
            )}
          >
            <div className="flex flex-col gap-gap py-sides h-full justify-start">
              <Widget
                widgetData={defaultWidgetData}
                onCollapse={() => setIsRightPanelOpen(false)}
              />
              <TapanGoWidget />
              <TapanAssociateSidebarWidget />
            </div>
          </div>

          {/* Floating expand button for right panel */}
          {!isRightPanelOpen && (
            <Button
              variant="ghost"
              size="icon"
              className="hidden lg:flex fixed right-4 top-4 z-50 h-9 w-9 bg-background/90 backdrop-blur-sm border shadow-sm hover:bg-accent"
              onClick={() => setIsRightPanelOpen(true)}
            >
              <ChevronLeft className="h-4 w-4" />
              <span className="sr-only">Expand panel</span>
            </Button>
          )}
        </div>

        {/* Global Tapan Associate launcher (mobile only; desktop uses sidebar widget) */}
        {!isStandaloneRoute && pathname !== "/tapan-associate" && (
          <div className="lg:hidden print:hidden">
            <TapanAssociateDrawerLauncher />
          </div>
        )}

      </TapanAssociateProvider>
    </SidebarProvider>
  );
}
