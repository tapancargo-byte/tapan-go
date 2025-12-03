"use client";

import Link from "next/link";
import { Button } from "@/components/ui/button";
import { GlassCard, GlassCardContent, GlassCardFooter, GlassCardHeader, GlassCardTitle, GlassCardDescription } from "@/components/ui/glass-card";
import { ShieldAlert } from "lucide-react";
import { FadeIn } from "@/components/ui/animated-card";

export default function UnauthorizedPage() {
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
              You don't have permission to access this page. Please contact your administrator if you believe this is an error.
            </GlassCardDescription>
          </GlassCardHeader>
          
          <GlassCardContent className="space-y-4">
            <div className="p-4 rounded-lg bg-muted/50 border border-border/30 space-y-2">
              <p className="text-sm font-medium">Common Reasons:</p>
              <ul className="text-sm text-muted-foreground space-y-1 list-disc list-inside">
                <li>This page requires admin privileges</li>
                <li>Your account doesn't have the necessary role</li>
                <li>You may need to login with a different account</li>
              </ul>
            </div>
          </GlassCardContent>

          <GlassCardFooter className="flex flex-col sm:flex-row gap-3">
            <Button variant="outline" asChild className="flex-1">
              <Link href="/">Go to Dashboard</Link>
            </Button>
            <Button asChild className="flex-1">
              <Link href="/login">Switch Account</Link>
            </Button>
          </GlassCardFooter>
        </GlassCard>
      </FadeIn>
    </div>
  );
}
