"use client";

import { useLocation } from "@/lib/location-context";
import { LOCATIONS, LOCATION_SCOPES, type Location, type LocationScope } from "@/types/auth";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { MapPin, Globe, Building2 } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

// Main location scope selector - shows in header/navbar
export function LocationScopeSelector({ className }: { className?: string }) {
  const { locationScope, setLocationScope, isLoading, scopeLabel } = useLocation();

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
            {locationScope === 'all' ? (
              <Globe className="h-4 w-4 text-blue-500" />
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
                {scope.value === 'all' ? (
                  <Globe className="h-4 w-4 text-blue-500" />
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
        className={cn("flex items-center gap-1.5 px-2 py-1 bg-blue-500/10 text-blue-600 border-blue-500/20", className)}
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
  size = 'sm',
  showLabel = false 
}: { 
  location: Location;
  size?: 'xs' | 'sm' | 'md';
  showLabel?: boolean;
}) {
  const info = LOCATIONS[location];
  
  const sizeClasses = {
    xs: 'text-[10px] px-1 py-0.5',
    sm: 'text-xs px-1.5 py-0.5',
    md: 'text-sm px-2 py-1',
  };

  const colorClasses = {
    imphal: 'bg-emerald-500/10 text-emerald-600 border-emerald-500/20',
    newdelhi: 'bg-orange-500/10 text-orange-600 border-orange-500/20',
  };

  return (
    <Badge 
      variant="outline" 
      className={cn(
        "font-mono",
        sizeClasses[size],
        colorClasses[location]
      )}
    >
      {info.code}
      {showLabel && <span className="ml-1 font-sans">{info.name}</span>}
    </Badge>
  );
}

// Legacy exports for backward compatibility
export const LocationSelector = LocationScopeSelector;
export const LocationBadge = LocationScopeBadge;
