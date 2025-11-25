"use client";

import React, { useState, useEffect } from "react";
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

export default function Widget({ widgetData, onCollapse }: WidgetProps) {
  const [currentTime, setCurrentTime] = useState(new Date());
  const [location, setLocation] = useState(widgetData.location);
  const [timezone, setTimezone] = useState(widgetData.timezone);

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  useEffect(() => {
    async function resolveLocation() {
      try {
        const res = await fetch("https://ipapi.co/json/");
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
        }
        if (resolvedTimezone) {
          setTimezone(resolvedTimezone);
        }
      } catch {
      }
    }

    resolveLocation();
  }, []);

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
    <Card className="w-full aspect-[2] relative overflow-hidden">
      <TVNoise opacity={0.3} intensity={0.2} speed={40} />
      <CardContent className="bg-accent/30 flex-1 flex flex-col justify-between text-sm font-medium uppercase relative z-20">
        <div className="flex justify-between items-center">
          <span className="opacity-50">{dateInfo.dayOfWeek}</span>
          <div className="flex items-center gap-2">
            <span>{dateInfo.restOfDate}</span>
            {onCollapse && (
              <Button
                variant="ghost"
                size="icon"
                className="h-6 w-6 hover:bg-accent/50 hover:text-foreground -mr-2"
                onClick={onCollapse}
              >
                <ChevronRight className="h-4 w-4" />
                <span className="sr-only">Collapse panel</span>
              </Button>
            )}
          </div>
        </div>
        <div className="text-center">
          <div className="text-5xl font-display" suppressHydrationWarning>
            {formatTime(currentTime)}
          </div>
        </div>

        <div className="flex justify-between items-center">
          <span className="opacity-50">{widgetData.temperature}</span>
          <span>{location}</span>

          <Badge variant="secondary" className="bg-accent">
            {timezone}
          </Badge>
        </div>

        <div className="absolute inset-0 -z-[1]">
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
