"use client";

import { useEffect, useState } from "react";
import DashboardPageLayout from "@/components/dashboard/layout";
import EmailIcon from "@/components/icons/email";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { supabase } from "@/lib/supabaseClient";
import { useToast } from "@/hooks/use-toast";
import type { UINotification } from "@/features/notifications/types";
import { NotificationsList } from "@/features/notifications/notifications-list";

export default function NotificationsPage() {
  const [notifications, setNotifications] = useState<UINotification[]>([]);
  const [loading, setLoading] = useState(true);
  const [updatingId, setUpdatingId] = useState<string | null>(null);
  const { toast } = useToast();

  useEffect(() => {
    let cancelled = false;

    async function loadNotifications() {
      setLoading(true);
      try {
        const { data, error } = await supabase
          .from("notifications")
          .select("id, title, message, type, priority, is_read, created_at")
          .order("created_at", { ascending: false });

        if (error) {
          console.error("Supabase notifications error", error.message);
          throw error;
        }

        if (cancelled) return;

        const normalized: UINotification[] = ((data as any[]) ?? []).map(
          (row) => ({
            id: row.id as string,
            title: (row.title as string | null) ?? "",
            message: (row.message as string | null) ?? "",
            type: (row.type as string | null) ?? "info",
            priority: (row.priority as string | null) ?? "medium",
            isRead: Boolean(row.is_read),
            createdAt: (row.created_at as string | null) ?? "",
          })
        );

        setNotifications(normalized);
        setLoading(false);
      } catch (err) {
        if (cancelled) return;
        console.error("Failed to load notifications", err);
        setNotifications([]);
        setLoading(false);
      }
    }

    loadNotifications();

    return () => {
      cancelled = true;
    };
  }, []);

  const handleMarkRead = async (id: string) => {
    setUpdatingId(id);
    try {
      const { error } = await supabase
        .from("notifications")
        .update({ is_read: true })
        .eq("id", id);

      if (error) {
        throw error;
      }

      setNotifications((prev) =>
        prev.map((n) => (n.id === id ? { ...n, isRead: true } : n))
      );
    } catch (err: any) {
      console.error("Failed to mark notification as read", err);
      toast({
        title: "Could not update notification",
        description:
          err?.message || "Something went wrong while marking as read.",
        variant: "destructive",
      });
    } finally {
      setUpdatingId(null);
    }
  };

  const handleMarkAllRead = async () => {
    const unreadIds = notifications.filter((n) => !n.isRead).map((n) => n.id);
    if (unreadIds.length === 0) return;

    setUpdatingId("__all__");
    try {
      const { error } = await supabase
        .from("notifications")
        .update({ is_read: true })
        .in("id", unreadIds);

      if (error) {
        throw error;
      }

      setNotifications((prev) => prev.map((n) => ({ ...n, isRead: true })));
    } catch (err: any) {
      console.error("Failed to mark all notifications as read", err);
      toast({
        title: "Could not update notifications",
        description:
          err?.message || "Something went wrong while marking all as read.",
        variant: "destructive",
      });
    } finally {
      setUpdatingId(null);
    }
  };

  const unreadCount = notifications.filter((n) => !n.isRead).length;

  return (
    <DashboardPageLayout
      header={{
        title: "Notifications",
        description: "System events, billing alerts, and operations updates",
        icon: EmailIcon,
      }}
    >
      <div className="space-y-6">
        <Card className="p-4 border-pop bg-background flex items-center justify-between">
          <div>
            <p className="text-sm font-medium text-foreground">Inbox</p>
            <p className="text-xs text-muted-foreground">
              {notifications.length} total · {unreadCount} unread
            </p>
          </div>
          <div className="flex items-center gap-2">
            <Badge
              variant="outline"
              className={
                unreadCount > 0
                  ? "border-red-500/50 text-red-400"
                  : "border-emerald-500/50 text-emerald-400"
              }
            >
              {unreadCount > 0 ? "Attention" : "All caught up"}
            </Badge>
            <Button
              type="button"
              variant="outline"
              size="sm"
              disabled={unreadCount === 0 || updatingId === "__all__"}
              onClick={handleMarkAllRead}
            >
              Mark all as read
            </Button>
          </div>
        </Card>

        <NotificationsList
          loading={loading}
          notifications={notifications}
          updatingId={updatingId}
          onMarkRead={handleMarkRead}
        />
      </div>
    </DashboardPageLayout>
  );
}
