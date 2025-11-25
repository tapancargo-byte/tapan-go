"use client";

import { useEffect, useMemo, useState } from "react";
import DashboardPageLayout from "@/components/dashboard/layout";
import ProcessorIcon from "@/components/icons/proccesor";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { supabase } from "@/lib/supabaseClient";
import { format, formatDistanceToNow, isToday, isYesterday } from "date-fns";

interface ActivityEvent {
  id: string;
  source: "invoice" | "scan" | "notification" | "whatsapp";
  title: string;
  description: string;
  timestamp: string;
  type: string;
  priority?: string;
}

const formatSince = (value: string) => {
  if (!value) return "";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value;
  return formatDistanceToNow(date, { addSuffix: true });
};

const getDateKey = (value: string) => {
  if (!value) return "unknown";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "unknown";
  return date.toISOString().slice(0, 10);
};

const getDayLabel = (value: string) => {
  if (!value) return "Unknown day";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "Unknown day";
  if (isToday(date)) return "Today";
  if (isYesterday(date)) return "Yesterday";
  return format(date, "dd MMM yyyy");
};

const getSourceBadgeColor = (source: string) => {
  switch (source) {
    case "invoice":
      return "bg-blue-500/20 text-blue-400";
    case "scan":
      return "bg-purple-500/20 text-purple-400";
    case "notification":
      return "bg-emerald-500/20 text-emerald-400";
    case "whatsapp":
      return "bg-green-500/20 text-green-400";
    default:
      return "bg-gray-500/20 text-gray-400";
  }
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
      return "bg-sky-500/20 text-sky-400";
  }
};

export default function OpsActivityPage() {
  const [events, setEvents] = useState<ActivityEvent[]>([]);
  const [loading, setLoading] = useState(true);
  const [sourceFilter, setSourceFilter] = useState<string>("all");
  const [typeFilter, setTypeFilter] = useState<string>("all");

  const filteredEvents = useMemo(
    () =>
      events.filter((event) => {
        const matchesSource =
          sourceFilter === "all" || event.source === sourceFilter;
        const matchesType = typeFilter === "all" || event.type === typeFilter;
        return matchesSource && matchesType;
      }),
    [events, sourceFilter, typeFilter]
  );

  useEffect(() => {
    let cancelled = false;

    async function loadActivity() {
      setLoading(true);
      try {
        const [logsRes, scansRes, notificationsRes, whatsappRes] = await Promise.all([
          supabase
            .from("invoice_generation_logs")
            .select(
              "id, invoice_id, status, message, details, started_at, finished_at, duration_ms"
            )
            .order("started_at", { ascending: false })
            .limit(50),
          supabase
            .from("package_scans")
            .select(
              "id, barcode_id, scanned_at, location, scan_type, manifest_id"
            )
            .order("scanned_at", { ascending: false })
            .limit(50),
          supabase
            .from("notifications")
            .select("id, title, message, type, priority, created_at")
            .order("created_at", { ascending: false })
            .limit(50),
          supabase
            .from("whatsapp_logs")
            .select("id, invoice_id, status, error_message, created_at")
            .order("created_at", { ascending: false })
            .limit(50),
        ]);

        if (cancelled) return;

        const invoiceEvents: ActivityEvent[] = ((logsRes.data as any[]) ?? []).map(
          (row) => {
            const status: string = (row.status as string | null) ?? "unknown";
            const message: string = (row.message as string | null) ?? "";
            const duration = row.duration_ms as number | null;

            const descLines = [
              `Status: ${status}`,
              message && `Message: ${message}`,
              duration != null && `Duration: ${duration}ms`,
            ].filter(Boolean) as string[];

            return {
              id: row.id as string,
              source: "invoice",
              title: `Invoice job ${status}`,
              description: descLines.join("\n"),
              timestamp: (row.started_at as string | null) ?? "",
              type: status === "completed" ? "success" : status === "failed" ? "error" : "info",
            };
          }
        );

        const scanEvents: ActivityEvent[] = ((scansRes.data as any[]) ?? []).map(
          (row) => {
            const scanType: string = (row.scan_type as string | null) ?? "scan";
            const location: string = (row.location as string | null) ?? "";

            const descLines = [
              `Scan type: ${scanType}`,
              location && `Location: ${location}`,
            ].filter(Boolean) as string[];

            return {
              id: row.id as string,
              source: "scan",
              title: `Package scan ${scanType}`,
              description: descLines.join("\n"),
              timestamp: (row.scanned_at as string | null) ?? "",
              type: "info",
            };
          }
        );

        const notificationEvents: ActivityEvent[] = (
          (notificationsRes.data as any[]) ?? []
        ).map((row) => ({
          id: row.id as string,
          source: "notification",
          title: (row.title as string | null) ?? "Notification",
          description: (row.message as string | null) ?? "",
          timestamp: (row.created_at as string | null) ?? "",
          type: (row.type as string | null) ?? "info",
          priority: (row.priority as string | null) ?? "medium",
        }));

        const whatsappEvents: ActivityEvent[] = ((whatsappRes.data as any[]) ?? []).map(
          (row) => {
            const status: string = (row.status as string | null) ?? "unknown";
            const invoiceId: string = (row.invoice_id as string | null) ?? "";
            const errorMessage: string | null = (row.error_message as string | null) ?? null;

            const descLines = [
              invoiceId && `Invoice: ${invoiceId}`,
              `Status: ${status}`,
              errorMessage && `Error: ${errorMessage}`,
            ].filter(Boolean) as string[];

            const type: string =
              status === "sent" || status === "delivered"
                ? "success"
                : status === "failed"
                ? "error"
                : "info";

            return {
              id: row.id as string,
              source: "whatsapp" as const,
              title: `WhatsApp ${status}`,
              description: descLines.join("\n"),
              timestamp: (row.created_at as string | null) ?? "",
              type,
            };
          }
        );

        const allEvents = [
          ...invoiceEvents,
          ...scanEvents,
          ...notificationEvents,
          ...whatsappEvents,
        ];

        allEvents.sort((a, b) => {
          const ta = a.timestamp ? new Date(a.timestamp).getTime() : 0;
          const tb = b.timestamp ? new Date(b.timestamp).getTime() : 0;
          return tb - ta;
        });

        setEvents(allEvents);
        setLoading(false);
      } catch (err) {
        if (cancelled) return;
        console.error("Failed to load ops activity", err);
        setEvents([]);
        setLoading(false);
      }
    }

    loadActivity();

    return () => {
      cancelled = true;
    };
  }, []);

  return (
    <DashboardPageLayout
      header={{
        title: "Ops Activity",
        description: "Recent jobs, scans, and alerts across the network",
        icon: ProcessorIcon,
      }}
    >
      <div className="space-y-6">
        <Card className="border-pop bg-background">
          <div className="p-4 border-b border-border flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-foreground">Event feed</p>
              <p className="text-xs text-muted-foreground">
                {filteredEvents.length} of {events.length} events shown from
                invoice jobs, scans, notifications, and WhatsApp.
              </p>
            </div>
            <div className="flex flex-wrap gap-2 text-xs">
              <select
                value={sourceFilter}
                onChange={(e) => setSourceFilter(e.target.value)}
                className="rounded border border-border bg-background px-2 py-1"
              >
                <option value="all">All sources</option>
                <option value="invoice">Invoices</option>
                <option value="scan">Scans</option>
                <option value="notification">Notifications</option>
                <option value="whatsapp">WhatsApp</option>
              </select>
              <select
                value={typeFilter}
                onChange={(e) => setTypeFilter(e.target.value)}
                className="rounded border border-border bg-background px-2 py-1"
              >
                <option value="all">All types</option>
                <option value="success">Success</option>
                <option value="warning">Warning</option>
                <option value="error">Error</option>
                <option value="info">Info</option>
              </select>
            </div>
          </div>

          <div className="divide-y divide-border">
            {loading ? (
              <div className="p-6 text-sm text-muted-foreground">
                Loading activity...
              </div>
            ) : filteredEvents.length === 0 ? (
              <div className="p-6 text-sm text-muted-foreground">
                No recent activity.
              </div>
            ) : (
              filteredEvents.map((event, index) => {
                const dateKey = getDateKey(event.timestamp);
                const prev = index > 0 ? filteredEvents[index - 1] : null;
                const prevKey = prev ? getDateKey(prev.timestamp) : "";
                const showHeader = dateKey !== prevKey;

                return (
                  <div key={`${event.source}-${event.id}`}>
                    {showHeader && (
                      <div className="px-4 py-2 bg-muted/40 text-[11px] font-semibold uppercase text-muted-foreground">
                        {getDayLabel(event.timestamp)}
                      </div>
                    )}
                    <div className="p-4 flex items-start justify-between gap-3 hover:bg-accent/40 transition-colors">
                      <div className="flex-1 space-y-1">
                        <div className="flex items-center gap-2">
                          <p className="text-sm font-medium text-foreground">
                            {event.title}
                          </p>
                          <Badge className={getSourceBadgeColor(event.source)}>
                            {event.source.toUpperCase()}
                          </Badge>
                          <Badge className={getTypeBadgeColor(event.type)}>
                            {event.type.toUpperCase()}
                          </Badge>
                          {event.priority && (
                            <Badge className="bg-amber-500/20 text-amber-400">
                              {event.priority.toUpperCase()}
                            </Badge>
                          )}
                        </div>
                        <p className="text-xs text-muted-foreground whitespace-pre-line">
                          {event.description}
                        </p>
                        <p className="text-[11px] text-muted-foreground mt-1">
                          {formatSince(event.timestamp)}
                        </p>
                      </div>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </Card>
      </div>
    </DashboardPageLayout>
  );
}
