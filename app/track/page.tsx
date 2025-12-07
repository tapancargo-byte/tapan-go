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
  // ETA tracking fields (global logistics standard)
  etd?: string | null;           // Estimated Time of Departure
  atd?: string | null;           // Actual Time of Departure
  eta?: string | null;           // Estimated Time of Arrival
  ata?: string | null;           // Actual Time of Arrival (delivered)
  carrier_name?: string | null;  // Carrier/Airline name
  awb_number?: string | null;    // Air Waybill number
  transport_mode?: string | null; // air, road, rail, sea
  eta_notes?: string | null;     // Notes about ETA changes
  last_eta_update?: string | null;
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

interface TrackInvoice {
  id: string;
  invoice_ref: string;
  amount?: number | null;
  status?: string | null;
  invoice_date?: string | null;
  due_date?: string | null;
  created_at: string;
  customer?: {
    id: string;
    name: string;
    phone?: string | null;
    email?: string | null;
  } | null;
}

interface TrackResponse {
  shipment: TrackShipment | null;
  shipments: TrackShipment[];
  barcodes: TrackBarcode[];
  scans: TrackScan[];
  invoice: TrackInvoice | null;
  lookup: {
    type: "shipment_ref" | "barcode" | "invoice_ref";
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
  if (s === "paid")
    return "bg-success/10 text-success border-success/30";
  if (s === "overdue")
    return "bg-destructive/10 text-destructive border-destructive/30";
  if (s === "unpaid")
    return "bg-warning/10 text-warning border-warning/30";
  return "bg-muted text-muted-foreground border-border";
};

const formatDate = (value?: string | null) => {
  if (!value) return "-";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value;
  return format(date, "dd MMM yyyy");
};

const formatCurrency = (value?: number | null) => {
  if (value == null) return "-";
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    minimumFractionDigits: 0,
    maximumFractionDigits: 2,
  }).format(value);
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
  const hasShipments = (result?.shipments?.length ?? 0) > 0;
  const hasInvoice = result?.invoice != null;

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
              Enter your shipment reference, invoice number, or barcode to view
              the latest status and scan history.
            </p>
          </div>
        </div>

        <Card className="p-4 sm:p-6 border-pop">
          <form onSubmit={handleSubmit} className="flex flex-col sm:flex-row gap-3">
            <Input
              placeholder="e.g. TGINV000111, TG-SHP-2024-0001, or barcode"
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
              Enter an invoice number, shipment reference, or barcode above to
              see live tracking details.
            </p>
          )}

          {result && !error && (
            <div className="mt-6 space-y-4">
              <div className="text-xs text-muted-foreground">
                Showing results for{" "}
                <span className="font-mono font-medium text-foreground">
                  {result.lookup.value}
                </span>{" "}
                ({result.lookup.type === "shipment_ref"
                  ? "Shipment"
                  : result.lookup.type === "invoice_ref"
                  ? "Invoice"
                  : "Barcode"})
              </div>

              {/* Invoice Card */}
              {hasInvoice && result.invoice && (
                <Card className="p-4 border-brand/30 bg-brand/5">
                  <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
                    <div>
                      <div className="text-xs text-muted-foreground">
                        Invoice reference
                      </div>
                      <div className="font-mono font-medium">
                        {result.invoice.invoice_ref}
                      </div>
                    </div>
                    <Badge
                      variant="outline"
                      className={`uppercase text-[11px] ${statusBadgeClasses(
                        result.invoice.status
                      )}`}
                    >
                      {result.invoice.status
                        ? result.invoice.status.toUpperCase()
                        : "UNKNOWN"}
                    </Badge>
                  </div>

                  <div className="mt-4 grid gap-3 text-sm sm:grid-cols-2">
                    <div>
                      <div className="text-xs text-muted-foreground">Amount</div>
                      <div className="font-medium text-lg">
                        {formatCurrency(result.invoice.amount)}
                      </div>
                    </div>
                    {result.invoice.customer && (
                      <div>
                        <div className="text-xs text-muted-foreground">Customer</div>
                        <div className="font-medium">
                          {result.invoice.customer.name}
                        </div>
                        {result.invoice.customer.phone && (
                          <div className="text-xs text-muted-foreground">
                            {result.invoice.customer.phone}
                          </div>
                        )}
                      </div>
                    )}
                    <div>
                      <div className="text-xs text-muted-foreground">Invoice Date</div>
                      <div className="font-medium">
                        {formatDate(result.invoice.invoice_date)}
                      </div>
                    </div>
                    <div>
                      <div className="text-xs text-muted-foreground">Due Date</div>
                      <div className="font-medium">
                        {formatDate(result.invoice.due_date)}
                      </div>
                    </div>
                  </div>

                  {!hasShipments && (
                    <div className="mt-4 p-3 bg-muted/30 rounded-md">
                      <p className="text-xs text-muted-foreground">
                        No shipments are currently linked to this invoice. Shipment
                        tracking will be available once packages are dispatched.
                      </p>
                    </div>
                  )}
                </Card>
              )}

              {result.shipment && (
                <Card className="p-4 border-border/60 bg-muted/10">
                  {/* Expected Delivery Banner - Most Important Info */}
                  {(result.shipment.eta || result.shipment.ata) && (
                    <div className={`mb-4 p-4 rounded-lg text-center ${
                      result.shipment.ata 
                        ? "bg-green-500/10 border border-green-500/30" 
                        : "bg-brand/10 border border-brand/30"
                    }`}>
                      <div className="text-xs text-muted-foreground uppercase tracking-wide mb-1">
                        {result.shipment.ata ? "Delivered On" : "Expected Delivery"}
                      </div>
                      <div className={`text-xl font-bold ${
                        result.shipment.ata ? "text-green-500" : "text-brand"
                      }`}>
                        {format(new Date(result.shipment.ata || result.shipment.eta!), "dd MMM yyyy")}
                      </div>
                      {!result.shipment.ata && result.shipment.eta && (
                        <div className="text-xs text-muted-foreground mt-1">
                          by {format(new Date(result.shipment.eta), "h:mm a")}
                        </div>
                      )}
                    </div>
                  )}

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

                  {/* Service Route - Imphal ↔ New Delhi */}
                  <div className="mt-4 p-3 bg-muted/30 rounded-md">
                    <div className="flex items-center justify-between">
                      <div className="text-center flex-1">
                        <div className="text-xs text-muted-foreground">From</div>
                        <div className="font-semibold text-sm">
                          {result.shipment.origin || "-"}
                        </div>
                      </div>
                      <div className="px-4">
                        <div className="flex items-center gap-1 text-muted-foreground">
                          <div className="w-8 h-px bg-border"></div>
                          <span className="text-xs">✈</span>
                          <div className="w-8 h-px bg-border"></div>
                        </div>
                      </div>
                      <div className="text-center flex-1">
                        <div className="text-xs text-muted-foreground">To</div>
                        <div className="font-semibold text-sm">
                          {result.shipment.destination || "-"}
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="mt-4 grid gap-3 text-sm sm:grid-cols-2">
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
                    {result.shipment.carrier_name && (
                      <div>
                        <div className="text-xs text-muted-foreground">Carrier</div>
                        <div className="font-medium">
                          {result.shipment.carrier_name}
                          {result.shipment.awb_number && (
                            <span className="text-xs text-muted-foreground ml-1">
                              (AWB: {result.shipment.awb_number})
                            </span>
                          )}
                        </div>
                      </div>
                    )}
                    {result.shipment.transport_mode && (
                      <div>
                        <div className="text-xs text-muted-foreground">Transport</div>
                        <div className="font-medium capitalize">
                          {result.shipment.transport_mode === "air" ? "✈ Air Cargo" : result.shipment.transport_mode}
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Departure Info */}
                  {result.shipment.etd && (
                    <div className="mt-4 p-3 bg-muted/20 border border-border/40 rounded-md">
                      <div className="text-xs font-medium text-muted-foreground mb-2">
                        Dispatch Details
                      </div>
                      <div className="grid gap-2 text-sm sm:grid-cols-2">
                        {result.shipment.etd && (
                          <div>
                            <div className="text-[10px] text-muted-foreground uppercase">
                              {result.shipment.atd ? "Departed" : "Est. Departure"}
                            </div>
                            <div className="font-medium">
                              {formatDateTime(result.shipment.atd || result.shipment.etd)}
                            </div>
                          </div>
                        )}
                        {(result.shipment.eta || result.shipment.ata) && (
                          <div>
                            <div className="text-[10px] text-muted-foreground uppercase">
                              {result.shipment.ata ? "Delivered" : "Est. Arrival"}
                            </div>
                            <div className={`font-medium ${result.shipment.ata ? "text-success" : "text-brand"}`}>
                              {formatDateTime(result.shipment.ata || result.shipment.eta)}
                            </div>
                          </div>
                        )}
                      </div>
                      {result.shipment.eta_notes && (
                        <div className="mt-2 text-xs text-muted-foreground italic">
                          {result.shipment.eta_notes}
                        </div>
                      )}
                    </div>
                  )}

                  <div className="mt-3 grid gap-3 text-sm sm:grid-cols-2">
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

              {!result.shipment && !hasBarcodes && !hasInvoice && (
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
