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
import type { UIShipment } from "@/features/shipments/types";

// Keep types generic here to avoid coupling to internal page-level zod schema.
interface ShipmentFormValuesShape {
  shipmentRef: string;
  customerId?: string;
  route: string;
  weight: number;
  status: "pending" | "in-transit" | "at-warehouse" | "delivered" | "cancelled" | string;
}

type ShipmentStatusOption = string;

interface ShipmentsDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  canEdit: boolean;
  isCreating: boolean;
  editingShipment: UIShipment | null;
  customers: { id: string; name: string }[];
  form: UseFormReturn<any>;
  onSubmit: (values: ShipmentFormValuesShape) => void;
  onNewShipmentClick: () => void;
  serviceRoutes: readonly { origin: string; destination: string; location: string; label: string }[];
  statusOptions: readonly ShipmentStatusOption[];
}

export function ShipmentsDialog({
  open,
  onOpenChange,
  canEdit,
  isCreating,
  editingShipment,
  customers,
  form,
  onSubmit,
  onNewShipmentClick,
  serviceRoutes,
  statusOptions,
}: ShipmentsDialogProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <Button
        type="button"
        className="bg-primary hover:bg-primary/90"
        disabled={!canEdit}
        onClick={onNewShipmentClick}
      >
        New Shipment
      </Button>

      <DialogContent>
        <DialogHeader>
          <DialogTitle>{editingShipment ? "Edit shipment" : "New shipment"}</DialogTitle>
          <DialogDescription>
            {editingShipment
              ? "Update shipment details for operations and tracking."
              : "Create a new shipment for today&apos;s cargo operations."}
          </DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form
            className="space-y-4 mt-2"
            onSubmit={form.handleSubmit(onSubmit as any)}
          >
            <FormField
              control={form.control}
              name="shipmentRef"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Shipment reference</FormLabel>
                  <FormControl>
                    <Input
                      placeholder="e.g. TG-IMPH-0001"
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
                      value={field.value || "__unassigned__"}
                      onValueChange={(value) =>
                        field.onChange(value === "__unassigned__" ? "" : value)
                      }
                    >
                      <SelectTrigger className="w-full">
                        <SelectValue placeholder="Unassigned" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="__unassigned__">Unassigned</SelectItem>
                        {customers.map((customer) => (
                          <SelectItem key={customer.id} value={customer.id}>
                            {customer.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="route"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Service Route</FormLabel>
                  <FormControl>
                    <Select value={field.value} onValueChange={field.onChange}>
                      <SelectTrigger className="w-full">
                        <SelectValue placeholder="Select route" />
                      </SelectTrigger>
                      <SelectContent>
                        {serviceRoutes.map((route, index) => (
                          <SelectItem key={index} value={String(index)}>
                            {route.label}
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
                name="weight"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Weight (kg)</FormLabel>
                    <FormControl>
                      <Input
                        type="number"
                        step="0.1"
                        min="0"
                        placeholder="Total chargeable weight"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

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
                        defaultValue={field.value}
                      >
                        <SelectTrigger className="w-full">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          {statusOptions.map((status) => (
                            <SelectItem key={status} value={status}>
                              {status.charAt(0).toUpperCase() + status.slice(1)}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

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
                  ? editingShipment
                    ? "Saving..."
                    : "Creating..."
                  : editingShipment
                  ? "Save changes"
                  : "Create shipment"}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
