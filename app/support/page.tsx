"use client";

import { Suspense, useEffect, useMemo, useState } from "react";
import { useSearchParams } from "next/navigation";
import DashboardPageLayout from "@/components/dashboard/layout";
import EmailIcon from "@/components/icons/email";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { supabase } from "@/lib/supabaseClient";
import { useToast } from "@/hooks/use-toast";
import { format } from "date-fns";
import { EmptyState } from "@/components/ui/empty-state";
import { Skeleton } from "@/components/ui/skeleton";

type TicketStatus = "open" | "in-progress" | "resolved" | string;
type TicketPriority = "low" | "medium" | "high" | string;

interface UITicket {
  dbId: string;
  subject: string;
  customerName: string;
  status: TicketStatus;
  priority: TicketPriority;
  createdAt: string;
  resolvedAt: string | null;
}

const ticketSchema = z.object({
  subject: z.string().min(5, "Subject is required"),
  customerId: z.string().optional().or(z.literal("")),
  priority: z.enum(["low", "medium", "high"]).default("medium"),
});

type TicketFormValues = z.infer<typeof ticketSchema>;

const formatDateTime = (value: string | null) => {
  if (!value) return "";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value;
  return format(date, "dd/MM/yyyy HH:mm");
};

const getStatusColor = (status: string) => {
  switch (status) {
    case "open":
      return "bg-red-500/20 text-red-400";
    case "in-progress":
      return "bg-yellow-500/20 text-yellow-400";
    case "resolved":
      return "bg-green-500/20 text-green-400";
    default:
      return "bg-gray-500/20 text-gray-400";
  }
};

const getPriorityColor = (priority: string) => {
  switch (priority) {
    case "high":
      return "bg-red-500/20 text-red-400";
    case "medium":
      return "bg-orange-500/20 text-orange-400";
    case "low":
      return "bg-blue-500/20 text-blue-400";
    default:
      return "bg-gray-500/20 text-gray-400";
  }
};

function SupportPageContent() {
  const searchParams = useSearchParams();
  const [searchTerm, setSearchTerm] = useState(
    () => searchParams.get("q") || ""
  );
  const [filterStatus, setFilterStatus] = useState<string>("all");
  const [filterPriority, setFilterPriority] = useState<string>("all");
  const [tickets, setTickets] = useState<UITicket[]>([]);
  const [loading, setLoading] = useState(true);
  const [customers, setCustomers] = useState<{ id: string; name: string }[]>([]);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isCreating, setIsCreating] = useState(false);
  const [updatingStatusId, setUpdatingStatusId] = useState<string | null>(null);
  const { toast } = useToast();

  const form = useForm<TicketFormValues>({
    resolver: zodResolver(ticketSchema),
    defaultValues: {
      subject: "",
      customerId: "",
      priority: "medium",
    },
  });

  useEffect(() => {
    let cancelled = false;

    async function loadTickets() {
      setLoading(true);
      try {
        const { data: ticketRows, error: ticketsError } = await supabase
          .from("support_tickets")
          .select(
            "id, customer_id, subject, status, priority, created_at, resolved_at"
          )
          .order("created_at", { ascending: false });

        if (ticketsError) {
          console.error("Supabase support_tickets error", ticketsError.message);
          throw ticketsError;
        }

        const rows = (ticketRows ?? []) as {
          id: string;
          customer_id: string | null;
          subject: string | null;
          status: string | null;
          priority: string | null;
          created_at: string | null;
          resolved_at: string | null;
        }[];

        const customerIds = Array.from(
          new Set(
            rows
              .map((r) => r.customer_id)
              .filter((id): id is string => !!id)
          )
        );

        const customersMap = new Map<string, { id: string; name: string }>();

        try {
          const { data: customerRows, error: customersError } = await supabase
            .from("customers")
            .select("id, name")
            .in("id", customerIds);

          if (customersError) {
            console.warn(
              "Supabase customers for tickets error, skipping customer join",
              customersError.message
            );
          } else {
            (customerRows ?? []).forEach((c: any) => {
              const name = (c.name as string | null) ?? "";
              customersMap.set(c.id as string, { id: c.id as string, name });
            });

            setCustomers(
              (customerRows ?? []).map((c: any) => ({
                id: c.id as string,
                name: (c.name as string | null) ?? "",
              }))
            );
          }
        } catch (customersErr) {
          console.warn("Supabase customers for tickets error", customersErr);
        }

        if (cancelled) return;

        const normalized: UITicket[] = rows.map((row) => {
          const customer = row.customer_id
            ? customersMap.get(row.customer_id)
            : undefined;

          return {
            dbId: row.id,
            subject: row.subject ?? "",
            customerName: customer?.name ?? "",
            status: (row.status ?? "open") as TicketStatus,
            priority: (row.priority ?? "medium") as TicketPriority,
            createdAt: row.created_at ?? "",
            resolvedAt: row.resolved_at ?? null,
          };
        });

        setTickets(normalized);
        setLoading(false);
      } catch (err) {
        if (cancelled) return;
        console.error("Failed to load support tickets from Supabase", err);
        setTickets([]);
        setLoading(false);
      }
    }

    loadTickets();

    return () => {
      cancelled = true;
    };
  }, []);

  const filteredTickets = useMemo(
    () =>
      tickets.filter((ticket) => {
        const matchesSearch =
          ticket.subject.toLowerCase().includes(searchTerm.toLowerCase()) ||
          ticket.customerName.toLowerCase().includes(searchTerm.toLowerCase());
        const matchesStatus =
          filterStatus === "all" || ticket.status === filterStatus;
        const matchesPriority =
          filterPriority === "all" || ticket.priority === filterPriority;
        return matchesSearch && matchesStatus && matchesPriority;
      }),
    [tickets, searchTerm, filterStatus, filterPriority]
  );

  const handleCreateTicket = async (values: TicketFormValues) => {
    setIsCreating(true);
    try {
      const payload: any = {
        subject: values.subject.trim(),
        status: "open",
        priority: values.priority,
      };

      if (values.customerId) {
        payload.customer_id = values.customerId;
      }

      const { data, error } = await supabase
        .from("support_tickets")
        .insert(payload)
        .select(
          "id, customer_id, subject, status, priority, created_at, resolved_at"
        )
        .single();

      if (error || !data) {
        throw error || new Error("Failed to create support ticket");
      }

      const customer = customers.find((c) => c.id === data.customer_id) || null;

      const newTicket: UITicket = {
        dbId: data.id,
        subject: data.subject ?? "",
        customerName: customer?.name ?? "",
        status: (data.status ?? "open") as TicketStatus,
        priority: (data.priority ?? "medium") as TicketPriority,
        createdAt: data.created_at ?? "",
        resolvedAt: data.resolved_at ?? null,
      };

      setTickets((prev) => [newTicket, ...prev]);
      setIsDialogOpen(false);
      form.reset({ subject: "", customerId: "", priority: "medium" });

      toast({
        title: "Ticket created",
        description: `Support ticket "${newTicket.subject}" has been created.`,
      });
    } catch (err: any) {
      console.error("Failed to create support ticket", err);
      toast({
        title: "Could not create ticket",
        description:
          err?.message || "Something went wrong while creating the ticket.",
        variant: "destructive",
      });
    } finally {
      setIsCreating(false);
    }
  };

  const handleUpdateStatus = async (
    ticket: UITicket,
    nextStatus: TicketStatus
  ) => {
    if (ticket.status === nextStatus) return;

    setUpdatingStatusId(ticket.dbId);
    try {
      const resolved_at =
        nextStatus === "resolved" ? new Date().toISOString() : null;

      const { error } = await supabase
        .from("support_tickets")
        .update({ status: nextStatus, resolved_at })
        .eq("id", ticket.dbId);

      if (error) {
        throw error;
      }

      setTickets((prev) =>
        prev.map((t) =>
          t.dbId === ticket.dbId
            ? { ...t, status: nextStatus, resolvedAt: resolved_at }
            : t
        )
      );

      toast({
        title: "Ticket updated",
        description: `Status set to ${nextStatus}.`,
      });
    } catch (err: any) {
      console.error("Failed to update support ticket", err);
      toast({
        title: "Could not update ticket",
        description:
          err?.message || "Something went wrong while updating the ticket.",
        variant: "destructive",
      });
    } finally {
      setUpdatingStatusId(null);
    }
  };

  return (
    <DashboardPageLayout
      header={{
        title: "Support Tickets",
        description: "Track issues, SLAs, and customer escalations",
        icon: EmailIcon,
      }}
    >
      <div className="flex flex-col gap-6">
        {/* Search & Filters */}
        <div className="flex gap-4 flex-col sm:flex-row items-end">
          <div className="flex-1">
            <label className="text-sm font-medium mb-2 block">Search</label>
            <Input
              placeholder="Search by subject or customer name..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="bg-input text-foreground"
            />
          </div>
          <div>
            <label className="text-sm font-medium mb-2 block">Status</label>
            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
              className="px-3 py-2 bg-input text-foreground border border-pop"
            >
              <option value="all">All</option>
              <option value="open">Open</option>
              <option value="in-progress">In Progress</option>
              <option value="resolved">Resolved</option>
            </select>
          </div>
          <div>
            <label className="text-sm font-medium mb-2 block">Priority</label>
            <select
              value={filterPriority}
              onChange={(e) => setFilterPriority(e.target.value)}
              className="px-3 py-2 bg-input text-foreground border border-pop"
            >
              <option value="all">All</option>
              <option value="high">High</option>
              <option value="medium">Medium</option>
              <option value="low">Low</option>
            </select>
          </div>
          <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
            <Button
              type="button"
              className="bg-primary hover:bg-primary/90"
              onClick={() => setIsDialogOpen(true)}
            >
              New Ticket
            </Button>

            <DialogContent>
              <DialogHeader>
                <DialogTitle>New support ticket</DialogTitle>
                <DialogDescription>
                  Log a customer issue or operational exception for follow-up.
                </DialogDescription>
              </DialogHeader>

              <Form {...form}>
                <form
                  className="space-y-4 mt-2"
                  onSubmit={form.handleSubmit(handleCreateTicket)}
                >
                  <FormField
                    control={form.control}
                    name="subject"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Subject</FormLabel>
                        <FormControl>
                          <Input
                            placeholder="e.g. Delivery delay for TG-IMPH-DEL-001"
                            {...field}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="customerId"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Customer</FormLabel>
                        <FormControl>
                          <select
                            {...field}
                            className="w-full border border-input bg-input text-foreground px-3 py-2 text-sm"
                          >
                            <option value="">Unassigned</option>
                            {customers.map((c) => (
                              <option key={c.id} value={c.id}>
                                {c.name}
                              </option>
                            ))}
                          </select>
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="priority"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Priority</FormLabel>
                        <FormControl>
                          <select
                            {...field}
                            className="w-full border border-input bg-background px-3 py-2 text-sm"
                          >
                            <option value="high">High</option>
                            <option value="medium">Medium</option>
                            <option value="low">Low</option>
                          </select>
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <DialogFooter className="pt-2">
                    <Button
                      type="button"
                      variant="ghost"
                      onClick={() => setIsDialogOpen(false)}
                      className="uppercase"
                    >
                      Cancel
                    </Button>
                    <Button
                      type="submit"
                      className="bg-primary hover:bg-primary/90"
                      disabled={isCreating}
                    >
                      {isCreating ? "Creating..." : "Create ticket"}
                    </Button>
                  </DialogFooter>
                </form>
              </Form>
            </DialogContent>
          </Dialog>
        </div>

        {/* Tickets Table */}
        <Card className="border-pop">
          <div className="overflow-x-auto">
          <table className="w-full text-sm min-w-[800px]">
            <thead className="bg-accent/50 border-b border-pop">
              <tr>
                <th className="px-6 py-3 text-left font-semibold">Subject</th>
                <th className="px-6 py-3 text-left font-semibold">Customer</th>
                <th className="px-6 py-3 text-left font-semibold">Status</th>
                <th className="px-6 py-3 text-left font-semibold">Priority</th>
                <th className="px-6 py-3 text-left font-semibold">Created</th>
                <th className="px-6 py-3 text-left font-semibold">Resolved</th>
                <th className="px-6 py-3 text-left font-semibold text-right">Actions</th>
              </tr>
            </thead>
            <tbody>
              {loading && (
                <>
                  {Array.from({ length: 5 }).map((_, index) => (
                    <tr
                      key={`ticket-skeleton-${index}`}
                      className="border-b border-pop"
                    >
                      <td className="px-6 py-4">
                        <Skeleton className="h-4 w-64" />
                      </td>
                      <td className="px-6 py-4">
                        <Skeleton className="h-4 w-40" />
                      </td>
                      <td className="px-6 py-4">
                        <Skeleton className="h-5 w-20" />
                      </td>
                      <td className="px-6 py-4">
                        <Skeleton className="h-5 w-20" />
                      </td>
                      <td className="px-6 py-4">
                        <Skeleton className="h-4 w-28" />
                      </td>
                      <td className="px-6 py-4">
                        <Skeleton className="h-4 w-28" />
                      </td>
                      <td className="px-6 py-4 text-right">
                        <Skeleton className="h-8 w-28 ml-auto" />
                      </td>
                    </tr>
                  ))}
                </>
              )}
              {!loading &&
                filteredTickets.map((ticket) => (
                  <tr
                    key={ticket.dbId}
                    className="border-b border-pop hover:bg-accent/30 transition-colors"
                  >
                    <td className="px-6 py-4 max-w-xs truncate">
                      <span className="font-medium text-foreground">
                        {ticket.subject}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      {ticket.customerName || "—"}
                    </td>
                    <td className="px-6 py-4">
                      <Badge className={getStatusColor(ticket.status)}>
                        {ticket.status.toUpperCase()}
                      </Badge>
                    </td>
                    <td className="px-6 py-4">
                      <Badge className={getPriorityColor(ticket.priority)}>
                        {ticket.priority.toUpperCase()}
                      </Badge>
                    </td>
                    <td className="px-6 py-4">
                      {formatDateTime(ticket.createdAt)}
                    </td>
                    <td className="px-6 py-4">
                      {ticket.resolvedAt ? formatDateTime(ticket.resolvedAt) : "—"}
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center justify-end">
                        <select
                          value={ticket.status}
                          onChange={(e) =>
                            handleUpdateStatus(
                              ticket,
                              e.target.value as TicketStatus
                            )
                          }
                          disabled={updatingStatusId === ticket.dbId}
                          className="border border-input bg-background px-2 py-1 text-[11px] uppercase tracking-wide"
                        >
                          <option value="open">Open</option>
                          <option value="in-progress">In Progress</option>
                          <option value="resolved">Resolved</option>
                        </select>
                      </div>
                    </td>
                  </tr>
                ))}
            </tbody>
          </table>
          </div>
        </Card>
        {!loading && filteredTickets.length === 0 && (
          <EmptyState
            variant="search"
            title={
              searchTerm || filterStatus !== "all" || filterPriority !== "all"
                ? "No matching tickets"
                : "No tickets yet"
            }
            description={
              searchTerm || filterStatus !== "all" || filterPriority !== "all"
                ? "Try adjusting your search, status, or priority filters."
                : "When customers raise issues, they'll appear here for follow-up."
            }
          />
        )}
      </div>
    </DashboardPageLayout>
  );
}

export default function SupportPage() {
  return (
    <Suspense fallback={null}>
      <SupportPageContent />
    </Suspense>
  );
}
