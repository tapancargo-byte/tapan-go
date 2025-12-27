"use client";

import {
	Download,
	Edit,
	Eye,
	MessageSquare,
	MoreHorizontal,
	Package,
	Trash2,
} from "lucide-react";
import Link from "next/link";
import type * as React from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import {
	DropdownMenu,
	DropdownMenuContent,
	DropdownMenuItem,
	DropdownMenuSeparator,
	DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { EmptyState } from "@/components/ui/empty-state";
import { Skeleton } from "@/components/ui/skeleton";
import type { UIInvoice } from "@/features/invoices/types";
import { cn } from "@/lib/utils";

interface InvoicesTableProps {
	loading: boolean;
	invoices: UIInvoice[];
	actionLoading: Record<string, boolean>;
	canEdit: boolean;
	renderSmsStatus: (invoiceId: string) => React.ReactNode;
	getStatusColor: (status: string) => string;
	onOpenManageShipments: (invoice: UIInvoice) => void;
	onViewInvoice: (invoice: UIInvoice) => void;
	onDownload: (invoice: UIInvoice) => void;
	onEditInvoice: (invoice: UIInvoice) => void;
	onSendSms: (invoice: UIInvoice) => void;
	onDeleteInvoice: (invoice: UIInvoice) => void;
	searchTerm: string;
	filterStatus: string;
	formatDate: (value: string) => string;
	selectedIds?: Set<string>;
	onSelect?: (id: string, selected: boolean) => void;
	onSelectAll?: (selected: boolean) => void;
}

export function InvoicesTable({
	loading,
	invoices,
	actionLoading,
	canEdit,
	renderSmsStatus,
	onOpenManageShipments,
	onViewInvoice,
	onDownload,
	onEditInvoice,
	onSendSms,
	onDeleteInvoice,
	searchTerm,
	filterStatus,
	formatDate,
	selectedIds,
	onSelect,
	onSelectAll,
}: InvoicesTableProps) {
	const allSelected =
		invoices.length > 0 &&
		selectedIds &&
		invoices.every((inv) => selectedIds.has(inv.dbId));
	const someSelected = selectedIds && selectedIds.size > 0 && !allSelected;

	return (
		<Card className="border-border shadow-md overflow-hidden pb-12">
			<div className="overflow-x-auto">
				<table className="w-full text-sm min-w-[800px]">
					<thead className="bg-muted/50 border-b border-border">
						<tr>
							<th className="px-6 py-4 w-[40px]">
								<Checkbox
									checked={
										allSelected ? true : someSelected ? "indeterminate" : false
									}
									onCheckedChange={(checked) => onSelectAll?.(!!checked)}
									aria-label="Select all"
								/>
							</th>
							<th className="px-6 py-4 text-left font-medium text-muted-foreground uppercase tracking-wider text-xs">
								Invoice ID
							</th>
							<th className="px-6 py-4 text-left font-medium text-muted-foreground uppercase tracking-wider text-xs">
								Customer
							</th>
							<th className="px-6 py-4 text-left font-medium text-muted-foreground uppercase tracking-wider text-xs">
								Amount
							</th>
							<th className="px-6 py-4 text-left font-medium text-muted-foreground uppercase tracking-wider text-xs">
								Status
							</th>
							<th className="px-6 py-4 text-left font-medium text-muted-foreground uppercase tracking-wider text-xs">
								Due Date
							</th>
							<th className="px-6 py-4 text-center font-medium text-muted-foreground uppercase tracking-wider text-xs">
								Shipments
							</th>
							<th className="px-6 py-4 text-right font-medium text-muted-foreground uppercase tracking-wider text-xs">
								Actions
							</th>
						</tr>
					</thead>
					<tbody className="divide-y divide-border/50">
						{loading &&
							Array.from({ length: 5 }).map((_, index) => (
								<tr
									key={`invoice-skeleton-${index}`}
									className="border-b border-border"
								>
									<td className="px-6 py-4">
										<Skeleton className="h-4 w-4" />
									</td>
									<td className="px-6 py-4">
										<Skeleton className="h-4 w-32" />
									</td>
									<td className="px-6 py-4">
										<Skeleton className="h-4 w-40" />
									</td>
									<td className="px-6 py-4">
										<Skeleton className="h-4 w-24" />
									</td>
									<td className="px-6 py-4">
										<Skeleton className="h-5 w-20" />
									</td>
									<td className="px-6 py-4">
										<Skeleton className="h-4 w-28" />
									</td>
									<td className="px-6 py-4 text-center">
										<Skeleton className="h-4 w-10 mx-auto" />
									</td>
									<td className="px-6 py-4">
										<div className="flex justify-end">
											<Skeleton className="h-8 w-8" />
										</div>
									</td>
								</tr>
							))}
						{!loading &&
							invoices.map((invoice) => (
								<tr
									key={invoice.id}
									className={cn(
										"group hover:bg-muted/30 transition-colors duration-200",
										selectedIds?.has(invoice.dbId) && "bg-muted/50",
									)}
								>
									<td className="px-6 py-4">
										<Checkbox
											checked={selectedIds?.has(invoice.dbId)}
											onCheckedChange={(checked) =>
												onSelect?.(invoice.dbId, !!checked)
											}
											aria-label={`Select invoice ${invoice.id}`}
										/>
									</td>
									<td className="px-6 py-4 font-mono text-primary font-medium">
										<div className="flex flex-col gap-1">
											<span className="group-hover:text-primary group-hover:underline decoration-primary/30 underline-offset-4 transition-all">
												{invoice.id}
											</span>
											{renderSmsStatus(invoice.dbId)}
										</div>
									</td>
									<td className="px-6 py-4 font-medium text-foreground">
										{invoice.customerName}
									</td>
									<td className="px-6 py-4 font-display font-bold text-foreground tracking-tight">
										₹{invoice.amount.toLocaleString()}
									</td>
									<td className="px-6 py-4">
										<Badge
											variant="outline"
											className={cn(
												"px-2.5 py-0.5 font-semibold text-[10px] tracking-wide uppercase border bg-transparent",
												invoice.status === "paid" &&
													"border-chart-2/20 text-chart-2 shadow-[0_0_10px_oklch(var(--chart-2)/.1)]",
												invoice.status === "pending" &&
													"border-chart-3/20 text-chart-3 shadow-[0_0_10px_oklch(var(--chart-3)/.1)]",
												invoice.status === "overdue" &&
													"border-destructive/20 text-destructive shadow-[0_0_10px_oklch(var(--destructive)/.1)]",
												invoice.status === "draft" &&
													"border-muted-foreground/20 text-muted-foreground",
											)}
										>
											{invoice.status}
										</Badge>
									</td>
									<td className="px-6 py-4 text-muted-foreground">
										{formatDate(invoice.dueDate)}
									</td>
									<td className="px-6 py-4 text-center">
										<span className="inline-flex items-center justify-center px-2.5 py-1 rounded-full bg-primary/10 text-primary text-xs font-bold">
											{invoice.shipments}
										</span>
									</td>
									<td className="px-6 py-4">
										<div className="flex items-center justify-end">
											<DropdownMenu modal={false}>
												<DropdownMenuTrigger asChild>
													<Button
														variant="ghost"
														size="icon"
														className="h-8 w-8 hover:bg-primary/10 hover:text-primary transition-colors"
													>
														<MoreHorizontal className="h-4 w-4" />
														<span className="sr-only">Open actions</span>
													</Button>
												</DropdownMenuTrigger>
												<DropdownMenuContent align="end" className="w-48">
													<DropdownMenuItem
														onClick={() => onOpenManageShipments(invoice)}
														className="gap-2"
													>
														<Package className="h-4 w-4" />
														Manage Shipments
													</DropdownMenuItem>
													<DropdownMenuItem
														onClick={() => onViewInvoice(invoice)}
														className="gap-2"
													>
														<Eye className="h-4 w-4" />
														View Invoice
													</DropdownMenuItem>
													<DropdownMenuItem asChild>
														<Link
															href={`/invoices/${invoice.dbId}/print-shipment`}
															target="_blank"
														>
															<span className="flex items-center gap-2 w-full">
																<Package className="h-4 w-4" />
																Print Shipment
															</span>
														</Link>
													</DropdownMenuItem>
													<DropdownMenuItem asChild>
														<Link
															href={`/invoices/${invoice.dbId}/print-customer`}
															target="_blank"
														>
															<span className="flex items-center gap-2 w-full">
																<Eye className="h-4 w-4" />
																Print Customer
															</span>
														</Link>
													</DropdownMenuItem>
													<DropdownMenuItem
														onClick={() => onDownload(invoice)}
														disabled={!!actionLoading[invoice.dbId]}
														className="gap-2"
													>
														<Download className="h-4 w-4" />
														{actionLoading[invoice.dbId]
															? "Preparing..."
															: "Download PDF"}
													</DropdownMenuItem>
													<DropdownMenuSeparator />
													<DropdownMenuItem
														onClick={() => onEditInvoice(invoice)}
														disabled={!canEdit}
														className="gap-2"
													>
														<Edit className="h-4 w-4" />
														Edit Invoice
													</DropdownMenuItem>
													<DropdownMenuItem
														onClick={() => onSendSms(invoice)}
														disabled={!!actionLoading[invoice.dbId]}
														className="gap-2"
													>
														<MessageSquare className="h-4 w-4" />
														{actionLoading[invoice.dbId]
															? "Sending..."
															: "Send WhatsApp"}
													</DropdownMenuItem>
													<DropdownMenuSeparator />
													<DropdownMenuItem
														variant="destructive"
														onClick={() => onDeleteInvoice(invoice)}
														disabled={!!actionLoading[invoice.dbId] || !canEdit}
														className="gap-2 text-destructive focus:text-destructive"
													>
														<Trash2 className="h-4 w-4" />
														Delete Invoice
													</DropdownMenuItem>
												</DropdownMenuContent>
											</DropdownMenu>
										</div>
									</td>
								</tr>
							))}
					</tbody>
				</table>
				{!loading && invoices.length === 0 && (
					<EmptyState
						variant="invoices"
						title={
							searchTerm || filterStatus !== "all"
								? "No matching invoices"
								: "No invoices yet"
						}
						description={
							searchTerm || filterStatus !== "all"
								? "Try adjusting your search or filter criteria."
								: "Create your first invoice to start tracking payments."
						}
					/>
				)}
			</div>
		</Card>
	);
}
