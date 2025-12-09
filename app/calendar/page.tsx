"use client"

import * as React from "react"
import FullCalendar from "@fullcalendar/react"
import dayGridPlugin from "@fullcalendar/daygrid"

import shipments from "../dashboard/shipments-table-data.json"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"

export default function CalendarPage() {
  type Shipment = {
    shipment_ref: string
    created_at: string
    customer_name: string
    status: "pending" | "in_transit" | "delivered" | "cancelled"
  }

  const [filters, setFilters] = React.useState<Record<Shipment["status"], boolean>>({
    pending: true,
    in_transit: true,
    delivered: true,
    cancelled: true,
  })

  const raw = shipments as unknown as Array<{
    shipment_ref: string
    created_at: string
    customer_name: string
    status: string
  }>

  const allShipments: Shipment[] = raw.map((s) => ({
    shipment_ref: s.shipment_ref,
    created_at: s.created_at,
    customer_name: s.customer_name,
    status: (s.status as Shipment["status"]),
  }))

  const filtered = allShipments.filter((s: Shipment) => filters[s.status])

  const events = filtered.map((s: Shipment) => ({
    id: s.shipment_ref,
    title: `${s.customer_name} • ${s.shipment_ref}`,
    start: s.created_at,
  }))

  return (
    <div className="px-4 pb-8 pt-4 lg:px-6">
      <div className="mb-3 flex flex-wrap gap-2">
        {(
          [
            { key: "pending", label: "Pending" },
            { key: "in_transit", label: "In transit" },
            { key: "delivered", label: "Delivered" },
            { key: "cancelled", label: "Cancelled" },
          ] as const
        ).map(({ key, label }) => (
          <Button
            key={key}
            size="sm"
            variant={filters[key] ? "default" : "outline"}
            className={cn("h-7 px-2", !filters[key] && "opacity-80")}
            onClick={() => setFilters((f) => ({ ...f, [key]: !f[key] }))}
          >
            {label}
          </Button>
        ))}
      </div>
      <FullCalendar
        plugins={[dayGridPlugin]}
        initialView="dayGridMonth"
        height="auto"
        headerToolbar={{
          left: "prev,next today",
          center: "title",
          right: "dayGridMonth",
        }}
        eventClick={(arg) => {
          const id = arg.event.id
          if (id) {
            window.location.href = `/dashboard?q=${encodeURIComponent(id)}`
          }
        }}
        events={events}
      />
    </div>
  )
}
