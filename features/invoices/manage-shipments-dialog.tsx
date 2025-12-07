"use client";

import * as React from "react";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import type { UIInvoice } from "@/features/invoices/types";

interface InvoiceShipmentLink {
  id: string;
  shipmentRef: string;
}

interface ManageShipmentsDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  activeInvoice: UIInvoice | null;
  invoiceShipments: InvoiceShipmentLink[];
  shipmentsLoading: boolean;
  newShipmentRef: string;
  onNewShipmentRefChange: (value: string) => void;
  linkingShipment: boolean;
  onCopyTrackingLink: (shipmentRef: string) => void;
  onAddShipmentToInvoice: () => void;
}

export function ManageShipmentsDialog({
  open,
  onOpenChange,
  activeInvoice,
  invoiceShipments,
  shipmentsLoading,
  newShipmentRef,
  onNewShipmentRefChange,
  linkingShipment,
  onCopyTrackingLink,
  onAddShipmentToInvoice,
}: ManageShipmentsDialogProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>
            {activeInvoice
              ? `Manage shipments · ${activeInvoice.id}`
              : "Manage shipments"}
          </DialogTitle>
          <DialogDescription>
            Link shipments to this invoice using their shipment reference.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          <div className="space-y-2">
            <p className="text-xs text-muted-foreground">Linked shipments</p>
            {shipmentsLoading ? (
              <p className="text-xs text-muted-foreground">
                Loading shipments...
              </p>
            ) : invoiceShipments.length === 0 ? (
              <p className="text-xs text-muted-foreground">
                No shipments linked yet.
              </p>
            ) : (
              <ul className="space-y-1 text-sm max-h-40 overflow-y-auto">
                {invoiceShipments.map((s) => (
                  <li
                    key={s.id}
                    className="flex items-center justify-between border-b border-border/40 last:border-b-0 py-1"
                  >
                    <span className="font-mono text-xs">{s.shipmentRef}</span>
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      className="ml-2 h-7 px-2 text-[10px] uppercase"
                      onClick={() => onCopyTrackingLink(s.shipmentRef)}
                    >
                      Copy link
                    </Button>
                  </li>
                ))}
              </ul>
            )}
          </div>

          <div className="space-y-2">
            <p className="text-xs text-muted-foreground">
              Add shipment by reference
            </p>
            <div className="flex gap-2">
              <Input
                placeholder="Enter shipment reference..."
                value={newShipmentRef}
                onChange={(e) => onNewShipmentRefChange(e.target.value)}
                className="flex-1"
              />
              <Button
                type="button"
                className="bg-primary hover:bg-primary/90"
                disabled={linkingShipment || !newShipmentRef.trim()}
                onClick={onAddShipmentToInvoice}
              >
                {linkingShipment ? "Adding..." : "Add"}
              </Button>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
