"use client";

import { useState, useEffect, useRef } from "react";
// import DashboardPageLayout from "@/components/dashboard/layout";
import MonkeyIcon from "@/components/icons/monkey";
import { Button } from "@/components/ui/button";
import { ChatInputBar } from "@/components/ui/chat-input-bar";
import { usePathname, useRouter } from "next/navigation";
import { useTapanAssociateContext } from "@/components/layout/tapan-associate-context";
import { useTapanAssociateChat, type ChatAttachment } from "@/components/layout/use-tapan-associate-chat";
import { useTapanConversationHistory } from "@/components/layout/use-tapan-conversation-history";
import { ChatBubble, ChatBubbleAvatar, ChatBubbleMessage, ChatBubbleAction, ChatBubbleActionWrapper } from "@/components/ui/chat-bubble";
import { Copy, ChevronLeft, MessageSquarePlus, History, Sparkles, PanelRightClose, PanelRightOpen, Zap, HelpCircle } from "lucide-react";
import { cn } from "@/lib/utils";
import { DotPattern } from "@/components/ui/dot-pattern";
import { ShineBorder } from "@/components/ui/shine-border";
import { BorderBeam } from "@/components/ui/border-beam";
import { AnimatedShinyText } from "@/components/ui/animated-shiny-text";
import { Separator } from "@/components/ui/separator";
import { ScrollArea } from "@/components/ui/scroll-area";

export default function TapanAssociateChatPage() {
  const pathname = usePathname() || "/tapan-associate";
  const { moduleContext } = useTapanAssociateContext();
  const router = useRouter();

  const module = "global";

  const [input, setInput] = useState("");
  const [pendingAttachments, setPendingAttachments] = useState<ChatAttachment[]>([]);
  const { messages, isLoading, error, ask, clear, loadMessages } = useTapanAssociateChat({
    module,
    pathname,
    moduleContext,
    mode: "chat",
  });

  const {
    conversations,
    activeConversation,
    activeId,
    setActiveId,
    upsertFromMessages,
    startNewConversation,
  } = useTapanConversationHistory();

  // Sidebar toggle state
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);

  // Load messages when switching conversations (only when activeId changes)
  const prevActiveIdRef = useRef<string | null>(null);
  useEffect(() => {
    if (activeId === prevActiveIdRef.current) return;
    prevActiveIdRef.current = activeId;

    if (activeConversation) {
      loadMessages(activeConversation.messages ?? []);
    } else {
      clear();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeId]);

  // Save messages to conversation history (debounced to avoid loops)
  const messagesLengthRef = useRef(0);
  useEffect(() => {
    if (!messages.length) return;
    if (messages.length === messagesLengthRef.current) return;
    messagesLengthRef.current = messages.length;
    upsertFromMessages(messages);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [messages.length]);

  // Auto-scroll to bottom
  const messagesEndRef = useRef<HTMLDivElement>(null);
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, isLoading]);

  const suggestions: string[] = [
    "Give me a quick health summary of shipments.",
    "What operational risks should I look at first?",
    "Summarize the most important issues for today.",
    "Help me plan my next 3 actions for this shift.",
  ];

  const handleStartNewConversation = () => {
    startNewConversation();
    clear();
  };

  const handleMinimize = () => {
    if (typeof window !== "undefined" && window.history.length > 1) {
      router.back();
    } else {
      router.push("/");
    }
  };

  const handleSend = async (initial?: string) => {
    const source = initial ?? input;
    const trimmed = source.trim();
    if (!trimmed || isLoading) return;

    if (initial && initial !== input) {
      setInput(initial);
    } else {
      setInput("");
    }

    await ask(trimmed, pendingAttachments.length ? pendingAttachments : undefined);
    setPendingAttachments([]);
  };

  const handleClear = () => {
    if (isLoading) return;
    clear();
  };

  const handleAttach = async (files: FileList | null) => {
    if (!files || files.length === 0) return;

    const fileArray = Array.from(files);

    const attachmentsWithData: ChatAttachment[] = await Promise.all(
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
                id: `file-${Date.now()}-${Math.random()
                  .toString(36)
                  .slice(2, 8)}`,
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
    );

    setPendingAttachments((prev) => [...prev, ...attachmentsWithData]);
  };

  return (
    <div className="h-[calc(100vh-4rem)] overflow-hidden p-0 flex flex-col relative w-full bg-background">
      <div className="flex h-full w-full bg-background overflow-hidden relative">
        {/* Main Chat Area */}
        <div className="flex-1 flex flex-col min-w-0 relative z-10">
          <DotPattern
            width={20}
            height={20}
            cx={1}
            cy={1}
            cr={1}
            className={cn(
              "[mask-image:linear-gradient(to_bottom_right,white,transparent,transparent)] ",
              "opacity-50"
            )}
          />
          
          {/* Chat Header */}
          <div className="flex items-center justify-between px-6 py-3 border-b bg-background/80 backdrop-blur-sm z-20">
            <div className="flex items-center gap-3">
              <Button 
                variant="ghost" 
                size="icon" 
                className="md:hidden" 
                onClick={handleMinimize}
              >
                <ChevronLeft className="h-5 w-5" />
              </Button>
              <div>
                <AnimatedShinyText className="text-lg font-semibold inline-flex items-center gap-2">
                   <span>Tapan Associate</span>
                   <span className="text-xs px-2 py-0.5 rounded-full bg-primary/10 text-primary font-medium">
                     AI Beta
                   </span>
                </AnimatedShinyText>
                <p className="text-xs text-muted-foreground hidden sm:block">
                  Powered by Perplexity & Context Awareness
                </p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Button
                variant="ghost"
                size="sm"
                onClick={handleClear}
                disabled={messages.length === 0 || isLoading}
                className="text-muted-foreground hover:text-destructive"
              >
                Clear Chat
              </Button>
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setIsSidebarOpen(!isSidebarOpen)}
                className="hidden lg:flex"
              >
                {isSidebarOpen ? <PanelRightClose className="h-5 w-5" /> : <PanelRightOpen className="h-5 w-5" />}
              </Button>
            </div>
          </div>

          {/* Chat Messages Area */}
          <div className="flex-1 overflow-y-auto p-4 sm:p-6 scroll-smooth">
            <div className="w-full max-w-5xl mx-auto space-y-6">
              {messages.length === 0 && !isLoading ? (
                <div className="flex flex-col items-center justify-center h-full text-center space-y-6 pb-20">
                  <div className="h-24 w-24 rounded-full bg-primary/5 flex items-center justify-center animate-in zoom-in-50 duration-500">
                    <MonkeyIcon className="h-12 w-12 text-primary/60" />
                  </div>
                  <div className="space-y-2 max-w-md">
                    <h3 className="text-xl font-semibold tracking-tight">
                      How can I help you today?
                    </h3>
                    <p className="text-sm text-muted-foreground">
                      I can analyze your shipments, help with invoices, or summarize operational risks based on your current dashboard context.
                    </p>
                  </div>
                  
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 w-full max-w-lg pt-4">
                    {suggestions.map((s) => (
                      <Button
                        key={s}
                        variant="outline"
                        className="h-auto py-3 px-4 text-xs text-left justify-start whitespace-normal hover:border-primary/50 hover:bg-primary/5 transition-colors"
                        onClick={() => handleSend(s)}
                      >
                        <Sparkles className="mr-2 h-3 w-3 shrink-0 text-primary" />
                        {s}
                      </Button>
                    ))}
                  </div>
                </div>
              ) : (
                <>
                  {messages.map((msg) => {
                    const isUser = msg.role === "user";
                    return (
                      <div 
                        key={msg.id} 
                        className={cn(
                          "flex w-full animate-in fade-in slide-in-from-bottom-2 duration-300",
                          isUser ? "justify-end" : "justify-start"
                        )}
                      >
                        <ChatBubble
                          variant={isUser ? "sent" : "received"}
                          className={cn(
                            "max-w-[85%] sm:max-w-[75%] shadow-sm",
                            !isUser && "bg-card border-border/50"
                          )}
                        >
                          <ChatBubbleAvatar
                            fallback={isUser ? "YOU" : "AI"}
                            className={isUser ? "bg-primary text-primary-foreground" : "bg-muted text-foreground"}
                          />
                          <div className="flex-1 min-w-0">
                            <ChatBubbleMessage variant={isUser ? "sent" : "received"} className="text-sm leading-relaxed">
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
                                        className="h-24 w-24 object-cover"
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
                                  onClick={() => navigator.clipboard.writeText(msg.content)}
                                />
                              </ChatBubbleActionWrapper>
                            )}
                          </div>
                        </ChatBubble>
                      </div>
                    );
                  })}
                  {isLoading && (
                    <div className="flex w-full justify-start animate-in fade-in slide-in-from-bottom-2">
                       <ChatBubble variant="received" className="bg-card border-border/50 shadow-sm">
                        <ChatBubbleAvatar fallback="AI" className="bg-muted" />
                        <ChatBubbleMessage isLoading />
                      </ChatBubble>
                    </div>
                  )}
                  <div ref={messagesEndRef} className="h-1" />
                </>
              )}
            </div>
          </div>

          {/* Input Area */}
          <div className="p-0 bg-background border-t z-20 w-full">
             <ShineBorder 
               className="p-0 min-h-0 w-full rounded-none bg-background border-0 overflow-hidden block !place-items-stretch" 
               duration={10}
               borderWidth={1}
               shineColor={["#A07CFE", "#FE8FB5", "#FFBE7B"]}
             >
              <div className="p-4 sm:p-6 w-full relative z-10">
                <ChatInputBar
                  value={input}
                  onChange={setInput}
                  onSubmit={() => handleSend()}
                  placeholder="Ask Tapan Associate..."
                  isLoading={isLoading}
                  minHeight={52}
                  maxHeight={160}
                  className="border rounded-xl shadow-sm px-3 py-2 bg-muted/30 focus-within:bg-background focus-within:ring-1 focus-within:ring-ring transition-colors w-full"
                  onAttach={handleAttach}
                />
                {pendingAttachments.length > 0 && (
                  <div className="mt-2 flex flex-wrap gap-2 text-[10px] text-muted-foreground">
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
                        <span className="max-w-[140px] truncate">{att.name}</span>
                      </div>
                    ))}
                  </div>
                )}
                <div className="flex justify-between items-center mt-2 text-[10px] text-muted-foreground px-1 w-full">
                   <span className="flex items-center gap-1">
                     <Zap className="h-3 w-3 text-amber-400" />
                     Model: {process.env.NEXT_PUBLIC_PERPLEXITY_MODEL || "sonar-pro"}
                   </span>
                   <span>Enter to send, Shift + Enter for new line</span>
                </div>
              </div>
             </ShineBorder>
          </div>
        </div>

        {/* Sidebar (History) */}
        <div 
          className={cn(
            "w-[500px] border-l bg-muted/10 flex-col transition-all duration-300 ease-in-out hidden lg:flex",
            !isSidebarOpen && "w-0 border-l-0 overflow-hidden opacity-0"
          )}
        >
          <div className="p-4 border-b flex items-center justify-between bg-muted/20">
             <h2 className="text-sm font-semibold uppercase tracking-wider flex items-center gap-2">
               <History className="h-4 w-4" /> History
             </h2>
             <Button 
               variant="default" 
               size="sm" 
               onClick={handleStartNewConversation}
               className="h-8 px-3 text-xs shadow-sm"
             >
               <MessageSquarePlus className="mr-2 h-3.5 w-3.5" />
               New Chat
             </Button>
          </div>

          <div className="flex-1 overflow-y-auto p-3 space-y-2">
            {/* Session Stats for Visual Appeal */}
            <div className="grid grid-cols-2 gap-2 mb-4">
              <div className="bg-card border rounded-lg p-2.5 flex flex-col items-center justify-center text-center">
                 <span className="text-[10px] text-muted-foreground uppercase tracking-wide">Conversations</span>
                 <span className="text-xl font-bold text-primary">{conversations.length}</span>
              </div>
              <div className="bg-card border rounded-lg p-2.5 flex flex-col items-center justify-center text-center">
                 <span className="text-[10px] text-muted-foreground uppercase tracking-wide">Messages</span>
                 <span className="text-xl font-bold text-primary">
                   {conversations.reduce((acc, curr) => acc + (curr.messages?.length || 0), 0)}
                 </span>
              </div>
            </div>
            {conversations.length === 0 ? (
              <div className="text-center py-10 px-4">
                <div className="inline-flex items-center justify-center w-10 h-10 rounded-full bg-muted mb-3">
                  <MessageSquarePlus className="h-5 w-5 text-muted-foreground" />
                </div>
                <p className="text-sm text-muted-foreground">
                  No conversations yet. Start a new chat to see history here.
                </p>
              </div>
            ) : (
              <div className="space-y-1">
                {conversations.map((conv) => (
                  <button
                    key={conv.id}
                    onClick={() => {
                      setActiveId(conv.id);
                      loadMessages(conv.messages ?? []);
                    }}
                    className={cn(
                      "w-full text-left p-3 rounded-lg border transition-all duration-200 group relative overflow-hidden",
                      activeId === conv.id
                        ? "bg-background border-primary/50 shadow-sm"
                        : "bg-transparent border-transparent hover:bg-muted/50 hover:border-border/50"
                    )}
                  >
                    {activeId === conv.id && (
                      <div className="absolute left-0 top-0 bottom-0 w-1 bg-primary rounded-l-lg" />
                    )}
                    <div className="flex flex-col gap-1 pl-2">
                      <span className={cn(
                        "font-medium text-sm truncate",
                         activeId === conv.id ? "text-foreground" : "text-muted-foreground group-hover:text-foreground"
                      )}>
                        {conv.title}
                      </span>
                      <span className="text-[10px] text-muted-foreground/70">
                        {new Date(conv.updatedAt).toLocaleDateString()} • {new Date(conv.updatedAt).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
                      </span>
                    </div>
                  </button>
                ))}
              </div>
            )}
          </div>

          <div className="p-4 border-t bg-muted/20">
            <div className="rounded-lg border bg-card p-3 shadow-sm">
              <div className="flex items-start gap-3">
                 <div className="p-2 bg-primary/10 rounded-md shrink-0">
                    <HelpCircle className="h-4 w-4 text-primary" />
                 </div>
                 <div className="space-y-1">
                    <h4 className="text-xs font-medium">Pro Tip</h4>
                    <p className="text-[10px] text-muted-foreground leading-relaxed">
                      Tapan Associate can read the context of the page you came from. Try navigating to a shipment page and asking "What's wrong with this?"
                    </p>
                 </div>
              </div>
            </div>
             <div className="mt-3 text-center">
               <Button variant="link" size="sm" className="h-auto p-0 text-[10px] text-muted-foreground" onClick={handleMinimize}>
                 <ChevronLeft className="mr-1 h-3 w-3" /> Back to Dashboard
               </Button>
             </div>
          </div>
        </div>
      </div>
    </div>
  );
}
