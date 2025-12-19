"use client";

import { useEffect, useMemo, useState } from "react";
import DashboardPageLayout from "@/components/dashboard/layout";
import AtomIcon from "@/components/icons/atom";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import BarcodeScanner from "@/components/barcode/barcode-scanner";
import { useBarcodeScanner } from "@/hooks/use-barcode-scanner";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/lib/supabaseClient";

interface SessionBarcode {
  id: string;
  barcodeNumber: string;
  shipmentRef: string;
  weight: number;
  status: string;
}

export default function ManifestScanSessionPage() {
  const { toast } = useToast();
  const [originHub, setOriginHub] = useState("Imphal Terminal");
  const [destination, setDestination] = useState("New Delhi Terminal");
  const [airlineCode, setAirlineCode] = useState("6E");
  const [scanned, setScanned] = useState<SessionBarcode[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [lastError, setLastError] = useState<string | null>(null);

  // HID Scanner Listener
  useBarcodeScanner({
    onScan: (code: string) => handleScan(code),
    debug: true,
  });

  const handleScan = async (barcodeValue: string) => {
    const trimmed = barcodeValue.trim();
    if (!trimmed) return;

    // Local duplicate check
    if (scanned.some((b) => b.barcodeNumber === trimmed)) {
      toast({
        title: "Already added",
        description: `Barcode ${trimmed} is already in this session.`,
        variant: "default", // Warning color?
      });
      return;
    }

    setLastError(null);

    try {
      // 1. First try to resolve as a cargo barcode
      let { data: barcodeData, error: barcodeError } = await supabase
        .from("barcodes")
        .select(`
          id, 
          barcode_number, 
          status,
          shipments (
            id, 
            shipment_ref, 
            weight
          )
        `)
        .eq("barcode_number", trimmed)
        .maybeSingle();

      if (barcodeError) throw barcodeError;

      // 2. If not found in barcodes, check if it's an invoice reference
      if (!barcodeData) {
        const { data: invoiceData, error: invoiceError } = await supabase
          .from("invoices")
          .select(`
            id,
            invoice_ref,
            amount,
            customers (id, name)
          `)
          .eq("invoice_ref", trimmed)
          .maybeSingle();

        if (invoiceError) throw invoiceError;

        if (invoiceData) {
          // Handle invoice barcode - show it as a scanned item but with invoice context
          const newScanItem: SessionBarcode = {
            id: invoiceData.id,
            barcodeNumber: invoiceData.invoice_ref,
            shipmentRef: `Invoice: ₹${invoiceData.amount?.toLocaleString("en-IN") || "0"}`,
            weight: 0,
            status: "INVOICE_SCANNED",
          };

          setScanned((prev) => [newScanItem, ...prev]);

          toast({
            title: "Invoice Scanned",
            description: `Invoice ${trimmed} added to manifest`,
            variant: "default",
            className: "bg-blue-50 border-blue-200 text-blue-800",
          });
          return; // Early return for invoice barcodes
        }

        // Neither cargo barcode nor invoice found
        throw new Error(`Barcode ${trimmed} not found in system (checked cargo barcodes and invoices).`);
      }

      const barcodeId = barcodeData.id;
      // const currentStatus = barcodeData.status; 

      // 2. Execute Atomic Scan Event (RPC)
      // Transition: WAREHOUSE -> MANIFESTED (or similar, depending on business logic)
      // For now, we assume this scan session marks them as 'SCANNED_FOR_MANIFEST' or 'MANIFESTED' 
      // strictly speaking, 'MANIFESTED' happens when the manifest is compiled.
      // But let's log the "Scan" action.

      const { data: rpcResult, error: rpcError } = await supabase.rpc("process_scan_event", {
        p_barcode_id: barcodeId,
        p_new_status: "MANIFESTED", // PDR: "WAREHOUSE_IN" -> "MANIFESTED"
        p_location: originHub || "Warehouse",
        p_operator_id: (await supabase.auth.getUser()).data.user?.id,
        p_meta: { session_origin: originHub, session_dest: destination }
      });

      if (rpcError) throw rpcError;

      if (rpcResult && !rpcResult.success) {
        throw new Error(rpcResult.error || "Scan failed");
      }

      // 3. Update UI State
      const linkedShipment = Array.isArray(barcodeData.shipments)
        ? barcodeData.shipments[0]
        : barcodeData.shipments;

      const newScanItem: SessionBarcode = {
        id: barcodeData.id,
        barcodeNumber: barcodeData.barcode_number,
        shipmentRef: linkedShipment?.shipment_ref ?? "",
        weight: Number(linkedShipment?.weight ?? 0),
        status: "MANIFESTED",
      };

      setScanned((prev) => [newScanItem, ...prev]);

      toast({
        title: "Scan successful",
        description: `Captured ${trimmed}`,
        variant: "default",
        className: "bg-emerald-50 border-emerald-200 text-emerald-800", // Success style
      });

    } catch (err: any) {
      console.error("Scan session error", err);
      const message = err?.message || "Unexpected error.";
      setLastError(message);
      toast({
        title: "Scan failed",
        description: message,
        variant: "destructive",
      });
      // Optional: Play error sound here
    }
  };

  const totals = useMemo(() => {
    let pieces = scanned.length;
    let weight = 0;
    scanned.forEach((b) => {
      weight += b.weight || 0;
    });
    return { pieces, weight };
  }, [scanned]);

  const canSubmit =
    !!originHub.trim() &&
    !!destination.trim() &&
    !!airlineCode.trim() &&
    scanned.length > 0 &&
    !isSubmitting;

  // Debug: log why button might not work
  console.log("Create Manifest State:", {
    canSubmit,
    originHub: originHub.trim() || "(empty)",
    destination: destination.trim() || "(empty)",
    airlineCode: airlineCode.trim() || "(empty)",
    scannedCount: scanned.length,
    isSubmitting
  });

  const handleCreateManifest = async () => {
    console.log("Create Manifest clicked! canSubmit:", canSubmit);
    if (!canSubmit) {
      toast({
        title: "Cannot create manifest",
        description: "Please fill in Origin Hub, Destination, and Airline Code first.",
        variant: "destructive",
      });
      return;
    }
    setIsSubmitting(true);

    try {
      const body = {
        originHub: originHub.trim(),
        destination: destination.trim(),
        airlineCode: airlineCode.trim(),
        scannedBarcodeIds: scanned.map((b) => b.id),
      };

      const res = await fetch("/api/manifests", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });

      const json = await res.json();

      if (!res.ok || !json?.success) {
        const message =
          (typeof json?.error === "string" && json.error) ||
          "Could not create manifest from this session.";
        toast({
          title: "Manifest error",
          description: message,
          variant: "destructive",
        });
        return;
      }

      toast({
        title: "Manifest created",
        description:
          "Manifest " +
          (json.manifest?.manifest_ref ?? json.manifest?.id ?? "") +
          " created with " +
          totals.pieces +
          " pieces.",
      });

      setScanned([]);
    } catch (err: any) {
      console.error("Manifest creation from scan session failed", err);
      toast({
        title: "Manifest error",
        description:
          err?.message || "Something went wrong while creating the manifest.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <DashboardPageLayout
      header={{
        title: "Manifest Scan Session",
        description:
          "Scan barcodes to build an aircargo manifest with live pieces and weight.",
        icon: AtomIcon,
      }}
    >
      <div className="flex flex-col gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Flight & Route</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
              <div>
                <label className="text-xs font-medium mb-1 block">Origin hub</label>
                <Input
                  value={originHub}
                  onChange={(e) => setOriginHub(e.target.value)}
                  placeholder="e.g. Imphal terminal"
                />
              </div>
              <div>
                <label className="text-xs font-medium mb-1 block">Destination</label>
                <Input
                  value={destination}
                  onChange={(e) => setDestination(e.target.value)}
                  placeholder="e.g. New Delhi terminal"
                />
              </div>
              <div>
                <label className="text-xs font-medium mb-1 block">Airline code</label>
                <Input
                  value={airlineCode}
                  onChange={(e) => setAirlineCode(e.target.value)}
                  placeholder="e.g. 6E, SG, G8"
                />
              </div>
            </div>
            <div className="text-xs text-muted-foreground">
              All fields are required to create a manifest from this scan session.
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Scan barcodes</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <BarcodeScanner onScanResult={handleScan} />
            {lastError && (
              <p className="text-xs text-destructive">Last error: {lastError}</p>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Session summary</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-sm">
              <div>
                <p className="text-xs text-muted-foreground">Barcodes scanned</p>
                <p className="text-lg font-semibold">{scanned.length}</p>
              </div>
              <div>
                <p className="text-xs text-muted-foreground">Total pieces</p>
                <p className="text-lg font-semibold">{totals.pieces}</p>
              </div>
              <div>
                <p className="text-xs text-muted-foreground">Total weight (kg)</p>
                <p className="text-lg font-semibold">{totals.weight.toFixed(2)}</p>
              </div>
              <div className="flex items-end justify-end">
                <Button
                  type="button"
                  className="w-full md:w-auto"
                  disabled={!canSubmit}
                  onClick={handleCreateManifest}
                >
                  {isSubmitting ? "Creating manifest..." : "Create manifest"}
                </Button>
              </div>
            </div>

            {scanned.length > 0 && (
              <div className="mt-4 max-h-64 overflow-y-auto border rounded-md divide-y text-xs">
                {scanned.map((b, index) => (
                  <div key={`${b.id}-${index}`} className="flex items-center justify-between px-3 py-2">
                    <div className="flex-1 min-w-0">
                      <p className="font-mono text-[11px]">{b.barcodeNumber}</p>
                      <p className="text-[11px] text-muted-foreground truncate">
                        {b.shipmentRef || "Unlinked shipment"}
                      </p>
                    </div>
                    <div className="text-right text-[11px]">
                      <p>{b.weight ? b.weight.toFixed(2) + " kg" : "-"}</p>
                      <p className="uppercase text-muted-foreground">{b.status}</p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </DashboardPageLayout>
  );
}
