"use client";

import * as React from "react";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import type {
  UITicket,
  TicketStatus,
} from "@/features/support/types";

interface SupportTicketsTableProps {
  loading: boolean;
  filteredTickets: UITicket[];
  formatDateTime: (value: string | null) => string;
  getStatusColor: (status: string) => string;
  getPriorityColor: (priority: string) => string;
  updatingStatusId: string | null;
  onUpdateStatus: (ticket: UITicket, nextStatus: TicketStatus) => void;
}

export function SupportTicketsTable({
  loading,
  filteredTickets,
  formatDateTime,
  getStatusColor,
  getPriorityColor,
  updatingStatusId,
  onUpdateStatus,
}: SupportTicketsTableProps) {
  return (
    <Card className="border-pop">
      <div className="overflow-x-auto">
        <table className="w-full text-sm min-w-[800px]">
          <thead className="bg-accent/50 border-b border-pop">
            <tr>
              <th className="px-6 py-3 text-left font-semibold">Subject</th>
              <th className="px-6 py-3 text-left font-semibold">Customer</th>
              <th className="px-6 py-3 text-left font-semibold">Status</th>
              <th className="px-6 py-3 text-left font-semibold">Priority</th>
              <th className="px-6 py-3 text-left font-semibold">Created</th>
              <th className="px-6 py-3 text-left font-semibold">Resolved</th>
              <th className="px-6 py-3 text-left font-semibold text-right">Actions</th>
            </tr>
          </thead>
          <tbody>
            {loading && (
              <>
                {Array.from({ length: 5 }).map((_, index) => (
                  <tr
                    key={`ticket-skeleton-${index}`}
                    className="border-b border-pop"
                  >
                    <td className="px-6 py-4">
                      <Skeleton className="h-4 w-64" />
                    </td>
                    <td className="px-6 py-4">
                      <Skeleton className="h-4 w-40" />
                    </td>
                    <td className="px-6 py-4">
                      <Skeleton className="h-5 w-20" />
                    </td>
                    <td className="px-6 py-4">
                      <Skeleton className="h-5 w-20" />
                    </td>
                    <td className="px-6 py-4">
                      <Skeleton className="h-4 w-28" />
                    </td>
                    <td className="px-6 py-4">
                      <Skeleton className="h-4 w-28" />
                    </td>
                    <td className="px-6 py-4 text-right">
                      <Skeleton className="h-8 w-28 ml-auto" />
                    </td>
                  </tr>
                ))}
              </>
            )}
            {!loading &&
              filteredTickets.map((ticket) => (
                <tr
                  key={ticket.dbId}
                  className="border-b border-pop hover:bg-accent/30 transition-colors"
                >
                  <td className="px-6 py-4 max-w-xs truncate">
                    <span className="font-medium text-foreground">
                      {ticket.subject}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    {ticket.customerName || "—"}
                  </td>
                  <td className="px-6 py-4">
                    <Badge className={getStatusColor(ticket.status)}>
                      {ticket.status.toUpperCase()}
                    </Badge>
                  </td>
                  <td className="px-6 py-4">
                    <Badge className={getPriorityColor(ticket.priority)}>
                      {ticket.priority.toUpperCase()}
                    </Badge>
                  </td>
                  <td className="px-6 py-4">
                    {formatDateTime(ticket.createdAt)}
                  </td>
                  <td className="px-6 py-4">
                    {ticket.resolvedAt ?
                      formatDateTime(ticket.resolvedAt) :
                      "—"}
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center justify-end">
                      <select
                        value={ticket.status}
                        onChange={(e) =>
                          onUpdateStatus(
                            ticket,
                            e.target.value as TicketStatus
                          )
                        }
                        disabled={updatingStatusId === ticket.dbId}
                        className="border border-input bg-background px-2 py-1 text-[11px] uppercase tracking-wide"
                      >
                        <option value="open">Open</option>
                        <option value="in-progress">In Progress</option>
                        <option value="resolved">Resolved</option>
                      </select>
                    </div>
                  </td>
                </tr>
              ))}
          </tbody>
        </table>
      </div>
    </Card>
  );
}
