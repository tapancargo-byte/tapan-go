'use client';

import { TrendingDown, TrendingUp, Package, Users, FileText, Warehouse } from 'lucide-react';
import {
  Label,
  PolarGrid,
  PolarRadiusAxis,
  RadialBar,
  RadialBarChart,
} from 'recharts';
import { Badge } from '@/components/ui/badge';
import {
  Card,
  CardAction,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { ChartConfig, ChartContainer } from '@/components/ui/chart';

interface EnhancedStatCardProps {
  title: string;
  value: string | number;
  description: string;
  trend: number;
  trendLabel: string;
  icon: React.ReactNode;
  chartValue: number; // 0-100 for radial progress
  chartColorClass: string; // CSS color like 'hsl(var(--chart-1))'
}

// Mini Radial Chart using shadcn/Recharts pattern
function MiniRadialChart({ 
  value, 
  color,
}: { 
  value: number; 
  color: string;
}) {
  const percentage = Math.min(Math.max(value, 0), 100);
  const endAngle = 90 + (percentage / 100) * 360;

  const chartData = [{ value: percentage, fill: color }];

  const chartConfig = {
    value: {
      label: 'Progress',
      color: color,
    },
  } satisfies ChartConfig;

  return (
    <ChartContainer
      config={chartConfig}
      className="aspect-square h-[70px] w-[70px]"
    >
      <RadialBarChart
        data={chartData}
        startAngle={90}
        endAngle={endAngle}
        innerRadius={25}
        outerRadius={35}
      >
        <PolarGrid
          gridType="circle"
          radialLines={false}
          stroke="none"
          className="first:fill-muted last:fill-background"
          polarRadius={[29, 21]}
        />
        <RadialBar dataKey="value" background cornerRadius={5} />
        <PolarRadiusAxis tick={false} tickLine={false} axisLine={false}>
          <Label
            content={({ viewBox }) => {
              if (viewBox && 'cx' in viewBox && 'cy' in viewBox) {
                return (
                  <text
                    x={viewBox.cx}
                    y={viewBox.cy}
                    textAnchor="middle"
                    dominantBaseline="middle"
                  >
                    <tspan
                      x={viewBox.cx}
                      y={viewBox.cy}
                      className="fill-foreground text-xs font-bold"
                    >
                      {percentage}%
                    </tspan>
                  </text>
                );
              }
            }}
          />
        </PolarRadiusAxis>
      </RadialBarChart>
    </ChartContainer>
  );
}

function EnhancedStatCard({
  title,
  value,
  description,
  trend,
  trendLabel,
  icon,
  chartValue,
  chartColorClass,
}: EnhancedStatCardProps) {
  const isPositive = trend >= 0;
  const TrendIcon = isPositive ? TrendingUp : TrendingDown;

  return (
    <Card className="@container/card bg-gradient-to-t from-primary/5 to-card dark:bg-card shadow-xs overflow-hidden">
      <CardHeader className="pb-2">
        <CardDescription className="flex items-center gap-2 text-xs">
          {icon}
          {title}
        </CardDescription>
        <CardTitle className="text-2xl font-semibold tabular-nums @[200px]/card:text-3xl">
          {value}
        </CardTitle>
        <CardAction>
          <Badge 
            variant="outline" 
            className={`gap-1 text-xs ${isPositive ? 'text-green-500 border-green-500/30' : 'text-red-500 border-red-500/30'}`}
          >
            <TrendIcon className="size-3" />
            {isPositive ? '+' : ''}{trend}%
          </Badge>
        </CardAction>
      </CardHeader>
      <CardContent className="flex items-center justify-between pb-4">
        <div className="flex-1 min-w-0 pr-2">
          <p className="text-xs font-medium text-muted-foreground truncate">
            {trendLabel}
          </p>
          <p className="text-xs text-muted-foreground/70 mt-0.5 truncate">
            {description}
          </p>
        </div>
        <MiniRadialChart 
          value={chartValue} 
          color={chartColorClass}
        />
      </CardContent>
    </Card>
  );
}

// Simple stat card without chart for variety
interface SimpleStatCardProps {
  title: string;
  value: string | number;
  description: string;
  trend: number;
  trendLabel: string;
  icon: React.ReactNode;
}

function SimpleStatCard({
  title,
  value,
  description,
  trend,
  trendLabel,
  icon,
}: SimpleStatCardProps) {
  const isPositive = trend >= 0;
  const TrendIcon = isPositive ? TrendingUp : TrendingDown;

  return (
    <Card className="@container/card bg-gradient-to-t from-primary/5 to-card dark:bg-card shadow-xs">
      <CardHeader className="pb-2">
        <CardDescription className="flex items-center gap-2 text-xs">
          {icon}
          {title}
        </CardDescription>
        <CardTitle className="text-2xl font-semibold tabular-nums @[200px]/card:text-3xl">
          {value}
        </CardTitle>
        <CardAction>
          <Badge 
            variant="outline" 
            className={`gap-1 text-xs ${isPositive ? 'text-green-600 border-green-200 dark:border-green-800' : 'text-red-600 border-red-200 dark:border-red-800'}`}
          >
            <TrendIcon className="size-3" />
            {isPositive ? '+' : ''}{trend}%
          </Badge>
        </CardAction>
      </CardHeader>
      <CardFooter className="flex-col items-start gap-1 pt-0 text-xs">
        <div className="flex items-center gap-1.5 font-medium">
          {trendLabel}
          <TrendIcon className="size-3" />
        </div>
        <div className="text-muted-foreground">
          {description}
        </div>
      </CardFooter>
    </Card>
  );
}

interface EnhancedSectionCardsProps {
  stats?: {
    totalShipments: number;
    activeCustomers: number;
    pendingInvoices: number;
    warehouseCapacity: number;
    shipmentsTrend: number;
    customersTrend: number;
    invoicesTrend: number;
    capacityTrend: number;
  };
}

export function EnhancedSectionCards({ stats }: EnhancedSectionCardsProps) {
  const defaultStats = {
    totalShipments: 1250,
    activeCustomers: 456,
    pendingInvoices: 23,
    warehouseCapacity: 79,
    shipmentsTrend: 8.2,
    customersTrend: 5.1,
    invoicesTrend: -5.3,
    capacityTrend: -2.3,
  };

  const data = stats || defaultStats;

  // Calculate chart percentages
  const shipmentsProgress = Math.min((data.totalShipments / 2000) * 100, 100);
  const customersProgress = Math.min((data.activeCustomers / 500) * 100, 100);
  const invoicesProgress = Math.min((data.pendingInvoices / 50) * 100, 100);

  return (
    <div className="grid grid-cols-1 gap-4 px-4 lg:px-6 @xl/main:grid-cols-2 @5xl/main:grid-cols-4">
      <EnhancedStatCard
        title="Total Shipments"
        value={data.totalShipments.toLocaleString()}
        description="Active shipments this month"
        trend={data.shipmentsTrend}
        trendLabel={data.shipmentsTrend >= 0 ? 'Trending up this month' : 'Trending down'}
        icon={<Package className="size-3.5" />}
        chartValue={Math.round(shipmentsProgress)}
        chartColorClass="hsl(var(--chart-1))"
      />
      <EnhancedStatCard
        title="Active Customers"
        value={data.activeCustomers.toLocaleString()}
        description="Customers with recent orders"
        trend={data.customersTrend}
        trendLabel={data.customersTrend >= 0 ? 'Customer base growing' : 'Needs attention'}
        icon={<Users className="size-3.5" />}
        chartValue={Math.round(customersProgress)}
        chartColorClass="hsl(var(--chart-2))"
      />
      <SimpleStatCard
        title="Pending Invoices"
        value={data.pendingInvoices.toLocaleString()}
        description="Awaiting payment"
        trend={data.invoicesTrend}
        trendLabel={data.invoicesTrend >= 0 ? 'More pending' : 'Fewer pending'}
        icon={<FileText className="size-3.5" />}
      />
      <EnhancedStatCard
        title="Warehouse Capacity"
        value={`${data.warehouseCapacity}%`}
        description="Current utilization"
        trend={data.capacityTrend}
        trendLabel={data.capacityTrend >= 0 ? 'Utilization increasing' : 'More space available'}
        icon={<Warehouse className="size-3.5" />}
        chartValue={data.warehouseCapacity}
        chartColorClass="hsl(var(--chart-4))"
      />
    </div>
  );
}

export default EnhancedSectionCards;
