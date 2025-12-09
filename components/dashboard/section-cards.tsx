'use client';

import { TrendingDown, TrendingUp, Package, Users, FileText, Warehouse } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import {
  Card,
  CardAction,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';

interface SectionCardProps {
  title: string;
  value: string | number;
  description: string;
  trend: number;
  trendLabel: string;
  icon?: React.ReactNode;
}

function SectionCard({ title, value, description, trend, trendLabel, icon }: SectionCardProps) {
  const isPositive = trend >= 0;
  const TrendIcon = isPositive ? TrendingUp : TrendingDown;

  return (
    <Card className="@container/card bg-gradient-to-t from-primary/5 to-card dark:bg-card shadow-xs">
      <CardHeader>
        <CardDescription className="flex items-center gap-2">
          {icon}
          {title}
        </CardDescription>
        <CardTitle className="text-2xl font-semibold tabular-nums @[250px]/card:text-3xl">
          {value}
        </CardTitle>
        <CardAction>
          <Badge variant="outline" className="gap-1">
            <TrendIcon className="size-3" />
            {isPositive ? '+' : ''}{trend}%
          </Badge>
        </CardAction>
      </CardHeader>
      <CardFooter className="flex-col items-start gap-1.5 text-sm">
        <div className="line-clamp-1 flex gap-2 font-medium">
          {trendLabel} <TrendIcon className="size-4" />
        </div>
        <div className="text-muted-foreground">
          {description}
        </div>
      </CardFooter>
    </Card>
  );
}

interface SectionCardsProps {
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

export function SectionCards({ stats }: SectionCardsProps) {
  const defaultStats = {
    totalShipments: 1250,
    activeCustomers: 456,
    pendingInvoices: 23,
    warehouseCapacity: 78,
    shipmentsTrend: 12.5,
    customersTrend: 8.2,
    invoicesTrend: -5.3,
    capacityTrend: 3.1,
  };

  const data = stats || defaultStats;

  return (
    <div className="*:data-[slot=card]:from-primary/5 *:data-[slot=card]:to-card dark:*:data-[slot=card]:bg-card grid grid-cols-1 gap-4 px-4 *:data-[slot=card]:bg-gradient-to-t *:data-[slot=card]:shadow-xs lg:px-6 @xl/main:grid-cols-2 @5xl/main:grid-cols-4">
      <SectionCard
        title="Total Shipments"
        value={data.totalShipments.toLocaleString()}
        description="Active shipments this month"
        trend={data.shipmentsTrend}
        trendLabel={data.shipmentsTrend >= 0 ? 'Trending up this month' : 'Trending down this month'}
        icon={<Package className="size-4" />}
      />
      <SectionCard
        title="Active Customers"
        value={data.activeCustomers.toLocaleString()}
        description="Customers with recent orders"
        trend={data.customersTrend}
        trendLabel={data.customersTrend >= 0 ? 'Customer base growing' : 'Needs attention'}
        icon={<Users className="size-4" />}
      />
      <SectionCard
        title="Pending Invoices"
        value={data.pendingInvoices.toLocaleString()}
        description="Awaiting payment"
        trend={data.invoicesTrend}
        trendLabel={data.invoicesTrend >= 0 ? 'More pending' : 'Fewer pending'}
        icon={<FileText className="size-4" />}
      />
      <SectionCard
        title="Warehouse Capacity"
        value={`${data.warehouseCapacity}%`}
        description="Current utilization"
        trend={data.capacityTrend}
        trendLabel={data.capacityTrend >= 0 ? 'Utilization increasing' : 'More space available'}
        icon={<Warehouse className="size-4" />}
      />
    </div>
  );
}

export default SectionCards;
