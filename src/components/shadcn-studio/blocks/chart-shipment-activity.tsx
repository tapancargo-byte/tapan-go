"use client";

import { Area, AreaChart, CartesianGrid, XAxis, YAxis } from "recharts";
import { Button } from "@/components/ui/button";
import {
	Card,
	CardContent,
	CardDescription,
	CardHeader,
	CardTitle,
} from "@/components/ui/card";
import {
	type ChartConfig,
	ChartContainer,
	ChartTooltip,
	ChartTooltipContent,
} from "@/components/ui/chart";

const chartData = [
	{ date: "Oct 8", shipments: 12 },
	{ date: "Oct 14", shipments: 18 },
	{ date: "Oct 20", shipments: 14 },
	{ date: "Oct 26", shipments: 22 },
	{ date: "Nov 1", shipments: 15 },
	{ date: "Nov 7", shipments: 25 },
	{ date: "Nov 13", shipments: 20 },
	{ date: "Nov 19", shipments: 30 },
	{ date: "Nov 25", shipments: 24 },
	{ date: "Dec 1", shipments: 35 },
	{ date: "Dec 7", shipments: 28 },
	{ date: "Dec 13", shipments: 32 },
	{ date: "Dec 19", shipments: 25 },
	{ date: "Dec 25", shipments: 40 },
	{ date: "Dec 31", shipments: 38 },
];

const chartConfig = {
	shipments: {
		label: "Shipments",
		color: "var(--primary)",
	},
} satisfies ChartConfig;

export function ShipmentActivityChart() {
	return (
		<Card className="col-span-full xl:col-span-2">
			<CardHeader className="flex flex-row items-center justify-between pb-8">
				<div className="space-y-1">
					<CardTitle className="text-base font-medium">
						Shipment Activity
					</CardTitle>
					<CardDescription>
						Shipments and deliveries for the last 3 months
					</CardDescription>
				</div>
				<div className="flex items-center gap-2">
					<Button variant="outline" size="sm" className="h-8">
						Last 3 months
					</Button>
					<Button
						variant="ghost"
						size="sm"
						className="h-8 text-muted-foreground"
					>
						Last 30 days
					</Button>
					<Button
						variant="ghost"
						size="sm"
						className="h-8 text-muted-foreground"
					>
						Last 7 days
					</Button>
				</div>
			</CardHeader>
			<CardContent>
				<ChartContainer
					config={chartConfig}
					className="aspect-auto h-[250px] w-full"
				>
					<AreaChart
						accessibilityLayer
						data={chartData}
						margin={{
							left: 0,
							right: 0,
							top: 0,
							bottom: 0,
						}}
					>
						<defs>
							<linearGradient id="fillShipments" x1="0" y1="0" x2="0" y2="1">
								<stop
									offset="5%"
									stopColor="var(--color-shipments)"
									stopOpacity={0.8}
								/>
								<stop
									offset="95%"
									stopColor="var(--color-shipments)"
									stopOpacity={0.1}
								/>
							</linearGradient>
						</defs>
						<CartesianGrid
							vertical={false}
							strokeDasharray="3 3"
							stroke="hsl(var(--border))"
							opacity={0.4}
						/>
						<XAxis
							dataKey="date"
							tickLine={false}
							axisLine={false}
							tickMargin={10}
							tickFormatter={(value) => value}
							fontSize={12}
							tick={{ fill: "hsl(var(--muted-foreground))" }}
						/>
						<YAxis
							tickLine={false}
							axisLine={false}
							tickMargin={10}
							tickFormatter={(value) => `${value}`}
							fontSize={12}
							hide
						/>
						<ChartTooltip cursor={false} content={<ChartTooltipContent />} />
						<Area
							dataKey="shipments"
							type="natural"
							fill="url(#fillShipments)"
							fillOpacity={0.4}
							stroke="var(--color-shipments)"
							strokeWidth={2}
						/>
					</AreaChart>
				</ChartContainer>
			</CardContent>
		</Card>
	);
}
