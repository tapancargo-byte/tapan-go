import { cn } from '@/lib/utils';

interface SidebarStatusBadgeProps {
  count: number | string;
  variant?: 'default' | 'success' | 'warning' | 'destructive';
  className?: string;
}

export function SidebarStatusBadge({
  count,
  variant = 'default',
  className,
}: SidebarStatusBadgeProps) {
  const variants = {
    default:
      'bg-muted text-muted-foreground border border-border',
    success:
      'bg-green-500/15 text-green-700 dark:text-green-400 border border-green-200 dark:border-green-800',
    warning:
      'bg-yellow-500/15 text-yellow-700 dark:text-yellow-400 border border-yellow-200 dark:border-yellow-800',
    destructive:
      'bg-red-500/15 text-red-700 dark:text-red-400 border border-red-200 dark:border-red-800',
  };

  return (
    <span
      className={cn(
        'inline-flex items-center justify-center px-2.5 py-1 text-xs font-semibold transition-all',
        variants[variant],
        className
      )}
    >
      {count}
    </span>
  );
}
