"use client";

import { Suspense, useEffect, useMemo, useState } from "react";
import { useSearchParams } from "next/navigation";
import DashboardPageLayout from "@/components/dashboard/layout";
import EmailIcon from "@/components/icons/email";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { supabase } from "@/lib/supabaseClient";
import { format } from "date-fns";
import { useToast } from "@/hooks/use-toast";
import { useChatState, WHATSAPP_CONVERSATION_ID } from "@/components/chat/use-chat-state";
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu";
import { MoreHorizontal } from "lucide-react";
import {
  invoiceSchema,
  type InvoiceFormValues,
  paymentSchema,
  type PaymentFormValues,
} from "@/lib/validations";

type InvoiceStatus = "paid" | "pending" | "overdue" | string;

interface UIInvoice {
  dbId: string;
  id: string;
  customerId: string | null;
  customerName: string;
  amount: number;
  status: InvoiceStatus;
  dueDate: string;
  shipments: number;
}

interface ARBucket {
  invoiceCount: number;
  invoiceAmount: number;
  outstanding: number;
}

interface ARSummary {
  totalInvoiced: number;
  totalPaid: number;
  totalOutstanding: number;
  buckets: {
    paid: ARBucket;
    pending: ARBucket;
    overdue: ARBucket;
    partially_paid: ARBucket;
    other: ARBucket;
  };
}

const formatDate = (value: string) => {
  if (!value) return "";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value;
  return format(date, "dd/MM/yyyy");
};

function InvoicesPageContent() {
  const searchParams = useSearchParams();
  const [searchTerm, setSearchTerm] = useState(
    () => searchParams.get("q") || ""
  );
  const [filterStatus, setFilterStatus] = useState<string>("all");
  const [invoices, setInvoices] = useState<UIInvoice[]>([]);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState<Record<string, boolean>>({});
  const [whatsAppSent, setWhatsAppSent] = useState<Record<string, boolean>>({});
  const [whatsAppStatuses, setWhatsAppStatuses] = useState<
    Record<string, { status: string; errorMessage: string | null; createdAt: string }>
  >({});
  const [twilioStatuses, setTwilioStatuses] = useState<
    Record<string, { status: string; errorMessage: string | null; createdAt: string }>
  >({});
  const [customers, setCustomers] = useState<{ id: string; name: string }[]>([]);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isCreating, setIsCreating] = useState(false);
  const [activeInvoice, setActiveInvoice] = useState<UIInvoice | null>(null);
  const [invoiceShipments, setInvoiceShipments] = useState<
    { id: string; shipmentRef: string }[]
  >([]);
  const [shipmentsLoading, setShipmentsLoading] = useState(false);
  const [linkingShipment, setLinkingShipment] = useState(false);
  const [newShipmentRef, setNewShipmentRef] = useState("");
  const [userRole, setUserRole] = useState<string | null>(null);
  const [roleLoaded, setRoleLoaded] = useState(false);
  const [previewInvoiceId, setPreviewInvoiceId] = useState<string | null>(null);
  const { toast } = useToast();
  const {
    chatState,
    logSystemMessage,
    toggleExpanded,
    setChatState,
  } = useChatState();

  const [editingInvoice, setEditingInvoice] = useState<UIInvoice | null>(null);

  const [paymentInvoice, setPaymentInvoice] = useState<UIInvoice | null>(null);
  const [isPaymentDialogOpen, setIsPaymentDialogOpen] = useState(false);
  const [payments, setPayments] = useState<
    {
      id: string;
      invoice_id: string;
      amount: number;
      payment_date: string | null;
      payment_mode: string | null;
      reference: string | null;
      created_by: string | null;
      created_at: string;
    }[]
  >([]);
  const [paymentsTotals, setPaymentsTotals] = useState<{
    invoiceTotal: number;
    totalPaid: number;
    outstanding: number;
    status: string;
  } | null>(null);
  const [paymentsLoading, setPaymentsLoading] = useState(false);
  const [isSavingPayment, setIsSavingPayment] = useState(false);
  const [arSummary, setArSummary] = useState<ARSummary | null>(null);
  const [arLoading, setArLoading] = useState(false);

  const form = useForm<InvoiceFormValues>({
    resolver: zodResolver(invoiceSchema),
    defaultValues: {
      invoiceRef: "",
      customerId: "",
      amount: 0,
      dueDate: "",
      status: "pending",
    },
  });

  useEffect(() => {
    let cancelled = false;

    async function loadArSummary() {
      setArLoading(true);
      try {
        const res = await fetch("/api/finance/ar");
        const json = await res.json();

        if (!res.ok) {
          throw new Error(
            typeof json?.error === "string"
              ? json.error
              : "Could not load AR summary."
          );
        }

        if (!cancelled) {
          setArSummary(json as ARSummary);
        }
      } catch (err) {
        if (!cancelled) {
          console.warn("Failed to load AR summary", err);
        }
      } finally {
        if (!cancelled) {
          setArLoading(false);
        }
      }
    }

    void loadArSummary();

    return () => {
      cancelled = true;
    };
  }, []);

  const paymentForm = useForm<PaymentFormValues>({
    resolver: zodResolver(paymentSchema),
    defaultValues: {
      invoiceId: "",
      amount: 0,
      paymentMode: "cash",
      paymentDate: "",
      reference: "",
    },
  });

  useEffect(() => {
    let cancelled = false;

    async function loadInvoices() {
      setLoading(true);
      try {
        const { data: invoiceRows, error: invoiceError } = await supabase
          .from("invoices")
          .select("id, invoice_ref, customer_id, amount, status, due_date");

        if (invoiceError) {
          console.error("Supabase invoices error", invoiceError.message);
          throw invoiceError;
        }

        const rows = (invoiceRows ?? []) as {
          id: string;
          invoice_ref: string | null;
          customer_id: string | null;
          amount: number | null;
          status: string | null;
          due_date: string | null;
        }[];

        const customersMap = new Map<string, { id: string; name: string | null }>();

        const shipmentsByInvoice = new Map<string, number>();

        try {
          const { data: customerRows, error: customersError } = await supabase
            .from("customers")
            .select("id, name");

          if (customersError) {
            console.warn(
              "Supabase customers for invoices error, skipping customer join",
              customersError.message
            );
          } else {
            (customerRows ?? []).forEach((c: any) => {
              customersMap.set(c.id, { id: c.id, name: c.name ?? "" });
            });

            setCustomers(
              (customerRows ?? []).map((c: any) => ({
                id: c.id,
                name: c.name ?? "",
              }))
            );
          }
        } catch (customersErr) {
          console.warn("Supabase customers for invoices error", customersErr);
        }

        const invoiceIds = rows.map((row) => row.id);

        if (invoiceIds.length > 0) {
          try {
            const { data: items, error: itemsError } = await supabase
              .from("invoice_items")
              .select("invoice_id, shipment_id")
              .in("invoice_id", invoiceIds);

            if (itemsError) {
              console.warn(
                "Supabase invoice_items error (shipments enrichment)",
                itemsError.message
              );
            } else {
              const map = new Map<string, Set<string>>();
              (items ?? []).forEach((item: any) => {
                const invoiceId = item.invoice_id as string | null;
                if (!invoiceId) return;
                const shipmentId = item.shipment_id as string | null;
                const set = map.get(invoiceId) ?? new Set<string>();
                if (shipmentId) {
                  set.add(shipmentId);
                }
                map.set(invoiceId, set);
              });

              map.forEach((set, invoiceId) => {
                shipmentsByInvoice.set(invoiceId, set.size);
              });
            }
          } catch (itemsErr) {
            console.warn("Supabase invoice_items error", itemsErr);
          }
        }

        const normalized: UIInvoice[] = rows.map((row) => {
          const customer = row.customer_id
            ? customersMap.get(row.customer_id)
            : undefined;

          return {
            dbId: row.id,
            id: row.invoice_ref ?? row.id,
            customerId: row.customer_id ?? null,
            customerName: customer?.name ?? "",
            amount: Number(row.amount ?? 0),
            status: (row.status ?? "pending") as InvoiceStatus,
            dueDate: row.due_date ?? "",
            shipments: shipmentsByInvoice.get(row.id) ?? 0,
          };
        });

        const invoiceIdsForStatuses = normalized.map((inv) => inv.dbId);
        try {
          if (invoiceIdsForStatuses.length > 0) {
            const res = await fetch("/api/whatsapp/statuses", {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({ invoiceIds: invoiceIdsForStatuses }),
            });
            const json = await res.json();

            if (!cancelled && res.ok && Array.isArray(json?.statuses)) {
              const map: Record<
                string,
                { status: string; errorMessage: string | null; createdAt: string }
              > = {};

              (json.statuses as any[]).forEach((s) => {
                const invoiceId = (s.invoice_id as string | null) ?? null;
                if (!invoiceId) return;
                map[invoiceId] = {
                  status: (s.status as string | null) ?? "",
                  errorMessage: (s.error_message as string | null) ?? null,
                  createdAt: (s.created_at as string | null) ?? "",
                };
              });

              setWhatsAppStatuses(map);
            }
          } else if (!cancelled) {
            setWhatsAppStatuses({});
          }
        } catch (statusesErr) {
          if (!cancelled) {
            console.warn("Failed to load WhatsApp statuses", statusesErr);
          }
        }

        if (cancelled) return;

        setInvoices(normalized);
        setLoading(false);
      } catch {
        if (cancelled) return;
        console.error("Failed to load invoices from Supabase");
        setInvoices([]);
        setLoading(false);
      }
    }

    loadInvoices();

    return () => {
      cancelled = true;
    };
  }, []);

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
        console.warn("Failed to load user role for invoices page", err);
        setUserRole(null);
        setRoleLoaded(true);
      }
    }

    loadUserRole();

    return () => {
      cancelled = true;
    };
  }, []);

  const filteredInvoices = useMemo(
    () =>
      invoices.filter((invoice) => {
        const matchesSearch =
          invoice.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
          invoice.customerName.toLowerCase().includes(searchTerm.toLowerCase());
        const matchesStatus =
          filterStatus === "all" || invoice.status === filterStatus;
        return matchesSearch && matchesStatus;
      }),
    [invoices, searchTerm, filterStatus]
  );

  const canEdit = userRole === "manager" || userRole === "admin";

  const handleDownload = async (invoice: UIInvoice) => {
    setActionLoading((prev) => ({ ...prev, [invoice.dbId]: true }));
    try {
      const downloadUrl = `/api/invoices/download?invoiceId=${encodeURIComponent(
        invoice.dbId
      )}`;

      const res = await fetch("/api/invoices/signed-url", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ invoiceId: invoice.dbId }),
      });
      const json = await res.json();

      if (res.ok && json?.signedUrl) {
        window.open(downloadUrl, "_blank");
        return;
      }

      const genRes = await fetch("/api/invoices/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ invoiceId: invoice.dbId }),
      });
      const genJson = await genRes.json();
      if (genRes.ok && genJson?.pdfUrl) {
        window.open(downloadUrl, "_blank");
        return;
      }

      const serverError =
        (typeof genJson?.error === "string" && genJson.error) ||
        (typeof json?.error === "string" && json.error) ||
        "Invoice PDF is not available right now. Check storage configuration or try again.";

      toast({
        title: "Invoice PDF not available",
        description: serverError,
        variant: "destructive",
      });
    } catch (error) {
      console.error("Failed to download invoice PDF", error);
      toast({
        title: "Invoice PDF error",
        description:
          (error as any)?.message ||
          "Something went wrong while preparing the invoice PDF.",
        variant: "destructive",
      });
    } finally {
      setActionLoading((prev) => ({ ...prev, [invoice.dbId]: false }));
    }
  };

  const handleExportInvoicesCsv = () => {
    if (!filteredInvoices.length) {
      toast({
        title: "No invoices to export",
        description:
          "Adjust filters so that at least one invoice is visible before exporting.",
        variant: "destructive",
      });
      return;
    }

    const headers = [
      "Invoice ID",
      "Customer",
      "Amount",
      "Status",
      "Due Date",
      "Shipments",
    ];

    const rows = filteredInvoices.map((inv) => [
      inv.id,
      inv.customerName,
      inv.amount,
      inv.status,
      inv.dueDate,
      inv.shipments,
    ]);

    const escapeCell = (value: unknown) => {
      const s = String(value ?? "");
      if (s.includes(",") || s.includes("\"") || s.includes("\n")) {
        return `"${s.replace(/"/g, '""')}"`;
      }
      return s;
    };

    const csv = [headers, ...rows]
      .map((row) => row.map(escapeCell).join(","))
      .join("\n");

    const blob = new Blob([csv], {
      type: "text/csv;charset=utf-8;",
    });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    const date = new Date().toISOString().slice(0, 10);
    link.href = url;
    link.download = `invoices-${date}.csv`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  const handleViewInvoice = (invoice: UIInvoice) => {
    setPreviewInvoiceId(invoice.dbId);
  };

  const handleDeleteInvoice = async (invoice: UIInvoice) => {
    if (!canEdit) {
      toast({
        title: "Insufficient permissions",
        description: "Only manager or admin users can delete invoices.",
        variant: "destructive",
      });
      return;
    }

    const confirmDelete = window.confirm(
      `Delete invoice ${invoice.id}? This action cannot be undone.`
    );
    if (!confirmDelete) return;

    setActionLoading((prev) => ({ ...prev, [invoice.dbId]: true }));
    try {
      // Best-effort: remove invoice_items first, then the invoice
      try {
        await supabase
          .from("invoice_items")
          .delete()
          .eq("invoice_id", invoice.dbId);
      } catch (err) {
        console.warn("Failed to delete invoice_items for invoice", err);
      }

      const { error } = await supabase
        .from("invoices")
        .delete()
        .eq("id", invoice.dbId);
      if (error) {
        throw error;
      }

      setInvoices((prev) => prev.filter((inv) => inv.dbId !== invoice.dbId));

      toast({
        title: "Invoice deleted",
        description: `Invoice ${invoice.id} has been removed.`,
      });
    } catch (err: any) {
      console.error("Failed to delete invoice", err);
      toast({
        title: "Could not delete invoice",
        description:
          err?.message || "Something went wrong while deleting the invoice.",
        variant: "destructive",
      });
    } finally {
      setActionLoading((prev) => {
        const next = { ...prev };
        delete next[invoice.dbId];
        return next;
      });
    }
  };

  const openManageShipments = async (invoice: UIInvoice) => {
    setActiveInvoice(invoice);
    setInvoiceShipments([]);
    setNewShipmentRef("");
    setShipmentsLoading(true);

    try {
      const { data: items, error: itemsError } = await supabase
        .from("invoice_items")
        .select("shipment_id")
        .eq("invoice_id", invoice.dbId);

      if (itemsError) {
        console.error(
          "Failed to load invoice_items for invoice",
          itemsError.message
        );
        return;
      }

      const shipmentIds = Array.from(
        new Set(
          ((items as any[]) ?? [])
            .map((row) => row.shipment_id as string | null)
            .filter((id): id is string => !!id)
        )
      );

      if (shipmentIds.length === 0) {
        setInvoiceShipments([]);
        return;
      }

      const { data: shipments, error: shipmentsError } = await supabase
        .from("shipments")
        .select("id, shipment_ref")
        .in("id", shipmentIds);

      if (shipmentsError) {
        console.error(
          "Failed to load shipments for invoice",
          shipmentsError.message
        );
        setInvoiceShipments([]);
        return;
      }

      const mapped =
        (shipments as any[] | null)?.map((s) => ({
          id: s.id as string,
          shipmentRef: (s.shipment_ref as string | null) ?? "",
        })) ?? [];

      setInvoiceShipments(mapped);
    } finally {
      setShipmentsLoading(false);
    }
  };

  const handleAddShipmentToInvoice = async () => {
    if (!activeInvoice) return;

    const trimmedRef = newShipmentRef.trim();
    if (!trimmedRef) return;

    setLinkingShipment(true);
    try {
      const { data: shipment, error: shipmentError } = await supabase
        .from("shipments")
        .select("id, shipment_ref, origin, destination, weight, service_type")
        .eq("shipment_ref", trimmedRef)
        .single();

      if (shipmentError || !shipment) {
        toast({
          title: "Shipment not found",
          description: "No shipment exists with that reference.",
          variant: "destructive",
        });
        return;
      }

      if (invoiceShipments.some((s) => s.id === (shipment.id as string))) {
        toast({
          title: "Already linked",
          description: "This shipment is already linked to the invoice.",
        });
        return;
      }

      let lineAmount = 0;

      try {
        const serviceType =
          ((shipment as any).service_type as string | null) ?? "standard";

        const { data: rate, error: rateError } = await supabase
          .from("rates")
          .select("rate_per_kg, base_fee, min_weight, service_type")
          .eq("origin", shipment.origin)
          .eq("destination", shipment.destination)
          .eq("service_type", serviceType)
          .maybeSingle();

        if (!rateError && rate) {
          const weight = Number((shipment as any).weight ?? 0);
          const baseFee = Number((rate as any).base_fee ?? 0);
          const ratePerKg = Number((rate as any).rate_per_kg ?? 0);
          const minWeight = Number((rate as any).min_weight ?? 0);
          const billableWeight = Math.max(weight, minWeight);
          lineAmount = baseFee + billableWeight * ratePerKg;
        }
      } catch (rateErr) {
        console.warn("Supabase rates lookup error", rateErr);
      }

      const { error: insertError } = await supabase
        .from("invoice_items")
        .insert({
          invoice_id: activeInvoice.dbId,
          shipment_id: shipment.id,
          amount: lineAmount || null,
        });

      if (insertError) {
        console.error(
          "Failed to link shipment to invoice",
          insertError.message
        );
        toast({
          title: "Could not link shipment",
          description: insertError.message,
          variant: "destructive",
        });
        return;
      }

      if (lineAmount > 0) {
        const currentInvoice = invoices.find(
          (inv) => inv.dbId === activeInvoice.dbId
        );
        const currentAmount = currentInvoice?.amount ?? 0;
        const nextAmount = currentAmount + lineAmount;

        try {
          const { error: updateError } = await supabase
            .from("invoices")
            .update({ amount: nextAmount })
            .eq("id", activeInvoice.dbId);

          if (updateError) {
            console.warn(
              "Failed to update invoice total after adding shipment",
              updateError.message
            );
          } else {
            setInvoices((prev) =>
              prev.map((inv) =>
                inv.dbId === activeInvoice.dbId
                  ? { ...inv, amount: nextAmount }
                  : inv
              )
            );
          }
        } catch (updateErr) {
          console.warn("Invoices total update error", updateErr);
        }
      }

      const updatedShipments = [
        ...invoiceShipments,
        {
          id: shipment.id as string,
          shipmentRef: (shipment.shipment_ref as string | null) ?? "",
        },
      ];
      setInvoiceShipments(updatedShipments);

      setInvoices((prev) =>
        prev.map((inv) =>
          inv.dbId === activeInvoice.dbId
            ? { ...inv, shipments: inv.shipments + 1 }
            : inv
        )
      );

      setNewShipmentRef("");

      if (lineAmount > 0) {
        toast({
          title: "Shipment linked with charges",
          description: `Shipment has been added with line amount ${lineAmount.toLocaleString("en-IN")}.`,
        });
      } else {
        toast({
          title: "Shipment linked",
          description:
            "Shipment has been added, but no matching rate was found for auto-pricing.",
        });
      }
    } catch (err: any) {
      console.error("Failed to add shipment to invoice", err);
      toast({
        title: "Could not link shipment",
        description:
          err?.message || "Something went wrong while linking the shipment.",
        variant: "destructive",
      });
    } finally {
      setLinkingShipment(false);
    }
  };

  const openPayments = async (invoice: UIInvoice) => {
    if (!canEdit) {
      toast({
        title: "Insufficient permissions",
        description: "Only manager or admin users can record payments.",
        variant: "destructive",
      });
      return;
    }

    setPaymentInvoice(invoice);
    setIsPaymentDialogOpen(true);
    setPayments([]);
    setPaymentsTotals(null);
    setPaymentsLoading(true);

    try {
      const res = await fetch(
        `/api/payments?invoiceId=${encodeURIComponent(invoice.dbId)}`
      );
      const json = await res.json();

      if (!res.ok) {
        throw new Error(
          typeof json?.error === "string"
            ? json.error
            : "Could not load payments for this invoice."
        );
      }

      setPayments(
        ((json?.payments as any[]) ?? []).map((p) => ({
          id: p.id as string,
          invoice_id: p.invoice_id as string,
          amount: Number(p.amount ?? 0),
          payment_date: (p.payment_date as string | null) ?? null,
          payment_mode: (p.payment_mode as string | null) ?? null,
          reference: (p.reference as string | null) ?? null,
          created_by: (p.created_by as string | null) ?? null,
          created_at: p.created_at as string,
        }))
      );

      if (json?.totals) {
        setPaymentsTotals({
          invoiceTotal: Number(json.totals.invoiceTotal ?? invoice.amount),
          totalPaid: Number(json.totals.totalPaid ?? 0),
          outstanding: Number(
            json.totals.outstanding ??
              Number(json.totals.invoiceTotal ?? invoice.amount) -
                Number(json.totals.totalPaid ?? 0)
          ),
          status: (json.totals.status as string) ?? invoice.status,
        });

        paymentForm.reset({
          invoiceId: invoice.dbId,
          amount:
            Number(
              json.totals.outstanding ??
                Number(json.totals.invoiceTotal ?? invoice.amount) -
                  Number(json.totals.totalPaid ?? 0)
            ) || 0,
          paymentMode: "cash",
          paymentDate: "",
          reference: "",
        });
      } else {
        paymentForm.reset({
          invoiceId: invoice.dbId,
          amount: invoice.amount,
          paymentMode: "cash",
          paymentDate: "",
          reference: "",
        });
      }
    } catch (err: any) {
      console.error("Failed to load payments", err);
      toast({
        title: "Could not load payments",
        description:
          err?.message || "Something went wrong while loading payments.",
        variant: "destructive",
      });
      setIsPaymentDialogOpen(false);
      setPaymentInvoice(null);
    } finally {
      setPaymentsLoading(false);
    }
  };

  const handleSubmitPayment = async (values: PaymentFormValues) => {
    if (!paymentInvoice) return;

    if (!canEdit) {
      toast({
        title: "Insufficient permissions",
        description: "Only manager or admin users can record payments.",
        variant: "destructive",
      });
      return;
    }

    setIsSavingPayment(true);
    try {
      const payload: any = {
        invoiceId: paymentInvoice.dbId,
        amount: values.amount,
        paymentMode: values.paymentMode,
      };

      if (values.paymentDate) {
        payload.paymentDate = values.paymentDate;
      }

      if (values.reference) {
        payload.reference = values.reference;
      }

      const res = await fetch("/api/payments", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const json = await res.json();

      if (!res.ok) {
        throw new Error(
          typeof json?.error === "string"
            ? json.error
            : "Could not record payment right now."
        );
      }

      const payment = json.payment as any;
      const totals = json.totals as {
        invoiceTotal: number;
        totalPaid: number;
        outstanding: number;
        status: string;
      };

      setPayments((prev) => [
        ...prev,
        {
          id: payment.id as string,
          invoice_id: payment.invoice_id as string,
          amount: Number(payment.amount ?? values.amount),
          payment_date: (payment.payment_date as string | null) ?? null,
          payment_mode: (payment.payment_mode as string | null) ?? null,
          reference: (payment.reference as string | null) ?? null,
          created_by: (payment.created_by as string | null) ?? null,
          created_at: payment.created_at as string,
        },
      ]);

      if (totals) {
        setPaymentsTotals({
          invoiceTotal: Number(totals.invoiceTotal ?? 0),
          totalPaid: Number(totals.totalPaid ?? 0),
          outstanding: Number(totals.outstanding ?? 0),
          status: totals.status,
        });

        setInvoices((prev) =>
          prev.map((inv) =>
            inv.dbId === paymentInvoice.dbId
              ? { ...inv, status: totals.status as InvoiceStatus }
              : inv
          )
        );
      }

      toast({
        title: "Payment recorded",
        description: "The payment has been added to the invoice ledger.",
      });

      paymentForm.reset({
        invoiceId: paymentInvoice.dbId,
        amount: totals?.outstanding ?? 0,
        paymentMode: values.paymentMode,
        paymentDate: "",
        reference: "",
      });
    } catch (err: any) {
      console.error("Failed to record payment", err);
      toast({
        title: "Could not record payment",
        description:
          err?.message || "Something went wrong while recording the payment.",
        variant: "destructive",
      });
    } finally {
      setIsSavingPayment(false);
    }
  };

  const handleWhatsAppSend = async (invoice: UIInvoice) => {
    setActionLoading((prev) => ({ ...prev, [invoice.dbId]: true }));
    try {
      if (chatState.state === "collapsed") {
        toggleExpanded();
      }

      const customerLabel = invoice.customerName || "Unknown customer";
      const amountDisplay = `₹${invoice.amount.toLocaleString("en-IN")}`;

      logSystemMessage(
        WHATSAPP_CONVERSATION_ID,
        `Preparing WhatsApp send for invoice ${invoice.id} (${customerLabel}) for ${amountDisplay}.`
      );

      setChatState({
        state: "conversation",
        activeConversation: WHATSAPP_CONVERSATION_ID,
      });

      const res = await fetch("/api/whatsapp/send", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ invoiceId: invoice.dbId, mode: "prod" }),
      });
      const json = await res.json();

      const serverNote = typeof json?.note === "string" ? json.note : undefined;
      const serverPhone =
        typeof json?.phone === "string" && json.phone ? json.phone : undefined;

      if (json?.waUrl) {
        window.open(json.waUrl, "_blank");
        logSystemMessage(
          WHATSAPP_CONVERSATION_ID,
          `Opened WhatsApp Web for invoice ${invoice.id} (${customerLabel}) for ${amountDisplay} to ${serverPhone || "customer phone"}. Complete the send in the new tab.`
        );
        if (serverNote) {
          logSystemMessage(
            WHATSAPP_CONVERSATION_ID,
            `Server note: ${serverNote}`
          );
        }
        if (json?.signedUrl) {
          logSystemMessage(
            WHATSAPP_CONVERSATION_ID,
            `Invoice PDF (temporary link): ${json.signedUrl}`
          );
        }
        setWhatsAppSent((prev) => ({ ...prev, [invoice.dbId]: true }));
        setWhatsAppStatuses((prev) => ({
          ...prev,
          [invoice.dbId]: {
            status: "mvp_redirect",
            errorMessage: null,
            createdAt: new Date().toISOString(),
          },
        }));
        return;
      }

      if (json?.success) {
        const result: any = (json as any).result;
        const messageId: string | undefined =
          result?.messages?.[0]?.id ?? result?.messages?.[0]?.message_id;

        logSystemMessage(
          WHATSAPP_CONVERSATION_ID,
          messageId
            ? `WhatsApp document message sent for invoice ${invoice.id} (${customerLabel}) for ${amountDisplay} to ${serverPhone || "customer phone"}. Provider message id: ${messageId}.`
            : `WhatsApp document message sent for invoice ${invoice.id} (${customerLabel}) for ${amountDisplay} to ${serverPhone || "customer phone"}.`
        );
        if (serverNote) {
          logSystemMessage(
            WHATSAPP_CONVERSATION_ID,
            `Server note: ${serverNote}`
          );
        }
        toast({
          title: "WhatsApp sent",
          description: `Invoice ${invoice.id} was sent via WhatsApp.`,
        });
        setWhatsAppSent((prev) => ({ ...prev, [invoice.dbId]: true }));
        setWhatsAppStatuses((prev) => ({
          ...prev,
          [invoice.dbId]: {
            status: "success",
            errorMessage: null,
            createdAt: new Date().toISOString(),
          },
        }));
        return;
      }

      if (json?.error) {
        logSystemMessage(
          WHATSAPP_CONVERSATION_ID,
          `WhatsApp send failed for invoice ${invoice.id} (${customerLabel}) for ${amountDisplay} to ${serverPhone || "customer phone"}: ${json.error}`
        );
        if (serverNote) {
          logSystemMessage(
            WHATSAPP_CONVERSATION_ID,
            `Server note: ${serverNote}`
          );
        }
        toast({
          title: "WhatsApp error",
          description:
            json.error || "Something went wrong while sending via WhatsApp.",
          variant: "destructive",
        });
        setWhatsAppStatuses((prev) => ({
          ...prev,
          [invoice.dbId]: {
            status: "error",
            errorMessage:
              (typeof json.error === "string" && json.error) ||
              "WhatsApp error",
            createdAt: new Date().toISOString(),
          },
        }));
        return;
      }

      logSystemMessage(
        WHATSAPP_CONVERSATION_ID,
        `Received unexpected response while sending invoice ${invoice.id} via WhatsApp.`
      );
      setWhatsAppStatuses((prev) => ({
        ...prev,
        [invoice.dbId]: {
          status: "error",
          errorMessage: "Unexpected WhatsApp response",
          createdAt: new Date().toISOString(),
        },
      }));
    } catch (error: any) {
      console.error("Failed to send via WhatsApp", error);
      logSystemMessage(
        WHATSAPP_CONVERSATION_ID,
        `Unexpected error while sending invoice ${invoice.id} via WhatsApp: ${error?.message || "Unknown error"}.`
      );
      toast({
        title: "WhatsApp error",
        description:
          error?.message || "Something went wrong while sending via WhatsApp.",
        variant: "destructive",
      });
      setWhatsAppStatuses((prev) => ({
        ...prev,
        [invoice.dbId]: {
          status: "error",
          errorMessage:
            (error?.message as string | undefined) ||
            "Unexpected WhatsApp error",
          createdAt: new Date().toISOString(),
        },
      }));
    } finally {
      setActionLoading((prev) => ({ ...prev, [invoice.dbId]: false }));
    }
  };

  const handleTwilioSmsSend = async (invoice: UIInvoice) => {
    setActionLoading((prev) => ({ ...prev, [invoice.dbId]: true }));
    try {
      const customerLabel = invoice.customerName || "Unknown customer";
      const amountDisplay = `₹${invoice.amount.toLocaleString("en-IN")}`;

      const res = await fetch("/api/twilio/invoice/send", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ invoiceId: invoice.dbId }),
      });
      const json = await res.json();

      if (!res.ok || !json?.success) {
        const message =
          (typeof json?.error === "string" && json.error) ||
          "Could not send SMS right now.";
        setTwilioStatuses((prev) => ({
          ...prev,
          [invoice.dbId]: {
            status: "error",
            errorMessage: message,
            createdAt: new Date().toISOString(),
          },
        }));
        toast({
          title: "SMS error",
          description: message,
          variant: "destructive",
        });
        return;
      }

      const serverTo =
        (typeof json?.to === "string" && json.to) || customerLabel;

      setTwilioStatuses((prev) => ({
        ...prev,
        [invoice.dbId]: {
          status: "success",
          errorMessage: null,
          createdAt: new Date().toISOString(),
        },
      }));

      toast({
        title: "SMS sent",
        description: `Invoice ${invoice.id} was sent via SMS to ${serverTo}.`,
      });
    } catch (error: any) {
      console.error("Failed to send invoice via Twilio SMS", error);
      toast({
        title: "SMS error",
        description:
          error?.message || "Something went wrong while sending the SMS.",
        variant: "destructive",
      });
      setTwilioStatuses((prev) => ({
        ...prev,
        [invoice.dbId]: {
          status: "error",
          errorMessage:
            (error?.message as string | undefined) ||
            "Unexpected SMS error",
          createdAt: new Date().toISOString(),
        },
      }));
    } finally {
      setActionLoading((prev) => ({ ...prev, [invoice.dbId]: false }));
    }
  };

  const handleSubmitInvoice = async (values: InvoiceFormValues) => {
    if (!canEdit) {
      toast({
        title: "Insufficient permissions",
        description: "Only manager or admin users can create invoices.",
        variant: "destructive",
      });
      return;
    }

    setIsCreating(true);
    try {
      const payload = {
        invoice_ref: values.invoiceRef.trim(),
        customer_id: values.customerId,
        amount: values.amount,
        status: values.status,
        invoice_date: new Date().toISOString(),
        due_date: values.dueDate || null,
      };

      if (editingInvoice) {
        const { data, error } = await supabase
          .from("invoices")
          .update({
            invoice_ref: payload.invoice_ref,
            customer_id: payload.customer_id,
            amount: payload.amount,
            status: payload.status,
            due_date: payload.due_date,
          })
          .eq("id", editingInvoice.dbId)
          .select("id, invoice_ref, customer_id, amount, status, due_date")
          .maybeSingle();

        if (error || !data) {
          throw error || new Error("Failed to update invoice");
        }

        const customer = customers.find((c) => c.id === data.customer_id) || null;

        const updated: UIInvoice = {
          dbId: data.id,
          id: data.invoice_ref ?? data.id,
          customerId: data.customer_id ?? null,
          customerName: customer?.name ?? "",
          amount: Number(data.amount ?? 0),
          status: (data.status ?? "pending") as InvoiceStatus,
          dueDate: data.due_date ?? "",
          shipments: editingInvoice.shipments,
        };

        setInvoices((prev) =>
          prev.map((inv) =>
            inv.dbId === updated.dbId ? updated : inv
          )
        );

        toast({
          title: "Invoice updated",
          description: `Invoice ${updated.id} has been updated.`,
        });
      } else {
        const { data, error } = await supabase
          .from("invoices")
          .insert(payload)
          .select("id, invoice_ref, customer_id, amount, status, due_date")
          .single();

        if (error || !data) {
          throw error || new Error("Failed to create invoice");
        }

        const customer = customers.find((c) => c.id === data.customer_id) || null;

        const newInvoice: UIInvoice = {
          dbId: data.id,
          id: data.invoice_ref ?? data.id,
          customerId: data.customer_id ?? null,
          customerName: customer?.name ?? "",
          amount: Number(data.amount ?? 0),
          status: (data.status ?? "pending") as InvoiceStatus,
          dueDate: data.due_date ?? "",
          shipments: 0,
        };

        setInvoices((prev) => [newInvoice, ...prev]);

        toast({
          title: "Invoice created",
          description: `Invoice ${newInvoice.id} has been created.`,
        });
      }

      setIsDialogOpen(false);
      setEditingInvoice(null);
      form.reset({
        invoiceRef: "",
        customerId: "",
        amount: 0,
        dueDate: "",
        status: "pending",
      });
    } catch (err: any) {
      console.error("Failed to save invoice", err);
      toast({
        title: "Could not save invoice",
        description:
          err?.message || "Something went wrong while saving the invoice.",
        variant: "destructive",
      });
    } finally {
      setIsCreating(false);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "paid":
        return "bg-green-500/20 text-green-400";
      case "pending":
        return "bg-yellow-500/20 text-yellow-400";
      case "overdue":
        return "bg-red-500/20 text-red-400";
      case "partially_paid":
        return "bg-blue-500/20 text-blue-400";
      default:
        return "bg-gray-500/20 text-gray-400";
    }
  };

  const renderWhatsAppStatus = (invoiceId: string) => {
    const info = whatsAppStatuses[invoiceId];
    if (!info) return null;

    const label =
      info.status === "success"
        ? "WhatsApp: SENT"
        : info.status === "mvp_redirect"
        ? "WhatsApp: PREPARED"
        : info.status === "error"
        ? "WhatsApp: ERROR"
        : `WhatsApp: ${info.status.toUpperCase()}`;

    const color =
      info.status === "success"
        ? "text-emerald-500"
        : info.status === "mvp_redirect"
        ? "text-sky-500"
        : info.status === "error"
        ? "text-destructive"
        : "text-muted-foreground";

    return (
      <span className={`text-[10px] uppercase mt-0.5 ${color}`}>
        {label}
      </span>
    );
  };

  const renderSmsStatus = (invoiceId: string) => {
    const info = twilioStatuses[invoiceId];
    if (!info) return null;

    const label =
      info.status === "success"
        ? "SMS: SENT"
        : info.status === "error"
        ? "SMS: ERROR"
        : `SMS: ${info.status.toUpperCase()}`;

    const color =
      info.status === "success"
        ? "text-emerald-500"
        : info.status === "error"
        ? "text-destructive"
        : "text-muted-foreground";

    return (
      <span className={`text-[10px] uppercase mt-0.5 ${color}`}>
        {label}
      </span>
    );
  };

  const handleCopyTrackingLink = async (shipmentRef: string) => {
    const trimmedRef = shipmentRef.trim();
    if (!trimmedRef) {
      toast({
        title: "Tracking link unavailable",
        description: "This shipment does not have a valid reference.",
        variant: "destructive",
      });
      return;
    }

    const origin =
      typeof window !== "undefined" && window.location?.origin
        ? window.location.origin
        : "";

    if (!origin) {
      toast({
        title: "Could not copy link",
        description: "Tracking link could not be generated in this environment.",
        variant: "destructive",
      });
      return;
    }

    const url = `${origin}/track?ref=${encodeURIComponent(trimmedRef)}`;

    try {
      if (navigator?.clipboard?.writeText) {
        await navigator.clipboard.writeText(url);
      }
      toast({
        title: "Tracking link copied",
        description: url,
      });
    } catch (err) {
      console.error("Failed to copy tracking link", err);
      toast({
        title: "Could not copy link",
        description: `Please copy it manually: ${url}`,
        variant: "destructive",
      });
    }
  };

  return (
    <DashboardPageLayout
      header={{
        title: "Invoices",
        description: "Track billing and payment status",
        icon: EmailIcon,
      }}
    >
      <div className="flex flex-col gap-6">
        {arSummary && (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <Card className="p-3 border-pop bg-background/60">
              <p className="text-xs text-muted-foreground">Total invoiced</p>
              <p className="text-lg font-semibold">
                ₹{arSummary.totalInvoiced.toLocaleString("en-IN")}
              </p>
            </Card>
            <Card className="p-3 border-pop bg-background/60">
              <p className="text-xs text-muted-foreground">Total paid</p>
              <p className="text-lg font-semibold text-emerald-400">
                ₹{arSummary.totalPaid.toLocaleString("en-IN")}
              </p>
            </Card>
            <Card className="p-3 border-pop bg-background/60">
              <p className="text-xs text-muted-foreground">Outstanding</p>
              <p className="text-lg font-semibold text-yellow-400">
                ₹{arSummary.totalOutstanding.toLocaleString("en-IN")}
              </p>
            </Card>
            <Card className="p-3 border-pop bg-background/60">
              <p className="text-xs text-muted-foreground">Overdue AR</p>
              <p className="text-lg font-semibold text-red-400">
                ₹{arSummary.buckets.overdue.outstanding.toLocaleString("en-IN")}
              </p>
            </Card>
          </div>
        )}
        {/* Search and Filters */}
        <div className="flex gap-4 flex-col sm:flex-row items-end">
          <div className="flex-1">
            <label className="text-sm font-medium mb-2 block">Search</label>
            <Input
              placeholder="Search by invoice ID or customer name..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="bg-input text-foreground"
            />
          </div>
          <div>
            <label className="text-sm font-medium mb-2 block">Status</label>
            <Select
              value={filterStatus}
              onValueChange={(value) => setFilterStatus(value)}
            >
              <SelectTrigger className="w-[160px]">
                <SelectValue placeholder="All Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Status</SelectItem>
                <SelectItem value="paid">Paid</SelectItem>
                <SelectItem value="pending">Pending</SelectItem>
                <SelectItem value="overdue">Overdue</SelectItem>
                <SelectItem value="partially_paid">Partially Paid</SelectItem>
              </SelectContent>
            </Select>
          </div>
          {roleLoaded && !canEdit && (
            <p className="text-[11px] text-muted-foreground max-w-xs">
              You have read-only billing access. Contact an admin to create invoices.
            </p>
          )}
          <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
            <Button
              type="button"
              className="bg-primary hover:bg-primary/90"
              disabled={!canEdit}
              onClick={() => {
                if (!canEdit) return;
                setEditingInvoice(null);
                form.reset({
                  invoiceRef: "",
                  customerId: "",
                  amount: 0,
                  dueDate: "",
                  status: "pending",
                });
                setIsDialogOpen(true);
              }}
            >
              New Invoice
            </Button>
            <Button
              type="button"
              variant="outline"
              className="ml-0 sm:ml-2 mt-2 sm:mt-0"
              onClick={handleExportInvoicesCsv}
            >
              Export CSV
            </Button>

            <DialogContent>
              <DialogHeader>
                <DialogTitle>{editingInvoice ? "Edit invoice" : "New invoice"}</DialogTitle>
                <DialogDescription>
                  {editingInvoice
                    ? "Update invoice details such as reference, customer, amount, and status."
                    : "Create a new invoice for a customer shipment or billing cycle."}
                </DialogDescription>
              </DialogHeader>

              <Form {...form}>
                <form
                  className="space-y-4 mt-2"
                  onSubmit={form.handleSubmit(handleSubmitInvoice)}
                >
                  <FormField
                    control={form.control}
                    name="invoiceRef"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Invoice reference</FormLabel>
                        <FormControl>
                          <Input
                            placeholder="e.g. TG-INV-2024-0001"
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
                          <Select
                            value={field.value}
                            onValueChange={field.onChange}
                          >
                            <SelectTrigger className="w-full">
                              <SelectValue placeholder="Select customer..." />
                            </SelectTrigger>
                            <SelectContent>
                              {customers.map((c) => (
                                <SelectItem key={c.id} value={c.id}>
                                  {c.name}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <FormField
                      control={form.control}
                      name="amount"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Amount (₹)</FormLabel>
                          <FormControl>
                            <Input
                              type="number"
                              min="0"
                              step="0.01"
                              placeholder="e.g. 2500"
                              {...field}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="dueDate"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Due date</FormLabel>
                          <FormControl>
                            <Input type="date" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>

                  <FormField
                    control={form.control}
                    name="status"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Status</FormLabel>
                        <FormControl>
                          <Select
                            value={field.value}
                            onValueChange={field.onChange}
                          >
                            <SelectTrigger className="w-full">
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="pending">Pending</SelectItem>
                              <SelectItem value="paid">Paid</SelectItem>
                              <SelectItem value="overdue">Overdue</SelectItem>
                            </SelectContent>
                          </Select>
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
                      disabled={isCreating || !canEdit}
                    >
                      {isCreating
                        ? editingInvoice
                          ? "Saving..."
                          : "Creating..."
                        : editingInvoice
                        ? "Save changes"
                        : "Create invoice"}
                    </Button>
                  </DialogFooter>
                </form>
              </Form>
            </DialogContent>
          </Dialog>
        </div>

        {/* Invoices Table */}
        <Card className="overflow-hidden border-pop">
          <table className="w-full text-sm">
            <thead className="bg-accent/50 border-b border-pop">
              <tr>
                <th className="px-6 py-3 text-left font-semibold">Invoice ID</th>
                <th className="px-6 py-3 text-left font-semibold">Customer</th>
                <th className="px-6 py-3 text-left font-semibold">Amount</th>
                <th className="px-6 py-3 text-left font-semibold">Status</th>
                <th className="px-6 py-3 text-left font-semibold">Due Date</th>
                <th className="px-6 py-3 text-left font-semibold">Shipments</th>
                <th className="px-6 py-3 text-left font-semibold text-right">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredInvoices.map((invoice) => (
                <tr
                  key={invoice.id}
                  className="border-b border-pop hover:bg-accent/30 transition-colors"
                >
                  <td className="px-6 py-4 font-mono text-primary">
                    <div className="flex flex-col">
                      <span>{invoice.id}</span>
                      {renderWhatsAppStatus(invoice.dbId)}
                      {renderSmsStatus(invoice.dbId)}
                    </div>
                  </td>
                  <td className="px-6 py-4">{invoice.customerName}</td>
                  <td className="px-6 py-4 font-semibold">
                    ₹{invoice.amount.toLocaleString()}
                  </td>
                  <td className="px-6 py-4">
                    <Badge className={getStatusColor(invoice.status)}>
                      {invoice.status.toUpperCase()}
                    </Badge>
                  </td>
                  <td className="px-6 py-4">
                    {formatDate(invoice.dueDate)}
                  </td>
                  <td className="px-6 py-4 text-center">{invoice.shipments}</td>
                  <td className="px-6 py-4">
                    <div className="flex items-center justify-end">
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button
                            variant="outline"
                            size="icon"
                            className="h-8 w-8 p-0"
                          >
                            <MoreHorizontal className="h-4 w-4" />
                            <span className="sr-only">Open actions</span>
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem
                            onClick={() => openManageShipments(invoice)}
                          >
                            Shipments
                          </DropdownMenuItem>
                          <DropdownMenuItem
                            onClick={() => handleViewInvoice(invoice)}
                          >
                            View invoice
                          </DropdownMenuItem>
                          <DropdownMenuItem
                            onClick={() => handleDownload(invoice)}
                            disabled={!!actionLoading[invoice.dbId]}
                          >
                            {actionLoading[invoice.dbId]
                              ? "Preparing PDF..."
                              : "Download PDF"}
                          </DropdownMenuItem>
                          <DropdownMenuItem
                            onClick={() => openPayments(invoice)}
                            disabled={!canEdit}
                          >
                            Record payment
                          </DropdownMenuItem>
                          <DropdownMenuSeparator />
                          <DropdownMenuItem
                            onClick={() => {
                              setEditingInvoice(invoice);
                              form.reset({
                                invoiceRef: invoice.id,
                                customerId: invoice.customerId ?? "",
                                amount: invoice.amount,
                                dueDate: invoice.dueDate
                                  ? invoice.dueDate.slice(0, 10)
                                  : "",
                                status:
                                  (invoice.status as "pending" | "paid" | "overdue") ??
                                  "pending",
                              });
                              setIsDialogOpen(true);
                            }}
                            disabled={!canEdit}
                          >
                            Edit
                          </DropdownMenuItem>
                          <DropdownMenuItem
                            onClick={() => handleWhatsAppSend(invoice)}
                            disabled={!!actionLoading[invoice.dbId]}
                          >
                            {actionLoading[invoice.dbId]
                              ? "Sending via WhatsApp..."
                              : "Send via WhatsApp"}
                          </DropdownMenuItem>
                          <DropdownMenuItem
                            onClick={() => handleTwilioSmsSend(invoice)}
                            disabled={!!actionLoading[invoice.dbId]}
                          >
                            {actionLoading[invoice.dbId]
                              ? "Sending SMS..."
                              : "Send via SMS"}
                          </DropdownMenuItem>
                          <DropdownMenuItem
                            variant="destructive"
                            onClick={() => handleDeleteInvoice(invoice)}
                            disabled={!!actionLoading[invoice.dbId] || !canEdit}
                          >
                            Delete
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </Card>

        {filteredInvoices.length === 0 && (
          <Card className="p-12 text-center border-pop">
            <p className="text-muted-foreground">No invoices found</p>
          </Card>
        )}

        <Dialog
          open={!!activeInvoice}
          onOpenChange={(open) => {
            if (!open) {
              setActiveInvoice(null);
              setInvoiceShipments([]);
              setNewShipmentRef("");
              setShipmentsLoading(false);
              setLinkingShipment(false);
            }
          }}
        >
          <DialogContent>
            <DialogHeader>
              <DialogTitle>
                {activeInvoice
                  ? `Manage shipments · ${activeInvoice.id}`
                  : "Manage shipments"}
              </DialogTitle>
              <DialogDescription>
                Link shipments to this invoice using their shipment reference.
              </DialogDescription>
            </DialogHeader>

            <div className="space-y-4">
              <div className="space-y-2">
                <p className="text-xs text-muted-foreground">Linked shipments</p>
                {shipmentsLoading ? (
                  <p className="text-xs text-muted-foreground">
                    Loading shipments...
                  </p>
                ) : invoiceShipments.length === 0 ? (
                  <p className="text-xs text-muted-foreground">
                    No shipments linked yet.
                  </p>
                ) : (
                  <ul className="space-y-1 text-sm max-h-40 overflow-y-auto">
                    {invoiceShipments.map((s) => (
                      <li
                        key={s.id}
                        className="flex items-center justify-between border-b border-border/40 last:border-b-0 py-1"
                      >
                        <span className="font-mono text-xs">
                          {s.shipmentRef}
                        </span>
                        <Button
                          type="button"
                          variant="outline"
                          size="sm"
                          className="ml-2 h-7 px-2 text-[10px] uppercase"
                          onClick={() => handleCopyTrackingLink(s.shipmentRef)}
                        >
                          Copy link
                        </Button>
                      </li>
                    ))}
                  </ul>
                )}
              </div>

              <div className="space-y-2">
                <p className="text-xs text-muted-foreground">
                  Add shipment by reference
                </p>
                <div className="flex gap-2">
                  <Input
                    placeholder="Enter shipment reference..."
                    value={newShipmentRef}
                    onChange={(e) => setNewShipmentRef(e.target.value)}
                    className="flex-1"
                  />
                  <Button
                    type="button"
                    className="bg-primary hover:bg-primary/90"
                    disabled={linkingShipment || !newShipmentRef.trim()}
                    onClick={handleAddShipmentToInvoice}
                  >
                    {linkingShipment ? "Adding..." : "Add"}
                  </Button>
                </div>
              </div>
            </div>
          </DialogContent>
        </Dialog>

        {previewInvoiceId && (
          <div className="fixed inset-0 z-40 flex items-center justify-center bg-black/60">
            <div className="relative bg-background rounded-lg shadow-xl w-[95vw] max-w-5xl h-[80vh] border">
              <button
                type="button"
                className="absolute top-3 right-3 inline-flex h-7 w-7 items-center justify-center rounded-full bg-black/40 text-white text-xs hover:bg-black/60"
                onClick={() => setPreviewInvoiceId(null)}
              >
                ×
              </button>
              <div className="w-full h-full rounded-md overflow-hidden">
                <iframe
                  src={`/invoices/${previewInvoiceId}`}
                  className="w-full h-full"
                />
              </div>
            </div>
          </div>
        )}
      </div>
    </DashboardPageLayout>
  );
}
export default function InvoicesPage() {
  return (
    <Suspense fallback={null}>
      <InvoicesPageContent />
    </Suspense>
  );
}
