"use client";

import { useState } from "react";
import { format } from "date-fns";
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
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Loader2, Plane, Truck, Train, Ship } from "lucide-react";
import { toast } from "sonner";

interface Shipment {
  id: string;
  shipment_ref: string;
  origin?: string | null;
  destination?: string | null;
  etd?: string | null;
  atd?: string | null;
  eta?: string | null;
  ata?: string | null;
  carrier_name?: string | null;
  awb_number?: string | null;
  transport_mode?: string | null;
  eta_notes?: string | null;
}

interface ETAUpdateDialogProps {
  shipment: Shipment | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess?: () => void;
}

const transportModes = [
  { value: "air", label: "Air Cargo", icon: Plane },
  { value: "road", label: "Road Transport", icon: Truck },
  { value: "rail", label: "Rail Freight", icon: Train },
  { value: "sea", label: "Sea Freight", icon: Ship },
];

function formatDateTimeLocal(isoString: string | null | undefined): string {
  if (!isoString) return "";
  try {
    const date = new Date(isoString);
    return format(date, "yyyy-MM-dd'T'HH:mm");
  } catch {
    return "";
  }
}

export function ETAUpdateDialog({
  shipment,
  open,
  onOpenChange,
  onSuccess,
}: ETAUpdateDialogProps) {
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    etd: "",
    atd: "",
    eta: "",
    ata: "",
    carrier_name: "",
    awb_number: "",
    transport_mode: "",
    eta_notes: "",
  });

  // Reset form when shipment changes
  useState(() => {
    if (shipment) {
      setFormData({
        etd: formatDateTimeLocal(shipment.etd),
        atd: formatDateTimeLocal(shipment.atd),
        eta: formatDateTimeLocal(shipment.eta),
        ata: formatDateTimeLocal(shipment.ata),
        carrier_name: shipment.carrier_name || "",
        awb_number: shipment.awb_number || "",
        transport_mode: shipment.transport_mode || "",
        eta_notes: shipment.eta_notes || "",
      });
    }
  });

  // Update form when dialog opens with new shipment
  const handleOpenChange = (isOpen: boolean) => {
    if (isOpen && shipment) {
      setFormData({
        etd: formatDateTimeLocal(shipment.etd),
        atd: formatDateTimeLocal(shipment.atd),
        eta: formatDateTimeLocal(shipment.eta),
        ata: formatDateTimeLocal(shipment.ata),
        carrier_name: shipment.carrier_name || "",
        awb_number: shipment.awb_number || "",
        transport_mode: shipment.transport_mode || "",
        eta_notes: shipment.eta_notes || "",
      });
    }
    onOpenChange(isOpen);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!shipment) return;

    setLoading(true);
    try {
      const payload: Record<string, any> = {};

      // Only include fields that have values or are being cleared
      if (formData.etd) payload.etd = new Date(formData.etd).toISOString();
      else if (shipment.etd) payload.etd = null;

      if (formData.atd) payload.atd = new Date(formData.atd).toISOString();
      else if (shipment.atd) payload.atd = null;

      if (formData.eta) payload.eta = new Date(formData.eta).toISOString();
      else if (shipment.eta) payload.eta = null;

      if (formData.ata) payload.ata = new Date(formData.ata).toISOString();
      else if (shipment.ata) payload.ata = null;

      payload.carrier_name = formData.carrier_name || null;
      payload.awb_number = formData.awb_number || null;
      payload.transport_mode = formData.transport_mode || null;
      payload.eta_notes = formData.eta_notes || null;

      const res = await fetch(`/api/shipments/${shipment.id}/eta`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || "Failed to update ETA");
      }

      toast.success("ETA updated successfully");
      onOpenChange(false);
      onSuccess?.();
    } catch (error) {
      console.error("ETA update error:", error);
      toast.error(error instanceof Error ? error.message : "Failed to update ETA");
    } finally {
      setLoading(false);
    }
  };

  if (!shipment) return null;

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Update Delivery Timeline</DialogTitle>
          <DialogDescription>
            Update ETA for shipment{" "}
            <span className="font-mono font-medium">{shipment.shipment_ref}</span>
            <br />
            <span className="text-xs">
              {shipment.origin} → {shipment.destination}
            </span>
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Transport Mode & Carrier */}
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <Label htmlFor="transport_mode">Transport Mode</Label>
              <Select
                value={formData.transport_mode}
                onValueChange={(v) =>
                  setFormData((prev) => ({ ...prev, transport_mode: v }))
                }
              >
                <SelectTrigger id="transport_mode">
                  <SelectValue placeholder="Select mode" />
                </SelectTrigger>
                <SelectContent>
                  {transportModes.map((mode) => (
                    <SelectItem key={mode.value} value={mode.value}>
                      <div className="flex items-center gap-2">
                        <mode.icon className="h-4 w-4" />
                        {mode.label}
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="carrier_name">Carrier Name</Label>
              <Input
                id="carrier_name"
                placeholder="e.g., IndiGo Airlines"
                value={formData.carrier_name}
                onChange={(e) =>
                  setFormData((prev) => ({ ...prev, carrier_name: e.target.value }))
                }
              />
            </div>
          </div>

          {/* AWB Number */}
          <div className="space-y-1.5">
            <Label htmlFor="awb_number">AWB / Tracking Number</Label>
            <Input
              id="awb_number"
              placeholder="e.g., 6E-2024-IMF-DEL"
              value={formData.awb_number}
              onChange={(e) =>
                setFormData((prev) => ({ ...prev, awb_number: e.target.value }))
              }
            />
          </div>

          {/* Departure Times */}
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <Label htmlFor="etd">Est. Departure (ETD)</Label>
              <Input
                id="etd"
                type="datetime-local"
                value={formData.etd}
                onChange={(e) =>
                  setFormData((prev) => ({ ...prev, etd: e.target.value }))
                }
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="atd">Actual Departure (ATD)</Label>
              <Input
                id="atd"
                type="datetime-local"
                value={formData.atd}
                onChange={(e) =>
                  setFormData((prev) => ({ ...prev, atd: e.target.value }))
                }
              />
            </div>
          </div>

          {/* Arrival Times */}
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <Label htmlFor="eta">Est. Arrival (ETA)</Label>
              <Input
                id="eta"
                type="datetime-local"
                value={formData.eta}
                onChange={(e) =>
                  setFormData((prev) => ({ ...prev, eta: e.target.value }))
                }
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="ata">Actual Arrival (ATA)</Label>
              <Input
                id="ata"
                type="datetime-local"
                value={formData.ata}
                onChange={(e) =>
                  setFormData((prev) => ({ ...prev, ata: e.target.value }))
                }
              />
            </div>
          </div>

          {/* Notes */}
          <div className="space-y-1.5">
            <Label htmlFor="eta_notes">Notes (visible to customer)</Label>
            <Textarea
              id="eta_notes"
              placeholder="e.g., Consolidated with manifest MNF-2512-001. Expected delivery by Dec 7th."
              value={formData.eta_notes}
              onChange={(e) =>
                setFormData((prev) => ({ ...prev, eta_notes: e.target.value }))
              }
              rows={2}
            />
          </div>

          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              disabled={loading}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={loading}>
              {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Update ETA
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
