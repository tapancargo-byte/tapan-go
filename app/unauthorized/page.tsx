"use client";

import { useRouter } from "next/navigation";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { GlassCard, GlassCardContent, GlassCardFooter, GlassCardHeader, GlassCardTitle, GlassCardDescription } from "@/components/ui/glass-card";
import { ShieldAlert, LogOut } from "lucide-react";
import { FadeIn } from "@/components/ui/animated-card";
import { supabase } from "@/lib/supabaseClient";
import { useState } from "react";

export default function UnauthorizedPage() {
  const router = useRouter();
  const [isSigningOut, setIsSigningOut] = useState(false);

  const handleSwitchAccount = async () => {
    setIsSigningOut(true);
    try {
      await supabase.auth.signOut();
      router.push("/login");
    } catch (error) {
      console.error("Sign out error:", error);
      // Force redirect even on error
      router.push("/login");
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-gradient-to-br from-background via-background to-muted/20">
      <FadeIn>
        <GlassCard variant="elevated" className="max-w-md w-full">
          <GlassCardHeader className="text-center space-y-4">
            <div className="mx-auto w-16 h-16 rounded-full bg-destructive/10 flex items-center justify-center">
              <ShieldAlert className="w-8 h-8 text-destructive" />
            </div>
            <GlassCardTitle className="text-3xl">Access Denied</GlassCardTitle>
            <GlassCardDescription>
              Your account is not registered in the system. Please contact your administrator to get access.
            </GlassCardDescription>
          </GlassCardHeader>
          
          <GlassCardContent className="space-y-4">
            <div className="p-4 rounded-lg bg-muted/50 border border-border/30 space-y-2">
              <p className="text-sm font-medium">What you can do:</p>
              <ul className="text-sm text-muted-foreground space-y-1 list-disc list-inside">
                <li>Contact your administrator to add your account</li>
                <li>Login with an authorized admin account</li>
                <li>Check if you're using the correct email</li>
              </ul>
            </div>
          </GlassCardContent>

          <GlassCardFooter className="flex flex-col sm:flex-row gap-3">
            <Button variant="outline" asChild className="flex-1">
              <Link href="/">Go to Dashboard</Link>
            </Button>
            <Button 
              className="flex-1 gap-2" 
              onClick={handleSwitchAccount}
              disabled={isSigningOut}
            >
              <LogOut className="h-4 w-4" />
              {isSigningOut ? "Signing out..." : "Switch Account"}
            </Button>
          </GlassCardFooter>
        </GlassCard>
      </FadeIn>
    </div>
  );
}
