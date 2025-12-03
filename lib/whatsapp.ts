import { supabaseAdmin } from "./supabaseAdmin";

interface WhatsAppMessage {
  phone: string;
  message: string;
  mediaUrl?: string;
}

/**
 * Send WhatsApp message using Twilio
 * Requires: TWILIO_ACCOUNT_SID, TWILIO_AUTH_TOKEN, TWILIO_WHATSAPP_NUMBER
 */
export async function sendWhatsAppMessage(
  phone: string,
  message: string,
  mediaUrl?: string
): Promise<{ success: boolean; sid?: string; error?: string }> {
  try {
    // Check if Twilio is configured
    if (
      !process.env.TWILIO_ACCOUNT_SID ||
      !process.env.TWILIO_AUTH_TOKEN ||
      !process.env.TWILIO_WHATSAPP_NUMBER
    ) {
      console.warn("Twilio WhatsApp not configured, logging message instead");
      
      // Log to database for manual follow-up
      await logWhatsAppMessage({
        phone,
        message,
        mediaUrl,
        status: "not_configured",
      });

      return {
        success: false,
        error: "WhatsApp not configured",
      };
    }

    // Format phone number (must include country code)
    const formattedPhone = phone.startsWith("+") ? phone : `+91${phone}`;
    const whatsappNumber = `whatsapp:${formattedPhone}`;
    const fromNumber = `whatsapp:${process.env.TWILIO_WHATSAPP_NUMBER}`;

    // Send via Twilio
    const twilio = require("twilio");
    const client = twilio(
      process.env.TWILIO_ACCOUNT_SID,
      process.env.TWILIO_AUTH_TOKEN
    );

    const messageData: any = {
      from: fromNumber,
      to: whatsappNumber,
      body: message,
    };

    if (mediaUrl) {
      messageData.mediaUrl = [mediaUrl];
    }

    const result = await client.messages.create(messageData);

    // Log successful send
    await logWhatsAppMessage({
      phone: formattedPhone,
      message,
      mediaUrl,
      status: "sent",
      twilioSid: result.sid,
    });

    return {
      success: true,
      sid: result.sid,
    };
  } catch (error: any) {
    console.error("WhatsApp send error:", error);

    // Log failed attempt
    await logWhatsAppMessage({
      phone,
      message,
      mediaUrl,
      status: "failed",
      error: error.message,
    });

    return {
      success: false,
      error: error.message,
    };
  }
}

/**
 * Send invoice to customer via WhatsApp
 */
export async function sendWhatsAppInvoice(
  invoiceId: string,
  pdfUrl: string
): Promise<{ success: boolean; error?: string }> {
  try {
    // Fetch invoice details
    const { data: invoice } = await supabaseAdmin
      .from("invoices")
      .select(`
        *,
        customers (
          name,
          phone
        )
      `)
      .eq("id", invoiceId)
      .single();

    if (!invoice || !invoice.customers?.phone) {
      return { success: false, error: "Invoice or customer phone not found" };
    }

    const message = `
Hello ${invoice.customers.name},

Your invoice ${invoice.invoice_ref} for ₹${invoice.amount} is ready.

View/Download: ${pdfUrl}

Thank you for choosing Tapan Go!
    `.trim();

    return await sendWhatsAppMessage(invoice.customers.phone, message, pdfUrl);
  } catch (error: any) {
    console.error("Error sending WhatsApp invoice:", error);
    return { success: false, error: error.message };
  }
}

/**
 * Send shipment status update via WhatsApp
 */
export async function sendShipmentStatusUpdate(
  shipmentId: string,
  newStatus: string
): Promise<{ success: boolean; error?: string }> {
  try {
    // Fetch shipment details
    const { data: shipment } = await supabaseAdmin
      .from("shipments")
      .select(`
        *,
        customers (
          name,
          phone
        )
      `)
      .eq("id", shipmentId)
      .single();

    if (!shipment || !shipment.customers?.phone) {
      return { success: false, error: "Shipment or customer phone not found" };
    }

    const statusMessages: Record<string, string> = {
      "in-transit": "Your shipment is now in transit",
      "out-for-delivery": "Your shipment is out for delivery and will arrive soon",
      delivered: "Your shipment has been delivered successfully",
      delayed: "Your shipment is delayed. We apologize for the inconvenience",
    };

    const statusMessage = statusMessages[newStatus] || `Status updated to: ${newStatus}`;
    const trackingUrl = `${process.env.NEXT_PUBLIC_APP_URL}/track/${shipment.shipment_ref}`;

    const message = `
Hello ${shipment.customers.name},

${statusMessage}

Shipment: ${shipment.shipment_ref}
Track: ${trackingUrl}

- Tapan Go
    `.trim();

    return await sendWhatsAppMessage(shipment.customers.phone, message);
  } catch (error: any) {
    console.error("Error sending shipment update:", error);
    return { success: false, error: error.message };
  }
}

/**
 * Log WhatsApp message to database for tracking
 */
async function logWhatsAppMessage(data: {
  phone: string;
  message: string;
  mediaUrl?: string;
  status: string;
  twilioSid?: string;
  error?: string;
}) {
  try {
    await supabaseAdmin.from("whatsapp_logs").insert([
      {
        phone: data.phone,
        message: data.message,
        media_url: data.mediaUrl,
        status: data.status,
        twilio_sid: data.twilioSid,
        error: data.error,
        sent_at: new Date().toISOString(),
      },
    ]);
  } catch (error) {
    console.error("Error logging WhatsApp message:", error);
  }
}
