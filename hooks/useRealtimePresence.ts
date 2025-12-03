"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabaseClient";

export interface PresenceUser {
  user_id: string;
  email?: string;
  name?: string;
  page: string;
  online_at: string;
}

export function useRealtimePresence(page: string) {
  const [onlineUsers, setOnlineUsers] = useState<PresenceUser[]>([]);
  const [isOnline, setIsOnline] = useState(false);

  useEffect(() => {
    let channel: ReturnType<typeof supabase.channel> | null = null;

    const setupPresence = async () => {
      // Get current session
      const {
        data: { session },
      } = await supabase.auth.getSession();

      if (!session) {
        console.log("No session, skipping presence");
        return;
      }

      channel = supabase.channel(`presence:${page}`, {
        config: {
          presence: {
            key: session.user.id,
          },
        },
      });

      channel
        .on("presence", { event: "sync" }, () => {
          const state = channel?.presenceState();
          if (!state) return;

          const users = Object.values(state)
            .flat()
            .map((user: any) => ({
              user_id: user.user_id,
              email: user.email,
              name: user.name || user.email?.split("@")[0],
              page: user.page,
              online_at: user.online_at,
            })) as PresenceUser[];

          setOnlineUsers(users);
        })
        .on("presence", { event: "join" }, ({ key, newPresences }) => {
          console.log("User joined:", key);
        })
        .on("presence", { event: "leave" }, ({ key, leftPresences }) => {
          console.log("User left:", key);
        })
        .subscribe(async (status) => {
          if (status === "SUBSCRIBED") {
            setIsOnline(true);
            
            // Track this user's presence
            await channel?.track({
              user_id: session.user.id,
              email: session.user.email,
              name: session.user.user_metadata?.name || session.user.email?.split("@")[0],
              page,
              online_at: new Date().toISOString(),
            });
          }
        });
    };

    setupPresence();

    return () => {
      if (channel) {
        channel.untrack();
        supabase.removeChannel(channel);
      }
      setIsOnline(false);
    };
  }, [page]);

  return {
    onlineUsers,
    isOnline,
    count: onlineUsers.length,
  };
}
