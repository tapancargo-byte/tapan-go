"use client";

import MapPinIcon from "@/components/icons/map-pin";

interface TrackingMapProps {
  origin: string;
  destination: string;
  currentLocation?: string;
}

export function TrackingMap({ origin, destination, currentLocation }: TrackingMapProps) {
  // Placeholder component - integrate with Google Maps or Mapbox in production
  return (
    <div className="relative h-[300px] rounded-lg bg-muted/30 border border-border/50 overflow-hidden flex items-center justify-center">
      <div className="text-center space-y-4">
        <MapPinIcon className="h-12 w-12 text-muted-foreground mx-auto" />
        <div className="space-y-1">
          <p className="text-sm font-medium">Map View Coming Soon</p>
          <p className="text-xs text-muted-foreground">
            {origin} → {destination}
          </p>
        </div>
      </div>
      
      {/* TODO: Integrate with Google Maps API
        <GoogleMap
          origin={origin}
          destination={destination}
          currentLocation={currentLocation}
        />
      */}
    </div>
  );
}
