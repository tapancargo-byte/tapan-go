import React from "react";
import NumberFlow from "@number-flow/react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Bullet } from "@/components/ui/bullet";
import { cn } from "@/lib/utils";

interface DashboardStatProps {
  label: string;
  value: string;
  description?: string;
  tag?: string;
  icon: React.ElementType;
  intent?: "positive" | "negative" | "neutral";
  direction?: "up" | "down";
}

export default function DashboardStat({
  label,
  value,
  description,
  icon,
  tag,
  intent,
  direction,
}: DashboardStatProps) {
  const Icon = icon;

  // Extract prefix, numeric value, and suffix from the value string
  const parseValue = (val: string) => {
    // Match pattern: optional prefix + number + optional suffix
    const match = val.match(/^([^\d.-]*)([+-]?\d*\.?\d+)([^\d]*)$/);

    if (match) {
      const [, prefix, numStr, suffix] = match;
      return {
        prefix: prefix || "",
        numericValue: parseFloat(numStr),
        suffix: suffix || "",
        isNumeric: !isNaN(parseFloat(numStr)),
      };
    }

    return {
      prefix: "",
      numericValue: 0,
      suffix: val,
      isNumeric: false,
    };
  };

  const getIntentClassName = () => {
    if (intent === "positive") return "text-success";
    if (intent === "negative") return "text-destructive";
    return "text-muted-foreground";
  };

  const { prefix, numericValue, suffix, isNumeric } = parseValue(value);

  return (
    <Card className="relative overflow-hidden shadow-sm">
      <CardHeader className="flex items-center justify-between pb-1 sm:pb-2 px-3 sm:px-6 pt-3 sm:pt-6">
        <CardTitle className="flex items-center gap-2 text-xs sm:text-sm font-semibold uppercase tracking-wider">
          <Bullet className="text-brand" />
          {label}
        </CardTitle>
        <div className="bg-brand/10 p-1 sm:p-1.5">
          <Icon className="size-3.5 sm:size-4 text-brand" />
        </div>
      </CardHeader>

      <CardContent className="bg-accent/50 flex-1 pt-2 sm:pt-3 md:pt-4 pb-3 sm:pb-6 px-3 sm:px-6 overflow-clip relative">
        <div className="flex items-center">
          <span className="text-2xl sm:text-4xl md:text-5xl font-display">
            {isNumeric ? (
              <NumberFlow
                value={numericValue}
                prefix={prefix}
                suffix={suffix}
              />
            ) : (
              value
            )}
          </span>
          {tag && (
            <Badge variant="default" className="uppercase ml-2 sm:ml-3 text-[10px] sm:text-xs">
              {tag}
            </Badge>
          )}
        </div>

        {description && (
          <div className="justify-between mt-1">
            <p className="text-[10px] sm:text-xs md:text-sm font-medium text-muted-foreground tracking-wide uppercase">
              {description}
            </p>
          </div>
        )}

        {/* Marquee Animation - hidden on mobile for cleaner look */}
        {direction && (
          <div className="absolute top-0 right-0 w-10 sm:w-14 h-full pointer-events-none overflow-hidden group hidden sm:block">
            <div
              className={cn(
                "flex flex-col transition-all duration-500",
                "group-hover:scale-105 group-hover:brightness-110",
                getIntentClassName(),
                direction === "up"
                  ? "animate-marquee-up"
                  : "animate-marquee-down"
              )}
            >
              <div
                className={cn(
                  "flex",
                  direction === "up" ? "flex-col-reverse" : "flex-col"
                )}
              >
                {Array.from({ length: 6 }, (_, i) => (
                  <Arrow key={i} direction={direction} index={i} />
                ))}
              </div>
              <div
                className={cn(
                  "flex",
                  direction === "up" ? "flex-col-reverse" : "flex-col"
                )}
              >
                {Array.from({ length: 6 }, (_, i) => (
                  <Arrow key={i} direction={direction} index={i} />
                ))}
              </div>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

interface ArrowProps {
  direction: "up" | "down";
  index: number;
}

const Arrow = ({ direction, index }: ArrowProps) => {
  const staggerDelay = index * 0.15; // Faster stagger
  const phaseDelay = (index % 3) * 0.8; // Different phase groups

  return (
    <span
      style={{
        animationDelay: `${staggerDelay + phaseDelay}s`,
        animationDuration: "3s",
        animationTimingFunction: "cubic-bezier(0.4, 0.0, 0.2, 1)",
      }}
      className={cn(
        "text-center text-5xl size-14 font-display leading-none block",
        "transition-all duration-700 ease-out",
        "animate-marquee-pulse",

        "will-change-transform"
      )}
    >
      {direction === "up" ? "↑" : "↓"}
    </span>
  );
};
