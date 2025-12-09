'use client';

import { TrendingUp } from 'lucide-react';
import {
  Label,
  PolarGrid,
  PolarRadiusAxis,
  RadialBar,
  RadialBarChart,
} from 'recharts';

import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { ChartConfig, ChartContainer } from '@/components/ui/chart';

interface RadialChartShapeProps {
  className?: string;
  value: number;
  maxValue?: number;
  title?: string;
  description?: string;
  label?: string;
  color?: string;
}

export function RadialChartShape({
  className,
  value,
  maxValue = 100,
  title = 'Capacity',
  description = 'Current utilization',
  label = 'Used',
  color = 'hsl(var(--chart-2))',
}: RadialChartShapeProps) {
  // Calculate the end angle based on the percentage
  const percentage = Math.min((value / maxValue) * 100, 100);
  const endAngle = 90 + (percentage / 100) * 360;

  const chartData = [
    { name: label, value: value, fill: color },
  ];

  const chartConfig = {
    value: {
      label: label,
      color: color,
    },
  } satisfies ChartConfig;

  return (
    <Card className={`flex flex-col ${className || ''}`}>
      <CardHeader className="items-center pb-0">
        <CardTitle>{title}</CardTitle>
        <CardDescription>{description}</CardDescription>
      </CardHeader>
      <CardContent className="flex-1 pb-0">
        <ChartContainer
          config={chartConfig}
          className="mx-auto aspect-square max-h-[250px]"
        >
          <RadialBarChart
            data={chartData}
            startAngle={90}
            endAngle={endAngle}
            innerRadius={80}
            outerRadius={110}
          >
            <PolarGrid
              gridType="circle"
              radialLines={false}
              stroke="none"
              className="first:fill-muted last:fill-background"
              polarRadius={[86, 74]}
            />
            <RadialBar dataKey="value" background cornerRadius={10} />
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
                          className="fill-foreground text-4xl font-bold"
                        >
                          {value.toLocaleString()}
                        </tspan>
                        <tspan
                          x={viewBox.cx}
                          y={(viewBox.cy || 0) + 24}
                          className="fill-muted-foreground"
                        >
                          {label}
                        </tspan>
                      </text>
                    );
                  }
                }}
              />
            </PolarRadiusAxis>
          </RadialBarChart>
        </ChartContainer>
      </CardContent>
      <CardFooter className="flex-col gap-2 text-sm">
        <div className="flex items-center gap-2 font-medium leading-none">
          {percentage.toFixed(1)}% of capacity <TrendingUp className="h-4 w-4" />
        </div>
        <div className="leading-none text-muted-foreground">
          {maxValue - value} remaining
        </div>
      </CardFooter>
    </Card>
  );
}

export default RadialChartShape;
