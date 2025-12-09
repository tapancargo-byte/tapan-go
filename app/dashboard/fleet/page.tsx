"use client";

import { useEffect, useState, useMemo } from "react";
import { DataTable } from "@/components/ui/data-table";
import { ColumnDef } from "@tanstack/react-table";
import { Button } from "@/components/ui/button";
import { supabase } from "@/lib/supabaseClient";
import { Loader2, Truck } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { Badge } from "@/components/ui/badge";

type UIFleet = {
  id: string;
  vehicleNumber: string;
  driverName: string;
  status: string;
  currentLocation: string;
  type: string;
};

export default function FleetPage() {
  const [data, setData] = useState<UIFleet[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadFleet() {
      try {
        // Placeholder table 'fleet' or 'vehicles'
        const { data, error } = await supabase
          .from("vehicles")
          .select("id, vehicle_number, driver_name, status, current_location, type")
          .order("vehicle_number", { ascending: true });

        if (error) throw error;

        const normalized: UIFleet[] = (data || []).map((v: any) => ({
          id: v.id,
          vehicleNumber: v.vehicle_number,
          driverName: v.driver_name,
          status: v.status,
          currentLocation: v.current_location,
          type: v.type,
        }));

        setData(normalized);
      } catch (error) {
        console.warn("Error loading fleet:", error);
        setData([]);
      } finally {
        setLoading(false);
      }
    }

    loadFleet();
  }, []);

  const columns: ColumnDef<UIFleet>[] = useMemo(
    () => [
      {
        accessorKey: "vehicleNumber",
        header: "Vehicle #",
        cell: ({ row }) => <span className="font-mono font-bold">{row.getValue("vehicleNumber")}</span>,
      },
      {
        accessorKey: "type",
        header: "Type",
        cell: ({ row }) => <span className="capitalize">{row.getValue("type")}</span>,
      },
      {
        accessorKey: "driverName",
        header: "Driver",
      },
      {
        accessorKey: "currentLocation",
        header: "Location",
      },
      {
        accessorKey: "status",
        header: "Status",
        cell: ({ row }) => {
          const status = row.getValue("status") as string;
          let variant: "default" | "secondary" | "destructive" | "outline" = "outline";
          if (status === "active") variant = "default";
          if (status === "maintenance") variant = "destructive";
          
          return (
            <Badge variant={variant} className="capitalize rounded-sm">
              {status}
            </Badge>
          );
        },
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
          <h2 className="text-2xl font-bold tracking-tight">Fleet Management</h2>
          <p className="text-muted-foreground">Track vehicles and drivers.</p>
        </div>
        <Button className="rounded-none">Add Vehicle</Button>
      </div>

      <DataTable columns={columns} data={data} searchKey="vehicleNumber" />
    </div>
  );
}
