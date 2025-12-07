"use client";

import { useState, type FormEvent } from "react";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";

interface TicketState {
  email: string;
  shipmentRef: string;
  subject: string;
  description: string;
}

export function LandingTicketForm() {
  const [form, setForm] = useState<TicketState>({
    email: "",
    shipmentRef: "",
    subject: "",
    description: "",
  });
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [ticketId, setTicketId] = useState<string | null>(null);

  const handleChange = (field: keyof TicketState) =>
    (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
      setForm((prev) => ({ ...prev, [field]: e.target.value }));
    };

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setError(null);
    setTicketId(null);

    const email = form.email.trim();
    const subject = form.subject.trim();
    const description = form.description.trim();
    const shipmentRef = form.shipmentRef.trim();

    if (!email || !subject || !description) {
      setError("Email, subject, and details are required.");
      return;
    }

    setSubmitting(true);
    try {
      const res = await fetch("/api/public/support", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email,
          shipmentRef: shipmentRef || null,
          subject,
          description,
        }),
      });

      const json = await res.json().catch(() => null);

      if (!res.ok) {
        setError(
          (json && typeof json.error === "string" && json.error) ||
            "Could not create support ticket. Please try again.",
        );
        return;
      }

      setTicketId(json?.ticketId ?? null);
      setForm({ email, shipmentRef: "", subject: "", description: "" });
    } catch (err: any) {
      setError(err?.message ?? "Something went wrong while creating a ticket.");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <Card className="bg-card/90 border-border/80 p-4 flex flex-col gap-3">
      <div className="space-y-1">
        <p className="text-xs font-semibold tracking-[0.18em] uppercase text-muted-foreground/90">
          Raise a ticket
        </p>
        <p className="text-xs text-muted-foreground">
          Share your email and reference so our ops team can follow up about a
          shipment or invoice.
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-3 text-xs">
        <div className="space-y-1">
          <label className="block font-medium">Email</label>
          <Input
            type="email"
            value={form.email}
            onChange={handleChange("email")}
            placeholder="you@example.com"
            className="h-8 text-xs"
          />
        </div>

        <div className="space-y-1">
          <label className="block font-medium">Shipment or invoice reference (optional)</label>
          <Input
            value={form.shipmentRef}
            onChange={handleChange("shipmentRef")}
            placeholder="e.g. TG-SHP-2024-0001 or invoice number"
            className="h-8 text-xs"
          />
        </div>

        <div className="space-y-1">
          <label className="block font-medium">Subject</label>
          <Input
            value={form.subject}
            onChange={handleChange("subject")}
            placeholder="Short summary of the issue"
            className="h-8 text-xs"
          />
        </div>

        <div className="space-y-1">
          <label className="block font-medium">Details</label>
          <Textarea
            rows={4}
            value={form.description}
            onChange={handleChange("description")}
            placeholder="Tell us what happened so we can investigate."
            className="text-xs bg-background"
          />
        </div>

        {error && <p className="text-[11px] text-destructive">{error}</p>}
        {ticketId && !error && (
          <p className="text-[11px] text-emerald-400">
            Ticket created with reference <span className="font-mono">{ticketId}</span>.
            Our team will contact you by email.
          </p>
        )}

        <div className="flex justify-end pt-1">
          <Button
            type="submit"
            size="sm"
            disabled={submitting}
            className="h-8 px-4 text-xs"
          >
            {submitting ? "Submitting..." : "Submit ticket"}
          </Button>
        </div>
      </form>
    </Card>
  );
}
