import { NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabaseAdmin";

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
    let to = rawPhone.replace(/\s+/g, "");

    if (!to.startsWith("+")) {
      const digitsOnly = to.replace(/\D+/g, "");

      if (digitsOnly.length === 10) {
        // 10-digit Indian mobile number → prepend +91
        to = `+91${digitsOnly}`;
      } else if (digitsOnly.length === 12 && digitsOnly.startsWith("91")) {
        // 91xxxxxxxxxx → +91xxxxxxxxxx
        to = `+${digitsOnly}`;
      } else if (digitsOnly.startsWith("00") && digitsOnly.length > 2) {
        // 00-prefixed international format → replace 00 with +
        to = `+${digitsOnly.slice(2)}`;
      } else if (digitsOnly.length > 0) {
        // Fallback: best-effort international format
        to = `+${digitsOnly}`;
      }
    }

    const baseUrl = process.env.NEXT_PUBLIC_APP_URL || "https://tapan-go.vercel.app";
    const invoiceRef: string = invoice.invoice_ref || invoice.id;
    const amount = Number(invoice.amount ?? 0);

    const amountDisplay = amount
      ? new Intl.NumberFormat("en-IN", { style: "currency", currency: "INR" }).format(amount)
      : "your shipment";

    const link = `${baseUrl.replace(/\/$/, "")}/invoices?ref=${encodeURIComponent(
      invoiceRef,
    )}`;

    const customerName = customer?.name?.trim() || "Customer";

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
          language: { code: "en_US" },
        },
      };
    } else {
      // Custom invoice template with 2 parameters: {{1}} = name, {{2}} = invoice ref
      messageBody = {
        messaging_product: "whatsapp",
        to,
        type: "template",
        template: {
          name: templateName,
          language: { code: "en_US" },
          components: [
            {
              type: "body",
              parameters: [
                { type: "text", text: customerName },
                { type: "text", text: invoiceRef },
              ],
            },
          ],
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
      clearTimeout(timeoutId);

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
    const errorMessage: string | null = waRes.ok
      ? null
      : (waJson?.error?.message as string | undefined) ?? "Unknown WhatsApp error";

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
        { error: errorMessage || "Failed to send WhatsApp message" },
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
