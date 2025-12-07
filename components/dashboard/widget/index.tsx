"use client";

import React, { useState, useEffect, useRef } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import TVNoise from "@/components/ui/tv-noise";
import type { WidgetData } from "@/types/dashboard";
import Image from "next/image";
import { ChevronRight } from "lucide-react";

interface WidgetProps {
  widgetData: WidgetData;
  onCollapse?: () => void;
}

// Cache location data in memory to avoid repeated API calls
let cachedLocation: { location: string; timezone: string } | null = null;

export default function Widget({ widgetData, onCollapse }: WidgetProps) {
  const [currentTime, setCurrentTime] = useState(new Date());
  const [location, setLocation] = useState(widgetData.location);
  const [timezone, setTimezone] = useState(widgetData.timezone);
  const locationFetched = useRef(false);

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  useEffect(() => {
    // Skip if already fetched this session or cached
    if (locationFetched.current) return;
    if (cachedLocation) {
      setLocation(cachedLocation.location);
      setTimezone(cachedLocation.timezone);
      return;
    }
    locationFetched.current = true;

    // Defer location fetch - don't block initial render
    const timeoutId = setTimeout(async () => {
      try {
        const res = await fetch("https://ipapi.co/json/", { 
          signal: AbortSignal.timeout(3000) // 3s timeout
        });
        if (!res.ok) return;
        const data = await res.json();

        const city =
          (data && typeof data.city === "string" && data.city) || null;
        const country =
          (data && typeof data.country_name === "string" && data.country_name) ||
          null;

        let resolvedLocation: string | null = null;
        let resolvedTimezone: string | null =
          (data && typeof data.timezone === "string" && data.timezone) || null;

        if (country === "India") {
          resolvedLocation = "New Delhi, India";
          resolvedTimezone = "Asia/Kolkata";
        } else if (city && country) {
          resolvedLocation = `${city}, ${country}`;
        }

        if (resolvedLocation) {
          setLocation(resolvedLocation);
          cachedLocation = { 
            location: resolvedLocation, 
            timezone: resolvedTimezone || widgetData.timezone 
          };
        }
        if (resolvedTimezone) {
          setTimezone(resolvedTimezone);
        }
      } catch {
        // Silently fail - use default location
      }
    }, 1000); // Delay 1s to prioritize page content

    return () => clearTimeout(timeoutId);
  }, [widgetData.timezone]);

  const formatTime = (date: Date) => {
    return date.toLocaleTimeString("en-US", {
      hour12: true,
      hour: "numeric",
      minute: "2-digit",
    });
  };

  const formatDate = (date: Date) => {
    const dayOfWeek = date.toLocaleDateString("en-US", {
      weekday: "long",
    });
    const restOfDate = date.toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
    return { dayOfWeek, restOfDate };
  };

  const dateInfo = formatDate(currentTime);

  return (
    <Card className="w-full relative overflow-hidden">
      <TVNoise opacity={0.3} intensity={0.2} speed={40} />
      <CardContent className="bg-accent/30 p-4 flex flex-col gap-3 text-sm font-medium uppercase relative z-20">
        {/* Top row - Day and collapse button */}
        <div className="flex justify-between items-center">
          <span className="text-xs opacity-60">{dateInfo.dayOfWeek}</span>
          {onCollapse && (
            <Button
              variant="ghost"
              size="icon"
              className="h-7 w-7 hover:bg-accent/50"
              onClick={onCollapse}
            >
              <ChevronRight className="h-4 w-4" />
              <span className="sr-only">Collapse panel</span>
            </Button>
          )}
        </div>
        
        {/* Time - centered and prominent */}
        <div className="text-center py-2">
          <div className="text-4xl font-display tracking-tight" suppressHydrationWarning>
            {formatTime(currentTime)}
          </div>
          <div className="text-xs text-muted-foreground mt-1 normal-case">
            {dateInfo.restOfDate}
          </div>
        </div>

        {/* Bottom row - Location info */}
        <div className="flex justify-between items-center text-xs">
          <span className="opacity-60">{widgetData.temperature}</span>
          <span className="truncate max-w-[120px]">{location}</span>
          <Badge variant="secondary" className="bg-accent text-[10px] px-1.5">
            {timezone}
          </Badge>
        </div>

        <div className="absolute inset-0 -z-[1] opacity-30">
          <Image
            src="/assets/pc_blueprint.gif"
            alt="logo"
            width={250}
            height={250}
            className="size-full object-contain"
            priority
          />
        </div>
      </CardContent>
    </Card>
  );
}

export function TapanGoWidget() {
  return (
    <Card className="w-full aspect-[4] relative overflow-hidden">
      <TVNoise opacity={0.25} intensity={0.15} speed={40} />
      <CardContent className="bg-accent/20 flex-1 flex flex-col justify-between text-sm font-medium uppercase relative z-20">
        <div className="flex justify-between items-center">
          <span className="opacity-60 tracking-[0.2em]">TAPAN GO</span>
          <span className="text-xs opacity-60">CARGO SERVICE</span>
        </div>

        <div className="flex flex-col items-center justify-center gap-3 text-center px-4 normal-case">
          <p className="text-[11px] text-muted-foreground max-w-xs">
            A seamless cargo service for Northeast and Delhi.
          </p>
        </div>

        <div className="absolute inset-0 -z-[1] opacity-20">
          <Image
            src="/assets/tapango.gif"
            alt="Tapan Go"
            width={250}
            height={250}
            className="size-full object-contain"
            priority
          />
        </div>
      </CardContent>
    </Card>
  );
}
