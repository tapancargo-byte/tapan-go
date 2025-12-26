"use client";

import { CheckCircle, Download, Trash2, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import {
	Tooltip,
	TooltipContent,
	TooltipProvider,
	TooltipTrigger,
} from "@/components/ui/tooltip";

interface InvoicesBulkActionsProps {
	selectedCount: number;
	onClearSelection: () => void;
	onDelete: () => void;
	onDownload: () => void;
	onMarkPaid: () => void;
	loading?: boolean;
}

export function InvoicesBulkActions({
	selectedCount,
	onClearSelection,
	onDelete,
	onDownload,
	onMarkPaid,
	loading = false,
}: InvoicesBulkActionsProps) {
	if (selectedCount === 0) return null;

	return (
		<div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50 flex items-center gap-2 p-2 rounded-full border bg-background/80 backdrop-blur-xl shadow-2xl animate-in fade-in slide-in-from-bottom-4 duration-300">
			<div className="flex items-center gap-2 px-3">
				<div className="bg-primary text-primary-foreground text-xs font-bold rounded-full h-6 w-6 flex items-center justify-center">
					{selectedCount}
				</div>
				<span className="text-sm font-medium text-muted-foreground">
					Selected
				</span>
			</div>

			<Separator orientation="vertical" className="h-6" />

			<TooltipProvider delayDuration={0}>
				<div className="flex items-center gap-1">
					<Tooltip>
						<TooltipTrigger asChild>
							<Button
								variant="ghost"
								size="icon"
								className="h-9 w-9 rounded-full hover:bg-emerald-500/10 hover:text-emerald-500"
								onClick={onMarkPaid}
								disabled={loading}
							>
								<CheckCircle className="h-4 w-4" />
								<span className="sr-only">Mark Paid</span>
							</Button>
						</TooltipTrigger>
						<TooltipContent>Mark as Paid</TooltipContent>
					</Tooltip>

					<Tooltip>
						<TooltipTrigger asChild>
							<Button
								variant="ghost"
								size="icon"
								className="h-9 w-9 rounded-full hover:bg-primary/10 hover:text-primary"
								onClick={onDownload}
								disabled={loading}
							>
								<Download className="h-4 w-4" />
								<span className="sr-only">Download</span>
							</Button>
						</TooltipTrigger>
						<TooltipContent>Download Selected</TooltipContent>
					</Tooltip>

					<Tooltip>
						<TooltipTrigger asChild>
							<Button
								variant="ghost"
								size="icon"
								className="h-9 w-9 rounded-full hover:bg-destructive/10 hover:text-destructive"
								onClick={onDelete}
								disabled={loading}
							>
								<Trash2 className="h-4 w-4" />
								<span className="sr-only">Delete</span>
							</Button>
						</TooltipTrigger>
						<TooltipContent>Delete Selected</TooltipContent>
					</Tooltip>
				</div>
			</TooltipProvider>

			<Separator orientation="vertical" className="h-6" />

			<Button
				variant="ghost"
				size="icon"
				className="h-9 w-9 rounded-full ml-1"
				onClick={onClearSelection}
			>
				<X className="h-4 w-4" />
				<span className="sr-only">Clear Selection</span>
			</Button>
		</div>
	);
}
