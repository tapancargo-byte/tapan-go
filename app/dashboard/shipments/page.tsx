"use client";

import { useEffect, useState, useMemo } from "react";
import { DataTable } from "@/components/ui/data-table";
import { ColumnDef } from "@tanstack/react-table";
import { Button } from "@/components/ui/button";
import { supabase } from "@/lib/supabaseClient";
import { UIShipment } from "@/features/shipments/types";
import { Badge } from "@/components/ui/badge";
import { Loader2, Pencil, Trash2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { ShipmentsDialog } from "@/features/shipments/shipments-dialog";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";

const SHIPMENT_STATUSES = [
  "pending",
  "in-transit",
  "at-warehouse",
  "delivered",
  "cancelled",
] as const;

const SERVICE_ROUTES = [
  { origin: "Imphal, MN", destination: "New Delhi, DL", location: "imphal", label: "Imphal → New Delhi" },
  { origin: "New Delhi, DL", destination: "Imphal, MN", location: "newdelhi", label: "New Delhi → Imphal" },
] as const;

const shipmentSchema = z.object({
  shipmentRef: z.string().min(3, "Shipment reference is required"),
  customerId: z.string().optional().or(z.literal("")),
  route: z.string().min(1, "Route is required"),
  weight: z.coerce.number().min(0.1, "Weight must be greater than 0"),
  status: z.enum(SHIPMENT_STATUSES).default("pending"),
});

type ShipmentFormValues = z.infer<typeof shipmentSchema>;

export default function ShipmentsPage() {
  const [data, setData] = useState<UIShipment[]>([]);
  const [loading, setLoading] = useState(true);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingShipment, setEditingShipment] = useState<UIShipment | null>(null);
  const [customers, setCustomers] = useState<{ id: string; name: string }[]>([]);
  const { toast } = useToast();

  const form = useForm<ShipmentFormValues>({
    resolver: zodResolver(shipmentSchema),
    defaultValues: {
      shipmentRef: "",
      customerId: "",
      route: "0",
      weight: 1,
      status: "pending",
    },
  });

  const loadShipments = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from("shipments")
        .select("id, shipment_ref, origin, destination, weight, status, progress, customer_id")
        .order('created_at', { ascending: false });

      if (error) throw error;

      // In a real app we would join customers here properly
      const normalized: UIShipment[] = (data || []).map((s: any) => ({
        dbId: s.id,
        shipmentId: s.shipment_ref,
        origin: s.origin,
        destination: s.destination,
        weight: s.weight,
        status: s.status,
        progress: s.progress,
        customerId: s.customer_id,
        customer: "Loading...", 
      }));

      setData(normalized);
    } catch (error) {
      console.error("Error loading shipments:", error);
      toast({
        title: "Error loading shipments",
        description: "Please try again later.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };
  
  const loadCustomers = async () => {
      const { data } = await supabase.from("customers").select("id, name");
      if (data) {
          setCustomers(data.map((c: any) => ({ id: c.id, name: c.name })));
      }
  };

  useEffect(() => {
    loadShipments();
    loadCustomers();
  }, []);

  const handleSubmit = async (values: ShipmentFormValues) => {
      try {
        const selectedRoute = SERVICE_ROUTES[parseInt(values.route, 10)] || SERVICE_ROUTES[0];
        const payload = {
          shipment_ref: values.shipmentRef,
          customer_id: values.customerId || null,
          origin: selectedRoute.origin,
          destination: selectedRoute.destination,
          location: selectedRoute.location,
          weight: values.weight,
          status: values.status,
          progress: values.status === 'delivered' ? 100 : 0
        };

        if (editingShipment) {
           const { error } = await supabase
            .from("shipments")
            .update(payload)
            .eq("id", editingShipment.dbId);
           if (error) throw error;
           toast({ title: "Shipment updated" });
        } else {
           const { error } = await supabase
            .from("shipments")
            .insert(payload);
           if (error) throw error;
           toast({ title: "Shipment created" });
        }
        
        setIsDialogOpen(false);
        loadShipments();
        
      } catch (error: any) {
        toast({ 
            title: "Error saving shipment", 
            description: error.message,
            variant: "destructive" 
        });
      }
  };

  const handleDelete = async (id: string) => {
      if (!confirm("Are you sure you want to delete this shipment?")) return;
      
      try {
          const { error } = await supabase.from("shipments").delete().eq("id", id);
          if (error) throw error;
          toast({ title: "Shipment deleted" });
          loadShipments();
      } catch (error: any) {
           toast({ 
            title: "Error deleting shipment", 
            description: error.message,
            variant: "destructive" 
        });
      }
  };

  const columns: ColumnDef<UIShipment>[] = useMemo(
    () => [
      {
        accessorKey: "shipmentId",
        header: "Reference",
        cell: ({ row }) => (
          <span className="font-mono font-medium">{row.getValue("shipmentId")}</span>
        ),
      },
      {
        accessorKey: "origin",
        header: "Origin",
      },
      {
        accessorKey: "destination",
        header: "Destination",
      },
      {
        accessorKey: "status",
        header: "Status",
        cell: ({ row }) => {
          const status = row.getValue("status") as string;
          let variant: "default" | "secondary" | "destructive" | "outline" = "secondary";
          
          if (status === "delivered") variant = "default";
          if (status === "pending") variant = "outline";
          if (status === "cancelled") variant = "destructive";
          
          return (
            <Badge variant={variant} className="capitalize rounded-sm">
              {status}
            </Badge>
          );
        },
      },
      {
        accessorKey: "weight",
        header: "Weight (kg)",
      },
      {
        id: "actions",
        cell: ({ row }) => {
          const shipment = row.original;
          return (
            <div className="flex items-center gap-2">
              <Button 
                variant="ghost" 
                size="icon" 
                title="Edit"
                onClick={() => {
                    setEditingShipment(shipment);
                    // Find route index logic
                    const routeIndex = SERVICE_ROUTES.findIndex(
                        (r) => r.origin === shipment.origin && r.destination === shipment.destination
                    );
                    form.reset({
                        shipmentRef: shipment.shipmentId,
                        customerId: shipment.customerId ?? "",
                        route: String(routeIndex >= 0 ? routeIndex : 0),
                        weight: shipment.weight,
                        status: shipment.status as any,
                    });
                    setIsDialogOpen(true);
                }}
              >
                <Pencil className="h-4 w-4" />
              </Button>
              <Button 
                variant="ghost" 
                size="icon" 
                title="Delete"
                className="text-destructive hover:text-destructive"
                onClick={() => handleDelete(shipment.dbId)}
              >
                <Trash2 className="h-4 w-4" />
              </Button>
            </div>
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
           <h2 className="text-2xl font-bold tracking-tight">Shipments</h2>
           <p className="text-muted-foreground">Manage and track all logistics operations.</p>
        </div>
        <ShipmentsDialog 
            open={isDialogOpen}
            onOpenChange={setIsDialogOpen}
            canEdit={true}
            isCreating={false} // Just for loading state in button
            editingShipment={editingShipment}
            customers={customers}
            form={form}
            onSubmit={handleSubmit}
            onNewShipmentClick={() => {
                setEditingShipment(null);
                form.reset({
                    shipmentRef: "",
                    customerId: "",
                    route: "0",
                    weight: 1,
                    status: "pending",
                });
                setIsDialogOpen(true);
            }}
            serviceRoutes={SERVICE_ROUTES}
            statusOptions={SHIPMENT_STATUSES}
        />
      </div>
      
      <DataTable columns={columns} data={data} searchKey="shipmentId" />
    </div>
  );
}
