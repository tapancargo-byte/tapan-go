"use client";

import * as React from "react";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { EmptyState } from "@/components/ui/empty-state";
import { Skeleton } from "@/components/ui/skeleton";
import { formatDistanceToNow } from "date-fns";
import type { UINotification } from "@/features/notifications/types";

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

interface NotificationsListProps {
  loading: boolean;
  notifications: UINotification[];
  updatingId: string | null;
  onMarkRead: (id: string) => void;
}

export function NotificationsList({
  loading,
  notifications,
  updatingId,
  onMarkRead,
}: NotificationsListProps) {
  return (
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
                    onClick={() => onMarkRead(n.id)}
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
  );
}
