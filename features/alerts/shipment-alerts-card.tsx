"use client";

import * as React from "react";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import type { UIShipmentAlert } from "@/features/alerts/types";

interface ShipmentAlertsCardProps {
  loading: boolean;
  alerts: UIShipmentAlert[];
  onViewShipment: (shipmentRef: string) => void;
}

export function ShipmentAlertsCard({
  loading,
  alerts,
  onViewShipment,
}: ShipmentAlertsCardProps) {
  return (
    <Card className="p-6 border-pop bg-background">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-lg font-display">Stalled Shipments (&gt; 3 days)</h2>
        <Badge variant="outline">
          {alerts.length} shipment
          {alerts.length === 1 ? "" : "s"}
        </Badge>
      </div>

      {loading ? (
        <p className="text-sm text-muted-foreground">Loading alerts...</p>
      ) : alerts.length === 0 ? (
        <p className="text-sm text-muted-foreground">No stalled shipments.</p>
      ) : (
        <div className="space-y-2 text-sm">
          {alerts.map((alert) => (
            <div
              key={alert.id}
              className="flex items-center justify-between border-b border-border/40 last:border-b-0 py-2"
            >
              <div className="space-y-1">
                <p className="font-mono text-primary">{alert.shipmentRef}</p>
                <p className="text-xs text-muted-foreground">
                  {alert.customerName || "Unknown customer"}
                </p>
              </div>
              <div className="flex items-center gap-3">
                <div className="text-right space-y-1">
                  <p className="text-xs text-muted-foreground uppercase">
                    {alert.status}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    In state for {alert.daysInState} day
                    {alert.daysInState === 1 ? "" : "s"}
                  </p>
                </div>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => onViewShipment(alert.shipmentRef)}
                >
                  View
                </Button>
              </div>
            </div>
          ))}
        </div>
      )}
    </Card>
  );
}
