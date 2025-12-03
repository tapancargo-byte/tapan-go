"use client";

import { useEffect, useMemo, useState } from "react";
import DashboardPageLayout from "@/components/dashboard/layout";
import AtomIcon from "@/components/icons/atom";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import BarcodeScanner from "@/components/barcode/barcode-scanner";
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
  const [originHub, setOriginHub] = useState("");
  const [destination, setDestination] = useState("");
  const [airlineCode, setAirlineCode] = useState("");
  const [scanned, setScanned] = useState<SessionBarcode[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [lastError, setLastError] = useState<string | null>(null);

  const handleScan = async (barcodeValue: string) => {
    const trimmed = barcodeValue.trim();
    if (!trimmed) return;

    setLastError(null);

    if (scanned.some((b) => b.barcodeNumber === trimmed)) {
      toast({
        title: "Already added",
        description: "Barcode " + trimmed + " is already in this session.",
      });
      return;
    }

    try {
      const res = await fetch("/api/scans", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          barcode: trimmed,
          scanType: "scanned_for_manifest",
        }),
      });

      const json = await res.json();

      if (!res.ok) {
        const message =
          (typeof json?.error === "string" && json.error) ||
          "Could not record scan";
        setLastError(message);
        toast({
          title: "Scan error",
          description: message,
          variant: "destructive",
        });
        return;
      }

      const updatedBarcode = json?.barcode;

      if (!updatedBarcode?.id) {
        toast({
          title: "Scan recorded",
          description: "Scanned " + trimmed + ".",
        });
        return;
      }

      const { data: barcodeRow, error: barcodeError } = await supabase
        .from("barcodes")
        .select(
          "id, barcode_number, shipment_id, status, shipments!inner(id, shipment_ref, weight)"
        )
        .eq("id", updatedBarcode.id)
        .maybeSingle();

      if (barcodeError || !barcodeRow) {
        console.warn("Failed to load barcode context after scan", barcodeError);
        setScanned((prev) => [
          ...prev,
          {
            id: updatedBarcode.id as string,
            barcodeNumber: trimmed,
            shipmentRef: "",
            weight: 0,
            status: updatedBarcode.status ?? "in-transit",
          },
        ]);
        return;
      }

      const linkedShipment = (barcodeRow as any).shipments?.[0] ?? null;

      setScanned((prev) => [
        ...prev,
        {
          id: barcodeRow.id as string,
          barcodeNumber: (barcodeRow.barcode_number as string) ?? trimmed,
          shipmentRef: (linkedShipment?.shipment_ref as string | null) ?? "",
          weight: Number(linkedShipment?.weight ?? 0),
          status: (barcodeRow.status as string | null) ?? updatedBarcode.status ?? "in-transit",
        },
      ]);
    } catch (err: any) {
      console.error("Scan session error", err);
      const message = err?.message || "Unexpected error while recording scan.";
      setLastError(message);
      toast({
        title: "Scan error",
        description: message,
        variant: "destructive",
      });
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

  const handleCreateManifest = async () => {
    if (!canSubmit) return;
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
                {scanned.map((b) => (
                  <div key={b.id} className="flex items-center justify-between px-3 py-2">
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
