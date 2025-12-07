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
import type { UIWarehouse } from "@/features/warehouse/types";

interface WarehouseFormValuesShape {
  name: string;
  location: string;
  staff?: number;
  docks?: number;
  status: "operational" | "constrained" | "offline";
}

interface WarehouseDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  canEdit: boolean;
  isCreating: boolean;
  editingWarehouse: UIWarehouse | null;
  form: UseFormReturn<any>;
  onSubmit: (values: WarehouseFormValuesShape) => void;
  onNewWarehouseClick: () => void;
}

export function WarehouseDialog({
  open,
  onOpenChange,
  canEdit,
  isCreating,
  editingWarehouse,
  form,
  onSubmit,
  onNewWarehouseClick,
}: WarehouseDialogProps) {
  return (
    <Dialog open={open} modal={false} onOpenChange={onOpenChange}>
      <Button
        type="button"
        className="bg-primary hover:bg-primary/90"
        disabled={!canEdit}
        onClick={onNewWarehouseClick}
      >
        New Warehouse
      </Button>

      <DialogContent>
        <DialogHeader>
          <DialogTitle>
            {editingWarehouse ? "Edit warehouse" : "New warehouse"}
          </DialogTitle>
          <DialogDescription>
            Add a new warehouse or hub to the Tapan Go network.
          </DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form
            className="space-y-4 mt-2"
            onSubmit={form.handleSubmit(onSubmit as any)}
          >
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Name</FormLabel>
                  <FormControl>
                    <Input
                      placeholder="Singjamei Imphal, Kotla New Delhi, ..."
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="location"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Location</FormLabel>
                  <FormControl>
                    <Input
                      placeholder="Address or area name"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="staff"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Staff count</FormLabel>
                    <FormControl>
                      <Input
                        type="number"
                        min="0"
                        placeholder="e.g. 5"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="docks"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Dock doors</FormLabel>
                    <FormControl>
                      <Input
                        type="number"
                        min="0"
                        placeholder="e.g. 2"
                        {...field}
                      />
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
                        <SelectItem value="operational">Operational</SelectItem>
                        <SelectItem value="constrained">Constrained</SelectItem>
                        <SelectItem value="offline">Offline</SelectItem>
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
                disabled={isCreating}
              >
                {isCreating
                  ? editingWarehouse
                    ? "Saving..."
                    : "Creating..."
                  : editingWarehouse
                  ? "Save changes"
                  : "Create warehouse"}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
