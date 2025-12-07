import type React from "react";

import BracketsIcon from "@/components/icons/brackets";
import AtomIcon from "@/components/icons/atom";
import ProcessorIcon from "@/components/icons/proccesor";
import GearIcon from "@/components/icons/gear";
import MonkeyIcon from "@/components/icons/monkey";
import EmailIcon from "@/components/icons/email";
import WarehouseIcon from "@/components/icons/warehouse";
import TruckIcon from "@/components/icons/truck";
import BoxIcon from "@/components/icons/box";

export type NavBadgeColor = "default" | "success" | "warning" | "destructive";
export type NavBadgeKey = "warehouses" | "shipments" | "invoices" | "alerts";

export interface NavItem {
  title: string;
  url: string;
  icon: React.ElementType;
  locked?: boolean;
  badge?: string | number;
  badgeColor?: NavBadgeColor;
  requiresAdmin?: boolean;
  badgeKey?: NavBadgeKey;
}

export interface NavGroup {
  id: "core" | "management" | "system";
  title: string;
  items: NavItem[];
}

export const navMain: NavGroup[] = [
  {
    id: "core",
    title: "Core Operations",
    items: [
      {
        title: "Dashboard",
        url: "/dashboard",
        icon: BracketsIcon,
        badge: "Live",
        badgeColor: "success",
      },
      {
        title: "Warehouse",
        url: "/warehouse",
        icon: WarehouseIcon,
        badgeKey: "warehouses",
      },
      {
        title: "Shipments",
        url: "/shipments",
        icon: TruckIcon,
        badgeKey: "shipments",
      },
      {
        title: "Inventory",
        url: "/inventory",
        icon: BoxIcon,
      },
    ],
  },
  {
    id: "management",
    title: "Management & Billing",
    items: [
      {
        title: "Customers",
        url: "/customers",
        icon: EmailIcon,
      },
      {
        title: "Invoices",
        url: "/invoices",
        icon: GearIcon,
        badgeKey: "invoices",
      },
      {
        title: "Rates",
        url: "/rates",
        icon: ProcessorIcon,
      },
      {
        title: "Aircargo Manifesto",
        url: "/aircargo",
        icon: AtomIcon,
      },
      {
        title: "Manifest Scan Session",
        url: "/aircargo/scan-session",
        icon: AtomIcon,
      },
      {
        title: "Barcode Tracking",
        url: "/barcodes",
        icon: BracketsIcon,
      },
    ],
  },
  {
    id: "system",
    title: "System",
    items: [
      {
        title: "Tapan Associate",
        url: "/tapan-associate",
        icon: MonkeyIcon,
      },
      {
        title: "Global Search",
        url: "/search",
        icon: ProcessorIcon,
      },
      {
        title: "Reports & Analytics",
        url: "/reports",
        icon: ProcessorIcon,
        requiresAdmin: true,
      },
      {
        title: "Network Analytics",
        url: "/analytics",
        icon: AtomIcon,
        requiresAdmin: true,
      },
      {
        title: "Exceptions & Alerts",
        url: "/alerts",
        icon: BracketsIcon,
        badgeKey: "alerts",
        requiresAdmin: true,
      },
      {
        title: "Notifications",
        url: "/notifications",
        icon: EmailIcon,
      },
      {
        title: "Support Tickets",
        url: "/support",
        icon: EmailIcon,
      },
      {
        title: "Ops Activity",
        url: "/ops-activity",
        icon: ProcessorIcon,
      },
      {
        title: "Settings",
        url: "/settings",
        icon: GearIcon,
        requiresAdmin: true,
      },
      {
        title: "Admin",
        url: "/admin",
        icon: GearIcon,
        requiresAdmin: true,
      },
    ],
  },
];
