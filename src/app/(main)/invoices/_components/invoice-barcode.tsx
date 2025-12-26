"use client";

import Barcode from "react-barcode";

interface InvoiceBarcodeProps {
	value: string;
	width?: number;
	height?: number;
	showValue?: boolean;
	className?: string;
}

export default function InvoiceBarcode({
	value,
	width = 1.5,
	height = 50,
	showValue = true,
	className,
}: InvoiceBarcodeProps) {
	if (!value) return null;

	return (
		<div className={className}>
			<Barcode
				value={value}
				width={width}
				height={height}
				displayValue={showValue}
				format="CODE128"
				margin={0}
				fontOptions="bold"
				fontSize={14}
				background="transparent"
			/>
		</div>
	);
}
