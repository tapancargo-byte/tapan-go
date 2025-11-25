"use client";

import { useEffect, useState } from "react";
import { DashboardLayout } from "@/components/dashboard/layout";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import BarcodeScanner from "@/components/barcode/barcode-scanner";
import BarcodeGenerator from "@/components/barcode/barcode-generator";
import SearchIcon from "@/components/icons/search";
import ScanIcon from "@/components/icons/atom";
import { supabase } from "@/lib/supabaseClient";
import { enqueueScan, flushOfflineScans } from "@/lib/offlineScanQueue";

type SupabaseBarcodeRow = {
  id: string;
  barcode_number: string;
  shipment_id: string | null;
  status: string | null;
  last_scanned_at: string | null;
};

type SupabaseShipmentRow = {
  id: string;
  shipment_ref: string;
  origin: string | null;
  destination: string | null;
  weight: number | null;
  status: string | null;
  customer_id: string | null;
};

type SupabaseCustomerRow = {
  id: string;
  name: string | null;
};

interface UIBarcode {
  id: string;
  barcodeNumber: string;
  shipmentId: string;
  customerName: string;
  origin: string;
  destination: string;
  status: string;
  scannedAt: string;
  weight: number;
}

export default function BarcodeManagementPage() {
  const [searchTerm, setSearchTerm] = useState("");
  const [scannerOpen, setScannerOpen] = useState(false);
  const [barcodes, setBarcodes] = useState<UIBarcode[]>([]);
  const [filteredBarcodes, setFilteredBarcodes] = useState<UIBarcode[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;

    async function loadBarcodes() {
      setLoading(true);
      try {
        const { data: barcodeRows, error: barcodeError } = await supabase
          .from("barcodes")
          .select("id, barcode_number, shipment_id, status, last_scanned_at");

        if (barcodeError) {
          console.warn("Supabase barcodes error", barcodeError.message);
          throw barcodeError;
        }

        const rows = (barcodeRows as SupabaseBarcodeRow[] | null) ?? [];

        const shipmentIds = Array.from(
          new Set(rows.map((b) => b.shipment_id).filter((id): id is string => !!id))
        );

        const shipmentsMap = new Map<string, SupabaseShipmentRow>();
        const customersMap = new Map<string, SupabaseCustomerRow>();

        if (shipmentIds.length > 0) {
          const { data: shipments, error: shipmentsError } = await supabase
            .from("shipments")
            .select(
              "id, shipment_ref, origin, destination, weight, status, customer_id"
            )
            .in("id", shipmentIds);

          if (shipmentsError) {
            console.warn(
              "Supabase shipments for barcodes error, falling back to mock",
              shipmentsError.message
            );
            throw shipmentsError;
          }

          (shipments as SupabaseShipmentRow[] | null)?.forEach((s) => {
            shipmentsMap.set(s.id, s);
          });

          const customerIds = Array.from(
            new Set(
              (shipments as SupabaseShipmentRow[] | null)
                ?.map((s) => s.customer_id)
                .filter((id): id is string => !!id) ?? []
            )
          );

          if (customerIds.length > 0) {
            const { data: customers, error: customersError } = await supabase
              .from("customers")
              .select("id, name")
              .in("id", customerIds);

            if (customersError) {
              console.warn(
                "Supabase customers for barcodes error, falling back to mock",
                customersError.message
              );
              throw customersError;
            }

            (customers as SupabaseCustomerRow[] | null)?.forEach((c) => {
              customersMap.set(c.id, c);
            });
          }
        }

        const normalized: UIBarcode[] = rows.map((b) => {
          const shipment = b.shipment_id ? shipmentsMap.get(b.shipment_id) : undefined;
          const customer = shipment?.customer_id
            ? customersMap.get(shipment.customer_id)
            : undefined;

          return {
            id: b.id,
            barcodeNumber: b.barcode_number,
            shipmentId: shipment?.shipment_ref ?? "",
            customerName: customer?.name ?? "",
            origin: shipment?.origin ?? "",
            destination: shipment?.destination ?? "",
            status: b.status ?? shipment?.status ?? "unknown",
            scannedAt: b.last_scanned_at ?? "",
            weight: Number(shipment?.weight ?? 0),
          };
        });

        if (cancelled) return;

        setBarcodes(normalized);
        setFilteredBarcodes(normalized);
        setLoading(false);
      } catch (err) {
        if (cancelled) return;
        console.error("Failed to load barcodes from Supabase", err);
        setBarcodes([]);
        setFilteredBarcodes([]);
        setLoading(false);
      }
    }

    loadBarcodes();

    return () => {
      cancelled = true;
    };
  }, []);

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

  const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
    const term = e.target.value.toLowerCase();
    setSearchTerm(term);

    const filtered = barcodes.filter(
      (bc) =>
        bc.barcodeNumber.toLowerCase().includes(term) ||
        bc.shipmentId.toLowerCase().includes(term) ||
        bc.customerName.toLowerCase().includes(term) ||
        bc.origin.toLowerCase().includes(term)
    );
    setFilteredBarcodes(filtered);
  };

  const handleScanResult = async (scannedData: string) => {
    if (!scannedData) return;

    try {
      if (!navigator.onLine) {
        enqueueScan({ barcode: scannedData, scanType: "scan" });
      } else {
        const res = await fetch("/api/scans", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            barcode: scannedData,
            scanType: "scan",
          }),
        });

        if (!res.ok) {
          enqueueScan({ barcode: scannedData, scanType: "scan" });
        }
      }
    } catch (error) {
      console.error("Failed to record scan, queuing offline", error);
      enqueueScan({ barcode: scannedData, scanType: "scan" });
    }

    const found = barcodes.find((bc) => bc.barcodeNumber === scannedData);
    if (found) {
      setSearchTerm(scannedData);
      const filtered = barcodes.filter((bc) => bc.barcodeNumber === scannedData);
      setFilteredBarcodes(filtered);
      setScannerOpen(false);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "delivered":
        return "bg-green-100 text-green-800";
      case "in-transit":
        return "bg-blue-100 text-blue-800";
      case "pending":
        return "bg-yellow-100 text-yellow-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const headerConfig = {
    title: "Barcode Tracking",
    description: "Scan and manage shipment barcodes across your logistics network",
    icon: ScanIcon,
  };

  return (
    <DashboardLayout header={headerConfig}>
      <div className="space-y-6">
        {/* Scanner Toggle Button */}
        <div className="flex justify-end tg-print-hide">
          <Button
            onClick={() => setScannerOpen(!scannerOpen)}
            className="gap-2"
          >
            <ScanIcon className="w-4 h-4" />
            {scannerOpen ? "Close Scanner" : "Scan Barcode"}
          </Button>
        </div>

        {/* Scanner Section */}
        {scannerOpen && (
          <Card className="border-blue-200 bg-blue-50 tg-print-hide">
            <CardHeader>
              <CardTitle>Barcode Scanner</CardTitle>
              <CardDescription>
                Point your camera at a barcode to scan it, or use the input
                field for manual entry
              </CardDescription>
            </CardHeader>
            <CardContent>
              <BarcodeScanner onScanResult={handleScanResult} />
            </CardContent>
          </Card>
        )}

        {/* Search Bar */}
        <Card className="tg-print-hide">
          <CardHeader>
            <CardTitle className="text-lg">Search &amp; Filter</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex gap-2">
              <div className="relative flex-1">
                <SearchIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                <Input
                  placeholder="Search by barcode, shipment ID, customer, or location..."
                  value={searchTerm}
                  onChange={handleSearch}
                  className="pl-10"
                />
              </div>
              <Button
                variant="outline"
                onClick={() => {
                  setSearchTerm("");
                  setFilteredBarcodes(barcodes);
                }}
              >
                Clear
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Barcodes Table */}
        <Card className="tg-print-hide">
          <CardHeader>
            <CardTitle>
              {loading ? "Loading barcodes..." : "Active Barcodes"}
            </CardTitle>
            <CardDescription>
              Total: {filteredBarcodes.length} of {barcodes.length}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b">
                    <th className="text-left py-3 px-4 font-semibold">
                      Barcode
                    </th>
                    <th className="text-left py-3 px-4 font-semibold">
                      Shipment ID
                    </th>
                    <th className="text-left py-3 px-4 font-semibold">
                      Customer
                    </th>
                    <th className="text-left py-3 px-4 font-semibold">
                      Route
                    </th>
                    <th className="text-left py-3 px-4 font-semibold">
                      Status
                    </th>
                    <th className="text-left py-3 px-4 font-semibold">
                      Last Scanned
                    </th>
                    <th className="text-left py-3 px-4 font-semibold">
                      Weight
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {filteredBarcodes.length > 0 ? (
                    filteredBarcodes.map((barcode) => (
                      <tr
                        key={barcode.id}
                        className="border-b hover:bg-gray-50"
                      >
                        <td className="py-3 px-4 font-mono font-semibold text-blue-600">
                          {barcode.barcodeNumber}
                        </td>
                        <td className="py-3 px-4">{barcode.shipmentId}</td>
                        <td className="py-3 px-4">{barcode.customerName}</td>
                        <td className="py-3 px-4">
                          {barcode.origin} → {barcode.destination}
                        </td>
                        <td className="py-3 px-4">
                          <span
                            className={`px-3 py-1 rounded-full text-xs font-semibold uppercase ${getStatusColor(
                              barcode.status
                            )}`}
                          >
                            {barcode.status}
                          </span>
                        </td>
                        <td className="py-3 px-4 text-gray-600">
                          {barcode.scannedAt
                            ? new Date(
                                barcode.scannedAt
                              ).toLocaleDateString()
                            : ""}
                        </td>
                        <td className="py-3 px-4">{barcode.weight} kg</td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td
                        colSpan={7}
                        className="py-8 text-center text-gray-500"
                      >
                        No barcodes found matching your search.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>

        {/* Generate New Barcode */}
        <Card className="print:border-0 print:bg-transparent print:shadow-none">
          <CardHeader className="tg-print-hide">
            <CardTitle>Generate New Barcode</CardTitle>
            <CardDescription>
              Create a new barcode for shipment tracking
            </CardDescription>
          </CardHeader>
          <CardContent>
            <BarcodeGenerator />
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
}
