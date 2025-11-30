"use client";

import Barcode from "react-barcode";

interface BarcodeLabelProps {
  value: string;
  subtitle?: string;
}

/**
 * BarcodeLabel - Displays a barcode with optional subtitle
 * 
 * Uses semantic color classes instead of hardcoded values.
 * The barcode itself uses standard black/white for print compatibility.
 */
export default function BarcodeLabel({ value, subtitle }: BarcodeLabelProps) {
  return (
    <div className="inline-flex flex-col items-center bg-card border border-border rounded-md p-2">
      <div className="bg-white px-3 py-2 rounded">
        <Barcode
          value={value}
          format="CODE128"
          width={2}
          height={60}
          displayValue
          font="monospace"
          textAlign="center"
          textPosition="bottom"
          textMargin={4}
          fontSize={14}
          background="oklch(1 0 0)"
          lineColor="oklch(0.15 0 0)"
          margin={0}
        />
      </div>
      {subtitle && (
        <div className="mt-1 text-xs text-muted-foreground font-medium">
          {subtitle}
        </div>
      )}
    </div>
  );
}
