import type * as React from "react";
import { cn } from "@/lib/utils";
import { Card } from "./card";

interface LoadingCardProps {
	className?: string;
	rows?: number;
}

export function LoadingCard({ className, rows = 3 }: LoadingCardProps) {
	return (
		<Card className={cn("p-6", className)}>
			<div className="animate-pulse space-y-4">
				<div className="h-4 bg-muted rounded w-3/4"></div>
				<div className="space-y-2">
					{Array.from({ length: rows }).map((_, i) => (
						<div
							key={i}
							className={cn(
								"h-3 bg-muted rounded",
								i === rows - 1 ? "w-5/6" : "w-full",
							)}
						/>
					))}
				</div>
			</div>
		</Card>
	);
}

interface LoadingTableProps {
	rows?: number;
	className?: string;
}

export function LoadingTable({ rows = 5, className }: LoadingTableProps) {
	return (
		<div className={cn("space-y-3", className)}>
			{Array.from({ length: rows }).map((_, i) => (
				<div
					key={i}
					className="animate-pulse flex space-x-4 p-4 border rounded"
				>
					<div className="rounded-full bg-muted h-10 w-10 shrink-0"></div>
					<div className="flex-1 space-y-2 py-1">
						<div className="h-4 bg-muted rounded w-3/4"></div>
						<div className="h-3 bg-muted rounded w-1/2"></div>
					</div>
					<div className="w-20 space-y-2 py-1">
						<div className="h-4 bg-muted rounded"></div>
						<div className="h-3 bg-muted rounded w-3/4"></div>
					</div>
				</div>
			))}
		</div>
	);
}

interface LoadingStatsProps {
	count?: number;
	className?: string;
}

export function LoadingStats({ count = 4, className }: LoadingStatsProps) {
	return (
		<div
			className={cn(
				"grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4",
				className,
			)}
		>
			{Array.from({ length: count }).map((_, i) => (
				<Card key={i} className="p-6">
					<div className="animate-pulse space-y-3">
						<div className="h-4 bg-muted rounded w-1/2"></div>
						<div className="h-8 bg-muted rounded w-3/4"></div>
						<div className="h-3 bg-muted rounded w-full"></div>
					</div>
				</Card>
			))}
		</div>
	);
}

interface LoadingSpinnerProps {
	size?: "sm" | "md" | "lg";
	className?: string;
}

export function LoadingSpinner({
	size = "md",
	className,
}: LoadingSpinnerProps) {
	const sizeClasses = {
		sm: "h-4 w-4",
		md: "h-6 w-6",
		lg: "h-8 w-8",
	};

	return (
		<div
			className={cn(
				"animate-spin rounded-full border-2 border-muted border-t-primary",
				sizeClasses[size],
				className,
			)}
		/>
	);
}

interface LoadingButtonProps {
	children: React.ReactNode;
	loading?: boolean;
	className?: string;
}

export function LoadingButton({
	children,
	loading = false,
	className,
}: LoadingButtonProps) {
	return (
		<div className={cn("flex items-center gap-2", className)}>
			{loading && <LoadingSpinner size="sm" />}
			{children}
		</div>
	);
}
