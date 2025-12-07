"use client";

import dynamic from "next/dynamic";
import { Skeleton } from "@/components/ui/skeleton";

// Lazy load heavy dialog components
export const LazyETAUpdateDialog = dynamic(
  () => import("@/components/shipments/eta-update-dialog").then((mod) => ({ default: mod.ETAUpdateDialog })),
  {
    loading: () => (
      <div className="p-4 space-y-4">
        <Skeleton className="h-6 w-48" />
        <Skeleton className="h-10 w-full" />
        <Skeleton className="h-10 w-full" />
        <Skeleton className="h-10 w-full" />
      </div>
    ),
    ssr: false,
  }
);

// Lazy load invoice form dialog
export const LazyInvoiceDialog = dynamic(
  () => import("@/components/ui/dialog").then((mod) => mod.DialogContent),
  { ssr: false }
);

// Lazy load chart components
export const LazyChart = dynamic(
  () => import("@/components/ui/chart").then((mod) => mod.ChartContainer),
  {
    loading: () => <Skeleton className="h-64 w-full" />,
    ssr: false,
  }
);
