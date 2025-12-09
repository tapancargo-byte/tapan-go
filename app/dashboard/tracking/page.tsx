"use client";

import { useEffect, useState, useMemo } from "react";
import { DataTable } from "@/components/ui/data-table";
import { ColumnDef } from "@tanstack/react-table";
import { Button } from "@/components/ui/button";
import { supabase } from "@/lib/supabaseClient";
import { Loader2, Globe } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

type UITrackingEvent = {
  id: string;
  shipmentRef: string;
  status: string;
  location: string;
  timestamp: string;
};

export default function TrackingPage() {
  const [data, setData] = useState<UITrackingEvent[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadTrackingEvents() {
      try {
        // Fetch recent scans/events. Assuming 'package_scans' linked to 'barcodes' linked to 'shipments'
        // Simplified query for now: just grab last 50 scans
        const { data, error } = await supabase
          .from("package_scans")
          .select(`
            id, 
            scanned_at, 
            location, 
            status,
            barcodes ( barcode_number, shipment_id )
          `)
          .order("scanned_at", { ascending: false })
          .limit(50);

        if (error) throw error;

        const normalized: UITrackingEvent[] = (data || []).map((scan: any) => ({
          id: scan.id,
          shipmentRef: scan.barcodes?.barcode_number ?? "Unknown", // Simplification
          status: scan.status ?? "scanned",
          location: scan.location ?? "Unknown",
          timestamp: scan.scanned_at,
        }));

        setData(normalized);
      } catch (error) {
        console.warn("Error loading tracking events:", error);
        setData([]);
      } finally {
        setLoading(false);
      }
    }

    loadTrackingEvents();
  }, []);

  const columns: ColumnDef<UITrackingEvent>[] = useMemo(
    () => [
      {
        accessorKey: "shipmentRef",
        header: "Barcode / Ref",
        cell: ({ row }) => <span className="font-mono">{row.getValue("shipmentRef")}</span>,
      },
      {
        accessorKey: "status",
        header: "Event",
        cell: ({ row }) => <span className="capitalize">{row.getValue("status")}</span>,
      },
      {
        accessorKey: "location",
        header: "Location",
      },
      {
        accessorKey: "timestamp",
        header: "Time",
        cell: ({ row }) => new Date(row.getValue("timestamp")).toLocaleString(),
      },
    ],
    []
  );

  if (loading) {
    return (
      <div className="flex h-64 items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">Live Tracking</h2>
          <p className="text-muted-foreground">Real-time scan events stream.</p>
        </div>
        <Button className="rounded-none">Refresh</Button>
      </div>

      <DataTable columns={columns} data={data} searchKey="shipmentRef" />
    </div>
  );
}
