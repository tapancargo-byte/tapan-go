import { createBrowserClient } from "@supabase/ssr";

// Browser/client-side Supabase client configured for SSR-compatible cookie auth.
const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

if (!url || !anonKey) {
  // Fail fast in dev; in production, this should be properly configured.
  throw new Error("Missing NEXT_PUBLIC_SUPABASE_URL or NEXT_PUBLIC_SUPABASE_ANON_KEY env vars");
}

export const supabase = createBrowserClient(url, anonKey);
