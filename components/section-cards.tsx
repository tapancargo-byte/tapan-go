import { IconTrendingDown, IconTrendingUp } from "@tabler/icons-react"
import { Package, Users, FileText, Warehouse } from "lucide-react"

import { Badge } from "@/components/ui/badge"
import {
  Card,
  CardAction,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"

interface SectionCardsProps {
  stats?: {
    totalShipments: number;
    activeCustomers: number;
    pendingInvoices: number;
    warehouseCapacity: number;
    shipmentsTrend: number;
    customersTrend: number;
    invoicesTrend: number;
    capacityTrend: number;
  };
}

export function SectionCards({ stats }: SectionCardsProps) {
  // Default stats for Tapan Associate
  const data = stats || {
    totalShipments: 1247,
    activeCustomers: 156,
    pendingInvoices: 23,
    warehouseCapacity: 79,
    shipmentsTrend: 12.5,
    customersTrend: 8.2,
    invoicesTrend: -5.3,
    capacityTrend: -2.3,
  };

  return (
    <div className="*:data-[slot=card]:from-primary/5 *:data-[slot=card]:to-card dark:*:data-[slot=card]:bg-card grid grid-cols-1 gap-4 px-4 *:data-[slot=card]:bg-gradient-to-t *:data-[slot=card]:shadow-xs lg:px-6 @xl/main:grid-cols-2 @5xl/main:grid-cols-4">
      <Card className="@container/card">
        <CardHeader>
          <CardDescription className="flex items-center gap-2">
            <Package className="size-4" />
            Total Shipments
          </CardDescription>
          <CardTitle className="text-2xl font-semibold tabular-nums @[250px]/card:text-3xl">
            {data.totalShipments.toLocaleString()}
          </CardTitle>
          <CardAction>
            <Badge variant="outline" className={data.shipmentsTrend >= 0 ? "text-green-600" : "text-red-600"}>
              {data.shipmentsTrend >= 0 ? <IconTrendingUp /> : <IconTrendingDown />}
              {data.shipmentsTrend >= 0 ? "+" : ""}{data.shipmentsTrend}%
            </Badge>
          </CardAction>
        </CardHeader>
        <CardFooter className="flex-col items-start gap-1.5 text-sm">
          <div className="line-clamp-1 flex gap-2 font-medium">
            {data.shipmentsTrend >= 0 ? "Trending up this month" : "Trending down"} 
            {data.shipmentsTrend >= 0 ? <IconTrendingUp className="size-4" /> : <IconTrendingDown className="size-4" />}
          </div>
          <div className="text-muted-foreground">
            Active shipments this month
          </div>
        </CardFooter>
      </Card>
      <Card className="@container/card">
        <CardHeader>
          <CardDescription className="flex items-center gap-2">
            <Users className="size-4" />
            Active Customers
          </CardDescription>
          <CardTitle className="text-2xl font-semibold tabular-nums @[250px]/card:text-3xl">
            {data.activeCustomers.toLocaleString()}
          </CardTitle>
          <CardAction>
            <Badge variant="outline" className={data.customersTrend >= 0 ? "text-green-600" : "text-red-600"}>
              {data.customersTrend >= 0 ? <IconTrendingUp /> : <IconTrendingDown />}
              {data.customersTrend >= 0 ? "+" : ""}{data.customersTrend}%
            </Badge>
          </CardAction>
        </CardHeader>
        <CardFooter className="flex-col items-start gap-1.5 text-sm">
          <div className="line-clamp-1 flex gap-2 font-medium">
            {data.customersTrend >= 0 ? "Customer base growing" : "Needs attention"}
            {data.customersTrend >= 0 ? <IconTrendingUp className="size-4" /> : <IconTrendingDown className="size-4" />}
          </div>
          <div className="text-muted-foreground">
            Customers with recent orders
          </div>
        </CardFooter>
      </Card>
      <Card className="@container/card">
        <CardHeader>
          <CardDescription className="flex items-center gap-2">
            <FileText className="size-4" />
            Pending Invoices
          </CardDescription>
          <CardTitle className="text-2xl font-semibold tabular-nums @[250px]/card:text-3xl">
            {data.pendingInvoices.toLocaleString()}
          </CardTitle>
          <CardAction>
            <Badge variant="outline" className={data.invoicesTrend <= 0 ? "text-green-600" : "text-red-600"}>
              {data.invoicesTrend <= 0 ? <IconTrendingDown /> : <IconTrendingUp />}
              {data.invoicesTrend >= 0 ? "+" : ""}{data.invoicesTrend}%
            </Badge>
          </CardAction>
        </CardHeader>
        <CardFooter className="flex-col items-start gap-1.5 text-sm">
          <div className="line-clamp-1 flex gap-2 font-medium">
            {data.invoicesTrend <= 0 ? "Fewer pending" : "More pending"}
            {data.invoicesTrend <= 0 ? <IconTrendingDown className="size-4" /> : <IconTrendingUp className="size-4" />}
          </div>
          <div className="text-muted-foreground">Awaiting payment</div>
        </CardFooter>
      </Card>
      <Card className="@container/card">
        <CardHeader>
          <CardDescription className="flex items-center gap-2">
            <Warehouse className="size-4" />
            Warehouse Capacity
          </CardDescription>
          <CardTitle className="text-2xl font-semibold tabular-nums @[250px]/card:text-3xl">
            {data.warehouseCapacity}%
          </CardTitle>
          <CardAction>
            <Badge variant="outline" className={data.capacityTrend <= 0 ? "text-green-600" : "text-amber-600"}>
              {data.capacityTrend <= 0 ? <IconTrendingDown /> : <IconTrendingUp />}
              {data.capacityTrend >= 0 ? "+" : ""}{data.capacityTrend}%
            </Badge>
          </CardAction>
        </CardHeader>
        <CardFooter className="flex-col items-start gap-1.5 text-sm">
          <div className="line-clamp-1 flex gap-2 font-medium">
            {data.capacityTrend <= 0 ? "More space available" : "Utilization increasing"}
            {data.capacityTrend <= 0 ? <IconTrendingDown className="size-4" /> : <IconTrendingUp className="size-4" />}
          </div>
          <div className="text-muted-foreground">Current utilization</div>
        </CardFooter>
      </Card>
    </div>
  )
}
