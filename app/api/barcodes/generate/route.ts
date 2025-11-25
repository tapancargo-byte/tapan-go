import { NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabaseAdmin";

interface GenerateBarcodeBody {
  barcodeNumber?: string;
  shipmentId?: string;
}

export async function POST(req: Request) {
  try {
    const { barcodeNumber, shipmentId } = (await req.json()) as GenerateBarcodeBody;

    if (!barcodeNumber) {
      return NextResponse.json(
        { error: "barcodeNumber is required" },
        { status: 400 }
      );
    }

    const { data, error } = await supabaseAdmin
      .from("barcodes")
      .insert([
        {
          barcode_number: barcodeNumber,
          shipment_id: shipmentId ?? null,
          status: "pending",
        },
      ])
      .select("id, barcode_number, shipment_id, status")
      .single();

    if (error) {
      throw error;
    }

    return NextResponse.json({ barcode: data });
  } catch (err: any) {
    console.error("/api/barcodes/generate error", err);
    return NextResponse.json(
      { error: err?.message ?? "Unknown error" },
      { status: 500 }
    );
  }
}
