
import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";
import { NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabaseAdmin";

export const runtime = "nodejs";

export async function POST(req: Request) {
  try {
    const authHeader = req.headers.get("authorization");
    const bearer = authHeader?.toLowerCase().startsWith("bearer ")
      ? authHeader.slice(7).trim()
      : null;

    if (bearer) {
      const { data, error } = await supabaseAdmin.auth.getUser(bearer);
      if (error || !data?.user) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
      }
    } else {
      const cookieStore = await cookies();
      const supabase = createServerClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
        {
          cookies: {
            get(name: string) {
              return cookieStore.get(name)?.value;
            },
          },
        }
      );

      const {
        data: { user },
        error: userError,
      } = await supabase.auth.getUser();

      if (userError) {
        return NextResponse.json({ error: "Authentication failed" }, { status: 500 });
      }

      if (!user) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
      }
    }

    const body = await req.json();
    const {
      invoice_ref,
      customer_id,
      amount,
      status,
      due_date,
      consignor_id,
      consignee_id,
      origin,
      destination,
      pieces,
      charged_weight,
      declared_value,
      payment_mode,
      freight_amount,
      pickup_charge,
      packing_charge,
      delivery_charge,
      docket_charge,
      insurance_charge,
      gst_percent,
      gst_amount,
      other_charge,
      advance_paid,
      balance_due,
      notes,
    } = body;

    const amountNumber =
      typeof amount === "string" ? Number(amount) : (amount as number);

    if (amountNumber === null || amountNumber === undefined || Number.isNaN(amountNumber)) {
      return NextResponse.json(
        { error: "Missing or invalid amount" },
        { status: 400 }
      );
    }

    const trimmedRef = typeof invoice_ref === "string" ? invoice_ref.trim() : "";

    const insertPayload: Record<string, any> = {
      ...(trimmedRef ? { invoice_ref: trimmedRef } : {}),
      customer_id: customer_id || null,
      consignor_id: consignor_id || null,
      consignee_id: consignee_id || null,
      origin: origin || null,
      destination: destination || null,
      pieces: pieces ?? null,
      charged_weight: charged_weight ?? null,
      declared_value: declared_value ?? null,
      payment_mode: payment_mode || null,
      amount: amountNumber,
      status: status || "pending",
      due_date: due_date || null,
      invoice_date: new Date().toISOString().split("T")[0],
      freight_amount: freight_amount ?? null,
      pickup_charge: pickup_charge ?? null,
      packing_charge: packing_charge ?? null,
      delivery_charge: delivery_charge ?? null,
      docket_charge: docket_charge ?? null,
      insurance_charge: insurance_charge ?? null,
      gst_percent: gst_percent ?? null,
      gst_amount: gst_amount ?? null,
      other_charge: other_charge ?? null,
      advance_paid: advance_paid ?? null,
      balance_due: balance_due ?? null,
      notes: notes || null,
    };

    const runInsert = async (payload: Record<string, any>) =>
      supabaseAdmin.from("invoices").insert(payload).select().single();

    const requiredColumns = new Set(["customer_id", "amount", "invoice_date"]);

    const maybeDropUnknownColumn = (
      payload: Record<string, any>,
      err: any
    ): { payload: Record<string, any>; changed: boolean } => {
      const message = typeof err?.message === "string" ? err.message : "";
      const pgrstMatch = message.match(/Could not find the '([^']+)' column/i);
      const pgMatch = message.match(/column\s+["']?([^"'\s]+)["']?/i);

      const missing = (pgrstMatch?.[1] || pgMatch?.[1] || "").trim();
      if (!missing) return { payload, changed: false };
      if (!(missing in payload)) return { payload, changed: false };
      if (requiredColumns.has(missing)) return { payload, changed: false };

      const next = { ...payload };
      delete next[missing];
      return { payload: next, changed: true };
    };

    let currentPayload = insertPayload;
    let { data, error } = await runInsert(currentPayload);

    for (let attempt = 0; error && attempt < 8; attempt += 1) {
      const code = (error as any)?.code;
      if (code !== "PGRST204" && code !== "42703") break;

      const { payload: nextPayload, changed } = maybeDropUnknownColumn(
        currentPayload,
        error
      );

      if (changed) {
        currentPayload = nextPayload;
      } else {
        const {
          freight_amount: _freight,
          pickup_charge: _pickup,
          packing_charge: _packing,
          delivery_charge: _delivery,
          docket_charge: _docket,
          insurance_charge: _insurance,
          gst_percent: _gstPercent,
          gst_amount: _gstAmount,
          other_charge: _other,
          advance_paid: _advance,
          balance_due: _balance,
          ...legacy
        } = currentPayload;
        currentPayload = legacy;
      }

      ({ data, error } = await runInsert(currentPayload));
      if (!error) break;
    }

    if (error) throw error;

    return NextResponse.json({ success: true, invoice: data });
  } catch (err: any) {
    console.error("Create invoice error:", err);
    return NextResponse.json(
      { error: "Failed to create invoice" },
      { status: 500 }
    );
  }
}

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const ref = searchParams.get("ref");
  
  if (ref) {
      const { data, error } = await supabaseAdmin
        .from("invoices")
        .select("*, customers(*)")
        .eq("invoice_ref", ref)
        .maybeSingle();
      
      if (error) return NextResponse.json({ error: error.message }, { status: 500 });
      if (!data) return NextResponse.json({ error: "Not found" }, { status: 404 });
      
      return NextResponse.json(data);
  }

  // List all if no ref
  const { data, error } = await supabaseAdmin.from("invoices").select("*").limit(50);
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json(data);
}
