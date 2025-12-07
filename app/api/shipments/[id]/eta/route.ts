import { NextRequest, NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabaseAdmin";

interface ETAUpdateBody {
  etd?: string | null;
  atd?: string | null;
  eta?: string | null;
  ata?: string | null;
  carrier_name?: string | null;
  awb_number?: string | null;
  transport_mode?: "air" | "road" | "rail" | "sea" | null;
  eta_notes?: string | null;
}

// PATCH /api/shipments/[id]/eta - Update ETA fields for a shipment
export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const shipmentId = params.id;
    if (!shipmentId) {
      return NextResponse.json(
        { error: "Shipment ID is required" },
        { status: 400 }
      );
    }

    const body: ETAUpdateBody = await request.json();

    // Validate transport_mode if provided
    if (
      body.transport_mode &&
      !["air", "road", "rail", "sea"].includes(body.transport_mode)
    ) {
      return NextResponse.json(
        { error: "Invalid transport_mode. Must be: air, road, rail, or sea" },
        { status: 400 }
      );
    }

    // Build update object with only provided fields
    const updateData: Record<string, any> = {
      last_eta_update: new Date().toISOString(),
    };

    if (body.etd !== undefined) updateData.etd = body.etd;
    if (body.atd !== undefined) updateData.atd = body.atd;
    if (body.eta !== undefined) updateData.eta = body.eta;
    if (body.ata !== undefined) updateData.ata = body.ata;
    if (body.carrier_name !== undefined) updateData.carrier_name = body.carrier_name;
    if (body.awb_number !== undefined) updateData.awb_number = body.awb_number;
    if (body.transport_mode !== undefined) updateData.transport_mode = body.transport_mode;
    if (body.eta_notes !== undefined) updateData.eta_notes = body.eta_notes;

    // Update shipment
    const { data: shipment, error } = await supabaseAdmin
      .from("shipments")
      .update(updateData)
      .eq("id", shipmentId)
      .select(
        `id, shipment_ref, origin, destination, status, 
         etd, atd, eta, ata, carrier_name, awb_number, transport_mode, eta_notes, last_eta_update`
      )
      .single();

    if (error) {
      console.error("Error updating shipment ETA:", error);
      return NextResponse.json(
        { error: "Failed to update shipment ETA" },
        { status: 500 }
      );
    }

    if (!shipment) {
      return NextResponse.json(
        { error: "Shipment not found" },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      shipment,
    });
  } catch (error) {
    console.error("ETA update error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

// GET /api/shipments/[id]/eta - Get ETA fields for a shipment
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const shipmentId = params.id;

    const { data: shipment, error } = await supabaseAdmin
      .from("shipments")
      .select(
        `id, shipment_ref, origin, destination, status,
         etd, atd, eta, ata, carrier_name, awb_number, transport_mode, eta_notes, last_eta_update`
      )
      .eq("id", shipmentId)
      .single();

    if (error || !shipment) {
      return NextResponse.json(
        { error: "Shipment not found" },
        { status: 404 }
      );
    }

    return NextResponse.json({ shipment });
  } catch (error) {
    console.error("ETA fetch error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
