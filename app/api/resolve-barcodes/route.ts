import { NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabaseAdmin";

interface ResolveBody {
  barcodes?: string[];
}

export async function POST(req: Request) {
  try {
    const { barcodes } = (await req.json()) as ResolveBody;

    if (!barcodes || !Array.isArray(barcodes) || barcodes.length === 0) {
      return NextResponse.json(
        { error: "barcodes must be a non-empty array" },
        { status: 400 }
      );
    }

    const { data, error } = await supabaseAdmin
      .from("barcodes")
      .select("id, barcode_number, shipment_id")
      .in("barcode_number", barcodes);

    if (error) {
      throw error;
    }

    const rows = (data ?? []) as { id: string; barcode_number: string; shipment_id: string | null }[];

    const map = new Map<string, { id: string; barcode_number: string; shipment_id: string | null }>();
    rows.forEach((row) => {
      map.set(row.barcode_number, row);
    });

    const resolved = barcodes.map((code) => map.get(code) ?? null);
    const ids = resolved.map((r) => (r ? r.id : null));

    return NextResponse.json({ resolved, ids });
  } catch (err: any) {
    console.error("/api/resolve-barcodes error", err);
    return NextResponse.json(
      { error: err?.message ?? "Unknown error" },
      { status: 500 }
    );
  }
}
