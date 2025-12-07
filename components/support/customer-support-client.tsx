"use client";

import Link from "next/link";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";

import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { AiSupportChat } from "@/components/support/ai-support-chat";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { useToast } from "@/hooks/use-toast";

const supportFormSchema = z.object({
  email: z
    .string()
    .min(3, "Email is required")
    .email("Enter a valid email address"),
  name: z
    .string()
    .min(2, "Name is required")
    .max(80, "Name is too long"),
  shipmentRef: z.string().max(120).optional().or(z.literal("")),
  subject: z.string().min(5, "Tell us briefly what this is about"),
  description: z
    .string()
    .min(10, "Add a few more details so our team can help"),
});

export type SupportFormValues = z.infer<typeof supportFormSchema>;

export function CustomerSupportClient() {
  const { toast } = useToast();
  const [submitting, setSubmitting] = useState(false);
  const [ticketId, setTicketId] = useState<string | null>(null);

  const form = useForm<SupportFormValues>({
    resolver: zodResolver(supportFormSchema),
    defaultValues: {
      email: "",
      name: "",
      shipmentRef: "",
      subject: "",
      description: "",
    },
  });

  const handleSubmit = async (values: SupportFormValues) => {
    setSubmitting(true);
    setTicketId(null);

    try {
      const payload = {
        email: values.email.trim(),
        name: values.name?.trim() || null,
        shipmentRef: values.shipmentRef?.trim() || null,
        subject: values.subject.trim(),
        description: values.description.trim(),
      };

      const res = await fetch("/api/public/support", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const json = await res.json();

      if (!res.ok) {
        toast({
          title: "Could not create ticket",
          description:
            (typeof json?.error === "string" && json.error) ||
            "Something went wrong while creating your ticket.",
          variant: "destructive",
        });
        return;
      }

      setTicketId(json.ticketId as string | null);
      toast({
        title: "Ticket submitted",
        description:
          "Your issue has been logged with the Tapan Go support team.",
      });
      form.reset({
        email: values.email,
        name: values.name ?? "",
        shipmentRef: "",
        subject: "",
        description: "",
      });
    } catch (error: any) {
      toast({
        title: "Could not create ticket",
        description:
          error?.message || "Something went wrong while creating your ticket.",
        variant: "destructive",
      });
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <header className="border-b border-border">
        <div className="flex items-center justify-between px-6 lg:px-8 py-4 max-w-6xl mx-auto">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-lg bg-gradient-to-br from-orange-500 to-orange-600 flex items-center justify-center text-xl font-display">
              📦
            </div>
            <div className="flex flex-col">
              <span className="text-base font-display font-bold tracking-wide">
                TAPAN GO
              </span>
              <span className="text-xs uppercase tracking-widest text-muted-foreground">
                Customer Support
              </span>
            </div>
          </div>

          <Button asChild variant="ghost" size="sm" className="h-9 px-3">
            <Link href="/">Back to overview</Link>
          </Button>
        </div>
      </header>

      <main className="flex-1 flex items-center justify-center px-4 py-8 lg:py-10">
        <div className="w-full max-w-5xl grid gap-8 lg:gap-10 lg:grid-cols-[minmax(0,1.2fr)_minmax(0,1fr)] items-start">
          <section className="space-y-5 max-w-xl">
            <div className="inline-flex items-center gap-2 rounded-full border border-border/60 bg-background/60 px-3 py-1 text-[10px] md:text-[11px] tracking-[0.18em] uppercase text-muted-foreground">
              <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
              <span>Shipment questions · Delivery issues · Northeast corridor</span>
            </div>
            <h1 className="text-2xl md:text-3xl font-display font-bold leading-tight">
              Reach Tapan Go support.
            </h1>
            <p className="text-sm text-muted-foreground max-w-prose leading-relaxed">
              Share your email and shipment details so our operations team can
              investigate and get back to you. This form is for customers and
              partners using the public network.
            </p>
            <ul className="text-[11px] md:text-xs text-muted-foreground space-y-1">
              <li>• Use the same email you used for your booking or enquiry.</li>
              <li>• Include a shipment or barcode reference if you have one.</li>
              <li>• Our team will follow up using the email you provide.</li>
            </ul>

            {ticketId && (
              <p className="text-xs text-emerald-400 bg-emerald-500/10 border border-emerald-500/30 rounded-md px-3 py-2 mt-2">
                Ticket created with reference <span className="font-mono">{ticketId}</span>.
                You can mention this ID when talking to support.
              </p>
            )}
          </section>

          <section className="w-full max-w-md ml-auto space-y-4">
            <AiSupportChat />

            <Card className="p-6 bg-card/90 border-border/80 shadow-[0_18px_60px_rgba(0,0,0,0.7)]">
              <div className="mb-4 space-y-1">
                <h2 className="text-sm font-semibold">Raise a ticket</h2>
                <p className="text-xs text-muted-foreground">
                  We&apos;ll use your email to follow up about this request.
                </p>
              </div>

              <Form {...form}>
                <form
                  className="space-y-4"
                  onSubmit={form.handleSubmit(handleSubmit)}
                >
                  <FormField
                    control={form.control}
                    name="email"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Email</FormLabel>
                        <FormControl>
                          <Input
                            type="email"
                            placeholder="you@tapango.logistics"
                            autoComplete="email"
                            {...field}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="name"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Name</FormLabel>
                        <FormControl>
                          <Input placeholder="Your name" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="shipmentRef"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Shipment or barcode reference (optional)</FormLabel>
                        <FormControl>
                          <Input
                            placeholder="e.g. TG-SHP-2024-0001 or barcode number"
                            {...field}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="subject"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Subject</FormLabel>
                        <FormControl>
                          <Input placeholder="Short summary of the issue" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="description"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Details</FormLabel>
                        <FormControl>
                          <Textarea
                            rows={4}
                            placeholder="Tell us what happened, when, and where so we can investigate."
                            {...field}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <div className="flex justify-end pt-1">
                    <Button
                      type="submit"
                      className="bg-primary hover:bg-primary/90"
                      disabled={submitting}
                    >
                      {submitting ? "Submitting..." : "Submit ticket"}
                    </Button>
                  </div>
                </form>
              </Form>
            </Card>
          </section>
        </div>
      </main>
    </div>
  );
}
