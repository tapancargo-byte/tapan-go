import twilio, { Twilio } from "twilio";

const accountSid = process.env.TWILIO_ACCOUNT_SID;
const authToken = process.env.TWILIO_AUTH_TOKEN;
const messagingServiceSid = process.env.TWILIO_MESSAGING_SERVICE_SID;
const fromNumber = process.env.TWILIO_FROM_NUMBER;
const whatsappFrom = process.env.TWILIO_WHATSAPP_FROM;

export function getTwilioClient(): Twilio | null {
  if (!accountSid || !authToken) {
    return null;
  }
  return twilio(accountSid, authToken);
}

export function normalizePhoneToE164(rawPhone: string): string | null {
  const trimmed = (rawPhone || "").trim();
  if (!trimmed) return null;

  if (trimmed.startsWith("+")) {
    const digits = trimmed.replace(/[^\d]/g, "");
    if (!digits) return null;
    if (digits.length < 8) return null;
    return `+${digits}`;
  }

  const digits = trimmed.replace(/\D/g, "");
  if (!digits) return null;

  if (digits.length === 10) {
    return `+91${digits}`;
  }

  if (digits.length === 12 && digits.startsWith("91")) {
    return `+${digits}`;
  }

  if (digits.length >= 8 && digits.length <= 15) {
    return `+${digits}`;
  }

  return null;
}

export async function sendInvoiceSms(params: {
  to: string;
  body: string;
}): Promise<{
  sid: string;
  status?: string | null;
  to: string;
}> {
  const client = getTwilioClient();
  if (!client) {
    throw new Error("Twilio is not configured on the server.");
  }

  if (!messagingServiceSid && !fromNumber) {
    throw new Error("TWILIO_MESSAGING_SERVICE_SID or TWILIO_FROM_NUMBER must be set.");
  }

  const payload: any = {
    to: params.to,
    body: params.body,
  };

  if (messagingServiceSid) {
    payload.messagingServiceSid = messagingServiceSid;
  } else if (fromNumber) {
    payload.from = fromNumber;
  }

  const message = await client.messages.create(payload);

  return {
    sid: message.sid,
    status: (message.status as string | undefined) ?? null,
    to: message.to,
  };
}

export async function sendWhatsAppInvoice(params: {
  to: string;
  body: string;
}): Promise<{
  sid: string;
  status?: string | null;
  to: string;
}> {
  const client = getTwilioClient();
  if (!client) {
    throw new Error("Twilio is not configured on the server.");
  }

  if (!whatsappFrom) {
    throw new Error(
      "TWILIO_WHATSAPP_FROM must be set for WhatsApp invoice sending."
    );
  }

  const from =
    whatsappFrom.startsWith("whatsapp:")
      ? whatsappFrom
      : `whatsapp:${whatsappFrom}`;
  const to =
    params.to.startsWith("whatsapp:") ? params.to : `whatsapp:${params.to}`;

  const message = await client.messages.create({
    from,
    to,
    body: params.body,
  });

  return {
    sid: message.sid,
    status: (message.status as string | undefined) ?? null,
    to: message.to,
  };
}
