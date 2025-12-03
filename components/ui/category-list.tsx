"use client";

import React, { useState } from "react";
import { cn } from "@/lib/utils";
import { AnimatedCard } from "@/components/ui/animated-card";

export interface Category {
  id: string | number;
  title: string;
  subtitle?: string;
  icon?: React.ReactNode;
  onClick?: () => void;
  featured?: boolean;
}

export interface CategoryListProps {
  title: string;
  subtitle?: string;
  categories: Category[];
  headerIcon?: React.ReactNode;
  className?: string;
}

export const CategoryList = ({
  title,
  subtitle,
  categories,
  headerIcon,
  className,
}: CategoryListProps) => {
  const [hoveredItem, setHoveredItem] = useState<string | number | null>(null);

  return (
    <div className={cn("w-full bg-background text-foreground p-8", className)}>
      <div className="mx-auto max-w-4xl">
        {/* Header Section */}
        <div className="mb-12 text-center md:mb-16">
          {headerIcon && (
            <div className="mb-6 inline-flex h-16 w-16 items-center justify-center rounded-full bg-gradient-to-br from-primary/80 to-primary text-primary-foreground">
              {headerIcon}
            </div>
          )}
          <h1 className="mb-2 text-4xl font-bold tracking-tight md:text-5xl">
            {title}
          </h1>
          {subtitle && (
            <h2 className="text-4xl font-bold text-muted-foreground md:text-5xl">
              {subtitle}
            </h2>
          )}
        </div>

        {/* Categories List */}
        <div className="grid gap-4 md:grid-cols-2">
          {categories.map((category, index) => (
            <AnimatedCard
              key={category.id}
              delay={index * 0.05}
              onMouseEnter={() => setHoveredItem(category.id)}
              onMouseLeave={() => setHoveredItem(null)}
              onClick={category.onClick}
              className={cn(
                "group cursor-pointer border-border/60 bg-pop/40",
                category.featured && "md:row-span-2",
                hoveredItem === category.id &&
                  "border-primary/70 shadow-lg shadow-primary/20"
              )}
            >
              <div className="flex h-full flex-col justify-between gap-4">
                <div className="flex flex-col gap-2">
                  <h3
                    className={cn(
                      "font-bold tracking-tight",
                      category.featured
                        ? "text-2xl md:text-3xl"
                        : "text-xl md:text-2xl",
                      hoveredItem === category.id
                        ? "text-primary"
                        : "text-foreground"
                    )}
                  >
                    {category.title}
                  </h3>
                  {category.subtitle && (
                    <p
                      className={cn(
                        "text-sm md:text-base",
                        hoveredItem === category.id
                          ? "text-foreground/90"
                          : "text-muted-foreground"
                      )}
                    >
                      {category.subtitle}
                    </p>
                  )}
                </div>
                {category.icon && (
                  <div className="flex items-center justify-between text-[0.7rem] uppercase tracking-[0.18em] text-muted-foreground">
                    <span className="flex items-center gap-2">
                      <span className="h-1.5 w-1.5 rounded-full bg-primary" />
                      <span>Priority channel</span>
                    </span>
                    <div className="text-primary opacity-70 group-hover:opacity-100">
                      {category.icon}
                    </div>
                  </div>
                )}
              </div>
            </AnimatedCard>
          ))}
        </div>
      </div>
    </div>
  );
};
