"use server";

import { createClient } from "@/lib/supabaseServer";
import { requireRateLimit } from "@/lib/rateLimit";
import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { z } from "zod";

const signInSchema = z.object({
  email: z.string().email(),
  password: z.string().min(1, "Password is required"),
});

export async function signInAction(data: z.infer<typeof signInSchema>) {
  const { email, password } = data;

  // 1. Rate Limiting
  const ip = (await headers()).get("x-forwarded-for") || "unknown";
  try {
    await requireRateLimit("auth", ip);
  } catch (error) {
    return {
      success: false,
      error: "Too many login attempts. Please try again in a minute.",
    };
  }

  // 2. Validation
  const validated = signInSchema.safeParse({ email, password });
  if (!validated.success) {
    return { success: false, error: "Invalid email or password." };
  }

  // 3. Supabase Auth
  const supabase = await createClient();
  const { error } = await supabase.auth.signInWithPassword({
    email,
    password,
  });

  if (error) {
    return { success: false, error: error.message };
  }

  return { success: true };
}

export async function signOutAction() {
  const supabase = await createClient();
  await supabase.auth.signOut();
  redirect("/login");
}
