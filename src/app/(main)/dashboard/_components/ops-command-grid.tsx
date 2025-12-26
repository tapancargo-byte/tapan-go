"use client";

import { IconActivity, IconAlertTriangle } from "@tabler/icons-react";
import { AlertCircle, FileText, Package, Users, Warehouse } from "lucide-react";
import Link from "next/link";

import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { cn } from "@/lib/utils";

interface OpsCommandGridProps {
	stats?: {
		totalShipments: number;
		activeCustomers: number;
		pendingInvoices: number;
		warehouseCapacity: number;
		exceptionsThisWeek: number;
		shipmentsTrend: number;
		customersTrend: number;
		invoicesTrend: number;
		capacityTrend: number;
		exceptionsTrend: number;
	};
}

export function OpsCommandGrid({ stats }: OpsCommandGridProps) {
	const data = stats || {
		totalShipments: 0,
		activeCustomers: 0,
		pendingInvoices: 0,
		warehouseCapacity: 0,
		exceptionsThisWeek: 0,
		shipmentsTrend: 0,
		customersTrend: 0,
		invoicesTrend: 0,
		capacityTrend: 0,
		exceptionsTrend: 0,
	};

	return (
		<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
			{/* Exceptions - High Priority */}
			<Link href="/dashboard/exceptions" className="block">
				<Card className="border-l-4 border-l-destructive relative overflow-hidden group hover:shadow-lg transition-all duration-300 h-full">
					<div className="absolute top-0 right-0 p-3 opacity-10 group-hover:opacity-20 transition-opacity">
						<IconAlertTriangle className="w-24 h-24 text-destructive" />
					</div>
					<CardHeader className="pb-2">
						<div className="flex justify-between items-start">
							<p className="text-sm font-medium text-muted-foreground uppercase tracking-wider">
								Exceptions
							</p>
							<IconAlertTriangle className="w-4 h-4 text-destructive animate-pulse" />
						</div>
						<CardTitle className="text-4xl font-bold text-destructive">
							{data.exceptionsThisWeek}
						</CardTitle>
					</CardHeader>
					<CardContent>
						<div className="flex items-center gap-2 text-sm">
							<Badge
								variant="outline"
								className={cn(
									"bg-destructive/10 border-destructive/20 text-destructive",
								)}
							>
								{data.exceptionsTrend > 0 ? "+" : ""}
								{data.exceptionsTrend}%
							</Badge>
							<span className="text-muted-foreground">vs last week</span>
						</div>
					</CardContent>
				</Card>
			</Link>
			{/* Active Shipments - Primary Pulse */}
			<Card className="border-l-4 border-l-primary relative overflow-hidden group hover:shadow-lg transition-all duration-300">
				<div className="absolute top-0 right-0 p-3 opacity-10 group-hover:opacity-20 transition-opacity">
					<Package className="w-24 h-24 text-primary" />
				</div>
				<CardHeader className="pb-2">
					<div className="flex justify-between items-start">
						<p className="text-sm font-medium text-muted-foreground uppercase tracking-wider">
							Active Shipments
						</p>
						<IconActivity className="w-4 h-4 text-primary animate-pulse" />
					</div>
					<CardTitle className="text-4xl font-bold">
						{data.totalShipments.toLocaleString()}
					</CardTitle>
				</CardHeader>
				<CardContent>
					<div className="flex items-center gap-2 text-sm">
						<Badge
							variant="outline"
							className={cn(
								"bg-primary/10 border-primary/20",
								data.shipmentsTrend >= 0 ? "text-primary" : "text-destructive",
							)}
						>
							{data.shipmentsTrend > 0 ? "+" : ""}
							{data.shipmentsTrend}%
						</Badge>
						<span className="text-muted-foreground">vs last month</span>
					</div>
				</CardContent>
			</Card>

			{/* Warehouse Capacity - Warning State */}
			<Card
				className={cn(
					"border-l-4 relative overflow-hidden group hover:shadow-lg transition-all duration-300",
					data.warehouseCapacity > 80 ? "border-l-chart-3" : "border-l-chart-2",
				)}
			>
				<div className="absolute top-0 right-0 p-3 opacity-10 group-hover:opacity-20 transition-opacity">
					<Warehouse
						className={cn(
							"w-24 h-24",
							data.warehouseCapacity > 80 ? "text-chart-3" : "text-chart-2",
						)}
					/>
				</div>
				<CardHeader className="pb-2">
					<div className="flex justify-between items-start">
						<p className="text-sm font-medium text-muted-foreground uppercase tracking-wider">
							Warehouse Load
						</p>
						{data.warehouseCapacity > 80 && (
							<AlertCircle className="w-4 h-4 text-chart-3 animate-bounce" />
						)}
					</div>
					<CardTitle className="text-4xl font-bold text-foreground">
						{data.warehouseCapacity}%
					</CardTitle>
				</CardHeader>
				<CardContent>
					<div className="flex items-center gap-2 text-sm">
						<div className="h-2 flex-1 bg-muted rounded-full overflow-hidden">
							<div
								className={cn(
									"h-full rounded-full transition-all duration-500",
									data.warehouseCapacity > 90
										? "bg-destructive"
										: data.warehouseCapacity > 75
											? "bg-chart-3"
											: "bg-chart-2",
								)}
								style={{ width: `${Math.min(data.warehouseCapacity, 100)}%` }}
							/>
						</div>
						<span className="text-muted-foreground whitespace-nowrap">
							Capacity
						</span>
					</div>
				</CardContent>
			</Card>

			{/* Pending Invoices - Cash Flow */}
			<Card className="border-l-4 border-l-destructive relative overflow-hidden group hover:shadow-lg transition-all duration-300">
				<div className="absolute top-0 right-0 p-3 opacity-10 group-hover:opacity-20 transition-opacity">
					<FileText className="w-24 h-24 text-destructive" />
				</div>
				<CardHeader className="pb-2">
					<p className="text-sm font-medium text-muted-foreground uppercase tracking-wider">
						Pending Invoices
					</p>
					<CardTitle className="text-4xl font-bold text-foreground">
						{data.pendingInvoices}
					</CardTitle>
				</CardHeader>
				<CardContent>
					<div className="flex items-center gap-2 text-sm">
						<Badge
							variant="outline"
							className="bg-destructive/10 text-destructive border-destructive/20"
						>
							Action Required
						</Badge>
						<span className="text-muted-foreground">needs review</span>
					</div>
				</CardContent>
			</Card>

			{/* Active Customers */}
			<Card className="border-l-4 border-l-primary relative overflow-hidden group hover:shadow-lg transition-all duration-300">
				<div className="absolute top-0 right-0 p-3 opacity-10 group-hover:opacity-20 transition-opacity">
					<Users className="w-24 h-24 text-primary" />
				</div>
				<CardHeader className="pb-2">
					<p className="text-sm font-medium text-muted-foreground uppercase tracking-wider">
						Active Customers
					</p>
					<CardTitle className="text-4xl font-bold text-foreground">
						{data.activeCustomers}
					</CardTitle>
				</CardHeader>
				<CardContent>
					<div className="flex items-center gap-2 text-sm">
						<Badge
							variant="outline"
							className="bg-primary/10 text-primary border-primary/20"
						>
							{data.customersTrend > 0 ? "+" : ""}
							{data.customersTrend}%
						</Badge>
						<span className="text-muted-foreground">growth</span>
					</div>
				</CardContent>
			</Card>
		</div>
	);
}
