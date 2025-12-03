"use client";

import { useEffect, useState } from "react";
import DashboardPageLayout from "@/components/dashboard/layout";
import EmailIcon from "@/components/icons/email";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { supabase } from "@/lib/supabaseClient";
import { useToast } from "@/hooks/use-toast";
import { formatDistanceToNow } from "date-fns";
import { EmptyState } from "@/components/ui/empty-state";
import { Skeleton } from "@/components/ui/skeleton";

interface UINotification {
  id: string;
  title: string;
  message: string;
  type: string;
  priority: string;
  isRead: boolean;
  createdAt: string;
}

const formatSince = (value: string) => {
  if (!value) return "";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value;
  return formatDistanceToNow(date, { addSuffix: true });
};

const getTypeBadgeColor = (type: string) => {
  switch (type) {
    case "success":
      return "bg-green-500/20 text-green-400";
    case "warning":
      return "bg-yellow-500/20 text-yellow-400";
    case "error":
      return "bg-red-500/20 text-red-400";
    default:
      return "bg-blue-500/20 text-blue-400";
  }
};

const getPriorityBadgeColor = (priority: string) => {
  switch (priority) {
    case "high":
      return "bg-red-500/20 text-red-400";
    case "medium":
      return "bg-orange-500/20 text-orange-400";
    case "low":
    default:
      return "bg-emerald-500/20 text-emerald-400";
  }
};

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

        <Card className="border-pop bg-background">
          <div className="divide-y divide-border">
            {loading ? (
              <>
                {Array.from({ length: 4 }).map((_, index) => (
                  <div
                    key={`notification-skeleton-${index}`}
                    className="p-4 flex items-start gap-3"
                  >
                    <div className="flex-1 space-y-2">
                      <Skeleton className="h-4 w-40" />
                      <Skeleton className="h-3 w-full" />
                      <Skeleton className="h-3 w-3/4" />
                      <Skeleton className="h-3 w-24" />
                    </div>
                    <div className="flex flex-col items-end gap-2">
                      <Skeleton className="h-5 w-20" />
                      <Skeleton className="h-5 w-20" />
                    </div>
                  </div>
                ))}
              </>
            ) : notifications.length === 0 ? (
              <EmptyState
                variant="default"
                title="No notifications yet"
                description="System events and alerts will appear here as they happen."
              />
            ) : (
              notifications.map((n) => (
                <div
                  key={n.id}
                  className="p-4 flex items-start justify_between gap-3 hover:bg-accent/40 transition-colors"
                >
                  <div className="flex-1 space-y-1">
                    <div className="flex items-center gap-2">
                      <p className="text-sm font-medium text-foreground">
                        {n.title || "Notification"}
                      </p>
                      {!n.isRead && (
                        <span className="w-2 h-2 rounded-full bg-blue-500" />
                      )}
                    </div>
                    <p className="text-xs text-muted-foreground whitespace-pre-line">
                      {n.message}
                    </p>
                    <p className="text-[11px] text-muted-foreground mt-1">
                      {formatSince(n.createdAt)}
                    </p>
                  </div>
                  <div className="flex flex-col items-end gap-2">
                    <div className="flex gap-1">
                      <Badge className={getTypeBadgeColor(n.type)}>
                        {n.type.toUpperCase()}
                      </Badge>
                      <Badge className={getPriorityBadgeColor(n.priority)}>
                        {n.priority.toUpperCase()}
                      </Badge>
                    </div>
                    {!n.isRead && (
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        disabled={updatingId === n.id}
                        onClick={() => handleMarkRead(n.id)}
                      >
                        Mark read
                      </Button>
                    )}
                  </div>
                </div>
              ))
            )}
          </div>
        </Card>
      </div>
    </DashboardPageLayout>
  );
}
