"use server";

import { createClient } from "@/lib/supabaseServer";
import { requireRateLimit } from "@/lib/rateLimit";
import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { z } from "zod";
import * as Sentry from "@sentry/nextjs";

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
      span.setAttribute("auth.email_domain", emailDomain);

      // 1. Rate Limiting
      const ip = (await headers()).get("x-forwarded-for") || "unknown";
      try {
        await requireRateLimit("auth", ip);
      } catch (error) {
        logger.warn(
          logger.fmt`Rate limit reached for auth from IP: ${ip}`,
        );

        return {
          success: false,
          error: "Too many login attempts. Please try again in a minute.",
        };
      }

      // 2. Validation
      const validated = signInSchema.safeParse({ email, password });
      if (!validated.success) {
        logger.warn("Sign-in validation failed", {
          reason: "invalid_credentials",
        });

        return { success: false, error: "Invalid email or password." };
      }

      try {
        // 3. Supabase Auth
        const supabase = await createClient();
        const { error } = await supabase.auth.signInWithPassword({
          email,
          password,
        });

        if (error) {
          Sentry.captureException(error, {
            extra: { emailDomain },
          });

          logger.error(
            logger.fmt`Supabase sign-in failed for domain ${emailDomain}: ${error.message}`,
          );

          return { success: false, error: error.message };
        }

        logger.info("User signed in", { emailDomain });

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
  await supabase.auth.signOut();
  redirect("/login");
}
