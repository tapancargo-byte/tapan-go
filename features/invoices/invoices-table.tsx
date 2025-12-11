"use client";

import * as React from "react";
import { Card } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { EmptyState } from "@/components/ui/empty-state";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu";
import { MoreHorizontal } from "lucide-react";
import type { UIInvoice } from "@/features/invoices/types";

interface InvoicesTableProps {
  loading: boolean;
  invoices: UIInvoice[];
  actionLoading: Record<string, boolean>;
  canEdit: boolean;
  renderSmsStatus: (invoiceId: string) => React.ReactNode;
  getStatusColor: (status: string) => string;
  onOpenManageShipments: (invoice: UIInvoice) => void;
  onViewInvoice: (invoice: UIInvoice) => void;
  onDownload: (invoice: UIInvoice) => void;
  onEditInvoice: (invoice: UIInvoice) => void;
  onSendSms: (invoice: UIInvoice) => void;
  onDeleteInvoice: (invoice: UIInvoice) => void;
  searchTerm: string;
  filterStatus: string;
  formatDate: (value: string) => string;
}

export function InvoicesTable({
  loading,
  invoices,
  actionLoading,
  canEdit,
  renderSmsStatus,
  getStatusColor,
  onOpenManageShipments,
  onViewInvoice,
  onDownload,
  onEditInvoice,
  onSendSms,
  onDeleteInvoice,
  searchTerm,
  filterStatus,
  formatDate,
}: InvoicesTableProps) {
  return (
    <Card className="border-pop">
      <div className="overflow-x-auto">
        <table className="w-full text-sm min-w-[700px]">
          <thead className="bg-accent/50 border-b border-pop">
            <tr>
              <th className="px-4 sm:px-6 py-3 text-left font-semibold">Invoice ID</th>
              <th className="px-4 sm:px-6 py-3 text-left font-semibold">Customer</th>
              <th className="px-4 sm:px-6 py-3 text-left font-semibold">Amount</th>
              <th className="px-4 sm:px-6 py-3 text-left font-semibold">Status</th>
              <th className="px-4 sm:px-6 py-3 text-left font-semibold">Due Date</th>
              <th className="px-4 sm:px-6 py-3 text-left font-semibold">Shipments</th>
              <th className="px-4 sm:px-6 py-3 text-left font-semibold text-right">Actions</th>
            </tr>
          </thead>
          <tbody>
            {loading && (
              <>
                {Array.from({ length: 5 }).map((_, index) => (
                  <tr key={`invoice-skeleton-${index}`} className="border-b border-pop">
                    <td className="px-6 py-4">
                      <Skeleton className="h-4 w-32" />
                    </td>
                    <td className="px-6 py-4">
                      <Skeleton className="h-4 w-40" />
                    </td>
                    <td className="px-6 py-4">
                      <Skeleton className="h-4 w-24" />
                    </td>
                    <td className="px-6 py-4">
                      <Skeleton className="h-5 w-20" />
                    </td>
                    <td className="px-6 py-4">
                      <Skeleton className="h-4 w-28" />
                    </td>
                    <td className="px-6 py-4 text-center">
                      <Skeleton className="h-4 w-10 mx-auto" />
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex justify-end">
                        <Skeleton className="h-8 w-8" />
                      </div>
                    </td>
                  </tr>
                ))}
              </>
            )}
            {!loading &&
              invoices.map((invoice) => (
                <tr
                  key={invoice.id}
                  className="border-b border-pop hover:bg-accent/30 transition-colors"
                >
                  <td className="px-6 py-4 font-mono text-primary">
                    <div className="flex flex-col">
                      <span>{invoice.id}</span>
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
                  <td className="px-6 py-4">{formatDate(invoice.dueDate)}</td>
                  <td className="px-6 py-4 text-center">{invoice.shipments}</td>
                  <td className="px-6 py-4">
                    <div className="flex items-center justify-end">
                      <DropdownMenu modal={false}>
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
                            onClick={() => onOpenManageShipments(invoice)}
                          >
                            Shipments
                          </DropdownMenuItem>
                          <DropdownMenuItem
                            onClick={() => onViewInvoice(invoice)}
                          >
                            View invoice
                          </DropdownMenuItem>
                          <DropdownMenuItem
                            onClick={() => onDownload(invoice)}
                            disabled={!!actionLoading[invoice.dbId]}
                          >
                            {actionLoading[invoice.dbId]
                              ? "Preparing PDF..."
                              : "Download PDF"}
                          </DropdownMenuItem>
                          <DropdownMenuSeparator />
                          <DropdownMenuItem
                            onClick={() => onEditInvoice(invoice)}
                            disabled={!canEdit}
                          >
                            Edit
                          </DropdownMenuItem>
                          <DropdownMenuItem
                            onClick={() => onSendSms(invoice)}
                            disabled={!!actionLoading[invoice.dbId]}
                          >
                            {actionLoading[invoice.dbId]
                              ? "Sending WhatsApp..."
                              : "Send via WhatsApp"}
                          </DropdownMenuItem>
                          <DropdownMenuItem
                            variant="destructive"
                            onClick={() => onDeleteInvoice(invoice)}
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
        {!loading && invoices.length === 0 && (
          <EmptyState
            variant="invoices"
            title={
              searchTerm || filterStatus !== "all"
                ? "No matching invoices"
                : "No invoices yet"
            }
            description={
              searchTerm || filterStatus !== "all"
                ? "Try adjusting your search or filter criteria."
                : "Create your first invoice to start tracking payments."
            }
          />
        )}
      </div>
    </Card>
  );
}
