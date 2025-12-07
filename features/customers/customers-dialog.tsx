"use client";

import * as React from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import type { UseFormReturn } from "react-hook-form";
import type { CustomerFormValues } from "@/lib/validations";
import type { UICustomer } from "@/features/customers/types";

interface CustomersDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  canEdit: boolean;
  isCreating: boolean;
  editingCustomer: UICustomer | null;
  form: UseFormReturn<CustomerFormValues>;
  onSubmit: (values: CustomerFormValues) => void;
  onNewCustomerClick: () => void;
}

export function CustomersDialog({
  open,
  onOpenChange,
  canEdit,
  isCreating,
  editingCustomer,
  form,
  onSubmit,
  onNewCustomerClick,
}: CustomersDialogProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <Button
        type="button"
        className="h-9 px-4 bg-primary hover:bg-primary/90 w-full sm:w-auto"
        disabled={!canEdit}
        onClick={onNewCustomerClick}
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
            onSubmit={form.handleSubmit(onSubmit)}
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
                    <Input
                      placeholder="Imphal, New Delhi, ..."
                      {...field}
                    />
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
  );
}
