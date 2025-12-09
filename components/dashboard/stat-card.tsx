'use client';

import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';
import { TrendingUp, TrendingDown, Minus } from 'lucide-react';
import { ReactNode } from 'react';

interface StatCardProps {
  title: string;
  value: string | number;
  description?: string;
  trend?: {
    value: number;
    label?: string;
  };
  icon?: ReactNode;
  className?: string;
  variant?: 'default' | 'gradient';
}

export function StatCard({
  title,
  value,
  description,
  trend,
  icon,
  className,
  variant = 'default',
}: StatCardProps) {
  const trendDirection = trend ? (trend.value > 0 ? 'up' : trend.value < 0 ? 'down' : 'neutral') : null;

  return (
    <Card 
      className={cn(
        '@container/card',
        variant === 'gradient' && 'bg-gradient-to-t from-primary/5 to-card dark:bg-card shadow-xs',
        className
      )}
    >
      <CardHeader className="pb-2">
        <CardDescription className="text-sm font-medium">{title}</CardDescription>
        <div className="flex items-center justify-between">
          <CardTitle className="text-2xl font-semibold tabular-nums @[250px]/card:text-3xl">
            {value}
          </CardTitle>
          {trend && (
            <Badge 
              variant="outline" 
              className={cn(
                'gap-1',
                trendDirection === 'up' && 'border-green-200 bg-green-50 text-green-700 dark:border-green-800 dark:bg-green-900/20 dark:text-green-400',
                trendDirection === 'down' && 'border-red-200 bg-red-50 text-red-700 dark:border-red-800 dark:bg-red-900/20 dark:text-red-400',
                trendDirection === 'neutral' && 'border-gray-200 bg-gray-50 text-gray-700 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-400'
              )}
            >
              {trendDirection === 'up' && <TrendingUp className="h-3 w-3" />}
              {trendDirection === 'down' && <TrendingDown className="h-3 w-3" />}
              {trendDirection === 'neutral' && <Minus className="h-3 w-3" />}
              {trend.value > 0 ? '+' : ''}{trend.value}%
            </Badge>
          )}
        </div>
      </CardHeader>
      <CardContent className="pt-0">
        <div className="flex items-center gap-2 text-sm">
          {icon && <span className="text-muted-foreground">{icon}</span>}
          {trend && (
            <span className={cn(
              'flex items-center gap-1 font-medium',
              trendDirection === 'up' && 'text-green-600 dark:text-green-400',
              trendDirection === 'down' && 'text-red-600 dark:text-red-400',
              trendDirection === 'neutral' && 'text-muted-foreground'
            )}>
              {trendDirection === 'up' && 'Trending up'}
              {trendDirection === 'down' && 'Trending down'}
              {trendDirection === 'neutral' && 'No change'}
              {trendDirection === 'up' && <TrendingUp className="h-4 w-4" />}
              {trendDirection === 'down' && <TrendingDown className="h-4 w-4" />}
            </span>
          )}
        </div>
        {description && (
          <p className="text-muted-foreground text-sm mt-1">{description}</p>
        )}
      </CardContent>
    </Card>
  );
}

export default StatCard;
