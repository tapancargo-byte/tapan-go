import * as React from "react"
import { cn } from "@/lib/utils"
import { CardPremium, CardHeaderPremium, CardTitlePremium, CardContentPremium, CardBadge } from "@/components/ui/card-premium"
import { ButtonPremium } from "@/components/ui/button-premium"
import { GridLayoutPremium } from "./layout-premium"

// Mock data for demonstration
const mockMetrics = {
  shipments: {
    total: 1247,
    pending: 89,
    inTransit: 156,
    delivered: 1002,
    trend: "+12.5%" as const,
    trendDirection: "up" as const,
  },
  customers: {
    total: 342,
    active: 298,
    new: 44,
    trend: "+8.2%" as const,
    trendDirection: "up" as const,
  },
  revenue: {
    total: "$2.4M",
    monthly: "$240K",
    trend: "+15.3%" as const,
    trendDirection: "up" as const,
  },
  capacity: {
    utilized: 78,
    available: 22,
    trend: "+5.1%" as const,
    trendDirection: "up" as const,
  },
}

interface OpsCommandGridPremiumProps extends React.HTMLAttributes<HTMLDivElement> {
  animated?: boolean
}

function OpsCommandGridPremium({ 
  className,
  animated = true,
  ...props 
}: OpsCommandGridPremiumProps) {
  return (
    <div className={cn("space-y-8", className)} {...props}>
      {/* Key Metrics Row */}
      <GridLayoutPremium cols={4} gap="lg">
        {/* Active Shipments */}
        <CardPremium 
          variant="premium" 
          className={cn(
            "group cursor-pointer",
            animated && "animate-fade-in-stagger-1"
          )}
          shimmer
        >
          <CardHeaderPremium>
            <div className="flex items-center justify-between">
              <CardTitlePremium size="sm" className="text-muted-foreground uppercase tracking-wider">
                Active Shipments
              </CardTitlePremium>
              <CardBadge variant="success">Live</CardBadge>
            </div>
          </CardHeaderPremium>
          <CardContentPremium>
            <div className="space-y-2">
              <div className="flex items-baseline space-x-2">
                <span className="text-3xl font-bold font-display text-gradient-primary">
                  {mockMetrics.shipments.total}
                </span>
                <span className="text-sm font-medium text-success">
                  {mockMetrics.shipments.trend}
                </span>
              </div>
              <div className="grid grid-cols-3 gap-2 text-xs">
                <div className="text-center p-2 rounded bg-warning/10 text-warning-foreground">
                  <div className="font-semibold">{mockMetrics.shipments.pending}</div>
                  <div className="text-xs opacity-75">Pending</div>
                </div>
                <div className="text-center p-2 rounded bg-info/10 text-info-foreground">
                  <div className="font-semibold">{mockMetrics.shipments.inTransit}</div>
                  <div className="text-xs opacity-75">In Transit</div>
                </div>
                <div className="text-center p-2 rounded bg-success/10 text-success-foreground">
                  <div className="font-semibold">{mockMetrics.shipments.delivered}</div>
                  <div className="text-xs opacity-75">Delivered</div>
                </div>
              </div>
            </div>
          </CardContentPremium>
        </CardPremium>

        {/* Customer Overview */}
        <CardPremium 
          variant="elevated" 
          className={cn(
            "group cursor-pointer",
            animated && "animate-fade-in-stagger-2"
          )}
        >
          <CardHeaderPremium>
            <div className="flex items-center justify-between">
              <CardTitlePremium size="sm" className="text-muted-foreground uppercase tracking-wider">
                Customers
              </CardTitlePremium>
              <div className="w-2 h-2 bg-success rounded-full animate-pulse-glow"></div>
            </div>
          </CardHeaderPremium>
          <CardContentPremium>
            <div className="space-y-3">
              <div className="flex items-baseline space-x-2">
                <span className="text-3xl font-bold font-display">
                  {mockMetrics.customers.total}
                </span>
                <span className="text-sm font-medium text-success">
                  {mockMetrics.customers.trend}
                </span>
              </div>
              <div className="flex justify-between text-sm">
                <div>
                  <div className="font-medium">{mockMetrics.customers.active}</div>
                  <div className="text-xs text-muted-foreground">Active</div>
                </div>
                <div>
                  <div className="font-medium text-primary">{mockMetrics.customers.new}</div>
                  <div className="text-xs text-muted-foreground">New</div>
                </div>
              </div>
            </div>
          </CardContentPremium>
        </CardPremium>

        {/* Revenue Tracking */}
        <CardPremium 
          variant="glass" 
          className={cn(
            "group cursor-pointer",
            animated && "animate-fade-in-stagger-3"
          )}
        >
          <CardHeaderPremium>
            <div className="flex items-center justify-between">
              <CardTitlePremium size="sm" className="text-muted-foreground uppercase tracking-wider">
                Revenue
              </CardTitlePremium>
              <CardBadge variant="premium">Premium</CardBadge>
            </div>
          </CardHeaderPremium>
          <CardContentPremium>
            <div className="space-y-2">
              <div className="flex items-baseline space-x-2">
                <span className="text-3xl font-bold font-display text-gradient-primary">
                  {mockMetrics.revenue.total}
                </span>
                <span className="text-sm font-medium text-success">
                  {mockMetrics.revenue.trend}
                </span>
              </div>
              <div className="text-sm text-muted-foreground">
                Monthly: <span className="font-medium text-foreground">{mockMetrics.revenue.monthly}</span>
              </div>
              {/* Mini chart placeholder */}
              <div className="h-8 bg-gradient-to-r from-primary/20 via-primary/10 to-transparent rounded opacity-50"></div>
            </div>
          </CardContentPremium>
        </CardPremium>

        {/* Warehouse Capacity */}
        <CardPremium 
          variant="default" 
          className={cn(
            "group cursor-pointer",
            animated && "animate-fade-in-stagger-4"
          )}
        >
          <CardHeaderPremium>
            <div className="flex items-center justify-between">
              <CardTitlePremium size="sm" className="text-muted-foreground uppercase tracking-wider">
                Warehouse Capacity
              </CardTitlePremium>
              <span className="text-xs font-medium text-muted-foreground">
                {mockMetrics.capacity.utilized}%
              </span>
            </div>
          </CardHeaderPremium>
          <CardContentPremium>
            <div className="space-y-3">
              <div className="flex items-baseline space-x-2">
                <span className="text-3xl font-bold font-display">
                  {mockMetrics.capacity.utilized}%
                </span>
                <span className="text-sm font-medium text-success">
                  {mockMetrics.capacity.trend}
                </span>
              </div>
              {/* Progress bar */}
              <div className="space-y-1">
                <div className="w-full bg-secondary rounded-full h-2">
                  <div 
                    className="bg-gradient-to-r from-primary to-accent h-2 rounded-full transition-all duration-1000 ease-out"
                    style={{ width: `${mockMetrics.capacity.utilized}%` }}
                  ></div>
                </div>
                <div className="flex justify-between text-xs text-muted-foreground">
                  <span>Utilized</span>
                  <span>{mockMetrics.capacity.available}% Available</span>
                </div>
              </div>
            </div>
          </CardContentPremium>
        </CardPremium>
      </GridLayoutPremium>

      {/* Operations Dashboard */}
      <GridLayoutPremium cols={3} gap="lg">
        {/* Recent Activity */}
        <CardPremium variant="elevated" className="col-span-2">
          <CardHeaderPremium>
            <div className="flex items-center justify-between">
              <CardTitlePremium>Recent Activity</CardTitlePremium>
              <ButtonPremium variant="ghost" size="sm">
                View All
              </ButtonPremium>
            </div>
          </CardHeaderPremium>
          <CardContentPremium>
            <div className="space-y-4">
              {[
                { action: "Shipment #SH-2024-001 delivered", time: "2 minutes ago", status: "success" },
                { action: "New customer registration", time: "15 minutes ago", status: "info" },
                { action: "Warehouse capacity alert", time: "1 hour ago", status: "warning" },
                { action: "Invoice #INV-2024-156 paid", time: "2 hours ago", status: "success" },
              ].map((activity, index) => (
                <div key={index} className="flex items-center space-x-3 p-3 rounded-lg hover:bg-muted/50 transition-colors">
                  <div className={cn(
                    "w-2 h-2 rounded-full",
                    activity.status === "success" && "bg-success",
                    activity.status === "info" && "bg-info",
                    activity.status === "warning" && "bg-warning"
                  )}></div>
                  <div className="flex-1">
                    <p className="text-sm font-medium">{activity.action}</p>
                    <p className="text-xs text-muted-foreground">{activity.time}</p>
                  </div>
                </div>
              ))}
            </div>
          </CardContentPremium>
        </CardPremium>

        {/* Quick Actions */}
        <CardPremium variant="premium">
          <CardHeaderPremium>
            <CardTitlePremium>Quick Actions</CardTitlePremium>
          </CardHeaderPremium>
          <CardContentPremium>
            <div className="space-y-3">
              <ButtonPremium variant="default" className="w-full justify-start" size="sm">
                <span className="mr-2">📦</span>
                Create Shipment
              </ButtonPremium>
              <ButtonPremium variant="outline" className="w-full justify-start" size="sm">
                <span className="mr-2">👥</span>
                Add Customer
              </ButtonPremium>
              <ButtonPremium variant="outline" className="w-full justify-start" size="sm">
                <span className="mr-2">📊</span>
                Generate Report
              </ButtonPremium>
              <ButtonPremium variant="outline" className="w-full justify-start" size="sm">
                <span className="mr-2">⚙️</span>
                Settings
              </ButtonPremium>
            </div>
          </CardContentPremium>
        </CardPremium>
      </GridLayoutPremium>

      {/* Performance Metrics */}
      <GridLayoutPremium cols={2} gap="lg">
        <CardPremium variant="glass">
          <CardHeaderPremium>
            <CardTitlePremium>Performance Overview</CardTitlePremium>
          </CardHeaderPremium>
          <CardContentPremium>
            <div className="space-y-4">
              {[
                { label: "On-Time Delivery", value: "94.2%", trend: "up" },
                { label: "Customer Satisfaction", value: "4.8/5", trend: "up" },
                { label: "Average Transit Time", value: "2.3 days", trend: "down" },
                { label: "Cost per Shipment", value: "$45.20", trend: "down" },
              ].map((metric, index) => (
                <div key={index} className="flex items-center justify-between p-3 rounded-lg bg-background/50">
                  <span className="text-sm font-medium">{metric.label}</span>
                  <div className="flex items-center space-x-2">
                    <span className="font-bold">{metric.value}</span>
                    <div className={cn(
                      "w-2 h-2 rounded-full",
                      metric.trend === "up" && "bg-success",
                      metric.trend === "down" && "bg-destructive"
                    )}></div>
                  </div>
                </div>
              ))}
            </div>
          </CardContentPremium>
        </CardPremium>

        <CardPremium variant="elevated">
          <CardHeaderPremium>
            <CardTitlePremium>System Status</CardTitlePremium>
          </CardHeaderPremium>
          <CardContentPremium>
            <div className="space-y-4">
              {[
                { service: "API Gateway", status: "operational", uptime: "99.9%" },
                { service: "Database", status: "operational", uptime: "99.8%" },
                { service: "Tracking Service", status: "operational", uptime: "99.7%" },
                { service: "Payment Gateway", status: "maintenance", uptime: "98.5%" },
              ].map((service, index) => (
                <div key={index} className="flex items-center justify-between p-3 rounded-lg bg-background/50">
                  <div className="flex items-center space-x-3">
                    <div className={cn(
                      "w-2 h-2 rounded-full",
                      service.status === "operational" && "bg-success animate-pulse-glow",
                      service.status === "maintenance" && "bg-warning animate-pulse-glow"
                    )}></div>
                    <span className="text-sm font-medium">{service.service}</span>
                  </div>
                  <span className="text-xs text-muted-foreground">{service.uptime}</span>
                </div>
              ))}
            </div>
          </CardContentPremium>
        </CardPremium>
      </GridLayoutPremium>
    </div>
  )
}

export { OpsCommandGridPremium }

