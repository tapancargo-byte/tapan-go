import { ChartShipmentActivity } from "@/components/chart-shipment-activity"
import DashboardPageLayout from "@/components/dashboard/layout"
import BracketsIcon from "@/components/icons/brackets"
import { ShipmentsDataTable } from "@/components/dashboard/shipments-data-table"
import { RecentShipments } from "@/components/dashboard/recent-shipments"
import { SectionCards } from "@/components/section-cards"

import shipmentsTableData from "./shipments-table-data.json"

type TypedShipment = {
  id: number
  shipment_ref: string
  customer_name: string
  origin: string
  destination: string
  status: "pending" | "in_transit" | "delivered" | "cancelled"
  weight: number
  created_at: string
}

// Fetch dashboard stats from Supabase (safe if env missing)
async function getDashboardStats() {
  try {
    const { supabaseAdmin } = await import("@/lib/supabaseAdmin")

    const [shipmentsRes, customersRes, invoicesRes, warehouseRes] = await Promise.all([
      supabaseAdmin.from("shipments").select("id, status", { count: "exact" }),
      supabaseAdmin.from("customers").select("id", { count: "exact" }),
      supabaseAdmin.from("invoices").select("id, amount, status", { count: "exact" }),
      supabaseAdmin.from("warehouses").select("id, capacity_used", { count: "exact" }),
    ]);

    const activeShipments = shipmentsRes.data?.filter(s => 
      ["pending", "in_transit", "processing"].includes(s.status)
    ).length ?? 0;

    const pendingInvoices = invoicesRes.data?.filter(i => 
      i.status === "pending" || i.status === "unpaid"
    ).length ?? 0;

    const avgCapacity = warehouseRes.data?.length 
      ? warehouseRes.data.reduce((sum, w) => sum + (Number(w.capacity_used) || 0), 0) / warehouseRes.data.length 
      : 0;

    return {
      totalShipments: shipmentsRes.count ?? activeShipments,
      activeCustomers: customersRes.count ?? 0,
      pendingInvoices: pendingInvoices,
      warehouseCapacity: Math.round(avgCapacity),
      shipmentsTrend: 12.5,
      customersTrend: 8.2,
      invoicesTrend: -5.3,
      capacityTrend: -2.3,
    };
  } catch (error) {
    console.error("Error fetching dashboard stats:", error);
    return {
      totalShipments: 1247,
      activeCustomers: 156,
      pendingInvoices: 23,
      warehouseCapacity: 79,
      shipmentsTrend: 12.5,
      customersTrend: 8.2,
      invoicesTrend: -5.3,
      capacityTrend: -2.3,
    };
  }
}

export default async function Page({ searchParams }: { searchParams?: { q?: string; status?: "pending" | "in_transit" | "delivered" | "cancelled" } }) {
  const stats = await getDashboardStats();
  const shipments = shipmentsTableData as unknown as TypedShipment[]

  return (
    <DashboardPageLayout
      header={{
        title: "Dashboard",
        description: "Core operations overview for shipments, customers, billing, and capacity.",
        icon: BracketsIcon,
      }}
    >
      <div className="flex flex-1 flex-col">
        <div className="@container/main flex flex-1 flex-col gap-2">
          <div className="flex flex-col gap-4 py-4 md:gap-6 md:py-6">
            <SectionCards stats={stats} />
            <div className="grid gap-4 px-4 lg:px-6 md:grid-cols-2">
              <ChartShipmentActivity />
              <RecentShipments
                shipments={shipments.map((s) => ({
                  shipment_ref: s.shipment_ref,
                  customer_name: s.customer_name,
                  status: s.status,
                }))}
              />
            </div>
            <ShipmentsDataTable
              data={shipments}
              initialFilter={searchParams?.q}
              initialStatus={searchParams?.status}
            />
          </div>
        </div>
      </div>
    </DashboardPageLayout>
  )
}
