'use client';

import { useKBar } from 'kbar';
import { Search } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

interface CommandMenuTriggerProps {
  className?: string;
  variant?: 'default' | 'compact';
}

export function CommandMenuTrigger({ className, variant = 'default' }: CommandMenuTriggerProps) {
  const { query } = useKBar();

  if (variant === 'compact') {
    return (
      <Button
        variant="ghost"
        size="icon"
        onClick={query.toggle}
        className={cn('h-9 w-9', className)}
      >
        <Search className="h-4 w-4" />
        <span className="sr-only">Open command menu</span>
      </Button>
    );
  }

  return (
    <Button
      variant="outline"
      onClick={query.toggle}
      className={cn(
        'relative h-9 w-full justify-start rounded-md bg-muted/50 text-sm font-normal text-muted-foreground shadow-none sm:pr-12 md:w-40 lg:w-64',
        className
      )}
    >
      <Search className="mr-2 h-4 w-4" />
      <span className="hidden lg:inline-flex">Search...</span>
      <span className="inline-flex lg:hidden">Search...</span>
      <kbd className="pointer-events-none absolute right-1.5 top-1.5 hidden h-6 select-none items-center gap-1 rounded border bg-muted px-1.5 font-mono text-[10px] font-medium opacity-100 sm:flex">
        <span className="text-xs">⌘</span>K
      </kbd>
    </Button>
  );
}

export default CommandMenuTrigger;
