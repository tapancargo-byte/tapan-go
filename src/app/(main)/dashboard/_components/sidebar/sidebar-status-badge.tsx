import { cn } from "@/lib/utils";

interface SidebarStatusBadgeProps {
	count: number | string;
	variant?: "default" | "success" | "warning" | "destructive";
	className?: string;
}

export function SidebarStatusBadge({
	count,
	variant = "default",
	className,
}: SidebarStatusBadgeProps) {
	const variants = {
		default: "bg-muted text-muted-foreground border border-border",
		success: "bg-chart-2/15 text-chart-2 border border-chart-2/20",
		warning: "bg-chart-3/15 text-chart-3 border border-chart-3/20",
		destructive:
			"bg-destructive/15 text-destructive border border-destructive/20",
	};

	return (
		<span
			className={cn(
				"inline-flex items-center justify-center px-2.5 py-1 text-xs font-semibold transition-all",
				variants[variant],
				className,
			)}
		>
			{count}
		</span>
	);
}
