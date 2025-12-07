export type TicketStatus = "open" | "in-progress" | "resolved" | string;
export type TicketPriority = "low" | "medium" | "high" | string;

export interface UITicket {
  dbId: string;
  subject: string;
  customerName: string;
  status: TicketStatus;
  priority: TicketPriority;
  createdAt: string;
  resolvedAt: string | null;
}
