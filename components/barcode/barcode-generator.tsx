"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import BarcodeLabel from "@/components/barcode/barcode-label";

const generateShipmentId = (): string => {
  const now = new Date();
  const year = now.getFullYear();
  const random = Math.floor(Math.random() * 10000)
    .toString()
    .padStart(4, "0");
  return `TG-${year}-${random}`;
};

interface GeneratedBarcode {
  id: string;
  barcodeNumber: string;
  shipmentId: string;
}

export default function BarcodeGenerator() {
  const [shipmentId, setShipmentId] = useState(() => generateShipmentId());
  const [count, setCount] = useState("1");
  const [generatedBarcodes, setGeneratedBarcodes] = useState<GeneratedBarcode[]>([]);

  const generateBarcodeValue = (index: number): string => {
    const now = new Date();
    const datePart = now.toISOString().slice(2, 10).replace(/-/g, ""); // YYMMDD
    const randomPart = Math.random().toString(36).slice(2, 6).toUpperCase();
    const seq = String(index + 1).padStart(3, "0");
    const raw = `TG-${datePart}-${randomPart}${seq}`;
    return raw.slice(0, 20);
  };

  const generateBarcodes = async () => {
    if (!shipmentId.trim()) return;

    const parsedCount = parseInt(count || "1", 10);
    const safeCount = Math.min(Math.max(parsedCount || 1, 1), 100);

    const newBarcodes: GeneratedBarcode[] = [];

    for (let i = 0; i < safeCount; i++) {
      const barcodeNumber = generateBarcodeValue(i);
      newBarcodes.push({
        id: `BC-${Date.now()}-${i}`,
        barcodeNumber,
        shipmentId: shipmentId.trim(),
      });
    }

    try {
      await Promise.all(
        newBarcodes.map((barcode) =>
          fetch("/api/barcodes/generate", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              barcodeNumber: barcode.barcodeNumber,
              shipmentId: barcode.shipmentId,
            }),
          })
        )
      );
    } catch (error) {
      console.error("Failed to persist generated barcodes", error);
    }

    setGeneratedBarcodes((prev) => [...newBarcodes, ...prev]);
    setShipmentId(generateShipmentId());
  };

  const downloadBarcode = (barcode: GeneratedBarcode) => {
    const element = document.createElement("a");
    const text = `${barcode.barcodeNumber}\n${barcode.shipmentId}`;
    element.setAttribute("href", "data:text/plain;charset=utf-8," + encodeURIComponent(text));
    element.setAttribute("download", `${barcode.barcodeNumber}.txt`);
    element.style.display = "none";
    document.body.appendChild(element);
    element.click();
    document.body.removeChild(element);
  };

  const handlePrint = () => {
    if (typeof window === "undefined") return;
    window.print();
  };

  return (
    <div className="space-y-4">
      <div className="flex flex-col gap-2 md:flex-row">
        <Input
          placeholder="Enter shipment ID (e.g., TG-2024-0900)"
          value={shipmentId}
          onChange={(e) => setShipmentId(e.target.value)}
          onKeyPress={(e) => e.key === "Enter" && generateBarcodes()}
        />
        <Input
          type="number"
          min={1}
          max={100}
          className="md:w-32"
          value={count}
          onChange={(e) => setCount(e.target.value)}
          onKeyPress={(e) => e.key === "Enter" && generateBarcodes()}
          placeholder="Qty"
        />
        <Button onClick={generateBarcodes}>Generate</Button>
      </div>

      {generatedBarcodes.length > 0 && (
        <div className="space-y-2">
          <h3 className="font-semibold tg-print-hide">Recently Generated Barcodes:</h3>
          <p className="text-xs text-gray-500 tg-print-hide">
            These labels can be printed directly from your browser print dialog.
          </p>
          <div className="flex justify-end gap-2 print:hidden tg-print-hide">
            <Button variant="outline" size="sm" onClick={handlePrint}>
              Print labels
            </Button>
          </div>
          <div className="grid gap-3 md:grid-cols-2 lg:grid-cols-3 tg-print-hide">
            {generatedBarcodes.map((barcode) => (
              <Card
                key={barcode.id}
                className="p-4 flex items-center justify-between bg-gray-50"
              >
                <div className="flex items-center gap-4">
                  <BarcodeLabel
                    value={barcode.barcodeNumber}
                    subtitle={barcode.shipmentId}
                  />
                  <div className="hidden sm:block">
                    <p className="font-mono font-bold text-blue-600">
                      {barcode.barcodeNumber}
                    </p>
                    <p className="text-sm text-gray-600">{barcode.shipmentId}</p>
                  </div>
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => downloadBarcode(barcode)}
                >
                  Download
                </Button>
              </Card>
            ))}
          </div>
          <div className="hidden print:grid tg-barcode-page">
            {generatedBarcodes.map((barcode) => (
              <div
                key={`print-${barcode.id}`}
                className="tg-barcode-label"
              >
                <BarcodeLabel
                  value={barcode.barcodeNumber}
                  subtitle={barcode.shipmentId}
                />
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
