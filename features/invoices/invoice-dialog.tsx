"use client";

import * as React from "react";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import type { UseFormReturn } from "react-hook-form";
import type { InvoiceFormValues } from "@/lib/validations";
import type { UIInvoice } from "@/features/invoices/types";

interface InvoiceDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  canEdit: boolean;
  isCreating: boolean;
  editingInvoice: UIInvoice | null;
  customers: { id: string; name: string }[];
  form: UseFormReturn<InvoiceFormValues>;
  onSubmit: (values: InvoiceFormValues) => void;
  onNewInvoiceClick: () => void;
  onExportCsv: () => void;
}

export function InvoiceDialog({
  open,
  onOpenChange,
  canEdit,
  isCreating,
  editingInvoice,
  customers,
  form,
  onSubmit,
  onNewInvoiceClick,
  onExportCsv,
}: InvoiceDialogProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <Button
        type="button"
        className="bg-primary hover:bg-primary/90"
        disabled={!canEdit}
        onClick={onNewInvoiceClick}
      >
        New Invoice
      </Button>
      <Button
        type="button"
        variant="outline"
        className="ml-0 sm:ml-2 mt-2 sm:mt-0"
        onClick={onExportCsv}
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
            onSubmit={form.handleSubmit(onSubmit)}
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
                onClick={() => onOpenChange(false)}
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
  );
}
