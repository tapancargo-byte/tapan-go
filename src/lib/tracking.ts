import { supabaseAdmin } from "@/lib/supabaseAdmin";
import type {
	BarcodeRecord,
	Customer,
	InvoiceRecord,
	PackageScanRecord,
	ShipmentRecord,
} from "@/types/logistics";

export interface TrackedScan extends Omit<PackageScanRecord, "metadata"> {
	barcode_number: string | null;
}

export interface TrackedInvoice extends InvoiceRecord {
	customer:
		| Customer
		| null
		| (Customer & {
				id: string;
				name: string;
				phone: string | null;
				email: string | null;
		  });
}

export interface TrackResult {
	shipment: ShipmentRecord | null;
	shipments: ShipmentRecord[];
	barcodes: BarcodeRecord[];
	scans: TrackedScan[];
	invoice: TrackedInvoice | null;
	lookup: {
		type: "shipment_ref" | "barcode" | "invoice_ref";
		value: string;
	};
}

async function fetchBarcodesAndScans(shipmentIds: string[]) {
	let barcodes: BarcodeRecord[] = [];
	let scans: TrackedScan[] = [];

	if (shipmentIds.length === 0) {
		return { barcodes, scans };
	}

	const { data: shipmentBarcodes, error: barcodesError } = await supabaseAdmin
		.from("barcodes")
		.select(
			"id, barcode_number, shipment_id, status, last_scanned_at, last_scanned_location, created_at",
		)
		.in("shipment_id", shipmentIds);

	if (barcodesError) {
		throw barcodesError;
	}

	barcodes = (shipmentBarcodes as BarcodeRecord[]) ?? [];

	const barcodeIds: string[] = barcodes
		.map((b) => b.id)
		.filter((id): id is string => !!id);

	if (barcodeIds.length > 0) {
		const idToBarcode: Record<string, string> = {};
		for (const b of barcodes) {
			if (b.id) idToBarcode[b.id] = b.barcode_number ?? "";
		}

		const { data: scanRows, error: scansError } = await supabaseAdmin
			.from("scan_events")
			.select("id, barcode_id, created_at, location, new_status, meta")
			.in("barcode_id", barcodeIds)
			.order("created_at", { ascending: true });

		if (scansError) {
			throw scansError;
		}

		scans =
			(scanRows?.map((row) => ({
				id: row.id,
				barcode_id: row.barcode_id,
				barcode_number: idToBarcode[row.barcode_id ?? ""] || null,
				scanned_at: row.created_at,
				location: (row.location as string | null) ?? null,
				scan_type: (row.new_status as string | null) ?? null, // Mapping new_status to scan_type for UI compatibility
			})) as TrackedScan[]) ?? [];
	}

	return { barcodes, scans };
}

export async function performTracking(
	trimmed: string,
): Promise<TrackResult | { error: string; status: number }> {
	// 1. Try to find by shipment_ref
	const { data: shipment, error: shipmentError } = await supabaseAdmin
		.from("shipments")
		.select(
			`id, shipment_ref, origin, destination, weight, status, progress, created_at, updated_at,
       etd, atd, eta, ata, carrier_name, awb_number, transport_mode, eta_notes, last_eta_update`,
		)
		.eq("shipment_ref", trimmed)
		.maybeSingle();

	if (shipmentError) {
		throw shipmentError;
	}

	if (shipment) {
		const { barcodes, scans } = await fetchBarcodesAndScans([shipment.id]);
		return {
			shipment: shipment as ShipmentRecord,
			shipments: [shipment as ShipmentRecord],
			barcodes,
			scans,
			invoice: null,
			lookup: { type: "shipment_ref", value: trimmed },
		};
	}

	// 2. Try to find by barcode_number
	const { data: barcodeRow, error: barcodeError } = await supabaseAdmin
		.from("barcodes")
		.select(
			"id, barcode_number, shipment_id, status, last_scanned_at, last_scanned_location, created_at",
		)
		.eq("barcode_number", trimmed)
		.maybeSingle();

	if (barcodeError) {
		throw barcodeError;
	}

	if (barcodeRow) {
		let finalShipment: ShipmentRecord | null = null;
		let barcodes: BarcodeRecord[] = [barcodeRow as BarcodeRecord];
		let scans: TrackedScan[] = [];

		if (barcodeRow.shipment_id) {
			const { data: linkedShipment, error: linkedShipmentError } =
				await supabaseAdmin
					.from("shipments")
					.select(
						`id, shipment_ref, origin, destination, weight, status, progress, created_at, updated_at,
           etd, atd, eta, ata, carrier_name, awb_number, transport_mode, eta_notes, last_eta_update`,
					)
					.eq("id", barcodeRow.shipment_id)
					.maybeSingle();

			if (linkedShipmentError) {
				throw linkedShipmentError;
			}

			finalShipment = (linkedShipment as ShipmentRecord) ?? null;

			if (finalShipment) {
				const result = await fetchBarcodesAndScans([finalShipment.id]);
				barcodes = result.barcodes;
				scans = result.scans;
			}
		} else {
			// Barcode without shipment - fetch scans for this barcode only
			const { data: scanRows } = await supabaseAdmin
				.from("scan_events")
				.select("id, barcode_id, created_at, location, new_status")
				.eq("barcode_id", barcodeRow.id)
				.order("created_at", { ascending: true });

			scans =
				(scanRows?.map((row) => ({
					id: row.id,
					barcode_id: row.barcode_id,
					barcode_number: barcodeRow.barcode_number,
					scanned_at: row.created_at, // scan_events uses created_at
					location: (row.location as string | null) ?? null,
					scan_type: (row.new_status as string | null) ?? null, // Mapping new_status to scan_type
				})) as TrackedScan[]) ?? [];
		}

		return {
			shipment: finalShipment,
			shipments: finalShipment ? [finalShipment] : [],
			barcodes,
			scans,
			invoice: null,
			lookup: { type: "barcode", value: trimmed },
		};
	}

	// 3. Try to find by invoice_ref
	const { data: invoiceData, error: invoiceError } = await supabaseAdmin
		.from("invoices")
		.select(
			`id, invoice_ref, amount, status, invoice_date, due_date, created_at,
       customer:customers (id, name, phone, email)`,
		)
		.eq("invoice_ref", trimmed)
		.maybeSingle();

	if (invoiceError) {
		throw invoiceError;
	}

	if (invoiceData) {
		const invoice = invoiceData as unknown as TrackedInvoice;
		// Get linked shipments via invoice_items
		const { data: invoiceItems, error: itemsError } = await supabaseAdmin
			.from("invoice_items")
			.select("shipment_id, amount")
			.eq("invoice_id", invoice.id);

		if (itemsError) {
			throw itemsError;
		}

		const shipmentIds = (invoiceItems ?? [])
			.map((item) => item.shipment_id)
			.filter((id): id is string => !!id);

		let shipments: ShipmentRecord[] = [];
		let barcodes: BarcodeRecord[] = [];
		let scans: TrackedScan[] = [];

		if (shipmentIds.length > 0) {
			const { data: linkedShipments, error: shipmentsError } =
				await supabaseAdmin
					.from("shipments")
					.select(
						`id, shipment_ref, origin, destination, weight, status, progress, created_at, updated_at,
           etd, atd, eta, ata, carrier_name, awb_number, transport_mode, eta_notes, last_eta_update`,
					)
					.in("id", shipmentIds);

			if (shipmentsError) {
				throw shipmentsError;
			}

			shipments = (linkedShipments as ShipmentRecord[]) ?? [];

			const result = await fetchBarcodesAndScans(shipmentIds);
			barcodes = result.barcodes;
			scans = result.scans;
		}

		return {
			shipment: shipments.length === 1 ? shipments[0] : null,
			shipments,
			barcodes,
			scans,
			invoice: {
				id: invoice.id,
				invoice_ref: invoice.invoice_ref,
				amount: invoice.amount,
				status: invoice.status,
				invoice_date: invoice.invoice_date,
				due_date: invoice.due_date,
				created_at: invoice.created_at,
				customer: invoice.customer as Customer,
			} as TrackedInvoice,
			lookup: { type: "invoice_ref", value: trimmed },
		};
	}

	// Nothing found
	return {
		error: "No shipment, barcode, or invoice found for this reference",
		status: 404,
	};
}
