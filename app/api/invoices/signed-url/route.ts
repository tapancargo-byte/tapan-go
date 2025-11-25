import { NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabaseAdmin";
import { createSignedUrl } from "@/lib/storageHelpers";
import { z } from "zod";

const signedUrlSchema = z.object({
  invoiceId: z.string().min(1),
});

export async function POST(req: Request) {
  try {
    const json = await req.json();
    const parsed = signedUrlSchema.safeParse(json);

    if (!parsed.success) {
      return NextResponse.json(
        { error: "Invalid request body", details: parsed.error.flatten() },
        { status: 400 }
      );
    }

    const { invoiceId } = parsed.data;

    const { data: invoice, error } = await supabaseAdmin
      .from("invoices")
      .select("pdf_path")
      .eq("id", invoiceId)
      .maybeSingle();

    if (error) {
      throw error;
    }

    if (!invoice || !invoice.pdf_path) {
      return NextResponse.json(
        { error: "Invoice PDF not found" },
        { status: 404 }
      );
    }

    const signedUrl = await createSignedUrl(invoice.pdf_path, 60 * 60 * 24);

    return NextResponse.json({ signedUrl });
  } catch (err: any) {
    console.error("/api/invoices/signed-url error", err);
    return NextResponse.json(
      { error: err?.message ?? "Unknown error" },
      { status: 500 }
    );
  }
}
