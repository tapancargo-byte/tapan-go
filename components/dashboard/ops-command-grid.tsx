"use client"

import { IconTrendingDown, IconTrendingUp, IconAlertTriangle, IconActivity } from "@tabler/icons-react"
import { Package, Users, FileText, Warehouse, AlertCircle } from "lucide-react"

import { Badge } from "@/components/ui/badge"
import {
    Card,
    CardHeader,
    CardTitle,
    CardContent,
} from "@/components/ui/card"
import { cn } from "@/lib/utils"

interface OpsCommandGridProps {
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

export function OpsCommandGrid({ stats }: OpsCommandGridProps) {
    const data = stats || {
        totalShipments: 0,
        activeCustomers: 0,
        pendingInvoices: 0,
        warehouseCapacity: 0,
        shipmentsTrend: 0,
        customersTrend: 0,
        invoicesTrend: 0,
        capacityTrend: 0,
    };

    return (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {/* Active Shipments - Primary Pulse */}
            <Card className="glass-card border-l-4 border-l-primary relative overflow-hidden group hover:shadow-lg transition-all duration-300">
                <div className="absolute top-0 right-0 p-3 opacity-10 group-hover:opacity-20 transition-opacity">
                    <Package className="w-24 h-24 text-primary" />
                </div>
                <CardHeader className="pb-2">
                    <div className="flex justify-between items-start">
                        <p className="text-sm font-medium text-muted-foreground uppercase tracking-wider">Active Shipments</p>
                        <IconActivity className="w-4 h-4 text-primary animate-pulse" />
                    </div>
                    <CardTitle className="text-4xl font-bold text-foreground neon-text-glow">
                        {data.totalShipments.toLocaleString()}
                    </CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="flex items-center gap-2 text-sm">
                        <Badge variant="outline" className={cn("bg-primary/10 border-primary/20", data.shipmentsTrend >= 0 ? "text-primary" : "text-destructive")}>
                            {data.shipmentsTrend > 0 ? "+" : ""}{data.shipmentsTrend}%
                        </Badge>
                        <span className="text-muted-foreground">vs last month</span>
                    </div>
                </CardContent>
            </Card>

            {/* Warehouse Capacity - Warning State */}
            <Card className={cn(
                "glass-card border-l-4 relative overflow-hidden group hover:shadow-lg transition-all duration-300",
                data.warehouseCapacity > 80 ? "border-l-amber-500" : "border-l-emerald-500"
            )}>
                <div className="absolute top-0 right-0 p-3 opacity-10 group-hover:opacity-20 transition-opacity">
                    <Warehouse className={cn("w-24 h-24", data.warehouseCapacity > 80 ? "text-amber-500" : "text-emerald-500")} />
                </div>
                <CardHeader className="pb-2">
                    <div className="flex justify-between items-start">
                        <p className="text-sm font-medium text-muted-foreground uppercase tracking-wider">Warehouse Load</p>
                        {data.warehouseCapacity > 80 && <AlertCircle className="w-4 h-4 text-amber-500 animate-bounce" />}
                    </div>
                    <CardTitle className="text-4xl font-bold text-foreground">
                        {data.warehouseCapacity}%
                    </CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="flex items-center gap-2 text-sm">
                        <div className="h-2 flex-1 bg-muted rounded-full overflow-hidden">
                            <div
                                className={cn("h-full rounded-full transition-all duration-500",
                                    data.warehouseCapacity > 90 ? "bg-destructive" :
                                        data.warehouseCapacity > 75 ? "bg-amber-500" : "bg-emerald-500"
                                )}
                                style={{ width: `${Math.min(data.warehouseCapacity, 100)}%` }}
                            />
                        </div>
                        <span className="text-muted-foreground whitespace-nowrap">Capacity</span>
                    </div>
                </CardContent>
            </Card>

            {/* Pending Invoices - Cash Flow */}
            <Card className="glass-card border-l-4 border-l-rose-500 relative overflow-hidden group hover:shadow-lg transition-all duration-300">
                <div className="absolute top-0 right-0 p-3 opacity-10 group-hover:opacity-20 transition-opacity">
                    <FileText className="w-24 h-24 text-rose-500" />
                </div>
                <CardHeader className="pb-2">
                    <p className="text-sm font-medium text-muted-foreground uppercase tracking-wider">Pending Invoices</p>
                    <CardTitle className="text-4xl font-bold text-foreground">
                        {data.pendingInvoices}
                    </CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="flex items-center gap-2 text-sm">
                        <Badge variant="outline" className="bg-rose-500/10 text-rose-500 border-rose-500/20">
                            Action Required
                        </Badge>
                        <span className="text-muted-foreground">needs review</span>
                    </div>
                </CardContent>
            </Card>

            {/* Active Customers */}
            <Card className="glass-card border-l-4 border-l-blue-500 relative overflow-hidden group hover:shadow-lg transition-all duration-300">
                <div className="absolute top-0 right-0 p-3 opacity-10 group-hover:opacity-20 transition-opacity">
                    <Users className="w-24 h-24 text-blue-500" />
                </div>
                <CardHeader className="pb-2">
                    <p className="text-sm font-medium text-muted-foreground uppercase tracking-wider">Active Customers</p>
                    <CardTitle className="text-4xl font-bold text-foreground">
                        {data.activeCustomers}
                    </CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="flex items-center gap-2 text-sm">
                        <Badge variant="outline" className="bg-blue-500/10 text-blue-500 border-blue-500/20">
                            {data.customersTrend > 0 ? "+" : ""}{data.customersTrend}%
                        </Badge>
                        <span className="text-muted-foreground">growth</span>
                    </div>
                </CardContent>
            </Card>
        </div>
    )
}
