"use client";

import { useEffect, useState, useMemo } from "react";
import { DataTable } from "@/components/ui/data-table";
import { ColumnDef } from "@tanstack/react-table";
import { Button } from "@/components/ui/button";
import { supabase } from "@/lib/supabaseClient";
import { Loader2, FileText } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

type UIReport = {
  id: string;
  name: string;
  type: string;
  generatedAt: string;
  url: string;
};

export default function ReportsPage() {
  const [data, setData] = useState<UIReport[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadReports() {
      try {
        const { data, error } = await supabase
          .from("reports")
          .select("id, name, type, created_at, url")
          .order("created_at", { ascending: false });

        if (error) throw error;

        const normalized: UIReport[] = (data || []).map((r: any) => ({
          id: r.id,
          name: r.name,
          type: r.type,
          generatedAt: r.created_at,
          url: r.url,
        }));

        setData(normalized);
      } catch (error) {
        console.warn("Error loading reports:", error);
        setData([]);
      } finally {
        setLoading(false);
      }
    }

    loadReports();
  }, []);

  const columns: ColumnDef<UIReport>[] = useMemo(
    () => [
      {
        accessorKey: "name",
        header: "Report Name",
        cell: ({ row }) => <span className="font-medium">{row.getValue("name")}</span>,
      },
      {
        accessorKey: "type",
        header: "Type",
        cell: ({ row }) => <span className="uppercase text-xs font-bold text-muted-foreground">{row.getValue("type")}</span>,
      },
      {
        accessorKey: "generatedAt",
        header: "Generated",
        cell: ({ row }) => new Date(row.getValue("generatedAt")).toLocaleDateString(),
      },
      {
        id: "actions",
        cell: ({ row }) => (
          <Button variant="ghost" size="sm" asChild>
            <a href={row.original.url} target="_blank" rel="noopener noreferrer">Download</a>
          </Button>
        ),
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
          <h2 className="text-2xl font-bold tracking-tight">Reports</h2>
          <p className="text-muted-foreground">Access generated operational reports.</p>
        </div>
        <Button className="rounded-none">Generate New Report</Button>
      </div>

      <DataTable columns={columns} data={data} searchKey="name" />
    </div>
  );
}
