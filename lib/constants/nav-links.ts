import {
  LayoutDashboard,
  Package,
  FileText,
  Users,
  Warehouse,
  Settings,
  HeadphonesIcon,
  BarChart3,
  Globe,
  Truck,
  ShieldAlert,
} from "lucide-react";

export type NavItem = {
  title: string;
  href: string;
  icon: React.ComponentType<{ className?: string }>;
  roles?: string[]; // If using RBAC
};

export type NavGroup = {
  title: string;
  items: NavItem[];
};

export const NAV_GROUPS: NavGroup[] = [
  {
    title: "Operations",
    items: [
      { title: "Dashboard", href: "/dashboard", icon: LayoutDashboard },
      { title: "Shipments", href: "/dashboard/shipments", icon: Package },
      { title: "Tracking", href: "/dashboard/tracking", icon: Globe },
      { title: "Fleet", href: "/dashboard/fleet", icon: Truck },
    ],
  },
  {
    title: "Finance",
    items: [
      { title: "Invoices", href: "/dashboard/invoices", icon: FileText },
      { title: "Rates", href: "/dashboard/rates", icon: BarChart3 },
    ],
  },
  {
    title: "Management",
    items: [
      { title: "Customers", href: "/dashboard/customers", icon: Users },
      { title: "Warehouse", href: "/dashboard/warehouse", icon: Warehouse },
      { title: "Reports", href: "/dashboard/reports", icon: FileText },
    ],
  },
  {
    title: "Support",
    items: [
      { title: "Tickets", href: "/dashboard/support", icon: HeadphonesIcon },
      { title: "Alerts", href: "/dashboard/alerts", icon: ShieldAlert },
    ],
  },
  {
    title: "System",
    items: [
      { title: "Settings", href: "/dashboard/settings", icon: Settings },
    ],
  },
];
