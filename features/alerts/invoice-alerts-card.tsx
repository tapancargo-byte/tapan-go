"use client";

import * as React from "react";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import type { UIInvoiceAlert } from "@/features/alerts/types";

interface InvoiceAlertsCardProps {
  loading: boolean;
  alerts: UIInvoiceAlert[];
  formatDate: (value: string) => string;
  onViewInvoice: (invoiceId: string) => void;
}

export function InvoiceAlertsCard({
  loading,
  alerts,
  formatDate,
  onViewInvoice,
}: InvoiceAlertsCardProps) {
  return (
    <Card className="p-6 border-pop bg-background">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-lg font-display">Overdue &amp; At-Risk Invoices</h2>
        <Badge variant="outline">
          {alerts.length} issue
          {alerts.length === 1 ? "" : "s"}
        </Badge>
      </div>

      {loading ? (
        <p className="text-sm text-muted-foreground">Loading alerts...</p>
      ) : alerts.length === 0 ? (
        <p className="text-sm text-muted-foreground">No invoice alerts.</p>
      ) : (
        <div className="space-y-2 text-sm">
          {alerts.map((alert) => (
            <div
              key={alert.id}
              className="flex items-center justify-between border-b border-border/40 last:border-b-0 py-2"
            >
              <div className="space-y-1">
                <p className="font-mono text-primary">{alert.id}</p>
                <p className="text-xs text-muted-foreground">
                  {alert.customerName || "Unknown customer"}
                </p>
              </div>
              <div className="flex items-center gap-3">
                <div className="text-right space-y-1">
                  <p className="text-sm font-semibold">
                    ₹{alert.amount.toLocaleString("en-IN")}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    Due {formatDate(alert.dueDate)} · {alert.daysOverdue} day
                    {alert.daysOverdue === 1 ? "" : "s"} overdue
                  </p>
                </div>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => onViewInvoice(alert.id)}
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
