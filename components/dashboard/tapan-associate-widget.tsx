"use client";

import { useEffect, useRef, useState } from "react";
import { usePathname, useRouter } from "next/navigation";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ChatInputBar } from "@/components/ui/chat-input-bar";
import {
  ChatBubble,
  ChatBubbleAvatar,
  ChatBubbleMessage,
  ChatBubbleAction,
  ChatBubbleActionWrapper,
} from "@/components/ui/chat-bubble";
import { useTapanAssociateContext } from "@/components/layout/tapan-associate-context";
import { useTapanAssociateChat, type ChatAttachment } from "@/components/layout/use-tapan-associate-chat";
import MonkeyIcon from "@/components/icons/monkey";
import { Copy, Maximize2 } from "lucide-react";
import { cn } from "@/lib/utils";

function inferModuleFromPath(pathname: string): string {
  if (pathname.startsWith("/aircargo")) return "aircargo";
  if (pathname.startsWith("/alerts")) return "alerts";
  if (pathname.startsWith("/analytics")) return "analytics";
  if (pathname.startsWith("/shipments")) return "shipments";
  if (pathname.startsWith("/warehouse")) return "warehouse";
  if (pathname.startsWith("/payments")) return "payments";
  if (pathname.startsWith("/invoices")) return "invoices";
  return "global";
}

export function TapanAssociateSidebarWidget() {
  const pathname = usePathname() || "/";
  const router = useRouter();
  const module = inferModuleFromPath(pathname);
  const { moduleContext } = useTapanAssociateContext();

  const [question, setQuestion] = useState("");
  const [pendingAttachments, setPendingAttachments] = useState<ChatAttachment[]>([]);
  const { messages, isLoading, error, ask } = useTapanAssociateChat({
    module,
    pathname,
    moduleContext,
    mode: "chat",
  });

  const messagesEndRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    if (!messagesEndRef.current) return;
    messagesEndRef.current.scrollIntoView({ behavior: "smooth", block: "end" });
  }, [messages.length, isLoading]);

  const suggestions: string[] = [
    "Give me a quick summary of this screen.",
    "What are the top 3 things I should review right now?",
  ];

  const handleAsk = async (initial?: string) => {
    const source = initial ?? question;
    const trimmed = source.trim();
    if (!trimmed || isLoading) return;

    setQuestion("");

    await ask(trimmed, pendingAttachments.length ? pendingAttachments : undefined);
    setPendingAttachments([]);
  };

  const handleAttach = (files: FileList | null) => {
    if (!files || files.length === 0) return;

    const fileArray = Array.from(files);

    Promise.all(
      fileArray.map(
        (file) =>
          new Promise<ChatAttachment>((resolve) => {
            const reader = new FileReader();
            reader.onloadend = () => {
              const result = reader.result;
              const dataUrl =
                typeof result === "string" && file.type.startsWith("image/")
                  ? result
                  : undefined;

              resolve({
                id: `file-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
                name: file.name,
                type: file.type,
                size: file.size,
                url: file.type.startsWith("image/")
                  ? URL.createObjectURL(file)
                  : undefined,
                dataUrl,
              });
            };
            reader.readAsDataURL(file);
          })
      )
    ).then((attachmentsWithData) => {
      setPendingAttachments((prev) => [...prev, ...attachmentsWithData]);
    });
  };

  return (
    <Card className="w-full flex flex-col flex-1 min-h-[280px]">
      <CardHeader className="pb-3 flex flex-row items-center justify-between gap-2">
        <div className="flex items-center gap-2">
          <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center">
            <MonkeyIcon className="h-4 w-4 text-primary" />
          </div>
          <div className="space-y-0.5 text-left">
            <CardTitle className="text-sm font-semibold tracking-wide uppercase">
              Tapan Associate
            </CardTitle>
            <CardDescription className="text-[11px]">
              Quick AI help for what you are working on right now.
            </CardDescription>
          </div>
        </div>
        <Button
          type="button"
          variant="ghost"
          size="icon"
          className="h-7 w-7 text-muted-foreground"
          onClick={() => router.push("/tapan-associate")}
        >
          <Maximize2 className="h-3.5 w-3.5" />
          <span className="sr-only">Open full Tapan Associate</span>
        </Button>
      </CardHeader>
      <CardContent className="pt-0 pb-3 flex flex-col gap-3 flex-1 min-h-0">
        <div className="flex flex-wrap gap-1 mb-1">
          {suggestions.map((s) => (
            <Button
              key={s}
              type="button"
              variant="outline"
              size="sm"
              disabled={isLoading}
              className="h-7 px-2 text-[11px]"
              onClick={() => handleAsk(s)}
            >
              {s}
            </Button>
          ))}
        </div>

        <div className="flex-1 min-h-0 rounded-md border bg-background/60 overflow-y-auto">
          <div className="p-2 text-xs">
            {messages.length === 0 && !isLoading && !error && (
              <p className="text-[11px] text-muted-foreground/80">
                Ask a question or pick a suggestion to get started.
              </p>
            )}

            {messages.map((msg) => {
              const isUser = msg.role === "user";
              return (
                <ChatBubble key={msg.id} variant={isUser ? "sent" : "received"}>
                  <ChatBubbleAvatar
                    fallback={isUser ? "YOU" : "AI"}
                    className={isUser ? "bg-primary/20" : "bg-muted"}
                  />
                  <div className="flex-1 max-w-[90%]">
                    <ChatBubbleMessage variant={isUser ? "sent" : "received"}>
                      <div className="whitespace-pre-wrap">{msg.content}</div>
                      {msg.attachments && msg.attachments.length > 0 && (
                        <div className="mt-2 flex flex-wrap gap-2">
                          {msg.attachments.map((att) => (
                            <div
                              key={att.id}
                              className="overflow-hidden rounded-md border bg-background/80"
                            >
                              {att.url && att.type.startsWith("image/") ? (
                                // eslint-disable-next-line @next/next/no-img-element
                                <img
                                  src={att.url}
                                  alt={att.name}
                                  className="h-16 w-16 object-cover"
                                />
                              ) : (
                                <div className="px-2 py-1 text-[10px] max-w-[120px] truncate">
                                  {att.name}
                                </div>
                              )}
                            </div>
                          ))}
                        </div>
                      )}
                    </ChatBubbleMessage>
                    {!isUser && (
                      <ChatBubbleActionWrapper>
                        <ChatBubbleAction
                          icon={<Copy className="h-3 w-3" />}
                          onClick={async () => {
                            try {
                              await navigator.clipboard.writeText(msg.content);
                            } catch {
                              // ignore
                            }
                          }}
                        />
                      </ChatBubbleActionWrapper>
                    )}
                  </div>
                </ChatBubble>
              );
            })}

            {isLoading && !error && (
              <ChatBubble variant="received">
                <ChatBubbleAvatar fallback="AI" className="bg-muted" />
                <ChatBubbleMessage isLoading />
              </ChatBubble>
            )}
            <div ref={messagesEndRef} />
          </div>
        </div>

        <div className="mt-2 space-y-1">
          <ChatInputBar
            value={question}
            onChange={setQuestion}
            onSubmit={() => handleAsk()}
            placeholder="Ask Tapan Associate about this dashboard..."
            isLoading={isLoading}
            minHeight={40}
            maxHeight={80}
            className="border border-input rounded-lg shadow-sm px-3 py-2 bg-background focus-within:ring-1 focus-within:ring-ring focus-within:border-ring transition-colors"
            onAttach={handleAttach}
          />
          {pendingAttachments.length > 0 && (
            <div className="mt-1 flex flex-wrap gap-2 text-[10px] text-muted-foreground">
              {pendingAttachments.map((att) => (
                <div
                  key={att.id}
                  className="flex items-center gap-2 rounded-md border bg-background/80 px-2 py-1"
                >
                  {att.url && att.type.startsWith("image/") ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                      src={att.url}
                      alt={att.name}
                      className="h-8 w-8 rounded object-cover"
                    />
                  ) : (
                    <div className="h-8 w-8 flex items-center justify-center rounded bg-muted text-[9px]">
                      {(att.name.split(".").pop() || "FILE").toUpperCase()}
                    </div>
                  )}
                  <span className="max-w-[120px] truncate">{att.name}</span>
                </div>
              ))}
            </div>
          )}
          {error && (
            <p className="text-[11px] text-destructive mt-0.5">{error}</p>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
