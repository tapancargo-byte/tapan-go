
"use client";

import BarcodeScanner from "@/components/barcode/barcode-scanner";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useState } from "react";

export default function BarcodeTrackingSystemPage() {
  const [scannedCode, setScannedCode] = useState<string | null>(null);

  return (
    <div className="container mx-auto p-6">
      <Card>
        <CardHeader>
          <CardTitle>Barcode Tracking System</CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <BarcodeScanner onScanResult={(code) => setScannedCode(code)} />
          
          {scannedCode && (
            <div className="p-4 bg-green-50 border border-green-200 rounded-lg">
              <p className="text-sm text-green-800 font-medium">Last Scanned Code:</p>
              <p className="text-lg font-mono text-green-900">{scannedCode}</p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
