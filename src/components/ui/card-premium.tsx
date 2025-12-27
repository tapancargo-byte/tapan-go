import { cva, type VariantProps } from "class-variance-authority";
import type * as React from "react";
import { cn } from "@/lib/utils";

const cardVariants = cva(
	"relative overflow-hidden rounded-xl border transition-all duration-300 ease-out",
	{
		variants: {
			variant: {
				default: [
					"bg-card/80 text-card-foreground border-border/50",
					"backdrop-blur-sm",
					"shadow-elevation-1 hover:shadow-elevation-2",
					"hover:border-border/80 hover:-translate-y-0.5",
				],
				elevated: [
					"bg-surface-elevated text-card-foreground border-border/30",
					"shadow-elevation-2 hover:shadow-elevation-3",
					"hover:border-border/60 hover:-translate-y-1",
				],
				glass: [
					"glass-card text-card-foreground",
					"hover:shadow-glass-lg hover:-translate-y-0.5",
				],
				premium: [
					"bg-gradient-to-br from-card via-surface-elevated to-card",
					"text-card-foreground border-premium",
					"shadow-premium hover:shadow-premium-lg",
					"hover:-translate-y-1 hover:scale-[1.02]",
				],
				success: [
					"bg-success/5 text-success-foreground border-success/20",
					"shadow-success hover:shadow-success hover:shadow-lg",
					"hover:bg-success/10 hover:border-success/40",
				],
				warning: [
					"bg-warning/5 text-warning-foreground border-warning/20",
					"shadow-warning hover:shadow-warning hover:shadow-lg",
					"hover:bg-warning/10 hover:border-warning/40",
				],
				destructive: [
					"bg-destructive/5 text-destructive-foreground border-destructive/20",
					"shadow-destructive hover:shadow-destructive hover:shadow-lg",
					"hover:bg-destructive/10 hover:border-destructive/40",
				],
				info: [
					"bg-info/5 text-info-foreground border-info/20",
					"shadow-info hover:shadow-info hover:shadow-lg",
					"hover:bg-info/10 hover:border-info/40",
				],
				gradient: [
					"gradient-surface text-card-foreground border-border/30",
					"shadow-elevation-2 hover:shadow-elevation-3",
					"hover:border-border/60 hover:-translate-y-1",
				],
			},
			size: {
				sm: "p-4 gap-3",
				default: "p-6 gap-4",
				lg: "p-8 gap-6",
			},
			interactive: {
				true: "cursor-pointer group",
				false: "",
			},
		},
		defaultVariants: {
			variant: "default",
			size: "default",
			interactive: false,
		},
	},
);

const cardHeaderVariants = cva("flex flex-col space-y-1.5", {
	variants: {
		size: {
			sm: "pb-2",
			default: "pb-3",
			lg: "pb-4",
		},
	},
	defaultVariants: {
		size: "default",
	},
});

const cardTitleVariants = cva(
	"font-display font-semibold leading-none tracking-tight",
	{
		variants: {
			size: {
				sm: "text-base",
				default: "text-lg",
				lg: "text-xl",
			},
			gradient: {
				true: "text-gradient-primary",
				false: "",
			},
		},
		defaultVariants: {
			size: "default",
			gradient: false,
		},
	},
);

const cardDescriptionVariants = cva("text-muted-foreground leading-relaxed", {
	variants: {
		size: {
			sm: "text-xs",
			default: "text-sm",
			lg: "text-base",
		},
	},
	defaultVariants: {
		size: "default",
	},
});

type CardProps = React.ComponentProps<"div"> &
	VariantProps<typeof cardVariants> & {
		shimmer?: boolean;
		glow?: boolean;
	};

function CardPremium({
	className,
	variant,
	size,
	interactive,
	shimmer = false,
	glow = false,
	children,
	...props
}: CardProps) {
	return (
		<div
			className={cn(
				cardVariants({ variant, size, interactive }),
				shimmer && "animate-shimmer",
				glow && "animate-glow",
				className,
			)}
			{...props}
		>
			{shimmer && (
				<div className="absolute inset-0 -translate-x-full animate-shimmer bg-gradient-to-r from-transparent via-white/10 to-transparent" />
			)}
			<div className="relative z-10 flex flex-col h-full">{children}</div>
		</div>
	);
}

type CardHeaderProps = React.ComponentProps<"div"> &
	VariantProps<typeof cardHeaderVariants> & {
		action?: React.ReactNode;
	};

function CardHeaderPremium({
	className,
	size,
	action,
	children,
	...props
}: CardHeaderProps) {
	return (
		<div
			className={cn(
				cardHeaderVariants({ size }),
				action && "flex-row items-start justify-between space-y-0",
				className,
			)}
			{...props}
		>
			<div className="flex flex-col space-y-1.5">{children}</div>
			{action && <div className="flex-shrink-0">{action}</div>}
		</div>
	);
}

type CardTitleProps = React.ComponentProps<"h3"> &
	VariantProps<typeof cardTitleVariants>;

function CardTitlePremium({
	className,
	size,
	gradient,
	...props
}: CardTitleProps) {
	return (
		<h3
			className={cn(cardTitleVariants({ size, gradient }), className)}
			{...props}
		/>
	);
}

type CardDescriptionProps = React.ComponentProps<"p"> &
	VariantProps<typeof cardDescriptionVariants>;

function CardDescriptionPremium({
	className,
	size,
	...props
}: CardDescriptionProps) {
	return (
		<p
			className={cn(cardDescriptionVariants({ size }), className)}
			{...props}
		/>
	);
}

function CardContentPremium({
	className,
	...props
}: React.ComponentProps<"div">) {
	return <div className={cn("flex-1", className)} {...props} />;
}

function CardFooterPremium({
	className,
	...props
}: React.ComponentProps<"div">) {
	return (
		<div
			className={cn(
				"flex items-center pt-4 border-t border-border/50",
				className,
			)}
			{...props}
		/>
	);
}

// Badge component for cards
function CardBadge({
	className,
	variant = "default",
	...props
}: React.ComponentProps<"div"> & {
	variant?:
		| "default"
		| "success"
		| "warning"
		| "destructive"
		| "info"
		| "premium";
}) {
	const badgeVariants = {
		default: "bg-secondary text-secondary-foreground",
		success: "bg-success/10 text-success border border-success/20",
		warning: "bg-warning/10 text-warning-foreground border border-warning/20",
		destructive:
			"bg-destructive/10 text-destructive border border-destructive/20",
		info: "bg-info/10 text-info border border-info/20",
		premium:
			"bg-gradient-to-r from-primary/10 to-accent/10 text-primary border border-primary/20",
	};

	return (
		<div
			className={cn(
				"inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium transition-colors",
				badgeVariants[variant],
				className,
			)}
			{...props}
		/>
	);
}

// Metric component for dashboard cards
function CardMetric({
	label,
	value,
	change,
	trend,
	className,
	...props
}: {
	label: string;
	value: string | number;
	change?: string;
	trend?: "up" | "down" | "neutral";
	className?: string;
} & React.ComponentProps<"div">) {
	const trendColors = {
		up: "text-success",
		down: "text-destructive",
		neutral: "text-muted-foreground",
	};

	return (
		<div className={cn("space-y-1", className)} {...props}>
			<p className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
				{label}
			</p>
			<div className="flex items-baseline space-x-2">
				<p className="text-2xl font-bold font-display">{value}</p>
				{change && trend && (
					<span className={cn("text-xs font-medium", trendColors[trend])}>
						{change}
					</span>
				)}
			</div>
		</div>
	);
}

export {
	CardPremium,
	CardHeaderPremium,
	CardFooterPremium,
	CardTitlePremium,
	CardDescriptionPremium,
	CardContentPremium,
	CardBadge,
	CardMetric,
};
