import { NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabaseAdmin";
import { withRateLimit } from "@/lib/rateLimit";

interface TrackRequestBody {
  query?: string;
}

interface TrackResult {
  shipment: any | null;
  shipments: any[];
  barcodes: any[];
  scans: any[];
  invoice: any | null;
  lookup: {
    type: "shipment_ref" | "barcode" | "invoice_ref";
    value: string;
  };
}

async function fetchBarcodesAndScans(shipmentIds: string[]) {
  let barcodes: any[] = [];
  let scans: any[] = [];

  if (shipmentIds.length === 0) {
    return { barcodes, scans };
  }

  const { data: shipmentBarcodes, error: barcodesError } = await supabaseAdmin
    .from("barcodes")
    .select(
      "id, barcode_number, shipment_id, status, last_scanned_at, last_scanned_location, created_at"
    )
    .in("shipment_id", shipmentIds);

  if (barcodesError) {
    throw barcodesError;
  }

  barcodes = shipmentBarcodes ?? [];

  const barcodeIds: string[] = barcodes
    .map((b) => b.id as string | null)
    .filter((id): id is string => !!id);

  if (barcodeIds.length > 0) {
    const idToBarcode: Record<string, string> = {};
    barcodes.forEach((b) => {
      if (b.id) idToBarcode[b.id] = b.barcode_number ?? "";
    });

    const { data: scanRows, error: scansError } = await supabaseAdmin
      .from("package_scans")
      .select("id, barcode_id, scanned_at, location, scan_type")
      .in("barcode_id", barcodeIds)
      .order("scanned_at", { ascending: true });

    if (scansError) {
      throw scansError;
    }

    scans =
      scanRows?.map((row) => ({
        id: row.id as string,
        barcode_id: row.barcode_id as string,
        barcode_number: idToBarcode[row.barcode_id ?? ""] || null,
        scanned_at: row.scanned_at as string,
        location: (row.location as string | null) ?? null,
        scan_type: (row.scan_type as string | null) ?? null,
      })) ?? [];
  }

  return { barcodes, scans };
}

export async function performTracking(trimmed: string): Promise<TrackResult | { error: string; status: number }> {
  // 1. Try to find by shipment_ref
  const { data: shipment, error: shipmentError } = await supabaseAdmin
    .from("shipments")
    .select(
      `id, shipment_ref, origin, destination, weight, status, progress, created_at, updated_at,
       etd, atd, eta, ata, carrier_name, awb_number, transport_mode, eta_notes, last_eta_update`
    )
    .eq("shipment_ref", trimmed)
    .maybeSingle();

  if (shipmentError) {
    throw shipmentError;
  }

  if (shipment) {
    const { barcodes, scans } = await fetchBarcodesAndScans([shipment.id]);
    return {
      shipment,
      shipments: [shipment],
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
      "id, barcode_number, shipment_id, status, last_scanned_at, last_scanned_location, created_at"
    )
    .eq("barcode_number", trimmed)
    .maybeSingle();

  if (barcodeError) {
    throw barcodeError;
  }

  if (barcodeRow) {
    let finalShipment: any | null = null;
    let barcodes: any[] = [barcodeRow];
    let scans: any[] = [];

    if (barcodeRow.shipment_id) {
      const { data: linkedShipment, error: linkedShipmentError } = await supabaseAdmin
        .from("shipments")
        .select(
          `id, shipment_ref, origin, destination, weight, status, progress, created_at, updated_at,
           etd, atd, eta, ata, carrier_name, awb_number, transport_mode, eta_notes, last_eta_update`
        )
        .eq("id", barcodeRow.shipment_id)
        .maybeSingle();

      if (linkedShipmentError) {
        throw linkedShipmentError;
      }

      finalShipment = linkedShipment ?? null;

      if (finalShipment) {
        const result = await fetchBarcodesAndScans([finalShipment.id]);
        barcodes = result.barcodes;
        scans = result.scans;
      }
    } else {
      // Barcode without shipment - fetch scans for this barcode only
      const { data: scanRows } = await supabaseAdmin
        .from("package_scans")
        .select("id, barcode_id, scanned_at, location, scan_type")
        .eq("barcode_id", barcodeRow.id)
        .order("scanned_at", { ascending: true });

      scans =
        scanRows?.map((row) => ({
          id: row.id as string,
          barcode_id: row.barcode_id as string,
          barcode_number: barcodeRow.barcode_number,
          scanned_at: row.scanned_at as string,
          location: (row.location as string | null) ?? null,
          scan_type: (row.scan_type as string | null) ?? null,
        })) ?? [];
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
  const { data: invoice, error: invoiceError } = await supabaseAdmin
    .from("invoices")
    .select(
      `id, invoice_ref, amount, status, invoice_date, due_date, created_at,
       customers (id, name, phone, email)`
    )
    .eq("invoice_ref", trimmed)
    .maybeSingle();

  if (invoiceError) {
    throw invoiceError;
  }

  if (invoice) {
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

    let shipments: any[] = [];
    let barcodes: any[] = [];
    let scans: any[] = [];

    if (shipmentIds.length > 0) {
      const { data: linkedShipments, error: shipmentsError } = await supabaseAdmin
        .from("shipments")
        .select(
          `id, shipment_ref, origin, destination, weight, status, progress, created_at, updated_at,
           etd, atd, eta, ata, carrier_name, awb_number, transport_mode, eta_notes, last_eta_update`
        )
        .in("id", shipmentIds);

      if (shipmentsError) {
        throw shipmentsError;
      }

      shipments = linkedShipments ?? [];

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
        customer: invoice.customers,
      },
      lookup: { type: "invoice_ref", value: trimmed },
    };
  }

  // Nothing found
  return { error: "No shipment, barcode, or invoice found for this reference", status: 404 };
}

async function handleTrackPost(req: Request) {
  try {
    const { query } = (await req.json()) as TrackRequestBody;
    const trimmed = (query ?? "").trim();

    if (!trimmed) {
      return NextResponse.json(
        { error: "query is required" },
        { status: 400 }
      );
    }

    const result = await performTracking(trimmed);

    if ("error" in result) {
      return NextResponse.json({ error: result.error }, { status: result.status });
    }

    return NextResponse.json(result);
  } catch (err: any) {
    console.error("/api/public/track error", err);
    return NextResponse.json(
      { error: err?.message ?? "Unknown error" },
      { status: 500 }
    );
  }
}

export const POST = withRateLimit("tracking", handleTrackPost);

async function handleTrackGet(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const queryParam =
      searchParams.get("query") ??
      searchParams.get("ref") ??
      searchParams.get("q") ??
      "";
    const trimmed = queryParam.trim();

    if (!trimmed) {
      return NextResponse.json(
        { error: "query is required" },
        { status: 400 }
      );
    }

    const result = await performTracking(trimmed);

    if ("error" in result) {
      return NextResponse.json({ error: result.error }, { status: result.status });
    }

    return NextResponse.json(result);
  } catch (err: any) {
    console.error("/api/public/track error", err);
    return NextResponse.json(
      { error: err?.message ?? "Unknown error" },
      { status: 500 }
    );
  }
}

export const GET = withRateLimit("tracking", handleTrackGet);
