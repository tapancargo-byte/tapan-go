"use client";

import * as React from "react";
import { Badge } from "@/components/ui/badge";
import DashboardCard from "@/components/dashboard/card";
import type { RebelRanking } from "@/types/dashboard";
import { cn } from "@/lib/utils";
import GearIcon from "@/components/icons/gear";
import TruckIcon from "@/components/icons/truck";
import BellIcon from "@/components/icons/bell";
import AtomIcon from "@/components/icons/atom";

interface RebelsRankingProps {
  rebels: RebelRanking[];
}

const getProjectionIcon = (name: string) => {
  const upper = name.toUpperCase();
  if (upper.includes("REVENUE")) return GearIcon;
  if (upper.includes("SHIPMENT")) return TruckIcon;
  if (upper.includes("TICKET")) return BellIcon;
  if (upper.includes("NETWORK") || upper.includes("CAPACITY")) return AtomIcon;
  return GearIcon;
};

export default function RebelsRanking({ rebels }: RebelsRankingProps) {
  const initialActiveId = React.useMemo(() => {
    const featured = rebels.find((item) => item.featured)?.id;
    if (typeof featured === "number") return featured;
    return rebels.length > 0 ? rebels[0].id : null;
  }, [rebels]);

  const [activeId, setActiveId] = React.useState<number | null>(initialActiveId);

  const activeRebel = React.useMemo(
    () => rebels.find((item) => item.id === activeId) ?? null,
    [rebels, activeId]
  );

  return (
    <DashboardCard
      title="GROWTH PROJECTIONS"
      intent="default"
      addon={<Badge variant="outline-warning">NEXT 90 DAYS</Badge>}
    >
      <div className="space-y-4">
        {rebels.map((rebel) => {
          const isActive = activeId === rebel.id;

          return (
          <div
            key={rebel.id}
            role="button"
            tabIndex={0}
            onClick={() => setActiveId(rebel.id)}
            onKeyDown={(event) => {
              if (event.key === "Enter" || event.key === " ") {
                event.preventDefault();
                setActiveId(rebel.id);
              }
            }}
            className={cn(
              "flex items-center justify-between rounded-md transition-colors cursor-pointer",
              isActive ? "bg-accent/80" : "hover:bg-accent/60"
            )}
          >
            <div className="flex items-center gap-1 w-full px-1.5 py-1.5">
              <div
                className={cn(
                  "flex items-center justify-center rounded text-sm font-bold px-1.5 mr-1 md:mr-2 h-8",
                  isActive
                    ? "bg-primary text-primary-foreground"
                    : "bg-secondary text-secondary-foreground"
                )}
              >
                {rebel.id}
              </div>
              <div
                className={cn(
                  "rounded-lg overflow-hidden bg-muted flex items-center justify-center",
                  "size-10 md:size-12"
                )}
              >
                {(() => {
                  const Icon = getProjectionIcon(rebel.name);
                  return (
                    <Icon
                      className={
                        rebel.featured
                          ? "w-8 h-8 md:w-10 md:h-10"
                          : "w-6 h-6 md:w-8 md:h-8"
                      }
                    />
                  );
                })()}
              </div>
              <div
                className={cn(
                  "flex flex-1 h-full items-center justify-between py-2 px-2.5 rounded",
                  isActive && "bg-accent"
                )}
              >
                <div className="flex flex-col flex-1">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span
                        className={cn(
                          "font-display leading-tight text-lg md:text-xl",
                        )}
                      >
                        {rebel.name}
                      </span>
                      <span className="text-muted-foreground text-xs md:text-sm">
                        {rebel.handle}
                      </span>
                    </div>
                    <Badge variant={rebel.featured ? "default" : "secondary"}>
                      {rebel.points} INDEX
                    </Badge>
                  </div>
                  {rebel.subtitle && (
                    <span className="text-sm text-muted-foreground italic">
                      {rebel.subtitle}
                    </span>
                  )}
                  {rebel.streak && (
                    <span className="text-sm text-muted-foreground italic">
                      {rebel.streak}
                    </span>
                  )}
                </div>
              </div>
            </div>
          </div>
        );
        })}
        {activeRebel && (
          <div className="rounded-md border border-border bg-card/80 px-3 py-2 text-xs md:text-sm text-muted-foreground">
            <div className="flex items-center justify-between mb-1">
              <span className="font-semibold text-foreground/80">
                {activeRebel.name} outlook
              </span>
              <span className="text-[0.65rem] uppercase tracking-wide opacity-70">
                Preview
              </span>
            </div>
            <p className="mb-1">
              This area will surface deeper projections for{" "}
              <span className="font-semibold">{activeRebel.name}</span> as more
              shipment and revenue data is added to the network.
            </p>
            <p className="text-[0.65rem] uppercase tracking-wide opacity-70">
              Future: drill into scenarios, cohorts and regional performance
              directly from this card.
            </p>
          </div>
        )}
      </div>
    </DashboardCard>
  );
}
