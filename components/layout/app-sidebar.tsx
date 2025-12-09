"use client";

import { cn } from "@/lib/utils";
import { useSidebar } from "./sidebar-context";
import { NAV_GROUPS } from "@/lib/constants/nav-links";
import Link from "next/link";
import { usePathname } from "next/navigation";
import Image from "next/image";
import { ChevronLeft, ChevronRight, LogOut } from "lucide-react";
import { Button } from "@/components/ui/button";
import { signOutAction } from "@/lib/actions/auth-actions";

export function AppSidebar() {
  const { isCollapsed, toggleSidebar, isMobile } = useSidebar();
  const pathname = usePathname();

  if (isMobile && isCollapsed) return null;

  return (
    <aside
      className={cn(
        "fixed left-0 top-0 z-40 h-screen border-r bg-background transition-all duration-300 ease-in-out",
        isCollapsed ? "w-[70px]" : "w-64"
      )}
    >
      <div className="flex h-full flex-col">
        {/* Header */}
        <div className="flex h-16 items-center border-b px-4">
          <div className="flex items-center gap-2">
            <Image
              src="/icons/logo.svg"
              alt="Logo"
              width={32}
              height={32}
              className="dark:invert"
            />
            {!isCollapsed && (
              <span className="font-bold text-lg tracking-tight">Tapango</span>
            )}
          </div>
          {!isMobile && (
            <Button
              variant="ghost"
              size="icon"
              className="ml-auto hidden lg:flex"
              onClick={toggleSidebar}
            >
              {isCollapsed ? (
                <ChevronRight className="h-4 w-4" />
              ) : (
                <ChevronLeft className="h-4 w-4" />
              )}
            </Button>
          )}
        </div>

        {/* Scrollable Content */}
        <div className="flex-1 overflow-y-auto py-4">
          <nav className="space-y-6 px-2">
            {NAV_GROUPS.map((group) => (
              <div key={group.title}>
                {!isCollapsed && (
                  <h3 className="mb-2 px-4 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                    {group.title}
                  </h3>
                )}
                <div className="space-y-1">
                  {group.items.map((item) => {
                    const isActive = pathname === item.href;
                    return (
                      <Link
                        key={item.href}
                        href={item.href}
                        className={cn(
                          "flex items-center gap-3 rounded-md px-3 py-2 text-sm font-medium transition-colors hover:bg-muted hover:text-foreground",
                          isActive
                            ? "bg-primary/10 text-primary"
                            : "text-muted-foreground",
                          isCollapsed && "justify-center px-2"
                        )}
                        title={isCollapsed ? item.title : undefined}
                      >
                        <item.icon className="h-5 w-5 shrink-0" />
                        {!isCollapsed && <span>{item.title}</span>}
                      </Link>
                    );
                  })}
                </div>
              </div>
            ))}
          </nav>
        </div>

        {/* Footer */}
        <div className="border-t p-4">
          <div className="flex items-center gap-3">
             {/* User Avatar could go here */}
            {!isCollapsed && (
              <div className="flex flex-col overflow-hidden">
                <span className="truncate text-sm font-medium">User Name</span>
                <span className="truncate text-xs text-muted-foreground">
                  admin@tapango.com
                </span>
              </div>
            )}
            <form action={signOutAction} className={cn("ml-auto", isCollapsed && "mx-auto")}>
              <Button
                variant="ghost"
                size="icon"
                title="Sign Out"
                className="text-muted-foreground hover:text-foreground"
              >
                <LogOut className="h-5 w-5" />
              </Button>
            </form>
          </div>
        </div>
      </div>
    </aside>
  );
}
