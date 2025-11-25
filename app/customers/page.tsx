"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import DashboardPageLayout from "@/components/dashboard/layout";
import CuteRobotIcon from "@/components/icons/cute-robot";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { supabase } from "@/lib/supabaseClient";
import { useToast } from "@/hooks/use-toast";
import { customerSchema, type CustomerFormValues } from "@/lib/validations";

interface UICustomer {
  dbId: string;
  id: string;
  name: string;
  email: string;
  phone: string;
  status: "active" | "inactive";
  shipments: number;
  totalRevenue: number;
  city: string;
  joinDate: string;
  outstandingAmount: number;
  lastInvoiceDate: string;
}

export default function CustomersPage() {
  const [searchTerm, setSearchTerm] = useState("");
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
          status: "active",
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

  const filteredCustomers = useMemo(
    () =>
      customers.filter(
        (customer) =>
          customer.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
          customer.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
          customer.id.toLowerCase().includes(searchTerm.toLowerCase())
      ),
    [customers, searchTerm]
  );

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
          status: "active",
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
        icon: CuteRobotIcon,
      }}
    >
      <div className="flex flex-col gap-6">
        {/* Search and Add Customer */}
        <div className="flex gap-4 items-end">
          <div className="flex-1">
            <label className="text-sm font-medium mb-2 block">Search</label>
            <Input
              placeholder="Search by name, email, or customer ID..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="bg-input text-foreground"
            />
          </div>
          {roleLoaded && !canEdit && (
            <p className="text-[11px] text-muted-foreground max-w-xs">
              You have read-only access. Contact an admin to modify customers.
            </p>
          )}
          <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
            <Button
              type="button"
              className="bg-primary hover:bg-primary/90"
              disabled={!canEdit}
              onClick={() => {
                if (!canEdit) return;
                setEditingCustomer(null);
                form.reset({ name: "", email: "", phone: "", city: "" });
                setIsDialogOpen(true);
              }}
            >
              Add Customer
            </Button>

            <DialogContent>
              <DialogHeader>
                <DialogTitle>
                  {editingCustomer ? "Edit customer" : "Add customer"}
                </DialogTitle>
                <DialogDescription>
                  {editingCustomer
                    ? "Update customer details used for operations and billing."
                    : "Create a new customer record for operations and billing."}
                </DialogDescription>
              </DialogHeader>

              <Form {...form}>
                <form
                  className="space-y-4 mt-2"
                  onSubmit={form.handleSubmit(handleSubmitCustomer)}
                >
                  <FormField
                    control={form.control}
                    name="name"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Name</FormLabel>
                        <FormControl>
                          <Input placeholder="Customer name" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="email"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Email</FormLabel>
                        <FormControl>
                          <Input
                            type="email"
                            placeholder="ops@customer.com"
                            {...field}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="phone"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Phone</FormLabel>
                        <FormControl>
                          <Input
                            type="tel"
                            placeholder="Contact number"
                            {...field}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="city"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>City</FormLabel>
                        <FormControl>
                          <Input placeholder="Imphal, New Delhi, ..." {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <DialogFooter className="pt-2">
                    <Button
                      type="button"
                      variant="ghost"
                      onClick={() => {
                        setIsDialogOpen(false);
                      }}
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
                        ? editingCustomer
                          ? "Saving..."
                          : "Creating..."
                        : editingCustomer
                        ? "Save changes"
                        : "Create customer"}
                    </Button>
                  </DialogFooter>
                </form>
              </Form>
            </DialogContent>
          </Dialog>
        </div>

        {/* Customers Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 gap-6">
          {filteredCustomers.map((customer) => (
            <Card
              key={customer.id}
              className="p-6 border-pop bg-background hover:bg-accent/50 transition-colors"
            >
              <div className="flex justify-between items-start mb-4">
                <div>
                  <h3 className="text-lg font-display text-foreground">
                    {customer.name}
                  </h3>
                  <p className="text-sm text-muted-foreground">{customer.id}</p>
                </div>
                <Badge
                  variant={customer.status === "active" ? "default" : "secondary"}
                  className={
                    customer.status === "active"
                      ? "bg-green-500/20 text-green-400"
                      : "bg-gray-500/20 text-gray-400"
                  }
                >
                  {customer.status.toUpperCase()}
                </Badge>
              </div>

              <div className="space-y-3 text-sm">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Email</span>
                  <span className="text-foreground">{customer.email}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Phone</span>
                  <span className="text-foreground">{customer.phone}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Location</span>
                  <span className="text-foreground">{customer.city}</span>
                </div>

                <div className="border-t border-pop pt-3 mt-3 flex justify-between items-center">
                  <div>
                    <p className="text-xs text-muted-foreground mb-1">
                      Total Shipments
                    </p>
                    <p className="text-lg font-semibold text-primary">
                      {customer.shipments}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="text-xs text-muted-foreground mb-1">
                      Revenue
                    </p>
                    <p className="text-lg font-semibold text-primary">
                      ₹{(customer.totalRevenue / 100000).toFixed(1)}L
                    </p>
                  </div>
                </div>

                <div className="border-t border-pop pt-3 mt-3 grid grid-cols-2 gap-3 text-xs">
                  <div>
                    <p className="text-muted-foreground mb-1">Outstanding</p>
                    <p className="font-semibold text-primary text-sm">
                      ₹{customer.outstandingAmount.toLocaleString("en-IN")}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="text-muted-foreground mb-1">Last Invoice</p>
                    <p className="font-semibold text-sm">
                      {customer.lastInvoiceDate
                        ? new Date(customer.lastInvoiceDate).toLocaleDateString("en-IN")
                        : "—"}
                    </p>
                  </div>
                </div>

                <div className="pt-3 mt-3 flex justify-end gap-2 text-xs">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => {
                      setEditingCustomer(customer);
                      form.reset({
                        name: customer.name,
                        email: customer.email,
                        phone: customer.phone,
                        city: customer.city,
                      });
                      setIsDialogOpen(true);
                    }}
                    disabled={!canEdit}
                  >
                    Edit
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    className="text-destructive border-destructive/40 hover:bg-red-50 dark:hover:bg-red-950/40"
                    onClick={() => handleDeleteCustomer(customer)}
                    disabled={!!actionLoading[customer.dbId] || !canEdit}
                  >
                    Delete
                  </Button>
                  <Link
                    href={{ pathname: "/shipments", query: { q: customer.name } }}
                  >
                    <Button variant="outline" size="sm">
                      View shipments
                    </Button>
                  </Link>
                  <Link
                    href={{ pathname: "/invoices", query: { q: customer.name } }}
                  >
                    <Button variant="outline" size="sm">
                      View invoices
                    </Button>
                  </Link>
                </div>
              </div>
            </Card>
          ))}
        </div>

        {filteredCustomers.length === 0 && (
          <Card className="p-12 text-center border-pop">
            <p className="text-muted-foreground">No customers found</p>
          </Card>
        )}
      </div>
    </DashboardPageLayout>
  );
}
