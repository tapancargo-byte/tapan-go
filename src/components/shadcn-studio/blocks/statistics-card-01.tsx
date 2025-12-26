import { MoveRight, TrendingDown, TrendingUp } from "lucide-react";
import type { ReactNode } from "react";

import { Card, CardContent, CardHeader } from "@/components/ui/card";

import { cn } from "@/lib/utils";

// Statistics card data type
type StatisticsCardProps = {
	icon?: ReactNode;
	value: string;
	title: string;
	changePercentage?: string;
	trend?: "up" | "down" | "neutral";
	subtext?: string;
	className?: string;
	iconColor?: string;
};

const StatisticsCard = ({
	icon,
	value,
	title,
	changePercentage,
	trend,
	subtext,
	className,
	iconColor,
}: StatisticsCardProps) => {
	return (
		<Card className={cn("overflow-hidden relative", className)}>
			<CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
				<span className="text-sm font-medium text-muted-foreground">
					{title}
				</span>
				{changePercentage && (
					<div
						className={cn(
							"flex items-center gap-1 rounded-full px-2 py-0.5 text-xs font-medium",
							trend === "up"
								? "bg-green-50 text-green-700 dark:bg-green-900/20 dark:text-green-400"
								: trend === "down"
									? "bg-red-50 text-red-700 dark:bg-red-900/20 dark:text-red-400"
									: "bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-400",
						)}
					>
						{trend === "up" ? (
							<TrendingUp className="h-3 w-3" />
						) : trend === "down" ? (
							<TrendingDown className="h-3 w-3" />
						) : null}
						{changePercentage}
					</div>
				)}
			</CardHeader>
			<CardContent>
				<div className="flex flex-col gap-1">
					<span className="text-2xl font-bold tracking-tight">{value}</span>
					{subtext && (
						<div className="flex items-center gap-1.5 text-xs text-muted-foreground mt-1">
							{trend === "up" ? (
								<TrendingUp className="h-3 w-3 text-green-500" />
							) : (
								<MoveRight className="h-3 w-3" />
							)}
							<span>{subtext}</span>
						</div>
					)}
				</div>
				{icon && (
					<div
						className={cn(
							"absolute right-4 bottom-4 opacity-10 scale-150 transition-transform hover:scale-175",
							iconColor || "text-primary",
						)}
					>
						{icon}
					</div>
				)}
			</CardContent>
		</Card>
	);
};

export default StatisticsCard;
