import DashboardPageLayout from "@/components/dashboard/layout";
import DashboardStat from "@/components/dashboard/stat";
import DashboardChart from "@/components/dashboard/chart";
import RebelsRanking from "@/components/dashboard/rebels-ranking";
import SecurityStatus from "@/components/dashboard/security-status";
import BracketsIcon from "@/components/icons/brackets";
import GearIcon from "@/components/icons/gear";
import ProcessorIcon from "@/components/icons/proccesor";
import BoomIcon from "@/components/icons/boom";
import type {
  ChartData,
  DashboardStat as DashboardStatType,
  RebelRanking,
  SecurityStatus as SecurityStatusType,
} from "@/types/dashboard";
import { supabaseAdmin } from "@/lib/supabaseAdmin";
import { DashboardAuthOverlay } from "@/components/auth/dashboard-landing-clean";

// Icon mapping
const iconMap = {
  gear: GearIcon,
  proccesor: ProcessorIcon,
  boom: BoomIcon,
};

const formatPercent = (value: number) => `${value.toFixed(1)}%`;

const formatSignedPercent = (value: number) => {
  if (!Number.isFinite(value) || value === 0) return "0%";
  const abs = Math.abs(value).toFixed(1);
  return value > 0 ? `+${abs}%` : `-${abs}%`;
};

const extractNumeric = (value: unknown): number => {
  if (typeof value === "number") return value;
  if (typeof value !== "string") return 0;
  const match = value.match(/-?\d+(?:\.\d+)?/g);
  if (!match) return 0;
  return Number(match.join(""));
};

const computeGrowth = (current?: number, previous?: number): number => {
  if (!current || !previous || previous === 0) return 0;
  return ((current - previous) / previous) * 100;
};

type RevenueTrend = {
  lastYearRevenue: number;
  prevYearRevenue: number;
} | null;

const emptyChartData: ChartData = {
  week: [],
  month: [],
  year: [],
};

async function loadSupabaseRevenueTrend(): Promise<RevenueTrend> {
  try {
    const { data, error } = await supabaseAdmin
      .from("invoices")
      .select("amount, invoice_date");

    if (error || !data) {
      return null;
    }

    const byYear = new Map<number, number>();

    (data as any[]).forEach((row) => {
      const dateStr = row.invoice_date as string | null;
      const amount = Number(row.amount ?? 0);
      if (!dateStr || !amount) return;
      const d = new Date(dateStr);
      if (Number.isNaN(d.getTime())) return;
      const year = d.getFullYear();
      byYear.set(year, (byYear.get(year) ?? 0) + amount);
    });

    const years = Array.from(byYear.keys()).sort((a, b) => a - b);
    if (years.length < 2) return null;

    const lastYearKey = years[years.length - 1];
    const prevYearKey = years[years.length - 2];

    return {
      lastYearRevenue: byYear.get(lastYearKey) ?? 0,
      prevYearRevenue: byYear.get(prevYearKey) ?? 0,
    };
  } catch {
    return null;
  }
}

async function loadSupabaseTopStats(): Promise<DashboardStatType[]> {
  try {
    const now = new Date();
    const startOfYear = new Date(now.getFullYear(), 0, 1);

    const [
      invoiceRes,
      shipmentRes,
      ticketRes,
      warehouseRes,
      inventoryRes,
    ] = await Promise.all([
      supabaseAdmin.from("invoices").select("amount, invoice_date"),
      supabaseAdmin.from("shipments").select("status"),
      supabaseAdmin.from("support_tickets").select("status"),
      supabaseAdmin
        .from("warehouses")
        .select(
          "status, capacity_used, items_stored, items_in_transit, staff_count, dock_count"
        ),
      supabaseAdmin
        .from("inventory_items")
        .select("current_stock, min_stock"),
    ]);

    if (
      invoiceRes.error ||
      shipmentRes.error ||
      ticketRes.error ||
      warehouseRes.error ||
      inventoryRes.error
    ) {
      console.error("Failed to load top stats from Supabase", {
        invoiceError: invoiceRes.error?.message,
        shipmentError: shipmentRes.error?.message,
        ticketError: ticketRes.error?.message,
        warehouseError: warehouseRes.error?.message,
        inventoryError: inventoryRes.error?.message,
      });
      return [];
    }

    const totalRevenue = (invoiceRes.data ?? []).reduce((sum, row: any) => {
      const dateStr = row.invoice_date as string | null;
      if (!dateStr) return sum;
      const d = new Date(dateStr);
      if (Number.isNaN(d.getTime()) || d < startOfYear) return sum;
      const amount = Number(row.amount ?? 0);
      return sum + (Number.isFinite(amount) ? amount : 0);
    }, 0);

    const activeShipments = (shipmentRes.data ?? []).filter((row: any) => {
      const status = (row.status as string | null)?.toLowerCase() ?? "";
      return status !== "delivered" && status !== "cancelled";
    }).length;

    const openTickets = (ticketRes.data ?? []).filter((row: any) => {
      const status = (row.status as string | null)?.toLowerCase() ?? "";
      return status !== "resolved" && status !== "closed";
    }).length;

    const warehouses = (warehouseRes.data ?? []) as any[];
    const inventoryItems = (inventoryRes.data ?? []) as any[];

    const activeWarehouses = warehouses.filter((row: any) => {
      const status = (row.status as string | null)?.toLowerCase() ?? "";
      return status !== "offline";
    }).length;

    const lowStockItems = inventoryItems.filter((row: any) => {
      const current = Number(row.current_stock ?? 0);
      const minimum = Number(row.min_stock ?? 0);
      if (!Number.isFinite(current) || !Number.isFinite(minimum)) return false;
      if (minimum <= 0) return false;
      return current < minimum;
    }).length;

    const formatCurrencyMillions = (value: number) => {
      if (!value) return "₹0.0M";
      const millions = value / 1_000_000;
      return `₹${millions.toFixed(1)}M`;
    };

    const formatInteger = (value: number) => {
      if (!value) return "0";
      try {
        return value.toLocaleString("en-IN");
      } catch {
        return String(value);
      }
    };

    const stats: DashboardStatType[] = [
      {
        label: "REVENUE",
        value: formatCurrencyMillions(totalRevenue),
        description: "TOTAL THIS YEAR",
        intent: "positive",
        icon: "gear",
        direction: "up",
      },
      {
        label: "ITEMS IN TRANSIT",
        value: formatInteger(activeShipments),
        description: "ACTIVE SHIPMENTS",
        intent: "positive",
        icon: "proccesor",
        direction: "up",
      },
      {
        label: "CUSTOMER TICKETS",
        value: formatInteger(openTickets),
        description: "OPEN SUPPORT TICKETS",
        intent: openTickets > 0 ? "negative" : "positive",
        icon: "boom",
      },
      {
        label: "ACTIVE WAREHOUSES",
        value: formatInteger(activeWarehouses),
        description: "ONLINE FACILITIES",
        intent: "positive",
        icon: "gear",
      },
      {
        label: "LOW STOCK SKUS",
        value: formatInteger(lowStockItems),
        description: "BELOW MINIMUM STOCK",
        intent: lowStockItems > 0 ? "negative" : "positive",
        icon: "boom",
      },
    ];

    return stats;
  } catch (err) {
    console.error("Unexpected error loading top stats from Supabase", err);
    return [];
  }
}

async function loadSupabaseGrowthKpis(): Promise<SecurityStatusType[]> {
  try {
    const now = new Date();
    const last30Start = new Date(now);
    last30Start.setDate(now.getDate() - 29);
    const prev30Start = new Date(now);
    prev30Start.setDate(now.getDate() - 59);
    const prev30End = new Date(last30Start);
    prev30End.setDate(last30Start.getDate() - 1);

    const [invoiceRes, shipmentRes, ticketRes] = await Promise.all([
      supabaseAdmin.from("invoices").select("amount, invoice_date"),
      supabaseAdmin.from("shipments").select("created_at"),
      supabaseAdmin
        .from("support_tickets")
        .select("status, resolved_at"),
    ]);

    if (invoiceRes.error || shipmentRes.error || ticketRes.error) {
      console.error("Failed to load growth KPIs from Supabase", {
        invoiceError: invoiceRes.error?.message,
        shipmentError: shipmentRes.error?.message,
        ticketError: ticketRes.error?.message,
      });
      return [];
    }

    const inRange = (dateStr: string | null, start: Date, end: Date) => {
      if (!dateStr) return false;
      const d = new Date(dateStr);
      if (Number.isNaN(d.getTime())) return false;
      return d >= start && d <= end;
    };

    const revenueLast30 = (invoiceRes.data ?? []).reduce((sum, row: any) => {
      const dateStr = row.invoice_date as string | null;
      if (!inRange(dateStr, last30Start, now)) return sum;
      const amount = Number(row.amount ?? 0);
      return sum + (Number.isFinite(amount) ? amount : 0);
    }, 0);

    const revenuePrev30 = (invoiceRes.data ?? []).reduce((sum, row: any) => {
      const dateStr = row.invoice_date as string | null;
      if (!inRange(dateStr, prev30Start, prev30End)) return sum;
      const amount = Number(row.amount ?? 0);
      return sum + (Number.isFinite(amount) ? amount : 0);
    }, 0);

    const shipmentsLast30 = (shipmentRes.data ?? []).filter((row: any) =>
      inRange(row.created_at as string | null, last30Start, now)
    ).length;

    const shipmentsPrev30 = (shipmentRes.data ?? []).filter((row: any) =>
      inRange(row.created_at as string | null, prev30Start, prev30End)
    ).length;

    const revenueGrowth = computeGrowth(revenueLast30, revenuePrev30);
    const shipmentGrowth = computeGrowth(
      shipmentsLast30,
      shipmentsPrev30
    );

    const tickets = ticketRes.data ?? [];
    const totalTickets = tickets.length;
    const resolvedTickets = tickets.filter((row: any) => {
      const status = (row.status as string | null)?.toLowerCase() ?? "";
      const resolvedAt = row.resolved_at as string | null;
      return (
        resolvedAt || status === "resolved" || status === "closed"
      );
    }).length;

    const resolutionRate =
      totalTickets > 0 ? (resolvedTickets / totalTickets) * 100 : 0;

    const ticketVariant: SecurityStatusType["variant"] =
      resolutionRate >= 90
        ? "success"
        : resolutionRate >= 70
        ? "warning"
        : "destructive";

    const kpis: SecurityStatusType[] = [
      {
        title: "REVENUE GROWTH",
        value: formatSignedPercent(revenueGrowth),
        status: "[LAST 30 DAYS]",
        variant: revenueGrowth >= 0 ? "success" : "destructive",
      },
      {
        title: "SHIPMENTS GROWTH",
        value: formatSignedPercent(shipmentGrowth),
        status: "[LAST 30 DAYS]",
        variant: shipmentGrowth >= 0 ? "success" : "destructive",
      },
      {
        title: "TICKET RESOLUTION",
        value: `${Math.round(resolutionRate)}%`,
        status:
          resolutionRate >= 90
            ? "[WITHIN SLA]"
            : resolutionRate >= 70
            ? "[WATCH CLOSELY]"
            : "[AT RISK]",
        variant: ticketVariant,
      },
    ];

    return kpis;
  } catch (err) {
    console.error("Unexpected error loading growth KPIs from Supabase", err);
    return [];
  }
}

async function loadSupabaseChartData(): Promise<ChartData> {
  try {
    const [invoiceRes, shipmentRes] = await Promise.all([
      supabaseAdmin.from("invoices").select("amount, invoice_date"),
      supabaseAdmin.from("shipments").select("created_at"),
    ]);

    if (invoiceRes.error || shipmentRes.error) {
      console.error("Failed to load chart data from Supabase", {
        invoiceError: invoiceRes.error?.message,
        shipmentError: shipmentRes.error?.message,
      });
      return emptyChartData;
    }

    const invoices = (invoiceRes.data ?? []) as any[];
    const shipments = (shipmentRes.data ?? []) as any[];

    if (invoices.length === 0 && shipments.length === 0) {
      return emptyChartData;
    }

    const today = new Date();

    const monthNames = [
      "Jan",
      "Feb",
      "Mar",
      "Apr",
      "May",
      "Jun",
      "Jul",
      "Aug",
      "Sep",
      "Oct",
      "Nov",
      "Dec",
    ];

    const getDayKey = (d: Date) => d.toISOString().slice(0, 10);

    const dailyRevenue = new Map<string, number>();
    const dailyShipments = new Map<string, number>();

    invoices.forEach((row) => {
      const dateStr = row.invoice_date as string | null;
      if (!dateStr) return;
      const d = new Date(dateStr);
      if (Number.isNaN(d.getTime())) return;
      const key = getDayKey(d);
      const amount = Number(row.amount ?? 0);
      const current = dailyRevenue.get(key) ?? 0;
      dailyRevenue.set(key, current + (Number.isFinite(amount) ? amount : 0));
    });

    shipments.forEach((row) => {
      const dateStr = row.created_at as string | null;
      if (!dateStr) return;
      const d = new Date(dateStr);
      if (Number.isNaN(d.getTime())) return;
      const key = getDayKey(d);
      const current = dailyShipments.get(key) ?? 0;
      dailyShipments.set(key, current + 1);
    });

    const buildWeek = (): ChartData["week"] => {
      const points: ChartData["week"] = [];
      for (let i = 7; i >= 0; i--) {
        const d = new Date(today);
        d.setDate(today.getDate() - i);
        const key = getDayKey(d);
        const label = `${String(d.getDate()).padStart(2, "0")}/${String(
          d.getMonth() + 1
        ).padStart(2, "0")}`;
        const revenue = dailyRevenue.get(key) ?? 0;
        const shipmentsCount = dailyShipments.get(key) ?? 0;
        const distance = shipmentsCount * 100;
        points.push({
          date: label,
          revenue,
          shipments: shipmentsCount,
          distance,
        });
      }
      return points;
    };

    const buildMonth = (): ChartData["month"] => {
      const points: ChartData["month"] = [];
      const currentMonth = today.getMonth();
      const currentYear = today.getFullYear();

      for (let i = 11; i >= 0; i--) {
        const d = new Date(currentYear, currentMonth - i, 1);
        const month = d.getMonth();
        const year = d.getFullYear();

        let revenue = 0;
        let shipmentsCount = 0;

        invoices.forEach((row) => {
          const dateStr = row.invoice_date as string | null;
          if (!dateStr) return;
          const di = new Date(dateStr);
          if (
            Number.isNaN(di.getTime()) ||
            di.getFullYear() !== year ||
            di.getMonth() !== month
          ) {
            return;
          }
          const amount = Number(row.amount ?? 0);
          revenue += Number.isFinite(amount) ? amount : 0;
        });

        shipments.forEach((row) => {
          const dateStr = row.created_at as string | null;
          if (!dateStr) return;
          const ds = new Date(dateStr);
          if (
            Number.isNaN(ds.getTime()) ||
            ds.getFullYear() !== year ||
            ds.getMonth() !== month
          ) {
            return;
          }
          shipmentsCount += 1;
        });

        const distance = shipmentsCount * 100;

        points.push({
          date: monthNames[month],
          revenue,
          shipments: shipmentsCount,
          distance,
        });
      }

      return points;
    };

    const buildYear = (): ChartData["year"] => {
      const points: ChartData["year"] = [];
      const currentYear = today.getFullYear();
      const startYear = currentYear - 4;

      for (let year = startYear; year <= currentYear; year++) {
        let revenue = 0;
        let shipmentsCount = 0;

        invoices.forEach((row) => {
          const dateStr = row.invoice_date as string | null;
          if (!dateStr) return;
          const d = new Date(dateStr);
          if (Number.isNaN(d.getTime()) || d.getFullYear() !== year) return;
          const amount = Number(row.amount ?? 0);
          revenue += Number.isFinite(amount) ? amount : 0;
        });

        shipments.forEach((row) => {
          const dateStr = row.created_at as string | null;
          if (!dateStr) return;
          const d = new Date(dateStr);
          if (Number.isNaN(d.getTime()) || d.getFullYear() !== year) return;
          shipmentsCount += 1;
        });

        const distance = shipmentsCount * 100;

        points.push({
          date: String(year),
          revenue,
          shipments: shipmentsCount,
          distance,
        });
      }

      return points;
    };

    return {
      week: buildWeek(),
      month: buildMonth(),
      year: buildYear(),
    };
  } catch (err) {
    console.error("Unexpected error loading chart data from Supabase", err);
    return emptyChartData;
  }
}

async function loadSupabaseShipmentsForProjections(): Promise<any[]> {
  try {
    const { data, error } = await supabaseAdmin
      .from("shipments")
      .select("weight");

    if (error || !data) {
      return [];
    }

    return data as any[];
  } catch {
    return [];
  }
}

function buildGrowthProjections(
  chartData: ChartData,
  stats: DashboardStatType[],
  kpis: SecurityStatusType[],
  shipmentsForProjections: any[],
  revenueTrend: RevenueTrend
): RebelRanking[] {
  const yearSeries = chartData.year ?? [];
  const lastYear = yearSeries[yearSeries.length - 1];
  const prevYear = yearSeries[yearSeries.length - 2];

  const lastYearRevenue =
    revenueTrend?.lastYearRevenue ??
    (typeof lastYear?.revenue === "number" ? lastYear.revenue : 0);
  const prevYearRevenue =
    revenueTrend?.prevYearRevenue ??
    (typeof prevYear?.revenue === "number" ? prevYear.revenue : 0);

  const revenueGrowth = computeGrowth(lastYearRevenue, prevYearRevenue);
  const shipmentGrowth = computeGrowth(
    typeof lastYear?.shipments === "number" ? lastYear.shipments : 0,
    typeof prevYear?.shipments === "number" ? prevYear.shipments : 0
  );

  const ticketsStat = stats.find(
    (stat) => stat.label === "CUSTOMER TICKETS"
  );
  const openTickets = extractNumeric(ticketsStat?.value);

  const ticketResolutionStatus = kpis.find(
    (s) => s.title === "TICKET RESOLUTION"
  );
  const resolutionRate = extractNumeric(ticketResolutionStatus?.value);

  const projectedTicketsIn90Days =
    openTickets > 0
      ? openTickets * (1 - resolutionRate / 100) + openTickets * 0.3
      : 0;

  const shipments = shipmentsForProjections ?? [];
  const avgShipmentWeight =
    shipments.length > 0
      ? shipments.reduce(
          (sum: number, s: any) => sum + Number(s.weight ?? 0),
          0
        ) / shipments.length
      : 0;

  const projections: RebelRanking[] = [
    {
      id: 1,
      name: "REVENUE GROWTH",
      handle: "@NEXT_12_MONTHS",
      subtitle: `Projected ${formatPercent(revenueGrowth || 0)} vs last year`,
      streak: `Current year ₹${
        lastYearRevenue ? (lastYearRevenue / 1_000_000).toFixed(1) : "0.0"
      }M`,
      points: lastYearRevenue ? Math.round(lastYearRevenue / 10_000) : 0,
      avatar: "/avatars/user_krimson.png",
      featured: true,
    },
    {
      id: 2,
      name: "SHIPMENT VOLUME",
      handle: "@NEXT_12_MONTHS",
      subtitle: `Projected ${formatPercent(shipmentGrowth || 0)} shipments growth`,
      streak: "Based on year-over-year shipment trend",
      points:
        typeof lastYear?.shipments === "number"
          ? Math.round(lastYear.shipments * 10)
          : 0,
      avatar: "/avatars/user_mati.png",
    },
    {
      id: 3,
      name: "TICKET LOAD",
      handle: "@NEXT_90_DAYS",
      subtitle: openTickets
        ? `~${Math.round(
            projectedTicketsIn90Days
          )} active tickets projected in 90 days`
        : "Ticket volume stable based on current SLA",
      streak: resolutionRate
        ? `Resolution rate ${formatPercent(resolutionRate)}`
        : "Resolution trend not available",
      points: openTickets
        ? Math.max(openTickets, Math.round(projectedTicketsIn90Days))
        : 0,
      avatar: "/avatars/user_pek.png",
    },
    {
      id: 4,
      name: "NETWORK CAPACITY",
      handle: "@ROUTE_UTILIZATION",
      subtitle: avgShipmentWeight
        ? `Avg shipment weight ${avgShipmentWeight.toFixed(1)} kg`
        : "Insufficient data for lane density",
      streak: "Higher average weight signals denser routes",
      points: avgShipmentWeight ? Math.round(avgShipmentWeight * 100) : 0,
      avatar: "/avatars/user_joyboy.png",
    },
  ];

  return projections;
}

export default async function DashboardOverview() {
  const [
    revenueTrend,
    topStats,
    growthKpis,
    chartData,
    shipmentsForProjections,
  ] = await Promise.all([
    loadSupabaseRevenueTrend(),
    loadSupabaseTopStats(),
    loadSupabaseGrowthKpis(),
    loadSupabaseChartData(),
    loadSupabaseShipmentsForProjections(),
  ]);

  const growthProjections = buildGrowthProjections(
    chartData,
    topStats,
    growthKpis,
    shipmentsForProjections,
    revenueTrend
  );

  return (
    <DashboardPageLayout
      header={{
        title: "Cargo Operations",
        description: "Network overview of revenue, shipments, and tickets",
        icon: BracketsIcon,
      }}
    >
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4 lg:gap-6 mb-4 sm:mb-6">
        {topStats.map((stat, index) => (
          <DashboardStat
            key={index}
            label={stat.label}
            value={stat.value}
            description={stat.description}
            icon={iconMap[stat.icon as keyof typeof iconMap]}
            tag={stat.tag}
            intent={stat.intent}
            direction={stat.direction}
          />
        ))}
      </div>

      <div className="mb-6">
        <DashboardChart data={chartData} />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
        <RebelsRanking rebels={growthProjections} />
        <SecurityStatus statuses={growthKpis} />
      </div>

      {/* Landing/login overlay that gates access to the dashboard */}
      <DashboardAuthOverlay />
    </DashboardPageLayout>
  );
}
