import { NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabaseAdmin";
import { generateInvoicePdf } from "@/lib/invoicePdf";

export const runtime = "nodejs";

interface SendWhatsAppBody {
  invoiceId: string;
}

// WhatsApp Business API requires template messages for business-initiated conversations.
// Free-form text messages only work within a 24-hour window after the customer messages first.
// See: https://developers.facebook.com/docs/whatsapp/conversation-types

export async function POST(req: Request) {
  try {
    const { invoiceId } = (await req.json()) as SendWhatsAppBody;

    if (!invoiceId) {
      return NextResponse.json(
        { error: "Missing invoiceId" },
        { status: 400 },
      );
    }

    const token = process.env.WHATSAPP_ACCESS_TOKEN;
    const phoneNumberId = process.env.WHATSAPP_PHONE_NUMBER_ID;
    const templateName = process.env.WHATSAPP_TEMPLATE_NAME || "invoice";
    const templateLanguage = process.env.WHATSAPP_TEMPLATE_LANGUAGE || "en_US";
    const templateIncludeDocument =
      process.env.WHATSAPP_TEMPLATE_INCLUDE_DOCUMENT === "true";

    if (!token || !phoneNumberId) {
      return NextResponse.json(
        { error: "WhatsApp configuration missing on server" },
        { status: 500 },
      );
    }

    // Load invoice + customer phone
    const { data, error } = await supabaseAdmin
      .from("invoices")
      .select("id, invoice_ref, amount, customer_id, customers:customer_id ( id, name, phone )")
      .eq("id", invoiceId)
      .maybeSingle();

    if (error) {
      return NextResponse.json(
        { error: error.message },
        { status: 500 },
      );
    }

    if (!data) {
      return NextResponse.json(
        { error: "Invoice not found" },
        { status: 404 },
      );
    }

    const invoice = data as any;
    const customer = invoice.customers as { id: string; name: string | null; phone: string | null } | null;

    const rawPhone = customer?.phone?.trim();
    if (!rawPhone) {
      return NextResponse.json(
        { error: "Customer does not have a phone number" },
        { status: 400 },
      );
    }

    // Basic normalization: strip spaces. Assume number stored in WhatsApp-ready E.164 format.
    // Country code is configurable via WHATSAPP_DEFAULT_COUNTRY_CODE env var
    const defaultCountryCode = process.env.WHATSAPP_DEFAULT_COUNTRY_CODE;
    let to = rawPhone.replace(/\s+/g, "");

    if (!to.startsWith("+")) {
      const digitsOnly = to.replace(/\D+/g, "");

      if (digitsOnly.length === 10) {
        if (defaultCountryCode) {
          // 10-digit number with configured country code → prepend it
          to = `+${defaultCountryCode}${digitsOnly}`;
        } else {
          // No country code configured - return error for 10-digit numbers
          console.warn("10-digit phone number requires WHATSAPP_DEFAULT_COUNTRY_CODE env var");
          return NextResponse.json(
            { error: "Phone number requires country code. Please update to include country code (e.g., +91XXXXXXXXXX)" },
            { status: 400 },
          );
        }
      } else if (digitsOnly.length >= 11 && digitsOnly.length <= 15) {
        // Assume full international number without + (11-15 digits per E.164)
        to = `+${digitsOnly}`;
      } else if (digitsOnly.startsWith("00") && digitsOnly.length > 2) {
        // 00-prefixed international format → replace 00 with +
        to = `+${digitsOnly.slice(2)}`;
      } else if (digitsOnly.length > 0) {
        // Fallback: best-effort international format
        to = `+${digitsOnly}`;
      }
    }

    const invoiceRef: string = invoice.invoice_ref || invoice.id;
    const customerName = customer?.name?.trim() || "Customer";

    const includeDocumentHeader = templateIncludeDocument;

    let pdfUrl: string | null = null;
    let pdfFilename: string | null = null;
    if (includeDocumentHeader) {
      try {
        const pdfResult = await generateInvoicePdf(invoiceId);
        pdfUrl = (pdfResult as any)?.pdfUrl ?? null;
        pdfFilename = `Invoice-${invoiceRef}.pdf`;
      } catch (error: any) {
        return NextResponse.json(
          {
            error:
              error?.message ||
              "Failed to generate invoice PDF for WhatsApp attachment",
          },
          { status: 500 },
        );
      }
    }

    const url = `https://graph.facebook.com/v19.0/${phoneNumberId}/messages`;

    const controller = new AbortController();
    const timeoutMs = 15000;
    const timeoutId = setTimeout(() => controller.abort(), timeoutMs);

    // Use template message for business-initiated conversations.
    // Template must be pre-approved in Meta Business Manager.
    // User's template: "Hello {{1}}, Your invoice for order {{2}} is attached..."
    // {{1}} = customer name, {{2}} = invoice ref
    
    // Build message body based on template type
    let messageBody: Record<string, unknown>;
    
    if (templateName === "hello_world") {
      // Meta's pre-approved test template (no parameters needed)
      messageBody = {
        messaging_product: "whatsapp",
        to,
        type: "template",
        template: {
          name: "hello_world",
          language: { code: templateLanguage },
        },
      };
    } else {
      const bodyParameters =
        templateName === "order_update"
          ? [{ type: "text", text: invoiceRef }]
          : templateName === "invoice_pdf"
          ? []
          : [
              { type: "text", text: customerName },
              { type: "text", text: invoiceRef },
            ];

      const components: any[] = [];
      if (includeDocumentHeader && pdfUrl) {
        components.push({
          type: "header",
          parameters: [
            {
              type: "document",
              document: {
                link: pdfUrl,
                filename: pdfFilename || `Invoice-${invoiceRef}.pdf`,
              },
            },
          ],
        });
      }

      if (Array.isArray(bodyParameters) && bodyParameters.length > 0) {
        components.push({
          type: "body",
          parameters: bodyParameters,
        });
      }

      messageBody = {
        messaging_product: "whatsapp",
        to,
        type: "template",
        template: {
          name: templateName,
          language: { code: templateLanguage },
          components,
        },
      };
    }

    let waRes: Response;
    try {
      waRes = await fetch(url, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(messageBody),
        signal: controller.signal,
      });
    } catch (error: any) {
      const timeoutMessage =
        error?.name === "AbortError"
          ? "WhatsApp request timed out"
          : error?.message || "WhatsApp request failed";
      const statusCode = error?.name === "AbortError" ? 504 : 502;

      try {
        await supabaseAdmin.from("whatsapp_logs").insert({
          invoice_id: invoiceId,
          phone: to,
          mode: "meta_send",
          status: "error",
          error_message: timeoutMessage,
          provider_message_id: null,
          raw_response: null,
        });
      } catch {
        // Ignore logging failures
      }

      return NextResponse.json(
        { error: timeoutMessage },
        { status: statusCode },
      );
    } finally {
      clearTimeout(timeoutId);
    }

    const waJson = await waRes.json().catch(() => null);

    const messageId: string | null =
      (waJson?.messages?.[0]?.id as string | undefined) ?? null;

    const status = waRes.ok ? "sent" : "error";
    const metaError = (waJson?.error as Record<string, unknown> | undefined) ?? undefined;
    const metaErrorCode = (metaError?.code as number | undefined) ?? undefined;
    const errorMessage: string | null = waRes.ok
      ? null
      : (metaError?.message as string | undefined) ?? "Unknown WhatsApp error";

    try {
      await supabaseAdmin.from("whatsapp_logs").insert({
        invoice_id: invoiceId,
        phone: to,
        mode: "meta_send",
        status,
        error_message: errorMessage,
        provider_message_id: messageId,
        raw_response: waJson,
      });
    } catch {
      // Logging failure should not break the main response
    }

    if (!waRes.ok) {
      return NextResponse.json(
        {
          error:
            metaErrorCode && errorMessage
              ? `WhatsApp error (${metaErrorCode}): ${errorMessage}`
              : errorMessage || "Failed to send WhatsApp message",
          meta: metaError,
        },
        { status: 502 },
      );
    }

    return NextResponse.json({
      success: true,
      message: "WhatsApp message sent",
      messageId,
      to,
    });
  } catch (err: any) {
    return NextResponse.json(
      { error: err?.message || "Failed to send" },
      { status: 500 },
    );
  }
}
