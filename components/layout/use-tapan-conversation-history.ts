"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import type { AssistantMessage } from "@/components/layout/use-tapan-associate-chat";

export interface TapanConversation {
  id: string;
  title: string;
  createdAt: string;
  updatedAt: string;
  messages: AssistantMessage[];
}

const STORAGE_KEY = "tapan-associate-conversations-v1";

function loadFromStorage(): TapanConversation[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw) as unknown;
    if (!Array.isArray(parsed)) return [];
    return parsed as TapanConversation[];
  } catch {
    return [];
  }
}

function saveToStorage(conversations: TapanConversation[]) {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(conversations));
  } catch {
    // ignore storage errors
  }
}

function makeConversationId() {
  return `conv-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
}

function inferTitleFromMessages(messages: AssistantMessage[], fallback: string): string {
  const firstUser = messages.find((m) => m.role === "user");
  const raw = firstUser?.content?.trim() || fallback;
  if (!raw) return fallback;
  if (raw.length <= 80) return raw;
  return raw.slice(0, 77) + "...";
}

export function useTapanConversationHistory() {
  const [conversations, setConversations] = useState<TapanConversation[]>([]);
  const [activeId, setActiveId] = useState<string | null>(null);

  useEffect(() => {
    const initial = loadFromStorage();
    setConversations(initial);
    if (initial.length > 0 && !activeId) {
      setActiveId(initial[0].id);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    saveToStorage(conversations);
  }, [conversations]);

  const activeConversation = useMemo(
    () => conversations.find((c) => c.id === activeId) ?? null,
    [conversations, activeId]
  );

  const upsertFromMessages = useCallback(
    (messages: AssistantMessage[]) => {
      if (!messages.length) return;

      setConversations((prev) => {
        if (activeId) {
          const next = prev.map((c) =>
            c.id === activeId
              ? {
                  ...c,
                  messages,
                  updatedAt: new Date().toISOString(),
                  title: c.title || inferTitleFromMessages(messages, "Conversation"),
                }
              : c
          );
          return next;
        }

        const id = makeConversationId();
        const now = new Date().toISOString();
        const title = inferTitleFromMessages(messages, "Conversation");
        const next: TapanConversation = {
          id,
          title,
          createdAt: now,
          updatedAt: now,
          messages,
        };
        setActiveId(id);
        return [next, ...prev];
      });
    },
    [activeId]
  );

  const startNewConversation = useCallback(() => {
    const id = makeConversationId();
    const now = new Date().toISOString();
    const convo: TapanConversation = {
      id,
      title: "New conversation",
      createdAt: now,
      updatedAt: now,
      messages: [],
    };

    setConversations((prev) => [convo, ...prev]);
    setActiveId(id);
    return id;
  }, []);

  const selectConversation = useCallback((id: string) => {
    setActiveId(id);
  }, []);

  const renameConversation = useCallback((id: string, title: string) => {
    setConversations((prev) =>
      prev.map((c) => (c.id === id ? { ...c, title: title || c.title } : c))
    );
  }, []);

  return {
    conversations,
    activeConversation,
    activeId,
    setActiveId: selectConversation,
    upsertFromMessages,
    startNewConversation,
    renameConversation,
  };
}
