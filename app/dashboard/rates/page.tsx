"use client";

import { useEffect, useState, useMemo } from "react";
import { DataTable } from "@/components/ui/data-table";
import { ColumnDef } from "@tanstack/react-table";
import { Button } from "@/components/ui/button";
import { supabase } from "@/lib/supabaseClient";
import { Loader2, DollarSign } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

type UIRate = {
  id: string;
  origin: string;
  destination: string;
  ratePerKg: number;
  minWeight: number;
  effectiveDate: string;
};

export default function RatesPage() {
  const [data, setData] = useState<UIRate[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadRates() {
      try {
        const { data, error } = await supabase
          .from("rates")
          .select("id, origin, destination, rate_per_kg, min_weight, effective_date")
          .order("created_at", { ascending: false });

        if (error) throw error;

        const normalized: UIRate[] = (data || []).map((r: any) => ({
          id: r.id,
          origin: r.origin,
          destination: r.destination,
          ratePerKg: r.rate_per_kg,
          minWeight: r.min_weight,
          effectiveDate: r.effective_date,
        }));

        setData(normalized);
      } catch (error) {
        console.warn("Error loading rates:", error);
        setData([]);
      } finally {
        setLoading(false);
      }
    }

    loadRates();
  }, []);

  const columns: ColumnDef<UIRate>[] = useMemo(
    () => [
      {
        accessorKey: "origin",
        header: "Origin",
      },
      {
        accessorKey: "destination",
        header: "Destination",
      },
      {
        accessorKey: "ratePerKg",
        header: "Rate / kg",
        cell: ({ row }) => {
          const rate = parseFloat(row.getValue("ratePerKg"));
          return new Intl.NumberFormat("en-IN", {
            style: "currency",
            currency: "INR",
          }).format(rate);
        },
      },
      {
        accessorKey: "minWeight",
        header: "Min Weight (kg)",
      },
      {
        accessorKey: "effectiveDate",
        header: "Effective From",
        cell: ({ row }) => new Date(row.getValue("effectiveDate")).toLocaleDateString(),
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
          <h2 className="text-2xl font-bold tracking-tight">Shipping Rates</h2>
          <p className="text-muted-foreground">Manage service pricing and tariffs.</p>
        </div>
        <Button className="rounded-none">Update Rates</Button>
      </div>

      <DataTable columns={columns} data={data} searchKey="origin" />
    </div>
  );
}
