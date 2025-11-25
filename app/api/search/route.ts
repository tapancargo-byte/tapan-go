import { NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabaseAdmin";

interface SearchBody {
  q?: string;
}

export async function POST(req: Request) {
  try {
    const { q } = (await req.json()) as SearchBody;
    const term = (q ?? "").trim();

    if (!term) {
      return NextResponse.json({
        shipments: [],
        barcodes: [],
        invoices: [],
        customers: [],
        manifests: [],
      });
    }

    const like = `%${term}%`;

    const [shipmentsRes, barcodesRes, invoicesRes, customersRes, manifestsRes] =
      await Promise.all([
        supabaseAdmin
          .from("shipments")
          .select("id, shipment_ref, origin, destination, status")
          .or(
            `shipment_ref.ilike.${like},origin.ilike.${like},destination.ilike.${like}`
          )
          .limit(10),
        supabaseAdmin
          .from("barcodes")
          .select("id, barcode_number, shipment_id, status")
          .ilike("barcode_number", like)
          .limit(10),
        supabaseAdmin
          .from("invoices")
          .select("id, invoice_ref, amount, status")
          .ilike("invoice_ref", like)
          .limit(10),
        supabaseAdmin
          .from("customers")
          .select("id, name, email, phone")
          .or(
            `name.ilike.${like},email.ilike.${like},phone.ilike.${like}`
          )
          .limit(10),
        supabaseAdmin
          .from("manifests")
          .select("id, manifest_ref, origin_hub, destination, status")
          .or(
            `manifest_ref.ilike.${like},origin_hub.ilike.${like},destination.ilike.${like}`
          )
          .limit(10),
      ]);

    if (shipmentsRes.error) throw shipmentsRes.error;
    if (barcodesRes.error) throw barcodesRes.error;
    if (invoicesRes.error) throw invoicesRes.error;
    if (customersRes.error) throw customersRes.error;
    if (manifestsRes.error) throw manifestsRes.error;

    return NextResponse.json({
      shipments: shipmentsRes.data ?? [],
      barcodes: barcodesRes.data ?? [],
      invoices: invoicesRes.data ?? [],
      customers: customersRes.data ?? [],
      manifests: manifestsRes.data ?? [],
    });
  } catch (err: any) {
    console.error("/api/search error", err);
    return NextResponse.json(
      { error: err?.message ?? "Unknown error" },
      { status: 500 }
    );
  }
}
