"use client";

import { Suspense, useEffect, useMemo, useState, useTransition } from "react";
import { useSearchParams } from "next/navigation";
import DashboardPageLayout from "@/components/dashboard/layout";
import EmailIcon from "@/components/icons/email";
import GearIcon from "@/components/icons/gear";
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
} from "@/lib/validations";
import { EmptyState } from "@/components/ui/empty-state";
import { Skeleton } from "@/components/ui/skeleton";
import { InvoicePreview } from "@/components/invoices/invoice-preview";
import type { InvoiceStatus, UIInvoice, ARSummary } from "@/features/invoices/types";
import { ArSummaryCards } from "@/features/invoices/ar-summary-cards";
import { InvoicesTable } from "@/features/invoices/invoices-table";
import { ManageShipmentsDialog } from "@/features/invoices/manage-shipments-dialog";
import { InvoiceDialog } from "@/features/invoices/invoice-dialog";

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

  const [editingInvoice, setEditingInvoice] = useState<UIInvoice | null>(null);
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

  useEffect(() => {
    let cancelled = false;

    async function loadInvoices() {
      setLoading(true);
      try {
        // Optimize: Fetch invoices and customers in parallel
        const [invoicesResult, customersResult] = await Promise.all([
          supabase
            .from("invoices")
            .select("id, invoice_ref, customer_id, amount, status, due_date")
            .order("created_at", { ascending: false }), // Add consistent ordering
          supabase
            .from("customers")
            .select("id, name")
        ]);

        const { data: invoiceRows, error: invoiceError } = invoicesResult;
        const { data: customerRows, error: customersError } = customersResult;

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

  const canEdit = true; // Force enable for testing
  // const canEdit = userRole === "manager" || userRole === "admin";

  const handleDownload = async (invoice: UIInvoice) => {
    setActionLoading((prev) => ({ ...prev, [invoice.dbId]: true }));
    try {
      // Always regenerate PDF to ensure latest design is used
      const genRes = await fetch("/api/invoices/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ invoiceId: invoice.dbId }),
      });

      const genJson = await genRes.json();

      if (!genRes.ok || !genJson?.success) {
        throw new Error(genJson?.error || "Failed to generate PDF");
      }

      const pdfPath: string | undefined =
        typeof genJson.pdfPath === "string" ? genJson.pdfPath : undefined;

      const params = new URLSearchParams({
        invoiceId: invoice.dbId,
        t: String(Date.now()),
      });

      if (pdfPath) {
        params.append("path", pdfPath);
      }

      // Download the freshly generated PDF as a blob with cache busting
      const downloadRes = await fetch(
        `/api/invoices/download?${params.toString()}`
      );

      if (!downloadRes.ok) {
        throw new Error("Failed to download PDF");
      }

      const blob = await downloadRes.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `Invoice-${invoice.id}.pdf`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);

      toast({
        title: "Downloaded",
        description: "Invoice PDF downloaded successfully",
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
        icon: GearIcon,
      }}
    >
      <div className="flex flex-col gap-6">
        {arSummary && <ArSummaryCards arSummary={arSummary} />}
        {/* Search and Filters */}
        <div className="flex gap-4 flex-col sm:flex-row items-start sm:items-end">
          <div className="flex-1">
            <label className="text-sm font-medium mb-2 block">Search</label>
            <Input
              placeholder="Search by invoice ID or customer name..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="bg-input text-foreground"
            />
          </div>
          <div className="w-full sm:w-auto">
            <label className="text-sm font-medium mb-2 block">Status</label>
            <Select
              value={filterStatus}
              onValueChange={(value) => setFilterStatus(value)}
            >
              <SelectTrigger className="w-full sm:w-[160px]">
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
          <InvoiceDialog
            open={isDialogOpen}
            onOpenChange={setIsDialogOpen}
            canEdit={canEdit}
            isCreating={isCreating}
            editingInvoice={editingInvoice}
            customers={customers}
            form={form}
            onSubmit={handleSubmitInvoice}
            onNewInvoiceClick={() => {
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
            onExportCsv={handleExportInvoicesCsv}
          />
        </div>

        {/* Invoices Table */}
        <InvoicesTable
          loading={loading}
          invoices={filteredInvoices}
          actionLoading={actionLoading}
          canEdit={canEdit}
          renderSmsStatus={renderSmsStatus}
          getStatusColor={getStatusColor}
          onOpenManageShipments={openManageShipments}
          onViewInvoice={handleViewInvoice}
          onDownload={handleDownload}
          onEditInvoice={(invoice) => {
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
          onSendSms={handleTwilioSmsSend}
          onDeleteInvoice={handleDeleteInvoice}
          searchTerm={searchTerm}
          filterStatus={filterStatus}
          formatDate={formatDate}
        />

        <ManageShipmentsDialog
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
          activeInvoice={activeInvoice}
          invoiceShipments={invoiceShipments}
          shipmentsLoading={shipmentsLoading}
          newShipmentRef={newShipmentRef}
          onNewShipmentRefChange={(value) => setNewShipmentRef(value)}
          linkingShipment={linkingShipment}
          onCopyTrackingLink={handleCopyTrackingLink}
          onAddShipmentToInvoice={handleAddShipmentToInvoice}
        />

        {previewInvoiceId && (
          <InvoicePreview
            invoiceId={previewInvoiceId}
            onClose={() => setPreviewInvoiceId(null)}
          />
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
