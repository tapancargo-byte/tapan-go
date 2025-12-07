"use client";

import { useEffect, useState } from "react";
import DashboardPageLayout from "@/components/dashboard/layout";
import BracketsIcon from "@/components/icons/brackets";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { supabase } from "@/lib/supabaseClient";
import { useRouter } from "next/navigation";
import { format, differenceInCalendarDays } from "date-fns";
import { useToast } from "@/hooks/use-toast";
import { useTapanAssociateContext } from "@/components/layout/tapan-associate-context";
import type {
  UIInvoiceAlert,
  UIShipmentAlert,
  UITicketAlert,
} from "@/features/alerts/types";
import { InvoiceAlertsCard } from "@/features/alerts/invoice-alerts-card";
import { ShipmentAlertsCard } from "@/features/alerts/shipment-alerts-card";
import { TicketAlertsCard } from "@/features/alerts/ticket-alerts-card";

const formatDate = (value: string) => {
  if (!value) return "";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value;
  return format(date, "dd/MM/yyyy");
};

export default function AlertsPage() {
  const [invoiceAlerts, setInvoiceAlerts] = useState<UIInvoiceAlert[]>([]);
  const [shipmentAlerts, setShipmentAlerts] = useState<UIShipmentAlert[]>([]);
  const [ticketAlerts, setTicketAlerts] = useState<UITicketAlert[]>([]);
  const [loading, setLoading] = useState(true);
  const [userRole, setUserRole] = useState<string | null>(null);
  const [roleLoaded, setRoleLoaded] = useState(false);
  const [syncing, setSyncing] = useState(false);
  const router = useRouter();
  const { toast } = useToast();
  const { setModuleContext } = useTapanAssociateContext();

  useEffect(() => {
    let cancelled = false;

    async function loadAlerts() {
      setLoading(true);

      try {
        const today = new Date();
        const todayISO = today.toISOString();
        const stalledCutoff = new Date();
        stalledCutoff.setDate(stalledCutoff.getDate() - 3);
        const stalledCutoffISO = stalledCutoff.toISOString();

        // Invoices: overdue + pending past due date
        const [overdueRes, pendingRes] = await Promise.all([
          supabase
            .from("invoices")
            .select("id, invoice_ref, customer_id, amount, status, due_date")
            .eq("status", "overdue"),
          supabase
            .from("invoices")
            .select("id, invoice_ref, customer_id, amount, status, due_date")
            .eq("status", "pending")
            .lt("due_date", todayISO),
        ]);

        const invoiceRows = ([
          ...(overdueRes.data ?? []),
          ...(pendingRes.data ?? []),
        ] as any[]).filter(Boolean);

        const invoiceCustomerIds = Array.from(
          new Set(
            invoiceRows
              .map((r) => r.customer_id as string | null)
              .filter((id): id is string => !!id)
          )
        );

        const customersMap = new Map<string, { id: string; name: string }>();

        if (invoiceCustomerIds.length > 0) {
          const { data: customerRows } = await supabase
            .from("customers")
            .select("id, name")
            .in("id", invoiceCustomerIds);

          (customerRows ?? []).forEach((c: any) => {
            customersMap.set(c.id as string, {
              id: c.id as string,
              name: (c.name as string | null) ?? "",
            });
          });
        }

        const invoiceAlertsNormalized: UIInvoiceAlert[] = invoiceRows.map(
          (row: any) => {
            const dueDate = row.due_date as string | null;
            const due = dueDate ? new Date(dueDate) : null;
            const daysOverdue =
              due && due < today ? differenceInCalendarDays(today, due) : 0;

            const customer = row.customer_id
              ? customersMap.get(row.customer_id as string)
              : undefined;

            return {
              id: row.invoice_ref ?? row.id,
              customerName: customer?.name ?? "",
              amount: Number(row.amount ?? 0),
              status: (row.status as string) ?? "pending",
              dueDate: row.due_date ?? "",
              daysOverdue,
            };
          }
        );

        // Shipments: stuck in pending / in-transit / at-warehouse for >3 days
        const { data: shipmentRows } = await supabase
          .from("shipments")
          .select(
            "id, shipment_ref, customer_id, status, created_at, origin, destination"
          )
          .in("status", ["pending", "in-transit", "at-warehouse"])
          .lt("created_at", stalledCutoffISO);

        const shipmentCustomerIds = Array.from(
          new Set(
            ((shipmentRows as any[]) ?? [])
              .map((r) => r.customer_id as string | null)
              .filter((id): id is string => !!id)
          )
        );

        if (shipmentCustomerIds.length > 0) {
          const { data: shipCustomerRows } = await supabase
            .from("customers")
            .select("id, name")
            .in("id", shipmentCustomerIds);

          (shipCustomerRows ?? []).forEach((c: any) => {
            customersMap.set(c.id as string, {
              id: c.id as string,
              name: (c.name as string | null) ?? "",
            });
          });
        }

        const shipmentAlertsNormalized: UIShipmentAlert[] = (
          (shipmentRows as any[]) ?? []
        ).map((row) => {
          const created = row.created_at as string | null;
          const createdDate = created ? new Date(created) : null;
          const daysInState =
            createdDate && createdDate < today
              ? differenceInCalendarDays(today, createdDate)
              : 0;

          const customer = row.customer_id
            ? customersMap.get(row.customer_id as string)
            : undefined;

          return {
            id: row.id,
            shipmentRef: row.shipment_ref ?? row.id,
            customerName: customer?.name ?? "",
            status: row.status ?? "pending",
            createdAt: row.created_at ?? "",
            daysInState,
          };
        });

        // Tickets: unresolved high-priority
        const { data: ticketRows } = await supabase
          .from("support_tickets")
          .select("id, customer_id, subject, status, priority, created_at")
          .neq("status", "resolved")
          .eq("priority", "high");

        const ticketCustomerIds = Array.from(
          new Set(
            ((ticketRows as any[]) ?? [])
              .map((r) => r.customer_id as string | null)
              .filter((id): id is string => !!id)
          )
        );

        if (ticketCustomerIds.length > 0) {
          const { data: ticketCustomerRows } = await supabase
            .from("customers")
            .select("id, name")
            .in("id", ticketCustomerIds);

          (ticketCustomerRows ?? []).forEach((c: any) => {
            customersMap.set(c.id as string, {
              id: c.id as string,
              name: (c.name as string | null) ?? "",
            });
          });
        }

        const ticketAlertsNormalized: UITicketAlert[] = (
          (ticketRows as any[]) ?? []
        ).map((row) => {
          const customer = row.customer_id
            ? customersMap.get(row.customer_id as string)
            : undefined;

          return {
            id: row.id,
            subject: row.subject ?? "",
            customerName: customer?.name ?? "",
            priority: row.priority ?? "high",
            status: row.status ?? "open",
            createdAt: row.created_at ?? "",
          };
        });

        if (cancelled) return;

        setInvoiceAlerts(invoiceAlertsNormalized);
        setShipmentAlerts(shipmentAlertsNormalized);
        setTicketAlerts(ticketAlertsNormalized);
        setLoading(false);
      } catch (err) {
        if (cancelled) return;
        console.error("Failed to load alerts", err);
        setInvoiceAlerts([]);
        setShipmentAlerts([]);
        setTicketAlerts([]);
        setLoading(false);
      }
    }

    loadAlerts();

    return () => {
      cancelled = true;
    };
  }, []);

  useEffect(() => {
    if (loading) {
      return;
    }

    const contextPayload = {
      type: "alerts",
      counts: {
        invoices: invoiceAlerts.length,
        shipments: shipmentAlerts.length,
        tickets: ticketAlerts.length,
      },
      invoiceAlerts: invoiceAlerts.slice(0, 10).map((a) => ({
        id: a.id,
        status: a.status,
        amount: a.amount,
        daysOverdue: a.daysOverdue,
      })),
      shipmentAlerts: shipmentAlerts.slice(0, 10).map((a) => ({
        id: a.id,
        status: a.status,
        daysInState: a.daysInState,
      })),
      ticketAlerts: ticketAlerts.slice(0, 10).map((a) => ({
        id: a.id,
        status: a.status,
        priority: a.priority,
      })),
    };

    setModuleContext(contextPayload);

    return () => {
      setModuleContext(null);
    };
  }, [loading, invoiceAlerts, shipmentAlerts, ticketAlerts, setModuleContext]);

  useEffect(() => {
    let cancelled = false;

    async function loadUserRole() {
      try {
        const {
          data: { user },
          error,
        } = await supabase.auth.getUser();

        if (error || !user) {
          if (!cancelled) {
            setUserRole(null);
            setRoleLoaded(true);
          }
          return;
        }

        const { data, error: userError } = await supabase
          .from("users")
          .select("role")
          .eq("id", user.id)
          .maybeSingle();

        if (cancelled) return;

        if (userError || !data) {
          setUserRole(null);
        } else {
          setUserRole((data.role as string | null) ?? null);
        }
        setRoleLoaded(true);
      } catch (err) {
        if (cancelled) return;
        console.warn("Failed to load user role for alerts page", err);
        setUserRole(null);
        setRoleLoaded(true);
      }
    }

    loadUserRole();

    return () => {
      cancelled = true;
    };
  }, []);

  const canSync = userRole === "manager" || userRole === "admin";

  const handleSyncToNotifications = async () => {
    if (!canSync) {
      toast({
        title: "Insufficient permissions",
        description:
          "Only manager or admin users can sync alerts into notifications.",
        variant: "destructive",
      });
      return;
    }

    const total =
      invoiceAlerts.length + shipmentAlerts.length + ticketAlerts.length;
    if (total === 0) {
      toast({
        title: "No alerts to sync",
        description: "There are currently no alerts to push into notifications.",
      });
      return;
    }

    setSyncing(true);
    try {
      const payload: {
        title: string;
        message: string;
        type: string;
        priority: string;
      }[] = [];

      invoiceAlerts.forEach((a) => {
        payload.push({
          title: `Invoice ${a.id} is ${a.status}`,
          message: `Customer: ${
            a.customerName || "Unknown customer"
          }\nAmount: ₹${a.amount.toLocaleString(
            "en-IN"
          )}\nDue: ${formatDate(a.dueDate)} (${a.daysOverdue} days overdue)`,
          type: a.status === "overdue" ? "warning" : "info",
          priority: "high",
        });
      });

      shipmentAlerts.forEach((a) => {
        payload.push({
          title: `Shipment ${a.shipmentRef} stalled (${a.status})`,
          message: `Customer: ${
            a.customerName || "Unknown customer"
          }\nIn state for ${a.daysInState} day${
            a.daysInState === 1 ? "" : "s"
          }`,
          type: "warning",
          priority: "medium",
        });
      });

      ticketAlerts.forEach((a) => {
        payload.push({
          title: `High-priority ticket: ${a.subject}`,
          message: `Customer: ${
            a.customerName || "Unknown customer"
          }\nStatus: ${a.status}\nOpened: ${formatDate(a.createdAt)}`,
          type: "info",
          priority: "high",
        });
      });

      if (payload.length === 0) {
        setSyncing(false);
        return;
      }

      const { error } = await supabase
        .from("notifications")
        .insert(
          payload.map((p) => ({
            title: p.title,
            message: p.message,
            type: p.type,
            priority: p.priority,
          }))
        );

      if (error) {
        throw error;
      }

      toast({
        title: "Alerts synced",
        description: `${payload.length} alerts were pushed into notifications.`,
      });
    } catch (err: any) {
      console.error("Failed to sync alerts into notifications", err);
      toast({
        title: "Could not sync alerts",
        description:
          err?.message ||
          "Something went wrong while creating notifications from alerts.",
        variant: "destructive",
      });
    } finally {
      setSyncing(false);
    }
  };

  return (
    <DashboardPageLayout
      header={{
        title: "Exceptions & Alerts",
        description: "Track overdue invoices, stalled shipments, and escalations",
        icon: BracketsIcon,
      }}
    >
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div />
          <div className="flex items-center gap-3 text-xs">
            {roleLoaded && !canSync && (
              <span className="text-[11px] text-muted-foreground">
                You have read-only access. Only manager/admin can sync alerts.
              </span>
            )}
            <Button
              type="button"
              variant="outline"
              size="sm"
              disabled={!canSync || syncing}
              onClick={handleSyncToNotifications}
            >
              {syncing ? "Syncing..." : "Sync to notifications"}
            </Button>
          </div>
        </div>
        {/* Invoice Alerts */}
        <InvoiceAlertsCard
          loading={loading}
          alerts={invoiceAlerts}
          formatDate={formatDate}
          onViewInvoice={(invoiceId) =>
            router.push(`/invoices?q=${encodeURIComponent(invoiceId)}`)
          }
        />

        {/* Shipment Alerts */}
        <ShipmentAlertsCard
          loading={loading}
          alerts={shipmentAlerts}
          onViewShipment={(shipmentRef) =>
            router.push(`/shipments?q=${encodeURIComponent(shipmentRef)}`)
          }
        />

        {/* Ticket Alerts */}
        <TicketAlertsCard
          loading={loading}
          alerts={ticketAlerts}
          formatDate={formatDate}
          onViewTicket={(subject) =>
            router.push(`/support?q=${encodeURIComponent(subject)}`)
          }
        />
      </div>
    </DashboardPageLayout>
  );
}
