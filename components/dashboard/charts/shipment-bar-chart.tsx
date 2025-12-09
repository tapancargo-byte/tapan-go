'use client';

import { Bar, BarChart, CartesianGrid, XAxis, YAxis, ResponsiveContainer } from 'recharts';
import {
  Card,
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

// Sample data - in production this would come from Supabase
const chartData = [
  { month: 'Jan', shipments: 186, delivered: 165 },
  { month: 'Feb', shipments: 205, delivered: 190 },
  { month: 'Mar', shipments: 237, delivered: 220 },
  { month: 'Apr', shipments: 273, delivered: 255 },
  { month: 'May', shipments: 209, delivered: 195 },
  { month: 'Jun', shipments: 314, delivered: 298 },
  { month: 'Jul', shipments: 278, delivered: 260 },
  { month: 'Aug', shipments: 342, delivered: 320 },
  { month: 'Sep', shipments: 298, delivered: 275 },
  { month: 'Oct', shipments: 356, delivered: 340 },
  { month: 'Nov', shipments: 389, delivered: 365 },
  { month: 'Dec', shipments: 420, delivered: 395 },
];

const chartConfig = {
  shipments: {
    label: 'Total Shipments',
    color: 'hsl(var(--chart-1))',
  },
  delivered: {
    label: 'Delivered',
    color: 'hsl(var(--chart-2))',
  },
} satisfies ChartConfig;

interface ShipmentBarChartProps {
  className?: string;
  data?: typeof chartData;
}

export function ShipmentBarChart({ className, data = chartData }: ShipmentBarChartProps) {
  return (
    <Card className={className}>
      <CardHeader>
        <CardTitle>Shipment Volume</CardTitle>
        <CardDescription>Monthly shipment trends for the current year</CardDescription>
      </CardHeader>
      <CardContent>
        <ChartContainer config={chartConfig} className="h-[300px] w-full">
          <BarChart data={data} accessibilityLayer>
            <CartesianGrid vertical={false} strokeDasharray="3 3" />
            <XAxis
              dataKey="month"
              tickLine={false}
              tickMargin={10}
              axisLine={false}
              tickFormatter={(value) => value.slice(0, 3)}
            />
            <YAxis
              tickLine={false}
              axisLine={false}
              tickFormatter={(value) => `${value}`}
            />
            <ChartTooltip
              cursor={false}
              content={<ChartTooltipContent indicator="dashed" />}
            />
            <Bar dataKey="shipments" fill="var(--color-shipments)" radius={4} />
            <Bar dataKey="delivered" fill="var(--color-delivered)" radius={4} />
          </BarChart>
        </ChartContainer>
      </CardContent>
    </Card>
  );
}

export default ShipmentBarChart;
