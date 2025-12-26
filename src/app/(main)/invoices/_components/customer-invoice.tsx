"use client";

import type React from "react";
import Barcode from "react-barcode";

// Types matching the provided UIInvoice structure where applicable
interface InvoiceProps {
	invoice: {
		id: string; // The AWB number (e.g., 1000 0000 0001)
		invoiceRef: string;
		dateOfBooking?: string;
		consignor: {
			name: string;
			address?: string; // Full address for customer invoice
			phone?: string;
		};
		consignee: {
			name: string;
			address?: string;
			phone?: string;
		};
		origin: string;
		destination: string;
		pieces: number;
		weight: number;
		chargedWeight: number;
		declaredValue: number;
		// Customer invoice might show detailed freight charges
		freightAmount?: number;
		otherCharges?: number;
		gstAmount?: number;
		totalAmount: number;
		paymentMode?: string;
		gstin?: string;
	};
}

export const CustomerInvoice: React.FC<InvoiceProps> = ({ invoice }) => {
	const formatDate = (dateString?: string) => {
		if (!dateString)
			return new Date()
				.toLocaleDateString("en-GB", {
					day: "2-digit",
					month: "short",
					year: "numeric",
				})
				.toUpperCase();
		return new Date(dateString)
			.toLocaleDateString("en-GB", {
				day: "2-digit",
				month: "short",
				year: "numeric",
			})
			.toUpperCase();
	};

	const formatCurrency = (amount: number) => {
		return new Intl.NumberFormat("en-IN", {
			style: "currency",
			currency: "INR",
		}).format(amount);
	};

	return (
		<div
			className="invoice-container-print bg-white mx-auto text-[#1e293b]"
			style={{
				width: "100%",
				maxWidth: "1000px",
				// Customer invoice might be standard A4 or similar to shipment but with more height if needed,
				// but keeping 4:3 as requested "slightly different invoice with more information"
				aspectRatio: "auto",
				minHeight: "800px",
				fontFamily: "'Inter', sans-serif",
				display: "flex",
				flexDirection: "column",
				border: "1px solid #e2e8f0",
				boxShadow: "0 25px 50px -12px rgba(0, 0, 0, 0.5)",
				marginBottom: "20px",
			}}
		>
			{/* HEADER */}
			<header className="header bg-[#0f172a] text-white flex justify-between items-center px-[40px] py-[20px] border-b-[4px] border-[#f59e0b]">
				<div className="logo-group flex items-center gap-[15px]">
					<div className="logo-box bg-[#f59e0b] text-[#0f172a] px-[16px] py-[6px] font-[900] italic text-[28px] rounded-[6px]">
						TAC
					</div>
					<div>
						<div style={{ fontWeight: 800, fontSize: "20px" }}>
							CUSTOMER INVOICE
						</div>
						<div style={{ fontSize: "11px", opacity: 0.8 }}>
							TAX INVOICE / RECEIPT
						</div>
					</div>
				</div>
				<div style={{ textAlign: "right" }}>
					<div
						className="label text-[10px] font-[800] uppercase tracking-[1.2px] mb-[4px]"
						style={{ color: "white", opacity: 0.7 }}
					>
						Invoice Date
					</div>
					<div style={{ fontWeight: 700, fontSize: "18px" }}>
						{formatDate(invoice.dateOfBooking)}
					</div>
				</div>
			</header>

			{/* CUSTOMER & SHIPMENT DETAILS */}
			<div className="p-[40px] grid grid-cols-2 gap-[40px] border-b border-[#e2e8f0]">
				<div>
					<div className="label text-[#64748b] text-[10px] font-[800] uppercase tracking-[1.2px] mb-[5px]">
						Billed To (Consignor)
					</div>
					<div className="text-[18px] font-[800] text-[#0f172a] mb-[5px]">
						{invoice.consignor.name}
					</div>
					<div className="text-[13px] leading-[1.5]">
						{invoice.consignor.address || "Address not provided"}
						<br />
						Phone: {invoice.consignor.phone || "N/A"}
					</div>
				</div>
				<div className="flex flex-col items-end text-right">
					<div className="label text-[#64748b] text-[10px] font-[800] uppercase tracking-[1.2px] mb-[5px]">
						AWB Reference
					</div>
					<div className="font-mono text-[24px] font-[800] tracking-[1px] mb-[10px]">
						{invoice.invoiceRef || invoice.id}
					</div>
					<Barcode
						value={invoice.invoiceRef || invoice.id}
						height={35}
						width={1.2}
						displayValue={false}
						margin={0}
					/>
				</div>
			</div>

			<div className="p-[40px] grid grid-cols-4 gap-[20px] bg-[#f8fafc] border-b border-[#e2e8f0]">
				<div>
					<div className="label text-[#64748b] text-[10px] font-[800] uppercase tracking-[1.2px] mb-[5px]">
						Origin
					</div>
					<div className="text-[16px] font-[700]">{invoice.origin}</div>
				</div>
				<div>
					<div className="label text-[#64748b] text-[10px] font-[800] uppercase tracking-[1.2px] mb-[5px]">
						Destination
					</div>
					<div className="text-[16px] font-[700]">{invoice.destination}</div>
				</div>
				<div>
					<div className="label text-[#64748b] text-[10px] font-[800] uppercase tracking-[1.2px] mb-[5px]">
						Weight (Chrg)
					</div>
					<div className="text-[16px] font-[700]">
						{invoice.chargedWeight} kg
					</div>
				</div>
				<div>
					<div className="label text-[#64748b] text-[10px] font-[800] uppercase tracking-[1.2px] mb-[5px]">
						Pieces
					</div>
					<div className="text-[16px] font-[700]">{invoice.pieces}</div>
				</div>
			</div>

			{/* CHARGES TABLE */}
			<div className="p-[40px] flex-grow">
				<h3 className="text-[14px] font-[800] uppercase tracking-[1px] mb-[15px] text-[#0f172a]">
					Charge Details
				</h3>
				<table className="w-full border-collapse">
					<thead>
						<tr className="bg-[#f8fafc] border-y border-[#e2e8f0]">
							<th className="text-left text-[11px] font-[700] p-[12px] uppercase text-[#64748b]">
								Description
							</th>
							<th className="text-right text-[11px] font-[700] p-[12px] uppercase text-[#64748b]">
								Amount
							</th>
						</tr>
					</thead>
					<tbody>
						<tr>
							<td className="p-[12px] border-b border-[#e2e8f0] text-[14px] font-[500]">
								Freight Charges
							</td>
							<td className="p-[12px] border-b border-[#e2e8f0] text-[14px] font-[600] text-right">
								{formatCurrency(invoice.freightAmount || 0)}
							</td>
						</tr>
						{invoice.otherCharges && invoice.otherCharges > 0 && (
							<tr>
								<td className="p-[12px] border-b border-[#e2e8f0] text-[14px] font-[500]">
									Other Charges/Handling
								</td>
								<td className="p-[12px] border-b border-[#e2e8f0] text-[14px] font-[600] text-right">
									{formatCurrency(invoice.otherCharges)}
								</td>
							</tr>
						)}
						<tr>
							<td className="p-[12px] border-b border-[#e2e8f0] text-[14px] font-[500]">
								GST / Tax
							</td>
							<td className="p-[12px] border-b border-[#e2e8f0] text-[14px] font-[600] text-right">
								{formatCurrency(invoice.gstAmount || 0)}
							</td>
						</tr>
						<tr className="bg-[#f8fafc]">
							<td className="p-[15px] text-[16px] font-[800] text-[#0f172a]">
								TOTAL AMOUNT
							</td>
							<td className="p-[15px] text-[18px] font-[800] text-[#0f172a] text-right">
								{formatCurrency(invoice.totalAmount)}
							</td>
						</tr>
					</tbody>
				</table>

				<div className="mt-[40px] flex justify-between items-end">
					<div className="text-[11px] text-[#64748b] max-w-[500px]">
						<strong>Terms & Conditions:</strong>
						<br />
						1. This is a computer generated invoice and does not require
						signature.
						<br />
						2. All disputes are subject to Delhi Jurisdiction only.
						<br />
						3. Interest @ 24% p.a. will be charged if bill is not paid within
						due date.
					</div>
					<div className="text-center">
						<div className="h-[40px]"></div>
						<div className="text-[12px] font-[700] uppercase text-[#0f172a]">
							Authorized Signatory
						</div>
						<div className="text-[10px]">Tapan Associate Cargo</div>
					</div>
				</div>
			</div>

			{/* FOOTER */}
			<footer className="footer bg-[#0f172a] text-white px-[40px] py-[15px] flex justify-between items-center text-[11px]">
				<div>
					Regd Office: 1498 Ground Floor, Street 3, Wazir Nagar, New Delhi
					110003
				</div>
				<div>support@tapanassociates.com</div>
			</footer>
		</div>
	);
};
