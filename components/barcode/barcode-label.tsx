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
    <div className="inline-flex flex-col items-center gap-0.5">
      <Barcode
        value={value}
        format="CODE128"
        width={1.2}
        height={40}
        displayValue
        font="monospace"
        textAlign="center"
        textPosition="bottom"
        textMargin={1}
        fontSize={10}
        background="#ffffff"
        lineColor="#000000"
        margin={0}
      />
      {subtitle && (
        <div className="text-[10px] text-muted-foreground font-medium tracking-wide">
          {subtitle}
        </div>
      )}
    </div>
  );
}
