"use client";

import React from "react";
import { cn } from "@/lib/utils";
import { Package, FileText, Users, Truck, Box, Search } from "lucide-react";

type EmptyStateVariant = "default" | "shipments" | "customers" | "invoices" | "inventory" | "search";

const variantIcons: Record<EmptyStateVariant, React.ElementType> = {
  default: Box,
  shipments: Truck,
  customers: Users,
  invoices: FileText,
  inventory: Package,
  search: Search,
};

const variantMessages: Record<EmptyStateVariant, { title: string; description: string }> = {
  default: {
    title: "No data found",
    description: "There's nothing to display here yet.",
  },
  shipments: {
    title: "No shipments",
    description: "Create your first shipment to get started tracking cargo.",
  },
  customers: {
    title: "No customers",
    description: "Add your first customer to start managing relationships.",
  },
  invoices: {
    title: "No invoices",
    description: "Create an invoice to start tracking payments.",
  },
  inventory: {
    title: "No inventory items",
    description: "Add items to start tracking your warehouse inventory.",
  },
  search: {
    title: "No results found",
    description: "Try adjusting your search or filter criteria.",
  },
};

interface EmptyStateProps {
  variant?: EmptyStateVariant;
  title?: string;
  description?: string;
  className?: string;
  iconClassName?: string;
  children?: React.ReactNode;
}

export function EmptyState({
  variant = "default",
  title,
  description,
  className,
  iconClassName,
  children,
}: EmptyStateProps) {
  const Icon = variantIcons[variant];
  const defaultContent = variantMessages[variant];

  return (
    <div
      className={cn(
        "flex flex-col items-center justify-center py-8 sm:py-12 px-4 text-center",
        className
      )}
    >
      <div className={cn(
        "bg-muted/50 p-4 mb-4",
        iconClassName
      )}>
        <Icon className="h-8 w-8 sm:h-10 sm:w-10 text-muted-foreground/60" />
      </div>
      <h3 className="text-sm sm:text-base font-semibold text-foreground mb-1">
        {title || defaultContent.title}
      </h3>
      <p className="text-xs sm:text-sm text-muted-foreground max-w-xs">
        {description || defaultContent.description}
      </p>
      {children && <div className="mt-4">{children}</div>}
    </div>
  );
}

export default EmptyState;
