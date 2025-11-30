import { NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabaseAdmin";

export async function POST(req: Request) {
  try {
    const bodyText = await req.text();
    const params = new URLSearchParams(bodyText);

    const messageSid =
      params.get("MessageSid") || params.get("SmsSid");

    if (!messageSid) {
      return NextResponse.json(
        { error: "Missing MessageSid" },
        { status: 400 }
      );
    }

    const messageStatus =
      params.get("MessageStatus") || params.get("SmsStatus");
    const errorCode = params.get("ErrorCode");
    const errorMessage = params.get("ErrorMessage");
    const to = params.get("To");

    const updates: any = {
      status: messageStatus || "unknown",
      updated_at: new Date().toISOString(),
      raw_response: Object.fromEntries(params.entries()),
    };

    if (errorCode || errorMessage) {
      const parts: string[] = [];
      if (errorCode) {
        parts.push(`Code ${errorCode}`);
      }
      if (errorMessage) {
        parts.push(errorMessage);
      }
      updates.error_message = parts.join(": ");
    }

    if (to) {
      updates.to_phone = to;
    }

    const { error: smsError } = await supabaseAdmin
      .from("twilio_sms_logs")
      .update(updates)
      .eq("provider_message_id", messageSid);

    if (smsError) {
      console.error("twilio_sms_logs update error", smsError.message);
    }

    const { error: waError } = await supabaseAdmin
      .from("whatsapp_logs")
      .update(updates)
      .eq("provider_message_id", messageSid);

    if (waError) {
      console.error("whatsapp_logs update error", waError.message);
    }

    return NextResponse.json({ ok: true });
  } catch (err: any) {
    console.error("/api/twilio/status-callback error", err);
    return NextResponse.json(
      { error: err?.message ?? "Unknown error" },
      { status: 500 }
    );
  }
}
