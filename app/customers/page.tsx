"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import type { ColumnDef } from "@tanstack/react-table";
import DashboardPageLayout from "@/components/dashboard/layout";
import EmailIcon from "@/components/icons/email";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
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
import { AdvancedDataTable, SortableHeader } from "@/components/ui/advanced-table";
import { EmptyState } from "@/components/ui/empty-state";

interface UICustomer {
  dbId: string;
  id: string;
  name: string;
  email: string;
  phone: string;
  shipments: number;
  totalRevenue: number;
  city: string;
  joinDate: string;
  outstandingAmount: number;
  lastInvoiceDate: string;
}

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

  const columns: ColumnDef<UICustomer>[] = [
    {
      accessorKey: "name",
      header: ({ column }) => <SortableHeader column={column} title="Customer" />, 
      filterFn: (row, _columnId, filterValue) => {
        const query = (filterValue ?? "").toString().toLowerCase().trim();
        if (!query) return true;
        const customer = row.original as UICustomer;
        return (
          customer.name.toLowerCase().includes(query) ||
          customer.email.toLowerCase().includes(query) ||
          customer.id.toLowerCase().includes(query)
        );
      },
      cell: ({ row }) => {
        const customer = row.original;
        return (
          <div className="min-w-0">
            <p className="font-medium text-foreground truncate">
              {customer.name || "—"}
            </p>
          </div>
        );
      },
    },
    {
      accessorKey: "email",
      header: "Email",
      cell: ({ row }) => {
        const email = row.original.email;
        return (
          <span className="block max-w-[240px] truncate text-sm text-foreground">
            {email || "—"}
          </span>
        );
      },
    },
    {
      accessorKey: "phone",
      header: "Phone",
      cell: ({ row }) => {
        const phone = row.original.phone;
        return (
          <span className="block max-w-[140px] truncate text-sm text-foreground">
            {phone || "—"}
          </span>
        );
      },
    },
    {
      accessorKey: "city",
      header: "City",
      cell: ({ row }) => {
        const city = row.original.city;
        return (
          <span className="block max-w-[160px] truncate text-sm text-foreground">
            {city || "—"}
          </span>
        );
      },
    },
    {
      accessorKey: "shipments",
      header: ({ column }) => <SortableHeader column={column} title="Shipments" />, 
      cell: ({ row }) => {
        const shipments = row.original.shipments;
        return <span className="text-sm font-semibold">{shipments}</span>;
      },
    },
    {
      accessorKey: "totalRevenue",
      header: ({ column }) => <SortableHeader column={column} title="Revenue" />, 
      cell: ({ row }) => {
        const revenue = row.original.totalRevenue;
        return (
          <span className="text-sm font-semibold text-primary">
            ₹{(revenue / 100000).toFixed(1)}L
          </span>
        );
      },
    },
    {
      accessorKey: "outstandingAmount",
      header: ({ column }) => <SortableHeader column={column} title="Outstanding" />, 
      cell: ({ row }) => {
        const outstanding = row.original.outstandingAmount;
        return (
          <span className="text-sm font-semibold text-primary">
            ₹{outstanding.toLocaleString("en-IN")}
          </span>
        );
      },
    },
    {
      accessorKey: "lastInvoiceDate",
      header: "Last invoice",
      cell: ({ row }) => {
        const value = row.original.lastInvoiceDate;
        if (!value) {
          return <span className="text-sm text-muted-foreground">—</span>;
        }
        const date = new Date(value);
        return (
          <span className="text-sm font-semibold text-foreground">
            {date.toLocaleDateString("en-IN")}
          </span>
        );
      },
    },
    {
      id: "actions",
      header: "",
      enableHiding: false,
      enableSorting: false,
      cell: ({ row }) => {
        const customer = row.original;
        return (
          <div className="flex justify-end">
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  type="button"
                  variant="outline"
                  size="icon"
                  className="h-8 w-8 p-0"
                >
                  <MoreHorizontal className="h-4 w-4" />
                  <span className="sr-only">Open customer actions</span>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem
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
                  Edit customer
                </DropdownMenuItem>
                <DropdownMenuItem asChild>
                  <Link
                    href={{ pathname: "/shipments", query: { q: customer.name } }}
                  >
                    View shipments
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuItem asChild>
                  <Link
                    href={{ pathname: "/invoices", query: { q: customer.name } }}
                  >
                    View invoices
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem
                  variant="destructive"
                  onClick={() => handleDeleteCustomer(customer)}
                  disabled={!!actionLoading[customer.dbId] || !canEdit}
                >
                  Delete customer
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        );
      },
    },
  ];

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
          <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
            <Button
              type="button"
              className="h-9 px-4 bg-primary hover:bg-primary/90 w-full sm:w-auto"
              disabled={!canEdit}
              onClick={() => {
                if (!canEdit) return;
                setEditingCustomer(null);
                form.reset({ name: "", email: "", phone: "", city: "" });
                setIsDialogOpen(true);
              }}
            >
              Add customer
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

        {/* Customers Table */}
        {loading ? (
          <Card className="border-border/60 bg-background/80">
            <div className="overflow-x-auto">
              <table className="w-full text-sm min-w-[720px]">
                <thead className="bg-muted/40 border-b border-border/60">
                  <tr>
                    <th className="px-4 sm:px-6 py-3 text-left font-semibold">Customer</th>
                    <th className="px-4 sm:px-6 py-3 text-left font-semibold">Email</th>
                    <th className="px-4 sm:px-6 py-3 text-left font-semibold">Phone</th>
                    <th className="px-4 sm:px-6 py-3 text-left font-semibold">City</th>
                    <th className="px-4 sm:px-6 py-3 text-left font-semibold">Metrics</th>
                    <th className="px-4 sm:px-6 py-3 text-right font-semibold">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {Array.from({ length: 5 }).map((_, index) => (
                    <tr
                      key={`customer-skeleton-${index}`}
                      className="border-b border-border/60"
                    >
                      <td className="px-4 sm:px-6 py-4">
                        <Skeleton className="h-4 w-40" />
                        <div className="mt-2 flex gap-2">
                          <Skeleton className="h-4 w-16" />
                          <Skeleton className="h-3 w-28" />
                        </div>
                      </td>
                      <td className="px-4 sm:px-6 py-4">
                        <Skeleton className="h-4 w-48" />
                      </td>
                      <td className="px-4 sm:px-6 py-4">
                        <Skeleton className="h-4 w-32" />
                      </td>
                      <td className="px-4 sm:px-6 py-4">
                        <Skeleton className="h-4 w-28" />
                      </td>
                      <td className="px-4 sm:px-6 py-4">
                        <div className="flex gap-4">
                          <Skeleton className="h-4 w-16" />
                          <Skeleton className="h-4 w-20" />
                          <Skeleton className="h-4 w-24" />
                        </div>
                      </td>
                      <td className="px-4 sm:px-6 py-4">
                        <div className="flex justify-end">
                          <Skeleton className="h-8 w-8" />
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </Card>
        ) : customers.length > 0 ? (
          <AdvancedDataTable
            columns={columns}
            data={customers}
            searchKey="name"
            searchPlaceholder="Search name, email, or ID..."
            enableExport
            enableFilters
            enablePagination
            pageSize={20}
          />
        ) : (
          <Card className="border-border/60 bg-background/80">
            <EmptyState variant="customers" />
          </Card>
        )}
      </div>
    </DashboardPageLayout>
  );
}
