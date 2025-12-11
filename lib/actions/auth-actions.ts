"use server";

import { createClient } from "@/lib/supabaseServer";
import { requireRateLimit } from "@/lib/rateLimit";
import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { z } from "zod";
import * as Sentry from "@sentry/nextjs";
import { createHash } from "crypto";
import { logAuthEvent } from "@/lib/audit-log";
import { isAccountLocked, registerFailedLogin, resetLockout } from "@/lib/account-lockout";

const signInSchema = z.object({
  email: z.string().email(),
  password: z.string().min(1, "Password is required"),
});

export async function signInAction(data: z.infer<typeof signInSchema>) {
  const { email, password } = data;
  const { logger } = Sentry;
  const emailDomain = email.split("@")[1] ?? "unknown";

  return Sentry.startSpan(
    {
      op: "auth.signIn",
      name: "auth:signInAction",
    },
    async (span) => {
      span.setAttribute("auth.login_attempt", true);

      // 1. Rate Limiting
      const headerStore = await headers();
      const ip = headerStore.get("x-forwarded-for") || "unknown";
      const userAgent = headerStore.get("user-agent") || "unknown";
      try {
        await requireRateLimit("auth", ip);
      } catch (error) {
        Sentry.captureMessage("Rate limit reached for auth (ip)", {
          level: "warning",
          extra: {
            ip,
            error: error instanceof Error ? error.message : String(error),
          },
        });

        logger.warn(
          logger.fmt`Rate limit reached for auth from IP: ${ip}`,
        );

        await logAuthEvent("login_failure", null, {
          ip,
          userAgent,
          reason: "rate_limit_ip",
        });

        return {
          success: false,
          error: "Too many login attempts. Please try again in a minute.",
        };
      }

      // Per-account rate limiting (email-based)
      const emailHash = createHash("sha256")
        .update(email.toLowerCase())
        .digest("hex")
        .slice(0, 16);

      try {
        await requireRateLimit("auth", `account:${emailHash}`);
      } catch (error) {
        Sentry.captureMessage("Rate limit reached for auth (account)", {
          level: "warning",
          extra: {
            emailHash,
            error: error instanceof Error ? error.message : String(error),
          },
        });

        logger.warn("Rate limit reached for auth account", {
          emailHash,
        });

        await logAuthEvent("login_failure", null, {
          ip,
          userAgent,
          reason: "rate_limit_account",
          emailHash,
        });

        return {
          success: false,
          error:
            "Too many login attempts for this account. Please try again in a minute.",
        };
      }

      const locked = await isAccountLocked(emailHash);
      if (locked) {
        await logAuthEvent("login_failure", null, {
          ip,
          userAgent,
          reason: "account_locked",
          emailHash,
        });

        return {
          success: false,
          error:
            "Too many failed login attempts. Please try again later.",
        };
      }

      // 2. Validation
      const validated = signInSchema.safeParse({ email, password });
      if (!validated.success) {
        logger.warn("Sign-in validation failed", {
          reason: "invalid_credentials",
        });

        await logAuthEvent("login_failure", null, {
          reason: "validation",
          emailDomain,
        });

        await registerFailedLogin(emailHash);

        return { success: false, error: "Invalid email or password." };
      }

      try {
        // 3. Supabase Auth
        const supabase = await createClient();
        const { data, error } = await supabase.auth.signInWithPassword({
          email,
          password,
        });

        if (error) {
          Sentry.captureException(error, {
            extra: { context: "auth.signInAction" },
          });

          logger.error(
            logger.fmt`Supabase sign-in failed for domain ${emailDomain}: ${error.message}`,
          );

          await logAuthEvent("login_failure", null, {
            reason: "supabase_error",
            emailDomain,
            message: error.message,
          });

          await registerFailedLogin(emailHash);

          return { success: false, error: error.message };
        }

        if (!data?.session) {
          logger.error(
            logger.fmt`Supabase sign-in returned no session for domain ${emailDomain}`,
          );

          await logAuthEvent("login_failure", null, {
            reason: "no_session",
            emailDomain,
          });

          await registerFailedLogin(emailHash);

          return {
            success: false,
            error: "Failed to create session. Please try again.",
          };
        }

        const user = data.user;

        if (!user?.email_confirmed_at) {
          logger.warn("Unverified email attempted login", { emailDomain });

          await logAuthEvent("login_failure", user?.id ?? null, {
            reason: "unverified_email",
            emailDomain,
          });

          return {
            success: false,
            error: "Please verify your email address before signing in.",
          };
        }

        logger.info("User signed in", { emailDomain, userId: user.id });

        await logAuthEvent("login_success", user.id, {
          ip,
          userAgent,
          emailDomain,
        });

        await resetLockout(emailHash);

        return { success: true };
      } catch (error) {
        Sentry.captureException(error);

        logger.error(
          logger.fmt`Unexpected sign-in error: ${
            error instanceof Error ? error.message : "unknown error"
          }`,
        );

        return {
          success: false,
          error: "An unexpected error occurred while signing in.",
        };
      }
    },
  );
}

export async function signOutAction() {
  const supabase = await createClient();
  const headerStore = await headers();
  const ip = headerStore.get("x-forwarded-for") || "unknown";
  const userAgent = headerStore.get("user-agent") || "unknown";
  const { data } = await supabase.auth.getUser();
  const userId = data?.user?.id ?? null;
  await supabase.auth.signOut();
  await logAuthEvent("logout", userId, {
    ip,
    userAgent,
  });
  redirect("/login");
}
