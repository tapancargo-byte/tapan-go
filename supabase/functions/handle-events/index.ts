import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import { Resend } from "npm:resend";

import "../_shared/deno-env.ts";

const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
const resendApiKey = Deno.env.get("RESEND_API_KEY")!;

const supabase = createClient(supabaseUrl, supabaseServiceKey);
const resend = new Resend(resendApiKey);

interface WebhookPayload {
  type: "INSERT" | "UPDATE" | "DELETE";
  table: string;
  record: any;
  old_record: any;
  schema: string;
}

Deno.serve(async (req: Request) => {
  try {
    const payload: WebhookPayload = await req.json();

    console.log(`Received ${payload.type} event from ${payload.table}`);

    if (payload.table === "shipments") {
      await handleShipmentEvent(payload);
    } else if (payload.table === "tickets") {
      await handleTicketEvent(payload);
    }

    return new Response(JSON.stringify({ success: true }), {
      headers: { "Content-Type": "application/json" },
    });
  } catch (error: any) {
    console.error("Error processing webhook:", error);
    return new Response(JSON.stringify({ error: error.message || "Unknown error" }), {
      status: 500,
      headers: { "Content-Type": "application/json" },
    });
  }
});

async function handleShipmentEvent(payload: WebhookPayload) {
  const { record, old_record, type } = payload;

  // Scenario 1: Shipment Created
  if (type === "INSERT") {
    // Notify Admin/Ops
    await createAlert({
      type: "shipment",
      message: `New shipment created: ${record.shipment_ref} (${record.origin} -> ${record.destination})`,
      severity: "info",
    });

    // Notify Customer (if email exists)
    if (record.customer_id) {
       await notifyCustomer(record.customer_id, "Shipment Created", 
         `Your shipment ${record.shipment_ref} has been created and is ready for processing.`);
    }
  }

  // Scenario 2: Status Changed to 'delivered'
  if (type === "UPDATE" && record.status === "delivered" && old_record.status !== "delivered") {
    await createAlert({
      type: "shipment",
      message: `Shipment delivered: ${record.shipment_ref}`,
      severity: "success",
    });

    if (record.customer_id) {
        await notifyCustomer(record.customer_id, "Shipment Delivered", 
          `Good news! Your shipment ${record.shipment_ref} has been delivered successfully.`);
     }
  }
  
  // Scenario 3: Status Changed to 'cancelled'
  if (type === "UPDATE" && record.status === "cancelled" && old_record.status !== "cancelled") {
      await createAlert({
        type: "shipment",
        message: `Shipment cancelled: ${record.shipment_ref}`,
        severity: "warning",
      });
  }
}

async function handleTicketEvent(payload: WebhookPayload) {
    const { record, type } = payload;
    
    if (type === "INSERT") {
        await createAlert({
            type: "support",
            message: `New support ticket: ${record.subject} (${record.priority})`,
            severity: record.priority === 'high' ? 'warning' : 'info',
        });
    }
}

async function createAlert(alert: { type: string; message: string; severity: string }) {
  const { error } = await supabase.from("alerts").insert({
    type: alert.type,
    message: alert.message,
    severity: alert.severity,
    is_read: false,
  });

  if (error) {
    console.error("Failed to create alert:", error);
  }
}

async function notifyCustomer(customerId: string, subject: string, text: string) {
    // 1. Get customer email
    const { data: customer } = await supabase
        .from("customers")
        .select("email, name")
        .eq("id", customerId)
        .single();
    
    if (!customer?.email) return;

    // 2. Send Email via Resend
    try {
        await resend.emails.send({
            from: "Tapango Logistics <notifications@tapango.com>", // Valid sender required
            to: [customer.email],
            subject: `[Tapango] ${subject}`,
            html: `<p>Hi ${customer.name},</p><p>${text}</p><p>Track here: <a href="https://tapango.com/track">Track Shipment</a></p>`,
        });
        console.log(`Email sent to ${customer.email}`);
    } catch (err) {
        console.error("Failed to send email", err);
    }
}
