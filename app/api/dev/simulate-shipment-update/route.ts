import { NextRequest, NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabaseAdmin";

/**
 * GET /api/dev/simulate-shipment-update
 * Simulates a shipment status update for testing real-time features
 * 
 * Query params:
 * - shipmentId: The shipment reference to update
 * - status: The new status (e.g., "DELIVERED", "In Transit", "Pending")
 */
export async function GET(request: NextRequest) {
  // Only allow in development
  if (process.env.NODE_ENV === "production") {
    return NextResponse.json(
      { error: "Not available in production" },
      { status: 403 }
    );
  }

  const { searchParams } = new URL(request.url);
  const shipmentId = searchParams.get("shipmentId");
  const status = searchParams.get("status") || "DELIVERED";

  if (!shipmentId) {
    return NextResponse.json(
      { error: "shipmentId query parameter is required" },
      { status: 400 }
    );
  }

  try {
    // Map common status values
    const statusMap: Record<string, string> = {
      "DELIVERED": "Delivered",
      "IN_TRANSIT": "In Transit",
      "PENDING": "Pending",
      "AT_WAREHOUSE": "At Warehouse",
      "DISPATCHED": "Dispatched",
    };

    const normalizedStatus = statusMap[status.toUpperCase()] || status;
    const progress = normalizedStatus === "Delivered" ? 100 : 
                     normalizedStatus === "In Transit" ? 50 : 
                     normalizedStatus === "Pending" ? 10 : 75;

    // Update the shipment
    const { data, error } = await supabaseAdmin
      .from("shipments")
      .update({ 
        status: normalizedStatus,
        progress,
        updated_at: new Date().toISOString(),
      })
      .eq("shipment_ref", shipmentId)
      .select()
      .single();

    if (error) {
      // Try by ID if ref doesn't match
      const { data: dataById, error: errorById } = await supabaseAdmin
        .from("shipments")
        .update({ 
          status: normalizedStatus,
          progress,
          updated_at: new Date().toISOString(),
        })
        .eq("id", shipmentId)
        .select()
        .single();

      if (errorById) {
        return NextResponse.json(
          { 
            error: "Shipment not found",
            details: error.message,
          },
          { status: 404 }
        );
      }

      return NextResponse.json({
        ok: true,
        message: `Shipment ${shipmentId} updated to ${normalizedStatus}`,
        shipment: dataById,
      });
    }

    return NextResponse.json({
      ok: true,
      message: `Shipment ${shipmentId} updated to ${normalizedStatus}`,
      shipment: data,
    });
  } catch (err: any) {
    console.error("[simulate-shipment-update] Error:", err);
    return NextResponse.json(
      { error: err?.message || "Failed to update shipment" },
      { status: 500 }
    );
  }
}

/**
 * POST /api/dev/simulate-shipment-update
 * Same as GET but accepts JSON body
 */
export async function POST(request: NextRequest) {
  if (process.env.NODE_ENV === "production") {
    return NextResponse.json(
      { error: "Not available in production" },
      { status: 403 }
    );
  }

  try {
    const body = await request.json();
    const { shipmentId, status = "DELIVERED" } = body;

    if (!shipmentId) {
      return NextResponse.json(
        { error: "shipmentId is required in request body" },
        { status: 400 }
      );
    }

    // Reuse GET logic by creating a URL with query params
    const url = new URL(request.url);
    url.searchParams.set("shipmentId", shipmentId);
    url.searchParams.set("status", status);

    return GET(new NextRequest(url));
  } catch (err: any) {
    return NextResponse.json(
      { error: "Invalid JSON body" },
      { status: 400 }
    );
  }
}
