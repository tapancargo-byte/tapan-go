import { NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabaseAdmin";

export async function POST(req: Request) {
    // Prevent execution in production
    if (process.env.NODE_ENV === "production") {
        return NextResponse.json(
            { error: "Not available in production" },
            { status: 403 }
        );
    }

    try {
        // 1. Create Dummy Customer if not exists
        const { data: customer } = await supabaseAdmin
            .from("customers")
            .select("id")
            .eq("email", "test@tapan.com")
            .maybeSingle();

        let customerId = customer?.id;

        if (!customerId) {
            const { data: newCust, error: custError } = await supabaseAdmin
                .from("customers")
                .insert({
                    name: "Test Customer",
                    email: "test@tapan.com",
                    phone: "9999999999"
                })
                .select("id")
                .single();
            if (custError) throw custError;
            customerId = newCust.id;
        }

        // 2. Create Test Shipment
        const shipmentRef = "TEST-SHIP-" + Math.floor(Math.random() * 10000);
        const { data: shipment, error: shipError } = await supabaseAdmin
            .from("shipments")
            .insert({
                customer_id: customerId,
                shipment_ref: shipmentRef,
                origin: "Imphal",
                destination: "New Delhi",
                weight: 15.5,
                status: "in-transit",
                etd: new Date().toISOString(),
                transport_mode: "air"
            })
            .select("id")
            .single();

        if (shipError) throw shipError;

        // 3. Create Barcodes
        const barcodesData = [
            { barcode: `TAC-${shipmentRef}-01`, shipment_id: shipment.id, status: "in-transit" },
            { barcode: `TAC-${shipmentRef}-02`, shipment_id: shipment.id, status: "in-transit" }
        ];

        const { data: barcodes, error: barError } = await supabaseAdmin
            .from("barcodes")
            .insert(barcodesData)
            .select("id, barcode");

        if (barError) throw barError;

        // 4. Create Scan History for each barcode
        // Sequence: CREATED -> PICKED_UP -> WAREHOUSE_IN -> MANIFESTED -> DEPARTED
        const events = [];
        const now = Date.now();
        const locations = ["Shipper Premise", "Pickup Van", "Imphal Warehouse", "Imphal Airport"];
        const statuses = ["created", "picked_up", "warehouse_in", "scanned_for_manifest", "in-transit"];

        for (const barcode of barcodes) {
            // 2 hours apart
            for (let i = 0; i < statuses.length; i++) {
                events.push({
                    barcode_id: barcode.id,
                    previous_status: i > 0 ? statuses[i - 1] : null,
                    new_status: statuses[i],
                    location: locations[Math.min(i, locations.length - 1)],
                    created_at: new Date(now - (statuses.length - i) * 7200000).toISOString(),
                    operator_id: null, // System
                    meta: { note: "Automated test seed" }
                });
            }
        }

        const { error: scanError } = await supabaseAdmin
            .from("scan_events")
            .insert(events);

        if (scanError) throw scanError;

        return NextResponse.json({
            success: true,
            message: "Seeded test data",
            shipment: shipmentRef,
            barcodes: barcodes.map(b => b.barcode)
        });

    } catch (err: any) {
        return NextResponse.json({ error: err.message }, { status: 500 });
    }
}
