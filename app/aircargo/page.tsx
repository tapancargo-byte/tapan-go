"use client";

import { useEffect, useMemo, useState } from "react";
import DashboardPageLayout from "@/components/dashboard/layout";
import AtomIcon from "@/components/icons/atom";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { supabase } from "@/lib/supabaseClient";
import { format } from "date-fns";
import { useToast } from "@/hooks/use-toast";
import { useTapanAssociateContext } from "@/components/layout/tapan-associate-context";

type ManifestStatus = "scheduled" | "dispatched" | "in-transit" | "at-terminal" | "delivered" | string;

interface UIManifest {
  id: string;
  manifestDate: string;
  airlineCode: string;
  origin: string;
  destination: string;
  totalWeight: number;
  totalPieces: number;
  status: ManifestStatus;
  shipments: number;
  estimatedDelivery: string;
  reference: string;
}

const formatDate = (value: string) => {
  if (!value) return "";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value;
  return format(date, "dd/MM/yyyy");
};

const manifestSchema = z.object({
  manifestRef: z.string().min(3, "Manifest reference is required"),
  origin: z.string().min(2, "Origin is required"),
  destination: z.string().min(2, "Destination is required"),
  airlineCode: z.string().min(2, "Airline code is required"),
  manifestDate: z.string().optional().or(z.literal("")),
  status: z
    .enum(["scheduled", "dispatched", "in-transit", "at-terminal", "delivered"])
    .default("scheduled"),
});

type ManifestFormValues = z.infer<typeof manifestSchema>;

export default function AircargoPage() {
  const [searchTerm, setSearchTerm] = useState("");
  const [filterStatus, setFilterStatus] = useState<string>("all");
  const [manifests, setManifests] = useState<UIManifest[]>([]);
  const [loading, setLoading] = useState(true);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isCreating, setIsCreating] = useState(false);
  const [activeManifest, setActiveManifest] = useState<UIManifest | null>(null);
  const [manifestShipments, setManifestShipments] = useState<
    { id: string; shipmentRef: string }[]
  >([]);
  const [shipmentsLoading, setShipmentsLoading] = useState(false);
  const [linkingShipment, setLinkingShipment] = useState(false);
  const [newShipmentRef, setNewShipmentRef] = useState("");
  const { toast } = useToast();
  const { setModuleContext } = useTapanAssociateContext();

  const form = useForm<ManifestFormValues>({
    resolver: zodResolver(manifestSchema),
    defaultValues: {
      manifestRef: "",
      origin: "",
      destination: "",
      airlineCode: "",
      manifestDate: "",
      status: "scheduled",
    },
  });

  useEffect(() => {
    let cancelled = false;

    async function loadManifests() {
      setLoading(true);
      try {
        const { data, error } = await supabase
          .from("manifests")
          .select(
            "id, manifest_ref, origin_hub, destination, airline_code, manifest_date, total_weight, total_pieces, status, created_at"
          );

        if (error) {
          console.warn("Supabase manifests error", error.message);
          throw error;
        }

        const manifestRows = (data as any[]) ?? [];
        const manifestIds = manifestRows.map((row) => row.id as string);

        const shipmentsByManifest = new Map<string, number>();

        if (manifestIds.length > 0) {
          const { data: items, error: itemsError } = await supabase
            .from("manifest_items")
            .select("manifest_id, shipment_id")
            .in("manifest_id", manifestIds);

          if (itemsError) {
            console.warn(
              "Supabase manifest_items error (shipments enrichment)",
              itemsError.message
            );
          } else {
            const map = new Map<string, Set<string>>();
            (items ?? []).forEach((item: any) => {
              const manifestId = item.manifest_id as string | null;
              if (!manifestId) return;
              const shipmentId = item.shipment_id as string | null;
              const set = map.get(manifestId) ?? new Set<string>();
              if (shipmentId) {
                set.add(shipmentId);
              }
              map.set(manifestId, set);
            });

            map.forEach((set, manifestId) => {
              shipmentsByManifest.set(manifestId, set.size);
            });
          }
        }

        const normalized: UIManifest[] = manifestRows.map((row) => {
          const manifestDate = row.manifest_date ?? row.created_at ?? "";
          const estDelivery = manifestDate;
          const shipmentsCount = shipmentsByManifest.get(row.id) ?? 0;

          return {
            id: row.id,
            reference: row.manifest_ref ?? row.id,
            manifestDate,
            airlineCode: row.airline_code ?? "",
            origin: row.origin_hub ?? "",
            destination: row.destination ?? "",
            totalWeight: Number(row.total_weight ?? 0),
            totalPieces: row.total_pieces ?? 0,
            status: (row.status ?? "scheduled") as ManifestStatus,
            shipments: shipmentsCount,
            estimatedDelivery: estDelivery,
          };
        });

        if (cancelled) return;

        setManifests(normalized);
        setLoading(false);
      } catch (err) {
        if (cancelled) return;
        console.error("Failed to load manifests from Supabase", err);
        setManifests([]);
        setLoading(false);
      }
    }

    loadManifests();

    return () => {
      cancelled = true;
    };
  }, []);

  const handleCreateManifest = async (values: ManifestFormValues) => {
    setIsCreating(true);
    try {
      const payload = {
        manifest_ref: values.manifestRef.trim(),
        origin_hub: values.origin.trim(),
        destination: values.destination.trim(),
        airline_code: values.airlineCode.trim(),
        manifest_date: values.manifestDate || null,
        status: values.status,
      };

      const { data, error } = await supabase
        .from("manifests")
        .insert(payload)
        .select(
          "id, manifest_ref, origin_hub, destination, airline_code, manifest_date, total_weight, total_pieces, status, created_at"
        )
        .single();

      if (error || !data) {
        throw error || new Error("Failed to create manifest");
      }

      const manifestDate = data.manifest_date ?? data.created_at ?? "";

      const newManifest: UIManifest = {
        id: data.id,
        reference: data.manifest_ref ?? data.id,
        manifestDate,
        airlineCode: data.airline_code ?? "",
        origin: data.origin_hub ?? "",
        destination: data.destination ?? "",
        totalWeight: Number(data.total_weight ?? 0),
        totalPieces: data.total_pieces ?? 0,
        status: (data.status ?? "scheduled") as ManifestStatus,
        shipments: 0,
        estimatedDelivery: manifestDate,
      };

      setManifests((prev) => [newManifest, ...prev]);
      setIsDialogOpen(false);
      form.reset({
        manifestRef: "",
        origin: "",
        destination: "",
        airlineCode: "",
        manifestDate: "",
        status: "scheduled",
      });

      toast({
        title: "Manifest created",
        description: `Manifest ${newManifest.reference} has been created.`,
      });
    } catch (err: any) {
      console.error("Failed to create manifest", err);
      toast({
        title: "Could not create manifest",
        description:
          err?.message || "Something went wrong while creating the manifest.",
        variant: "destructive",
      });
    } finally {
      setIsCreating(false);
    }
  };

  const openManageShipments = async (manifest: UIManifest) => {
    setActiveManifest(manifest);
    setManifestShipments([]);
    setNewShipmentRef("");
    setShipmentsLoading(true);

    try {
      const { data: items, error: itemsError } = await supabase
        .from("manifest_items")
        .select("shipment_id")
        .eq("manifest_id", manifest.id);

      if (itemsError) {
        console.error(
          "Failed to load manifest_items for manifest",
          itemsError.message
        );
        return;
      }

      const shipmentIds = Array.from(
        new Set(
          ((items as any[]) ?? [])
            .map((row) => row.shipment_id as string | null)
            .filter((id): id is string => !!id)
        )
      );

      if (shipmentIds.length === 0) {
        setManifestShipments([]);
        return;
      }

      const { data: shipments, error: shipmentsError } = await supabase
        .from("shipments")
        .select("id, shipment_ref")
        .in("id", shipmentIds);

      if (shipmentsError) {
        console.error(
          "Failed to load shipments for manifest",
          shipmentsError.message
        );
        setManifestShipments([]);
        return;
      }

      const mapped =
        (shipments as any[] | null)?.map((s) => ({
          id: s.id as string,
          shipmentRef: (s.shipment_ref as string | null) ?? "",
        })) ?? [];

      setManifestShipments(mapped);
    } finally {
      setShipmentsLoading(false);
    }
  };

  const handleAddShipmentToManifest = async () => {
    if (!activeManifest) return;

    const trimmedRef = newShipmentRef.trim();
    if (!trimmedRef) return;

    setLinkingShipment(true);
    try {
      const { data: shipment, error: shipmentError } = await supabase
        .from("shipments")
        .select("id, shipment_ref")
        .eq("shipment_ref", trimmedRef)
        .single();

      if (shipmentError || !shipment) {
        toast({
          title: "Shipment not found",
          description: "No shipment exists with that reference.",
          variant: "destructive",
        });
        return;
      }

      if (manifestShipments.some((s) => s.id === (shipment.id as string))) {
        toast({
          title: "Already linked",
          description: "This shipment is already linked to the manifest.",
        });
        return;
      }

      const { error: insertError } = await supabase
        .from("manifest_items")
        .insert({
          manifest_id: activeManifest.id,
          shipment_id: shipment.id,
        });

      if (insertError) {
        console.error(
          "Failed to link shipment to manifest",
          insertError.message
        );
        toast({
          title: "Could not link shipment",
          description: insertError.message,
          variant: "destructive",
        });
        return;
      }

      const updatedShipments = [
        ...manifestShipments,
        {
          id: shipment.id as string,
          shipmentRef: (shipment.shipment_ref as string | null) ?? "",
        },
      ];
      setManifestShipments(updatedShipments);

      setManifests((prev) =>
        prev.map((m) =>
          m.id === activeManifest.id
            ? { ...m, shipments: m.shipments + 1 }
            : m
        )
      );

      setNewShipmentRef("");
      toast({
        title: "Shipment linked",
        description: "Shipment has been added to this manifest.",
      });
    } catch (err: any) {
      console.error("Failed to add shipment to manifest", err);
      toast({
        title: "Could not link shipment",
        description:
          err?.message || "Something went wrong while linking the shipment.",
        variant: "destructive",
      });
    } finally {
      setLinkingShipment(false);
    }
  };

  const filteredManifests = useMemo(
    () =>
      manifests.filter((manifest) => {
        const matchesSearch =
          manifest.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
          manifest.reference.toLowerCase().includes(searchTerm.toLowerCase()) ||
          manifest.origin.toLowerCase().includes(searchTerm.toLowerCase()) ||
          manifest.destination.toLowerCase().includes(searchTerm.toLowerCase());
        const matchesStatus =
          filterStatus === "all" || manifest.status === filterStatus;
        return matchesSearch && matchesStatus;
      }),
    [manifests, searchTerm, filterStatus]
  );

  const manifestSummary = useMemo(
    () => {
      let totalWeight = 0;
      let totalPieces = 0;
      let totalShipments = 0;

      manifests.forEach((m) => {
        totalWeight += m.totalWeight || 0;
        totalPieces += m.totalPieces || 0;
        totalShipments += m.shipments || 0;
      });

      return {
        count: manifests.length,
        totalWeight,
        totalPieces,
        totalShipments,
      };
    },
    [manifests]
  );

  useEffect(() => {
    if (loading) {
      return;
    }

    const statusCounts: Record<string, number> = {};
    manifests.forEach((m) => {
      const key = m.status || "unknown";
      statusCounts[key] = (statusCounts[key] ?? 0) + 1;
    });

    const contextPayload = {
      type: "aircargo",
      summary: manifestSummary,
      statusCounts,
      sampleManifests: manifests.slice(0, 5).map((m) => ({
        id: m.id,
        reference: m.reference,
        origin: m.origin,
        destination: m.destination,
        status: m.status,
        shipments: m.shipments,
      })),
    };

    setModuleContext(contextPayload);

    return () => {
      setModuleContext(null);
    };
  }, [loading, manifests, manifestSummary, setModuleContext]);

  const getStatusColor = (status: string) => {
    switch (status) {
      case "delivered":
        return "bg-green-500/20 text-green-400";
      case "in-transit":
        return "bg-blue-500/20 text-blue-400";
      case "dispatched":
        return "bg-orange-500/20 text-orange-400";
      case "scheduled":
        return "bg-purple-500/20 text-purple-400";
      case "at-terminal":
        return "bg-yellow-500/20 text-yellow-400";
      default:
        return "bg-gray-500/20 text-gray-400";
    }
  };

  return (
    <DashboardPageLayout
      header={{
        title: "Aircargo Manifesto",
        description: "Manage air terminal shipments and manifests",
        icon: AtomIcon,
      }}
    >
      <div className="flex flex-col gap-6">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <Card className="p-3 border-pop bg-background/60">
            <p className="text-xs text-muted-foreground">Manifests</p>
            <p className="text-lg font-semibold">{manifestSummary.count}</p>
          </Card>
          <Card className="p-3 border-pop bg-background/60">
            <p className="text-xs text-muted-foreground">Pieces</p>
            <p className="text-lg font-semibold">
              {manifestSummary.totalPieces.toLocaleString("en-IN")}
            </p>
          </Card>
          <Card className="p-3 border-pop bg-background/60">
            <p className="text-xs text-muted-foreground">Weight (kg)</p>
            <p className="text-lg font-semibold">
              {manifestSummary.totalWeight.toLocaleString("en-IN")}
            </p>
          </Card>
          <Card className="p-3 border-pop bg-background/60">
            <p className="text-xs text-muted-foreground">Shipments</p>
            <p className="text-lg font-semibold">
              {manifestSummary.totalShipments.toLocaleString("en-IN")}
            </p>
          </Card>
        </div>
        {/* Search, Filters & New Manifest */}
        <div className="flex gap-4 flex-col sm:flex-row items-end">
          <div className="flex-1">
            <label className="text-sm font-medium mb-2 block">Search</label>
            <Input
              placeholder="Search by manifest ID, reference, or location..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="bg-input text-foreground"
            />
          </div>
          <div>
            <label className="text-sm font-medium mb-2 block">Status</label>
            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
              className="px-3 py-2 bg-input text-foreground border border-pop"
            >
              <option value="all">All Status</option>
              <option value="scheduled">Scheduled</option>
              <option value="dispatched">Dispatched</option>
              <option value="in-transit">In Transit</option>
              <option value="at-terminal">At Terminal</option>
              <option value="delivered">Delivered</option>
            </select>
          </div>
          <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
            <Button
              type="button"
              className="bg-primary hover:bg-primary/90"
              onClick={() => setIsDialogOpen(true)}
            >
              New Manifest
            </Button>

            <DialogContent>
              <DialogHeader>
                <DialogTitle>New manifest</DialogTitle>
                <DialogDescription>
                  Create a new air cargo manifest for today&apos;s flights.
                </DialogDescription>
              </DialogHeader>

              <Form {...form}>
                <form
                  className="space-y-4 mt-2"
                  onSubmit={form.handleSubmit(handleCreateManifest)}
                >
                  <FormField
                    control={form.control}
                    name="manifestRef"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Manifest reference</FormLabel>
                        <FormControl>
                          <Input
                            placeholder="e.g. TG-IMPH-DEL-001"
                            {...field}
                          />
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
                          <FormLabel>Origin hub</FormLabel>
                          <FormControl>
                            <Input
                              placeholder="Imphal terminal, ..."
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
                              placeholder="New Delhi terminal, ..."
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
                      name="airlineCode"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Airline code</FormLabel>
                          <FormControl>
                            <Input
                              placeholder="6E, SG, G8, ..."
                              {...field}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="manifestDate"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Manifest date</FormLabel>
                          <FormControl>
                            <Input type="date" {...field} />
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
                          <select
                            {...field}
                            className="w-full border border-input bg-input text-foreground px-3 py-2 text-sm"
                          >
                            <option value="scheduled">Scheduled</option>
                            <option value="dispatched">Dispatched</option>
                            <option value="in-transit">In Transit</option>
                            <option value="at-terminal">At Terminal</option>
                            <option value="delivered">Delivered</option>
                          </select>
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
                      {isCreating ? "Creating..." : "Create manifest"}
                    </Button>
                  </DialogFooter>
                </form>
              </Form>
            </DialogContent>
          </Dialog>
        </div>

        {/* Manifests Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {filteredManifests.map((manifest) => (
            <Card
              key={manifest.id}
              className="p-6 border-pop bg-background hover:bg-accent/50 transition-colors"
            >
              <div className="flex justify-between items-start mb-4">
                <div>
                  <h3 className="text-lg font-display text-foreground">
                    {manifest.reference}
                  </h3>
                  <p className="text-sm text-muted-foreground">{manifest.id}</p>
                </div>
                <Badge className={getStatusColor(manifest.status)}>
                  {manifest.status.toUpperCase()}
                </Badge>
              </div>

              <div className="space-y-3 text-sm">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Route</span>
                  <span className="text-foreground">
                    {manifest.origin} → {manifest.destination}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Airline</span>
                  <span className="text-foreground">{manifest.airlineCode}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Manifest Date</span>
                  <span className="text-foreground">
                    {formatDate(manifest.manifestDate)}
                  </span>
                </div>

                <div className="border-t border-pop pt-3 mt-3 grid grid-cols-3 gap-3">
                  <div>
                    <p className="text-xs text-muted-foreground mb-1">
                      Weight (kg)
                    </p>
                    <p className="font-semibold text-primary">
                      {manifest.totalWeight}
                    </p>
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground mb-1">Pieces</p>
                    <p className="font-semibold text-primary">
                      {manifest.totalPieces}
                    </p>
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground mb-1">
                      Shipments
                    </p>
                    <p className="font-semibold text-primary">
                      {manifest.shipments}
                    </p>
                  </div>
                </div>

                <div className="mt-3 pt-3 border-t border-pop">
                  <p className="text-xs text-muted-foreground mb-1">
                    Est. Delivery
                  </p>
                  <p className="font-semibold">
                    {formatDate(manifest.estimatedDelivery)}
                  </p>
                </div>

                <div className="mt-3 flex justify-end">
                  <Button
                    type="button"
                    size="sm"
                    variant="outline"
                    onClick={() => openManageShipments(manifest)}
                  >
                    Manage shipments
                  </Button>
                </div>
              </div>
            </Card>
          ))}
        </div>

        {filteredManifests.length === 0 && (
          <Card className="p-12 text-center border-pop">
            <p className="text-muted-foreground">No manifests found</p>
          </Card>
        )}

        <Dialog
          open={!!activeManifest}
          onOpenChange={(open) => {
            if (!open) {
              setActiveManifest(null);
              setManifestShipments([]);
              setNewShipmentRef("");
              setShipmentsLoading(false);
              setLinkingShipment(false);
            }
          }}
        >
          <DialogContent>
            <DialogHeader>
              <DialogTitle>
                {activeManifest
                  ? `Manage shipments · ${activeManifest.reference}`
                  : "Manage shipments"}
              </DialogTitle>
              <DialogDescription>
                Link shipments to this manifest using their shipment reference.
              </DialogDescription>
            </DialogHeader>

            <div className="space-y-4">
              <div className="space-y-2">
                <p className="text-xs text-muted-foreground">Linked shipments</p>
                {shipmentsLoading ? (
                  <p className="text-xs text-muted-foreground">
                    Loading shipments...
                  </p>
                ) : manifestShipments.length === 0 ? (
                  <p className="text-xs text-muted-foreground">
                    No shipments linked yet.
                  </p>
                ) : (
                  <ul className="space-y-1 text-sm max-h-40 overflow-y-auto">
                    {manifestShipments.map((s) => (
                      <li
                        key={s.id}
                        className="flex items-center justify-between border-b border-border/40 last:border-b-0 py-1"
                      >
                        <span className="font-mono text-xs">
                          {s.shipmentRef}
                        </span>
                      </li>
                    ))}
                  </ul>
                )}
              </div>

              <div className="space-y-2">
                <p className="text-xs text-muted-foreground">
                  Add shipment by reference
                </p>
                <div className="flex gap-2">
                  <Input
                    placeholder="Enter shipment reference..."
                    value={newShipmentRef}
                    onChange={(e) => setNewShipmentRef(e.target.value)}
                    className="flex-1"
                  />
                  <Button
                    type="button"
                    className="bg-primary hover:bg-primary/90"
                    disabled={linkingShipment || !newShipmentRef.trim()}
                    onClick={handleAddShipmentToManifest}
                  >
                    {linkingShipment ? "Adding..." : "Add"}
                  </Button>
                </div>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </div>
    </DashboardPageLayout>
  );
}
