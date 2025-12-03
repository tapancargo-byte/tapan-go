"use client";

import * as React from "react";
import { Badge } from "@/components/ui/badge";
import DashboardCard from "@/components/dashboard/card";
import type { SecurityStatus as SecurityStatusType } from "@/types/dashboard";
import Image from "next/image";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";
import { Bullet } from "@/components/ui/bullet";

const securityStatusItemVariants = cva("border bg-card/80 text-foreground", {
  variants: {
    variant: {
      success: "border-success/60 bg-success/5",
      warning: "border-warning/60 bg-warning/5",
      destructive: "border-destructive/60 bg-destructive/5",
    },
  },
  defaultVariants: {
    variant: "success",
  },
});

interface SecurityStatusItemProps
  extends VariantProps<typeof securityStatusItemVariants> {
  title: string;
  value: string;
  status: string;
  className?: string;
}

function SecurityStatusItem({
  title,
  value,
  status,
  variant,
  className,
}: SecurityStatusItemProps) {
  return (
    <div className={cn(securityStatusItemVariants({ variant }), className)}>
      <div className="flex items-center gap-2 py-1 px-2 border-b border-current">
        <Bullet size="sm" variant={variant} />
        <span className="text-sm font-medium">{title}</span>
      </div>
      <div className="py-1 px-2.5">
        <div className="text-2xl font-bold mb-1">{value}</div>
        <div className="text-xs opacity-50">{status}</div>
      </div>
    </div>
  );
}

interface SecurityStatusProps {
  statuses: SecurityStatusType[];
}

export default function SecurityStatus({ statuses }: SecurityStatusProps) {
  const [activeIndex, setActiveIndex] = React.useState(0);

  const activeStatus = statuses[activeIndex] ?? statuses[0] ?? undefined;

  return (
    <DashboardCard
      title="Growth KPIs"
      intent="default"
      addon={<Badge variant="outline-success">Tracking</Badge>}
    >
      <div className="grid grid-cols-1 md:grid-cols-[minmax(0,1.4fr)_minmax(0,1fr)] gap-4 items-stretch">
        <div className="flex flex-col">
          <div className="grid grid-cols-1 gap-4 py-2 px-1">
            {statuses.map((item, index) => (
              <button
                key={index}
                type="button"
                onClick={() => setActiveIndex(index)}
                className="text-left focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/40"
              >
                <SecurityStatusItem
                  title={item.title}
                  value={item.value}
                  status={item.status}
                  variant={item.variant}
                  className={cn(
                    "transition-transform hover:-translate-y-px hover:shadow-sm",
                    index === activeIndex && "ring-2 ring-current"
                  )}
                />
              </button>
            ))}
          </div>
          {activeStatus && (
            <div className="mt-3 border border-border bg-card/80 px-3 py-2 text-xs md:text-sm text-muted-foreground">
              <div className="flex items-center justify-between mb-1">
                <span className="font-semibold text-foreground/80">
                  {activeStatus.title} insight
                </span>
                <span className="text-[0.65rem] uppercase tracking-wide opacity-70">
                  Scenario preview
                </span>
              </div>
              <p className="mb-1">
                This panel will highlight trends behind{" "}
                <span className="font-semibold">{activeStatus.value}</span> and
                the {activeStatus.title.toLowerCase()} metric as more live data
                is ingested into the dashboard.
              </p>
              <p className="text-[0.65rem] uppercase tracking-wide opacity-70">
                Future: click-through to underlying invoices, shipments and
                support tickets from this KPI.
              </p>
            </div>
          )}
        </div>

        <div className="hidden md:flex items-center justify-center py-4 opacity-70">
          <picture className="w-40 md:w-full md:h-full aspect-square max-w-xs md:max-w-none">
            <Image
              src="/assets/bot_greenprint.gif"
              alt="Fleet Status"
              width={1000}
              height={1000}
              quality={90}
              className="size-full object-contain"
            />
          </picture>
        </div>
      </div>
    </DashboardCard>
  );
}
