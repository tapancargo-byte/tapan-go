import { GlassCard, GlassCardContent } from "@/components/ui/glass-card";

export default function TrackingLoadingSkeleton() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-muted/20">
      <div className="container mx-auto px-4 py-8 max-w-6xl space-y-6">
        <div className="h-8 w-40 rounded bg-muted/40 animate-pulse" />
        <GlassCard variant="elevated">
          <GlassCardContent className="p-6 space-y-4">
            <div className="h-6 w-48 rounded bg-muted/40 animate-pulse" />
            <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
              <div className="h-12 rounded bg-muted/30 animate-pulse" />
              <div className="h-12 rounded bg-muted/30 animate-pulse" />
              <div className="h-12 rounded bg-muted/30 animate-pulse" />
            </div>
          </GlassCardContent>
        </GlassCard>
        <div className="grid gap-6 lg:grid-cols-3">
          <GlassCard variant="elevated" className="lg:col-span-2">
            <GlassCardContent className="p-6 space-y-3">
              <div className="h-5 w-40 rounded bg-muted/40 animate-pulse" />
              <div className="space-y-2">
                {Array.from({ length: 4 }).map((_, i) => (
                  <div key={i} className="h-10 rounded bg-muted/30 animate-pulse" />
                ))}
              </div>
            </GlassCardContent>
          </GlassCard>
          <GlassCard variant="elevated">
            <GlassCardContent className="p-6 space-y-3">
              {Array.from({ length: 4 }).map((_, i) => (
                <div key={i} className="h-6 rounded bg-muted/30 animate-pulse" />
              ))}
            </GlassCardContent>
          </GlassCard>
        </div>
      </div>
    </div>
  );
}
