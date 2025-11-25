import { cn } from '@/lib/utils';

interface QuickStatProps {
  label: string;
  value: string | number;
  trend?: 'up' | 'down' | 'stable';
  icon?: React.ReactNode;
  className?: string;
}

export function SidebarQuickStat({
  label,
  value,
  trend,
  icon,
  className,
}: QuickStatProps) {
  const trendColors = {
    up: 'text-green-600 dark:text-green-400',
    down: 'text-red-600 dark:text-red-400',
    stable: 'text-muted-foreground',
  };

  return (
    <div
      className={cn(
        'px-3 py-2 rounded-lg bg-sidebar-accent hover:bg-sidebar-accent-active transition-colors',
        className
      )}
    >
      <div className="flex items-center justify-between gap-2">
        <div className="text-left flex-1">
          <p className="text-xs text-muted-foreground font-medium">{label}</p>
          <p className="text-sm font-semibold text-foreground">{value}</p>
        </div>
        {icon && <div className="text-lg opacity-60">{icon}</div>}
      </div>
      {trend && (
        <div className={cn('text-xs mt-1 font-medium', trendColors[trend])}>
          {trend === 'up' && '↑ Increasing'}
          {trend === 'down' && '↓ Decreasing'}
          {trend === 'stable' && '→ Stable'}
        </div>
      )}
    </div>
  );
}
