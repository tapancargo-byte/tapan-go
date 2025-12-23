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
import { InvoiceDialogEnhanced } from "@/features/invoices/invoice-dialog-enhanced";
import { CustomerCreateDialog } from "@/features/invoices/customer-create-dialog";
import * as Sentry from "@sentry/nextjs";

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

  // Customer create dialog state
  const [customerDialogOpen, setCustomerDialogOpen] = useState(false);
  const [customerDialogTarget, setCustomerDialogTarget] = useState<"billing" | "consignor" | "consignee">("billing");
  const [customerDialogLoading, setCustomerDialogLoading] = useState(false);
  const [pendingCustomerResolve, setPendingCustomerResolve] = useState<((value: { id: string; name: string } | null) => void) | null>(null);

  // Rates for auto-calculation
  const [rates, setRates] = useState<{ id: string; origin: string; destination: string; ratePerKg: number; baseFee: number; serviceType: string }[]>([]);

  const form = useForm<InvoiceFormValues>({
    resolver: zodResolver(invoiceSchema),
    defaultValues: {
      // Header
      invoiceRef: "",
      dateOfBooking: new Date().toISOString().split("T")[0],
      natureOfQuantity: "",
      declaredValue: "",
      // Parties
      customerId: "",
      consignorId: "",
      consignorName: "",
      consignorAddress: "",
      consignorPhone: "",
      consigneeId: "",
      consigneeName: "",
      consigneeAddress: "",
      consigneePhone: "",
      // Courier Details
      origin: "",
      destination: "",
      transportMode: "surface",
      pieces: undefined,
      actualWeight: undefined,
      chargedWeight: undefined,
      rate: undefined,
      remarks: "",
      // Payment Details
      paymentMode: undefined,
      freightAmount: undefined,
      pickupCharge: undefined,
      packingCharge: undefined,
      docketCharge: undefined,
      deliveryCharge: undefined,
      insuranceCharge: undefined,
      gstPercent: undefined,
      gstAmount: undefined,
      otherCharge: undefined,
      amount: 0,
      advancePaid: undefined,
      balanceDue: undefined,
      // Meta
      dueDate: "",
      status: "pending",
      notes: "",
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
          Sentry.captureException(err, { 
            tags: { component: 'invoices-page', operation: 'load-ar-summary' }
          });
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
        // Optimize: Fetch invoices, customers, and rates in parallel
        const [invoicesResult, customersResult] = await Promise.all([
          supabase
            .from("invoices")
            .select(
              "id, invoice_ref, customer_id, consignor_id, consignee_id, amount, status, due_date, origin, destination, pieces, charged_weight, declared_value, payment_mode, freight_amount, pickup_charge, delivery_charge, docket_charge, other_charge, advance_paid, balance_due, notes"
            )
            .order("created_at", { ascending: false }),
          supabase
            .from("customers")
            .select("id, name"),
        ]);

        // Rates fetch with fallback (service_type column may not exist)
        let ratesRows: any[] | null = null;
        let ratesError: any = null;
        const ratesWithService = await supabase
          .from("rates")
          .select("id, origin, destination, rate_per_kg, base_fee, service_type")
          .order("created_at", { ascending: false });
        ratesRows = ratesWithService.data as any[] | null;
        ratesError = ratesWithService.error;
        if (ratesError && (ratesError as any).code === "42703") {
          const ratesLegacy = await supabase
            .from("rates")
            .select("id, origin, destination, rate_per_kg, base_fee")
            .order("created_at", { ascending: false });
          ratesRows = ratesLegacy.data as any[] | null;
          ratesError = ratesLegacy.error;
        }

        if (ratesError) {
          Sentry.captureException(ratesError, {
            tags: { component: 'invoices-page', operation: 'load-rates' },
            extra: { errorMessage: (ratesError as any)?.message ?? ratesError }
          });
        }

        const { data: invoiceRows, error: invoiceError } = invoicesResult;
        const { data: customerRows, error: customersError } = customersResult;

        // Process rates for auto-calculation
        if (!ratesError && ratesRows) {
          setRates(
            ratesRows.map((r: any) => ({
              id: r.id,
              origin: r.origin ?? "",
              destination: r.destination ?? "",
              ratePerKg: Number(r.rate_per_kg ?? 0),
              baseFee: Number(r.base_fee ?? 0),
              serviceType: (r.service_type ?? "standard").toString().toLowerCase(),
            }))
          );
        } else {
          setRates([]);
        }

        if (invoiceError) {
          Sentry.captureException(invoiceError, {
            tags: { component: 'invoices-page', operation: 'load-invoices' }
          });
          throw invoiceError;
        }

        const rows = (invoiceRows ?? []) as {
          id: string;
          invoice_ref: string | null;
          customer_id: string | null;
          consignor_id: string | null;
          consignee_id: string | null;
          amount: number | null;
          status: string | null;
          due_date: string | null;
          origin: string | null;
          destination: string | null;
          pieces: number | null;
          charged_weight: number | null;
          declared_value: number | null;
          payment_mode: string | null;
          freight_amount: number | null;
          pickup_charge: number | null;
          delivery_charge: number | null;
          docket_charge: number | null;
          other_charge: number | null;
          advance_paid: number | null;
          balance_due: number | null;
          notes: string | null;
        }[];

        const customersMap = new Map<string, { id: string; name: string | null }>();
        const shipmentsByInvoice = new Map<string, number>();

        if (customersError) {
          Sentry.captureException(customersError, {
            tags: { component: 'invoices-page', operation: 'load-customers' },
            extra: { context: 'skipping customer join' }
          });
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
            Sentry.captureException(itemsErr, {
              tags: { component: 'invoices-page', operation: 'load-invoice-items' }
            });
          }
        }

        const normalized: UIInvoice[] = rows.map((row) => {
          const customer = row.customer_id
            ? customersMap.get(row.customer_id)
            : undefined;
          const consignor = row.consignor_id
            ? customersMap.get(row.consignor_id)
            : undefined;
          const consignee = row.consignee_id
            ? customersMap.get(row.consignee_id)
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
            consignorId: row.consignor_id ?? null,
            consigneeId: row.consignee_id ?? null,
            consignorName: consignor?.name ?? undefined,
            consigneeName: consignee?.name ?? undefined,
            origin: row.origin,
            destination: row.destination,
            pieces: row.pieces,
            chargedWeight: row.charged_weight,
            declaredValue: row.declared_value,
            paymentMode: row.payment_mode as UIInvoice["paymentMode"],
            freightAmount: row.freight_amount,
            pickupCharge: row.pickup_charge,
            deliveryCharge: row.delivery_charge,
            docketCharge: row.docket_charge,
            otherCharge: row.other_charge,
            advancePaid: row.advance_paid,
            balanceDue: row.balance_due,
            notes: row.notes,
          };
        });


        if (cancelled) return;

        setInvoices(normalized);
        setLoading(false);
      } catch (error) {
        if (cancelled) return;
        Sentry.captureException(error, {
          tags: { component: 'invoices-page', operation: 'load-invoices-complete' }
        });
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
        Sentry.captureException(err, {
          tags: { component: 'invoices-page', operation: 'load-user-role' }
        });
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

  const quickCreateCustomer = async (
    target: "billing" | "consignor" | "consignee"
  ): Promise<{ id: string; name: string } | null> => {
    return new Promise((resolve) => {
      setCustomerDialogTarget(target);
      setPendingCustomerResolve(() => resolve);
      setCustomerDialogOpen(true);
    });
  };

  const handleCustomerDialogSubmit = async (data: {
    name: string;
    phone: string;
    city: string;
    email: string;
  }) => {
    setCustomerDialogLoading(true);
    try {
      const { data: result, error } = await supabase
        .from("customers")
        .insert({
          name: data.name,
          phone: data.phone || null,
          city: data.city || null,
          email: data.email || null,
        })
        .select("id, name")
        .single();

      if (error || !result) {
        throw error || new Error("Failed to create customer");
      }

      const newCustomer = { id: result.id as string, name: (result as any).name ?? data.name };
      setCustomers((prev) => [newCustomer, ...prev]);

      toast({
        title: "Customer created",
        description: `${newCustomer.name} is now available for selection.`,
      });

      if (pendingCustomerResolve) {
        pendingCustomerResolve(newCustomer);
        setPendingCustomerResolve(null);
      }
      setCustomerDialogOpen(false);
    } catch (err: any) {
      Sentry.captureException(err, {
        tags: { component: 'invoices-page', operation: 'quick-create-customer' }
      });

      const email = typeof data.email === "string" ? data.email.trim() : "";
      if (err?.code === "23505" && email) {
        const { data: existing, error: existingError } = await supabase
          .from("customers")
          .select("id, name")
          .ilike("email", email)
          .maybeSingle();

        if (!existingError && existing?.id) {
          const existingCustomer = {
            id: existing.id as string,
            name: (existing as any).name ?? data.name,
          };

          setCustomers((prev) => {
            if (prev.some((c) => c.id === existingCustomer.id)) return prev;
            return [existingCustomer, ...prev];
          });

          toast({
            title: "Customer already exists",
            description: `${existingCustomer.name} is now selected.`,
          });

          if (pendingCustomerResolve) {
            pendingCustomerResolve(existingCustomer);
            setPendingCustomerResolve(null);
          }
          setCustomerDialogOpen(false);
          return;
        }
      }

      toast({
        title: "Could not create customer",
        description: err?.message || "Something went wrong while creating the customer.",
        variant: "destructive",
      });
    } finally {
      setCustomerDialogLoading(false);
    }
  };

  const handleCustomerDialogClose = (open: boolean) => {
    if (!open) {
      if (pendingCustomerResolve) {
        pendingCustomerResolve(null);
        setPendingCustomerResolve(null);
      }
    }
    setCustomerDialogOpen(open);
  };

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
      Sentry.captureException(error, {
        tags: { component: 'invoices-page', operation: 'download-pdf' }
      });
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
      Sentry.captureException(err, {
        tags: { component: 'invoices-page', operation: 'delete-invoice' },
        extra: { invoiceId: invoice.id }
      });
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

      const res = await fetch("/api/send-whatsapp", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ invoiceId: invoice.dbId }),
      });
      const json = await res.json();

      if (!res.ok || !json?.success) {
        const message =
          (typeof json?.error === "string" && json.error) ||
          "Could not send WhatsApp message right now.";
        setTwilioStatuses((prev) => ({
          ...prev,
          [invoice.dbId]: {
            status: "error",
            errorMessage: message,
            createdAt: new Date().toISOString(),
          },
        }));
        toast({
          title: "WhatsApp error",
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
        title: "WhatsApp message sent",
        description: `Invoice ${invoice.id} was sent via WhatsApp to ${serverTo}.`,
      });
    } catch (error: any) {
      console.error("Failed to send invoice via WhatsApp", error);
      toast({
        title: "WhatsApp error",
        description:
          error?.message || "Something went wrong while sending the WhatsApp message.",
        variant: "destructive",
      });
      setTwilioStatuses((prev) => ({
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
      const freight = Number(values.freightAmount ?? 0);
      const pickup = Number(values.pickupCharge ?? 0);
      const packing = Number(values.packingCharge ?? 0);
      const delivery = Number(values.deliveryCharge ?? 0);
      const docket = Number(values.docketCharge ?? 0);
      const insurance = Number(values.insuranceCharge ?? 0);
      const gstPercent = Number(values.gstPercent ?? 0);
      const other = Number(values.otherCharge ?? 0);
      const advance = Number(values.advancePaid ?? 0);

      const subtotal = freight + pickup + packing + delivery + docket + insurance + other;
      const computedGstAmount = Number(
        values.gstAmount ?? (subtotal * gstPercent) / 100
      );
      const totalAmount = subtotal + computedGstAmount;
      const computedBalanceDue = Math.max(totalAmount - advance, 0);

      const declaredValueNumber = (() => {
        const raw = (values.declaredValue ?? "").toString().trim();
        if (!raw) return null;
        const num = Number(raw);
        return Number.isFinite(num) ? num : null;
      })();

      const invoiceRefTrimmed = (values.invoiceRef ?? "").toString().trim();

      const payloadBase = {
        customer_id: values.customerId,
        consignor_id: values.consignorId || null,
        consignee_id: values.consigneeId || null,
        origin: values.origin || null,
        destination: values.destination || null,
        pieces: values.pieces ?? null,
        charged_weight: values.chargedWeight ?? null,
        declared_value: declaredValueNumber,
        payment_mode: values.paymentMode ?? null,
        amount: totalAmount,
        status: values.status,
        invoice_date: new Date().toISOString().split("T")[0],
        due_date: values.dueDate || null,
        freight_amount: values.freightAmount ?? null,
        pickup_charge: values.pickupCharge ?? null,
        packing_charge: values.packingCharge ?? null,
        delivery_charge: values.deliveryCharge ?? null,
        docket_charge: values.docketCharge ?? null,
        insurance_charge: values.insuranceCharge ?? null,
        gst_percent: values.gstPercent ?? null,
        gst_amount: computedGstAmount,
        other_charge: values.otherCharge ?? null,
        advance_paid: values.advancePaid ?? null,
        balance_due: computedBalanceDue,
        notes: values.notes || null,
      };

      const payload = editingInvoice
        ? payloadBase
        : invoiceRefTrimmed
          ? { invoice_ref: invoiceRefTrimmed, ...payloadBase }
          : payloadBase;

      const legacyPayload = (() => {
        const {
          packing_charge,
          insurance_charge,
          gst_percent,
          gst_amount,
          ...rest
        } = payload as any;
        return rest;
      })();

      if (editingInvoice) {
        const runUpdate = async (p: any) =>
          supabase
            .from("invoices")
            .update(p)
            .eq("id", editingInvoice.dbId)
            .select(
              "id, invoice_ref, customer_id, consignor_id, consignee_id, amount, status, due_date, origin, destination, pieces, charged_weight, declared_value, payment_mode, freight_amount, pickup_charge, delivery_charge, docket_charge, other_charge, advance_paid, balance_due, notes"
            )
            .maybeSingle();

        let { data, error } = await runUpdate(payload);

        if (error && (error as any).code === "42703") {
          ({ data, error } = await runUpdate(legacyPayload));
          toast({
            title: "Saved with limited fields",
            description:
              "Your database is missing some newer invoice columns (packing/insurance/GST). Invoice was saved, but please run the latest Supabase migrations to store those fields.",
          });
        }

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
          consignorId: (data as any).consignor_id ?? null,
          consigneeId: (data as any).consignee_id ?? null,
          consignorName: undefined,
          consigneeName: undefined,
          origin: (data as any).origin ?? null,
          destination: (data as any).destination ?? null,
          pieces: (data as any).pieces ?? null,
          chargedWeight: (data as any).charged_weight ?? null,
          declaredValue: (data as any).declared_value ?? null,
          paymentMode: (data as any).payment_mode ?? null,
          freightAmount: (data as any).freight_amount ?? null,
          pickupCharge: (data as any).pickup_charge ?? null,
          deliveryCharge: (data as any).delivery_charge ?? null,
          docketCharge: (data as any).docket_charge ?? null,
          otherCharge: (data as any).other_charge ?? null,
          advancePaid: (data as any).advance_paid ?? null,
          balanceDue: (data as any).balance_due ?? null,
          notes: (data as any).notes ?? null,
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
        const {
          data: { session },
        } = await supabase.auth.getSession();
        const accessToken = session?.access_token;

        const res = await fetch("/api/invoices", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            ...(accessToken ? { Authorization: `Bearer ${accessToken}` } : {}),
          },
          body: JSON.stringify(payload),
        });
        const json = await res.json().catch(() => ({}));

        if (!res.ok) {
          const extra =
            (json as any)?.code || (json as any)?.details || (json as any)?.hint
              ? ` ${(json as any)?.code ? `[${(json as any).code}]` : ""}${(json as any)?.details ? ` ${(json as any).details}` : ""
              }${(json as any)?.hint ? ` ${(json as any).hint}` : ""}`
              : "";
          const err: any = new Error(
            typeof json?.error === "string" && json.error.trim()
              ? json.error
              : "Failed to create invoice"
          );
          if (extra.trim()) {
            err.message = `${err.message}${extra}`;
          }
          throw err;
        }

        const data = (json as any)?.invoice;
        if (!data) {
          throw new Error("Failed to create invoice");
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
          consignorId: (data as any).consignor_id ?? null,
          consigneeId: (data as any).consignee_id ?? null,
          consignorName: undefined,
          consigneeName: undefined,
          origin: (data as any).origin ?? null,
          destination: (data as any).destination ?? null,
          pieces: (data as any).pieces ?? null,
          chargedWeight: (data as any).charged_weight ?? null,
          declaredValue: (data as any).declared_value ?? null,
          paymentMode: (data as any).payment_mode ?? null,
          freightAmount: (data as any).freight_amount ?? null,
          pickupCharge: (data as any).pickup_charge ?? null,
          deliveryCharge: (data as any).delivery_charge ?? null,
          docketCharge: (data as any).docket_charge ?? null,
          otherCharge: (data as any).other_charge ?? null,
          advancePaid: (data as any).advance_paid ?? null,
          balanceDue: (data as any).balance_due ?? null,
          notes: (data as any).notes ?? null,
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
        // Header
        invoiceRef: "",
        dateOfBooking: new Date().toISOString().split("T")[0],
        natureOfQuantity: "",
        declaredValue: "",
        // Parties
        customerId: "",
        consignorId: "",
        consignorName: "",
        consignorAddress: "",
        consignorPhone: "",
        consigneeId: "",
        consigneeName: "",
        consigneeAddress: "",
        consigneePhone: "",
        // Courier Details
        origin: "",
        destination: "",
        transportMode: "surface",
        pieces: undefined,
        actualWeight: undefined,
        chargedWeight: undefined,
        rate: undefined,
        remarks: "",
        // Payment Details
        paymentMode: undefined,
        freightAmount: undefined,
        pickupCharge: undefined,
        packingCharge: undefined,
        docketCharge: undefined,
        deliveryCharge: undefined,
        insuranceCharge: undefined,
        gstPercent: undefined,
        gstAmount: undefined,
        otherCharge: undefined,
        amount: 0,
        advancePaid: undefined,
        balanceDue: undefined,
        // Meta
        dueDate: "",
        status: "pending",
        notes: "",
      });
    } catch (err: any) {
      console.error("Failed to save invoice", err);
      const extraDetails =
        (err?.code ? ` [${err.code}]` : "") +
        (err?.details ? ` ${err.details}` : "") +
        (err?.hint ? ` ${err.hint}` : "");
      toast({
        title: "Could not save invoice",
        description:
          (err?.message || "Something went wrong while saving the invoice.") +
          (extraDetails.trim() ? `\n${extraDetails.trim()}` : ""),
        variant: "destructive",
      });
    } finally {
      setIsCreating(false);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "paid":
        return "bg-emerald-500 text-white font-medium";
      case "pending":
        return "bg-amber-500 text-white font-medium";
      case "overdue":
        return "bg-red-500 text-white font-medium";
      case "partially_paid":
        return "bg-blue-500 text-white font-medium";
      default:
        return "bg-secondary text-secondary-foreground font-medium";
    }
  };

  const renderSmsStatus = (invoiceId: string) => {
    const info = twilioStatuses[invoiceId];
    if (!info) return null;

    const label =
      info.status === "success"
        ? "WhatsApp: SENT"
        : info.status === "error"
          ? "WhatsApp: ERROR"
          : `WhatsApp: ${info.status.toUpperCase()}`;

    const color =
      info.status === "success"
        ? "text-emerald-500"
        : info.status === "error"
          ? "text-destructive"
          : "text-muted-foreground";

    return (
      <span className={`text-xs uppercase mt-0.5 ${color}`}>
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
            <p className="text-xs text-muted-foreground max-w-xs">
              You have read-only billing access. Contact an admin to create invoices.
            </p>
          )}
          <InvoiceDialogEnhanced
            open={isDialogOpen}
            onOpenChange={setIsDialogOpen}
            canEdit={canEdit}
            isCreating={isCreating}
            editingInvoice={editingInvoice}
            customers={customers}
            rates={rates}
            form={form}
            onSubmit={handleSubmitInvoice}
            onQuickCreateCustomer={quickCreateCustomer}
            onNewInvoiceClick={() => {
              if (!canEdit) return;
              setEditingInvoice(null);
              form.reset({
                // Header
                invoiceRef: "",
                dateOfBooking: new Date().toISOString().split("T")[0],
                natureOfQuantity: "",
                declaredValue: "",
                // Parties
                customerId: "",
                consignorId: "",
                consignorName: "",
                consignorAddress: "",
                consignorPhone: "",
                consigneeId: "",
                consigneeName: "",
                consigneeAddress: "",
                consigneePhone: "",
                // Courier Details
                origin: "",
                destination: "",
                transportMode: "surface",
                pieces: undefined,
                actualWeight: undefined,
                chargedWeight: undefined,
                rate: undefined,
                remarks: "",
                // Payment Details
                paymentMode: undefined,
                freightAmount: undefined,
                pickupCharge: undefined,
                packingCharge: undefined,
                docketCharge: undefined,
                deliveryCharge: undefined,
                insuranceCharge: undefined,
                gstPercent: undefined,
                gstAmount: undefined,
                otherCharge: undefined,
                amount: 0,
                advancePaid: undefined,
                balanceDue: undefined,
                // Meta
                dueDate: "",
                status: "pending",
                notes: "",
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
              // Header
              invoiceRef: invoice.id,
              dateOfBooking: invoice.dueDate ? invoice.dueDate.slice(0, 10) : new Date().toISOString().split("T")[0],
              natureOfQuantity: "",
              declaredValue: invoice.declaredValue ? String(invoice.declaredValue) : "",
              // Parties
              customerId: invoice.customerId ?? "",
              consignorId: invoice.consignorId ?? "",
              consignorName: "",
              consignorAddress: "",
              consignorPhone: "",
              consigneeId: invoice.consigneeId ?? "",
              consigneeName: "",
              consigneeAddress: "",
              consigneePhone: "",
              // Courier Details
              origin: invoice.origin ?? "",
              destination: invoice.destination ?? "",
              transportMode: "surface",
              pieces: invoice.pieces ?? undefined,
              actualWeight: undefined,
              chargedWeight: invoice.chargedWeight ?? undefined,
              rate: undefined,
              remarks: "",
              // Payment Details
              paymentMode: (invoice.paymentMode ?? undefined) as InvoiceFormValues["paymentMode"],
              freightAmount: invoice.freightAmount ?? undefined,
              pickupCharge: invoice.pickupCharge ?? undefined,
              packingCharge: undefined,
              docketCharge: invoice.docketCharge ?? undefined,
              deliveryCharge: invoice.deliveryCharge ?? undefined,
              insuranceCharge: undefined,
              gstPercent: undefined,
              gstAmount: undefined,
              otherCharge: invoice.otherCharge ?? undefined,
              amount: invoice.amount,
              advancePaid: invoice.advancePaid ?? undefined,
              balanceDue: invoice.balanceDue ?? undefined,
              // Meta
              dueDate: invoice.dueDate ? invoice.dueDate.slice(0, 10) : "",
              status: (invoice.status as "pending" | "paid" | "overdue" | "partially_paid") ?? "pending",
              notes: invoice.notes ?? "",
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

        <CustomerCreateDialog
          open={customerDialogOpen}
          onOpenChange={handleCustomerDialogClose}
          target={customerDialogTarget}
          onSubmit={handleCustomerDialogSubmit}
          isLoading={customerDialogLoading}
        />
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
