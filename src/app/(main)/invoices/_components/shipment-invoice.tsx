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
			address?: string;
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
		items?: { description: string; quantity: number; value: number }[];
		totalAmount: number;
		paymentMode?: string;
		gstin?: string; // Tapan's GSTIN
	};
}

export const ShipmentInvoice: React.FC<InvoiceProps> = ({ invoice }) => {
	// Format dates: DD MMM YYYY
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

	// Format currency
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
				aspectRatio: "4/3",
				fontFamily: "'Inter', sans-serif",
				display: "grid",
				gridTemplateRows: "75px 1fr 45px",
				overflow: "hidden",
				border: "1px solid #e2e8f0",
			}}
		>
			{/* HEADER */}
			<header className="header bg-[#0f172a] text-white flex justify-between items-center px-[30px] border-b-[4px] border-[#f59e0b]">
				<div className="logo-group flex items-center gap-[12px]">
					<div className="logo-box bg-[#f59e0b] text-[#0f172a] px-[12px] py-[4px] font-[900] italic text-[22px] rounded-[4px]">
						TAC
					</div>
					<div>
						<div style={{ fontWeight: 800, fontSize: "16px" }}>
							EXPRESS FREIGHT
						</div>
						<div style={{ fontSize: "9px", opacity: 0.8 }}>
							LOGISTICS NETWORK
						</div>
					</div>
				</div>
				<div style={{ textAlign: "right" }}>
					<div
						className="label text-[9px] font-[800] uppercase tracking-[1.2px] mb-[2px]"
						style={{ color: "white", opacity: 0.7 }}
					>
						Booking Date
					</div>
					<div style={{ fontWeight: 700 }}>
						{formatDate(invoice.dateOfBooking)}
					</div>
				</div>
			</header>

			{/* MAIN CONTENT */}
			<div className="main-grid grid grid-cols-[1.3fr_0.7fr] min-h-0">
				<div className="col-left px-[30px] py-[15px] border-r border-[#e2e8f0] flex flex-col gap-[12px] overflow-y-auto">
					{/* BARCODE AREA */}
					<div className="barcode-area bg-white border border-[#e2e8f0] p-[8px] rounded-[6px] text-center flex flex-col items-center justify-center">
						{/* Using react-barcode for dynamic generation */}
						<div className="w-full max-w-[300px] h-[50px] overflow-hidden flex items-center justify-center mb-1">
							<Barcode
								value={invoice.invoiceRef || invoice.id}
								height={40}
								width={1.5}
								displayValue={false}
								margin={0}
							/>
						</div>
						<div className="awb-number font-mono text-[18px] font-[800] tracking-[1px]">
							AWB{" "}
							{invoice.invoiceRef?.replace(/(.{4})/g, "$1 ").trim() ||
								invoice.id}
						</div>
					</div>

					<div
						style={{
							display: "grid",
							gridTemplateColumns: "1fr 1fr",
							gap: "20px",
						}}
					>
						{/* Consigne / Ship To */}
						<div>
							<div className="label text-[#64748b] text-[9px] font-[800] uppercase tracking-[1.2px] mb-[2px]">
								Ship To (Consignee)
							</div>
							<div
								className="recipient-name text-[#0f172a] text-[20px] font-[800] truncate"
								title={invoice.consignee.name}
							>
								{invoice.consignee.name}
							</div>
							<div className="address-text text-[#1e293b] text-[13px] leading-[1.4]">
								{invoice.consignee.address || "Address not provided"}
								<br />
								{invoice.consignee.phone && (
									<span>Ph: {invoice.consignee.phone}</span>
								)}
							</div>
						</div>
						{/* Return Address / Consignor in smaller text usually or TAC address */}
						<div>
							<div className="label text-[#64748b] text-[9px] font-[800] uppercase tracking-[1.2px] mb-[2px]">
								Return Address
							</div>
							<div className="address-text text-[#1e293b] text-[11px] leading-[1.4]">
								<strong>Tapan Associate Cargo</strong>
								<br />
								1498 Ground Floor, Street 3<br />
								Wazir Nagar, New Delhi 110003
							</div>
						</div>
					</div>

					<div className="flex-grow">
						<div className="label text-[#64748b] text-[9px] font-[800] uppercase tracking-[1.2px] mb-[2px]">
							Manifest Details
						</div>
						<table className="items-table w-full border-collapse">
							<thead>
								<tr>
									<th className="text-left text-[10px] p-[6px] bg-[#f8fafc] border-b-[2px] border-[#e2e8f0]">
										DESCRIPTION OF GOODS
									</th>
									<th className="text-left text-[10px] p-[6px] bg-[#f8fafc] border-b-[2px] border-[#e2e8f0]">
										QTY
									</th>
									<th
										style={{ textAlign: "right" }}
										className="text-[10px] p-[6px] bg-[#f8fafc] border-b-[2px] border-[#e2e8f0]"
									>
										DECLARED VALUE
									</th>
								</tr>
							</thead>
							<tbody>
								{invoice.items && invoice.items.length > 0 ? (
									invoice.items.map((item, idx) => (
										<tr key={idx}>
											<td className="p-[8px_6px] border-b border-[#e2e8f0] text-[13px] font-[600]">
												{item.description}
											</td>
											<td className="p-[8px_6px] border-b border-[#e2e8f0] text-[13px] font-[600]">
												{item.quantity}
											</td>
											<td className="p-[8px_6px] border-b border-[#e2e8f0] text-[13px] font-[600] text-right">
												{formatCurrency(item.value)}
											</td>
										</tr>
									))
								) : (
									<tr>
										<td className="p-[8px_6px] border-b border-[#e2e8f0] text-[13px] font-[600]">
											{invoice.items?.[0]?.description || "General Cargo"}
										</td>
										<td className="p-[8px_6px] border-b border-[#e2e8f0] text-[13px] font-[600]">
											{invoice.pieces}
										</td>
										<td className="p-[8px_6px] border-b border-[#e2e8f0] text-[13px] font-[600] text-right">
											{formatCurrency(invoice.declaredValue)}
										</td>
									</tr>
								)}
							</tbody>
						</table>
					</div>

					<div
						style={{
							background: "#fffbeb",
							padding: "8px",
							borderRadius: "6px",
							borderLeft: "3px solid #f59e0b",
							fontSize: "9px",
							color: "#92400e",
						}}
					>
						<strong>SECURITY:</strong> Verified content. No hazardous materials
						or prohibited items. Liability governed by TAC terms.
					</div>
				</div>

				<div className="col-right bg-[#f8fafc] px-[25px] py-[15px] flex flex-col gap-[12px] overflow-y-auto">
					<div className="label text-[#64748b] text-[9px] font-[800] uppercase tracking-[1.2px] mb-[2px]">
						Sector
					</div>
					<div className="route-card bg-white p-[12px] rounded-[12px] flex justify-around items-center border border-[#e2e8f0] shadow-[0_2px_4px_rgba(0,0,0,0.03)]">
						<div>
							<div className="city-code text-[30px] font-[900] text-[#0f172a]">
								{invoice.origin.substring(0, 3).toUpperCase()}
							</div>
							<div className="label text-[#64748b] text-[9px] font-[800] uppercase tracking-[1.2px] mb-[2px] m-0">
								Origin
							</div>
						</div>
						<div className="plane-wrapper relative w-[44px] h-[44px] flex items-center justify-center">
							<svg
								className="plane-svg w-[28px] h-[28px] text-[#f59e0b] rotate-45"
								viewBox="0 0 24 24"
								fill="currentColor"
								aria-hidden="true"
							>
								<path d="M21.5,13.5L13,11V3.5C13,2.67 12.33,2 11.5,2C10.67,2 10,2.67 10,3.5V11L1.5,13.5V15.5L10,13V19L8,20.5V22L11.5,21L15,22V20.5L13,19V13L21.5,15.5V13.5Z" />
							</svg>
						</div>
						<div>
							<div className="city-code text-[30px] font-[900] text-[#0f172a]">
								{invoice.destination.substring(0, 3).toUpperCase()}
							</div>
							<div className="label text-[#64748b] text-[9px] font-[800] uppercase tracking-[1.2px] mb-[2px] m-0">
								Dest
							</div>
						</div>
					</div>

					<div className="label text-[#64748b] text-[9px] font-[800] uppercase tracking-[1.2px] mb-[2px]">
						Shipment Specs
					</div>
					<div className="stats-grid grid grid-cols-2 gap-[8px]">
						<div className="stat-box bg-white p-[8px_12px] rounded-[6px] border border-[#e2e8f0]">
							<div className="label text-[#64748b] text-[9px] font-[800] uppercase tracking-[1.2px] mb-[2px]">
								Weight
							</div>
							<div className="stat-val text-[14px] font-[700]">
								{invoice.chargedWeight} KG
							</div>
						</div>
						<div className="stat-box bg-white p-[8px_12px] rounded-[6px] border border-[#e2e8f0]">
							<div className="label text-[#64748b] text-[9px] font-[800] uppercase tracking-[1.2px] mb-[2px]">
								Mode
							</div>
							<div className="stat-val text-[14px] font-[700]">AIR</div>
						</div>
						<div className="stat-box bg-white p-[8px_12px] rounded-[6px] border border-[#e2e8f0]">
							<div className="label text-[#64748b] text-[9px] font-[800] uppercase tracking-[1.2px] mb-[2px]">
								Pieces
							</div>
							<div className="stat-val text-[14px] font-[700]">
								{invoice.pieces}
							</div>
						</div>
						<div className="stat-box bg-white p-[8px_12px] rounded-[6px] border border-[#e2e8f0]">
							<div className="label text-[#64748b] text-[9px] font-[800] uppercase tracking-[1.2px] mb-[2px]">
								Ref
							</div>
							<div className="stat-val text-[14px] font-[700]">
								#{invoice.invoiceRef?.slice(-4)}
							</div>
						</div>
					</div>

					<div className="gst-box bg-white p-[8px_12px] rounded-[6px] border-l-[4px] border-[#0f172a] text-[11px]">
						<div className="label text-[#64748b] text-[9px] font-[800] uppercase tracking-[1.2px] mb-[2px]">
							Tax Information
						</div>
						<strong>GSTIN: {invoice.gstin || "07AAMFT6165B1Z3"}</strong>
					</div>

					<div className="prepaid-seal mt-auto border-[3px] border-double border-[#f59e0b] text-[#f59e0b] p-[6px] text-center font-[900] text-[22px] rounded-[4px] -rotate-1">
						{invoice.paymentMode?.toUpperCase() || "PREPAID"}
					</div>
				</div>
			</div>

			{/* FOOTER */}
			<footer className="footer bg-white px-[30px] flex justify-between items-center text-[10px] text-[#64748b] border-t border-[#e2e8f0]">
				<div>
					Tracking: <strong>TAC-{invoice.invoiceRef || invoice.id}</strong>
				</div>
				<div>
					Generated: {new Date().toLocaleDateString("en-IN")} | System Node:{" "}
					{invoice.origin.substring(0, 3).toUpperCase()}-MAIN-04
				</div>
			</footer>
		</div>
	);
};
