import { NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabaseAdmin";
import { z } from "zod";

const statusesRequestSchema = z.object({
  invoiceIds: z.array(z.string().min(1)).nonempty(),
});

export async function POST(req: Request) {
  try {
    const json = await req.json();
    const parsed = statusesRequestSchema.safeParse(json);

    if (!parsed.success) {
      return NextResponse.json(
        { error: "Invalid request body", details: parsed.error.flatten() },
        { status: 400 }
      );
    }

    const { invoiceIds } = parsed.data;

    const { data, error } = await supabaseAdmin
      .from("whatsapp_logs")
      .select("invoice_id, status, error_message, created_at")
      .in("invoice_id", invoiceIds)
      .order("created_at", { ascending: false });

    if (error && error.code !== "PGRST205") {
      throw error;
    }

    if (error && error.code === "PGRST205") {
      console.warn(
        "/api/whatsapp/statuses: whatsapp_logs table missing; returning empty statuses",
        error
      );
    }

    const latestByInvoice = new Map<
      string,
      { invoice_id: string; status: string; error_message: string | null; created_at: string }
    >();

    (data ?? []).forEach((row: any) => {
      const invoiceId = row.invoice_id as string | null;
      if (!invoiceId) return;
      if (latestByInvoice.has(invoiceId)) return;
      latestByInvoice.set(invoiceId, {
        invoice_id: invoiceId,
        status: (row.status as string | null) ?? "",
        error_message: (row.error_message as string | null) ?? null,
        created_at: (row.created_at as string | null) ?? "",
      });
    });

    return NextResponse.json({ statuses: Array.from(latestByInvoice.values()) });
  } catch (err: any) {
    console.error("/api/whatsapp/statuses error", err);
    return NextResponse.json(
      { error: err?.message ?? "Unknown error" },
      { status: 500 }
    );
  }
}
