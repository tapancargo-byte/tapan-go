"use client";

import React from "react";
import { cn } from "@/lib/utils";
import { BorderBeam } from "@/components/ui/border-beam";

interface BentoGridProps {
  children: React.ReactNode;
  className?: string;
}

interface BentoCardProps {
  id?: string;
  children: React.ReactNode;
  className?: string;
}

interface BentoTitleProps {
  children?: React.ReactNode;
  className?: string;
}

interface BentoDescriptionProps {
  children?: React.ReactNode;
  className?: string;
}

interface BentoContentProps {
  children: React.ReactNode;
  className?: string;
}

interface BentoFeature {
  id: string;
  title?: string;
  description?: string;
  content: React.ReactNode;
  className?: string;
}

interface BentoGridWithFeaturesProps {
  features: BentoFeature[];
  className?: string;
}

// Main Bento Grid Container
const BentoGrid = ({ children, className }: BentoGridProps) => {
  return (
    <div
      className={cn(
        "grid grid-cols-1 md:grid-cols-6 lg:grid-cols-6 gap-0 rounded-3xl border border-border/40 bg-background/80",
        className,
      )}
    >
      {children}
    </div>
  );
};

// Individual Bento Card with HUD-style rotating border
const BentoCard = ({ id, children, className }: BentoCardProps) => {
  const borderRef = React.useRef<HTMLDivElement | null>(null);

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    const border = borderRef.current;
    if (!border) return;
    const rect = border.getBoundingClientRect();
    const x = e.clientX - rect.left - rect.width / 2;
    const y = e.clientY - rect.top - rect.height / 2;
    const angle = Math.atan2(y, x);
    border.style.setProperty("--rotation", `${angle}rad`);
  };

  const handleMouseLeave = () => {
    const border = borderRef.current;
    if (!border) return;
    border.style.setProperty("--rotation", "0deg");
  };

  const pattern =
    `linear-gradient(45deg, var(--pattern-color1) 25%, transparent 25%, transparent 75%, var(--pattern-color2) 75%),` +
    `linear-gradient(-45deg, var(--pattern-color2) 25%, transparent 25%, transparent 75%, var(--pattern-color1) 75%)`;

  const borderGradient =
    "conic-gradient(from var(--rotation,0deg), var(--border-bg-color) 0deg, var(--border-bg-color) 360deg)";

  return (
    <div
      id={id}
      ref={borderRef}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      className={cn("relative p-3 sm:p-4", className)}
    >
      <div
        style={{
          width: "100%",
          height: "100%",
          borderRadius: "1rem",
          border: "1px solid var(--border-bg-color)",
          backgroundOrigin: "border-box",
          backgroundClip: "padding-box, border-box",
          backgroundImage: "none",
          padding: 12,
          boxSizing: "border-box",
          display: "flex",
          alignItems: "stretch",
          justifyContent: "stretch",
        } as React.CSSProperties}
        className="relative"
      >
        <div
          style={{
            width: "100%",
            height: "100%",
            borderRadius: "0.9rem",
            background: "var(--card-bg-color)",
            overflow: "hidden",
            boxSizing: "border-box",
          } as React.CSSProperties}
          className="flex h-full w-full flex-col gap-3 p-4 sm:p-6"
        >
          {children}
        </div>
      </div>
    </div>
  );
};

// Bento Card Title
const BentoTitle = ({ children, className }: BentoTitleProps) => {
  if (!children) return null;

  return (
    <h3
      className={cn(
        "text-left text-xl tracking-tight text-black md:text-2xl md:leading-snug dark:text-white",
        className,
      )}
    >
      {children}
    </h3>
  );
};

// Bento Card Description
const BentoDescription = ({ children, className }: BentoDescriptionProps) => {
  if (!children) return null;

  return (
    <p
      className={cn(
        "text-left text-sm md:text-base",
        "font-normal text-neutral-500 dark:text-neutral-300",
        "mx-0 my-2 max-w-sm text-left md:text-sm",
        className,
      )}
    >
      {children}
    </p>
  );
};

// Bento Card Content Wrapper
const BentoContent = ({ children, className }: BentoContentProps) => {
  return <div className={cn("h-full w-full", className)}>{children}</div>;
};

// Complete Bento Grid with Features Array
const BentoGridWithFeatures = ({
  features,
  className,
}: BentoGridWithFeaturesProps) => {
  return (
    <div className="relative mb-6">
      <BentoGrid className={className}>
        {features.map((feature) => (
          <BentoCard
            key={feature.id}
            id={feature.id}
            className={feature.className}
          >
            <BentoTitle>{feature.title}</BentoTitle>
            <BentoDescription>{feature.description}</BentoDescription>
            <BentoContent>{feature.content}</BentoContent>
          </BentoCard>
        ))}
      </BentoGrid>
    </div>
  );
};

export {
  BentoGrid,
  BentoCard,
  BentoTitle,
  BentoDescription,
  BentoContent,
  BentoGridWithFeatures,
  type BentoFeature,
  type BentoGridProps,
  type BentoCardProps,
};
