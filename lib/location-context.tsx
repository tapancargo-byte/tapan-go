"use client";

import React, { createContext, useContext, useState, useEffect, useCallback } from "react";
import type { Location, LocationScope } from "@/types/auth";
import { LOCATIONS, LOCATION_SCOPES } from "@/types/auth";

interface LocationContextType {
  // Current viewing scope - can be a single location or 'all'
  locationScope: LocationScope;
  setLocationScope: (scope: LocationScope) => void;
  
  // User's home/primary location (from their profile)
  userHomeLocation: Location;
  setUserHomeLocation: (location: Location) => void;
  
  // Helper to get location info
  getLocationInfo: (location: Location) => typeof LOCATIONS[Location];
  
  // All available locations
  allLocations: typeof LOCATIONS;
  locationScopes: typeof LOCATION_SCOPES;
  
  // Loading state
  isLoading: boolean;
  
  // Helper to build query filter for current scope
  getLocationFilter: () => { location?: Location } | {};
  
  // Check if viewing all locations
  isViewingAll: boolean;
  
  // Get display label for current scope
  scopeLabel: string;
}

const LocationContext = createContext<LocationContextType | undefined>(undefined);

const LOCATION_SCOPE_KEY = "tapango-location-scope";
const USER_HOME_LOCATION_KEY = "tapango-user-home-location";

export function LocationProvider({ 
  children,
  defaultLocation = "imphal"
}: { 
  children: React.ReactNode;
  defaultLocation?: Location;
}) {
  const [locationScope, setLocationScopeState] = useState<LocationScope>(defaultLocation);
  const [userHomeLocation, setUserHomeLocationState] = useState<Location>(defaultLocation);
  const [isLoading, setIsLoading] = useState(true);

  // Load saved preferences from localStorage on mount
  useEffect(() => {
    const savedScope = localStorage.getItem(LOCATION_SCOPE_KEY);
    const savedHome = localStorage.getItem(USER_HOME_LOCATION_KEY);
    
    if (savedScope && (savedScope === "imphal" || savedScope === "newdelhi" || savedScope === "all")) {
      setLocationScopeState(savedScope as LocationScope);
    }
    if (savedHome && (savedHome === "imphal" || savedHome === "newdelhi")) {
      setUserHomeLocationState(savedHome as Location);
    }
    setIsLoading(false);
  }, []);

  const setLocationScope = useCallback((scope: LocationScope) => {
    setLocationScopeState(scope);
    localStorage.setItem(LOCATION_SCOPE_KEY, scope);
    
    // Trigger event for components to refetch data
    window.dispatchEvent(new CustomEvent("location-scope-changed", { detail: scope }));
  }, []);

  const setUserHomeLocation = useCallback((location: Location) => {
    setUserHomeLocationState(location);
    localStorage.setItem(USER_HOME_LOCATION_KEY, location);
  }, []);

  const getLocationInfo = useCallback((location: Location) => {
    return LOCATIONS[location];
  }, []);

  // Build filter object for database queries
  const getLocationFilter = useCallback(() => {
    if (locationScope === 'all') {
      return {}; // No filter - show all locations
    }
    return { location: locationScope };
  }, [locationScope]);

  const isViewingAll = locationScope === 'all';
  
  const scopeLabel = LOCATION_SCOPES.find(s => s.value === locationScope)?.label || 'Unknown';

  const value: LocationContextType = {
    locationScope,
    setLocationScope,
    userHomeLocation,
    setUserHomeLocation,
    getLocationInfo,
    allLocations: LOCATIONS,
    locationScopes: LOCATION_SCOPES,
    isLoading,
    getLocationFilter,
    isViewingAll,
    scopeLabel,
  };

  return (
    <LocationContext.Provider value={value}>
      {children}
    </LocationContext.Provider>
  );
}

export function useLocation() {
  const context = useContext(LocationContext);
  if (context === undefined) {
    throw new Error("useLocation must be used within a LocationProvider");
  }
  return context;
}

// Hook to listen for location scope changes
export function useLocationScopeChange(callback: (scope: LocationScope) => void) {
  useEffect(() => {
    const handler = (event: CustomEvent<LocationScope>) => {
      callback(event.detail);
    };
    
    window.addEventListener("location-scope-changed", handler as EventListener);
    return () => {
      window.removeEventListener("location-scope-changed", handler as EventListener);
    };
  }, [callback]);
}

// Utility hook to get location-filtered data
export function useLocationFilteredQuery() {
  const { locationScope, getLocationFilter } = useLocation();
  
  return {
    scope: locationScope,
    filter: getLocationFilter(),
    isFiltered: locationScope !== 'all',
  };
}
