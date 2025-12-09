"use client";

import { useSidebar } from "./sidebar-context";
import { cn } from "@/lib/utils";
import { Menu, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabaseClient";

export function AppHeader() {
  const { toggleSidebar, isCollapsed } = useSidebar();
  const [summary, setSummary] = useState<string | null>(null);

  useEffect(() => {
    async function fetchSummary() {
      // In a real scenario, this would call the Edge Function
      // const { data } = await supabase.functions.invoke('daily-summary');
      // setSummary(data?.summary);
      
      // Simulating response for now to avoid 500s if function not deployed
      setTimeout(() => {
         setSummary("Operations are running smoothly with 12 new shipments today. Attention required for 3 open tickets.");
      }, 1000);
    }
    fetchSummary();
  }, []);

  return (
    <header
      className={cn(
        "sticky top-0 z-30 flex h-16 items-center border-b bg-background/95 px-6 backdrop-blur supports-[backdrop-filter]:bg-background/60 transition-all duration-300",
        isCollapsed ? "lg:pl-[70px]" : "lg:pl-64"
      )}
    >
      <div className="flex w-full items-center gap-4">
        {/* Mobile Toggle */}
        <Button
          variant="ghost"
          size="icon"
          className="lg:hidden"
          onClick={toggleSidebar}
        >
          <Menu className="h-5 w-5" />
        </Button>

        {/* Dashboard Title & AI Insight */}
        <div className="flex-1 flex flex-col justify-center">
          <h1 className="text-lg font-semibold leading-none">Dashboard</h1>
          {summary && (
            <div className="hidden md:flex items-center gap-1.5 text-xs text-muted-foreground mt-1 animate-in fade-in slide-in-from-left-2 duration-500">
              <Sparkles className="h-3 w-3 text-yellow-500" />
              <span>{summary}</span>
            </div>
          )}
        </div>

        {/* Right Actions */}
        <div className="flex items-center gap-4">
          {/* Notifications, Search, etc. */}
        </div>
      </div>
    </header>
  );
}
