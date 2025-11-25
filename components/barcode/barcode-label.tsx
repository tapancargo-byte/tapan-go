"use client";

import Barcode from "react-barcode";

interface BarcodeLabelProps {
  value: string;
  subtitle?: string;
}

export default function BarcodeLabel({ value, subtitle }: BarcodeLabelProps) {
  return (
    <div className="inline-flex flex-col items-center bg-slate-900 p-2">
      <div className="bg-white px-3 py-2">
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
          background="#ffffff"
          lineColor="#000000"
          margin={0}
        />
      </div>
      {subtitle && (
        <div className="mt-1 text-xs text-slate-100 font-medium">
          {subtitle}
        </div>
      )}
    </div>
  );
}
