import { NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabaseAdmin";
import { createSignedUrl } from "@/lib/storageHelpers";
import { generateInvoicePdf } from "@/lib/invoicePdf";
import { normalizePhoneToE164, sendInvoiceSms } from "@/lib/twilioClient";

interface TwilioInvoiceBody {
  invoiceId?: string;
  toPhone?: string;
}

async function logTwilioSmsEvent(params: {
  invoiceId: string;
  to: string;
  status: string;
  errorMessage?: string | null;
  providerMessageId?: string | null;
  rawResponse?: any;
}) {
  try {
    const { error } = await supabaseAdmin.from("twilio_sms_logs").insert({
      invoice_id: params.invoiceId,
      to_phone: params.to,
      status: params.status,
      error_message: params.errorMessage ?? null,
      provider_message_id: params.providerMessageId ?? null,
      raw_response: params.rawResponse ?? null,
    });
    if (error) {
      console.warn("Failed to log Twilio SMS event", error.message);
    }
  } catch (err) {
    console.warn("Unexpected error while logging Twilio SMS event", err);
  }
}

export async function POST(req: Request) {
  try {
    const { invoiceId, toPhone } = (await req.json()) as TwilioInvoiceBody;

    if (!invoiceId) {
      return NextResponse.json(
        { error: "invoiceId is required" },
        { status: 400 }
      );
    }

    const { data: invoice, error: invoiceError } = await supabaseAdmin
      .from("invoices")
      .select("id, invoice_ref, pdf_path, customer_id, amount")
      .eq("id", invoiceId)
      .maybeSingle();

    if (invoiceError) {
      throw invoiceError;
    }

    if (!invoice) {
      return NextResponse.json(
        { error: "Invoice not found" },
        { status: 404 }
      );
    }

    const { data: customer } = await supabaseAdmin
      .from("customers")
      .select("id, name, phone")
      .eq("id", invoice.customer_id)
      .maybeSingle();

    let pdfUrl: string | null = null;
    if (invoice.pdf_path) {
      pdfUrl = await createSignedUrl(invoice.pdf_path, 60 * 60 * 24);
    } else {
      try {
        const generated = await generateInvoicePdf(invoice.id);
        pdfUrl = generated?.pdfUrl ?? null;
      } catch (genErr) {
        console.error("Failed to generate invoice PDF for Twilio SMS", genErr);
      }
    }

    const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? "";
    const trimmedSiteUrl = siteUrl.replace(/\/$/, "");
    const webInvoiceUrl = trimmedSiteUrl
      ? `${trimmedSiteUrl}/invoices/${invoice.id}`
      : "";

    let trackUrl: string | null = null;

    try {
      const { data: invoiceItems, error: invoiceItemsError } = await supabaseAdmin
        .from("invoice_items")
        .select("shipment_id")
        .eq("invoice_id", invoice.id);

      if (!invoiceItemsError && (invoiceItems as any[] | null)) {
        const firstShipmentId = (invoiceItems as any[])
          .map((row) => row.shipment_id as string | null)
          .find((id) => !!id);

        if (firstShipmentId) {
          const { data: shipmentRow, error: shipmentError2 } = await supabaseAdmin
            .from("shipments")
            .select("shipment_ref")
            .eq("id", firstShipmentId)
            .maybeSingle();

          if (
            !shipmentError2 &&
            shipmentRow?.shipment_ref &&
            trimmedSiteUrl
          ) {
            trackUrl = `${trimmedSiteUrl}/track?ref=${encodeURIComponent(
              shipmentRow.shipment_ref as string
            )}`;
          }
        }
      }
    } catch (trackErr) {
      console.warn("Failed to compute tracking link for Twilio SMS", trackErr);
    }

    const amountDisplay =
      typeof invoice.amount === "number"
        ? `₹${invoice.amount.toLocaleString("en-IN")}`
        : `${invoice.amount ?? ""}`;

    const lines: string[] = [
      `Hi ${customer?.name ?? ""}, your invoice ${
        invoice.invoice_ref ?? invoice.id
      } is ready.`,
      `Amount: ${amountDisplay}`,
    ];

    if (trackUrl) {
      lines.push(`Track shipment: ${trackUrl}`);
    }

    if (webInvoiceUrl) {
      lines.push(`View & pay: ${webInvoiceUrl}`);
    }

    lines.push(`- ${trimmedSiteUrl || "Tapan Go"}`);

    const body = lines.join("\n");

    const rawPhone = (toPhone || customer?.phone || "").trim();
    if (!rawPhone) {
      return NextResponse.json(
        {
          error: "No customer phone available for SMS send",
          note: "Add a phone number to the customer to send an SMS.",
        },
        { status: 400 }
      );
    }

    const to = normalizePhoneToE164(rawPhone);
    if (!to) {
      return NextResponse.json(
        {
          error: "Customer phone number is not valid for SMS",
          note: "Update the phone number to include a valid country code.",
        },
        { status: 400 }
      );
    }

    try {
      const result = await sendInvoiceSms({ to, body });

      await logTwilioSmsEvent({
        invoiceId: invoice.id,
        to,
        status: (result.status as string | undefined) ?? "queued",
        errorMessage: null,
        providerMessageId: result.sid,
        rawResponse: null,
      });

      return NextResponse.json({
        success: true,
        sid: result.sid,
        status: result.status ?? undefined,
        to: result.to,
      });
    } catch (err: any) {
      console.error("Twilio SMS send error", err);
      await logTwilioSmsEvent({
        invoiceId: invoice.id,
        to,
        status: "error",
        errorMessage:
          (typeof err?.message === "string" && err.message) ||
          "Twilio SMS send failed",
        providerMessageId: null,
        rawResponse: null,
      });
      return NextResponse.json(
        {
          error:
            typeof err?.message === "string"
              ? err.message
              : "Twilio SMS send failed",
        },
        { status: 500 }
      );
    }
  } catch (err: any) {
    console.error("/api/twilio/invoice/send error", err);
    return NextResponse.json(
      { error: err?.message ?? "Unknown error" },
      { status: 500 }
    );
  }
}
