import { NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabaseAdmin";
import { createSignedUrl } from "@/lib/storageHelpers";
import { generateInvoicePdf } from "@/lib/invoicePdf";

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
    // We only strip non-digits so that WhatsApp Web receives a clean
    // numeric string, but we do not auto-prepend any country code.
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

    const token = process.env.WHATSAPP_API_TOKEN;
    const phoneNumberId = process.env.WHATSAPP_PHONE_NUMBER_ID;

    // If Cloud API is not configured, do NOT open WhatsApp Web automatically.
    // Instead, return a clear error so the UI can show a toast and avoid
    // opening a random chat.
    if (!token || !phoneNumberId) {
      if (!phone) {
        await logWhatsAppEvent({
          invoiceId: invoice.id,
          phone: null,
          mode,
          status: "error",
          errorMessage: "Recipient phone missing",
        });
        return NextResponse.json(
          {
            error: "Recipient phone missing",
            signedUrl: pdfUrl,
            note: "Add a phone number to the customer before sending via WhatsApp.",
          },
          { status: 400 }
        );
      }

      await logWhatsAppEvent({
        invoiceId: invoice.id,
        phone,
        mode,
        status: "error",
        errorMessage: "WhatsApp Cloud API is not configured on the server.",
      });
      return NextResponse.json(
        {
          error: "WhatsApp Cloud API is not configured on the server.",
          signedUrl: pdfUrl,
          phone,
          note:
            "Ask an admin to set WHATSAPP_API_TOKEN and WHATSAPP_PHONE_NUMBER_ID to enable direct sending without opening WhatsApp Web.",
        },
        { status: 500 }
      );
    }

    if (!pdfUrl) {
      await logWhatsAppEvent({
        invoiceId: invoice.id,
        phone,
        mode,
        status: "error",
        errorMessage: "Invoice PDF not available for WhatsApp send",
      });
      return NextResponse.json(
        {
          error: "Invoice PDF not available for WhatsApp send",
          note: "Try regenerating the invoice PDF and retry the WhatsApp send.",
        },
        { status: 500 }
      );
    }

    const to = phone;
    if (!to) {
      return NextResponse.json(
        { error: "Recipient phone missing" },
        { status: 400 }
      );
    }

    const apiUrl = `https://graph.facebook.com/v17.0/${phoneNumberId}/messages`;
    const payload = {
      messaging_product: "whatsapp",
      to,
      type: "document",
      document: {
        link: pdfUrl,
        filename: `${invoice.invoice_ref ?? invoice.id}.pdf`,
      },
    };

    const resp = await fetch(apiUrl, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(payload),
    });

    const json = await resp.json();
    if (!resp.ok) {
      console.error("WhatsApp API error", json);
      await logWhatsAppEvent({
        invoiceId: invoice.id,
        phone: to,
        mode,
        status: "error",
        errorMessage: "WhatsApp API error",
        rawResponse: json,
      });
      return NextResponse.json(
        { error: "WhatsApp API error", detail: json },
        { status: 500 }
      );
    }

    await logWhatsAppEvent({
      invoiceId: invoice.id,
      phone: to,
      mode,
      status: "success",
      providerMessageId:
        ((json as any)?.messages?.[0]?.id as string | undefined) ??
        ((json as any)?.messages?.[0]?.message_id as string | undefined) ??
        null,
      rawResponse: json,
    });

    return NextResponse.json({ success: true, result: json, phone: to });
  } catch (err: any) {
    console.error("/api/whatsapp/send error", err);
    return NextResponse.json(
      { error: err?.message ?? "Unknown error" },
      { status: 500 }
    );
  }
}
