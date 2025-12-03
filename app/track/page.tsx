"use client";

import { Suspense, useEffect, useState } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { format } from "date-fns";
import { BrandLogo } from "@/components/ui/brand-logo";
import SearchIcon from "@/components/icons/search";

interface TrackShipment {
  id: string;
  shipment_ref: string;
  origin?: string | null;
  destination?: string | null;
  weight?: number | null;
  status?: string | null;
  progress?: number | null;
  created_at: string;
  updated_at: string;
}

interface TrackBarcode {
  id: string;
  barcode_number: string;
  status?: string | null;
  last_scanned_at?: string | null;
  last_scanned_location?: string | null;
  created_at: string;
}

interface TrackScan {
  id: string;
  barcode_id: string;
  barcode_number?: string | null;
  scanned_at: string;
  location?: string | null;
  scan_type?: string | null;
}

interface TrackResponse {
  shipment: TrackShipment | null;
  barcodes: TrackBarcode[];
  scans: TrackScan[];
  lookup: {
    type: "shipment_ref" | "barcode";
    value: string;
  };
}

const formatDateTime = (value?: string | null) => {
  if (!value) return "-";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value;
  return format(date, "dd MMM yyyy, HH:mm");
};

const statusBadgeClasses = (status?: string | null) => {
  const s = (status || "").toLowerCase();
  if (s === "delivered") return "bg-success/10 text-success border-success/30";
  if (s === "in-transit" || s === "in_transit")
    return "bg-accent-cyan/10 text-accent-cyan border-accent-cyan/30";
  if (s === "pending")
    return "bg-warning/10 text-warning border-warning/30";
  return "bg-muted text-muted-foreground border-border";
};

function PublicTrackPageContent() {
  const [query, setQuery] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<TrackResponse | null>(null);
  const searchParams = useSearchParams();

  const performLookup = async (value: string) => {
    const trimmed = value.trim();
    if (!trimmed) {
      setError("Enter a shipment or barcode number to track.");
      setResult(null);
      return;
    }
    setLoading(true);
    setError(null);
    setResult(null);
    try {
      const res = await fetch("/api/public/track", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ query: trimmed }),
      });
      const json = await res.json();
      if (!res.ok) {
        setError(
          (typeof json?.error === "string" && json.error) ||
            "Unable to find tracking information."
        );
        return;
      }
      setResult(json as TrackResponse);
    } catch (err: any) {
      setError(
        err?.message || "Something went wrong while looking up this shipment."
      );
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    await performLookup(query);
  };

  useEffect(() => {
    const initialRef = searchParams.get("ref");
    if (!initialRef) return;

    const trimmed = initialRef.trim();
    if (!trimmed) return;

    setQuery(trimmed);
    void performLookup(trimmed);
  }, [searchParams]);

  const hasBarcodes = (result?.barcodes?.length ?? 0) > 0;
  const hasScans = (result?.scans?.length ?? 0) > 0;

  return (
    <main className="min-h-screen bg-background text-foreground flex items-center justify-center px-4 py-8">
      <div className="w-full max-w-2xl space-y-8">
        {/* Brand Header */}
        <div className="flex flex-col items-center gap-6">
          <BrandLogo size="2xl" priority />
          <div className="text-center space-y-2">
            <h1 className="text-2xl font-semibold tracking-tight">
              Track your shipment
            </h1>
            <p className="text-sm text-muted-foreground max-w-md">
              Enter your shipment reference or barcode number to view the latest
              status and scan history.
            </p>
          </div>
        </div>

        <Card className="p-4 sm:p-6 border-pop">
          <form onSubmit={handleSubmit} className="flex flex-col sm:flex-row gap-3">
            <Input
              placeholder="e.g. TG-SHP-2024-0001 or barcode number"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              className="flex-1"
            />
            <Button
              type="submit"
              className="bg-primary hover:bg-primary/90 px-6"
              disabled={loading || !query.trim()}
            >
              {loading ? (
                "Tracking..."
              ) : (
                <>
                  Track
                  <SearchIcon className="ml-2 h-4 w-4" />
                </>
              )}
            </Button>
          </form>

          {error && (
            <p className="mt-4 text-sm text-destructive">{error}</p>
          )}

          {!error && !result && (
            <p className="mt-4 text-xs text-muted-foreground">
              Enter a shipment reference or barcode above to see live tracking
              details.
            </p>
          )}

          {result && !error && (
            <div className="mt-6 space-y-4">
              <div className="text-xs text-muted-foreground">
                Showing results for{" "}
                <span className="font-mono font-medium text-foreground">
                  {result.lookup.value}
                </span>{" "}
                ({result.lookup.type === "shipment_ref" ? "Shipment" : "Barcode"})
              </div>

              {result.shipment && (
                <Card className="p-4 border-border/60 bg-muted/10">
                  <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
                    <div>
                      <div className="text-xs text-muted-foreground">
                        Shipment reference
                      </div>
                      <div className="font-mono font-medium">
                        {result.shipment.shipment_ref}
                      </div>
                    </div>
                    <Badge
                      variant="outline"
                      className={`uppercase text-[11px] ${statusBadgeClasses(
                        result.shipment.status
                      )}`}
                    >
                      {result.shipment.status
                        ? result.shipment.status.toUpperCase()
                        : "UNKNOWN"}
                    </Badge>
                  </div>

                  <div className="mt-4 grid gap-3 text-sm sm:grid-cols-2">
                    <div>
                      <div className="text-xs text-muted-foreground">Route</div>
                      <div className="font-medium">
                        {result.shipment.origin || "-"}{" "}
                        <span className="text-muted-foreground">→</span>{" "}
                        {result.shipment.destination || "-"}
                      </div>
                    </div>
                    <div>
                      <div className="text-xs text-muted-foreground">
                        Weight (kg)
                      </div>
                      <div className="font-medium">
                        {typeof result.shipment.weight === "number"
                          ? result.shipment.weight.toFixed(2)
                          : "-"}
                      </div>
                    </div>
                    <div>
                      <div className="text-xs text-muted-foreground">Progress</div>
                      <div className="font-medium">
                        {typeof result.shipment.progress === "number"
                          ? `${result.shipment.progress}%`
                          : "-"}
                      </div>
                    </div>
                    <div>
                      <div className="text-xs text-muted-foreground">Created at</div>
                      <div className="font-medium">
                        {formatDateTime(result.shipment.created_at)}
                      </div>
                    </div>
                  </div>
                </Card>
              )}

              {hasBarcodes && (
                <div className="space-y-2">
                  <div className="text-xs text-muted-foreground">
                    Packages on this shipment
                  </div>
                  <div className="space-y-2 max-h-64 overflow-y-auto pr-1">
                    {result!.barcodes.map((b) => (
                      <Card
                        key={b.id}
                        className="p-3 border-border/60 bg-background/60"
                      >
                        <div className="flex items-center justify-between gap-3">
                          <div>
                            <div className="text-[11px] text-muted-foreground">
                              Barcode
                            </div>
                            <div className="font-mono text-xs">
                              {b.barcode_number}
                            </div>
                          </div>
                          <Badge
                            variant="outline"
                            className={`uppercase text-[10px] ${statusBadgeClasses(
                              b.status
                            )}`}
                          >
                            {(b.status || "unknown").toString().toUpperCase()}
                          </Badge>
                        </div>
                        <div className="mt-2 grid gap-2 text-xs sm:grid-cols-2">
                          <div>
                            <div className="text-[10px] text-muted-foreground">
                              Last scanned at
                            </div>
                            <div className="font-medium">
                              {formatDateTime(b.last_scanned_at)}
                            </div>
                          </div>
                          <div>
                            <div className="text-[10px] text-muted-foreground">
                              Last location
                            </div>
                            <div className="font-medium">
                              {b.last_scanned_location || "-"}
                            </div>
                          </div>
                        </div>
                      </Card>
                    ))}
                  </div>
                </div>
              )}

              {hasScans && (
                <div className="space-y-2">
                  <div className="text-xs text-muted-foreground">
                    Scan timeline
                  </div>
                  <div className="space-y-1 max-h-64 overflow-y-auto text-xs">
                    {result!.scans.map((scan) => (
                      <div
                        key={scan.id}
                        className="flex items-center justify-between gap-2 border-b border-border/40 last:border-b-0 pb-1"
                      >
                        <div className="flex-1 min-w-0">
                          <p className="font-mono text-[10px]">
                            {scan.barcode_number || "Unknown barcode"}
                          </p>
                          <p className="text-[10px] text-muted-foreground truncate">
                            {scan.location || "Unknown location"}
                          </p>
                        </div>
                        <div className="text-right">
                          <p className="text-[10px]">
                            {formatDateTime(scan.scanned_at)}
                          </p>
                          <p className="text-[10px] uppercase text-muted-foreground">
                            {scan.scan_type || "scan"}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {!result.shipment && !hasBarcodes && (
                <p className="text-sm text-muted-foreground">
                  No shipment details or scans found yet for this reference.
                </p>
              )}
            </div>
          )}
          {result && !error && (
            <div className="mt-4 flex justify-end">
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => window.print()}
              >
                Print
              </Button>
            </div>
          )}
        </Card>

        <p className="text-[11px] text-center text-muted-foreground">
          Data is updated as your packages are scanned at different locations. If
          you think there is an issue with your shipment, please contact customer
          support.
        </p>
        <p className="mt-1 text-[11px] text-center text-muted-foreground">
          Tapan Go ops teams can access deeper telemetry in the internal
          {" "}
          <Link
            href="/login"
            className="underline underline-offset-4 hover:text-foreground"
          >
            dashboard
          </Link>
          .
        </p>
      </div>
    </main>
  );
}

export default function PublicTrackPage() {
  return (
    <Suspense fallback={null}>
      <PublicTrackPageContent />
    </Suspense>
  );
}
