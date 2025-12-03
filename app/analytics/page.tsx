"use client";

import { useEffect, useState } from "react";
import DashboardPageLayout from "@/components/dashboard/layout";
import AtomIcon from "@/components/icons/atom";
import DashboardCard from "@/components/dashboard/card";
import DashboardChart from "@/components/dashboard/chart";
import { Card } from "@/components/ui/card";
import { EmptyState } from "@/components/ui/empty-state";
import { Skeleton } from "@/components/ui/skeleton";
import { supabase } from "@/lib/supabaseClient";
import type { ChartData, ChartDataPoint } from "@/types/dashboard";
import { format, subDays, subYears } from "date-fns";

interface ShipmentEvent {
  created_at: string;
  weight: number;
  status: string;
}

interface InvoiceEvent {
  invoice_date: string;
  amount: number;
}

interface AnalyticsStats {
  last30Shipments: number;
  last30Revenue: number;
  deliveredRate: number;
}

const createEmptyChartData = (): ChartData => ({
  week: [],
  month: [],
  year: [],
});

const formatDayLabel = (date: Date) => format(date, "dd MMM");
const formatMonthLabel = (date: Date) => format(date, "MMM yy");

const getDayKey = (date: Date) => format(date, "yyyy-MM-dd");
const getMonthKey = (date: Date) => format(date, "yyyy-MM");

export default function AnalyticsPage() {
  const [chartData, setChartData] = useState<ChartData | null>(null);
  const [stats, setStats] = useState<AnalyticsStats | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;

    async function loadAnalytics() {
      setLoading(true);
      try {
        const now = new Date();
        const yearAgo = subYears(now, 1);

        const [shipmentsRes, invoicesRes] = await Promise.all([
          supabase
            .from("shipments")
            .select("created_at, weight, status")
            .gte("created_at", yearAgo.toISOString()),
          supabase
            .from("invoices")
            .select("invoice_date, amount, status")
            .gte("invoice_date", yearAgo.toISOString()),
        ]);

        if (shipmentsRes.error) {
          console.warn(
            "Supabase shipments analytics error",
            shipmentsRes.error.message
          );
          throw shipmentsRes.error;
        }

        if (invoicesRes.error) {
          console.warn(
            "Supabase invoices analytics error",
            invoicesRes.error.message
          );
          throw invoicesRes.error;
        }

        const shipmentEvents: ShipmentEvent[] = ((shipmentsRes.data as any[]) ?? []).map(
          (row) => ({
            created_at: row.created_at as string,
            weight: Number(row.weight ?? 0),
            status: (row.status as string | null) ?? "pending",
          })
        );

        const invoiceEvents: InvoiceEvent[] = ((invoicesRes.data as any[]) ?? []).map(
          (row) => ({
            invoice_date: (row.invoice_date as string | null) ?? "",
            amount: Number(row.amount ?? 0),
          })
        ).filter((ev) => !!ev.invoice_date);

        const shipmentsByDay = new Map<
          string,
          { count: number; totalWeight: number }
        >();
        const revenueByDay = new Map<string, number>();

        shipmentEvents.forEach((ev) => {
          const d = new Date(ev.created_at);
          if (Number.isNaN(d.getTime())) return;
          const key = getDayKey(d);
          const current = shipmentsByDay.get(key) ?? {
            count: 0,
            totalWeight: 0,
          };
          shipmentsByDay.set(key, {
            count: current.count + 1,
            totalWeight: current.totalWeight + ev.weight,
          });
        });

        invoiceEvents.forEach((ev) => {
          const d = new Date(ev.invoice_date);
          if (Number.isNaN(d.getTime())) return;
          const key = getDayKey(d);
          const current = revenueByDay.get(key) ?? 0;
          revenueByDay.set(key, current + ev.amount);
        });

        const buildDaySeries = (days: number): ChartDataPoint[] => {
          const series: ChartDataPoint[] = [];
          for (let i = days - 1; i >= 0; i--) {
            const d = subDays(now, i);
            const key = getDayKey(d);
            const shipments = shipmentsByDay.get(key);
            const revenue = revenueByDay.get(key) ?? 0;

            const distance = shipments?.totalWeight ?? 0; // using weight as distance proxy

            series.push({
              date: formatDayLabel(d),
              revenue,
              shipments: shipments?.count ?? 0,
              distance,
            });
          }
          return series;
        };

        const shipmentsByMonth = new Map<
          string,
          { count: number; totalWeight: number }
        >();
        const revenueByMonth = new Map<string, number>();

        shipmentEvents.forEach((ev) => {
          const d = new Date(ev.created_at);
          if (Number.isNaN(d.getTime())) return;
          const key = getMonthKey(d);
          const current = shipmentsByMonth.get(key) ?? {
            count: 0,
            totalWeight: 0,
          };
          shipmentsByMonth.set(key, {
            count: current.count + 1,
            totalWeight: current.totalWeight + ev.weight,
          });
        });

        invoiceEvents.forEach((ev) => {
          const d = new Date(ev.invoice_date);
          if (Number.isNaN(d.getTime())) return;
          const key = getMonthKey(d);
          const current = revenueByMonth.get(key) ?? 0;
          revenueByMonth.set(key, current + ev.amount);
        });

        const buildMonthSeries = (months: number): ChartDataPoint[] => {
          const series: ChartDataPoint[] = [];
          for (let i = months - 1; i >= 0; i--) {
            const d = subYears(now, 0);
            d.setMonth(d.getMonth() - i);
            const key = getMonthKey(d);
            const shipments = shipmentsByMonth.get(key);
            const revenue = revenueByMonth.get(key) ?? 0;
            const distance = shipments?.totalWeight ?? 0;

            series.push({
              date: formatMonthLabel(d),
              revenue,
              shipments: shipments?.count ?? 0,
              distance,
            });
          }
          return series;
        };

        const weekSeries = buildDaySeries(7);
        const monthSeries = buildDaySeries(30);
        const yearSeries = buildMonthSeries(12);

        let last30Shipments = 0;
        let last30Revenue = 0;
        monthSeries.forEach((point) => {
          last30Shipments += point.shipments;
          last30Revenue += point.revenue;
        });

        const totalShipments = shipmentEvents.length;
        const deliveredShipments = shipmentEvents.filter(
          (s) => s.status === "delivered"
        ).length;
        const deliveredRate =
          totalShipments > 0
            ? Math.round((deliveredShipments / totalShipments) * 100)
            : 0;

        if (cancelled) return;

        setChartData({
          week: weekSeries,
          month: monthSeries,
          year: yearSeries,
        });

        setStats({
          last30Shipments,
          last30Revenue,
          deliveredRate,
        });

        setLoading(false);
      } catch (err) {
        if (cancelled) return;
        console.error("Failed to load analytics", err);
        setChartData(createEmptyChartData());
        setStats({ last30Shipments: 0, last30Revenue: 0, deliveredRate: 0 });
        setLoading(false);
      }
    }

    loadAnalytics();

    return () => {
      cancelled = true;
    };
  }, []);

  return (
    <DashboardPageLayout
      header={{
        title: "Network Analytics",
        description: "Operational and financial KPIs for Tapan Go",
        icon: AtomIcon,
      }}
    >
      <div className="flex flex-col gap-6">
        {/* KPI Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <DashboardCard
            title="Shipments (last 30 days)"
            intent="default"
            className="bg-background border-pop"
          >
            <div className="flex flex-col justify-between h-full">
              {loading ? (
                <Skeleton className="h-8 w-24" />
              ) : (
                <p className="text-3xl font-semibold text-primary">
                  {stats ? stats.last30Shipments.toLocaleString("en-IN") : "—"}
                </p>
              )}
              <p className="text-xs text-muted-foreground mt-2">
                Total shipments created in the last 30 days.
              </p>
            </div>
          </DashboardCard>

          <DashboardCard
            title="Revenue (last 30 days)"
            intent="success"
            className="bg-background border-pop"
          >
            <div className="flex flex-col justify-between h-full">
              {loading ? (
                <Skeleton className="h-8 w-32" />
              ) : (
                <p className="text-3xl font-semibold text-primary">
                  {stats
                    ? `₹${stats.last30Revenue.toLocaleString("en-IN")}`
                    : "—"}
                </p>
              )}
              <p className="text-xs text-muted-foreground mt-2">
                Billed invoice amount captured in the last 30 days.
              </p>
            </div>
          </DashboardCard>

          <DashboardCard
            title="Delivered share"
            intent="success"
            className="bg-background border-pop"
          >
            <div className="flex flex-col justify-between h-full">
              {loading ? (
                <Skeleton className="h-8 w-20" />
              ) : (
                <p className="text-3xl font-semibold text-primary">
                  {stats ? `${stats.deliveredRate}%` : "—"}
                </p>
              )}
              <p className="text-xs text-muted-foreground mt-2">
                Share of shipments with status marked as delivered.
              </p>
            </div>
          </DashboardCard>
        </div>

        {/* Time-series Chart */}
        <Card className="border-pop bg-background p-4">
          {loading ? (
            <div className="space-y-4">
              <Skeleton className="h-6 w-32" />
              <Skeleton className="h-64 w-full" />
            </div>
          ) : chartData && chartData.week.length > 0 ? (
            <DashboardChart data={chartData} />
          ) : (
            <EmptyState
              variant="default"
              title="No analytics data yet"
              description="Create shipments and invoices to see trends for the network."
            />
          )}
        </Card>
      </div>
    </DashboardPageLayout>
  );
}
