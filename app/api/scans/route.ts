import { NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabaseAdmin";
import { z } from "zod";

const scanRequestSchema = z.object({
  barcode: z.string().min(1),
  scanType: z.string().optional(),
  location: z.string().optional(),
  operatorId: z.string().optional(),
});

export async function POST(req: Request) {
  try {
    const json = await req.json();
    const parsed = scanRequestSchema.safeParse(json);

    if (!parsed.success) {
      return NextResponse.json(
        { error: "Invalid request body", details: parsed.error.flatten() },
        { status: 400 }
      );
    }

    const { barcode, scanType = "scan", location, operatorId } = parsed.data;

    if (!barcode) {
      return NextResponse.json(
        { error: "barcode is required" },
        { status: 400 }
      );
    }

    const { data: barcodeRow, error: barcodeError } = await supabaseAdmin
      .from("barcodes")
      .select("id, status")
      .eq("barcode_number", barcode)
      .maybeSingle();

    if (barcodeError) {
      throw barcodeError;
    }

    if (!barcodeRow) {
      return NextResponse.json(
        { error: "Barcode not found" },
        { status: 404 }
      );
    }

    const now = new Date().toISOString();

    const { data: scan, error: scanError } = await supabaseAdmin
      .from("package_scans")
      .insert([
        {
          barcode_id: barcodeRow.id,
          scan_type: scanType,
          location: location ?? null,
          scanned_by: operatorId ?? null,
          scanned_at: now,
        },
      ])
      .select("*")
      .single();

    if (scanError) {
      throw scanError;
    }

    const nextStatus =
      scanType === "scanned_for_manifest"
        ? "scanned_for_manifest"
        : scanType === "delivered"
        ? "delivered"
        : "in-transit";

    const { data: updatedBarcode, error: updateError } = await supabaseAdmin
      .from("barcodes")
      .update({
        status: nextStatus,
        last_scanned_at: now,
        last_scanned_location: location ?? null,
      })
      .eq("id", barcodeRow.id)
      .select("*")
      .maybeSingle();

    if (updateError) {
      throw updateError;
    }

    return NextResponse.json({ scan, barcode: updatedBarcode });
  } catch (err: any) {
    console.error("/api/scans error", err);
    return NextResponse.json(
      { error: err?.message ?? "Unknown error" },
      { status: 500 }
    );
  }
}
