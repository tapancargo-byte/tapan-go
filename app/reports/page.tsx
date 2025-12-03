'use client';

import { useEffect, useState } from 'react';
import { DashboardLayout } from '@/components/dashboard/layout';
import ProcessorIcon from '@/components/icons/proccesor';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { EmptyState } from '@/components/ui/empty-state';
import { Skeleton } from '@/components/ui/skeleton';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, LineChart, Line, PieChart, Pie, Cell } from 'recharts';
import { ChartContainer, ChartTooltip, ChartTooltipContent } from '@/components/ui/chart';
import { supabase } from '@/lib/supabaseClient';

const revenueData = [
  { month: 'Jan', revenue: 45000, shipments: 320 },
  { month: 'Feb', revenue: 52000, shipments: 380 },
  { month: 'Mar', revenue: 48000, shipments: 360 },
  { month: 'Apr', revenue: 61000, shipments: 420 },
  { month: 'May', revenue: 55000, shipments: 410 },
  { month: 'Jun', revenue: 67000, shipments: 470 },
];

// Using CSS custom properties for chart colors (oklch-based)
const CHART_COLORS = {
  brand: 'oklch(0.75 0.18 45)',      // Brand orange
  blue: 'oklch(0.65 0.18 255)',     // Accent blue
  green: 'oklch(0.72 0.17 145)',    // Success green
  amber: 'oklch(0.77 0.19 70)',     // Warning amber
  red: 'oklch(0.62 0.22 30)',       // Destructive red
  purple: 'oklch(0.60 0.22 300)',   // Accent purple
};

const warehouseData = [
  { name: 'Imphal', value: 60, fill: CHART_COLORS.brand },
  { name: 'Delhi', value: 40, fill: CHART_COLORS.blue },
];

const performanceData = [
  { week: 'Week 1', onTime: 95, delayed: 5 },
  { week: 'Week 2', onTime: 98, delayed: 2 },
  { week: 'Week 3', onTime: 94, delayed: 6 },
  { week: 'Week 4', onTime: 97, delayed: 3 },
];

export default function ReportsPage() {
  const [warehouseDistribution, setWarehouseDistribution] = useState(warehouseData);
  const [loadingWarehouse, setLoadingWarehouse] = useState(false);

  useEffect(() => {
    let cancelled = false;

    async function loadWarehouseDistribution() {
      setLoadingWarehouse(true);
      try {
        const { data, error } = await supabase
          .from('warehouses')
          .select('name, location, items_stored, items_in_transit');

        if (error || !data) {
          console.warn('Supabase warehouses analytics error', error?.message);
          return;
        }

        const buckets: { Imphal: number; Delhi: number } = { Imphal: 0, Delhi: 0 };

        (data as any[]).forEach((row) => {
          const name = ((row.name as string | null) ?? '').toLowerCase();
          const location = ((row.location as string | null) ?? '').toLowerCase();
          const load =
            Number(row.items_stored ?? 0) + Number(row.items_in_transit ?? 0);

          if (!load) return;

          if (name.includes('imphal') || location.includes('imphal')) {
            buckets.Imphal += load;
          } else if (
            name.includes('delhi') ||
            name.includes('new delhi') ||
            location.includes('delhi') ||
            location.includes('new delhi')
          ) {
            buckets.Delhi += load;
          }
        });

        const total = buckets.Imphal + buckets.Delhi;
        if (!total) return;

        const next = [
          {
            name: 'Imphal',
            value: Math.round((buckets.Imphal / total) * 100),
            fill: CHART_COLORS.brand,
          },
          {
            name: 'Delhi',
            value: Math.round((buckets.Delhi / total) * 100),
            fill: CHART_COLORS.blue,
          },
        ];

        if (!cancelled) {
          setWarehouseDistribution(next);
        }
      } catch (err) {
        console.error('Failed to load warehouse distribution', err);
      } finally {
        if (!cancelled) {
          setLoadingWarehouse(false);
        }
      }
    }

    void loadWarehouseDistribution();

    return () => {
      cancelled = true;
    };
  }, []);

  return (
    <DashboardLayout
      header={{
        title: 'Reports & Analytics',
        description: 'View comprehensive logistics performance metrics and business intelligence',
        icon: ProcessorIcon,
      }}
    >
      <div className="space-y-6">
        <Tabs defaultValue="overview" className="w-full">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="revenue">Revenue</TabsTrigger>
            <TabsTrigger value="warehouse">Warehouse</TabsTrigger>
            <TabsTrigger value="performance">Performance</TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="space-y-4">
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="text-sm font-medium">Total Revenue</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">₹328,000</div>
                  <p className="text-xs text-muted-foreground mt-1">+12% from last month</p>
                </CardContent>
              </Card>
              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="text-sm font-medium">Total Shipments</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">2,360</div>
                  <p className="text-xs text-muted-foreground mt-1">+8% from last month</p>
                </CardContent>
              </Card>
              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="text-sm font-medium">Avg Delivery Time</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">2.4 days</div>
                  <p className="text-xs text-muted-foreground mt-1">-0.2 days improvement</p>
                </CardContent>
              </Card>
              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="text-sm font-medium">On-Time Rate</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">96%</div>
                  <p className="text-xs text-muted-foreground mt-1">+2% from last month</p>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="revenue" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Revenue & Shipments Trend</CardTitle>
                <CardDescription>Monthly revenue and shipment volume</CardDescription>
              </CardHeader>
              <CardContent>
                <ChartContainer
                  config={{
                    revenue: { label: 'Revenue', color: CHART_COLORS.brand },
                    shipments: { label: 'Shipments', color: CHART_COLORS.blue },
                  }}
                  className="h-80"
                >
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={revenueData}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="month" />
                      <YAxis yAxisId="left" />
                      <YAxis yAxisId="right" orientation="right" />
                      <Tooltip />
                      <Legend />
                      <Bar yAxisId="left" dataKey="revenue" fill={CHART_COLORS.brand} name="Revenue (₹)" />
                      <Bar yAxisId="right" dataKey="shipments" fill={CHART_COLORS.blue} name="Shipments" />
                    </BarChart>
                  </ResponsiveContainer>
                </ChartContainer>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="warehouse" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Warehouse Distribution</CardTitle>
                <CardDescription>Cargo distribution across warehouses</CardDescription>
              </CardHeader>
              <CardContent>
                {loadingWarehouse ? (
                  <div className="grid gap-8 md:grid-cols-2">
                    <div className="space-y-4">
                      <Skeleton className="h-6 w-32" />
                      <Skeleton className="h-64 w-full" />
                    </div>
                    <div className="space-y-3">
                      {Array.from({ length: 2 }).map((_, index) => (
                        <div
                          key={`warehouse-skeleton-${index}`}
                          className="flex items-center justify-between p-3 rounded-lg bg-muted"
                        >
                          <div className="flex items-center gap-2">
                            <Skeleton className="h-3 w-3 rounded-full" />
                            <Skeleton className="h-4 w-20" />
                          </div>
                          <Skeleton className="h-6 w-10" />
                        </div>
                      ))}
                    </div>
                  </div>
                ) : warehouseDistribution.length ? (
                  <div className="grid gap-8 md:grid-cols-2">
                    <ChartContainer
                      config={{
                        Imphal: { label: 'Imphal', color: CHART_COLORS.brand },
                        Delhi: { label: 'Delhi', color: CHART_COLORS.blue },
                      }}
                      className="h-80"
                    >
                      <ResponsiveContainer width="100%" height="100%">
                        <PieChart>
                          <Pie
                            data={warehouseDistribution}
                            cx="50%"
                            cy="50%"
                            labelLine={false}
                            label={({ name, value }) => `${name} ${value}%`}
                            outerRadius={80}
                            fill="#8884d8"
                            dataKey="value"
                          >
                            {warehouseDistribution.map((entry, index) => (
                              <Cell key={`cell-${index}`} fill={entry.fill} />
                            ))}
                          </Pie>
                          <Tooltip />
                        </PieChart>
                      </ResponsiveContainer>
                    </ChartContainer>
                    <div className="space-y-3">
                      {warehouseDistribution.map((warehouse) => (
                        <div
                          key={warehouse.name}
                          className="flex items-center justify-between p-3 rounded-lg bg-muted"
                        >
                          <div className="flex items-center gap-2">
                            <div
                              className="w-3 h-3 rounded-full"
                              style={{ backgroundColor: warehouse.fill }}
                            />
                            <span className="font-medium">{warehouse.name}</span>
                          </div>
                          <span className="text-2xl font-bold">{warehouse.value}%</span>
                        </div>
                      ))}
                    </div>
                  </div>
                ) : (
                  <EmptyState
                    variant="default"
                    title="No warehouse analytics yet"
                    description="Once your Imphal and Delhi warehouses start processing cargo, distribution will appear here."
                  />
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="performance" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>On-Time Delivery Performance</CardTitle>
                <CardDescription>Weekly on-time vs delayed shipments</CardDescription>
              </CardHeader>
              <CardContent>
                <ChartContainer
                  config={{
                    onTime: { label: 'On-Time', color: CHART_COLORS.green },
                    delayed: { label: 'Delayed', color: CHART_COLORS.red },
                  }}
                  className="h-80"
                >
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={performanceData}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="week" />
                      <YAxis />
                      <Tooltip />
                      <Legend />
                      <Line type="monotone" dataKey="onTime" stroke={CHART_COLORS.green} strokeWidth={2} name="On-Time %" />
                      <Line type="monotone" dataKey="delayed" stroke={CHART_COLORS.red} strokeWidth={2} name="Delayed %" />
                    </LineChart>
                  </ResponsiveContainer>
                </ChartContainer>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </DashboardLayout>
  );
}
