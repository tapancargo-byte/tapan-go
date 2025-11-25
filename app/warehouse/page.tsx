"use client";

import { useEffect, useMemo, useState } from "react";
import DashboardPageLayout from "@/components/dashboard/layout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import StorageIcon from "@/components/icons/gear";
import { supabase } from "@/lib/supabaseClient";
import { useToast } from "@/hooks/use-toast";
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

interface UIWarehouse {
  id: string;
  name: string;
  location: string;
  capacityUsed: number;
  itemsInTransit: number;
  itemsStored: number;
  staff: number;
  docks: number;
  status: string;
  lastUpdated: string;
}

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

  const form = useForm<WarehouseFormValues>({
    resolver: zodResolver(warehouseSchema),
    defaultValues: {
      name: "",
      location: "",
      status: "operational",
    },
  });

  useEffect(() => {
    let cancelled = false;

    async function loadWarehouses() {
      setLoading(true);
      try {
        const { data, error } = await supabase
          .from("warehouses")
          .select(
            "id, name, location, capacity_used, items_stored, items_in_transit, status, created_at, updated_at, staff_count, dock_count"
          );

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

        if (cancelled) return;

        setWarehouseData(normalized);
        setLoading(false);
      } catch (err) {
        if (cancelled) return;
        console.error("Failed to load warehouses from Supabase", err);
        setWarehouseData([]);
        setLoading(false);
      }
    }

    loadWarehouses();

    return () => {
      cancelled = true;
    }
  }, []);

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

  const filteredWarehouse = useMemo(
    () =>
      warehouseData.filter(
        (warehouse) =>
          warehouse.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
          warehouse.location.toLowerCase().includes(searchTerm.toLowerCase())
      ),
    [warehouseData, searchTerm]
  );

  const summary = useMemo(
    () => {
      const totalStored = warehouseData.reduce(
        (sum, w) => sum + Number(w.itemsStored ?? 0),
        0
      );
      const totalInTransit = warehouseData.reduce(
        (sum, w) => sum + Number(w.itemsInTransit ?? 0),
        0
      );
      const totalWarehouses = warehouseData.length;

      return {
        totalStored,
        totalInTransit,
        totalWarehouses,
      };
    },
    [warehouseData]
  );

  return (
    <DashboardPageLayout
      header={{
        title: "Warehouse Management",
        description: "Real-time inventory status across all locations",
        icon: StorageIcon,
      }}
    >
      <div className="space-y-6">
        {/* Search Bar & New Warehouse */}
        <Card>
          <CardHeader className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
            <CardTitle>Warehouses</CardTitle>
            <Dialog open={isDialogOpen} modal={false}>
              <Button
                type="button"
                className="bg-primary hover:bg-primary/90"
                disabled={!canEdit}
                onClick={() => {
                  if (!canEdit) return;
                  setEditingWarehouse(null);
                  setIsDialogOpen(true);
                }}
              >
                New Warehouse
              </Button>

              <DialogContent>
                <DialogHeader>
                  <DialogTitle>
                    {editingWarehouse ? "Edit warehouse" : "New warehouse"}
                  </DialogTitle>
                  <DialogDescription>
                    Add a new warehouse or hub to the Tapan Go network.
                  </DialogDescription>
                </DialogHeader>

                <Form {...form}>
                  <form
                    className="space-y-4 mt-2"
                    onSubmit={form.handleSubmit(handleSubmitWarehouse)}
                  >
                    <FormField
                      control={form.control}
                      name="name"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Name</FormLabel>
                          <FormControl>
                            <Input
                              placeholder="Singjamei Imphal, Kotla New Delhi, ..."
                              {...field}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="location"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Location</FormLabel>
                          <FormControl>
                            <Input
                              placeholder="Address or area name"
                              {...field}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <FormField
                        control={form.control}
                        name="staff"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Staff count</FormLabel>
                            <FormControl>
                              <Input
                                type="number"
                                min="0"
                                placeholder="e.g. 5"
                                {...field}
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={form.control}
                        name="docks"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Dock doors</FormLabel>
                            <FormControl>
                              <Input
                                type="number"
                                min="0"
                                placeholder="e.g. 2"
                                {...field}
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>

                    <FormField
                      control={form.control}
                      name="status"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Status</FormLabel>
                          <FormControl>
                            <Select
                              value={field.value}
                              onValueChange={field.onChange}
                            >
                              <SelectTrigger className="w-full">
                                <SelectValue />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="operational">Operational</SelectItem>
                                <SelectItem value="constrained">Constrained</SelectItem>
                                <SelectItem value="offline">Offline</SelectItem>
                              </SelectContent>
                            </Select>
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <DialogFooter className="pt-2">
                      <Button
                        type="button"
                        variant="ghost"
                        onClick={() => setIsDialogOpen(false)}
                        className="uppercase"
                      >
                        Cancel
                      </Button>
                      <Button
                        type="submit"
                        className="bg-primary hover:bg-primary/90"
                        disabled={isCreating}
                      >
                        {isCreating
                          ? editingWarehouse
                            ? "Saving..."
                            : "Creating..."
                          : editingWarehouse
                          ? "Save changes"
                          : "Create warehouse"}
                      </Button>
                    </DialogFooter>
                  </form>
                </Form>
              </DialogContent>
            </Dialog>
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
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm">Network Summary</CardTitle>
            <CardDescription className="text-xs">
              Snapshot across all active warehouses in the network
            </CardDescription>
          </CardHeader>
          <CardContent className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <p className="text-xs text-muted-foreground mb-1">Total Stored</p>
              <p className="text-lg font-bold">
                {summary.totalStored.toLocaleString("en-IN")}
              </p>
            </div>
            <div>
              <p className="text-xs text-muted-foreground mb-1">Total In Transit</p>
              <p className="text-lg font-bold text-primary">
                {summary.totalInTransit.toLocaleString("en-IN")}
              </p>
            </div>
            <div>
              <p className="text-xs text-muted-foreground mb-1">Active Warehouses</p>
              <p className="text-lg font-bold">{summary.totalWarehouses}</p>
            </div>
          </CardContent>
        </Card>

        {/* Warehouse Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {filteredWarehouse.map((warehouse) => (
            <Card
              key={warehouse.id}
              className="hover:shadow-lg transition-shadow overflow-visible"
            >
              <CardHeader className="h-auto relative z-10">
                <div className="flex items-start justify-between">
                  <div>
                    <CardTitle>{warehouse.name}</CardTitle>
                    <CardDescription>{warehouse.location}</CardDescription>
                  </div>
                  <div className="flex items-start gap-2">
                    <div className="flex flex-col items-end gap-2">
                      <span
                        className={`px-3 py-1 rounded-full text-xs font-semibold ${
                          warehouse.status === "operational"
                            ? "bg-green-500/20 text-green-400"
                            : warehouse.status === "offline"
                            ? "bg-red-500/20 text-red-400"
                            : "bg-yellow-500/20 text-yellow-400"
                        }`}
                      >
                        {warehouse.status.toUpperCase()}
                      </span>
                      <Select
                        value={warehouse.status}
                        onValueChange={(value) =>
                          handleUpdateWarehouseStatus(
                            warehouse.id,
                            value as WarehouseFormValues["status"]
                          )
                        }
                        disabled={updatingStatusId === warehouse.id || !canEdit}
                      >
                        <SelectTrigger
                          size="sm"
                          className="mt-1 w-auto text-[11px] uppercase tracking-wide"
                        >
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="operational">Operational</SelectItem>
                          <SelectItem value="constrained">Constrained</SelectItem>
                          <SelectItem value="offline">Offline</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button
                          type="button"
                          variant="outline"
                          size="icon"
                          className="h-8 w-8 p-0"
                          disabled={!canEdit}
                        >
                          <MoreHorizontal className="h-4 w-4" />
                          <span className="sr-only">Open warehouse actions</span>
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem
                          onClick={() => {
                            setEditingWarehouse(warehouse);
                            form.reset({
                              name: warehouse.name,
                              location: warehouse.location,
                              staff: warehouse.staff,
                              docks: warehouse.docks,
                              status:
                                warehouse.status as WarehouseFormValues["status"],
                            });
                            setIsDialogOpen(true);
                          }}
                          disabled={!canEdit}
                        >
                          Edit warehouse
                        </DropdownMenuItem>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem
                          variant="destructive"
                          onClick={() => handleDeleteWarehouse(warehouse)}
                          disabled={!canEdit}
                        >
                          Delete warehouse
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="relative z-0 mt-1">
                <div className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <p className="text-xs text-muted-foreground mb-1">Capacity Used</p>
                      <div className="bg-muted rounded-full h-2 overflow-hidden">
                        <div
                          className="bg-primary h-full"
                          style={{ width: `${warehouse.capacityUsed}%` }}
                        ></div>
                      </div>
                      <p className="text-sm font-semibold mt-1">
                        {warehouse.capacityUsed}%
                      </p>
                    </div>
                    <div>
                      <p className="text-xs text-muted-foreground mb-1">Items in Transit</p>
                      <p className="text-lg font-bold text-primary">
                        {warehouse.itemsInTransit}
                      </p>
                    </div>
                  </div>
                  <div className="grid grid-cols-3 gap-2 text-center">
                    <div className="bg-muted rounded p-3">
                      <p className="text-xs text-muted-foreground">Stored</p>
                      <p className="text-lg font-bold">{warehouse.itemsStored}</p>
                    </div>
                    <div className="bg-muted rounded p-3">
                      <p className="text-xs text-muted-foreground">Staff</p>
                      <p className="text-lg font-bold">{warehouse.staff}</p>
                    </div>
                    <div className="bg-muted rounded p-3">
                      <p className="text-xs text-muted-foreground">Docks</p>
                      <p className="text-lg font-bold">{warehouse.docks}</p>
                    </div>
                  </div>
                  <p className="text-xs text-muted-foreground mt-3">
                    Last Updated:{" "}
                    {warehouse.lastUpdated
                      ? new Date(warehouse.lastUpdated).toLocaleString("en-IN")
                      : "Not available"}
                  </p>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </DashboardPageLayout>
  );
}
