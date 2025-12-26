"use client";

import { Minus, TrendingDown, TrendingUp } from "lucide-react";
import type { ReactNode } from "react";
import { Badge } from "@/components/ui/badge";
import {
	Card,
	CardContent,
	CardDescription,
	CardHeader,
	CardTitle,
} from "@/components/ui/card";
import { cn } from "@/lib/utils";

interface StatCardProps {
	title: string;
	value: string | number;
	description?: string;
	trend?: {
		value: number;
		label?: string;
	};
	icon?: ReactNode;
	className?: string;
	variant?: "default" | "gradient";
}

export function StatCard({
	title,
	value,
	description,
	trend,
	icon,
	className,
	variant = "default",
}: StatCardProps) {
	const trendDirection = trend
		? trend.value > 0
			? "up"
			: trend.value < 0
				? "down"
				: "neutral"
		: null;

	return (
		<Card
			className={cn(
				"@container/card",
				variant === "gradient" && "bg-primary/5 shadow-xs",
				className,
			)}
		>
			<CardHeader className="pb-2">
				<CardDescription className="text-sm font-medium">
					{title}
				</CardDescription>
				<div className="flex items-center justify-between">
					<CardTitle className="text-2xl font-semibold tabular-nums @[250px]/card:text-3xl">
						{value}
					</CardTitle>
					{trend && (
						<Badge
							variant="outline"
							className={cn(
								"gap-1",
								trendDirection === "up" &&
									"border-chart-2/20 bg-chart-2/10 text-chart-2",
								trendDirection === "down" &&
									"border-destructive/20 bg-destructive/10 text-destructive",
								trendDirection === "neutral" &&
									"border-muted bg-muted text-muted-foreground",
							)}
						>
							{trendDirection === "up" && <TrendingUp className="h-3 w-3" />}
							{trendDirection === "down" && (
								<TrendingDown className="h-3 w-3" />
							)}
							{trendDirection === "neutral" && <Minus className="h-3 w-3" />}
							{trend.value > 0 ? "+" : ""}
							{trend.value}%
						</Badge>
					)}
				</div>
			</CardHeader>
			<CardContent className="pt-0">
				<div className="flex items-center gap-2 text-sm">
					{icon && <span className="text-muted-foreground">{icon}</span>}
					{trend && (
						<span
							className={cn(
								"flex items-center gap-1 font-medium",
								trendDirection === "up" && "text-chart-2",
								trendDirection === "down" && "text-destructive",
								trendDirection === "neutral" && "text-muted-foreground",
							)}
						>
							{trendDirection === "up" && "Trending up"}
							{trendDirection === "down" && "Trending down"}
							{trendDirection === "neutral" && "No change"}
							{trendDirection === "up" && <TrendingUp className="h-4 w-4" />}
							{trendDirection === "down" && (
								<TrendingDown className="h-4 w-4" />
							)}
						</span>
					)}
				</div>
				{description && (
					<p className="text-muted-foreground text-sm mt-1">{description}</p>
				)}
			</CardContent>
		</Card>
	);
}

export default StatCard;
