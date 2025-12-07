import { z } from "zod";

export const ticketSchema = z.object({
  subject: z.string().min(5, "Subject is required"),
  customerId: z.string().optional().or(z.literal("")),
  priority: z.enum(["low", "medium", "high"]).default("medium"),
});

export type TicketFormValues = z.infer<typeof ticketSchema>;
