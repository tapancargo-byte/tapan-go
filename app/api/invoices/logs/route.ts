import { NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabaseAdmin";

interface LogsRequestBody {
  invoiceId?: string;
  limit?: number;
  offset?: number;
}

export async function POST(req: Request) {
  try {
    const { invoiceId, limit = 20, offset = 0 } = (await req.json()) as LogsRequestBody;

    if (!invoiceId) {
      return NextResponse.json(
        { error: "invoiceId is required" },
        { status: 400 }
      );
    }

    const to = offset + limit - 1;

    const { data: logs, error } = await supabaseAdmin
      .from("invoice_generation_logs")
      .select("*")
      .eq("invoice_id", invoiceId)
      .order("started_at", { ascending: false })
      .range(offset, to);

    if (error) {
      throw error;
    }

    return NextResponse.json({ logs });
  } catch (err: any) {
    console.error("/api/invoices/logs error", err);
    return NextResponse.json(
      { error: err?.message ?? "Unknown error" },
      { status: 500 }
    );
  }
}
