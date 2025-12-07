"use client";

import { Card } from "@/components/ui/card";
import type { ARSummary } from "@/features/invoices/types";

interface ArSummaryCardsProps {
  arSummary: ARSummary;
}

export function ArSummaryCards({ arSummary }: ArSummaryCardsProps) {
  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
      <Card className="p-3 border-pop bg-background/60">
        <p className="text-xs text-muted-foreground">Total invoiced</p>
        <p className="text-lg font-semibold">
          ₹{arSummary.totalInvoiced.toLocaleString("en-IN")}
        </p>
      </Card>
      <Card className="p-3 border-pop bg-background/60">
        <p className="text-xs text-muted-foreground">Total paid</p>
        <p className="text-lg font-semibold text-emerald-400">
          ₹{arSummary.totalPaid.toLocaleString("en-IN")}
        </p>
      </Card>
      <Card className="p-3 border-pop bg-background/60">
        <p className="text-xs text-muted-foreground">Outstanding</p>
        <p className="text-lg font-semibold text-yellow-400">
          ₹{arSummary.totalOutstanding.toLocaleString("en-IN")}
        </p>
      </Card>
      <Card className="p-3 border-pop bg-background/60">
        <p className="text-xs text-muted-foreground">Overdue AR</p>
        <p className="text-lg font-semibold text-red-400">
          ₹{arSummary.buckets.overdue.outstanding.toLocaleString("en-IN")}
        </p>
      </Card>
    </div>
  );
}
