"use client";

import { useEffect, useState, useMemo } from "react";
import { DataTable } from "@/components/ui/data-table";
import { ColumnDef } from "@tanstack/react-table";
import { Button } from "@/components/ui/button";
import { supabase } from "@/lib/supabaseClient";
import { Badge } from "@/components/ui/badge";
import { Loader2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { Progress } from "@/components/ui/progress";

type UIWarehouse = {
  id: string;
  name: string;
  location: string;
  capacityUsed: number;
  totalCapacity: number;
  status: string;
};

export default function WarehousePage() {
  const [data, setData] = useState<UIWarehouse[]>([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    async function loadWarehouses() {
      try {
        const { data, error } = await supabase
          .from("warehouses")
          .select("id, name, location, capacity_used, total_capacity, status")
          .order("name", { ascending: true });

        if (error) throw error;

        const normalized: UIWarehouse[] = (data || []).map((w: any) => ({
          id: w.id,
          name: w.name,
          location: w.location,
          capacityUsed: w.capacity_used,
          totalCapacity: w.total_capacity,
          status: w.status,
        }));

        setData(normalized);
      } catch (error) {
        console.error("Error loading warehouses:", error);
        toast({
          title: "Error loading warehouses",
          description: "Please try again later.",
          variant: "destructive",
        });
      } finally {
        setLoading(false);
      }
    }

    loadWarehouses();
  }, [toast]);

  const columns: ColumnDef<UIWarehouse>[] = useMemo(
    () => [
      {
        accessorKey: "name",
        header: "Warehouse",
        cell: ({ row }) => <span className="font-medium">{row.getValue("name")}</span>,
      },
      {
        accessorKey: "location",
        header: "Location",
        cell: ({ row }) => <span className="uppercase">{row.getValue("location")}</span>,
      },
      {
        accessorKey: "utilization",
        header: "Utilization",
        cell: ({ row }) => {
          const used = row.original.capacityUsed;
          const total = row.original.totalCapacity;
          const percentage = total > 0 ? (used / total) * 100 : 0;
          
          return (
            <div className="w-[120px] space-y-1">
              <div className="flex justify-between text-xs text-muted-foreground">
                <span>{used}/{total} units</span>
                <span>{Math.round(percentage)}%</span>
              </div>
              <Progress value={percentage} className="h-2" />
            </div>
          );
        },
      },
      {
        accessorKey: "status",
        header: "Status",
        cell: ({ row }) => {
          const status = row.getValue("status") as string;
          return (
            <Badge variant={status === "active" ? "default" : "secondary"} className="capitalize rounded-sm">
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
          <h2 className="text-2xl font-bold tracking-tight">Warehouse</h2>
          <p className="text-muted-foreground">Inventory and capacity management.</p>
        </div>
        <Button className="rounded-none">Add Warehouse</Button>
      </div>

      <DataTable columns={columns} data={data} searchKey="name" />
    </div>
  );
}
