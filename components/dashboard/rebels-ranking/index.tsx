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
      title="Growth projections"
      intent="default"
      addon={<Badge variant="outline-warning">Next 90 days</Badge>}
    >
      <div className="space-y-3">
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
                "flex w-full items-stretch border border-transparent px-2.5 py-2 text-sm transition-colors cursor-pointer",
                isActive ? "bg-accent/40 border-border" : "hover:bg-accent/20"
              )}
            >
              <div className="flex w-full items-start gap-2 sm:items-center">
                <div className="flex items-center justify-center h-7 w-7 text-[0.7rem] font-semibold border border-border text-muted-foreground">
                  {rebel.id}
                </div>
                <div className="flex items-center justify-center text-muted-foreground size-8 md:size-10">
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
                <div className="flex flex-1 flex-col gap-1 sm:flex-row sm:items-center sm:justify-between">
                  <div className="flex flex-col flex-1 gap-1">
                    <div className="flex flex-col items-start gap-1 sm:flex-row sm:items-center sm:justify-between">
                      <div className="flex items-center gap-2">
                        <span className="font-medium leading-tight text-sm md:text-base">
                          {rebel.name}
                        </span>
                        <span className="text-[0.7rem] uppercase tracking-[0.14em] text-muted-foreground">
                          {rebel.handle}
                        </span>
                      </div>
                      <Badge
                        variant={rebel.featured ? "default" : "outline"}
                        className="text-[0.65rem] font-medium tracking-wide"
                      >
                        {rebel.points} index
                      </Badge>
                    </div>
                    {rebel.subtitle && (
                      <span className="text-xs text-muted-foreground">
                        {rebel.subtitle}
                      </span>
                    )}
                    {rebel.streak && (
                      <span className="text-xs text-muted-foreground">
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
          <div className="border border-border/60 bg-background px-3 py-2 text-xs md:text-sm text-muted-foreground">
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
