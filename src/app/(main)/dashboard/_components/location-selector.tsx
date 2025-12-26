"use client";

import { Building2, Globe, MapPin } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from "@/components/ui/select";
import { useLocation } from "@/lib/location-context";
import { cn } from "@/lib/utils";
import {
	LOCATION_SCOPES,
	LOCATIONS,
	type Location,
	type LocationScope,
} from "@/types/auth";

// Main location scope selector - shows in header/navbar
export function LocationScopeSelector({ className }: { className?: string }) {
	const { locationScope, setLocationScope, isLoading, scopeLabel } =
		useLocation();

	if (isLoading) {
		return (
			<div className="flex items-center gap-2 px-3 py-2 rounded-md bg-muted/50 animate-pulse">
				<MapPin className="h-4 w-4 text-muted-foreground" />
				<span className="text-sm text-muted-foreground">Loading...</span>
			</div>
		);
	}

	return (
		<div className={cn("flex items-center gap-2", className)}>
			<Select
				value={locationScope}
				onValueChange={(value) => setLocationScope(value as LocationScope)}
			>
				<SelectTrigger className="w-[200px] bg-background border-border">
					<div className="flex items-center gap-2">
						{locationScope === "all" ? (
							<Globe className="h-4 w-4 text-primary" />
						) : (
							<Building2 className="h-4 w-4 text-primary" />
						)}
						<SelectValue placeholder="Select location" />
					</div>
				</SelectTrigger>
				<SelectContent>
					{LOCATION_SCOPES.map((scope) => (
						<SelectItem key={scope.value} value={scope.value}>
							<div className="flex items-center gap-2">
								{scope.value === "all" ? (
									<Globe className="h-4 w-4 text-primary" />
								) : (
									<Badge variant="outline" className="text-xs font-mono px-1.5">
										{LOCATIONS[scope.value as Location].code}
									</Badge>
								)}
								<span>{scope.label}</span>
							</div>
						</SelectItem>
					))}
				</SelectContent>
			</Select>
		</div>
	);
}

// Compact badge showing current scope - for mobile/sidebar
export function LocationScopeBadge({ className }: { className?: string }) {
	const { locationScope, isViewingAll, getLocationInfo } = useLocation();

	if (isViewingAll) {
		return (
			<Badge
				variant="secondary"
				className={cn(
					"flex items-center gap-1.5 px-2 py-1 bg-primary/10 text-primary border-primary/20",
					className,
				)}
			>
				<Globe className="h-3 w-3" />
				<span className="text-xs font-medium">All Locations</span>
			</Badge>
		);
	}

	const info = getLocationInfo(locationScope as Location);
	return (
		<Badge
			variant="secondary"
			className={cn("flex items-center gap-1.5 px-2 py-1", className)}
		>
			<Building2 className="h-3 w-3" />
			<span className="font-mono text-xs">{info.code}</span>
		</Badge>
	);
}

// Location indicator for data rows - shows which location a record belongs to
export function LocationIndicator({
	location,
	size = "sm",
	showLabel = false,
}: {
	location: Location;
	size?: "xs" | "sm" | "md";
	showLabel?: boolean;
}) {
	const info = LOCATIONS[location];

	const sizeClasses = {
		xs: "text-xs px-1 py-0.5",
		sm: "text-xs px-1.5 py-0.5",
		md: "text-sm px-2 py-1",
	};

	const colorClasses = {
		imphal: "bg-chart-2/10 text-chart-2 border-chart-2/20",
		newdelhi: "bg-chart-3/10 text-chart-3 border-chart-3/20",
	};

	return (
		<Badge
			variant="outline"
			className={cn("font-mono", sizeClasses[size], colorClasses[location])}
		>
			{info.code}
			{showLabel && <span className="ml-1 font-sans">{info.name}</span>}
		</Badge>
	);
}

// Legacy exports for backward compatibility
export const LocationSelector = LocationScopeSelector;
export const LocationBadge = LocationScopeBadge;
