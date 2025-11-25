"use client";

import { useEffect, useState } from "react";
import DashboardPageLayout from "@/components/dashboard/layout";
import ProcessorIcon from "@/components/icons/proccesor";
import BarcodeScanner from "@/components/barcode/barcode-scanner";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { enqueueScan, flushOfflineScans } from "@/lib/offlineScanQueue";
import { useToast } from "@/hooks/use-toast";

interface SessionBarcode {
  code: string;
  scanId?: string | null;
}

export default function ManifestScannerPage() {
  const [origin, setOrigin] = useState("Main Hub");
  const [destination, setDestination] = useState("Airport XYZ");
  const [airline, setAirline] = useState("AI");
  const [sessionBarcodes, setSessionBarcodes] = useState<SessionBarcode[]>([]);
  const [submitting, setSubmitting] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    flushOfflineScans();

    if (typeof window === "undefined") return;

    const handler = () => {
      flushOfflineScans();
    };

    window.addEventListener("online", handler);

    return () => {
      window.removeEventListener("online", handler);
    };
  }, []);

  const handleDetected = async (code: string) => {
    if (!code) return;

    // avoid duplicates in current session
    if (sessionBarcodes.some((b) => b.code === code)) return;

    try {
      if (!navigator.onLine) {
        enqueueScan({ barcode: code, scanType: "scanned_for_manifest", location: origin });
        setSessionBarcodes((prev) => [
          ...prev,
          {
            code,
            scanId: null,
          },
        ]);
        return;
      }

      const res = await fetch("/api/scans", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          barcode: code,
          scanType: "scanned_for_manifest",
          location: origin,
        }),
      });
      const json = await res.json();

      if (!res.ok) {
        enqueueScan({ barcode: code, scanType: "scanned_for_manifest", location: origin });
      }

      setSessionBarcodes((prev) => [
        ...prev,
        {
          code,
          scanId: json?.scan?.id ?? null,
        },
      ]);
    } catch (error) {
      console.error("Failed to record manifest scan, queuing offline", error);
      enqueueScan({ barcode: code, scanType: "scanned_for_manifest", location: origin });
      setSessionBarcodes((prev) => [
        ...prev,
        {
          code,
          scanId: null,
        },
      ]);
    }
  };

  const finalizeManifest = async () => {
    if (!sessionBarcodes.length) return;

    setSubmitting(true);
    try {
      const barcodeNumbers = sessionBarcodes.map((b) => b.code);

      const resolveRes = await fetch("/api/resolve-barcodes", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ barcodes: barcodeNumbers }),
      });
      const resolveJson = await resolveRes.json();

      const ids = (resolveJson?.ids as (string | null)[] | undefined) ?? [];
      const scannedBarcodeIds = ids.filter((id): id is string => !!id);

      if (!scannedBarcodeIds.length) {
        toast({
          title: "No packages resolved",
          description:
            "None of the scanned barcodes matched known barcodes. Please verify and try again.",
          variant: "destructive",
        });
        setSubmitting(false);
        return;
      }

      const manifestRes = await fetch("/api/manifests", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          manifestRef: `MAN-${Date.now()}`,
          originHub: origin,
          destination,
          airlineCode: airline,
          scannedBarcodeIds,
        }),
      });
      const manifestJson = await manifestRes.json();

      if (manifestJson?.success) {
        const ref = manifestJson.manifest?.manifest_ref ?? manifestJson.manifest?.id;
        toast({
          title: "Manifest created",
          description: ref ? `Reference: ${ref}` : "A new manifest has been created.",
        });
        setSessionBarcodes([]);
      } else {
        toast({
          title: "Failed to create manifest",
          description: manifestJson?.error ?? "Please try again or check logs.",
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error("Failed to finalize manifest", error);
      toast({
        title: "Manifest finalization failed",
        description: "An error occurred while finalizing the manifest.",
        variant: "destructive",
      });
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <DashboardPageLayout
      header={{
        title: "Manifest Scanner",
        description: "Scan barcodes to build an aircargo manifest",
        icon: ProcessorIcon,
      }}
    >
      <div className="flex flex-col gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Manifest Details</CardTitle>
            <CardDescription>
              Set the routing information for this manifest batch.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="text-sm font-medium mb-2 block">Origin Hub</label>
                <Input
                  value={origin}
                  onChange={(e) => setOrigin(e.target.value)}
                  placeholder="e.g. BLR Hub"
                />
              </div>
              <div>
                <label className="text-sm font-medium mb-2 block">Destination</label>
                <Input
                  value={destination}
                  onChange={(e) => setDestination(e.target.value)}
                  placeholder="e.g. DEL Airport"
                />
              </div>
              <div>
                <label className="text-sm font-medium mb-2 block">Airline Code</label>
                <Input
                  value={airline}
                  onChange={(e) => setAirline(e.target.value)}
                  placeholder="e.g. AI"
                />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-blue-200 bg-blue-50">
          <CardHeader>
            <CardTitle>Scan Barcodes</CardTitle>
            <CardDescription>
              Use the camera or a handheld scanner to add packages to this manifest.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <BarcodeScanner onScanResult={handleDetected} />
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Session Scans ({sessionBarcodes.length})</CardTitle>
            <CardDescription>
              Review scanned barcodes before finalizing the manifest.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <ul className="text-sm max-h-64 overflow-y-auto border rounded-md divide-y">
                {sessionBarcodes.map((b, index) => (
                  <li key={`${b.code}-${index}`} className="px-3 py-2 flex items-center justify-between">
                    <span className="font-mono text-xs">{b.code}</span>
                    <span className="text-xs text-muted-foreground">
                      {b.scanId ? `scan: ${b.scanId}` : "pending"}
                    </span>
                  </li>
                ))}
                {!sessionBarcodes.length && (
                  <li className="px-3 py-6 text-center text-sm text-muted-foreground">
                    No barcodes scanned yet.
                  </li>
                )}
              </ul>

              <div className="flex justify-end gap-2">
                <Button
                  variant="outline"
                  onClick={() => setSessionBarcodes([])}
                  disabled={!sessionBarcodes.length || submitting}
                >
                  Clear Session
                </Button>
                <Button
                  className="bg-primary hover:bg-primary/90"
                  onClick={finalizeManifest}
                  disabled={!sessionBarcodes.length || submitting}
                >
                  {submitting ? "Finalizing..." : "Finalize Manifest"}
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </DashboardPageLayout>
  );
}
