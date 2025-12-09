"use client"

import * as React from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"

type ShipmentStatus = "pending" | "in_transit" | "delivered" | "cancelled"

interface RecentShipmentsProps {
  shipments: Array<{
    shipment_ref: string
    customer_name: string
    status: ShipmentStatus
  }>
}

function statusBadge(status: ShipmentStatus) {
  const map: Record<ShipmentStatus, { label: string; className: string }> = {
    pending: { label: "Pending", className: "border-amber-300 text-amber-600" },
    in_transit: { label: "In transit", className: "border-blue-300 text-blue-600" },
    delivered: { label: "Delivered", className: "border-green-300 text-green-600" },
    cancelled: { label: "Cancelled", className: "border-red-300 text-red-600" },
  }
  const { label, className } = map[status]
  return (
    <Badge variant="outline" className={`h-6 px-2 ${className}`}>
      {label}
    </Badge>
  )
}

export function RecentShipments({ shipments }: RecentShipmentsProps) {
  const items = (shipments || []).slice(0, 6)

  return (
    <Card className="@container/card">
      <CardHeader>
        <CardTitle>Recent Shipments</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="flex flex-col gap-4">
          {items.map((s) => (
            <div key={s.shipment_ref} className="flex items-center justify-between gap-3">
              <div className="flex items-center gap-3">
                <Avatar>
                  <AvatarFallback>{s.customer_name?.[0]?.toUpperCase() || "?"}</AvatarFallback>
                </Avatar>
                <div className="flex flex-col">
                  <span className="font-medium leading-none">{s.customer_name}</span>
                  <span className="text-muted-foreground text-xs">{s.shipment_ref}</span>
                </div>
              </div>
              {statusBadge(s.status)}
            </div>
          ))}
          {items.length === 0 && (
            <div className="text-muted-foreground text-sm">No recent shipments.</div>
          )}
        </div>
      </CardContent>
    </Card>
  )
}

export default RecentShipments
