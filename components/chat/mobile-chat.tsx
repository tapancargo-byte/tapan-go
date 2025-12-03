"use client";

import React from "react";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { MobileChatContent } from "./mobile-chat-content";
import { Button } from "../ui/button";
import { ChatStatusIndicator } from "./chat-status-indicator";
import { useChatState } from "./use-chat-state";
import { useIsMobile } from "@/hooks/use-mobile";

export function MobileChat() {
  const { totalUnreadCount, chatState, setChatState } = useChatState();
  const isMobile = useIsMobile();
  const hasNewMessages = totalUnreadCount > 0;

  // Sheet should be open for both "expanded" and "conversation" states
  const isOpen =
    chatState.state === "expanded" || chatState.state === "conversation";

  const handleOpenChange = (open: boolean) => {
    if (!open) {
      // Only close if not in a conversation, or if we want to force close
      setChatState({ state: "collapsed" });
    } else {
      setChatState({ state: "expanded" });
    }
  };

  // Don't render at all on desktop screens
  if (!isMobile) {
    return null;
  }

  return (
    <Sheet open={isOpen} onOpenChange={handleOpenChange} defaultOpen={false}>
      {/* Floating CTA Button - Styled like collapsed desktop chat */}
      <SheetTrigger asChild>
        <Button
          size="lg"
          className="pl-3 fixed gap-3 bottom-6 right-4 z-40 lg:hidden shadow-lg"
        >
          {/* Status Indicator */}
          <ChatStatusIndicator
            isExpanded={false}
            hasUnreadMessages={hasNewMessages}
            unreadCount={totalUnreadCount}
          />

          {/* Title */}
          <span>
            {hasNewMessages
              ? `New Message${totalUnreadCount > 1 ? "s" : ""}`
              : "Chat"}
          </span>
        </Button>
      </SheetTrigger>

      {/* Chat Drawer */}
      <SheetContent
        side="bottom"
        className="h-[85vh] p-0 lg:hidden"
        closeButton={false}
      >
        <SheetHeader className="sr-only">
          <SheetTitle>Chat</SheetTitle>
        </SheetHeader>

        <MobileChatContent />
      </SheetContent>
    </Sheet>
  );
}
