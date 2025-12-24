"use client";

import * as React from "react";
import {
  Wallet,
  CheckCircle2,
  Clock,
  AlertTriangle,
  TrendingUp,
  TrendingDown,
} from "lucide-react";
import { Label, Pie, PieChart } from "recharts";

import { cn } from "@/lib/utils";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
  type ChartConfig,
} from "@/components/ui/chart";
import type { ARSummary } from "@/features/invoices/types";

interface ArSummaryCardsProps {
  arSummary: ARSummary;
}

// Summary metric card using shadcn Card
function MetricCard({
  title,
  value,
  icon: Icon,
  description,
  trend,
  variant = "default",
}: {
  title: string;
  value: number;
  icon: React.ElementType;
  description?: string;
  trend?: "up" | "down";
  variant?: "default" | "success" | "warning" | "danger";
}) {
  const variants = {
    default: "border-l-4 border-l-primary bg-primary/5",
    success: "border-l-4 border-l-emerald-500 bg-emerald-500/5",
    warning: "border-l-4 border-l-amber-500 bg-amber-500/5",
    danger: "border-l-4 border-l-red-500 bg-red-500/5",
  };

  const iconColors = {
    default: "text-primary",
    success: "text-emerald-500",
    warning: "text-amber-500",
    danger: "text-red-500",
  };

  return (
    <Card className={cn("glass-card border-t-0 border-r-0 border-b-0 shadow-lg", variants[variant])}>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardDescription className="text-sm font-medium text-muted-foreground/80 lowercase tracking-wide first-letter:uppercase">
          {title}
        </CardDescription>
        <div className={cn("p-2 rounded-lg bg-background/50 backdrop-blur-sm", iconColors[variant])}>
          <Icon className="h-4 w-4" />
        </div>
      </CardHeader>
      <CardContent>
        <div className="text-3xl font-display font-bold tracking-tight text-foreground drop-shadow-sm">
          ₹{value.toLocaleString("en-IN")}
        </div>
        {description && (
          <p className="text-xs text-muted-foreground flex items-center gap-1 mt-2 font-medium">
            {trend === "up" && <TrendingUp className="h-3 w-3 text-emerald-500" />}
            {trend === "down" && <TrendingDown className="h-3 w-3 text-red-500" />}
            {description}
          </p>
        )}
      </CardContent>
    </Card>
  );
}

// Aging chart configuration
const agingChartConfig = {
  amount: {
    label: "Amount",
  },
  current: {
    label: "Current",
    color: "var(--chart-1)",
  },
  days1to30: {
    label: "1-30 Days",
    color: "var(--chart-2)",
  },
  days31to60: {
    label: "31-60 Days",
    color: "var(--chart-3)",
  },
  days61plus: {
    label: "61+ Days",
    color: "var(--chart-4)",
  },
} satisfies ChartConfig;

export function ArSummaryCards({ arSummary }: ArSummaryCardsProps) {
  const aging = arSummary.aging;

  const collectionRate =
    arSummary.totalInvoiced > 0
      ? ((arSummary.totalPaid / arSummary.totalInvoiced) * 100).toFixed(1)
      : "0";

  // Prepare data for the aging donut chart
  const agingChartData = aging
    ? [
      { bucket: "current", amount: aging.current.amount, count: aging.current.count, fill: "var(--color-current)" },
      { bucket: "days1to30", amount: aging.days1to30.amount, count: aging.days1to30.count, fill: "var(--color-days1to30)" },
      { bucket: "days31to60", amount: aging.days31to60.amount, count: aging.days31to60.count, fill: "var(--color-days31to60)" },
      { bucket: "days61plus", amount: aging.days61plus.amount, count: aging.days61plus.count, fill: "var(--color-days61plus)" },
    ]
    : [];

  const totalOutstanding = arSummary.totalOutstanding;

  return (
    <div className="space-y-6">
      {/* Main AR Summary - 4 Metric Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <MetricCard
          title="Total Invoiced"
          value={arSummary.totalInvoiced}
          icon={Wallet}
          variant="default"
        />
        <MetricCard
          title="Total Collected"
          value={arSummary.totalPaid}
          icon={CheckCircle2}
          variant="success"
          description={`${collectionRate}% collection rate`}
          trend="up"
        />
        <MetricCard
          title="Outstanding"
          value={arSummary.totalOutstanding}
          icon={Clock}
          variant="warning"
        />
        <MetricCard
          title="Overdue AR"
          value={arSummary.buckets.overdue.outstanding}
          icon={AlertTriangle}
          variant="danger"
          description={`${arSummary.buckets.overdue.invoiceCount} overdue invoices`}
        />
      </div>

      {/* AR Aging Analysis - Donut Chart + Legend Cards */}
      {aging && (
        <div className="grid gap-4 md:grid-cols-2">
          {/* Donut Chart */}
          <Card className="flex flex-col">
            <CardHeader className="items-center pb-0">
              <CardTitle>AR Aging Analysis</CardTitle>
              <CardDescription>Outstanding by age bucket</CardDescription>
            </CardHeader>
            <CardContent className="flex-1 pb-0">
              <ChartContainer
                config={agingChartConfig}
                className="mx-auto aspect-square max-h-[250px]"
              >
                <PieChart>
                  <ChartTooltip
                    cursor={false}
                    content={<ChartTooltipContent hideLabel />}
                  />
                  <Pie
                    data={agingChartData}
                    dataKey="amount"
                    nameKey="bucket"
                    innerRadius={60}
                    strokeWidth={5}
                  >
                    <Label
                      content={({ viewBox }) => {
                        if (viewBox && "cx" in viewBox && "cy" in viewBox) {
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
                                className="fill-foreground text-2xl font-bold"
                              >
                                ₹{totalOutstanding.toLocaleString("en-IN")}
                              </tspan>
                              <tspan
                                x={viewBox.cx}
                                y={(viewBox.cy || 0) + 24}
                                className="fill-muted-foreground text-sm"
                              >
                                Outstanding
                              </tspan>
                            </text>
                          );
                        }
                      }}
                    />
                  </Pie>
                </PieChart>
              </ChartContainer>
            </CardContent>
            <CardFooter className="flex-col gap-2 text-sm">
              <div className="flex items-center gap-2 font-medium leading-none">
                Total outstanding across all buckets
              </div>
            </CardFooter>
          </Card>

          {/* Aging Breakdown - Clean List Style */}
          <Card>
            <CardHeader>
              <CardTitle>Aging Breakdown</CardTitle>
              <CardDescription>Invoice counts and amounts by age</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* Current */}
              <div className="flex items-center justify-between p-3 rounded-lg border bg-card">
                <div className="flex items-center gap-3">
                  <div className="w-3 h-3 rounded-full bg-emerald-500" />
                  <div>
                    <div className="font-semibold text-card-foreground">Current</div>
                    <div className="text-sm text-muted-foreground">{aging.current.count} invoices</div>
                  </div>
                </div>
                <div className="text-xl font-bold text-card-foreground">
                  ₹{aging.current.amount.toLocaleString("en-IN")}
                </div>
              </div>

              {/* 1-30 Days */}
              <div className="flex items-center justify-between p-3 rounded-lg border bg-card">
                <div className="flex items-center gap-3">
                  <div className="w-3 h-3 rounded-full bg-amber-500" />
                  <div>
                    <div className="font-semibold text-card-foreground">1-30 Days</div>
                    <div className="text-sm text-muted-foreground">{aging.days1to30.count} invoices</div>
                  </div>
                </div>
                <div className="text-xl font-bold text-card-foreground">
                  ₹{aging.days1to30.amount.toLocaleString("en-IN")}
                </div>
              </div>

              {/* 31-60 Days */}
              <div className="flex items-center justify-between p-3 rounded-lg border bg-card">
                <div className="flex items-center gap-3">
                  <div className="w-3 h-3 rounded-full bg-orange-500" />
                  <div>
                    <div className="font-semibold text-card-foreground">31-60 Days</div>
                    <div className="text-sm text-muted-foreground">{aging.days31to60.count} invoices</div>
                  </div>
                </div>
                <div className="text-xl font-bold text-card-foreground">
                  ₹{aging.days31to60.amount.toLocaleString("en-IN")}
                </div>
              </div>

              {/* 61+ Days */}
              <div className="flex items-center justify-between p-3 rounded-lg border bg-card">
                <div className="flex items-center gap-3">
                  <div className="w-3 h-3 rounded-full bg-red-500" />
                  <div>
                    <div className="font-semibold text-card-foreground">61+ Days</div>
                    <div className="text-sm text-muted-foreground">{aging.days61plus.count} invoices</div>
                  </div>
                </div>
                <div className="text-xl font-bold text-card-foreground">
                  ₹{aging.days61plus.amount.toLocaleString("en-IN")}
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
}
