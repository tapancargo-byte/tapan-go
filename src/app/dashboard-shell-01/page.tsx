"use client";

import {
	ArchiveIcon,
	BarcodeIcon,
	BellIcon,
	Box,
	BoxIcon,
	ChevronRightIcon,
	ClipboardListIcon,
	FileTextIcon,
	GlobeIcon,
	LayoutDashboardIcon,
	SearchIcon,
	SettingsIcon,
	TruckIcon,
	UsersIcon,
	WarehouseIcon,
} from "lucide-react";
import { ShipmentActivityChart } from "@/components/shadcn-studio/blocks/chart-shipment-activity";
import { ShipmentDataTable } from "@/components/shadcn-studio/blocks/datatable-shipment";
import { RecentShipmentsList } from "@/components/shadcn-studio/blocks/list-recent-shipments";
import StatisticsCard from "@/components/shadcn-studio/blocks/statistics-card-01";
import { ThemeToggle } from "@/components/theme-toggle";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
	Breadcrumb,
	BreadcrumbItem,
	BreadcrumbLink,
	BreadcrumbList,
	BreadcrumbPage,
	BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import {
	Sidebar,
	SidebarContent,
	SidebarFooter,
	SidebarGroup,
	SidebarGroupContent,
	SidebarGroupLabel,
	SidebarHeader,
	SidebarMenu,
	SidebarMenuBadge,
	SidebarMenuButton,
	SidebarMenuItem,
	SidebarProvider,
	SidebarRail,
	SidebarTrigger,
	useSidebar,
} from "@/components/ui/sidebar";

// Logistics Statistics Data
const LogisticsStatsData = [
	{
		icon: <TruckIcon className="size-8" />,
		value: "3",
		title: "Total Shipments",
		changePercentage: "+12.5%",
		trend: "up" as const,
		subtext: "Trending up this month",
	},
	{
		icon: <UsersIcon className="size-8" />,
		value: "31",
		title: "Active Customers",
		changePercentage: "+8.2%",
		trend: "up" as const,
		subtext: "Customer base growing",
	},
	{
		icon: <FileTextIcon className="size-8" />,
		value: "6",
		title: "Pending Invoices",
		changePercentage: "-5.3%",
		trend: "down" as const,
		subtext: "Fewer pending",
	},
	{
		icon: <WarehouseIcon className="size-8" />,
		value: "23%",
		title: "Warehouse Capacity",
		changePercentage: "-2.3%",
		trend: "down" as const,
		subtext: "More space available",
	},
];

// Sidebar Logo Component that responds to collapsed state
function SidebarLogo() {
	const { state } = useSidebar();
	const isCollapsed = state === "collapsed";

	return (
		<div className="flex items-center gap-3 cursor-pointer group">
			<div className="h-9 w-9 bg-primary/10 rounded-lg flex items-center justify-center border border-primary/20 group-hover:bg-primary/20 transition-colors shrink-0">
				<Box className="h-5 w-5 text-primary" />
			</div>
			{!isCollapsed && (
				<div className="flex flex-col justify-center overflow-hidden">
					<span className="font-bold text-xl leading-none tracking-tight">
						TAC<span className="text-primary">.</span>
					</span>
					<span className="text-xs text-muted-foreground font-medium uppercase tracking-widest mt-0.5 truncate">
						Tapan Associate Cargo
					</span>
				</div>
			)}
		</div>
	);
}

// User Profile Component for footer
function SidebarUserProfile() {
	const { state } = useSidebar();
	const isCollapsed = state === "collapsed";

	return (
		<div className="flex items-center gap-3">
			<Avatar className="h-9 w-9 bg-primary/10 text-primary border shrink-0">
				<AvatarImage src="https://github.com/shadcn.png" />
				<AvatarFallback>IA</AvatarFallback>
			</Avatar>
			{!isCollapsed && (
				<div className="grid gap-0.5 text-sm overflow-hidden">
					<span className="font-semibold truncate">Imphal Admin</span>
					<span className="text-xs text-muted-foreground truncate">
						Super Admin
					</span>
				</div>
			)}
		</div>
	);
}

const DashboardShell = () => {
	return (
		<div className="flex min-h-dvh w-full bg-muted/20">
			<SidebarProvider>
				<Sidebar collapsible="icon">
					<SidebarHeader className="border-b p-4">
						<SidebarLogo />
					</SidebarHeader>
					<SidebarContent>
						<SidebarGroup>
							<SidebarGroupLabel>Core Operations</SidebarGroupLabel>
							<SidebarGroupContent>
								<SidebarMenu>
									<SidebarMenuItem>
										<SidebarMenuButton isActive asChild tooltip="Dashboard">
											<a href="/">
												<LayoutDashboardIcon />
												<span>Dashboard</span>
											</a>
										</SidebarMenuButton>
										<SidebarMenuBadge className="bg-green-500/10 text-green-500 border border-green-200 hover:bg-green-500/20 hover:text-green-600 h-5 px-1.5">
											live
										</SidebarMenuBadge>
									</SidebarMenuItem>
									<SidebarMenuItem>
										<SidebarMenuButton asChild tooltip="Warehouse">
											<a href="/">
												<WarehouseIcon />
												<span>Warehouse</span>
											</a>
										</SidebarMenuButton>
										<SidebarMenuBadge>7</SidebarMenuBadge>
									</SidebarMenuItem>
									<SidebarMenuItem>
										<SidebarMenuButton asChild tooltip="Shipments">
											<a href="/">
												<TruckIcon />
												<span>Shipments</span>
											</a>
										</SidebarMenuButton>
										<SidebarMenuBadge>2</SidebarMenuBadge>
									</SidebarMenuItem>
									<SidebarMenuItem>
										<SidebarMenuButton asChild tooltip="Inventory">
											<a href="/">
												<BoxIcon />
												<span>Inventory</span>
											</a>
										</SidebarMenuButton>
									</SidebarMenuItem>
								</SidebarMenu>
							</SidebarGroupContent>
						</SidebarGroup>

						<SidebarGroup>
							<SidebarGroupLabel>Management & Billing</SidebarGroupLabel>
							<SidebarGroupContent>
								<SidebarMenu>
									<SidebarMenuItem>
										<SidebarMenuButton asChild tooltip="Customers">
											<a href="/">
												<UsersIcon />
												<span>Customers</span>
											</a>
										</SidebarMenuButton>
									</SidebarMenuItem>
									<SidebarMenuItem>
										<SidebarMenuButton asChild tooltip="Invoices">
											<a href="/">
												<FileTextIcon />
												<span>Invoices</span>
											</a>
										</SidebarMenuButton>
										<SidebarMenuBadge>0</SidebarMenuBadge>
									</SidebarMenuItem>
									<SidebarMenuItem>
										<SidebarMenuButton asChild tooltip="Rates">
											<a href="/">
												<ClipboardListIcon />
												<span>Rates</span>
											</a>
										</SidebarMenuButton>
									</SidebarMenuItem>
									<SidebarMenuItem>
										<SidebarMenuButton asChild tooltip="Aircargo Manifests">
											<a href="/">
												<ArchiveIcon />
												<span>Aircargo Manifests</span>
											</a>
										</SidebarMenuButton>
									</SidebarMenuItem>
									<SidebarMenuItem>
										<SidebarMenuButton asChild tooltip="Manifest Scan Session">
											<a href="/">
												<BarcodeIcon />
												<span>Manifest Scan Session</span>
											</a>
										</SidebarMenuButton>
									</SidebarMenuItem>
									<SidebarMenuItem>
										<SidebarMenuButton asChild tooltip="Barcode Tracking">
											<a href="/">
												<BarcodeIcon />
												<span>Barcode Tracking</span>
											</a>
										</SidebarMenuButton>
									</SidebarMenuItem>
								</SidebarMenu>
							</SidebarGroupContent>
						</SidebarGroup>

						<SidebarGroup className="mt-auto">
							<SidebarGroupLabel>System</SidebarGroupLabel>
							<SidebarGroupContent>
								<SidebarMenu>
									<SidebarMenuItem>
										<SidebarMenuButton asChild tooltip="Global Search">
											<a href="/">
												<GlobeIcon />
												<span>Global Search</span>
											</a>
										</SidebarMenuButton>
									</SidebarMenuItem>
									<SidebarMenuItem>
										<SidebarMenuButton asChild tooltip="Notifications">
											<a href="/">
												<BellIcon />
												<span>Notifications</span>
											</a>
										</SidebarMenuButton>
										<SidebarMenuBadge>12</SidebarMenuBadge>
									</SidebarMenuItem>
									<SidebarMenuItem>
										<SidebarMenuButton asChild tooltip="Settings">
											<a href="/">
												<SettingsIcon />
												<span>Settings</span>
											</a>
										</SidebarMenuButton>
									</SidebarMenuItem>
								</SidebarMenu>
							</SidebarGroupContent>
						</SidebarGroup>
					</SidebarContent>
					<SidebarFooter className="border-t p-4">
						<SidebarUserProfile />
					</SidebarFooter>
					<SidebarRail />
				</Sidebar>

				<div className="flex flex-1 flex-col">
					<header className="bg-background sticky top-0 z-50 flex h-14 items-center gap-4 border-b px-6 shadow-sm">
						<SidebarTrigger />
						<Separator orientation="vertical" className="h-6" />
						<Breadcrumb>
							<BreadcrumbList>
								<BreadcrumbItem>
									<BreadcrumbLink href="#">Imphal</BreadcrumbLink>
								</BreadcrumbItem>
								<BreadcrumbSeparator>
									<ChevronRightIcon />
								</BreadcrumbSeparator>
								<BreadcrumbItem>
									<BreadcrumbLink href="#">Core Operations</BreadcrumbLink>
								</BreadcrumbItem>
								<BreadcrumbSeparator>
									<ChevronRightIcon />
								</BreadcrumbSeparator>
								<BreadcrumbItem>
									<BreadcrumbPage>Dashboard</BreadcrumbPage>
								</BreadcrumbItem>
							</BreadcrumbList>
						</Breadcrumb>
						<div className="ml-auto flex items-center gap-4">
							<div className="relative">
								<SearchIcon className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
								<input
									type="search"
									placeholder="Search..."
									className="h-9 w-64 rounded-md border border-input bg-transparent pl-9 pr-4 text-sm shadow-sm transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
								/>
							</div>
							<ThemeToggle />
							<Button variant="ghost" size="icon" className="relative">
								<BellIcon className="h-5 w-5 text-muted-foreground" />
								<span className="absolute top-2 right-2 h-2 w-2 rounded-full bg-red-600 border border-background"></span>
							</Button>
						</div>
					</header>

					<main className="flex-1 p-6 space-y-8 overflow-y-auto">
						{/* Header Section */}
						<div className="space-y-1">
							<h1 className="text-3xl font-bold tracking-tight">Dashboard</h1>
							<p className="text-muted-foreground">
								Core operations overview for shipments, customers, billing, and
								capacity.
							</p>
						</div>

						{/* Stats Grid */}
						<div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
							{LogisticsStatsData.map((card, index) => (
								<StatisticsCard
									key={index}
									icon={card.icon}
									title={card.title}
									value={card.value}
									changePercentage={card.changePercentage}
									trend={card.trend}
									subtext={card.subtext}
									className="shadow-sm border-none bg-card/60 backdrop-blur-sm hover:bg-card transition-colors"
								/>
							))}
						</div>

						{/* Main Content Grid */}
						<div className="grid gap-6 xl:grid-cols-3">
							{/* Chart Section */}
							<ShipmentActivityChart />

							{/* Recent Shipments List */}
							<RecentShipmentsList />
						</div>

						{/* Detailed Data Table */}
						<div className="flex flex-col gap-4">
							<ShipmentDataTable />
						</div>
					</main>
				</div>
			</SidebarProvider>
		</div>
	);
};

export default DashboardShell;
