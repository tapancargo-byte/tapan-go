'use client';

import { TrendingUp } from 'lucide-react';
import { Bar, BarChart, CartesianGrid, XAxis } from 'recharts';

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
  ChartLegend,
  ChartLegendContent,
  ChartTooltip,
  ChartTooltipContent,
} from '@/components/ui/chart';

const chartData = [
  { month: 'January', inbound: 186, outbound: 80 },
  { month: 'February', inbound: 305, outbound: 200 },
  { month: 'March', inbound: 237, outbound: 120 },
  { month: 'April', inbound: 73, outbound: 190 },
  { month: 'May', inbound: 209, outbound: 130 },
  { month: 'June', inbound: 214, outbound: 140 },
];

const chartConfig = {
  inbound: {
    label: 'Inbound',
    color: 'hsl(var(--chart-1))',
  },
  outbound: {
    label: 'Outbound',
    color: 'hsl(var(--chart-2))',
  },
} satisfies ChartConfig;

interface BarChartStackedProps {
  className?: string;
  data?: typeof chartData;
  title?: string;
  description?: string;
}

export function BarChartStacked({
  className,
  data = chartData,
  title = 'Warehouse Activity',
  description = 'Inbound vs Outbound shipments',
}: BarChartStackedProps) {
  return (
    <Card className={className}>
      <CardHeader>
        <CardTitle>{title}</CardTitle>
        <CardDescription>{description}</CardDescription>
      </CardHeader>
      <CardContent>
        <ChartContainer config={chartConfig} className="h-[250px] w-full">
          <BarChart accessibilityLayer data={data}>
            <CartesianGrid vertical={false} />
            <XAxis
              dataKey="month"
              tickLine={false}
              tickMargin={10}
              axisLine={false}
              tickFormatter={(value: string) => value.slice(0, 3)}
            />
            <ChartTooltip content={<ChartTooltipContent hideLabel />} />
            <ChartLegend content={<ChartLegendContent />} />
            <Bar
              dataKey="inbound"
              stackId="a"
              fill="var(--color-inbound)"
              radius={[0, 0, 4, 4]}
            />
            <Bar
              dataKey="outbound"
              stackId="a"
              fill="var(--color-outbound)"
              radius={[4, 4, 0, 0]}
            />
          </BarChart>
        </ChartContainer>
      </CardContent>
      <CardFooter className="flex-col items-start gap-2 text-sm">
        <div className="flex gap-2 font-medium leading-none">
          Trending up by 5.2% this month <TrendingUp className="h-4 w-4" />
        </div>
        <div className="leading-none text-muted-foreground">
          Showing warehouse activity for the last 6 months
        </div>
      </CardFooter>
    </Card>
  );
}

export default BarChartStacked;
