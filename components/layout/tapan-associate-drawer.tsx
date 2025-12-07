"use client";

import { useEffect, useRef, useState } from "react";
import { usePathname, useRouter } from "next/navigation";
import Image from "next/image";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetDescription, SheetTrigger } from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { ChatInputBar } from "@/components/ui/chat-input-bar";
import { ChatBubble, ChatBubbleAvatar, ChatBubbleMessage, ChatBubbleAction, ChatBubbleActionWrapper } from "@/components/ui/chat-bubble";
import { useTapanAssociateContext } from "@/components/layout/tapan-associate-context";
import { useTapanAssociateChat } from "@/components/layout/use-tapan-associate-chat";
import MonkeyIcon from "@/components/icons/monkey";
import { Send, Copy, Maximize2 } from "lucide-react";
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

export function TapanAssociateDrawerLauncher() {
  const pathname = usePathname() || "/";
  const router = useRouter();
  const module = inferModuleFromPath(pathname);
  const { moduleContext } = useTapanAssociateContext();

  const [question, setQuestion] = useState("");
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

    await ask(trimmed);
  };

  const handleAttach = (files: FileList | null) => {
    if (!files || files.length === 0) return;
    console.log(
      "Tapan Associate drawer attachment selected:",
      Array.from(files).map((file) => file.name)
    );
  };

  return (
    <Sheet>
      <SheetTrigger asChild>
        <Button
          type="button"
          size="icon"
          className="fixed right-4 bottom-4 lg:right-6 lg:bottom-6 z-40 rounded-full shadow-lg bg-primary text-primary-foreground hover:bg-primary/90 lg:hidden"
        >
          <MonkeyIcon className="h-5 w-5" />
          <span className="sr-only">Open Tapan Associate</span>
        </Button>
      </SheetTrigger>
      <SheetContent
        side="right"
        className="w-full sm:w-[420px] p-0 flex h-full flex-col gap-0"
      >
        <SheetHeader className="px-4 pt-4 pb-2 border-b flex flex-row items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center">
              <MonkeyIcon className="h-4 w-4 text-primary" />
            </div>
            <div className="space-y-0.5 text-left">
              <SheetTitle className="text-sm font-semibold tracking-wide uppercase">
                Tapan Associate
              </SheetTitle>
              <SheetDescription className="text-[11px]">
                Quick AI help for what you are working on right now.
              </SheetDescription>
            </div>
          </div>
          <Button
            type="button"
            variant="ghost"
            size="sm"
            className="gap-1 text-[11px]"
            onClick={() => router.push("/tapan-associate")}
          >
            <Maximize2 className="h-3 w-3" />
            Maximize
          </Button>
        </SheetHeader>

        <div className="flex-1 flex flex-col gap-3 px-3 pb-3 pt-2 overflow-hidden">
          <div className="flex flex-wrap gap-1">
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

          {messages.length > 0 || isLoading ? (
            <div className="flex-1 min-h-[120px] rounded-md border bg-background/60 overflow-y-auto">
              <div className="p-2 text-xs">
                {messages.map((msg) => {
                  const isUser = msg.role === "user";
                  return (
                    <ChatBubble
                      key={msg.id}
                      variant={isUser ? "sent" : "received"}
                    >
                      <ChatBubbleAvatar
                        fallback={isUser ? "YOU" : "AI"}
                        className={isUser ? "bg-primary/20" : "bg-muted"}
                      />
                      <div className="flex-1 max-w-[90%]">
                        <ChatBubbleMessage variant={isUser ? "sent" : "received"}>
                          <div className="whitespace-pre-wrap">{msg.content}</div>
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
          ) : (
            <div className="flex-1 min-h-[80px] rounded-md border border-dashed border-border/60 text-[11px] text-muted-foreground/80 flex items-center justify-center px-3 text-center">
              Ask a question or pick a suggestion to get started.
            </div>
          )}

          <div className="mt-1 space-y-1">
            <ChatInputBar
              value={question}
              onChange={setQuestion}
              onSubmit={() => handleAsk()}
              placeholder="Ask Tapan Associate about what you are seeing on this page..."
              isLoading={isLoading}
              minHeight={44}
              maxHeight={96}
              onAttach={handleAttach}
            />
            {error && (
              <p className="text-[11px] text-destructive mt-0.5">{error}</p>
            )}
          </div>
        </div>
      </SheetContent>
    </Sheet>
  );
}
