"use client";

import { Loader2, Printer, X } from "lucide-react";
import QRCode from "qrcode";
import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { bankDetails, companyProfile } from "@/lib/companyConfig";
import { supabase } from "@/lib/supabaseClient";

interface InvoicePreviewProps {
	invoiceId: string;
	onClose: () => void;
}

interface InvoiceData {
	id: string;
	invoice_ref: string | null;
	amount: number;
	status: string;
	invoice_date: string | null;
	due_date: string | null;
	customer: {
		name: string;
		phone: string | null;
		city: string | null;
	} | null;
	consignor: {
		name: string;
		phone: string | null;
		city: string | null;
	} | null;
	consignee: {
		name: string;
		phone: string | null;
		city: string | null;
	} | null;
	origin: string | null;
	destination: string | null;
	pieces: number | null;
	chargedWeight: number | null;
	declaredValue: number | null;
	paymentMode: string | null;
	freightAmount: number | null;
	pickupCharge: number | null;
	deliveryCharge: number | null;
	docketCharge: number | null;
	otherCharge: number | null;
	advancePaid: number | null;
	balanceDue: number | null;
	notes: string | null;
	lineItems: {
		description: string;
		weight: number;
		amount: number;
	}[];
	previousBalance: number;
	totalDue: number;
}

// Color palette matching the PDF - now using theme variables
const COLORS = {
	brand: "var(--primary)",
	brandLight: "var(--primary)/15",
	text: "var(--foreground)",
	textMuted: "var(--muted-foreground)",
	border: "var(--border)",
	background: "var(--muted)/30",
	success: "var(--chart-2)",
	destructive: "var(--destructive)",
};

export function InvoicePreview({ invoiceId, onClose }: InvoicePreviewProps) {
	const [loading, setLoading] = useState(true);
	const [invoice, setInvoice] = useState<InvoiceData | null>(null);
	const [qrDataUrl, setQrDataUrl] = useState<string>("");

	const { toast } = useToast();

	useEffect(() => {
		async function loadInvoice() {
			try {
				// Fetch invoice
				const { data: inv, error: invError } = await supabase
					.from("invoices")
					.select(
						"id, invoice_ref, customer_id, consignor_id, consignee_id, amount, status, invoice_date, due_date, origin, destination, pieces, charged_weight, declared_value, payment_mode, freight_amount, pickup_charge, delivery_charge, docket_charge, other_charge, advance_paid, balance_due, notes",
					)
					.eq("id", invoiceId)
					.single();

				if (invError || !inv) {
					throw new Error("Invoice not found");
				}

				// Fetch billing customer / consignor / consignee
				let customer = null;
				let consignor = null;
				let consignee = null;

				if (inv.customer_id) {
					const { data: cust } = await supabase
						.from("customers")
						.select("name, phone, city")
						.eq("id", inv.customer_id)
						.single();
					customer = cust;
				}

				if (inv.consignor_id) {
					const { data: shipper } = await supabase
						.from("customers")
						.select("name, phone, city")
						.eq("id", inv.consignor_id)
						.single();
					consignor = shipper;
				}

				if (inv.consignee_id) {
					const { data: receiver } = await supabase
						.from("customers")
						.select("name, phone, city")
						.eq("id", inv.consignee_id)
						.single();
					consignee = receiver;
				}

				// Fetch invoice items
				const { data: items } = await supabase
					.from("invoice_items")
					.select("shipment_id, amount")
					.eq("invoice_id", invoiceId);

				let lineItems: InvoiceData["lineItems"] = [];
				let _itemsSubTotal = 0;

				if (items && items.length > 0) {
					const shipmentIds = items
						.map((i) => i.shipment_id)
						.filter((id): id is string => !!id);

					const shipmentsById: Record<string, any> = {};
					if (shipmentIds.length > 0) {
						const { data: shipments } = await supabase
							.from("shipments")
							.select("id, shipment_ref, origin, destination, weight")
							.in("id", shipmentIds);

						if (shipments) {
							shipments.forEach((s) => {
								shipmentsById[s.id] = s;
							});
						}
					}

					lineItems = items.map((item, index) => {
						const shipment = item.shipment_id
							? shipmentsById[item.shipment_id]
							: null;
						const weight = Number(shipment?.weight ?? 0);
						const amount = Number(item.amount ?? 0);
						_itemsSubTotal += amount;

						const parts: string[] = [];
						if (shipment?.shipment_ref) parts.push(shipment.shipment_ref);
						if (shipment?.origin || shipment?.destination) {
							parts.push(
								`${shipment.origin ?? ""} → ${shipment.destination ?? ""}`,
							);
						}

						return {
							description: parts.join(" | ") || `Shipment ${index + 1}`,
							weight,
							amount,
						};
					});
				}

				if (lineItems.length === 0 && inv.amount > 0) {
					_itemsSubTotal = inv.amount;
					lineItems = [
						{
							description: "Logistics services",
							weight: 0,
							amount: inv.amount,
						},
					];
				}

				// Calculate previous balance
				const { data: allInvoices } = await supabase
					.from("invoices")
					.select("id, amount, status, invoice_date")
					.eq("customer_id", inv.customer_id);

				let previousBalance = 0;
				let totalOutstanding = 0;

				if (allInvoices) {
					const isUnpaid = (status: string) =>
						status?.toLowerCase() === "pending" ||
						status?.toLowerCase() === "overdue";

					totalOutstanding = allInvoices.reduce((sum, row) => {
						if (!isUnpaid(row.status)) return sum;
						return sum + Number(row.amount ?? 0);
					}, 0);

					if (inv.invoice_date) {
						previousBalance = allInvoices.reduce((sum, row) => {
							if (row.id === inv.id) return sum;
							if (!isUnpaid(row.status)) return sum;
							if (!row.invoice_date || row.invoice_date >= inv.invoice_date!)
								return sum;
							return sum + Number(row.amount ?? 0);
						}, 0);
					}
				}

				const totalDue = totalOutstanding > 0 ? totalOutstanding : inv.amount;

				// Generate QR code
				const upiUri = `upi://pay?pa=${encodeURIComponent(
					process.env.NEXT_PUBLIC_UPI_VPA || "tapan@upi",
				)}&pn=${encodeURIComponent(
					process.env.NEXT_PUBLIC_UPI_PAYEE_NAME || "TAPAN CARGO SERVICE",
				)}&am=${totalDue.toFixed(2)}&cu=INR&tn=${encodeURIComponent(
					`Invoice ${inv.invoice_ref ?? inv.id}`,
				)}`;

				const qr = await QRCode.toDataURL(upiUri);
				setQrDataUrl(qr);

				setInvoice({
					id: inv.id,
					invoice_ref: inv.invoice_ref,
					amount: inv.amount,
					status: inv.status,
					invoice_date: inv.invoice_date,
					due_date: inv.due_date,
					customer,
					consignor,
					consignee,
					origin: (inv as any).origin ?? null,
					destination: (inv as any).destination ?? null,
					pieces: (inv as any).pieces ?? null,
					chargedWeight: (inv as any).charged_weight ?? null,
					declaredValue: (inv as any).declared_value ?? null,
					paymentMode: (inv as any).payment_mode ?? null,
					freightAmount: (inv as any).freight_amount ?? null,
					pickupCharge: (inv as any).pickup_charge ?? null,
					deliveryCharge: (inv as any).delivery_charge ?? null,
					docketCharge: (inv as any).docket_charge ?? null,
					otherCharge: (inv as any).other_charge ?? null,
					advancePaid: (inv as any).advance_paid ?? null,
					balanceDue: (inv as any).balance_due ?? null,
					notes: (inv as any).notes ?? null,
					lineItems,
					previousBalance,
					totalDue,
				});
			} catch (error) {
				console.error("Failed to load invoice", error);
				toast({
					title: "Error",
					description: "Failed to load invoice details",
					variant: "destructive",
				});
			} finally {
				setLoading(false);
			}
		}

		loadInvoice();
	}, [invoiceId, toast]);

	const handlePrint = () => {
		window.print();
	};

	const formatDate = (date: string | null) => {
		if (!date) return "—";
		return new Date(date).toLocaleDateString("en-IN", {
			day: "2-digit",
			month: "short",
			year: "numeric",
		});
	};

	const formatCurrency = (amount: number) => {
		return (
			"₹" +
			amount.toLocaleString("en-IN", {
				minimumFractionDigits: 2,
				maximumFractionDigits: 2,
			})
		);
	};

	const getStatusStyle = (status: string) => {
		switch (status?.toUpperCase()) {
			case "PAID":
				return { bg: "var(--chart-2)", text: "var(--primary-foreground)" };
			case "OVERDUE":
				return {
					bg: "var(--destructive)",
					text: "var(--destructive-foreground)",
				};
			default:
				return { bg: "var(--primary)", text: "var(--primary-foreground)" };
		}
	};

	if (loading) {
		return (
			<div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 backdrop-blur-sm">
				<div className="bg-card text-card-foreground border border-border shadow-2xl rounded-lg p-8 flex items-center gap-3">
					<Loader2 className="h-5 w-5 animate-spin text-primary" />
					<span>Loading invoice...</span>
				</div>
			</div>
		);
	}

	if (!invoice) {
		return (
			<div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 backdrop-blur-sm">
				<div className="bg-card text-card-foreground border border-border shadow-2xl rounded-lg p-8 text-center">
					<p className="text-destructive font-semibold mb-4 text-lg">
						Invoice not found
					</p>
					<Button onClick={onClose} variant="outline">
						Close
					</Button>
				</div>
			</div>
		);
	}

	const statusStyle = getStatusStyle(invoice.status);
	const subTotal = invoice.lineItems.reduce(
		(sum, item) => sum + item.amount,
		0,
	);

	return (
		<div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 p-4 overflow-auto">
			{/* Actions bar */}
			<div className="fixed top-4 right-4 z-[110] print:hidden">
				<div className="flex items-center gap-2 rounded-full bg-background/80 text-foreground shadow-lg ring-1 ring-border/40 backdrop-blur">
					<Button
						variant="ghost"
						size="sm"
						onClick={handlePrint}
						className="h-9 px-3 py-1.5 bg-transparent hover:bg-muted text-foreground"
					>
						<Printer className="h-4 w-4 mr-2" />
						<span className="hidden sm:inline">Print</span>
					</Button>
					<Button
						variant="ghost"
						size="sm"
						onClick={() =>
							window.open(`/invoices/${invoiceId}/print-shipment`, "_blank")
						}
						className="h-9 px-3 py-1.5 bg-primary hover:bg-primary/90 text-primary-foreground"
					>
						<Printer className="h-4 w-4 mr-2" />
						Print Shipment Invoice
					</Button>
					<Button
						variant="ghost"
						size="sm"
						onClick={() =>
							window.open(`/invoices/${invoiceId}/print-customer`, "_blank")
						}
						className="h-9 px-3 py-1.5 bg-secondary hover:bg-secondary/90 text-secondary-foreground"
					>
						<Printer className="h-4 w-4 mr-2" />
						Print Customer Invoice
					</Button>
					<Button
						variant="ghost"
						size="icon"
						onClick={onClose}
						className="h-9 w-9 rounded-full bg-transparent hover:bg-muted text-foreground"
					>
						<X className="h-5 w-5" />
					</Button>
				</div>
			</div>

			{/* Invoice */}
			<div
				className="bg-background text-foreground shadow-2xl w-full max-w-[210mm] border border-border print:border-none print:max-w-none print:shadow-none"
				style={{ minHeight: "297mm" }}
			>
				{/* Header */}
				<div
					className="px-9 py-7 border-b-[3px]"
					style={{ borderColor: COLORS.brand }}
				>
					<div className="flex justify-between items-start">
						{/* Brand */}
						<div className="flex items-center gap-3.5">
							<div
								className="w-[52px] h-[52px] rounded-[10px] flex items-center justify-center border"
								style={{
									background: COLORS.brandLight,
									borderColor: COLORS.border,
								}}
							>
								<svg viewBox="0 0 56 56" className="w-11 h-11">
									<path
										d="M28 8L48 18V38L28 48L8 38V18L28 8Z"
										stroke={COLORS.brand}
										strokeWidth="2.5"
										fill="none"
										strokeLinecap="round"
										strokeLinejoin="round"
									/>
									<path
										d="M28 8V28M28 28L48 18M28 28L8 18"
										stroke={COLORS.brand}
										strokeWidth="2.5"
										fill="none"
										strokeLinecap="round"
										strokeLinejoin="round"
									/>
									<path
										d="M8 38L18 43.5"
										stroke={COLORS.brand}
										strokeWidth="2.5"
										fill="none"
										strokeLinecap="round"
									/>
									<path
										d="M48 38L38 43.5"
										stroke={COLORS.brand}
										strokeWidth="2.5"
										fill="none"
										strokeLinecap="round"
									/>
								</svg>
							</div>
							<div>
								<h1
									className="text-2xl font-extrabold tracking-[0.02em]"
									style={{ color: COLORS.text }}
								>
									TAPAN
								</h1>
								<div
									className="text-xs font-semibold tracking-[0.12em] uppercase mt-0.5"
									style={{ color: COLORS.brand }}
								>
									Associate Cargo
								</div>
								<div className="flex gap-[5px] mt-1.5">
									<span
										className="h-1 w-9 rounded-sm"
										style={{ background: COLORS.brand }}
									/>
									<span
										className="h-1 w-[26px] rounded-sm opacity-65"
										style={{ background: COLORS.brand }}
									/>
									<span
										className="h-1 w-[18px] rounded-sm opacity-35"
										style={{ background: COLORS.brand }}
									/>
								</div>
							</div>
						</div>

						{/* Invoice title */}
						<div className="text-right">
							<div
								className="text-4xl font-light tracking-[0.08em] mb-2"
								style={{ color: COLORS.text }}
							>
								INVOICE
							</div>
							<div
								className="text-xs leading-[1.6] max-w-[220px] ml-auto"
								style={{ color: COLORS.textMuted }}
							>
								{companyProfile.addressLines.map((line, i) => (
									<div key={i}>{line}</div>
								))}
								<div className="mt-1">Tel: {companyProfile.phonePrimary}</div>
								<div>Email: {companyProfile.email}</div>
							</div>
						</div>
					</div>
				</div>

				{/* Content */}
				<div className="px-9 py-7">
					{/* Parties & Meta */}
					<div className="flex justify-between gap-10 mb-7">
						<div className="flex-1 space-y-4">
							<div>
								<h3
									className="text-xs font-semibold uppercase tracking-[0.1em] mb-2.5"
									style={{ color: COLORS.brand }}
								>
									Invoice To
								</h3>
								<div
									className="text-lg font-semibold"
									style={{ color: COLORS.text }}
								>
									{invoice.customer?.name || "—"}
								</div>
								<div
									className="text-xs leading-[1.6]"
									style={{ color: COLORS.textMuted }}
								>
									{invoice.customer?.city && <div>{invoice.customer.city}</div>}
									{invoice.customer?.phone && (
										<div>{invoice.customer.phone}</div>
									)}
								</div>
							</div>

							<div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
								<div>
									<div
										className="text-xs font-semibold uppercase tracking-[0.12em] mb-1.5"
										style={{ color: COLORS.textMuted }}
									>
										Consignor (Shipper)
									</div>
									<div className="font-medium" style={{ color: COLORS.text }}>
										{invoice.consignor?.name || "—"}
									</div>
									<div style={{ color: COLORS.textMuted }}>
										{invoice.consignor?.city && (
											<div>{invoice.consignor.city}</div>
										)}
										{invoice.consignor?.phone && (
											<div>{invoice.consignor.phone}</div>
										)}
									</div>
								</div>
								<div>
									<div
										className="text-xs font-semibold uppercase tracking-[0.12em] mb-1.5"
										style={{ color: COLORS.textMuted }}
									>
										Consignee
									</div>
									<div className="font-medium" style={{ color: COLORS.text }}>
										{invoice.consignee?.name || "—"}
									</div>
									<div style={{ color: COLORS.textMuted }}>
										{invoice.consignee?.city && (
											<div>{invoice.consignee.city}</div>
										)}
										{invoice.consignee?.phone && (
											<div>{invoice.consignee.phone}</div>
										)}
									</div>
								</div>
							</div>
						</div>

						<div className="text-right">
							<div className="space-y-1.5 text-xs">
								<div className="flex justify-end gap-4">
									<span style={{ color: COLORS.textMuted }}>Invoice No</span>
									<span
										className="font-semibold min-w-[100px] text-right"
										style={{ color: COLORS.text }}
									>
										{invoice.invoice_ref || invoice.id}
									</span>
								</div>
								<div className="flex justify-end gap-4">
									<span style={{ color: COLORS.textMuted }}>Invoice Date</span>
									<span
										className="font-semibold min-w-[100px] text-right"
										style={{ color: COLORS.text }}
									>
										{formatDate(invoice.invoice_date)}
									</span>
								</div>
								<div className="flex justify-end gap-4">
									<span style={{ color: COLORS.textMuted }}>Due Date</span>
									<span
										className="font-semibold min-w-[100px] text-right"
										style={{ color: COLORS.text }}
									>
										{formatDate(invoice.due_date)}
									</span>
								</div>
								<div className="flex justify-end gap-4">
									<span style={{ color: COLORS.textMuted }}>Status</span>
									<span className="min-w-[100px] text-right">
										<span
											className="inline-block px-3.5 py-1 rounded text-xs font-bold tracking-[0.05em]"
											style={{
												background: statusStyle.bg,
												color: statusStyle.text,
											}}
										>
											{invoice.status?.toUpperCase() || "PENDING"}
										</span>
									</span>
								</div>
							</div>
							<div
								className="inline-flex items-center gap-4 mt-3 px-5 py-2.5 rounded-md"
								style={{ background: COLORS.brand }}
							>
								<span className="text-xs uppercase tracking-[0.05em] text-white/90">
									Total Due
								</span>
								<span className="text-xl font-bold text-white">
									{formatCurrency(invoice.totalDue)}
								</span>
							</div>
						</div>
					</div>

					{/* Items Table */}
					<div className="mb-6">
						<table className="w-full border-collapse">
							<thead>
								<tr style={{ background: COLORS.brand }}>
									<th className="py-3 px-4 text-left text-xs font-semibold uppercase tracking-[0.05em] text-white w-[60px]">
										Item
									</th>
									<th className="py-3 px-4 text-left text-xs font-semibold uppercase tracking-[0.05em] text-white">
										Description
									</th>
									<th className="py-3 px-4 text-right text-xs font-semibold uppercase tracking-[0.05em] text-white w-[100px]">
										Weight
									</th>
									<th className="py-3 px-4 text-right text-xs font-semibold uppercase tracking-[0.05em] text-white w-[120px]">
										Amount
									</th>
								</tr>
							</thead>
							<tbody>
								{invoice.lineItems.map((item, index) => (
									<tr
										key={index}
										className={index % 2 === 1 ? "" : ""}
										style={{
											background:
												index % 2 === 1 ? COLORS.background : "transparent",
										}}
									>
										<td
											className="py-3.5 px-4 text-xs"
											style={{ borderBottom: `1px solid ${COLORS.border}` }}
										>
											{index + 1}
										</td>
										<td
											className="py-3.5 px-4 text-xs font-medium"
											style={{
												borderBottom: `1px solid ${COLORS.border}`,
												color: COLORS.text,
											}}
										>
											{item.description}
										</td>
										<td
											className="py-3.5 px-4 text-xs text-right"
											style={{ borderBottom: `1px solid ${COLORS.border}` }}
										>
											{item.weight > 0 ? `${item.weight.toFixed(2)} kg` : "—"}
										</td>
										<td
											className="py-3.5 px-4 text-xs text-right font-semibold"
											style={{ borderBottom: `1px solid ${COLORS.border}` }}
										>
											{formatCurrency(item.amount)}
										</td>
									</tr>
								))}
							</tbody>
						</table>
					</div>

					{/* Summary Row */}
					<div className="flex justify-between gap-10 mb-6">
						{/* Payment Method */}
						<div className="flex-1">
							<h4
								className="text-xs font-semibold uppercase tracking-[0.1em] mb-3"
								style={{ color: COLORS.brand }}
							>
								Payment Method
							</h4>
							<div className="flex items-start gap-5">
								<div
									className="w-[100px] h-[100px] rounded-lg p-1.5 border"
									style={{
										borderColor: COLORS.border,
										background: "oklch(1 0 0)",
									}}
								>
									{qrDataUrl && (
										<img
											src={qrDataUrl}
											alt="Scan to pay"
											className="w-full h-full"
										/>
									)}
								</div>
								<div
									className="text-xs leading-[1.7]"
									style={{ color: COLORS.textMuted }}
								>
									<div
										className="font-semibold mb-2"
										style={{ color: COLORS.text }}
									>
										Scan to Pay via UPI
									</div>
									<div>
										<strong style={{ color: COLORS.text }}>Bank:</strong>{" "}
										{bankDetails.bankName}
									</div>
									<div>
										<strong style={{ color: COLORS.text }}>A/C Name:</strong>{" "}
										{bankDetails.accountName}
									</div>
									<div>
										<strong style={{ color: COLORS.text }}>A/C No:</strong>{" "}
										{bankDetails.accountNumber}
									</div>
									<div>
										<strong style={{ color: COLORS.text }}>IFSC:</strong>{" "}
										{bankDetails.ifsc}
									</div>
								</div>
							</div>
						</div>

						{/* Totals & Consignment details */}
						<div className="w-[260px] space-y-3">
							{(invoice.origin ||
								invoice.destination ||
								invoice.pieces != null ||
								invoice.chargedWeight != null ||
								invoice.declaredValue != null ||
								invoice.paymentMode) && (
								<div className="text-xs" style={{ color: COLORS.textMuted }}>
									<div
										className="font-semibold mb-1"
										style={{ color: COLORS.text }}
									>
										Consignment details
									</div>
									{invoice.origin || invoice.destination ? (
										<div>
											Route: {invoice.origin || "?"}
											<span className="mx-1">→</span>
											{invoice.destination || "?"}
										</div>
									) : null}
									{invoice.pieces != null && (
										<div>Pieces: {invoice.pieces}</div>
									)}
									{invoice.chargedWeight != null && (
										<div>
											Charged weight: {invoice.chargedWeight.toFixed(2)} kg
										</div>
									)}
									{invoice.declaredValue != null && (
										<div>
											Declared value: ₹
											{invoice.declaredValue.toLocaleString("en-IN")}
										</div>
									)}
									{invoice.paymentMode && (
										<div>Payment mode: {invoice.paymentMode}</div>
									)}
								</div>
							)}

							<table className="w-full">
								<tbody>
									<tr>
										<td
											className="py-2 text-xs"
											style={{ color: COLORS.textMuted }}
										>
											Subtotal
										</td>
										<td className="py-2 text-xs text-right font-medium">
											{formatCurrency(subTotal)}
										</td>
									</tr>
									{invoice.freightAmount != null && (
										<tr>
											<td
												className="py-1 text-xs"
												style={{ color: COLORS.textMuted }}
											>
												Freight / handling
											</td>
											<td className="py-1 text-xs text-right font-medium">
												{formatCurrency(invoice.freightAmount)}
											</td>
										</tr>
									)}
									<tr>
										<td
											className="py-2 text-xs"
											style={{ color: COLORS.textMuted }}
										>
											Previous Balance
										</td>
										<td className="py-2 text-xs text-right font-medium">
											{formatCurrency(invoice.previousBalance)}
										</td>
									</tr>
									<tr style={{ background: COLORS.brand }}>
										<td className="py-3 px-3.5 text-sm font-bold text-white">
											TOTAL AMOUNT
										</td>
										<td className="py-3 px-3.5 text-sm font-bold text-white text-right">
											{formatCurrency(invoice.totalDue)}
										</td>
									</tr>
								</tbody>
							</table>
						</div>
					</div>
				</div>

				{/* Footer */}
				<div
					className="px-9 py-5 border-t"
					style={{ borderColor: COLORS.border, background: COLORS.background }}
				>
					<div className="flex justify-between gap-10">
						<div className="flex-1">
							<h4
								className="text-xs font-semibold uppercase tracking-[0.1em] mb-2.5"
								style={{ color: COLORS.brand }}
							>
								Bank Details
							</h4>
							<div
								className="text-xs leading-[1.7]"
								style={{ color: COLORS.textMuted }}
							>
								<div>
									<strong style={{ color: COLORS.text }}>Bank:</strong>{" "}
									{bankDetails.bankName}
								</div>
								<div>
									<strong style={{ color: COLORS.text }}>Branch:</strong>{" "}
									{bankDetails.branch}
								</div>
								<div>
									<strong style={{ color: COLORS.text }}>Account:</strong>{" "}
									{bankDetails.accountNumber}
								</div>
								<div>
									<strong style={{ color: COLORS.text }}>IFSC:</strong>{" "}
									{bankDetails.ifsc}
								</div>
							</div>
						</div>
						<div className="flex-1">
							<h4
								className="text-xs font-semibold uppercase tracking-[0.1em] mb-2.5"
								style={{ color: COLORS.brand }}
							>
								Terms & Conditions
							</h4>
							<ol
								className="text-xs leading-[1.6] pl-3.5 m-0"
								style={{ color: COLORS.textMuted }}
							>
								<li>
									Consignee must declare contents and value before booking.
								</li>
								<li>
									Fragile items shipped at owner's risk unless special
									arrangement.
								</li>
								<li>Company not liable for perishable damage or leakage.</li>
								<li>
									Unclaimed items after 30 days disposed per company policy.
								</li>
							</ol>
						</div>
					</div>
				</div>

				{/* Signature */}
				<div className="px-9 py-6 flex justify-between items-end">
					<div>
						<div className="text-xs mb-9" style={{ color: COLORS.textMuted }}>
							For {companyProfile.name}
						</div>
						<div
							className="w-[150px] border-t pt-1.5 text-xs"
							style={{ borderColor: COLORS.text, color: COLORS.textMuted }}
						>
							Authorised Signatory
						</div>
					</div>
					<div className="text-right">
						<h3
							className="text-base font-bold mb-1"
							style={{ color: COLORS.brand }}
						>
							THANKS FOR YOUR BUSINESS
						</h3>
						<p className="text-xs" style={{ color: COLORS.textMuted }}>
							Generated by TAPAN GO Cargo System
						</p>
					</div>
				</div>
			</div>
		</div>
	);
}
