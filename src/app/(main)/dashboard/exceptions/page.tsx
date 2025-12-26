"use client";

import * as Sentry from "@sentry/nextjs";
import { AlertTriangle, ArrowLeft } from "lucide-react";
import Link from "next/link";
import * as React from "react";
import DashboardPageLayout from "@/components/dashboard/layout";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
	Card,
	CardContent,
	CardDescription,
	CardHeader,
	CardTitle,
} from "@/components/ui/card";
import { cn } from "@/lib/utils";

// Mock data for exceptions
const exceptions = [
	{
		id: "SHP-7829-X",
		customer: "Nexus Tech",
		destination: "Mumbai, MH",
		status: "delayed",
		reason: "Weather conditions",
		date: "2024-12-24",
		severity: "warning",
	},
	{
		id: "SHP-9921-Z",
		customer: "Global Logistics",
		destination: "Delhi, DL",
		status: "exception",
		reason: "Vehicle breakdown",
		date: "2024-12-23",
		severity: "destructive",
	},
	{
		id: "SHP-8823-Y",
		customer: "Solar Systems",
		destination: "Bangalore, KA",
		status: "failed",
		reason: "Address not found",
		date: "2024-12-22",
		severity: "destructive",
	},
	{
		id: "SHP-7712-A",
		customer: "Acme Corp",
		destination: "Chennai, TN",
		status: "delayed",
		reason: "Customs clearance",
		date: "2024-12-21",
		severity: "warning",
	},
];

function ExceptionsTracker() {
	React.useEffect(() => {
		Sentry.addBreadcrumb({
			category: "page.view",
			message: "User viewed Exceptions & Delays page",
			level: "info",
		});
	}, []);
	return null;
}

export default function ExceptionsPage() {
	return (
		<DashboardPageLayout
			header={{
				title: "Exceptions & Delays",
				description: "Monitor and triage active shipment issues.",
				icon: AlertTriangle,
			}}
		>
			<ExceptionsTracker />
			<div className="space-y-6">
				<div className="flex items-center gap-4">
					<Button variant="ghost" size="icon" asChild>
						<Link href="/dashboard">
							<ArrowLeft className="h-4 w-4" />
						</Link>
					</Button>
				</div>

				<Card className="border-destructive/30 bg-destructive/5">
					<CardHeader>
						<div className="flex items-center justify-between">
							<div>
								<CardTitle>Active Exceptions</CardTitle>
								<CardDescription>Shipments requiring attention</CardDescription>
							</div>
							<Badge
								variant="destructive"
								className="bg-destructive/15 text-destructive border-destructive/20"
							>
								{exceptions.length} Issues
							</Badge>
						</div>
					</CardHeader>
					<CardContent>
						<div className="rounded-md border border-border">
							<table className="w-full text-sm">
								<thead className="bg-muted/50 text-muted-foreground">
									<tr>
										<th className="p-4 text-left font-medium">Shipment ID</th>
										<th className="p-4 text-left font-medium">Customer</th>
										<th className="p-4 text-left font-medium">Destination</th>
										<th className="p-4 text-left font-medium">Status</th>
										<th className="p-4 text-left font-medium">Reason</th>
										<th className="p-4 text-left font-medium">Date</th>
										<th className="p-4 text-right font-medium">Action</th>
									</tr>
								</thead>
								<tbody className="divide-y divide-border">
									{exceptions.map((item) => (
										<tr
											key={item.id}
											className="hover:bg-muted/30 transition-colors"
										>
											<td className="p-4 font-mono">{item.id}</td>
											<td className="p-4">{item.customer}</td>
											<td className="p-4">{item.destination}</td>
											<td className="p-4">
												<Badge
													variant="outline"
													className={cn(
														"capitalize",
														item.severity === "destructive"
															? "border-destructive/20 text-destructive bg-destructive/15"
															: "border-chart-3/20 text-chart-3 bg-chart-3/15",
													)}
												>
													{item.status}
												</Badge>
											</td>
											<td className="p-4 text-muted-foreground">
												{item.reason}
											</td>
											<td className="p-4 text-muted-foreground">{item.date}</td>
											<td className="p-4 text-right">
												<Button
													variant="ghost"
													size="sm"
													className="text-primary hover:text-primary/80"
												>
													View
												</Button>
											</td>
										</tr>
									))}
								</tbody>
							</table>
						</div>
					</CardContent>
				</Card>
			</div>
		</DashboardPageLayout>
	);
}
