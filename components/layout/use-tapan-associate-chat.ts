"use client";

import { useCallback, useState } from "react";

export type ChatAttachment = {
  id: string;
  name: string;
  type: string;
  size: number;
  /** Optional preview URL (e.g. created via URL.createObjectURL on the client). */
  url?: string;
  /** Optional data URL (e.g. data:image/png;base64,...) used when sending to Perplexity. */
  dataUrl?: string;
};

export type AssistantMessage = {
  id: string;
  role: "user" | "assistant";
  content: string;
  attachments?: ChatAttachment[];
};

interface UseTapanAssociateChatOptions {
  module: string;
  pathname: string;
  moduleContext: unknown;
  mode?: "chat" | "qa";
}

export function useTapanAssociateChat({
  module,
  pathname,
  moduleContext,
  mode = "chat",
}: UseTapanAssociateChatOptions) {
  const [messages, setMessages] = useState<AssistantMessage[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const ask = useCallback(
    async (content: string, attachments?: ChatAttachment[]) => {
      const trimmed = content.trim();
      if (!trimmed || isLoading) return;

      const userMessage: AssistantMessage = {
        id: `user-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
        role: "user",
        content: trimmed,
        // Store attachments without dataUrl to avoid bloating localStorage
        attachments: attachments?.map(({ dataUrl, ...rest }) => rest),
      };

      const history = [...messages, userMessage];
      setMessages(history);
      setIsLoading(true);
      setError(null);

      try {
        const payloadMessages = [
          // Previous turns: send as plain text messages
          ...messages.map((m) => ({
            role: m.role,
            content: m.content,
          })),
          // Current user turn: include image attachments if present
          attachments && attachments.length > 0
            ? {
                role: "user" as const,
                content: [
                  { type: "text", text: trimmed },
                  ...attachments
                    .filter(
                      (att) =>
                        !!att.dataUrl &&
                        typeof att.dataUrl === "string" &&
                        att.type?.startsWith("image/")
                    )
                    .map((att) => ({
                      type: "image_url",
                      image_url: { url: att.dataUrl as string },
                    })),
                ],
              }
            : { role: "user" as const, content: trimmed },
        ];

        const res = await fetch("/api/tapan-associate", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            messages: payloadMessages,
            module,
            context: { pathname, moduleContext },
            mode,
          }),
        });

        if (!res.ok) {
          const data = await res.json().catch(() => ({}));
          const message =
            typeof (data as any)?.error === "string"
              ? (data as any).error
              : "Tapan Associate could not answer right now.";
          setError(message);
          return;
        }

        const data = (await res.json()) as { content?: string | null };
        const content = data.content ?? "No response.";

        const assistantMessage: AssistantMessage = {
          id: `assistant-${Date.now()}-${Math.random()
            .toString(36)
            .slice(2, 8)}`,
          role: "assistant",
          content,
        };

        setMessages((prev) => [...prev, assistantMessage]);
      } catch {
        setError("Network error contacting Tapan Associate.");
      } finally {
        setIsLoading(false);
      }
    },
    [messages, isLoading, module, pathname, moduleContext, mode]
  );

  const clear = useCallback(() => {
    if (isLoading) return;
    setMessages([]);
    setError(null);
  }, [isLoading]);

  const loadMessages = useCallback((nextMessages: AssistantMessage[]) => {
    setMessages(nextMessages);
    setError(null);
  }, []);

  return { messages, isLoading, error, ask, clear, loadMessages };
}
