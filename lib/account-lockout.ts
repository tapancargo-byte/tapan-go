import { supabaseAdmin } from "@/lib/supabaseAdmin";

const LOCKOUT_THRESHOLD = 5;
const LOCKOUT_DURATION_MINUTES = 30;

type LockoutRow = {
  email_hash: string;
  login_failed_count: number | null;
  locked_until: string | null;
};

async function getLockoutRow(emailHash: string): Promise<LockoutRow | null> {
  try {
    const { data, error } = await supabaseAdmin
      .from("auth_lockouts")
      .select("email_hash, login_failed_count, locked_until")
      .eq("email_hash", emailHash)
      .maybeSingle();

    if (error) {
      return null;
    }

    return (data as LockoutRow) ?? null;
  } catch {
    return null;
  }
}

export async function isAccountLocked(emailHash: string): Promise<boolean> {
  const row = await getLockoutRow(emailHash);
  if (!row || !row.locked_until) return false;
  const now = new Date();
  const lockedUntil = new Date(row.locked_until);
  return lockedUntil.getTime() > now.getTime();
}

export async function registerFailedLogin(emailHash: string): Promise<void> {
  try {
    const now = new Date();
    const row = await getLockoutRow(emailHash);
    const currentCount = row?.login_failed_count ?? 0;
    const nextCount = currentCount + 1;

    if (nextCount >= LOCKOUT_THRESHOLD) {
      const lockedUntil = new Date(
        now.getTime() + LOCKOUT_DURATION_MINUTES * 60 * 1000,
      ).toISOString();

      await supabaseAdmin.from("auth_lockouts").upsert({
        email_hash: emailHash,
        login_failed_count: 0,
        locked_until: lockedUntil,
        updated_at: now.toISOString(),
      });
    } else {
      await supabaseAdmin.from("auth_lockouts").upsert({
        email_hash: emailHash,
        login_failed_count: nextCount,
        locked_until: null,
        updated_at: now.toISOString(),
      });
    }
  } catch {
  }
}

export async function resetLockout(emailHash: string): Promise<void> {
  try {
    const now = new Date().toISOString();
    await supabaseAdmin.from("auth_lockouts").upsert({
      email_hash: emailHash,
      login_failed_count: 0,
      locked_until: null,
      updated_at: now,
    });
  } catch {
  }
}
