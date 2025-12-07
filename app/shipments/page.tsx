"use client";

import { Suspense, useEffect, useMemo, useState, lazy } from "react";
import { useSearchParams } from "next/navigation";
import dynamic from "next/dynamic";
import DashboardPageLayout from "@/components/dashboard/layout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import TruckIcon from "@/components/icons/truck";
import { Sheet, SheetContent, SheetFooter, SheetHeader, SheetTitle, SheetDescription } from "@/components/ui/sheet";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { supabase } from "@/lib/supabaseClient";
import { useToast } from "@/hooks/use-toast";
import type { ShipmentRecord } from "@/types/logistics";
import type { UIShipment } from "@/features/shipments/types";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { EmptyState } from "@/components/ui/empty-state";
import { Skeleton } from "@/components/ui/skeleton";
import { useTapanAssociateContext } from "@/components/layout/tapan-associate-context";
import { Clock } from "lucide-react";
import { ShipmentsTable } from "@/features/shipments/shipments-table";
import { ShipmentsDialog } from "@/features/shipments/shipments-dialog";

// Lazy load heavy dialog component
const ETAUpdateDialog = dynamic(
  () => import("@/components/shipments/eta-update-dialog").then((mod) => ({ default: mod.ETAUpdateDialog })),
  { ssr: false }
);

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

// Service Routes - Imphal ↔ New Delhi only
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
  const [etaDialogOpen, setEtaDialogOpen] = useState(false);
  const [etaShipment, setEtaShipment] = useState<any>(null);
  const { toast } = useToast();
  const { setModuleContext } = useTapanAssociateContext();

  const form = useForm<ShipmentFormValues>({
    resolver: zodResolver(shipmentSchema),
    defaultValues: {
      shipmentRef: "",
      customerId: "",
      route: "0", // Default to first route (Imphal → New Delhi)
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

  useEffect(() => {
    if (loading) {
      return;
    }

    const statusCounts: Record<string, number> = {};
    shipments.forEach((s) => {
      const key = s.status || "unknown";
      statusCounts[key] = (statusCounts[key] ?? 0) + 1;
    });

    const contextPayload = {
      type: "shipments",
      total: shipments.length,
      statusCounts,
      sampleShipments: filteredShipments.slice(0, 10).map((s) => ({
        id: s.dbId,
        shipmentId: s.shipmentId,
        customer: s.customer,
        origin: s.origin,
        destination: s.destination,
        status: s.status,
        progress: s.progress,
        weight: s.weight,
      })),
    };

    setModuleContext(contextPayload);

    return () => {
      setModuleContext(null);
    };
  }, [loading, shipments, filteredShipments, setModuleContext]);

  // Realtime subscription for shipment updates
  useEffect(() => {
    const channel = supabase
      .channel("shipments-realtime")
      .on(
        "postgres_changes",
        { event: "UPDATE", schema: "public", table: "shipments" },
        (payload) => {
          toast({
            title: "Shipment updated",
            description: `Shipment ${(payload.new as any).shipment_ref} has been updated.`,
          });
          
          // Optimistic update in local state
          setShipments((prev) =>
            prev.map((s) =>
              s.dbId === (payload.new as any).id
                ? {
                    ...s,
                    status: (payload.new as any).status,
                    progress: (payload.new as any).progress,
                  }
                : s
            )
          );
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [toast]);

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
      // Ensure customer_id is null if empty or "__unassigned__"
      const customerId = values.customerId?.trim();
      // Get origin/destination from selected route
      const selectedRoute = SERVICE_ROUTES[parseInt(values.route, 10)] || SERVICE_ROUTES[0];
      const basePayload: any = {
        shipment_ref: values.shipmentRef.trim(),
        customer_id: customerId && customerId !== "__unassigned__" ? customerId : null,
        origin: selectedRoute.origin,
        destination: selectedRoute.destination,
        location: selectedRoute.location,
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
        route: "0",
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

  const handleOpenEtaDialog = async (shipment: UIShipment) => {
    // Fetch full shipment data with ETA fields
    const { data, error } = await supabase
      .from("shipments")
      .select("id, shipment_ref, origin, destination, etd, atd, eta, ata, carrier_name, awb_number, transport_mode, eta_notes")
      .eq("id", shipment.dbId)
      .single();

    if (error) {
      toast({
        title: "Error",
        description: "Failed to load shipment ETA data",
        variant: "destructive",
      });
      return;
    }

    setEtaShipment(data);
    setEtaDialogOpen(true);
  };

  return (
    <DashboardPageLayout
      header={{
        title: "Shipment Tracking",
        description: "Real-time tracking of all active and completed shipments",
        icon: TruckIcon,
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
              <ShipmentsDialog
                open={isDialogOpen}
                onOpenChange={setIsDialogOpen}
                canEdit={canEdit}
                isCreating={isCreating}
                editingShipment={editingShipment}
                customers={customers}
                form={form}
                onSubmit={handleSubmitShipment as any}
                onNewShipmentClick={() => {
                  if (!canEdit) return;
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
          </div>

          {/* Shipments Table */}
          <ShipmentsTable
            loading={loading}
            shipments={filteredShipments}
            actionLoading={actionLoading}
            canEdit={canEdit}
            getStatusColor={getStatusColor}
            onRowClick={handleRowClick}
            onEditShipment={(shipment) => {
              setEditingShipment(shipment);
              const routeIndex = SERVICE_ROUTES.findIndex(
                (r) =>
                  r.origin === shipment.origin &&
                  r.destination === shipment.destination
              );
              form.reset({
                shipmentRef: shipment.shipmentId,
                customerId: shipment.customerId ?? "",
                route: String(routeIndex >= 0 ? routeIndex : 0),
                weight: shipment.weight,
                status:
                  shipment.status as (typeof SHIPMENT_STATUSES)[number],
              });
              setIsDialogOpen(true);
            }}
            onDeleteShipment={(shipment) => {
              void handleDeleteShipment(shipment);
            }}
            searchTerm={searchTerm}
            statusFilter={statusFilter}
          />
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
                  className={`inline-flex px-2 py-1 text-xs font-semibold ${getStatusColor(
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
                <div className="w-32 bg-muted h-1.5">
                  <div
                    className="bg-primary h-full"
                    style={{ width: `${selectedShipment.progress}%` }}
                  ></div>
                </div>
              </div>
            </div>

            <div className="space-y-2">
              <p className="text-xs text-muted-foreground">Update status</p>
              <select
                className="w-full border border-input bg-background px-3 py-2 text-sm"
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

            {/* ETA / Delivery Timeline */}
            <div className="space-y-2 pt-4 border-t border-border/60">
              <div className="flex items-center justify-between">
                <p className="text-xs text-muted-foreground">Delivery Timeline</p>
                <Button
                  type="button"
                  size="sm"
                  variant="outline"
                  onClick={() => handleOpenEtaDialog(selectedShipment)}
                  className="gap-1"
                >
                  <Clock className="h-3 w-3" />
                  Update ETA
                </Button>
              </div>
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
                            <span className="inline-flex px-2 py-0.5 bg-muted text-foreground/80">
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

      {/* ETA Update Dialog */}
      <ETAUpdateDialog
        shipment={etaShipment}
        open={etaDialogOpen}
        onOpenChange={setEtaDialogOpen}
        onSuccess={() => {
          // Close dialog - data will refresh on next open
          setEtaDialogOpen(false);
        }}
      />
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
