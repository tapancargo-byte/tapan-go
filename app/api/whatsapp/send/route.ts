import { NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabaseAdmin";
import { createSignedUrl } from "@/lib/storageHelpers";
import { generateInvoicePdf } from "@/lib/invoicePdf";
import { normalizePhoneToE164, sendWhatsAppInvoice } from "@/lib/twilioClient";

interface WhatsAppBody {
  invoiceId?: string;
  mode?: "mvp" | "prod";
  toPhone?: string;
}

type WhatsAppLogStatus = "mvp_redirect" | "success" | "error";

async function logWhatsAppEvent(params: {
  invoiceId: string;
  phone: string | null;
  mode: "mvp" | "prod";
  status: WhatsAppLogStatus;
  errorMessage?: string | null;
  providerMessageId?: string | null;
  rawResponse?: any;
}) {
  try {
    const { error } = await supabaseAdmin.from("whatsapp_logs").insert({
      invoice_id: params.invoiceId,
      phone: params.phone,
      mode: params.mode,
      status: params.status,
      error_message: params.errorMessage ?? null,
      provider_message_id: params.providerMessageId ?? null,
      raw_response: params.rawResponse ?? null,
    });
    if (error) {
      console.warn("Failed to log WhatsApp event", error.message);
    }
  } catch (err) {
    console.warn("Unexpected error while logging WhatsApp event", err);
  }
}

export async function POST(req: Request) {
  try {
    const { invoiceId, mode = "mvp", toPhone } = (await req.json()) as WhatsAppBody;

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
        console.error(
          "Failed to generate invoice PDF for WhatsApp send",
          genErr
        );
      }
    }

    // Use the same underlying phone value as on the invoice/customer.
    // For WhatsApp Web we keep only digits, for Twilio WhatsApp we
    // normalise to E.164 later.
    const rawPhone = (toPhone || customer?.phone || "").trim();
    const digits = rawPhone.replace(/\D/g, "");
    const phone = digits;

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

          if (!shipmentError2 && shipmentRow?.shipment_ref && trimmedSiteUrl) {
            trackUrl = `${trimmedSiteUrl}/track?ref=${encodeURIComponent(
              shipmentRow.shipment_ref as string
            )}`;
          }
        }
      }
    } catch (trackErr) {
      console.warn("Failed to compute tracking link for WhatsApp", trackErr);
    }

    const amountDisplay =
      typeof invoice.amount === "number"
        ? `₹${invoice.amount.toLocaleString("en-IN")}`
        : `${invoice.amount ?? ""}`;

    const lines: string[] = [
      `Hello ${customer?.name ?? ""}, here is your invoice ${
        invoice.invoice_ref ?? invoice.id
      }.
      `,
      `Amount: ${amountDisplay}`,
    ];

    if (trackUrl) {
      lines.push(`Track your shipment: ${trackUrl}`);
    }

    if (webInvoiceUrl) {
      lines.push(`View & pay: ${webInvoiceUrl}`);
    }
    if (pdfUrl) {
      lines.push(`PDF download: ${pdfUrl}`);
    }

    lines.push("", `- ${trimmedSiteUrl || "Tapan Go"}`);

    const message = encodeURIComponent(lines.join("\n"));

    // Compact caption for Cloud API document messages
    const captionLines: string[] = [
      `Invoice ${invoice.invoice_ref ?? invoice.id}`,
      `Amount: ${amountDisplay}`,
    ];
    if (trackUrl) {
      captionLines.push(`Track: ${trackUrl}`);
    }
    if (webInvoiceUrl) {
      captionLines.push(`View & pay: ${webInvoiceUrl}`);
    }
    const caption = captionLines.join("\n");

    // Simple MVP behaviour – use WhatsApp Web deep link when a phone is available.
    // If no phone is present, surface a clear error instead of opening a random chat.
    if (mode === "mvp") {
      if (!phone) {
        await logWhatsAppEvent({
          invoiceId: invoice.id,
          phone: null,
          mode,
          status: "error",
          errorMessage: "No customer phone available for WhatsApp send",
        });
        return NextResponse.json(
          {
            error: "No customer phone available for WhatsApp send",
            signedUrl: pdfUrl,
            note: "Add a phone number to the customer to send via WhatsApp Web.",
          },
          { status: 400 }
        );
      }

      const waUrl = `https://web.whatsapp.com/send?phone=${phone}&text=${message}`;
      await logWhatsAppEvent({
        invoiceId: invoice.id,
        phone,
        mode,
        status: "mvp_redirect",
      });
      return NextResponse.json({ waUrl, signedUrl: pdfUrl, phone });
    }

    const toE164 = normalizePhoneToE164(rawPhone);
    if (!toE164) {
      await logWhatsAppEvent({
        invoiceId: invoice.id,
        phone: null,
        mode,
        status: "error",
        errorMessage: "Customer phone number is not valid for WhatsApp send",
      });
      return NextResponse.json(
        {
          error: "Customer phone number is not valid for WhatsApp send",
          note: "Update the phone number to include a valid country code.",
        },
        { status: 400 }
      );
    }

    const body = lines.join("\n");

    try {
      const result = await sendWhatsAppInvoice({ to: toE164, body });

      await logWhatsAppEvent({
        invoiceId: invoice.id,
        phone: toE164,
        mode,
        status: "success",
        providerMessageId: result.sid,
        rawResponse: null,
      });

      return NextResponse.json({
        success: true,
        phone: toE164,
        sid: result.sid,
        status: result.status ?? undefined,
      });
    } catch (err: any) {
      console.error("Twilio WhatsApp send error", err);
      const messageText =
        (typeof err?.message === "string" && err.message) ||
        "Twilio WhatsApp send failed";

      await logWhatsAppEvent({
        invoiceId: invoice.id,
        phone: toE164,
        mode,
        status: "error",
        errorMessage: messageText,
        rawResponse: null,
      });

      return NextResponse.json(
        {
          error: messageText,
        },
        { status: 500 }
      );
    }
  } catch (err: any) {
    console.error("/api/whatsapp/send error", err);
    return NextResponse.json(
      { error: err?.message ?? "Unknown error" },
      { status: 500 }
    );
  }
}
