import { NextResponse } from "next/server";
import { createHmac, timingSafeEqual } from "crypto";

// Meta Data Deletion Request callback
// Configure this URL in the Meta App Dashboard as the Data Deletion Request URL.
// This endpoint does not delete any Facebook user data because the app
// does not store Facebook profile data. It simply acknowledges the
// request and points users to the privacy policy explaining data handling.

function base64UrlToBuffer(input: string): Buffer {
  const normalized = input.replace(/-/g, "+").replace(/_/g, "/");
  return Buffer.from(normalized, "base64");
}

function base64UrlDecode(input: string): string {
  const normalized = input.replace(/-/g, "+").replace(/_/g, "/");
  return Buffer.from(normalized, "base64").toString("utf8");
}

function parseSignedRequest(signedRequest: string | null): any | null {
  if (!signedRequest) return null;

  const appSecret = process.env.META_APP_SECRET;
  if (!appSecret) return null;

  const parts = signedRequest.split(".", 2);
  if (parts.length !== 2) return null;

  const [encodedSig, payload] = parts;

  try {
    const expectedSig = createHmac("sha256", appSecret)
      .update(payload)
      .digest();
    const providedSig = base64UrlToBuffer(encodedSig);

    if (
      expectedSig.length !== providedSig.length ||
      !timingSafeEqual(expectedSig, providedSig)
    ) {
      return null;
    }

    const json = base64UrlDecode(payload);
    const decoded = JSON.parse(json);

    if (typeof decoded?.algorithm === "string" && decoded.algorithm !== "HMAC-SHA256") {
      return null;
    }

    return decoded;
  } catch {
    return null;
  }
}

export async function POST(req: Request) {
  let signedRequest: string | null = null;

  try {
    const contentType = req.headers.get("content-type") || "";

    if (
      contentType.includes("application/x-www-form-urlencoded") ||
      contentType.includes("multipart/form-data")
    ) {
      const form = await req.formData();
      const value = form.get("signed_request");
      signedRequest = typeof value === "string" ? value : null;
    } else {
      const body = await req.json().catch(() => null);
      if (body && typeof body.signed_request === "string") {
        signedRequest = body.signed_request;
      }
    }
  } catch {
    // If parsing fails, we still return a valid response below.
  }

  // Best-effort decode of the signed request to access user_id if ever needed.
  // The app currently does not store Facebook user data, so we do not
  // perform any record-level deletion here.
  const decoded = parseSignedRequest(signedRequest);
  const _userId: string | undefined = decoded?.user_id;

  const confirmationCode = `del_${Date.now().toString(36)}_${Math.random()
    .toString(36)
    .slice(2, 8)}`;

  const baseUrl = process.env.NEXT_PUBLIC_APP_URL || "https://tapan-go.vercel.app";
  const statusUrl = `${baseUrl.replace(/\/$/, "")}/privacy-policy#data-deletion`;

  return NextResponse.json({
    url: statusUrl,
    confirmation_code: confirmationCode,
  });
}
