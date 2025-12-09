"use client";

import { useEffect, useState, useMemo } from "react";
import { DataTable } from "@/components/ui/data-table";
import { ColumnDef } from "@tanstack/react-table";
import { Button } from "@/components/ui/button";
import { supabase } from "@/lib/supabaseClient";
import { Loader2, User } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

type UICustomer = {
  id: string;
  name: string;
  email: string | null;
  phone: string | null;
  createdAt: string;
};

export default function CustomersPage() {
  const [data, setData] = useState<UICustomer[]>([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    async function loadCustomers() {
      try {
        const { data, error } = await supabase
          .from("customers")
          .select("id, name, email, phone, created_at")
          .order("created_at", { ascending: false });

        if (error) throw error;

        const normalized: UICustomer[] = (data || []).map((c: any) => ({
          id: c.id,
          name: c.name,
          email: c.email,
          phone: c.phone,
          createdAt: c.created_at,
        }));

        setData(normalized);
      } catch (error) {
        console.error("Error loading customers:", error);
        toast({
          title: "Error loading customers",
          description: "Please try again later.",
          variant: "destructive",
        });
      } finally {
        setLoading(false);
      }
    }

    loadCustomers();
  }, [toast]);

  const columns: ColumnDef<UICustomer>[] = useMemo(
    () => [
      {
        accessorKey: "name",
        header: "Customer",
        cell: ({ row }) => {
          const name = row.getValue("name") as string;
          return (
            <div className="flex items-center gap-3">
              <Avatar className="h-8 w-8 rounded-full">
                <AvatarFallback>{name.slice(0, 2).toUpperCase()}</AvatarFallback>
              </Avatar>
              <span className="font-medium">{name}</span>
            </div>
          );
        },
      },
      {
        accessorKey: "email",
        header: "Email",
      },
      {
        accessorKey: "phone",
        header: "Phone",
      },
      {
        accessorKey: "createdAt",
        header: "Joined",
        cell: ({ row }) => {
          const date = new Date(row.getValue("createdAt"));
          return date.toLocaleDateString();
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
          <h2 className="text-2xl font-bold tracking-tight">Customers</h2>
          <p className="text-muted-foreground">Manage your client base.</p>
        </div>
        <Button className="rounded-none">Add Customer</Button>
      </div>

      <DataTable columns={columns} data={data} searchKey="name" />
    </div>
  );
}
