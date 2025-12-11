"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabaseClient";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

interface MFAGateProps {
  children: React.ReactNode;
}

export function MFAGate({ children }: MFAGateProps) {
  const [ready, setReady] = useState(false);
  const [requireMfa, setRequireMfa] = useState(false);

  useEffect(() => {
    let cancelled = false;

    async function checkMfa() {
      try {
        const { data: userData, error: userError } = await supabase.auth.getUser();
        if (cancelled) return;
        if (userError || !userData.user) {
          setReady(true);
          return;
        }

        const userId = userData.user.id;
        const { data: roleRow, error: roleError } = await supabase
          .from("users")
          .select("role")
          .eq("id", userId)
          .maybeSingle();

        if (cancelled) return;

        if (roleError || !roleRow) {
          setReady(true);
          return;
        }

        const role = (roleRow.role as string | null)?.toLowerCase();
        if (role !== "admin" && role !== "manager") {
          setReady(true);
          return;
        }

        const { data: aalData, error: aalError } =
          await supabase.auth.mfa.getAuthenticatorAssuranceLevel();

        if (cancelled) return;

        if (aalError || !aalData) {
          setReady(true);
          return;
        }

        if (aalData.nextLevel === "aal2" && aalData.currentLevel !== aalData.nextLevel) {
          setRequireMfa(true);
        }
      } finally {
        if (!cancelled) {
          setReady(true);
        }
      }
    }

    void checkMfa();

    return () => {
      cancelled = true;
    };
  }, []);

  if (!ready) {
    return null;
  }

  if (!requireMfa) {
    return <>{children}</>;
  }

  return <AuthMFA onSuccess={() => setRequireMfa(false)} />;
}

interface AuthMFAProps {
  onSuccess: () => void;
}

function AuthMFA({ onSuccess }: AuthMFAProps) {
  const [verifyCode, setVerifyCode] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async () => {
    if (!verifyCode.trim()) {
      setError("Enter the code from your authenticator app.");
      return;
    }

    setSubmitting(true);
    setError(null);

    try {
      const factors = await supabase.auth.mfa.listFactors();
      if (factors.error) {
        setError(factors.error.message ?? "Failed to load MFA factors.");
        return;
      }

      const totpFactor = factors.data.totp?.[0];
      if (!totpFactor) {
        setError("No authenticator app factor is configured for this account.");
        return;
      }

      const factorId = totpFactor.id;

      const challenge = await supabase.auth.mfa.challenge({ factorId });
      if (challenge.error) {
        setError(challenge.error.message ?? "Failed to start verification.");
        return;
      }

      const challengeId = challenge.data?.id;
      if (!challengeId) {
        setError("Invalid MFA challenge.");
        return;
      }

      const verify = await supabase.auth.mfa.verify({
        factorId,
        challengeId,
        code: verifyCode.trim(),
      });

      if (verify.error) {
        setError(verify.error.message ?? "Invalid verification code.");
        return;
      }

      onSuccess();
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Failed to verify two-factor code."
      );
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="flex flex-1 items-center justify-center">
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle>Two-factor authentication required</CardTitle>
          <CardDescription>
            Enter the 6-digit code from your authenticator app to continue.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {error && (
            <p className="text-sm text-destructive">
              {error}
            </p>
          )}
          <Input
            type="text"
            inputMode="numeric"
            autoComplete="one-time-code"
            placeholder="Enter code"
            value={verifyCode}
            onChange={(e) => setVerifyCode(e.target.value)}
            disabled={submitting}
          />
          <Button
            type="button"
            className="w-full bg-orange-600 hover:bg-orange-700"
            onClick={handleSubmit}
            disabled={submitting}
          >
            {submitting ? "Verifying..." : "Verify"}
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
