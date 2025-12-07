"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import DashboardPageLayout from "@/components/dashboard/layout";
import EmailIcon from "@/components/icons/email";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { MoreHorizontal } from "lucide-react";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { supabase } from "@/lib/supabaseClient";
import { useToast } from "@/hooks/use-toast";
import { customerSchema, type CustomerFormValues } from "@/lib/validations";
import type { UICustomer } from "@/features/customers/types";
import { CustomersDialog } from "@/features/customers/customers-dialog";
import { CustomersTable } from "@/features/customers/customers-table";

export default function CustomersPage() {
  const [customers, setCustomers] = useState<UICustomer[]>([]);
  const [loading, setLoading] = useState(true);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isCreating, setIsCreating] = useState(false);
  const [userRole, setUserRole] = useState<string | null>(null);
  const [roleLoaded, setRoleLoaded] = useState(false);
  const [editingCustomer, setEditingCustomer] = useState<UICustomer | null>(null);
  const [actionLoading, setActionLoading] = useState<Record<string, boolean>>({});
  const { toast } = useToast();

  const form = useForm<CustomerFormValues>({
    resolver: zodResolver(customerSchema),
    defaultValues: {
      name: "",
      email: "",
      phone: "",
      city: "",
    },
  });

  useEffect(() => {
    let cancelled = false;

    async function loadCustomers() {
      setLoading(true);
      try {
        const { data, error } = await supabase
          .from("customers")
          .select("id, name, email, phone, city, created_at");

        if (error) {
          console.warn("Supabase customers error", error.message);
          throw error;
        }

        const baseCustomers: UICustomer[] = ((data as any[]) ?? []).map((row) => ({
          dbId: row.id,
          id: row.id,
          name: row.name ?? "",
          email: row.email ?? "",
          phone: row.phone ?? "",
          shipments: 0,
          totalRevenue: 0,
          city: row.city ?? "",
          joinDate: row.created_at ?? "",
          outstandingAmount: 0,
          lastInvoiceDate: "",
        }));

        const customerIds = baseCustomers.map((c) => c.dbId);
        const shipmentsByCustomer = new Map<string, number>();
        const billingByCustomer = new Map<
          string,
          { totalAmount: number; outstandingAmount: number; lastInvoiceDate: string | null }
        >();

        if (customerIds.length > 0) {
          try {
            const { data: shipmentRows, error: shipmentsError } = await supabase
              .from("shipments")
              .select("id, customer_id")
              .in("customer_id", customerIds);

            if (shipmentsError) {
              console.warn(
                "Supabase shipments for customers error, skipping shipment metrics",
                shipmentsError.message
              );
            } else {
              ((shipmentRows as any[]) ?? []).forEach((row) => {
                const cid = row.customer_id as string | null;
                if (!cid) return;
                const current = shipmentsByCustomer.get(cid) ?? 0;
                shipmentsByCustomer.set(cid, current + 1);
              });
            }
          } catch (shipErr) {
            console.warn("Supabase shipments for customers error", shipErr);
          }

          try {
            const { data: invoiceRows, error: invoicesError } = await supabase
              .from("invoices")
              .select("customer_id, amount, status, invoice_date")
              .in("customer_id", customerIds);

            if (invoicesError) {
              console.warn(
                "Supabase invoices for customers error, skipping billing metrics",
                invoicesError.message
              );
            } else {
              ((invoiceRows as any[]) ?? []).forEach((row) => {
                const cid = row.customer_id as string | null;
                if (!cid) return;

                const amount = Number(row.amount ?? 0);
                const status = (row.status ?? "pending") as string;
                const invoiceDate: string | null = row.invoice_date ?? null;

                const current =
                  billingByCustomer.get(cid) ?? {
                    totalAmount: 0,
                    outstandingAmount: 0,
                    lastInvoiceDate: null as string | null,
                  };

                const next: { totalAmount: number; outstandingAmount: number; lastInvoiceDate: string | null } = {
                  totalAmount: current.totalAmount + amount,
                  outstandingAmount:
                    current.outstandingAmount +
                    (status === "pending" || status === "overdue" ? amount : 0),
                  lastInvoiceDate: current.lastInvoiceDate,
                };

                if (invoiceDate) {
                  if (!next.lastInvoiceDate || invoiceDate > next.lastInvoiceDate) {
                    next.lastInvoiceDate = invoiceDate;
                  }
                }

                billingByCustomer.set(cid, next);
              });
            }
          } catch (invErr) {
            console.warn("Supabase invoices for customers error", invErr);
          }
        }

        if (cancelled) return;

        const enriched: UICustomer[] = baseCustomers.map((c) => {
          const billing = billingByCustomer.get(c.dbId);

          return {
            ...c,
            shipments: shipmentsByCustomer.get(c.dbId) ?? 0,
            totalRevenue: billing?.totalAmount ?? 0,
            outstandingAmount: billing?.outstandingAmount ?? 0,
            lastInvoiceDate: billing?.lastInvoiceDate ?? "",
          };
        });

        setCustomers(enriched);
        setLoading(false);
      } catch (err) {
        if (cancelled) return;
        console.error("Failed to load customers from Supabase", err);
        setCustomers([]);
        setLoading(false);
      }
    }

    loadCustomers();

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
        console.warn("Failed to load user role for customers page", err);
        setUserRole(null);
        setRoleLoaded(true);
      }
    }

    loadUserRole();

    return () => {
      cancelled = true;
    };
  }, []);

  const canEdit = userRole === "manager" || userRole === "admin";


  const handleSubmitCustomer = async (values: CustomerFormValues) => {
    if (!canEdit) {
      toast({
        title: "Insufficient permissions",
        description: "Only manager or admin users can modify customers.",
        variant: "destructive",
      });
      return;
    }

    setIsCreating(true);
    try {
      const payload = {
        name: values.name.trim(),
        email: values.email?.trim() || null,
        phone: values.phone?.trim() || null,
        city: values.city?.trim() || null,
      };

      if (editingCustomer) {
        const res = await fetch("/api/customers/update", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ id: editingCustomer.dbId, ...payload }),
        });

        const json = await res.json();

        if (!res.ok || !json?.customer) {
          console.error("API update customer error", json);
          throw new Error(
            json?.error || "Failed to update customer. Please try again."
          );
        }

        const updated: UICustomer = {
          ...editingCustomer,
          name: json.customer.name ?? editingCustomer.name,
          email: json.customer.email ?? editingCustomer.email,
          phone: json.customer.phone ?? editingCustomer.phone,
          city: json.customer.city ?? editingCustomer.city,
        };

        setCustomers((prev) =>
          prev.map((c) => (c.dbId === updated.dbId ? updated : c))
        );

        toast({
          title: "Customer updated",
          description: `${updated.name} has been updated.`,
        });
      } else {
        const { data, error } = await supabase
          .from("customers")
          .insert(payload)
          .select("id, name, email, phone, city, created_at")
          .single();

        if (error || !data) {
          throw error || new Error("Failed to create customer");
        }

        const newCustomer: UICustomer = {
          dbId: data.id,
          id: data.id,
          name: data.name ?? "",
          email: data.email ?? "",
          phone: data.phone ?? "",
          shipments: 0,
          totalRevenue: 0,
          city: data.city ?? "",
          joinDate: data.created_at ?? new Date().toISOString(),
          outstandingAmount: 0,
          lastInvoiceDate: "",
        };

        setCustomers((prev) => [newCustomer, ...prev]);

        toast({
          title: "Customer created",
          description: `${newCustomer.name} has been added to the directory.`,
        });
      }

      setIsDialogOpen(false);
      setEditingCustomer(null);
      form.reset();
    } catch (err: any) {
      console.error("Failed to save customer", err);
      toast({
        title: "Could not save customer",
        description:
          err?.message ||
          (typeof err === "object" && err?.details)
            || "Something went wrong while saving the customer.",
        variant: "destructive",
      });
    } finally {
      setIsCreating(false);
    }
  };

  const handleDeleteCustomer = async (customer: UICustomer) => {
    if (!canEdit) {
      toast({
        title: "Insufficient permissions",
        description: "Only manager or admin users can modify customers.",
        variant: "destructive",
      });
      return;
    }

    if (customer.shipments > 0 || customer.totalRevenue > 0) {
      toast({
        title: "Cannot delete customer",
        description:
          "This customer has linked shipments or invoices. Deletion is blocked to protect historical data.",
        variant: "destructive",
      });
      return;
    }

    const confirmDelete = window.confirm(
      `Delete customer ${customer.name || customer.id}? This action cannot be undone.`
    );
    if (!confirmDelete) return;

    setActionLoading((prev) => ({ ...prev, [customer.dbId]: true }));
    try {
      const { error } = await supabase
        .from("customers")
        .delete()
        .eq("id", customer.dbId);
      if (error) {
        throw error;
      }

      setCustomers((prev) => prev.filter((c) => c.dbId !== customer.dbId));

      toast({
        title: "Customer deleted",
        description: `${customer.name || customer.id} has been removed.`,
      });
    } catch (err: any) {
      console.error("Failed to delete customer", err);
      toast({
        title: "Could not delete customer",
        description:
          err?.message || "Something went wrong while deleting the customer.",
        variant: "destructive",
      });
    } finally {
      setActionLoading((prev) => {
        const next = { ...prev };
        delete next[customer.dbId];
        return next;
      });
    }
  };

  return (
    <DashboardPageLayout
      header={{
        title: "Customers",
        description: "Manage all client relationships and contracts",
        icon: EmailIcon,
      }}
    >
      <div className="flex flex-col gap-6">
        {/* Add Customer */}
        <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
          {roleLoaded && !canEdit && (
            <p className="text-xs text-muted-foreground max-w-xs">
              You have read-only access. Contact an admin to modify customers.
            </p>
          )}
          <CustomersDialog
            open={isDialogOpen}
            onOpenChange={setIsDialogOpen}
            canEdit={canEdit}
            isCreating={isCreating}
            editingCustomer={editingCustomer}
            form={form}
            onSubmit={handleSubmitCustomer}
            onNewCustomerClick={() => {
              if (!canEdit) return;
              setEditingCustomer(null);
              form.reset({ name: "", email: "", phone: "", city: "" });
              setIsDialogOpen(true);
            }}
          />
        </div>

        {/* Customers Table */}
        <CustomersTable
          loading={loading}
          customers={customers}
          actionLoading={actionLoading}
          canEdit={canEdit}
          onEditCustomer={(customer) => {
            setEditingCustomer(customer);
            form.reset({
              name: customer.name,
              email: customer.email,
              phone: customer.phone,
              city: customer.city,
            });
            setIsDialogOpen(true);
          }}
          onDeleteCustomer={handleDeleteCustomer}
        />
      </div>
    </DashboardPageLayout>
  );
}
