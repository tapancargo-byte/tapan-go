"use client";

import { useEffect, useState, useMemo } from "react";
import { DataTable } from "@/components/ui/data-table";
import { ColumnDef } from "@tanstack/react-table";
import { Button } from "@/components/ui/button";
import { supabase } from "@/lib/supabaseClient";
import { Loader2, Bell } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { Badge } from "@/components/ui/badge";

type UIAlert = {
  id: string;
  type: string;
  message: string;
  severity: string;
  createdAt: string;
  isRead: boolean;
};

export default function AlertsPage() {
  const [data, setData] = useState<UIAlert[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadAlerts() {
      try {
        const { data, error } = await supabase
          .from("alerts")
          .select("id, type, message, severity, created_at, is_read")
          .order("created_at", { ascending: false });

        if (error) throw error;

        const normalized: UIAlert[] = (data || []).map((a: any) => ({
          id: a.id,
          type: a.type,
          message: a.message,
          severity: a.severity,
          createdAt: a.created_at,
          isRead: a.is_read,
        }));

        setData(normalized);
      } catch (error) {
        console.warn("Error loading alerts:", error);
        setData([]); // Fail gracefully
      } finally {
        setLoading(false);
      }
    }

    loadAlerts();
  }, []);

  const columns: ColumnDef<UIAlert>[] = useMemo(
    () => [
      {
        accessorKey: "severity",
        header: "Severity",
        cell: ({ row }) => {
          const severity = row.getValue("severity") as string;
          let variant: "default" | "destructive" | "secondary" = "secondary";
          if (severity === "critical") variant = "destructive";
          if (severity === "warning") variant = "default"; // or yellow
          
          return (
            <Badge variant={variant} className="capitalize rounded-sm">
              {severity}
            </Badge>
          );
        },
      },
      {
        accessorKey: "type",
        header: "Type",
        cell: ({ row }) => <span className="uppercase text-xs font-bold text-muted-foreground">{row.getValue("type")}</span>,
      },
      {
        accessorKey: "message",
        header: "Message",
        cell: ({ row }) => (
          <span className={row.original.isRead ? "text-muted-foreground" : "font-medium"}>
            {row.getValue("message")}
          </span>
        ),
      },
      {
        accessorKey: "createdAt",
        header: "Time",
        cell: ({ row }) => new Date(row.getValue("createdAt")).toLocaleString(),
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
          <h2 className="text-2xl font-bold tracking-tight">System Alerts</h2>
          <p className="text-muted-foreground">Monitor operational incidents.</p>
        </div>
        <Button variant="outline" className="rounded-none">Mark All Read</Button>
      </div>

      <DataTable columns={columns} data={data} searchKey="message" />
    </div>
  );
}
