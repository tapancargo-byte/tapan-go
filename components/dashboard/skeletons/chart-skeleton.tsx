'use client';

import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';

export function BarChartSkeleton() {
  return (
    <Card className="h-full">
      <CardHeader>
        <Skeleton className="h-5 w-32" />
        <Skeleton className="h-4 w-48" />
      </CardHeader>
      <CardContent>
        <div className="flex h-[300px] items-end gap-2">
          {Array.from({ length: 12 }).map((_, i) => (
            <div key={i} className="flex-1 flex flex-col gap-1">
              <Skeleton 
                className="w-full rounded-t" 
                style={{ height: `${Math.random() * 60 + 40}%` }} 
              />
            </div>
          ))}
        </div>
        <div className="mt-4 flex justify-between">
          {['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'].map((month) => (
            <Skeleton key={month} className="h-3 w-6" />
          ))}
        </div>
      </CardContent>
    </Card>
  );
}

export function AreaChartSkeleton() {
  return (
    <Card className="h-full">
      <CardHeader>
        <Skeleton className="h-5 w-32" />
        <Skeleton className="h-4 w-48" />
      </CardHeader>
      <CardContent>
        <div className="relative h-[300px]">
          <Skeleton className="absolute inset-0 rounded" />
        </div>
      </CardContent>
    </Card>
  );
}

export function PieChartSkeleton() {
  return (
    <Card className="h-full">
      <CardHeader>
        <Skeleton className="h-5 w-32" />
        <Skeleton className="h-4 w-48" />
      </CardHeader>
      <CardContent className="flex items-center justify-center">
        <Skeleton className="h-48 w-48 rounded-full" />
      </CardContent>
    </Card>
  );
}

export default BarChartSkeleton;
