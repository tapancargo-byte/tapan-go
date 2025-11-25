import { create } from "zustand";
import type {
  ChatState,
  ChatMessage,
  ChatConversation,
  ChatUser,
} from "@/types/chat";
import { supabase } from "@/lib/supabaseClient";
import { useEffect } from "react";

type ChatComponentState = {
  state: ChatState;
  activeConversation?: string;
};

interface ChatStore {
  // State
  chatState: ChatComponentState;
  conversations: ChatConversation[];
  newMessage: string;
  hasLoaded: boolean;
  hasSubscribedToSupportMessages: boolean;

  // Actions
  setChatState: (state: ChatComponentState) => void;
  setConversations: (conversations: ChatConversation[]) => void;
  setNewMessage: (message: string) => void;
  handleSendMessage: () => void;
  openConversation: (conversationId: string) => void;
  goBack: () => void;
  toggleExpanded: () => void;
  logSystemMessage: (conversationId: string, content: string) => void;
  loadInitialData: () => void;
}

const makeLocalMessageId = (prefix: string) =>
  `${prefix}-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;

const CURRENT_USER: ChatUser = {
  id: "joyboy",
  name: "JOYBOY",
  username: "@JOYBOY",
  avatar: "/avatars/user_joyboy.png",
  isOnline: true,
};

export const CURRENT_USER_ID = CURRENT_USER.id;
export const WHATSAPP_CONVERSATION_ID = "whatsapp-invoices";

const chatStore = create<ChatStore>((set, get) => ({
  // Initial state
  chatState: {
    state: "collapsed",
  },
  conversations: [],
  newMessage: "",
  hasLoaded: false,
   hasSubscribedToSupportMessages: false,

  // Actions
  setChatState: (chatState) => set({ chatState }),

  setConversations: (conversations) => set({ conversations }),

  setNewMessage: (newMessage) => set({ newMessage }),

  handleSendMessage: () => {
    const { newMessage, conversations, chatState } = get();
    const activeConv = conversations.find(
      (conv) => conv.id === chatState.activeConversation
    );

    const trimmed = newMessage.trim();
    if (!trimmed || !activeConv) return;

    const now = new Date().toISOString();

    const message: ChatMessage = {
      id: makeLocalMessageId("local"),
      content: trimmed,
      timestamp: now,
      senderId: CURRENT_USER.id,
      isFromCurrentUser: true,
    };

    const updatedConversations = conversations.map((conv) =>
      conv.id === activeConv.id
        ? {
            ...conv,
            messages: [...conv.messages, message],
            lastMessage: message,
          }
        : conv
    );

    set({
      conversations: updatedConversations,
      newMessage: "",
    });

    (async () => {
      try {
        const { error } = await supabase.from("support_messages").insert({
          ticket_id: activeConv.id,
          sender_role: "operator",
          content: trimmed,
          created_at: now,
        });

        if (error) {
          console.error("Failed to persist chat message", error.message);
        }
      } catch (error) {
        console.error("Unexpected error persisting chat message", error);
      }
    })();
  },

  openConversation: (conversationId) => {
    const { conversations } = get();

    // Update chat state
    set({
      chatState: { state: "conversation", activeConversation: conversationId },
    });

    // Mark conversation as read
    const updatedConversations = conversations.map((conv) =>
      conv.id === conversationId ? { ...conv, unreadCount: 0 } : conv
    );

    set({ conversations: updatedConversations });
  },

  goBack: () => {
    const { chatState } = get();
    if (chatState.state === "conversation") {
      set({ chatState: { state: "expanded" } });
    } else {
      set({ chatState: { state: "collapsed" } });
    }
  },

  toggleExpanded: () => {
    const { chatState } = get();
    set({
      chatState: {
        state: chatState.state === "collapsed" ? "expanded" : "collapsed",
      },
    });
  },

  logSystemMessage: (conversationId, content) => {
    const { conversations } = get();
    const now = new Date().toISOString();

    const message: ChatMessage = {
      id: makeLocalMessageId("system"),
      content,
      timestamp: now,
      senderId: CURRENT_USER.id,
      isFromCurrentUser: true,
    };

    let found = false;
    const updatedConversations: ChatConversation[] = conversations.map((conv) => {
      if (conv.id !== conversationId) return conv;
      found = true;
      return {
        ...conv,
        messages: [...conv.messages, message],
        lastMessage: message,
      };
    });

    if (!found) {
      const systemUser: ChatUser = {
        id: conversationId,
        name: "WhatsApp Invoices",
        username: "@WHATSAPP",
        avatar: "/avatars/user_mati.png",
      };

      updatedConversations.push({
        id: conversationId,
        participants: [CURRENT_USER, systemUser],
        lastMessage: message,
        unreadCount: 0,
        messages: [message],
      });
    }

    set({ conversations: updatedConversations });
  },

  loadInitialData: () => {
    const { hasLoaded } = get();
    if (hasLoaded) return;

    set({ hasLoaded: true });

    (async () => {
      try {
        const {
          data: tickets,
          error: ticketsError,
        } = await supabase
          .from("support_tickets")
          .select("id, subject, status, priority, created_at, customer_id")
          .order("created_at", { ascending: false })
          .limit(20);

        if (ticketsError) {
          console.error("Failed to load chat tickets", ticketsError.message);
          set({ conversations: [] });
          return;
        }

        const ticketRows = (tickets ?? []) as {
          id: string;
          subject: string | null;
          status: string | null;
          priority: string | null;
          created_at: string | null;
          customer_id: string | null;
        }[];

        const ticketIds = ticketRows.map((t) => t.id);
        const customerIds = Array.from(
          new Set(
            ticketRows
              .map((t) => t.customer_id)
              .filter((id): id is string => !!id)
          )
        );

        const messagesByTicket = new Map<string, any[]>();

        if (ticketIds.length > 0) {
          const {
            data: messages,
            error: messagesError,
          } = await supabase
            .from("support_messages")
            .select("id, ticket_id, sender_role, content, created_at")
            .in("ticket_id", ticketIds)
            .order("created_at", { ascending: true });

          if (messagesError) {
            console.error(
              "Failed to load chat messages",
              messagesError.message
            );
          } else {
            (messages ?? []).forEach((m: any) => {
              const key = m.ticket_id as string;
              const arr = messagesByTicket.get(key) ?? [];
              arr.push(m);
              messagesByTicket.set(key, arr);
            });
          }
        }

        const customersById = new Map<
          string,
          {
            id: string;
            name: string | null;
          }
        >();

        if (customerIds.length > 0) {
          const {
            data: customers,
            error: customersError,
          } = await supabase
            .from("customers")
            .select("id, name")
            .in("id", customerIds);

          if (customersError) {
            console.error(
              "Failed to load chat customers",
              customersError.message
            );
          } else {
            (customers ?? []).forEach((c: any) => {
              customersById.set(c.id, {
                id: c.id,
                name: c.name,
              });
            });
          }
        }

        const conversations: ChatConversation[] = ticketRows.map((ticket) => {
          const ticketMessages = messagesByTicket.get(ticket.id) ?? [];

          const mappedMessages: ChatMessage[] = ticketMessages.map((m: any) => ({
            id: String(m.id),
            content: String(m.content ?? ""),
            timestamp:
              (m.created_at as string) ?? new Date().toISOString(),
            senderId: m.sender_role === "operator" ? CURRENT_USER.id : "customer",
            isFromCurrentUser: m.sender_role === "operator",
          }));

          const customer = ticket.customer_id
            ? customersById.get(ticket.customer_id)
            : undefined;

          const otherUser: ChatUser = {
            id: customer?.id ?? "customer",
            name: customer?.name ?? "Customer",
            username: customer?.name
              ? `@${customer.name.replace(/\s+/g, "").toUpperCase()}`
              : "@CUSTOMER",
            avatar: "/avatars/user_mati.png",
          };

          const messagesForConv =
            mappedMessages.length > 0
              ? mappedMessages
              : [
                  {
                    id: `ticket-${ticket.id}`,
                    content: ticket.subject ?? "No subject",
                    timestamp:
                      ticket.created_at ?? new Date().toISOString(),
                    senderId: otherUser.id,
                    isFromCurrentUser: false,
                  },
                ];

          const last = messagesForConv[messagesForConv.length - 1];

          return {
            id: ticket.id,
            participants: [CURRENT_USER, otherUser],
            lastMessage: last,
            unreadCount: 0,
            messages: messagesForConv,
          };
        });

        set({ conversations });

        const { hasSubscribedToSupportMessages } = get();
        if (!hasSubscribedToSupportMessages) {
          set({ hasSubscribedToSupportMessages: true });

          supabase
            .channel("support_messages_changes")
            .on(
              "postgres_changes",
              {
                event: "INSERT",
                schema: "public",
                table: "support_messages",
              },
              (payload: any) => {
                const row = payload.new as any;
                if (!row) return;

                const ticketId = row.ticket_id as string | null;
                if (!ticketId) return;

                // Ignore operator messages here since we already add them optimistically
                if (row.sender_role === "operator") return;

                const message: ChatMessage = {
                  id: String(row.id),
                  content: String(row.content ?? ""),
                  timestamp:
                    (row.created_at as string) ?? new Date().toISOString(),
                  senderId: "customer",
                  isFromCurrentUser: false,
                };

                set((state) => {
                  const existing = state.conversations.find(
                    (c) => c.id === ticketId
                  );
                  if (!existing) {
                    return state;
                  }

                  const updatedMessages = [...existing.messages, message];
                  const updatedConv: ChatConversation = {
                    ...existing,
                    messages: updatedMessages,
                    lastMessage: message,
                    unreadCount: existing.unreadCount + 1,
                  };

                  const conversations = state.conversations.map((c) =>
                    c.id === ticketId ? updatedConv : c
                  );

                  return { conversations } as ChatStore;
                });
              }
            )
            .subscribe();
        }
      } catch (error) {
        console.error("Unexpected error loading chat conversations", error);
        set({ conversations: [] });
      }
    })();
  },
}));

// Hook with computed values using selectors
export const useChatState = () => {
  const chatState = chatStore((state) => state.chatState);
  const conversations = chatStore((state) => state.conversations);
  const newMessage = chatStore((state) => state.newMessage);
   const hasLoaded = chatStore((state) => state.hasLoaded);
  const setChatState = chatStore((state) => state.setChatState);
  const setConversations = chatStore((state) => state.setConversations);
  const setNewMessage = chatStore((state) => state.setNewMessage);
  const handleSendMessage = chatStore((state) => state.handleSendMessage);
  const openConversation = chatStore((state) => state.openConversation);
  const goBack = chatStore((state) => state.goBack);
  const toggleExpanded = chatStore((state) => state.toggleExpanded);
   const logSystemMessage = chatStore((state) => state.logSystemMessage);
   const loadInitialData = chatStore((state) => state.loadInitialData);

  // Computed values
  const totalUnreadCount = conversations.reduce(
    (total, conv) => total + conv.unreadCount,
    0
  );

  const activeConversation = conversations.find(
    (conv) => conv.id === chatState.activeConversation
  );

  useEffect(() => {
    if (!hasLoaded) {
      loadInitialData();
    }
  }, [hasLoaded, loadInitialData]);

  return {
    chatState,
    conversations,
    newMessage,
    totalUnreadCount,
    activeConversation,
    setChatState,
    setConversations,
    setNewMessage,
    handleSendMessage,
    openConversation,
    goBack,
    toggleExpanded,
    logSystemMessage,
    loadInitialData,
  };
};
