import { NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabaseAdmin";
import { z } from "zod";

const manifestBodySchema = z.object({
  manifestRef: z.string().optional(),
  originHub: z.string().min(2),
  destination: z.string().min(2),
  airlineCode: z.string().min(1),
  scannedBarcodeIds: z.array(z.string().min(1)).nonempty(),
  createdBy: z.string().optional(),
});

export async function POST(req: Request) {
  try {
    const json = await req.json();
    const parsed = manifestBodySchema.safeParse(json);

    if (!parsed.success) {
      return NextResponse.json(
        { error: "Invalid request body", details: parsed.error.flatten() },
        { status: 400 }
      );
    }

    const { manifestRef, originHub, destination, airlineCode, scannedBarcodeIds, createdBy } = parsed.data;

    const { data: barcodeRows, error: barcodeError } = await supabaseAdmin
      .from("barcodes")
      .select("id, shipment_id")
      .in("id", scannedBarcodeIds);

    if (barcodeError) {
      throw barcodeError;
    }

    const barcodes = (barcodeRows ?? []) as { id: string; shipment_id: string | null }[];

    if (!barcodes.length) {
      return NextResponse.json({ error: "No barcodes found for provided IDs" }, { status: 404 });
    }

    const shipmentIds = Array.from(
      new Set(barcodes.map((b) => b.shipment_id).filter((id): id is string => !!id))
    );

    const shipmentsMap = new Map<string, { id: string; weight: number | null }>();

    if (shipmentIds.length) {
      const { data: shipments, error: shipmentsError } = await supabaseAdmin
        .from("shipments")
        .select("id, weight")
        .in("id", shipmentIds);

      if (shipmentsError) {
        throw shipmentsError;
      }

      (shipments ?? []).forEach((s: any) => {
        shipmentsMap.set(s.id, { id: s.id, weight: s.weight });
      });
    }

    let totalWeight = 0;

    barcodes.forEach((b) => {
      if (b.shipment_id) {
        const shipment = shipmentsMap.get(b.shipment_id);
        if (shipment?.weight) {
          totalWeight += Number(shipment.weight);
        }
      }
    });

    const totalPieces = barcodes.length;

    const ref = manifestRef || `MAN-${Date.now()}`;

    const { data: manifest, error: manifestError } = await supabaseAdmin
      .from("manifests")
      .insert([
        {
          manifest_ref: ref,
          origin_hub: originHub,
          destination,
          airline_code: airlineCode,
          manifest_date: new Date().toISOString(),
          total_weight: totalWeight,
          total_pieces: totalPieces,
          status: "scheduled",
          created_by: createdBy ?? null,
        },
      ])
      .select("*")
      .single();

    if (manifestError) {
      throw manifestError;
    }

    const manifestId = manifest.id as string;

    const manifestItems = barcodes.map((b) => ({
      manifest_id: manifestId,
      shipment_id: b.shipment_id,
      barcode_id: b.id,
      weight: b.shipment_id ? shipmentsMap.get(b.shipment_id)?.weight ?? null : null,
    }));

    const { error: itemsError } = await supabaseAdmin
      .from("manifest_items")
      .insert(manifestItems);

    if (itemsError) {
      throw itemsError;
    }

    await supabaseAdmin
      .from("package_scans")
      .update({ manifest_id: manifestId })
      .in("barcode_id", barcodes.map((b) => b.id));

    return NextResponse.json({ success: true, manifest });
  } catch (err: any) {
    console.error("/api/manifests error", err);
    return NextResponse.json(
      { error: err?.message ?? "Unknown error" },
      { status: 500 }
    );
  }
}
