"use client";

import { useEffect } from "react";
import { usePathname, useRouter } from "next/navigation";
import dynamic from "next/dynamic";
import { SidebarProvider, SidebarInset } from "@/components/ui/sidebar";
import { DashboardSidebar } from "@/components/dashboard/sidebar";

// Lazy load mobile header (only needed on mobile)
const MobileHeader = dynamic(
  () => import("@/components/dashboard/mobile-header").then((mod) => ({ default: mod.MobileHeader })),
  { ssr: false }
);
import { TapanAssociateProvider } from "@/components/layout/tapan-associate-context";
import type { Notification as DashboardNotification, WidgetData } from "@/types/dashboard";
import { cn } from "@/lib/utils";

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
        {/* Sidebar + Inset layout */}
        <DashboardSidebar />
        <SidebarInset>
          {/* Mobile Header - only visible on mobile */}
          <div className="lg:hidden print:hidden">
            <MobileHeader notifications={notifications} />
          </div>

          {/* Page content */}
          <div
            className={cn(
              "min-h-[100svh] flex flex-col lg:h-screen lg:overflow-y-auto print:h-auto print:overflow-visible"
            )}
          >
            {children}
          </div>

          {/* Global Tapan Associate launcher (mobile only; desktop uses sidebar widget) */}
          {pathname !== "/tapan-associate" && (
            <div className="lg:hidden print:hidden">
              <TapanAssociateDrawerLauncher />
            </div>
          )}
        </SidebarInset>

      </TapanAssociateProvider>
    </SidebarProvider>
  );
}
