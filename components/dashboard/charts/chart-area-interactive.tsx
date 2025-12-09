'use client';

import * as React from 'react';
import { Area, AreaChart, CartesianGrid, XAxis } from 'recharts';
import {
  Card,
  CardAction,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import {
  ChartConfig,
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from '@/components/ui/chart';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  ToggleGroup,
  ToggleGroupItem,
} from '@/components/ui/toggle-group';

// Generate sample shipment data for the last 90 days
function generateChartData() {
  const data = [];
  const now = new Date();
  
  for (let i = 90; i >= 0; i--) {
    const date = new Date(now);
    date.setDate(date.getDate() - i);
    
    data.push({
      date: date.toISOString().split('T')[0],
      shipments: Math.floor(Math.random() * 150) + 50,
      delivered: Math.floor(Math.random() * 120) + 40,
    });
  }
  
  return data;
}

const chartData = generateChartData();

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

interface ChartAreaInteractiveProps {
  className?: string;
  data?: typeof chartData;
}

export function ChartAreaInteractive({ className, data = chartData }: ChartAreaInteractiveProps) {
  const [timeRange, setTimeRange] = React.useState('90d');
  const [isMobile, setIsMobile] = React.useState(false);

  React.useEffect(() => {
    const checkMobile = () => setIsMobile(window.innerWidth < 768);
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  React.useEffect(() => {
    if (isMobile) {
      setTimeRange('7d');
    }
  }, [isMobile]);

  const filteredData = React.useMemo(() => {
    const now = new Date();
    let daysToSubtract = 90;
    
    if (timeRange === '30d') {
      daysToSubtract = 30;
    } else if (timeRange === '7d') {
      daysToSubtract = 7;
    }
    
    const startDate = new Date(now);
    startDate.setDate(startDate.getDate() - daysToSubtract);
    
    return data.filter((item) => {
      const date = new Date(item.date);
      return date >= startDate;
    });
  }, [data, timeRange]);

  return (
    <Card className={`@container/card ${className || ''}`}>
      <CardHeader>
        <CardTitle>Shipment Activity</CardTitle>
        <CardDescription>
          <span className="hidden @[540px]/card:block">
            Total shipments and deliveries for the selected period
          </span>
          <span className="@[540px]/card:hidden">Shipment trends</span>
        </CardDescription>
        <CardAction>
          <ToggleGroup
            type="single"
            value={timeRange}
            onValueChange={(value) => value && setTimeRange(value)}
            variant="outline"
            className="hidden *:data-[slot=toggle-group-item]:!px-4 @[767px]/card:flex"
          >
            <ToggleGroupItem value="90d">Last 3 months</ToggleGroupItem>
            <ToggleGroupItem value="30d">Last 30 days</ToggleGroupItem>
            <ToggleGroupItem value="7d">Last 7 days</ToggleGroupItem>
          </ToggleGroup>
          <Select value={timeRange} onValueChange={setTimeRange}>
            <SelectTrigger
              className="flex w-40 @[767px]/card:hidden"
              aria-label="Select time range"
            >
              <SelectValue placeholder="Last 3 months" />
            </SelectTrigger>
            <SelectContent className="rounded-xl">
              <SelectItem value="90d" className="rounded-lg">
                Last 3 months
              </SelectItem>
              <SelectItem value="30d" className="rounded-lg">
                Last 30 days
              </SelectItem>
              <SelectItem value="7d" className="rounded-lg">
                Last 7 days
              </SelectItem>
            </SelectContent>
          </Select>
        </CardAction>
      </CardHeader>
      <CardContent className="px-2 pt-4 sm:px-6 sm:pt-6">
        <ChartContainer
          config={chartConfig}
          className="aspect-auto h-[250px] w-full"
        >
          <AreaChart data={filteredData}>
            <defs>
              <linearGradient id="fillShipments" x1="0" y1="0" x2="0" y2="1">
                <stop
                  offset="5%"
                  stopColor="var(--color-shipments)"
                  stopOpacity={1.0}
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
            <CartesianGrid vertical={false} />
            <XAxis
              dataKey="date"
              tickLine={false}
              axisLine={false}
              tickMargin={8}
              minTickGap={32}
              tickFormatter={(value: string) => {
                const date = new Date(value);
                return date.toLocaleDateString('en-US', {
                  month: 'short',
                  day: 'numeric',
                });
              }}
            />
            <ChartTooltip
              cursor={false}
              content={
                <ChartTooltipContent
                  labelFormatter={(value) => {
                    if (typeof value === 'string') {
                      return new Date(value).toLocaleDateString('en-US', {
                        month: 'short',
                        day: 'numeric',
                      });
                    }
                    return String(value);
                  }}
                  indicator="dot"
                />
              }
            />
            <Area
              dataKey="delivered"
              type="natural"
              fill="url(#fillDelivered)"
              stroke="var(--color-delivered)"
              stackId="a"
            />
            <Area
              dataKey="shipments"
              type="natural"
              fill="url(#fillShipments)"
              stroke="var(--color-shipments)"
              stackId="a"
            />
          </AreaChart>
        </ChartContainer>
      </CardContent>
    </Card>
  );
}

export default ChartAreaInteractive;
