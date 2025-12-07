
import { NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabaseAdmin";

export async function POST(req: Request) {
  return handleRequest(req);
}

export async function GET(req: Request) {
  return handleRequest(req);
}

async function handleRequest(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const tracking = searchParams.get("tracking") || searchParams.get("ref") || searchParams.get("id");
    
    if (!tracking) {
      return NextResponse.json(
        { error: "tracking param is required" },
        { status: 400 }
      );
    }

    // Find shipment
    let shipmentId = "";
    
    // Check if it's a UUID
    const isUuid = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(tracking);
    
    if (isUuid) {
      shipmentId = tracking;
    } else {
      // Lookup by ref
      const { data: shipment } = await supabaseAdmin
        .from("shipments")
        .select("id")
        .eq("shipment_ref", tracking)
        .maybeSingle();
        
      if (shipment) {
        shipmentId = shipment.id;
      } else {
        // Try invoice ref
        const { data: invoice } = await supabaseAdmin
            .from("invoices")
            .select("id")
            .eq("invoice_ref", tracking)
            .maybeSingle();

        if (invoice) {
             const { data: items } = await supabaseAdmin
                .from("invoice_items")
                .select("shipment_id")
                .eq("invoice_id", invoice.id)
                .maybeSingle();
             if (items) shipmentId = items.shipment_id;
        }
      }
    }

    if (!shipmentId) {
      return NextResponse.json({ error: "Shipment not found" }, { status: 404 });
    }

    // Update progress
    const { data: current } = await supabaseAdmin
      .from("shipments")
      .select("progress, status")
      .eq("id", shipmentId)
      .single();

    const newProgress = Math.min((current?.progress || 0) + 10, 100);
    const newStatus = newProgress === 100 ? "delivered" : (current?.status || "in-transit");

    const { data, error } = await supabaseAdmin
      .from("shipments")
      .update({
        progress: newProgress,
        status: newStatus,
        updated_at: new Date().toISOString(),
        last_eta_update: new Date().toISOString()
      })
      .eq("id", shipmentId)
      .select()
      .single();

    if (error) throw error;

    return NextResponse.json({ success: true, shipment: data });
  } catch (err: any) {
    return NextResponse.json(
      { error: err?.message || "Internal server error" },
      { status: 500 }
    );
  }
}
