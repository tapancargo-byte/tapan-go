"use client";

import { useEffect, useState, useMemo } from "react";
import { DataTable } from "@/components/ui/data-table";
import { ColumnDef } from "@tanstack/react-table";
import { Button } from "@/components/ui/button";
import { supabase } from "@/lib/supabaseClient";
import { Badge } from "@/components/ui/badge";
import { Loader2, Ticket } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

type UITicket = {
  id: string;
  ticketRef: string;
  subject: string;
  status: string;
  priority: string;
  createdAt: string;
};

export default function SupportPage() {
  const [data, setData] = useState<UITicket[]>([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    async function loadTickets() {
      try {
        const { data, error } = await supabase
          .from("tickets")
          .select("id, ticket_ref, subject, status, priority, created_at")
          .order("created_at", { ascending: false });

        if (error) throw error;

        const normalized: UITicket[] = (data || []).map((t: any) => ({
          id: t.id,
          ticketRef: t.ticket_ref,
          subject: t.subject,
          status: t.status,
          priority: t.priority,
          createdAt: t.created_at,
        }));

        setData(normalized);
      } catch (error) {
        // Suppress error if table doesn't exist yet, just empty state
        console.warn("Error loading tickets (table might not exist):", error);
        setData([]);
      } finally {
        setLoading(false);
      }
    }

    loadTickets();
  }, []);

  const columns: ColumnDef<UITicket>[] = useMemo(
    () => [
      {
        accessorKey: "ticketRef",
        header: "Ref #",
        cell: ({ row }) => <span className="font-mono">{row.getValue("ticketRef")}</span>,
      },
      {
        accessorKey: "subject",
        header: "Subject",
      },
      {
        accessorKey: "priority",
        header: "Priority",
        cell: ({ row }) => {
          const priority = row.getValue("priority") as string;
          let color = "text-muted-foreground";
          if (priority === "high") color = "text-red-500 font-medium";
          if (priority === "medium") color = "text-yellow-500";
          
          return <span className={`capitalize ${color}`}>{priority}</span>;
        },
      },
      {
        accessorKey: "status",
        header: "Status",
        cell: ({ row }) => {
          const status = row.getValue("status") as string;
          return (
            <Badge variant="outline" className="capitalize rounded-sm">
              {status}
            </Badge>
          );
        },
      },
      {
        accessorKey: "createdAt",
        header: "Created",
        cell: ({ row }) => new Date(row.getValue("createdAt")).toLocaleDateString(),
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
          <h2 className="text-2xl font-bold tracking-tight">Support Tickets</h2>
          <p className="text-muted-foreground">Manage customer inquiries and issues.</p>
        </div>
        <Button className="rounded-none">New Ticket</Button>
      </div>

      <DataTable columns={columns} data={data} searchKey="ticketRef" />
    </div>
  );
}
