"use client";

import {
	Bell,
	ChevronDown,
	ChevronLeft,
	ChevronRight,
	MapPin,
} from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import * as React from "react";
import { type NavBadgeKey, navMain } from "@/components/dashboard/nav-config";
import { UserProfile } from "@/components/dashboard/sidebar/user-profile";
import { Bullet } from "@/components/ui/bullet";
import { Button } from "@/components/ui/button";
import {
	Popover,
	PopoverContent,
	PopoverTrigger,
} from "@/components/ui/popover";
import { TacLogo } from "@/components/ui/tac-logo";
import { useLocation } from "@/lib/location-context";
import { supabase } from "@/lib/supabaseClient";
import { cn } from "@/lib/utils";
import { LOCATIONS, type Location } from "@/types/auth";
import { useSidebar } from "./sidebar-context";

function LocationNotificationBar({ isCollapsed }: { isCollapsed: boolean }) {
	const { locationScope, setLocationScope } = useLocation();
	const [notificationCount, setNotificationCount] = React.useState(0);

	React.useEffect(() => {
		async function fetchNotificationCount() {
			try {
				const { count, error } = await supabase
					.from("notifications")
					.select("*", { count: "exact", head: true })
					.eq("is_read", false);

				if (!error && count !== null) {
					setNotificationCount(count);
				}
			} catch {
				setNotificationCount(0);
			}
		}
		fetchNotificationCount();
	}, []);

	if (isCollapsed) {
		return (
			<div className="flex flex-col items-center gap-2 px-2">
				<Popover>
					<PopoverTrigger asChild>
						<button className="flex items-center justify-center w-10 h-10 rounded-md bg-muted/50 hover:bg-muted transition-colors">
							<MapPin className="h-4 w-4 text-primary" />
						</button>
					</PopoverTrigger>
					<PopoverContent className="w-48 p-2" side="right" align="start">
						<div className="space-y-1">
							<p className="text-xs font-medium text-muted-foreground px-2 pb-1">
								Branch Location
							</p>
							<button
								onClick={() => setLocationScope("imphal")}
								className={cn(
									"w-full flex items-center gap-2 px-3 py-2 text-sm rounded-md transition-colors",
									locationScope === "imphal"
										? "bg-primary text-primary-foreground"
										: "hover:bg-accent",
								)}
							>
								<span className="font-mono text-xs">IMF</span>
								<span>Imphal</span>
							</button>
							<button
								onClick={() => setLocationScope("newdelhi")}
								className={cn(
									"w-full flex items-center gap-2 px-3 py-2 text-sm rounded-md transition-colors",
									locationScope === "newdelhi"
										? "bg-primary text-primary-foreground"
										: "hover:bg-accent",
								)}
							>
								<span className="font-mono text-xs">DEL</span>
								<span>New Delhi</span>
							</button>
							<div className="border-t my-1" />
							<button
								onClick={() => setLocationScope("all")}
								className={cn(
									"w-full flex items-center gap-2 px-3 py-2 text-xs rounded-md transition-colors",
									locationScope === "all"
										? "bg-primary/10 text-primary"
										: "hover:bg-accent text-muted-foreground",
								)}
							>
								View all locations
							</button>
						</div>
					</PopoverContent>
				</Popover>
				<Link
					href="/notifications"
					className="relative flex items-center justify-center w-10 h-10 rounded-md bg-muted/50 hover:bg-muted transition-colors"
				>
					<Bell className="h-4 w-4" />
					{notificationCount > 0 && (
						<span className="absolute -top-1 -right-1 flex items-center justify-center w-4 h-4 text-xs font-medium bg-destructive text-destructive-foreground rounded-full">
							{notificationCount > 9 ? "9+" : notificationCount}
						</span>
					)}
				</Link>
			</div>
		);
	}

	return (
		<div className="flex items-center gap-2 px-3">
			<Popover>
				<PopoverTrigger asChild>
					<button className="flex-1 flex items-center gap-2 px-3 py-2 rounded-md bg-muted/50 hover:bg-muted transition-colors text-left">
						<MapPin className="h-3.5 w-3.5 text-primary" />
						<span className="text-xs font-medium truncate flex-1">
							{locationScope === "all"
								? "All Locations"
								: LOCATIONS[locationScope as Location]?.name || "Imphal"}
						</span>
						<ChevronDown className="h-3 w-3 opacity-50" />
					</button>
				</PopoverTrigger>
				<PopoverContent className="w-48 p-2" side="right" align="start">
					<div className="space-y-1">
						<p className="text-xs font-medium text-muted-foreground px-2 pb-1">
							Branch Location
						</p>
						<button
							onClick={() => setLocationScope("imphal")}
							className={cn(
								"w-full flex items-center gap-2 px-3 py-2 text-sm rounded-md transition-colors",
								locationScope === "imphal"
									? "bg-primary text-primary-foreground"
									: "hover:bg-accent",
							)}
						>
							<span className="font-mono text-xs">IMF</span>
							<span>Imphal</span>
						</button>
						<button
							onClick={() => setLocationScope("newdelhi")}
							className={cn(
								"w-full flex items-center gap-2 px-3 py-2 text-sm rounded-md transition-colors",
								locationScope === "newdelhi"
									? "bg-primary text-primary-foreground"
									: "hover:bg-accent",
							)}
						>
							<span className="font-mono text-xs">DEL</span>
							<span>New Delhi</span>
						</button>
						<div className="border-t my-1" />
						<button
							onClick={() => setLocationScope("all")}
							className={cn(
								"w-full flex items-center gap-2 px-3 py-2 text-xs rounded-md transition-colors",
								locationScope === "all"
									? "bg-primary/10 text-primary"
									: "hover:bg-accent text-muted-foreground",
							)}
						>
							View all locations
						</button>
					</div>
				</PopoverContent>
			</Popover>

			<Link
				href="/notifications"
				className="relative flex items-center justify-center w-9 h-9 rounded-md bg-muted/50 hover:bg-muted transition-colors"
			>
				<Bell className="h-4 w-4" />
				{notificationCount > 0 && (
					<span className="absolute -top-1 -right-1 flex items-center justify-center w-4 h-4 text-xs font-medium bg-destructive text-destructive-foreground rounded-full">
						{notificationCount > 9 ? "9+" : notificationCount}
					</span>
				)}
			</Link>
		</div>
	);
}

export function AppSidebar() {
	const { isCollapsed, toggleSidebar, isMobile } = useSidebar();
	const pathname = usePathname();
	const [sidebarCounts, setSidebarCounts] = React.useState<
		Record<NavBadgeKey, number | null>
	>({
		warehouses: null,
		shipments: null,
		invoices: null,
		alerts: null,
	});

	// Check if admin for filtering nav items
	// Since we don't have profile here anymore, we can fetch it or just allow all for now
	// OR we can fetch basic user roles here if needed for nav filtering.
	// For now let's assume all nav is visible or fetch role purely for this.
	const [isAdmin, setIsAdmin] = React.useState(false);

	React.useEffect(() => {
		let cancelled = false;

		const timeoutId = setTimeout(async () => {
			if (cancelled) return;

			try {
				const [warehousesRes, shipmentsRes, invoicesRes] = await Promise.all([
					supabase
						.from("warehouses")
						.select("*", { count: "exact", head: true }),
					supabase
						.from("shipments")
						.select("*", { count: "exact", head: true })
						.in("status", ["pending", "in-transit", "at-warehouse"]),
					supabase
						.from("invoices")
						.select("*", { count: "exact", head: true })
						.in("status", ["pending", "overdue"]),
				]);

				if (cancelled) return;

				setSidebarCounts({
					warehouses: warehousesRes.count ?? null,
					shipments: shipmentsRes.count ?? null,
					invoices: invoicesRes.count ?? null,
					alerts: null,
				});
			} catch (error) {
				if (cancelled) return;
				console.warn("Failed to load sidebar counts", error);
			}
		}, 500);

		return () => {
			cancelled = true;
			clearTimeout(timeoutId);
		};
	}, []);

	React.useEffect(() => {
		async function checkRole() {
			const {
				data: { user },
			} = await supabase.auth.getUser();
			if (user) {
				const { data } = await supabase
					.from("users")
					.select("role")
					.eq("id", user.id)
					.single();
				setIsAdmin(data?.role === "admin");
			}
		}
		checkRole();
	}, []);

	const toPositiveBadge = (value: number | null) =>
		typeof value === "number" && value > 0 ? value : undefined;

	const navWithBadges = navMain.map((group) => ({
		...group,
		items: group.items.map((item) => {
			if (!item.badgeKey) return item;
			const raw = sidebarCounts[item.badgeKey];
			return { ...item, badge: toPositiveBadge(raw) };
		}),
	}));

	const visibleNav = navWithBadges
		.map((group) => ({
			...group,
			items: group.items.filter((item) => !item.requiresAdmin || isAdmin),
		}))
		.filter((group) => group.items.length > 0);

	const renderBadge = (
		badge: string | number | undefined,
		color: "default" | "success" | "warning" | "destructive" = "default",
	) => {
		if (badge === undefined || badge === null) return null;
		if (typeof badge === "number" && badge <= 0) return null;

		const colorClasses = {
			default: "bg-muted text-muted-foreground",
			success: "bg-primary/20 text-primary",
			warning: "bg-accent/20 text-accent-foreground",
			destructive: "bg-destructive/20 text-destructive",
		};

		return (
			<span
				className={cn(
					"ml-auto px-1.5 py-0.5 text-xs font-semibold rounded",
					colorClasses[color],
				)}
			>
				{badge}
			</span>
		);
	};

	if (isMobile && isCollapsed) return null;

	return (
		<aside
			className={cn(
				"fixed left-0 top-0 z-40 h-screen border-r bg-background transition-all duration-300 ease-in-out",
				isCollapsed ? "w-[70px]" : "w-64",
			)}
		>
			<div className="flex h-full flex-col">
				{/* Header */}
				<div className="flex h-16 items-center border-b px-3 gap-2">
					<div className="flex items-center gap-2 flex-1">
						<TacLogo
							collapsed={isCollapsed}
							className={cn("", isCollapsed && "pl-1")}
						/>
					</div>
					<div className="flex items-center gap-1">
						{!isMobile && (
							<Button
								variant="ghost"
								size="icon"
								className="h-8 w-8"
								onClick={toggleSidebar}
							>
								{isCollapsed ? (
									<ChevronRight className="h-4 w-4" />
								) : (
									<ChevronLeft className="h-4 w-4" />
								)}
							</Button>
						)}
					</div>
				</div>

				{/* Location & Notifications */}
				<div className="py-3 border-b">
					<LocationNotificationBar isCollapsed={isCollapsed} />
				</div>

				{/* Scrollable Navigation */}
				<div className="flex-1 overflow-y-auto py-4">
					<nav className="space-y-6 px-2">
						{visibleNav.map((group) => (
							<div key={group.title}>
								{!isCollapsed && (
									<h3 className="mb-2 px-3 flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
										<Bullet className="opacity-60" />
										{group.title}
									</h3>
								)}
								<div className="space-y-1">
									{group.items.map((item) => {
										const isActive =
											pathname === item.url ||
											pathname.startsWith(`${item.url}/`);
										return (
											<Link
												key={item.url}
												href={item.url}
												className={cn(
													"flex items-center gap-3 rounded-md px-3 py-2 text-sm font-medium transition-colors hover:bg-muted hover:text-foreground",
													isActive
														? "bg-primary/10 text-primary"
														: "text-muted-foreground",
													isCollapsed && "justify-center px-2",
												)}
												title={isCollapsed ? item.title : undefined}
											>
												<item.icon className="h-5 w-5 shrink-0" />
												{!isCollapsed && (
													<>
														<span className="flex-1">{item.title}</span>
														{renderBadge(item.badge, item.badgeColor)}
													</>
												)}
											</Link>
										);
									})}
								</div>
							</div>
						))}
					</nav>
				</div>

				{/* Footer */}
				<div className="border-t p-2">
					<UserProfile />
				</div>
			</div>
		</aside>
	);
}
