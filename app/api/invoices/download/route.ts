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
    const pathParam = searchParams.get("path");

    const parsed = downloadInvoiceSchema.safeParse({ invoiceId });

    if (!parsed.success) {
      return NextResponse.json(
        { error: "Invalid query parameters", details: parsed.error.flatten() },
        { status: 400 }
      );
    }

    const { data: invoice, error } = await supabaseAdmin
      .from("invoices")
      .select("id, invoice_ref")
      .eq("id", invoiceId)
      .maybeSingle();

    if (error) {
      throw error;
    }

    if (!invoice) {
      return NextResponse.json(
        { error: "Invoice not found" },
        { status: 404 }
      );
    }

    const folderPath = `invoices/${invoiceId}`;

    // If caller passed an explicit storage path, validate and prefer that
    let downloadPath: string | null = null;
    if (pathParam) {
      const normalizedPath = pathParam.startsWith("/")
        ? pathParam.slice(1)
        : pathParam;
      const expectedPrefix = `${folderPath}/`;

      if (!normalizedPath.startsWith(expectedPrefix)) {
        return NextResponse.json(
          { error: "Invalid path for this invoice" },
          { status: 400 }
        );
      }

      downloadPath = normalizedPath;
    } else {
      // Fallback: List files in the folder to find the latest one
      const { data: files, error: listError } = await supabaseAdmin.storage
        .from(DEFAULT_BUCKET)
        .list(folderPath, {
          // We'll sort in code to avoid relying on storage sort semantics
          limit: 50,
        });

      if (listError) {
        console.error("[DEBUG] List files error:", listError);
        // If list fails, we can't download
        return NextResponse.json(
          { error: "Failed to list invoice files" },
          { status: 500 }
        );
      }

      let targetFile: any = null;
      if (files && files.length > 0) {
        // Filter for PDFs only
        const pdfs = files.filter((f: any) =>
          typeof f?.name === "string" && f.name.toLowerCase().endsWith(".pdf")
        );

        if (pdfs.length > 0) {
          // Prefer new timestamped invoices (invoice-<timestamp>.pdf) if present
          const timestamped = pdfs.filter((f: any) =>
            /^invoice-\d+\.pdf$/i.test(f.name)
          );

          const candidates = timestamped.length > 0 ? timestamped : pdfs;

          // Sort by created_at descending so we always use the latest generated PDF
          candidates.sort((a: any, b: any) => {
            const da = a?.created_at ? new Date(a.created_at).getTime() : 0;
            const db = b?.created_at ? new Date(b.created_at).getTime() : 0;
            return db - da;
          });

          targetFile = candidates[0] ?? null;
        }
      }

      if (!targetFile) {
        return NextResponse.json(
          { error: "Invoice PDF file not found in storage" },
          { status: 404 }
        );
      }

      downloadPath = `${folderPath}/${targetFile.name}`;
    }

    const { data, error: downloadError } = await supabaseAdmin.storage
      .from(DEFAULT_BUCKET)
      .download(downloadPath);

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

    const ref = invoice.invoice_ref ?? invoice.id;
    const dateStr = new Date().toISOString().split("T")[0]; // YYYY-MM-DD
    const filename = `Invoice-${ref}-${dateStr}.pdf`;

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
