"use client";

import { useState, type FormEvent } from "react";
import { useChat } from "@ai-sdk/react";

import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";

const UI_MODEL_BASE = process.env.NEXT_PUBLIC_PERPLEXITY_MODEL || "sonar-pro";
const UI_MODEL_ID = UI_MODEL_BASE;

export function AiSupportChat() {
  const [input, setInput] = useState("");
  const [webSearch, setWebSearch] = useState(false);

  const { messages, sendMessage, status } = useChat();

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    const trimmed = input.trim();
    if (!trimmed) return;

    try {
      await sendMessage(
        { text: trimmed },
        {
          body: {
            model: UI_MODEL_ID,
            webSearch,
          },
        },
      );
      setInput("");
    } catch (err) {
      // Swallow errors here; surface via status/messages for now.
      console.error("AI chat sendMessage error", err);
    }
  }

  return (
    <Card className="mb-4 bg-card/90 border-border/80 p-4 flex flex-col gap-3">
      <div className="space-y-1">
        <p className="text-xs font-semibold tracking-[0.18em] uppercase text-muted-foreground/90">
          AI assistant
        </p>
        <p className="text-xs text-muted-foreground">
          Ask quick questions about shipments, routes, or support. For account changes or escalations, use the ticket form below.
        </p>
      </div>

      <div className="flex-1 min-h-[160px] max-h-64 overflow-y-auto space-y-3 border border-border/60 bg-background/40 px-3 py-2 text-xs">
        {messages.length === 0 && (
          <p className="text-muted-foreground/80">
            Start a conversation and the AI will respond here.
          </p>
        )}
        {messages.map((message) => {
          const isUser = message.role === "user";
          const textParts = (message as any).parts?.filter((p: any) => p.type === "text") ?? [];
          const sources = (message as any).parts?.filter((p: any) => p.type === "source-url") ?? [];

          if (!textParts.length && !sources.length) return null;

          return (
            <div
              key={message.id}
              className={isUser ? "ml-auto max-w-[80%] text-right" : "mr-auto max-w-[80%] text-left"}
            >
              <div
                className={
                  "inline-block rounded-none border border-border/70 bg-card/90 px-3 py-2 text-[11px] leading-relaxed"
                }
              >
                {textParts.map((part: any, idx: number) => (
                  <p key={idx} className="whitespace-pre-wrap">
                    {part.text}
                  </p>
                ))}
                {sources.length > 0 && !isUser && (
                  <div className="mt-2 border-t border-border/40 pt-1.5 text-[10px] text-muted-foreground">
                    <p className="mb-1 font-medium">Sources</p>
                    <ul className="space-y-0.5 list-disc list-inside">
                      {sources.map((part: any, idx: number) => (
                        <li key={idx}>
                          <a
                            href={part.url}
                            target="_blank"
                            rel="noreferrer"
                            className="underline underline-offset-2 hover:text-foreground"
                          >
                            {part.url}
                          </a>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>

      <form onSubmit={handleSubmit} className="space-y-2">
        <Textarea
          rows={3}
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="Ask about a shipment, route, or support policy..."
          className="bg-background text-xs"
        />
        <div className="flex items-center justify-between gap-3">
          <button
            type="button"
            onClick={() => setWebSearch((prev) => !prev)}
            className={`text-[10px] px-2 py-1 border border-border/70 ${
              webSearch
                ? "bg-primary/10 text-primary"
                : "bg-transparent text-muted-foreground hover:text-foreground"
            }`}
          >
            Web search {webSearch ? "on" : "off"}
          </button>
          <Button
            type="submit"
            size="sm"
            disabled={!input.trim() || status === "streaming" || status === "submitted"}
            className="h-8 px-3 text-xs"
          >
            {status === "streaming" || status === "submitted" ? "Thinking..." : "Send"}
          </Button>
        </div>
      </form>
    </Card>
  );
}
