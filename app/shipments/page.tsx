"use client";

import { Suspense, useEffect, useMemo, useState } from "react";
import { useSearchParams } from "next/navigation";
import DashboardPageLayout from "@/components/dashboard/layout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import AtomIcon from "@/components/icons/atom";
import { Sheet, SheetContent, SheetFooter, SheetHeader, SheetTitle, SheetDescription } from "@/components/ui/sheet";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { supabase } from "@/lib/supabaseClient";
import { useToast } from "@/hooks/use-toast";
import type { ShipmentRecord } from "@/types/logistics";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface UIShipment {
  dbId: string;
  shipmentId: string;
  customerId: string | null;
  customer: string;
  origin: string;
  destination: string;
  weight: number;
  status: string;
  progress: number;
}

interface ShipmentBarcode {
  id: string;
  barcodeNumber: string;
  status: string;
  lastScannedAt: string | null;
  lastScannedLocation: string | null;
}

interface BarcodeScan {
  id: string;
  scannedAt: string;
  location: string | null;
  scanType: string | null;
}

interface ShipmentScanEvent {
  id: string;
  barcodeNumber: string;
  scannedAt: string;
  location: string | null;
  scanType: string | null;
}

const SHIPMENT_STATUSES = [
  "pending",
  "in-transit",
  "at-warehouse",
  "delivered",
  "cancelled",
] as const;

const shipmentSchema = z.object({
  shipmentRef: z.string().min(3, "Shipment reference is required"),
  customerId: z.string().optional().or(z.literal("")),
  origin: z.string().min(2, "Origin is required"),
  destination: z.string().min(2, "Destination is required"),
  weight: z.coerce.number().min(0.1, "Weight must be greater than 0"),
  status: z.enum(SHIPMENT_STATUSES).default("pending"),
});

type ShipmentFormValues = z.infer<typeof shipmentSchema>;

function ShipmentsTrackingContent() {
  const searchParams = useSearchParams();
  const [searchTerm, setSearchTerm] = useState(
    () => searchParams.get("q") || ""
  );
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [shipments, setShipments] = useState<UIShipment[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedShipment, setSelectedShipment] = useState<UIShipment | null>(null);
  const [updatingStatus, setUpdatingStatus] = useState(false);
  const [shipmentBarcodes, setShipmentBarcodes] = useState<ShipmentBarcode[]>([]);
  const [barcodesLoading, setBarcodesLoading] = useState(false);
  const [activeBarcodeId, setActiveBarcodeId] = useState<string | null>(null);
  const [activeBarcodeScans, setActiveBarcodeScans] = useState<BarcodeScan[]>([]);
  const [barcodeScansLoading, setBarcodeScansLoading] = useState(false);
  const [shipmentTimeline, setShipmentTimeline] = useState<ShipmentScanEvent[]>([]);
  const [shipmentTimelineLoading, setShipmentTimelineLoading] = useState(false);
  const [customers, setCustomers] = useState<{ id: string; name: string }[]>([]);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isCreating, setIsCreating] = useState(false);
  const [generatingBarcode, setGeneratingBarcode] = useState(false);
  const [userRole, setUserRole] = useState<string | null>(null);
  const [roleLoaded, setRoleLoaded] = useState(false);
  const [editingShipment, setEditingShipment] = useState<UIShipment | null>(null);
  const [actionLoading, setActionLoading] = useState<Record<string, boolean>>({});
  const { toast } = useToast();

  const form = useForm<ShipmentFormValues>({
    resolver: zodResolver(shipmentSchema),
    defaultValues: {
      shipmentRef: "",
      customerId: "",
      origin: "",
      destination: "",
      weight: 1,
      status: "pending",
    },
  });

  useEffect(() => {
    let cancelled = false;

    async function loadShipments() {
      setLoading(true);

      try {
        const { data, error } = await supabase
          .from("shipments")
          .select(
            "id, shipment_ref, origin, destination, weight, status, progress, customer_id"
          );

        if (error) {
          console.warn("Supabase shipments error", error.message);
          throw error;
        }

        const shipmentRows: ShipmentRecord[] = (data as ShipmentRecord[] | null) ?? [];

        const customersMap = new Map<string, { id: string; name: string | null }>();
        let customerOptions: { id: string; name: string }[] = [];

        try {
          const { data: customerRows, error: customersError } = await supabase
            .from("customers")
            .select("id, name");

          if (customersError) {
            console.warn(
              "Supabase customers for shipments error, skipping customer join",
              customersError.message
            );
          } else {
            (customerRows ?? []).forEach((c: any) => {
              customersMap.set(c.id, { id: c.id, name: c.name ?? "" });
            });

            customerOptions = (customerRows ?? []).map((c: any) => ({
              id: c.id,
              name: c.name ?? "",
            }));
          }
        } catch (customersErr) {
          console.warn("Supabase customers for shipments error", customersErr);
        }

        const normalized: UIShipment[] = shipmentRows.map((s) => {
          const customer = s.customer_id ? customersMap.get(s.customer_id) : undefined;

          return {
            dbId: s.id,
            shipmentId: s.shipment_ref,
            customerId: (s as any).customer_id ?? null,
            customer: customer?.name ?? "",
            origin: s.origin ?? "",
            destination: s.destination ?? "",
            weight: Number(s.weight ?? 0),
            status: s.status ?? "unknown",
            progress: s.progress ?? 0,
          };
        });

        if (cancelled) return;

        setShipments(normalized);
        setCustomers(customerOptions);
        setLoading(false);
      } catch (err) {
        if (cancelled) return;
        console.error("Failed to load shipments from Supabase", err);
        setShipments([]);
        setCustomers([]);
        setLoading(false);
      }
    }

    loadShipments();

    return () => {
      cancelled = true;
    };
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
        console.warn("Failed to load user role for shipments page", err);
        setUserRole(null);
        setRoleLoaded(true);
      }
    }

    void loadUserRole();

    return () => {
      cancelled = true;
    };
  }, []);

  const statuses = useMemo(
    () => Array.from(new Set(shipments.map((s) => s.status))),
    [shipments]
  );

  const filteredShipments = useMemo(
    () =>
      shipments.filter((shipment) => {
        const matchesSearch =
          shipment.shipmentId.toLowerCase().includes(searchTerm.toLowerCase()) ||
          shipment.customer.toLowerCase().includes(searchTerm.toLowerCase());
        const matchesStatus = statusFilter === "all" || shipment.status === statusFilter;
        return matchesSearch && matchesStatus;
      }),
    [shipments, searchTerm, statusFilter]
  );

  const canEdit = userRole === "manager" || userRole === "admin";

  const getStatusColor = (status: string) => {
    switch (status) {
      case "delivered":
        return "bg-green-500/20 text-green-400";
      case "in-transit":
        return "bg-blue-500/20 text-blue-400";
      case "pending":
        return "bg-yellow-500/20 text-yellow-400";
      case "at-warehouse":
        return "bg-purple-500/20 text-purple-400";
      default:
        return "bg-gray-500/20 text-gray-400";
    }
  };

  const handleSubmitShipment = async (values: ShipmentFormValues) => {
    if (!canEdit) {
      toast({
        title: "Insufficient permissions",
        description: "Only manager or admin users can modify shipments.",
        variant: "destructive",
      });
      return;
    }

    setIsCreating(true);
    try {
      const basePayload: any = {
        shipment_ref: values.shipmentRef.trim(),
        customer_id: values.customerId?.trim() || null,
        origin: values.origin.trim(),
        destination: values.destination.trim(),
        weight: values.weight,
        status: values.status,
      };

      if (editingShipment) {
        if (values.status === "delivered") {
          basePayload.progress = 100;
        }

        const { data, error } = await supabase
          .from("shipments")
          .update(basePayload)
          .eq("id", editingShipment.dbId)
          .select(
            "id, shipment_ref, origin, destination, weight, status, progress, customer_id"
          )
          .maybeSingle();

        if (error || !data) {
          throw error || new Error("Failed to update shipment");
        }

        const customerName = data.customer_id
          ? customers.find((c) => c.id === data.customer_id)?.name ?? ""
          : "";

        const updated: UIShipment = {
          dbId: data.id,
          shipmentId: data.shipment_ref,
          customerId: data.customer_id ?? null,
          customer: customerName,
          origin: data.origin ?? "",
          destination: data.destination ?? "",
          weight: Number(data.weight ?? 0),
          status: data.status ?? "unknown",
          progress: data.progress ?? 0,
        };

        setShipments((prev) =>
          prev.map((s) => (s.dbId === updated.dbId ? updated : s))
        );

        setSelectedShipment((prev) =>
          prev && prev.dbId === updated.dbId ? updated : prev
        );

        toast({
          title: "Shipment updated",
          description: `Shipment ${updated.shipmentId} has been updated.`,
        });
      } else {
        basePayload.progress = values.status === "delivered" ? 100 : 0;

        const { data, error } = await supabase
          .from("shipments")
          .insert(basePayload)
          .select(
            "id, shipment_ref, origin, destination, weight, status, progress, customer_id"
          )
          .single();

        if (error || !data) {
          throw error || new Error("Failed to create shipment");
        }

        const customerName = data.customer_id
          ? customers.find((c) => c.id === data.customer_id)?.name ?? ""
          : "";

        const newShipment: UIShipment = {
          dbId: data.id,
          shipmentId: data.shipment_ref,
          customerId: data.customer_id ?? null,
          customer: customerName,
          origin: data.origin ?? "",
          destination: data.destination ?? "",
          weight: Number(data.weight ?? 0),
          status: data.status ?? "unknown",
          progress: data.progress ?? 0,
        };

        setShipments((prev) => [newShipment, ...prev]);

        toast({
          title: "Shipment created",
          description: `Shipment ${newShipment.shipmentId} has been created.`,
        });
      }

      setIsDialogOpen(false);
      setEditingShipment(null);
      form.reset({
        shipmentRef: "",
        customerId: "",
        origin: "",
        destination: "",
        weight: 1,
        status: "pending",
      });
    } catch (err: any) {
      console.error("Failed to save shipment", err);
      toast({
        title: "Could not save shipment",
        description:
          err?.message || "Something went wrong while saving the shipment.",
        variant: "destructive",
      });
    } finally {
      setIsCreating(false);
    }
  };

  const handleDeleteShipment = async (shipment: UIShipment) => {
    if (!canEdit) {
      toast({
        title: "Insufficient permissions",
        description: "Only manager or admin users can modify shipments.",
        variant: "destructive",
      });
      return;
    }

    if (shipment.status !== "pending") {
      toast({
        title: "Cannot delete shipment",
        description:
          "Only shipments in pending status can be deleted to preserve history.",
        variant: "destructive",
      });
      return;
    }

    const confirmDelete = window.confirm(
      `Delete shipment ${shipment.shipmentId}? This action cannot be undone.`
    );
    if (!confirmDelete) return;

    setActionLoading((prev) => ({ ...prev, [shipment.dbId]: true }));
    try {
      const { error } = await supabase
        .from("shipments")
        .delete()
        .eq("id", shipment.dbId);

      if (error) {
        throw error;
      }

      setShipments((prev) => prev.filter((s) => s.dbId !== shipment.dbId));

      setSelectedShipment((prev) =>
        prev && prev.dbId === shipment.dbId ? null : prev
      );

      toast({
        title: "Shipment deleted",
        description: `Shipment ${shipment.shipmentId} has been removed.`,
      });
    } catch (err: any) {
      console.error("Failed to delete shipment", err);
      toast({
        title: "Could not delete shipment",
        description:
          err?.message || "Something went wrong while deleting the shipment.",
        variant: "destructive",
      });
    } finally {
      setActionLoading((prev) => {
        const next = { ...prev };
        delete next[shipment.dbId];
        return next;
      });
    }
  };

  const loadBarcodesForShipment = async (shipment: UIShipment) => {
    setBarcodesLoading(true);
    try {
      const { data, error } = await supabase
        .from("barcodes")
        .select(
          "id, barcode_number, status, last_scanned_at, last_scanned_location"
        )
        .eq("shipment_id", shipment.dbId);

      if (error) {
        console.error("Failed to load barcodes for shipment", error.message);
        setShipmentBarcodes([]);
        return;
      }

      const normalized: ShipmentBarcode[] = ((data as any[]) ?? []).map((row) => ({
        id: row.id,
        barcodeNumber: row.barcode_number,
        status: row.status ?? "unknown",
        lastScannedAt: row.last_scanned_at ?? null,
        lastScannedLocation: row.last_scanned_location ?? null,
      }));

      setShipmentBarcodes(normalized);
    } finally {
      setBarcodesLoading(false);
    }
  };

  const loadShipmentTimeline = async (shipment: UIShipment) => {
    setShipmentTimelineLoading(true);
    try {
      const { data: barcodes, error: barcodesError } = await supabase
        .from("barcodes")
        .select("id, barcode_number")
        .eq("shipment_id", shipment.dbId);

      if (barcodesError) {
        console.error(
          "Failed to load barcodes for shipment timeline",
          barcodesError.message
        );
        setShipmentTimeline([]);
        return;
      }

      const rows = (barcodes as any[]) ?? [];
      if (rows.length === 0) {
        setShipmentTimeline([]);
        return;
      }

      const idToBarcode: Record<string, string> = {};
      const barcodeIds: string[] = [];
      rows.forEach((row) => {
        const id = row.id as string;
        const num = (row.barcode_number as string | null) ?? "";
        idToBarcode[id] = num;
        barcodeIds.push(id);
      });

      const { data: scans, error: scansError } = await supabase
        .from("package_scans")
        .select("id, barcode_id, scanned_at, location, scan_type")
        .in("barcode_id", barcodeIds)
        .order("scanned_at", { ascending: false });

      if (scansError) {
        console.error("Failed to load shipment scan timeline", scansError.message);
        setShipmentTimeline([]);
        return;
      }

      const events: ShipmentScanEvent[] = ((scans as any[]) ?? []).map((row) => ({
        id: row.id as string,
        barcodeNumber:
          idToBarcode[(row.barcode_id as string | null) ?? ""] || "",
        scannedAt: row.scanned_at as string,
        location: (row.location as string | null) ?? null,
        scanType: (row.scan_type as string | null) ?? null,
      }));

      setShipmentTimeline(events);
    } finally {
      setShipmentTimelineLoading(false);
    }
  };

  const handleGenerateBarcodeForShipment = async () => {
    if (!selectedShipment || generatingBarcode) return;

    setGeneratingBarcode(true);
    try {
      const timestamp = Date.now();
      const randomSuffix = Math.floor(Math.random() * 10000)
        .toString()
        .padStart(4, "0");
      const barcodeNumber = `TG${timestamp}${randomSuffix}`.slice(0, 20);

      const res = await fetch("/api/barcodes/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          barcodeNumber,
          shipmentId: selectedShipment.dbId,
        }),
      });

      const json = await res.json();

      if (!res.ok || !json?.barcode) {
        throw new Error(json?.error || "Failed to generate barcode");
      }

      toast({
        title: "Barcode generated",
        description: `Barcode ${json.barcode.barcode_number} linked to shipment ${selectedShipment.shipmentId}.`,
      });

      void loadBarcodesForShipment(selectedShipment);
    } catch (err: any) {
      console.error("Failed to generate barcode", err);
      toast({
        title: "Could not generate barcode",
        description:
          err?.message || "Something went wrong while generating the barcode.",
        variant: "destructive",
      });
    } finally {
      setGeneratingBarcode(false);
    }
  };

  const handleCopyTrackingLink = async (shipmentRef: string) => {
    const trimmedRef = shipmentRef.trim();
    if (!trimmedRef) {
      toast({
        title: "Tracking link unavailable",
        description: "This shipment does not have a valid reference.",
        variant: "destructive",
      });
      return;
    }

    const origin =
      typeof window !== "undefined" && window.location?.origin
        ? window.location.origin
        : "";

    if (!origin) {
      toast({
        title: "Could not copy link",
        description: "Tracking link could not be generated in this environment.",
        variant: "destructive",
      });
      return;
    }

    const url = `${origin}/track?ref=${encodeURIComponent(trimmedRef)}`;

    try {
      if (navigator?.clipboard?.writeText) {
        await navigator.clipboard.writeText(url);
      }
      toast({
        title: "Tracking link copied",
        description: url,
      });
    } catch (err) {
      console.error("Failed to copy tracking link", err);
      toast({
        title: "Could not copy link",
        description: `Please copy it manually: ${url}`,
        variant: "destructive",
      });
    }
  };

  const handleOpenTrackingPage = (shipmentRef: string) => {
    const trimmedRef = shipmentRef.trim();
    if (!trimmedRef) {
      toast({
        title: "Tracking page unavailable",
        description: "This shipment does not have a valid reference.",
        variant: "destructive",
      });
      return;
    }

    const url = `/track?ref=${encodeURIComponent(trimmedRef)}`;

    if (typeof window !== "undefined") {
      window.open(url, "_blank", "noopener,noreferrer");
    }
  };

  const loadScansForBarcode = async (barcodeId: string) => {
    setBarcodeScansLoading(true);
    try {
      const { data, error } = await supabase
        .from("package_scans")
        .select("id, scanned_at, location, scan_type")
        .eq("barcode_id", barcodeId)
        .order("scanned_at", { ascending: false });

      if (error) {
        console.error("Failed to load scans for barcode", error.message);
        setActiveBarcodeScans([]);
        return;
      }

      const normalized: BarcodeScan[] = ((data as any[]) ?? []).map((row) => ({
        id: row.id,
        scannedAt: row.scanned_at as string,
        location: row.location ?? null,
        scanType: row.scan_type ?? null,
      }));

      setActiveBarcodeScans(normalized);
    } finally {
      setBarcodeScansLoading(false);
    }
  };

  const handleRowClick = (shipment: UIShipment) => {
    setSelectedShipment(shipment);
    setShipmentBarcodes([]);
    setActiveBarcodeId(null);
    setActiveBarcodeScans([]);
    setShipmentTimeline([]);
    void loadBarcodesForShipment(shipment);
    void loadShipmentTimeline(shipment);
  };

  const handleStatusChange = async (newStatus: string) => {
    if (!selectedShipment) return;

    setUpdatingStatus(true);
    try {
      const { error } = await supabase
        .from("shipments")
        .update({ status: newStatus })
        .eq("shipment_ref", selectedShipment.shipmentId);

      if (error) {
        console.error("Failed to update shipment status", error.message);
        return;
      }

      setShipments((prev) =>
        prev.map((s) =>
          s.shipmentId === selectedShipment.shipmentId ? { ...s, status: newStatus } : s
        )
      );

      setSelectedShipment((prev) =>
        prev ? { ...prev, status: newStatus } : prev
      );
    } finally {
      setUpdatingStatus(false);
    }
  };

  return (
    <DashboardPageLayout
      header={{
        title: "Shipment Tracking",
        description: "Real-time tracking of all active and completed shipments",
        icon: AtomIcon,
      }}
    >
      <Sheet
        open={!!selectedShipment}
        onOpenChange={(open) => {
          if (!open) {
            setSelectedShipment(null);
            setShipmentBarcodes([]);
            setActiveBarcodeId(null);
            setActiveBarcodeScans([]);
          }
        }}
      >
        <div className="space-y-6">
          {/* Filters & New Shipment */}
          <div className="space-y-3">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Input
                placeholder="Search shipment ID or customer..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
              <Select
                value={statusFilter}
                onValueChange={(value) => setStatusFilter(value)}
              >
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="All Status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Status</SelectItem>
                  {statuses.map((status) => (
                    <SelectItem key={status} value={status}>
                      {status.charAt(0).toUpperCase() + status.slice(1)}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {roleLoaded && !canEdit && (
              <p className="text-[11px] text-muted-foreground">
                You have read-only access. Contact an admin to modify shipments.
              </p>
            )}

            <div className="flex justify-end">
              <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
                <Button
                  type="button"
                  className="bg-primary hover:bg-primary/90"
                  disabled={!canEdit}
                  onClick={() => {
                    if (!canEdit) return;
                    setEditingShipment(null);
                    form.reset({
                      shipmentRef: "",
                      customerId: "",
                      origin: "",
                      destination: "",
                      weight: 1,
                      status: "pending",
                    });
                    setIsDialogOpen(true);
                  }}
                >
                  New Shipment
                </Button>

                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>
                      {editingShipment ? "Edit shipment" : "New shipment"}
                    </DialogTitle>
                    <DialogDescription>
                      {editingShipment
                        ? "Update shipment details for operations and tracking."
                        : "Create a new shipment for today&apos;s cargo operations."}
                    </DialogDescription>
                  </DialogHeader>

                  <Form {...form}>
                    <form
                      className="space-y-4 mt-2"
                      onSubmit={form.handleSubmit(handleSubmitShipment)}
                    >
                      <FormField
                        control={form.control}
                        name="shipmentRef"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Shipment reference</FormLabel>
                            <FormControl>
                              <Input
                                placeholder="e.g. TG-IMPH-0001"
                                {...field}
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={form.control}
                        name="customerId"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Customer</FormLabel>
                            <FormControl>
                              <Select
                                value={field.value || "__unassigned__"}
                                onValueChange={(value) =>
                                  field.onChange(
                                    value === "__unassigned__" ? "" : value
                                  )
                                }
                              >
                                <SelectTrigger className="w-full">
                                  <SelectValue placeholder="Unassigned" />
                                </SelectTrigger>
                                <SelectContent>
                                  <SelectItem value="__unassigned__">Unassigned</SelectItem>
                                  {customers.map((customer) => (
                                    <SelectItem key={customer.id} value={customer.id}>
                                      {customer.name}
                                    </SelectItem>
                                  ))}
                                </SelectContent>
                              </Select>
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <FormField
                          control={form.control}
                          name="origin"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Origin</FormLabel>
                              <FormControl>
                                <Input
                                  placeholder="Imphal warehouse, New Delhi hub, ..."
                                  {...field}
                                />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />

                        <FormField
                          control={form.control}
                          name="destination"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Destination</FormLabel>
                              <FormControl>
                                <Input
                                  placeholder="Consignee location or destination hub"
                                  {...field}
                                />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <FormField
                          control={form.control}
                          name="weight"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Weight (kg)</FormLabel>
                              <FormControl>
                                <Input
                                  type="number"
                                  step="0.1"
                                  min="0"
                                  placeholder="Total chargeable weight"
                                  {...field}
                                />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />

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
                                  defaultValue={field.value}
                                >
                                  <SelectTrigger className="w-full">
                                    <SelectValue />
                                  </SelectTrigger>
                                  <SelectContent>
                                    {SHIPMENT_STATUSES.map((status) => (
                                      <SelectItem key={status} value={status}>
                                        {status.charAt(0).toUpperCase() + status.slice(1)}
                                      </SelectItem>
                                    ))}
                                  </SelectContent>
                                </Select>
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                      </div>

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
                          disabled={isCreating || !canEdit}
                        >
                          {isCreating
                            ? editingShipment
                              ? "Saving..."
                              : "Creating..."
                            : editingShipment
                            ? "Save changes"
                            : "Create shipment"}
                        </Button>
                      </DialogFooter>
                    </form>
                  </Form>
                </DialogContent>
              </Dialog>
            </div>
          </div>

          {/* Shipments Table */}
          <Card>
          <CardHeader>
            <CardTitle>
              {loading
                ? "Loading shipments..."
                : `Active Shipments (${filteredShipments.length})`}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-border">
                    <th className="text-left py-2 px-2 font-semibold">Shipment ID</th>
                    <th className="text-left py-2 px-2 font-semibold">Customer</th>
                    <th className="text-left py-2 px-2 font-semibold">Origin</th>
                    <th className="text-left py-2 px-2 font-semibold">Destination</th>
                    <th className="text-left py-2 px-2 font-semibold">Weight</th>
                    <th className="text-left py-2 px-2 font-semibold">Status</th>
                    <th className="text-left py-2 px-2 font-semibold">Progress</th>
                    <th className="text-right py-2 px-2 font-semibold">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredShipments.map((shipment) => (
                    <tr
                      key={shipment.shipmentId}
                      className="border-b border-border hover:bg-muted/50 cursor-pointer"
                      onClick={() => handleRowClick(shipment)}
                    >
                      <td className="py-3 px-2 font-mono text-xs">{shipment.shipmentId}</td>
                      <td className="py-3 px-2">{shipment.customer}</td>
                      <td className="py-3 px-2 text-xs">{shipment.origin}</td>
                      <td className="py-3 px-2 text-xs">{shipment.destination}</td>
                      <td className="py-3 px-2">{shipment.weight}kg</td>
                      <td className="py-3 px-2">
                        <span
                          className={`px-2 py-1 rounded text-xs font-semibold ${getStatusColor(
                            shipment.status
                          )}`}
                        >
                          {shipment.status.toUpperCase()}
                        </span>
                      </td>
                      <td className="py-3 px-2">
                        <div className="w-24 bg-muted rounded-full h-1.5">
                          <div
                            className="bg-primary h-full rounded-full"
                            style={{ width: `${shipment.progress}%` }}
                          ></div>
                        </div>
                      </td>
                      <td className="py-3 px-2 text-right space-x-2">
                        <Button
                          type="button"
                          variant="outline"
                          size="sm"
                          onClick={(e) => {
                            e.stopPropagation();
                            setEditingShipment(shipment);
                            form.reset({
                              shipmentRef: shipment.shipmentId,
                              customerId: shipment.customerId ?? "",
                              origin: shipment.origin,
                              destination: shipment.destination,
                              weight: shipment.weight,
                              status: shipment.status as (typeof SHIPMENT_STATUSES)[number],
                            });
                            setIsDialogOpen(true);
                          }}
                          disabled={!canEdit}
                        >
                          Edit
                        </Button>
                        <Button
                          type="button"
                          variant="outline"
                          size="sm"
                          className="text-destructive border-destructive/40 hover:bg-red-50 dark:hover:bg-red-950/40"
                          onClick={(e) => {
                            e.stopPropagation();
                            void handleDeleteShipment(shipment);
                          }}
                          disabled={!!actionLoading[shipment.dbId] || !canEdit}
                        >
                          Delete
                        </Button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>
      </div>

      {selectedShipment && (
        <SheetContent side="right">
          <SheetHeader>
            <SheetTitle>Shipment {selectedShipment.shipmentId}</SheetTitle>
            <SheetDescription>
              {selectedShipment.origin || "Unknown origin"} →
              {selectedShipment.destination || "Unknown destination"}
            </SheetDescription>
          </SheetHeader>

          <div className="px-4 space-y-4 text-sm">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-xs text-muted-foreground mb-1">Status</p>
                <span
                  className={`inline-flex px-2 py-1 rounded text-xs font-semibold ${getStatusColor(
                    selectedShipment.status
                  )}`}
                >
                  {selectedShipment.status.toUpperCase()}
                </span>
              </div>
              <div>
                <p className="text-xs text-muted-foreground mb-1">Weight</p>
                <p className="font-mono text-sm">{selectedShipment.weight} kg</p>
              </div>
              <div>
                <p className="text-xs text-muted-foreground mb-1">Progress</p>
                <div className="w-32 bg-muted rounded-full h-1.5">
                  <div
                    className="bg-primary h-full rounded-full"
                    style={{ width: `${selectedShipment.progress}%` }}
                  ></div>
                </div>
              </div>
            </div>

            <div className="space-y-2">
              <p className="text-xs text-muted-foreground">Update status</p>
              <select
                className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                value={selectedShipment.status}
                disabled={updatingStatus}
                onChange={(e) => handleStatusChange(e.target.value)}
              >
                {SHIPMENT_STATUSES.map((status) => (
                  <option key={status} value={status}>
                    {status.charAt(0).toUpperCase() + status.slice(1)}
                  </option>
                ))}
              </select>
            </div>

            <div className="space-y-2 pt-4 border-t border-border/60">
              <div className="flex items-center justify-between">
                <p className="text-xs text-muted-foreground">Linked barcodes</p>
                <Button
                  type="button"
                  size="sm"
                  variant="outline"
                  disabled={generatingBarcode}
                  onClick={handleGenerateBarcodeForShipment}
                >
                  {generatingBarcode ? "Generating..." : "Generate barcode"}
                </Button>
              </div>
              {barcodesLoading ? (
                <p className="text-xs text-muted-foreground">
                  Loading barcodes...
                </p>
              ) : shipmentBarcodes.length === 0 ? (
                <p className="text-xs text-muted-foreground">
                  No barcodes linked to this shipment yet.
                </p>
              ) : (
                <div className="space-y-1 max-h-40 overflow-y-auto">
                  {shipmentBarcodes.map((bc) => {
                    const isActive = activeBarcodeId === bc.id;

                    return (
                      <div
                        key={bc.id}
                        className="text-xs py-1 border-b border-border/40 last:border-b-0 cursor-pointer"
                        onClick={() => {
                          if (isActive) {
                            setActiveBarcodeId(null);
                            setActiveBarcodeScans([]);
                          } else {
                            setActiveBarcodeId(bc.id);
                            setActiveBarcodeScans([]);
                            void loadScansForBarcode(bc.id);
                          }
                        }}
                      >
                        <div className="flex justify-between items-center">
                          <div>
                            <p className="font-mono font-semibold">{bc.barcodeNumber}</p>
                            {bc.lastScannedLocation && (
                              <p className="text-[10px] text-muted-foreground">
                                {bc.lastScannedLocation}
                              </p>
                            )}
                          </div>
                          <div className="text-right">
                            <span className="inline-flex px-2 py-0.5 rounded-full bg-muted text-foreground/80">
                              {bc.status || "unknown"}
                            </span>
                            {bc.lastScannedAt && (
                              <p className="text-[10px] text-muted-foreground mt-0.5">
                                {new Date(bc.lastScannedAt).toLocaleString("en-IN")}
                              </p>
                            )}
                          </div>
                        </div>

                        {isActive && (
                          <div className="mt-1 text-[10px] text-muted-foreground">
                            {barcodeScansLoading ? (
                              <p>Loading scan history...</p>
                            ) : activeBarcodeScans.length === 0 ? (
                              <p>No scans recorded for this barcode yet.</p>
                            ) : (
                              <ul className="space-y-0.5">
                                {activeBarcodeScans.map((scan) => (
                                  <li
                                    key={scan.id}
                                    className="flex justify-between gap-2"
                                  >
                                    <span>
                                      {new Date(scan.scannedAt).toLocaleString("en-IN")}
                                    </span>
                                    <span className="truncate max-w-[120px]">
                                      {scan.location || "Unknown location"}
                                    </span>
                                    <span className="uppercase">
                                      {scan.scanType || "scan"}
                                    </span>
                                  </li>
                                ))}
                              </ul>
                            )}
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
            <div className="space-y-2 pt-4 border-t border-border/60">
              <p className="text-xs text-muted-foreground">Shipment scan timeline</p>
              {shipmentTimelineLoading ? (
                <p className="text-xs text-muted-foreground">
                  Loading shipment history...
                </p>
              ) : shipmentTimeline.length === 0 ? (
                <p className="text-xs text-muted-foreground">
                  No scans recorded for this shipment yet.
                </p>
              ) : (
                <div className="max-h-48 overflow-y-auto text-xs space-y-1">
                  {shipmentTimeline.map((event) => (
                    <div
                      key={event.id}
                      className="flex items-center justify-between gap-2 border-b border-border/40 last:border-b-0 pb-1"
                    >
                      <div className="flex-1 min-w-0">
                        <p className="font-mono text-[10px]">
                          {event.barcodeNumber || "Unknown barcode"}
                        </p>
                        <p className="text-[10px] text-muted-foreground truncate">
                          {event.location || "Unknown location"}
                        </p>
                      </div>
                      <div className="text-right">
                        <p className="text-[10px]">
                          {new Date(event.scannedAt).toLocaleString("en-IN")}
                        </p>
                        <p className="text-[10px] uppercase text-muted-foreground">
                          {event.scanType || "scan"}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          <SheetFooter>
            <div className="flex flex-col gap-2 w-full">
              <div className="flex gap-2 w-full">
                <Button
                  type="button"
                  variant="outline"
                  className="w-full"
                  onClick={() =>
                    handleCopyTrackingLink(selectedShipment.shipmentId)
                  }
                >
                  Copy tracking link
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  className="w-full"
                  onClick={() =>
                    handleOpenTrackingPage(selectedShipment.shipmentId)
                  }
                >
                  Open tracking page
                </Button>
              </div>
              <div className="flex gap-2 w-full">
                <Button
                  type="button"
                  variant="outline"
                  className="w-full"
                  onClick={() => setSelectedShipment(null)}
                >
                  Close
                </Button>
              </div>
            </div>
          </SheetFooter>
        </SheetContent>
      )}
      </Sheet>
    </DashboardPageLayout>
  );
}

export default function ShipmentsTracking() {
  return (
    <Suspense fallback={null}>
      <ShipmentsTrackingContent />
    </Suspense>
  );
}
