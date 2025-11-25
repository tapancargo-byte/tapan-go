import { NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabaseAdmin";

interface TrackRequestBody {
  query?: string;
}

export async function POST(req: Request) {
  try {
    const { query } = (await req.json()) as TrackRequestBody;
    const trimmed = (query ?? "").trim();

    if (!trimmed) {
      return NextResponse.json(
        { error: "query is required" },
        { status: 400 }
      );
    }

    const { data: shipment, error: shipmentError } = await supabaseAdmin
      .from("shipments")
      .select(
        "id, shipment_ref, origin, destination, weight, status, progress, created_at, updated_at"
      )
      .eq("shipment_ref", trimmed)
      .maybeSingle();

    if (shipmentError) {
      throw shipmentError;
    }

    let finalShipment: any | null = shipment ?? null;
    let barcodes: any[] = [];

    if (finalShipment) {
      const { data: shipmentBarcodes, error: barcodesError } = await supabaseAdmin
        .from("barcodes")
        .select(
          "id, barcode_number, status, last_scanned_at, last_scanned_location, created_at"
        )
        .eq("shipment_id", finalShipment.id);

      if (barcodesError) {
        throw barcodesError;
      }

      barcodes = shipmentBarcodes ?? [];
    } else {
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

      if (!barcodeRow) {
        return NextResponse.json(
          { error: "No shipment or barcode found for this reference" },
          { status: 404 }
        );
      }

      if (barcodeRow.shipment_id) {
        const { data: linkedShipment, error: linkedShipmentError } = await supabaseAdmin
          .from("shipments")
          .select(
            "id, shipment_ref, origin, destination, weight, status, progress, created_at, updated_at"
          )
          .eq("id", barcodeRow.shipment_id)
          .maybeSingle();

        if (linkedShipmentError) {
          throw linkedShipmentError;
        }

        finalShipment = linkedShipment ?? null;

        const { data: shipmentBarcodes, error: barcodesError2 } = await supabaseAdmin
          .from("barcodes")
          .select(
            "id, barcode_number, status, last_scanned_at, last_scanned_location, created_at"
          )
          .eq("shipment_id", barcodeRow.shipment_id);

        if (barcodesError2) {
          throw barcodesError2;
        }

        barcodes = shipmentBarcodes ?? [];
      } else {
        barcodes = [barcodeRow];
      }
    }
    let scans: any[] = [];

    try {
      const barcodeIds: string[] = (barcodes as any[])
        .map((b) => (b.id as string | null) ?? null)
        .filter((id): id is string => !!id);

      if (barcodeIds.length > 0) {
        const idToBarcode: Record<string, string> = {};
        (barcodes as any[]).forEach((b) => {
          const id = (b.id as string | null) ?? "";
          if (!id) return;
          idToBarcode[id] = (b.barcode_number as string | null) ?? "";
        });

        const { data: scanRows, error: scansError } = await supabaseAdmin
          .from("package_scans")
          .select("id, barcode_id, scanned_at, location, scan_type")
          .in("barcode_id", barcodeIds)
          .order("scanned_at", { ascending: true });

        if (scansError) {
          throw scansError;
        }

        scans = (scanRows as any[] | null)?.map((row) => ({
          id: row.id as string,
          barcode_id: row.barcode_id as string,
          barcode_number:
            idToBarcode[(row.barcode_id as string | null) ?? ""] || null,
          scanned_at: row.scanned_at as string,
          location: (row.location as string | null) ?? null,
          scan_type: (row.scan_type as string | null) ?? null,
        })) ?? [];
      }
    } catch (scansErr) {
      console.error("Failed to load public tracking scans", scansErr);
      scans = [];
    }

    return NextResponse.json({
      shipment: finalShipment,
      barcodes,
      scans,
      lookup: {
        type: finalShipment ? "shipment_ref" : "barcode",
        value: trimmed,
      },
    });
  } catch (err: any) {
    console.error("/api/public/track error", err);
    return NextResponse.json(
      { error: err?.message ?? "Unknown error" },
      { status: 500 }
    );
  }
}
