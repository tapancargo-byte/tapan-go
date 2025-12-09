"use client";

import { useEffect, useState, useMemo } from "react";
import { DataTable } from "@/components/ui/data-table";
import { ColumnDef } from "@tanstack/react-table";
import { Button } from "@/components/ui/button";
import { supabase } from "@/lib/supabaseClient";
import { Badge } from "@/components/ui/badge";
import { Loader2, ExternalLink } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

type InvoiceRecord = {
  id: string;
  invoice_ref: string;
  customer_id: string;
  amount: number;
  status: string;
  due_date: string;
};

// Simplified UI type
type UIInvoice = {
  id: string;
  ref: string;
  customer: string;
  amount: number;
  status: string;
  dueDate: string;
};

export default function InvoicesPage() {
  const [data, setData] = useState<UIInvoice[]>([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    async function loadInvoices() {
      try {
        const { data, error } = await supabase
          .from("invoices")
          .select("id, invoice_ref, amount, status, due_date, customer_id")
          .order("created_at", { ascending: false });

        if (error) throw error;

        // In a real app we'd join customers. For now, placeholder or separate fetch
        const normalized: UIInvoice[] = (data || []).map((inv: any) => ({
          id: inv.id,
          ref: inv.invoice_ref,
          amount: inv.amount,
          status: inv.status,
          dueDate: inv.due_date,
          customer: "Loading...", // Placeholder
        }));

        setData(normalized);
      } catch (error) {
        console.error("Error loading invoices:", error);
        toast({
          title: "Error loading invoices",
          description: "Please try again later.",
          variant: "destructive",
        });
      } finally {
        setLoading(false);
      }
    }

    loadInvoices();
  }, [toast]);

  const columns: ColumnDef<UIInvoice>[] = useMemo(
    () => [
      {
        accessorKey: "ref",
        header: "Invoice #",
        cell: ({ row }) => <span className="font-mono">{row.getValue("ref")}</span>,
      },
      {
        accessorKey: "amount",
        header: "Amount",
        cell: ({ row }) => {
          const amount = parseFloat(row.getValue("amount"));
          return new Intl.NumberFormat("en-IN", {
            style: "currency",
            currency: "INR",
          }).format(amount);
        },
      },
      {
        accessorKey: "dueDate",
        header: "Due Date",
        cell: ({ row }) => {
          const date = new Date(row.getValue("dueDate"));
          return date.toLocaleDateString();
        },
      },
      {
        accessorKey: "status",
        header: "Status",
        cell: ({ row }) => {
          const status = row.getValue("status") as string;
          let variant: "default" | "secondary" | "destructive" | "outline" = "outline";
          if (status === "paid") variant = "default";
          if (status === "overdue") variant = "destructive";
          
          return (
            <Badge variant={variant} className="capitalize rounded-sm">
              {status}
            </Badge>
          );
        },
      },
      {
        id: "actions",
        cell: ({ row }) => (
          <Button variant="ghost" size="sm">
            <ExternalLink className="h-4 w-4 mr-2" />
            View
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
          <h2 className="text-2xl font-bold tracking-tight">Invoices</h2>
          <p className="text-muted-foreground">Manage billing and payments.</p>
        </div>
        <Button className="rounded-none">Create Invoice</Button>
      </div>

      <DataTable columns={columns} data={data} searchKey="ref" />
    </div>
  );
}
