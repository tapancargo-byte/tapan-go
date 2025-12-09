'use client';

import { cn } from '@/lib/utils';
import { ScrollArea } from '@/components/ui/scroll-area';

interface PageContainerProps {
  children: React.ReactNode;
  scrollable?: boolean;
  className?: string;
}

export function PageContainer({
  children,
  scrollable = true,
  className,
}: PageContainerProps) {
  if (scrollable) {
    return (
      <ScrollArea className="h-[calc(100dvh-52px)]">
        <div className={cn('flex flex-1 flex-col gap-4 p-4 md:gap-6 md:p-6', className)}>
          {children}
        </div>
      </ScrollArea>
    );
  }

  return (
    <div className={cn('flex flex-1 flex-col gap-4 p-4 md:gap-6 md:p-6', className)}>
      {children}
    </div>
  );
}

export default PageContainer;
