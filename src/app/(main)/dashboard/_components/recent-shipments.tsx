"use client";

import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { cn } from "@/lib/utils";

type ShipmentStatus = "pending" | "in_transit" | "delivered" | "cancelled";

interface RecentShipmentsProps {
	shipments: Array<{
		shipment_ref: string;
		customer_name: string;
		status: ShipmentStatus;
	}>;
}

function statusBadge(status: ShipmentStatus) {
	const map: Record<ShipmentStatus, { label: string; className: string }> = {
		pending: {
			label: "Pending",
			className: "border-chart-3/30 text-chart-3 bg-chart-3/10",
		},
		in_transit: {
			label: "In Transit",
			className: "border-primary/30 text-primary bg-primary/10",
		},
		delivered: {
			label: "Delivered",
			className: "border-chart-2/30 text-chart-2 bg-chart-2/10",
		},
		cancelled: {
			label: "Cancelled",
			className: "border-destructive/30 text-destructive bg-destructive/10",
		},
	};
	const { label, className } = map[status] || map.pending;
	return (
		<Badge
			variant="outline"
			className={cn(
				"h-6 px-2.5 text-[10px] font-medium transition-colors",
				className,
			)}
		>
			{label}
		</Badge>
	);
}

export function RecentShipments({ shipments }: RecentShipmentsProps) {
	const items = (shipments || []).slice(0, 6);

	return (
		<Card className="h-full">
			<CardHeader className="border-b pb-4">
				<div className="flex items-center justify-between">
					<CardTitle className="text-lg font-semibold text-primary">
						Live Feed
					</CardTitle>
					<Badge
						variant="outline"
						className="border-primary/20 text-primary bg-primary/5 text-[10px] uppercase tracking-widest"
					>
						Real-time
					</Badge>
				</div>
			</CardHeader>
			<CardContent className="pt-4">
				<div className="flex flex-col gap-4">
					{items.map((s) => (
						<div
							key={s.shipment_ref}
							className="group flex items-center justify-between gap-3 p-2 rounded-lg hover:bg-muted transition-colors"
						>
							<div className="flex items-center gap-3">
								<Avatar className="h-9 w-9 border ring-2 ring-transparent group-hover:ring-primary/20 transition-all">
									<AvatarFallback className="bg-primary/10 text-primary text-xs font-bold">
										{s.customer_name?.[0]?.toUpperCase() || "?"}
									</AvatarFallback>
								</Avatar>
								<div className="flex flex-col gap-0.5">
									<span className="font-medium text-sm text-foreground/90 group-hover:text-primary transition-colors">
										{s.customer_name}
									</span>
									<span className="text-muted-foreground text-[10px] font-mono tracking-wide">
										{s.shipment_ref}
									</span>
								</div>
							</div>
							{statusBadge(s.status)}
						</div>
					))}
					{items.length === 0 && (
						<div className="text-muted-foreground text-sm text-center py-8">
							No recent activity
						</div>
					)}
				</div>
			</CardContent>
		</Card>
	);
}

export default RecentShipments;
