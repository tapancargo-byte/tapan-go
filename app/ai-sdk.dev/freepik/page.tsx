"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { KiboSectionHeader } from "@/components/ui/kibo-primitives";

export default function FreepikIconPlaygroundPage() {
  const [prompt, setPrompt] = useState("");
  const [mode, setMode] = useState<"preview" | "generate">("preview");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<string>("");

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setResult("");

    const trimmed = prompt.trim();
    if (!trimmed) {
      setError("Prompt is required");
      return;
    }

    setLoading(true);
    try {
      const res = await fetch("/api/public/freepik/icon", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ prompt: trimmed, mode }),
      });

      const json = await res.json().catch(() => null);

      if (!res.ok || !json?.ok) {
        setError(json?.error ?? `Request failed with status ${res.status}`);
        return;
      }

      setResult(JSON.stringify(json.result, null, 2));
    } catch (err: any) {
      setError(err?.message ?? "Unknown error");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen bg-background text-foreground">
      <main className="mx-auto max-w-4xl px-6 py-12 space-y-8">
        <KiboSectionHeader
          title="Freepik Icon Playground"
          description="Experiment with Freepik's text-to-icon endpoint via the app's public API wrapper."
          align="left"
          size="sm"
        />

        <form onSubmit={handleSubmit} className="space-y-4 border border-border bg-card p-6">
          <div className="space-y-2">
            <label className="text-sm font-medium">Prompt</label>
            <Textarea
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
              placeholder="e.g. minimal cargo tracking dashboard icon, dark background, line icon"
              className="min-h-[120px] bg-background"
            />
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium">Mode</label>
            <div className="flex gap-2 text-xs">
              <button
                type="button"
                onClick={() => setMode("preview")}
                className={`px-3 py-2 border text-left text-xs ${
                  mode === "preview"
                    ? "bg-primary/10 text-primary border-primary/40"
                    : "bg-transparent text-muted-foreground border-border/60 hover:text-foreground"
                }`}
              >
                Preview
              </button>
              <button
                type="button"
                onClick={() => setMode("generate")}
                className={`px-3 py-2 border text-left text-xs ${
                  mode === "generate"
                    ? "bg-primary/10 text-primary border-primary/40"
                    : "bg-transparent text-muted-foreground border-border/60 hover:text-foreground"
                }`}
              >
                Generate
              </button>
            </div>
          </div>

          <div className="flex items-center gap-3 pt-2">
            <Button type="submit" disabled={loading} className="h-10 px-6">
              {loading ? "Calling Freepik..." : "Send to Freepik"}
            </Button>
            {error && <p className="text-xs text-destructive">{error}</p>}
          </div>
        </form>

        <section className="space-y-2">
          <h2 className="text-sm font-semibold tracking-[0.18em] uppercase text-muted-foreground">Raw Result</h2>
          <div className="border border-border bg-card p-4 text-xs overflow-auto max-h-[420px]">
            {result ? (
              <pre className="whitespace-pre-wrap break-words text-[11px] leading-relaxed">{result}</pre>
            ) : (
              <p className="text-muted-foreground text-xs">
                Submit a prompt to see the JSON payload returned by Freepik.
              </p>
            )}
          </div>
        </section>
      </main>
    </div>
  );
}
