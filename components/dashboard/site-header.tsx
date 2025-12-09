'use client';

import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { SidebarTrigger } from '@/components/ui/sidebar';
import { CommandMenuTrigger } from '@/components/kbar/command-menu-trigger';
import { Bell, Search } from 'lucide-react';

interface SiteHeaderProps {
  title?: string;
}

export function SiteHeader({ title = 'Dashboard' }: SiteHeaderProps) {
  return (
    <header className="flex h-14 shrink-0 items-center gap-2 border-b transition-[width,height] ease-linear group-has-data-[collapsible=icon]/sidebar-wrapper:h-12">
      <div className="flex w-full items-center gap-1 px-4 lg:gap-2 lg:px-6">
        <SidebarTrigger className="-ml-1" />
        <Separator
          orientation="vertical"
          className="mx-2 data-[orientation=vertical]:h-4"
        />
        <h1 className="text-base font-medium">{title}</h1>
        <div className="ml-auto flex items-center gap-2">
          <CommandMenuTrigger />
          <Button variant="ghost" size="icon" className="size-8">
            <Search className="size-4" />
            <span className="sr-only">Search</span>
          </Button>
          <Button variant="ghost" size="icon" className="size-8 relative">
            <Bell className="size-4" />
            <span className="absolute top-1 right-1 size-2 rounded-full bg-destructive" />
            <span className="sr-only">Notifications</span>
          </Button>
        </div>
      </div>
    </header>
  );
}

export default SiteHeader;
