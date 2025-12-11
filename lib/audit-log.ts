import { supabaseAdmin } from "@/lib/supabaseAdmin";

type AuthEventType = "login_success" | "login_failure" | "logout" | "session_refresh";

type AuthEventMetadata = {
  ip?: string | null;
  userAgent?: string | null;
  reason?: string;
  emailDomain?: string;
  emailHash?: string;
  [key: string]: unknown;
};

export async function logAuthEvent(
  event: AuthEventType,
  userId: string | null,
  metadata: AuthEventMetadata
): Promise<void> {
  try {
    await supabaseAdmin.from("audit_logs").insert({
      event_type: event,
      user_id: userId,
      metadata,
    });
  } catch (error) {
    console.error("Failed to write auth audit log", {
      event,
      userId,
      error,
    });
  }
}
