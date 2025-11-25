import { NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabaseAdmin";

export async function GET() {
  try {
    const [scansRes, manifestsRes, invoiceLogsRes] = await Promise.all([
      supabaseAdmin
        .from("package_scans")
        .select("id, barcode_id, scan_type, location, scanned_at")
        .order("scanned_at", { ascending: false })
        .limit(20),
      supabaseAdmin
        .from("manifests")
        .select("id, manifest_ref, origin_hub, destination, status, manifest_date, created_at")
        .order("created_at", { ascending: false })
        .limit(10),
      supabaseAdmin
        .from("invoice_generation_logs")
        .select("id, invoice_id, status, message, started_at, finished_at, duration_ms")
        .order("started_at", { ascending: false })
        .limit(10),
    ]);

    if (scansRes.error) throw scansRes.error;
    if (manifestsRes.error) throw manifestsRes.error;
    if (invoiceLogsRes.error) throw invoiceLogsRes.error;

    return NextResponse.json({
      scans: scansRes.data ?? [],
      manifests: manifestsRes.data ?? [],
      invoiceLogs: invoiceLogsRes.data ?? [],
    });
  } catch (err: any) {
    console.error("/api/ops/activity error", err);
    return NextResponse.json(
      { error: err?.message ?? "Unknown error" },
      { status: 500 }
    );
  }
}
