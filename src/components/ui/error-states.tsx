import { AlertCircle, ArrowLeft, Home, RefreshCw } from "lucide-react";
import type * as React from "react";
import { cn } from "@/lib/utils";
import { Button } from "./button";
import { Card } from "./card";

interface ErrorStateProps {
	title: string;
	description?: string;
	action?: {
		label: string;
		onClick: () => void;
		variant?: "default" | "outline" | "secondary";
	};
	className?: string;
	icon?: React.ReactNode;
}

export function ErrorState({
	title,
	description,
	action,
	className,
	icon = <AlertCircle className="h-6 w-6 text-destructive" />,
}: ErrorStateProps) {
	return (
		<Card className={cn("p-8 text-center", className)} variant="error">
			<div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-destructive/10">
				{icon}
			</div>
			<h3 className="mt-4 text-lg font-semibold">{title}</h3>
			{description && (
				<p className="mt-2 text-sm text-muted-foreground max-w-md mx-auto">
					{description}
				</p>
			)}
			{action && (
				<Button
					variant={action.variant || "outline"}
					onClick={action.onClick}
					className="mt-4"
				>
					{action.label}
				</Button>
			)}
		</Card>
	);
}

interface NotFoundStateProps {
	title?: string;
	description?: string;
	showHomeButton?: boolean;
	showBackButton?: boolean;
	onBack?: () => void;
	className?: string;
}

export function NotFoundState({
	title = "Page Not Found",
	description = "The page you're looking for doesn't exist or has been moved.",
	showHomeButton = true,
	showBackButton = true,
	onBack,
	className,
}: NotFoundStateProps) {
	return (
		<Card className={cn("p-8 text-center", className)}>
			<div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-muted">
				<AlertCircle className="h-6 w-6 text-muted-foreground" />
			</div>
			<h3 className="mt-4 text-lg font-semibold">{title}</h3>
			<p className="mt-2 text-sm text-muted-foreground max-w-md mx-auto">
				{description}
			</p>
			<div className="mt-6 flex items-center justify-center gap-3">
				{showBackButton && (
					<Button
						variant="outline"
						onClick={onBack || (() => window.history.back())}
					>
						<ArrowLeft className="h-4 w-4" />
						Go Back
					</Button>
				)}
				{showHomeButton && (
					<Button onClick={() => (window.location.href = "/")}>
						<Home className="h-4 w-4" />
						Go Home
					</Button>
				)}
			</div>
		</Card>
	);
}

interface EmptyStateProps {
	title: string;
	description?: string;
	action?: {
		label: string;
		onClick: () => void;
		variant?: "default" | "outline" | "secondary";
	};
	icon?: React.ReactNode;
	className?: string;
}

export function EmptyState({
	title,
	description,
	action,
	icon,
	className,
}: EmptyStateProps) {
	return (
		<Card className={cn("p-8 text-center", className)}>
			{icon && (
				<div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-muted">
					{icon}
				</div>
			)}
			<h3 className="mt-4 text-lg font-semibold">{title}</h3>
			{description && (
				<p className="mt-2 text-sm text-muted-foreground max-w-md mx-auto">
					{description}
				</p>
			)}
			{action && (
				<Button
					variant={action.variant || "default"}
					onClick={action.onClick}
					className="mt-4"
				>
					{action.label}
				</Button>
			)}
		</Card>
	);
}

interface NetworkErrorStateProps {
	onRetry?: () => void;
	className?: string;
}

export function NetworkErrorState({
	onRetry,
	className,
}: NetworkErrorStateProps) {
	return (
		<ErrorState
			title="Connection Error"
			description="Unable to connect to the server. Please check your internet connection and try again."
			action={
				onRetry
					? {
							label: "Try Again",
							onClick: onRetry,
							variant: "default",
						}
					: undefined
			}
			icon={<RefreshCw className="h-6 w-6 text-destructive" />}
			className={className}
		/>
	);
}

interface UnauthorizedStateProps {
	onLogin?: () => void;
	className?: string;
}

export function UnauthorizedState({
	onLogin,
	className,
}: UnauthorizedStateProps) {
	return (
		<ErrorState
			title="Access Denied"
			description="You don't have permission to access this resource. Please log in or contact your administrator."
			action={
				onLogin
					? {
							label: "Log In",
							onClick: onLogin,
							variant: "default",
						}
					: undefined
			}
			className={className}
		/>
	);
}
