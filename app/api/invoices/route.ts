
import { NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabaseAdmin";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { invoice_ref, customer_id, amount, status, due_date } = body;

    if (!invoice_ref || !amount) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }

    const { data, error } = await supabaseAdmin
      .from("invoices")
      .insert({
        invoice_ref,
        customer_id: customer_id || null,
        amount,
        status: status || "pending",
        due_date: due_date || null,
        invoice_date: new Date().toISOString()
      })
      .select()
      .single();

    if (error) throw error;

    return NextResponse.json({ success: true, invoice: data });
  } catch (err: any) {
    console.error("Create invoice error:", err);
    return NextResponse.json({ error: err.message }, { status: 500 });
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
