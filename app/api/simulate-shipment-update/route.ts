
import { NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabaseAdmin";

export async function POST(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const shipmentId = searchParams.get("shipmentId");
    const shipmentRef = searchParams.get("shipmentRef");
    
    // Allow finding by ID or Ref
    let id = shipmentId;
    
    if (!id && shipmentRef) {
      const { data: shipment } = await supabaseAdmin
        .from("shipments")
        .select("id")
        .eq("shipment_ref", shipmentRef)
        .single();
        
      if (shipment) {
        id = shipment.id;
      }
    }

    if (!id) {
      return NextResponse.json(
        { error: "shipmentId or shipmentRef is required" },
        { status: 400 }
      );
    }

    // Update the shipment to trigger realtime event
    // We'll increment progress by 5% and update last_eta_update
    const { data: current } = await supabaseAdmin
      .from("shipments")
      .select("progress, status")
      .eq("id", id)
      .single();

    if (!current) {
      return NextResponse.json({ error: "Shipment not found" }, { status: 404 });
    }

    const newProgress = Math.min((current.progress || 0) + 5, 100);
    const newStatus = newProgress === 100 ? "delivered" : current.status;

    const { data, error } = await supabaseAdmin
      .from("shipments")
      .update({
        progress: newProgress,
        status: newStatus,
        updated_at: new Date().toISOString(),
        last_eta_update: new Date().toISOString()
      })
      .eq("id", id)
      .select()
      .single();

    if (error) {
      throw error;
    }

    return NextResponse.json({ success: true, shipment: data });
  } catch (err: any) {
    console.error("Simulation error", err);
    return NextResponse.json(
      { error: err?.message || "Internal server error" },
      { status: 500 }
    );
  }
}

export async function GET(req: Request) {
    return POST(req);
}
