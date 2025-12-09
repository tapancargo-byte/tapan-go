'use client';

import { TrendingUp } from 'lucide-react';
import { Area, AreaChart, CartesianGrid, XAxis, YAxis } from 'recharts';

import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import {
  ChartConfig,
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from '@/components/ui/chart';

const chartData = [
  { month: 'January', shipments: 186, delivered: 150 },
  { month: 'February', shipments: 305, delivered: 280 },
  { month: 'March', shipments: 237, delivered: 210 },
  { month: 'April', shipments: 173, delivered: 160 },
  { month: 'May', shipments: 209, delivered: 195 },
  { month: 'June', shipments: 314, delivered: 290 },
];

const chartConfig = {
  shipments: {
    label: 'Shipments',
    color: 'hsl(var(--chart-1))',
  },
  delivered: {
    label: 'Delivered',
    color: 'hsl(var(--chart-2))',
  },
} satisfies ChartConfig;

interface AreaChartGradientProps {
  className?: string;
  data?: typeof chartData;
  title?: string;
  description?: string;
}

export function AreaChartGradient({
  className,
  data = chartData,
  title = 'Shipment Activity',
  description = 'Showing shipments for the last 6 months',
}: AreaChartGradientProps) {
  return (
    <Card className={className}>
      <CardHeader>
        <CardTitle>{title}</CardTitle>
        <CardDescription>{description}</CardDescription>
      </CardHeader>
      <CardContent>
        <ChartContainer config={chartConfig} className="h-[250px] w-full">
          <AreaChart
            accessibilityLayer
            data={data}
            margin={{
              left: 12,
              right: 12,
            }}
          >
            <CartesianGrid vertical={false} />
            <XAxis
              dataKey="month"
              tickLine={false}
              axisLine={false}
              tickMargin={8}
              tickFormatter={(value: string) => value.slice(0, 3)}
            />
            <ChartTooltip cursor={false} content={<ChartTooltipContent />} />
            <defs>
              <linearGradient id="fillShipments" x1="0" y1="0" x2="0" y2="1">
                <stop
                  offset="5%"
                  stopColor="var(--color-shipments)"
                  stopOpacity={0.8}
                />
                <stop
                  offset="95%"
                  stopColor="var(--color-shipments)"
                  stopOpacity={0.1}
                />
              </linearGradient>
              <linearGradient id="fillDelivered" x1="0" y1="0" x2="0" y2="1">
                <stop
                  offset="5%"
                  stopColor="var(--color-delivered)"
                  stopOpacity={0.8}
                />
                <stop
                  offset="95%"
                  stopColor="var(--color-delivered)"
                  stopOpacity={0.1}
                />
              </linearGradient>
            </defs>
            <Area
              dataKey="delivered"
              type="natural"
              fill="url(#fillDelivered)"
              fillOpacity={0.4}
              stroke="var(--color-delivered)"
              stackId="a"
            />
            <Area
              dataKey="shipments"
              type="natural"
              fill="url(#fillShipments)"
              fillOpacity={0.4}
              stroke="var(--color-shipments)"
              stackId="a"
            />
          </AreaChart>
        </ChartContainer>
      </CardContent>
      <CardFooter>
        <div className="flex w-full items-start gap-2 text-sm">
          <div className="grid gap-2">
            <div className="flex items-center gap-2 font-medium leading-none">
              Trending up by 5.2% this month <TrendingUp className="h-4 w-4" />
            </div>
            <div className="flex items-center gap-2 leading-none text-muted-foreground">
              January - June 2024
            </div>
          </div>
        </div>
      </CardFooter>
    </Card>
  );
}

export default AreaChartGradient;
