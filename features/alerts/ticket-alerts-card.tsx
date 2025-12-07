"use client";

import * as React from "react";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import type { UITicketAlert } from "@/features/alerts/types";

interface TicketAlertsCardProps {
  loading: boolean;
  alerts: UITicketAlert[];
  formatDate: (value: string) => string;
  onViewTicket: (subject: string) => void;
}

export function TicketAlertsCard({
  loading,
  alerts,
  formatDate,
  onViewTicket,
}: TicketAlertsCardProps) {
  return (
    <Card className="p-6 border-pop bg-background">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-lg font-display">High-Priority Tickets</h2>
        <Badge variant="outline">
          {alerts.length} open
          {alerts.length === 1 ? "" : ""}
        </Badge>
      </div>

      {loading ? (
        <p className="text-sm text-muted-foreground">Loading alerts...</p>
      ) : alerts.length === 0 ? (
        <p className="text-sm text-muted-foreground">
          No high-priority tickets open.
        </p>
      ) : (
        <div className="space-y-2 text-sm">
          {alerts.map((alert) => (
            <div
              key={alert.id}
              className="flex items-center justify-between border-b border-border/40 last:border-b-0 py-2"
            >
              <div className="space-y-1">
                <p className="font-medium text-foreground">{alert.subject}</p>
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
                    Open since {formatDate(alert.createdAt)}
                  </p>
                </div>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => onViewTicket(alert.subject)}
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
