"use client";

import { useEffect, useMemo, useState, useCallback } from "react";
import DashboardPageLayout from "@/components/dashboard/layout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { EmptyState } from "@/components/ui/empty-state";
import { Skeleton } from "@/components/ui/skeleton";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import WarehouseIcon from "@/components/icons/warehouse";
import { supabase } from "@/lib/supabaseClient";
import { useToast } from "@/hooks/use-toast";
import { useTapanAssociateContext } from "@/components/layout/tapan-associate-context";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu";
import { MoreHorizontal } from "lucide-react";
import { useLocation, useLocationScopeChange } from "@/lib/location-context";
import { LocationIndicator } from "@/components/dashboard/location-selector";
import type { Location } from "@/types/auth";
import type { UIWarehouse } from "@/features/warehouse/types";
import { WarehouseGrid } from "@/features/warehouse/warehouse-grid";
import { WarehouseDialog } from "@/features/warehouse/warehouse-dialog";

const warehouseSchema = z.object({
  name: z.string().min(2, "Name is required"),
  location: z.string().min(2, "Location is required"),
  staff: z.coerce.number().min(0).optional().or(z.nan()),
  docks: z.coerce.number().min(0).optional().or(z.nan()),
  status: z.enum(["operational", "constrained", "offline"]).default("operational"),
});

type WarehouseFormValues = z.infer<typeof warehouseSchema>;

export default function WarehouseManagement() {
  const [searchTerm, setSearchTerm] = useState("");
  const [warehouseData, setWarehouseData] = useState<UIWarehouse[]>([]);
  const [loading, setLoading] = useState(true);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isCreating, setIsCreating] = useState(false);
  const [editingWarehouse, setEditingWarehouse] = useState<UIWarehouse | null>(null);
  const [updatingStatusId, setUpdatingStatusId] = useState<string | null>(null);
  const [userRole, setUserRole] = useState<string | null>(null);
  const [roleLoaded, setRoleLoaded] = useState(false);
  const { toast } = useToast();
  const { setModuleContext } = useTapanAssociateContext();
  
  // Location context for filtering
  const { locationScope, getLocationFilter, isViewingAll, scopeLabel } = useLocation();

  const form = useForm<WarehouseFormValues>({
    resolver: zodResolver(warehouseSchema),
    defaultValues: {
      name: "",
      location: "",
      status: "operational",
    },
  });

  // Load warehouses with location filter
  const loadWarehouses = useCallback(async () => {
    setLoading(true);
    try {
      let query = supabase
        .from("warehouses")
        .select(
          "id, name, location, capacity_used, items_stored, items_in_transit, status, created_at, updated_at, staff_count, dock_count"
        );

      // Apply location filter if not viewing all
      const locationFilter = getLocationFilter() as { location?: Location };
      if (locationFilter.location) {
        query = query.eq("location", locationFilter.location);
      }

      const { data, error } = await query;

      if (error) {
        console.warn("Supabase warehouses error", error.message);
        throw error;
      }

      const normalized: UIWarehouse[] = ((data as any[]) ?? []).map((row) => {
        const location: string = row.location ?? "";

        return {
          id: row.id,
          name: row.name ?? "",
          location,
          capacityUsed: Number(row.capacity_used ?? 0),
          itemsInTransit: row.items_in_transit ?? 0,
          itemsStored: row.items_stored ?? 0,
          staff: Number(row.staff_count ?? 0),
          docks: Number(row.dock_count ?? 0),
          status: row.status ?? "operational",
          lastUpdated: row.updated_at ?? row.created_at ?? "",
        };
      });

      setWarehouseData(normalized);
      setLoading(false);
    } catch (err) {
      console.error("Failed to load warehouses from Supabase", err);
      setWarehouseData([]);
      setLoading(false);
    }
  }, [getLocationFilter]);

  // Initial load
  useEffect(() => {
    loadWarehouses();
  }, [loadWarehouses]);

  // Reload when location scope changes
  useLocationScopeChange(() => {
    loadWarehouses();
  });

  useEffect(() => {
    let cancelled = false;

    async function loadUserRole() {
      try {
        const {
          data: { user },
          error,
        } = await supabase.auth.getUser();

        if (error || !user) {
          if (!cancelled) {
            setUserRole(null);
            setRoleLoaded(true);
          }
          return;
        }

        const { data, error: userError } = await supabase
          .from("users")
          .select("role")
          .eq("id", user.id)
          .maybeSingle();

        if (cancelled) return;

        if (userError || !data) {
          setUserRole(null);
        } else {
          setUserRole((data.role as string | null) ?? null);
        }
        setRoleLoaded(true);
      } catch (err) {
        if (cancelled) return;
        console.warn("Failed to load user role for warehouses page", err);
        setUserRole(null);
        setRoleLoaded(true);
      }
    }

    loadUserRole();

    return () => {
      cancelled = true;
    };
  }, []);

  const canEdit = userRole === "manager" || userRole === "admin";

  const handleCreateWarehouse = async (values: WarehouseFormValues) => {
    setIsCreating(true);
    try {
      const payload: any = {
        name: values.name.trim(),
        location: values.location.trim(),
        status: values.status,
        capacity_used: 0,
        items_stored: 0,
        items_in_transit: 0,
      };

      if (!Number.isNaN(values.staff ?? Number.NaN)) {
        payload.staff_count = Number(values.staff);
      }

      if (!Number.isNaN(values.docks ?? Number.NaN)) {
        payload.dock_count = Number(values.docks);
      }

      const { data, error } = await supabase
        .from("warehouses")
        .insert(payload)
        .select(
          "id, name, location, capacity_used, items_stored, items_in_transit, status, created_at, updated_at, staff_count, dock_count"
        )
        .single();

      if (error || !data) {
        throw error || new Error("Failed to create warehouse");
      }

      const newWarehouse: UIWarehouse = {
        id: data.id,
        name: data.name ?? "",
        location: data.location ?? "",
        capacityUsed: Number(data.capacity_used ?? 0),
        itemsInTransit: data.items_in_transit ?? 0,
        itemsStored: data.items_stored ?? 0,
        staff: Number(data.staff_count ?? 0),
        docks: Number(data.dock_count ?? 0),
        status: data.status ?? "operational",
        lastUpdated: data.updated_at ?? data.created_at ?? "",
      };

      setWarehouseData((prev) => [newWarehouse, ...prev]);
      setIsDialogOpen(false);
      setEditingWarehouse(null);
      form.reset({
        name: "",
        location: "",
        status: "operational",
      });

      toast({
        title: "Warehouse created",
        description: `${newWarehouse.name} has been added to the network.`,
      });
    } catch (err: any) {
      console.error("Failed to create warehouse", err);
      toast({
        title: "Could not create warehouse",
        description:
          err?.message || "Something went wrong while creating the warehouse.",
        variant: "destructive",
      });
    } finally {
      setIsCreating(false);
    }
  };

  useEffect(() => {
    if (loading) {
      return;
    }

    let totalStored = 0;
    let totalInTransit = 0;
    const statusCounts: Record<string, number> = {};

    warehouseData.forEach((w) => {
      totalStored += w.itemsStored || 0;
      totalInTransit += w.itemsInTransit || 0;
      const key = w.status || "unknown";
      statusCounts[key] = (statusCounts[key] ?? 0) + 1;
    });

    const contextPayload = {
      type: "warehouse",
      summary: {
        totalStored,
        totalInTransit,
        totalWarehouses: warehouseData.length,
      },
      statusCounts,
      sampleWarehouses: warehouseData.slice(0, 5).map((w) => ({
        id: w.id,
        name: w.name,
        location: w.location,
        status: w.status,
        capacityUsed: w.capacityUsed,
        itemsStored: w.itemsStored,
        itemsInTransit: w.itemsInTransit,
      })),
    };

    setModuleContext(contextPayload);

    return () => {
      setModuleContext(null);
    };
  }, [loading, warehouseData, setModuleContext]);

  const handleUpdateWarehouse = async (
    current: UIWarehouse,
    values: WarehouseFormValues
  ) => {
    setIsCreating(true);
    try {
      const payload: any = {
        name: values.name.trim(),
        location: values.location.trim(),
        status: values.status,
      };

      if (!Number.isNaN(values.staff ?? Number.NaN)) {
        payload.staff_count = Number(values.staff);
      }

      if (!Number.isNaN(values.docks ?? Number.NaN)) {
        payload.dock_count = Number(values.docks);
      }

      const { data, error } = await supabase
        .from("warehouses")
        .update(payload)
        .eq("id", current.id)
        .select(
          "id, name, location, capacity_used, items_stored, items_in_transit, status, created_at, updated_at, staff_count, dock_count"
        )
        .maybeSingle();

      if (error || !data) {
        throw error || new Error("Failed to update warehouse");
      }

      const updated: UIWarehouse = {
        id: data.id,
        name: data.name ?? "",
        location: data.location ?? "",
        capacityUsed: Number(data.capacity_used ?? 0),
        itemsInTransit: data.items_in_transit ?? 0,
        itemsStored: data.items_stored ?? 0,
        staff: Number(data.staff_count ?? 0),
        docks: Number(data.dock_count ?? 0),
        status: data.status ?? "operational",
        lastUpdated: data.updated_at ?? data.created_at ?? "",
      };

      setWarehouseData((prev) =>
        prev.map((w) => (w.id === updated.id ? updated : w))
      );
      setIsDialogOpen(false);
      setEditingWarehouse(null);
      form.reset({
        name: "",
        location: "",
        status: "operational",
      });

      toast({
        title: "Warehouse updated",
        description: `${updated.name} has been updated.`,
      });
    } catch (err: any) {
      console.error("Failed to update warehouse", err);
      toast({
        title: "Could not update warehouse",
        description:
          err?.message || "Something went wrong while updating the warehouse.",
        variant: "destructive",
      });
    } finally {
      setIsCreating(false);
    }
  };

  const handleSubmitWarehouse = async (values: WarehouseFormValues) => {
    if (editingWarehouse) {
      await handleUpdateWarehouse(editingWarehouse, values);
    } else {
      await handleCreateWarehouse(values);
    }
  };

  const handleDeleteWarehouse = async (warehouse: UIWarehouse) => {
    if (!canEdit) {
      toast({
        title: "Insufficient permissions",
        description: "Only manager or admin users can delete warehouses.",
        variant: "destructive",
      });
      return;
    }

    const confirmDelete = window.confirm(
      `Delete warehouse ${warehouse.name}? This action cannot be undone.`
    );
    if (!confirmDelete) return;

    try {
      const { error } = await supabase
        .from("warehouses")
        .delete()
        .eq("id", warehouse.id);

      if (error) {
        throw error;
      }

      setWarehouseData((prev) =>
        prev.filter((w) => w.id !== warehouse.id)
      );

      toast({
        title: "Warehouse deleted",
        description: `${warehouse.name} has been removed from the network.`,
      });
    } catch (err: any) {
      console.error("Failed to delete warehouse", err);
      toast({
        title: "Could not delete warehouse",
        description:
          err?.message || "Something went wrong while deleting the warehouse.",
        variant: "destructive",
      });
    }
  };

  const handleUpdateWarehouseStatus = async (
    warehouseId: string,
    nextStatus: WarehouseFormValues["status"]
  ) => {
    if (!canEdit) {
      toast({
        title: "Insufficient permissions",
        description: "Only manager or admin users can change warehouse status.",
        variant: "destructive",
      });
      return;
    }

    const current = warehouseData.find((w) => w.id === warehouseId);
    if (!current || current.status === nextStatus) return;

    setUpdatingStatusId(warehouseId);
    try {
      const { error } = await supabase
        .from("warehouses")
        .update({ status: nextStatus })
        .eq("id", warehouseId);

      if (error) {
        throw error;
      }

      setWarehouseData((prev) =>
        prev.map((w) =>
          w.id === warehouseId
            ? { ...w, status: nextStatus }
            : w
        )
      );

      toast({
        title: "Status updated",
        description: `Warehouse status set to ${nextStatus}.`,
      });
    } catch (err: any) {
      console.error("Failed to update warehouse status", err);
      toast({
        title: "Could not update status",
        description:
          err?.message || "Something went wrong while updating the status.",
        variant: "destructive",
      });
    } finally {
      setUpdatingStatusId(null);
    }
  };

  const primaryWarehouses = useMemo(
    () =>
      warehouseData.filter((warehouse) => {
        const name = warehouse.name.toLowerCase();
        const location = warehouse.location.toLowerCase();
        return (
          name.includes("imphal") ||
          location.includes("imphal") ||
          name.includes("delhi") ||
          name.includes("new delhi") ||
          location.includes("delhi") ||
          location.includes("new delhi")
        );
      }),
    [warehouseData]
  );

  const filteredWarehouse = useMemo(
    () =>
      primaryWarehouses.filter(
        (warehouse) =>
          warehouse.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
          warehouse.location.toLowerCase().includes(searchTerm.toLowerCase())
      ),
    [primaryWarehouses, searchTerm]
  );

  const summary = useMemo(
    () => {
      const totalStored = primaryWarehouses.reduce(
        (sum, w) => sum + Number(w.itemsStored ?? 0),
        0
      );
      const totalInTransit = primaryWarehouses.reduce(
        (sum, w) => sum + Number(w.itemsInTransit ?? 0),
        0
      );
      const totalWarehouses = primaryWarehouses.length;

      return {
        totalStored,
        totalInTransit,
        totalWarehouses,
      };
    },
    [primaryWarehouses]
  );

  return (
    <DashboardPageLayout
      header={{
        title: "Warehouse Management",
        description: "Real-time inventory status across all locations",
        icon: WarehouseIcon,
      }}
    >
      <div className="space-y-6">
        {/* Search Bar & New Warehouse */}
        <Card>
          <CardHeader className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
            <CardTitle>Warehouses</CardTitle>
            <WarehouseDialog
              open={isDialogOpen}
              onOpenChange={setIsDialogOpen}
              canEdit={canEdit}
              isCreating={isCreating}
              editingWarehouse={editingWarehouse}
              form={form}
              onSubmit={handleSubmitWarehouse as any}
              onNewWarehouseClick={() => {
                if (!canEdit) return;
                setEditingWarehouse(null);
                setIsDialogOpen(true);
              }}
            />
          </CardHeader>
          <CardContent>
            <Input
              placeholder="Search by warehouse name or location..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full"
            />
          </CardContent>
        </Card>

        {/* Network Summary */}
        <Card className="shadow-sm">
          <CardHeader className="pb-2 px-4 sm:px-6 pt-4 sm:pt-6">
            <CardTitle className="text-xs sm:text-sm">Network Summary</CardTitle>
            <CardDescription className="text-[10px] sm:text-xs">
              Snapshot across all warehouses
            </CardDescription>
          </CardHeader>
          <CardContent className="grid grid-cols-3 gap-2 sm:gap-4 px-4 sm:px-6 pb-4 sm:pb-6">
            {loading ? (
              <>
                <div>
                  <p className="text-[10px] sm:text-xs text-muted-foreground mb-1">
                    Stored
                  </p>
                  <Skeleton className="h-5 w-16" />
                </div>
                <div>
                  <p className="text-[10px] sm:text-xs text-muted-foreground mb-1">
                    In Transit
                  </p>
                  <Skeleton className="h-5 w-20" />
                </div>
                <div>
                  <p className="text-[10px] sm:text-xs text-muted-foreground mb-1">
                    Warehouses
                  </p>
                  <Skeleton className="h-5 w-12" />
                </div>
              </>
            ) : (
              <>
                <div>
                  <p className="text-[10px] sm:text-xs text-muted-foreground mb-1">
                    Stored
                  </p>
                  <p className="text-base sm:text-lg font-bold">
                    {summary.totalStored.toLocaleString("en-IN")}
                  </p>
                </div>
                <div>
                  <p className="text-[10px] sm:text-xs text-muted-foreground mb-1">
                    In Transit
                  </p>
                  <p className="text-base sm:text-lg font-bold text-primary">
                    {summary.totalInTransit.toLocaleString("en-IN")}
                  </p>
                </div>
                <div>
                  <p className="text-[10px] sm:text-xs text-muted-foreground mb-1">
                    Warehouses
                  </p>
                  <p className="text-base sm:text-lg font-bold">
                    {summary.totalWarehouses}
                  </p>
                </div>
              </>
            )}
          </CardContent>
        </Card>

        {/* Warehouse Grid */}
        <WarehouseGrid
          loading={loading}
          warehouses={filteredWarehouse}
          primaryWarehousesCount={primaryWarehouses.length}
          searchTerm={searchTerm}
          canEdit={canEdit}
          updatingStatusId={updatingStatusId}
          onUpdateStatus={handleUpdateWarehouseStatus}
          onEditWarehouse={(warehouse) => {
            setEditingWarehouse(warehouse);
            form.reset({
              name: warehouse.name,
              location: warehouse.location,
              staff: warehouse.staff,
              docks: warehouse.docks,
              status: warehouse.status as WarehouseFormValues["status"],
            });
            setIsDialogOpen(true);
          }}
          onDeleteWarehouse={handleDeleteWarehouse}
        />
      </div>
    </DashboardPageLayout>
  );
}
