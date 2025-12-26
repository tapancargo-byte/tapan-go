"use client"

import { IconTrendingDown, IconTrendingUp, IconAlertTriangle, IconActivity } from "@tabler/icons-react"
import { Package, Users, FileText, Warehouse, AlertCircle, TrendingUp, TrendingDown, Minus } from "lucide-react"

import { CardPremium, CardHeaderPremium, CardContentPremium, CardBadge, CardMetric } from "@/components/ui/card-premium"
import { ButtonPremium } from "@/components/ui/button-premium"
import { cn } from "@/lib/utils"

interface OpsCommandGridPremiumProps {
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

export function OpsCommandGridPremium({ stats }: OpsCommandGridPremiumProps) {
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

  const getTrendIcon = (trend: number) => {
    if (trend > 0) return <TrendingUp className="w-4 h-4" />
    if (trend < 0) return <TrendingDown className="w-4 h-4" />
    return <Minus className="w-4 h-4" />
  }

  const getTrendColor = (trend: number) => {
    if (trend > 0) return "text-success"
    if (trend < 0) return "text-destructive"
    return "text-muted-foreground"
  }

  const formatTrend = (trend: number) => {
    const sign = trend > 0 ? "+" : ""
    return `${sign}${trend}%`
  }

  const metrics = [
    {
      id: "shipments",
      title: "Active Shipments",
      value: data.totalShipments.toLocaleString(),
      trend: data.shipmentsTrend,
      icon: Package,
      description: "Total shipments in transit",
      variant: "premium" as const,
      badge: "Live Tracking",
      badgeVariant: "success" as const,
    },
    {
      id: "customers",
      title: "Active Customers",
      value: data.activeCustomers.toLocaleString(),
      trend: data.customersTrend,
      icon: Users,
      description: "Customers with active orders",
      variant: "elevated" as const,
      badge: "Growing",
      badgeVariant: "info" as const,
    },
    {
      id: "invoices",
      title: "Pending Invoices",
      value: data.pendingInvoices.toLocaleString(),
      trend: data.invoicesTrend,
      icon: FileText,
      description: "Awaiting payment processing",
      variant: data.pendingInvoices > 20 ? "warning" : "default" as const,
      badge: data.pendingInvoices > 20 ? "Attention" : "Normal",
      badgeVariant: data.pendingInvoices > 20 ? "warning" : "default" as const,
    },
    {
      id: "capacity",
      title: "Warehouse Capacity",
      value: `${data.warehouseCapacity}%`,
      trend: data.capacityTrend,
      icon: Warehouse,
      description: "Current storage utilization",
      variant: data.warehouseCapacity > 85 ? "destructive" : "default" as const,
      badge: data.warehouseCapacity > 85 ? "Critical" : "Optimal",
      badgeVariant: data.warehouseCapacity > 85 ? "destructive" : "success" as const,
    },
  ]

  return (
    <div className="space-y-6">
      {/* Header Section */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold font-display text-gradient-primary">
            Operations Command Center
          </h2>
          <p className="text-muted-foreground mt-1">
            Real-time logistics performance metrics and insights
          </p>
        </div>
        <div className="flex items-center space-x-3">
          <CardBadge variant="success">
            <div className="flex items-center space-x-1">
              <div className="w-2 h-2 bg-success rounded-full animate-pulse" />
              <span>Live Data</span>
            </div>
          </CardBadge>
          <ButtonPremium variant="outline" size="sm">
            <AlertCircle className="w-4 h-4" />
            View Alerts
          </ButtonPremium>
        </div>
      </div>

      {/* Metrics Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {metrics.map((metric, index) => (
          <CardPremium
            key={metric.id}
            variant={metric.variant}
            interactive
            className="group cursor-pointer animate-fade-in-up hover:scale-105 transition-all duration-300"
            style={{ animationDelay: `${index * 0.1}s` }}
          >
            {/* Background Icon */}
            <div className="absolute top-4 right-4 opacity-10 group-hover:opacity-20 transition-opacity duration-300">
              <metric.icon className="w-16 h-16" />
            </div>

            <CardHeaderPremium
              action={
                <CardBadge variant={metric.badgeVariant}>
                  {metric.badge}
                </CardBadge>
              }
            >
              <div className="flex items-center space-x-3">
                <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-primary/10 text-primary group-hover:bg-primary/20 transition-colors duration-300">
                  <metric.icon className="h-6 w-6" />
                </div>
                <div>
                  <p className="text-sm font-medium text-muted-foreground uppercase tracking-wider">
                    {metric.title}
                  </p>
                  <p className="text-xs text-muted-foreground/80 mt-0.5">
                    {metric.description}
                  </p>
                </div>
              </div>
            </CardHeaderPremium>

            <CardContentPremium>
              <div className="space-y-4">
                {/* Main Metric */}
                <div className="flex items-baseline justify-between">
                  <span className="text-3xl font-bold font-display">
                    {metric.value}
                  </span>
                  <div className={cn(
                    "flex items-center space-x-1 text-sm font-medium",
                    getTrendColor(metric.trend)
                  )}>
                    {getTrendIcon(metric.trend)}
                    <span>{formatTrend(metric.trend)}</span>
                  </div>
                </div>

                {/* Progress Bar for Capacity */}
                {metric.id === "capacity" && (
                  <div className="space-y-2">
                    <div className="flex justify-between text-xs text-muted-foreground">
                      <span>Storage Used</span>
                      <span>{metric.value}</span>
                    </div>
                    <div className="w-full bg-secondary/30 rounded-full h-2 overflow-hidden">
                      <div
                        className={cn(
                          "h-full rounded-full transition-all duration-1000 ease-out",
                          data.warehouseCapacity > 85 
                            ? "bg-gradient-to-r from-destructive to-destructive/80" 
                            : data.warehouseCapacity > 70
                            ? "bg-gradient-to-r from-warning to-warning/80"
                            : "bg-gradient-to-r from-success to-success/80"
                        )}
                        style={{ 
                          width: `${data.warehouseCapacity}%`,
                          animationDelay: `${index * 0.2}s`
                        }}
                      />
                    </div>
                  </div>
                )}

                {/* Mini Chart Placeholder for other metrics */}
                {metric.id !== "capacity" && (
                  <div className="h-8 flex items-end space-x-1">
                    {Array.from({ length: 7 }).map((_, i) => (
                      <div
                        key={i}
                        className={cn(
                          "flex-1 rounded-sm transition-all duration-500",
                          metric.trend > 0 ? "bg-success/20" : "bg-muted/20"
                        )}
                        style={{
                          height: `${Math.random() * 100}%`,
                          animationDelay: `${(index * 0.1) + (i * 0.05)}s`
                        }}
                      />
                    ))}
                  </div>
                )}
              </div>
            </CardContentPremium>

            {/* Hover Effect Overlay */}
            <div className="absolute inset-0 bg-gradient-to-r from-primary/5 to-accent/5 opacity-0 group-hover:opacity-100 transition-opacity duration-300 rounded-xl" />
          </CardPremium>
        ))}
      </div>

      {/* Quick Actions */}
      <div className="flex flex-wrap gap-3 pt-4 border-t border-border/50">
        <ButtonPremium variant="premium" size="sm">
          <Package className="w-4 h-4" />
          Create Shipment
        </ButtonPremium>
        <ButtonPremium variant="outline" size="sm">
          <Users className="w-4 h-4" />
          Manage Customers
        </ButtonPremium>
        <ButtonPremium variant="outline" size="sm">
          <FileText className="w-4 h-4" />
          Generate Report
        </ButtonPremium>
        <ButtonPremium variant="ghost" size="sm">
          <Warehouse className="w-4 h-4" />
          Warehouse Overview
        </ButtonPremium>
      </div>
    </div>
  )
}

