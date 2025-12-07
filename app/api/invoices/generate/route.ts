import { NextResponse } from "next/server";
import { generateInvoicePdf } from "@/lib/invoicePdf";
import { z } from "zod";

const generateInvoiceSchema = z.object({
  invoiceId: z.string().min(1),
});

export async function POST(req: Request) {
  try {
    const json = await req.json();
    const parsed = generateInvoiceSchema.safeParse(json);

    if (!parsed.success) {
      return NextResponse.json(
        { error: "Invalid request body", details: parsed.error.flatten() },
        { status: 400 }
      );
    }

    const { invoiceId } = parsed.data;

    const { pdfUrl, pdfPath } = await generateInvoicePdf(invoiceId);

    return NextResponse.json({ success: true, pdfUrl, pdfPath, invoiceId });
  } catch (err: any) {
    console.error("/api/invoices/generate error", err);
    return NextResponse.json(
      { error: err?.message ?? "Unknown error" },
      { status: 500 }
    );
  }
}
