"use client";

import React, { useState } from "react";
import { cn } from "@/lib/utils";

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
        <div className="space-y-3">
          {categories.map((category) => (
            <div
              key={category.id}
              className="group relative"
              onMouseEnter={() => setHoveredItem(category.id)}
              onMouseLeave={() => setHoveredItem(null)}
              onClick={category.onClick}
            >
              <div
                className={cn(
                  "relative cursor-pointer overflow-hidden border bg-card transition-all duration-300 ease-in-out",
                  hoveredItem === category.id
                    ? "h-32 border-primary bg-primary/5 shadow-lg shadow-primary/20"
                    : "h-24 border-border hover:border-primary/50"
                )}
              >
                {hoveredItem === category.id && (
                  <>
                    <div className="absolute left-3 top-3 h-6 w-6">
                      <div className="absolute left-0 top-0 h-0.5 w-4 bg-primary" />
                      <div className="absolute left-0 top-0 h-4 w-0.5 bg-primary" />
                    </div>
                    <div className="absolute bottom-3 right-3 h-6 w-6">
                      <div className="absolute bottom-0 right-0 h-0.5 w-4 bg-primary" />
                      <div className="absolute bottom-0 right-0 h-4 w-0.5 bg-primary" />
                    </div>
                  </>
                )}

                <div className="flex h-full items-center justify-between px-6 md:px-8">
                  <div className="flex-1">
                    <h3
                      className={cn(
                        "font-bold transition-colors duration-300",
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
                          "mt-1 text-sm md:text-base transition-colors duration-300",
                          hoveredItem === category.id
                            ? "text-foreground/90"
                            : "text-muted-foreground"
                        )}
                      >
                        {category.subtitle}
                      </p>
                    )}
                  </div>

                  {category.icon && hoveredItem === category.id && (
                    <div className="text-primary opacity-0 transition-opacity duration-300 group-hover:opacity-100">
                      {category.icon}
                    </div>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
