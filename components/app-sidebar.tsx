"use client"

import * as React from "react"
import {
  IconChartBar,
  IconDashboard,
  IconFileDescription,
  IconHelp,
  IconPackage,
  IconReport,
  IconSearch,
  IconSettings,
  IconUsers,
  IconBuildingWarehouse,
  IconReceipt,
  IconBarcode,
  IconTruck,
  IconMapPin,
  IconCalendar,
} from "@tabler/icons-react"

import { NavDocuments } from "@/components/nav-documents"
import { NavMain } from "@/components/nav-main"
import { NavSecondary } from "@/components/nav-secondary"
import { NavUser } from "@/components/nav-user"
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar"

const data = {
  user: {
    name: "Admin User",
    email: "admin@tapanassociate.com",
    avatar: "/icons/logo.svg",
  },
  navMain: [
    {
      title: "Dashboard",
      url: "/dashboard",
      icon: IconDashboard,
    },
    {
      title: "Shipments",
      url: "/shipments",
      icon: IconPackage,
    },
    {
      title: "Customers",
      url: "/customers",
      icon: IconUsers,
    },
    {
      title: "Warehouse",
      url: "/warehouse",
      icon: IconBuildingWarehouse,
    },
    {
      title: "Invoices",
      url: "/invoices",
      icon: IconReceipt,
    },
    {
      title: "Calendar",
      url: "/calendar",
      icon: IconCalendar,
    },
  ],
  navClouds: [
    {
      title: "Operations",
      icon: IconTruck,
      isActive: true,
      url: "#",
      items: [
        {
          title: "Active Shipments",
          url: "/shipments?status=active",
        },
        {
          title: "Pending Pickups",
          url: "/shipments?status=pending",
        },
      ],
    },
    {
      title: "Inventory",
      icon: IconBarcode,
      url: "/inventory",
      items: [
        {
          title: "Stock Levels",
          url: "/inventory",
        },
        {
          title: "Barcodes",
          url: "/barcodes",
        },
      ],
    },
    {
      title: "Tracking",
      icon: IconMapPin,
      url: "/track",
      items: [
        {
          title: "Track Shipment",
          url: "/track",
        },
        {
          title: "Scan History",
          url: "/scans",
        },
      ],
    },
  ],
  navSecondary: [
    {
      title: "Settings",
      url: "/settings",
      icon: IconSettings,
    },
    {
      title: "Get Help",
      url: "/support",
      icon: IconHelp,
    },
    {
      title: "Search",
      url: "/search",
      icon: IconSearch,
    },
  ],
  documents: [
    {
      name: "Analytics",
      url: "/analytics",
      icon: IconChartBar,
    },
    {
      name: "Reports",
      url: "/reports",
      icon: IconReport,
    },
    {
      name: "Manifests",
      url: "/manifests",
      icon: IconFileDescription,
    },
  ],
}

export function AppSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {
  return (
    <Sidebar collapsible="offcanvas" {...props}>
      <SidebarHeader>
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton
              asChild
              className="data-[slot=sidebar-menu-button]:!p-1.5"
            >
              <a href="/dashboard">
                <img src="/icons/logo.svg" alt="Tapan Associate" className="size-5" />
                <span className="text-base font-semibold">Tapan Associate</span>
              </a>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarHeader>
      <SidebarContent>
        <NavMain items={data.navMain} />
        <NavDocuments items={data.documents} />
        <NavSecondary items={data.navSecondary} className="mt-auto" />
      </SidebarContent>
      <SidebarFooter>
        <NavUser user={data.user} />
      </SidebarFooter>
    </Sidebar>
  )
}
