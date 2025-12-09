import * as React from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { SidebarTrigger } from "@/components/ui/sidebar";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { Drawer, DrawerTrigger } from "@/components/ui/drawer";
import ChatDrawer from "@/components/ai/chat-drawer";
import { Bot } from "lucide-react";
import MobileNotifications from "@/components/dashboard/notifications/mobile-notifications";
import type { Notification as DashboardNotification } from "@/types/dashboard";
import BellIcon from "@/components/icons/bell";
import { BrandLogo } from "@/components/ui/brand-logo";

interface MobileHeaderProps {
  notifications: DashboardNotification[];
}

export function MobileHeader({ notifications }: MobileHeaderProps) {
  const unreadCount = notifications.filter((n) => !n.read).length;

  return (
    <div className="lg:hidden h-header-mobile sticky top-0 z-50 bg-background/95 backdrop-blur-sm border-b border-border">
      <div className="flex items-center justify-between px-4 py-3">
        {/* Left: Sidebar Menu */}
        <SidebarTrigger />

        {/* Center: Brand Logo */}
        <BrandLogo size="xs" />

        <div className="flex items-center gap-2">
          <Drawer>
            <DrawerTrigger asChild>
              <Button variant="secondary" size="icon" aria-label="AI Assistant">
                <Bot className="size-4" />
              </Button>
            </DrawerTrigger>
            <ChatDrawer />
          </Drawer>

          <Sheet>
            {/* Right: Notifications Menu */}
            <SheetTrigger asChild>
              <Button variant="secondary" size="icon" className="relative">
                {unreadCount > 0 && (
                  <Badge className="absolute border-2 border-background -top-1 -left-2 h-5 w-5 text-xs p-0 flex items-center justify-center">
                    {unreadCount > 9 ? "9+" : unreadCount}
                  </Badge>
                )}
                <BellIcon className="size-4" />
              </Button>
            </SheetTrigger>

            {/* Notifications Sheet */}
            <SheetContent
              side="right"
              className="w-[80%] max-w-md p-0"
            >
              <MobileNotifications
                initialNotifications={notifications}
              />
            </SheetContent>
          </Sheet>
        </div>
      </div>
    </div>
  );
}
