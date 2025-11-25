import { NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabaseAdmin";
import { z } from "zod";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

const DEFAULT_BUCKET = process.env.SUPABASE_STORAGE_BUCKET || "invoices";

const downloadInvoiceSchema = z.object({
  invoiceId: z.string().min(1),
});

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const invoiceId = searchParams.get("invoiceId");

    const parsed = downloadInvoiceSchema.safeParse({ invoiceId });

    if (!parsed.success) {
      return NextResponse.json(
        { error: "Invalid query parameters", details: parsed.error.flatten() },
        { status: 400 }
      );
    }

    const { data: invoice, error } = await supabaseAdmin
      .from("invoices")
      .select("id, invoice_ref, pdf_path")
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

    const { data, error: downloadError } = await supabaseAdmin.storage
      .from(DEFAULT_BUCKET)
      .download(invoice.pdf_path as string);

    if (downloadError) {
      throw downloadError;
    }

    if (!data) {
      return NextResponse.json(
        { error: "No data returned from storage" },
        { status: 500 }
      );
    }

    // data is a Blob (per Supabase storage-js); convert to ArrayBuffer for the response body
    const blob = data as Blob;
    const fileData = await blob.arrayBuffer();

    const filename = `Invoice-${(invoice as any).invoice_ref ?? invoice.id}.pdf`;

    return new NextResponse(fileData, {
      status: 200,
      headers: {
        "Content-Type": "application/pdf",
        "Content-Disposition": `attachment; filename="${filename}"`,
      },
    });
  } catch (err: any) {
    console.error("/api/invoices/download error", err);
    return NextResponse.json(
      { error: err?.message ?? "Unknown error" },
      { status: 500 }
    );
  }
}
