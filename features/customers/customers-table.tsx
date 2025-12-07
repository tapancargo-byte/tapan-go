"use client";

import * as React from "react";
import Link from "next/link";
import type { ColumnDef } from "@tanstack/react-table";
import { Card } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { MoreHorizontal } from "lucide-react";
import { AdvancedDataTable, SortableHeader } from "@/components/ui/advanced-table";
import { EmptyState } from "@/components/ui/empty-state";
import type { UICustomer } from "@/features/customers/types";

interface CustomersTableProps {
  loading: boolean;
  customers: UICustomer[];
  actionLoading: Record<string, boolean>;
  canEdit: boolean;
  onEditCustomer: (customer: UICustomer) => void;
  onDeleteCustomer: (customer: UICustomer) => void;
}

export function CustomersTable({
  loading,
  customers,
  actionLoading,
  canEdit,
  onEditCustomer,
  onDeleteCustomer,
}: CustomersTableProps) {
  const columns = React.useMemo<ColumnDef<UICustomer>[]>(
    () => [
      {
        accessorKey: "name",
        header: ({ column }) => (
          <SortableHeader column={column} title="Customer" />
        ),
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
        header: ({ column }) => (
          <SortableHeader column={column} title="Shipments" />
        ),
        cell: ({ row }) => {
          const shipments = row.original.shipments;
          return <span className="text-sm font-semibold">{shipments}</span>;
        },
      },
      {
        accessorKey: "totalRevenue",
        header: ({ column }) => (
          <SortableHeader column={column} title="Revenue" />
        ),
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
        header: ({ column }) => (
          <SortableHeader column={column} title="Outstanding" />
        ),
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
              <DropdownMenu modal={false}>
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
                    onClick={() => onEditCustomer(customer)}
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
                    onClick={() => onDeleteCustomer(customer)}
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
    ],
    [actionLoading, canEdit, onEditCustomer, onDeleteCustomer]
  );

  if (loading) {
    return (
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
    );
  }

  if (customers.length === 0) {
    return (
      <Card className="border-border/60 bg-background/80">
        <EmptyState variant="customers" />
      </Card>
    );
  }

  return (
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
  );
}
