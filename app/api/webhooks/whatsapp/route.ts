import { NextResponse } from "next/server";
import { createHmac, timingSafeEqual } from "crypto";
import { supabaseAdmin } from "@/lib/supabaseAdmin";

// WhatsApp Cloud API webhook handler
// Used as Callback URL in Meta WhatsApp Business configuration.
// Supports both GET (verification) and POST (event notifications).

function safeCompare(a: string, b: string): boolean {
  const aBuf = Buffer.from(a);
  const bBuf = Buffer.from(b);
  if (aBuf.length !== bBuf.length) {
    return false;
  }
  return timingSafeEqual(aBuf, bBuf);
}

function verifyMetaSignature(rawBody: string, signatureHeader: string | null): boolean {
  const appSecret = process.env.META_APP_SECRET;
  if (!appSecret) {
    console.error("META_APP_SECRET is not configured; rejecting Meta webhook request.");
    return false;
  }

  if (!signatureHeader) {
    console.error("Missing x-hub-signature-256 header on Meta webhook request.");
    return false;
  }

  const [scheme, signature] = signatureHeader.split("=", 2);
  if (scheme !== "sha256" || !signature) {
    console.error("Malformed x-hub-signature-256 header on Meta webhook request.");
    return false;
  }

  const expected = createHmac("sha256", appSecret)
    .update(rawBody, "utf8")
    .digest("hex");

  return safeCompare(signature, expected);
}

export async function GET(req: Request) {
  const url = new URL(req.url);
  const mode = url.searchParams.get("hub.mode");
  const token = url.searchParams.get("hub.verify_token");
  const challenge = url.searchParams.get("hub.challenge");

  const verifyToken = process.env.WHATSAPP_VERIFY_TOKEN;

  if (mode === "subscribe" && token && challenge && verifyToken && safeCompare(token, verifyToken)) {
    // Meta expects the raw challenge string in the body on success
    return new Response(challenge, {
      status: 200,
      headers: { "Content-Type": "text/plain" },
    });
  }

  return NextResponse.json({ error: "Forbidden" }, { status: 403 });
}

export async function POST(req: Request) {
  try {
    const rawBody = await req.text();

    const signatureHeader = req.headers.get("x-hub-signature-256");
    const validSignature = verifyMetaSignature(rawBody, signatureHeader);
    if (!validSignature) {
      return NextResponse.json({ error: "Invalid signature" }, { status: 401 });
    }

    let body: any = {};
    if (rawBody) {
      try {
        body = JSON.parse(rawBody);
      } catch {
        body = {};
      }
    }

    // Best-effort logging of webhook payload to whatsapp_logs for observability.
    // We may not always be able to associate to a specific invoice, so invoice_id is nullable.
    const entries = Array.isArray((body as any)?.entry) ? (body as any).entry : [];

    for (const entry of entries) {
      const changes = Array.isArray(entry?.changes) ? entry.changes : [];
      for (const change of changes) {
        const value = change?.value ?? {};

        const contactWaId: string | null =
          (value.contacts?.[0]?.wa_id as string | undefined) ?? null;

        // Status updates
        const statusItem = Array.isArray(value.statuses)
          ? (value.statuses[0] as any | undefined)
          : undefined;

        const messageItem = Array.isArray(value.messages)
          ? (value.messages[0] as any | undefined)
          : undefined;

        const providerMessageId: string | null =
          (statusItem?.id as string | undefined) ??
          (messageItem?.id as string | undefined) ??
          null;

        const status: string =
          (statusItem?.status as string | undefined) ??
          (messageItem ? "received" : "unknown");

        const errorMessage: string | null =
          Array.isArray(statusItem?.errors) && statusItem.errors[0]
            ? (statusItem.errors[0].title as string | undefined) ?? null
            : null;

        try {
          await supabaseAdmin.from("whatsapp_logs").insert({
            invoice_id: null,
            phone: contactWaId,
            mode: "meta_webhook",
            status,
            error_message: errorMessage,
            provider_message_id: providerMessageId,
            raw_response: body,
          });
        } catch {
          // Do not fail the webhook on logging errors
        }
      }
    }

    // Meta requires a 200 OK quickly; the body can be empty.
    return NextResponse.json({ success: true });
  } catch {
    // On parse error, still return 200 to avoid repeated retries, but note failure.
    return NextResponse.json({ success: true }, { status: 200 });
  }
}
