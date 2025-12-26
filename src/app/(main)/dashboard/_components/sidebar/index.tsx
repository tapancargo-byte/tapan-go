"use client";

import { ChevronDown } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import * as React from "react";
import BracketsIcon from "@/components/icons/brackets";

import GearIcon from "@/components/icons/gear";
import LockIcon from "@/components/icons/lock";
import MonkeyIcon from "@/components/icons/monkey";
// import { useIsV0 } from '@/lib/v0-context';
import { SidebarLogo } from "./sidebar-logo";
import { Bullet } from "@/components/ui/bullet";
import {
	DropdownMenu,
	DropdownMenuContent,
	DropdownMenuGroup,
	DropdownMenuItem,
	DropdownMenuLabel,
	DropdownMenuSeparator,
	DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
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
	SidebarRail,
} from "@/components/ui/sidebar";
import { useSignoutToastContext } from "@/lib/signout-toast-context";
// import { ThemeToggle } from '@/components/theme-toggle';
import { supabase } from "@/lib/supabaseClient";
import { cn } from "@/lib/utils";
// import { LOCATIONS, type Location } from "@/types/auth";
import { type NavBadgeKey, navMain } from "../nav-config";

// Location Notification Bar removed as per clean up request

export function DashboardSidebar({
	className,
	...props
}: React.ComponentProps<typeof Sidebar>) {
	// const isV0 = useIsV0();
	const pathname = usePathname();
	const router = useRouter();
	const [isSigningOut, setIsSigningOut] = React.useState(false);
	const { showSignoutToast } = useSignoutToastContext();

	const [sidebarCounts, setSidebarCounts] = React.useState<
		Record<NavBadgeKey, number | null>
	>({
		warehouses: null,
		shipments: null,
		invoices: null,
		alerts: null,
	});

	const handleSignOut = async () => {
		if (isSigningOut) return;
		setIsSigningOut(true);

		// Get user email before signing out for the toast
		const {
			data: { user },
		} = await supabase.auth.getUser();
		const userEmail = user?.email || "User";

		try {
			await supabase.auth.signOut();
			// Show the toast before redirecting
			showSignoutToast(userEmail);
			// Delay redirect to show toast
			setTimeout(() => {
				router.push("/login");
			}, 1500);
		} catch (error) {
			console.error("Error signing out", error);
			setIsSigningOut(false);
			router.push("/login");
		}
	};

	// Defer sidebar counts loading to not block initial render
	React.useEffect(() => {
		let cancelled = false;

		// Delay loading counts to prioritize page content
		const timeoutId = setTimeout(async () => {
			if (cancelled) return;

			try {
				// Only fetch essential counts (3 queries instead of 7)
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
					alerts: null, // Load alerts separately on alerts page
				});
			} catch (error) {
				if (cancelled) return;
				console.warn("Failed to load sidebar counts", error);
			}
		}, 500); // Delay 500ms to let page content load first

		return () => {
			cancelled = true;
			clearTimeout(timeoutId);
		};
	}, []);

	const toPositiveBadge = (value: number | null) =>
		typeof value === "number" && value > 0 ? value : undefined;

	const navMainWithBadges = navMain.map((group) => ({
		...group,
		items: group.items.map((item) => {
			if (!item.badgeKey) return item;

			const raw = sidebarCounts[item.badgeKey];
			return {
				...item,
				badge: toPositiveBadge(raw),
			};
		}),
	}));

	const [profile, setProfile] = React.useState<{
		name: string;
		email: string;
		avatar: string | null;
		role: string | null;
		status: "Active" | "Offline";
	} | null>(null);

	const [profileLoading, setProfileLoading] = React.useState(true);

	const isAdmin = profile?.role
		? profile.role.toLowerCase() === "admin"
		: false;

	const visibleNav = navMainWithBadges
		.map((group) => ({
			...group,
			items: group.items.filter((item) => !item.requiresAdmin || isAdmin),
		}))
		.filter((group) => group.items.length > 0);

	React.useEffect(() => {
		let cancelled = false;

		// Defer profile loading to prioritize page content
		const timeoutId = setTimeout(async () => {
			if (cancelled) return;

			try {
				const {
					data: { user },
					error,
				} = await supabase.auth.getUser();

				if (cancelled) return;

				if (error || !user) {
					setProfile(null);
					setProfileLoading(false);
					return;
				}

				const { data: userRow, error: userError } = await supabase
					.from("users")
					.select("name, role, avatar_url")
					.eq("id", user.id)
					.maybeSingle();

				if (cancelled) return;

				if (userError) {
					console.warn(
						"Failed to load sidebar profile from users table",
						userError,
					);
				}

				setProfile({
					name:
						(userRow?.name as string | null) || user.email || "Tapan Go Ops",
					email: user.email ?? "ops@tapango.logistics",
					avatar: (userRow?.avatar_url as string | null) || null,
					role: (userRow?.role as string | null) ?? "Operator",
					status: "Active",
				});
			} catch (err) {
				if (cancelled) return;
				console.warn("Failed to load sidebar profile", err);
				setProfile(null);
			} finally {
				if (!cancelled) {
					setProfileLoading(false);
				}
			}
		}, 300); // Delay 300ms to prioritize page content

		return () => {
			cancelled = true;
			clearTimeout(timeoutId);
		};
	}, []);

	const renderBadge = (
		badge: string | number | undefined,
		color: "default" | "success" | "warning" | "destructive" = "default",
	) => {
		if (badge === undefined || badge === null) return null;
		if (typeof badge === "number" && badge <= 0) return null;

		const colorClasses = {
			default: "bg-muted text-muted-foreground",
			success: "bg-green-500/20 text-green-700 dark:text-green-400",
			warning: "bg-yellow-500/20 text-yellow-700 dark:text-yellow-400",
			destructive: "bg-red-500/20 text-red-700 dark:text-red-400",
		};

		return (
			<SidebarMenuBadge className={cn("bg-transparent", colorClasses[color])}>
				{badge}
			</SidebarMenuBadge>
		);
	};

	return (
		<Sidebar
			{...props}
			className={cn(
				"py-sides border-r border-white/5 dark:border-white/5 bg-sidebar/80 backdrop-blur-md",
				className,
			)}
			collapsible="icon"
		>
			<SidebarHeader className="flex gap-3 flex-row items-center border-b border-sidebar-border pb-4">
				<SidebarLogo />
				<div className="flex items-center justify-center gap-2">
					{/* <ThemeToggle /> Removed to avoid duplication with Header */}
					<div className="w-2 h-2 bg-success animate-pulse" />
				</div>
			</SidebarHeader>

			<SidebarContent className="gap-4">
				{visibleNav.map((group, _i) => (
					<SidebarGroup key={group.title} className="gap-3">
						<SidebarGroupLabel className="text-xs font-semibold uppercase tracking-wider text-muted-foreground px-2">
							<Bullet className="mr-2 opacity-60" />
							{group.title}
						</SidebarGroupLabel>
						<SidebarGroupContent>
							<SidebarMenu className="gap-1">
								{group.items.map((item) => (
									<SidebarMenuItem
										key={item.title}
										className="relative group"
										data-disabled={item.locked}
									>
										<SidebarMenuButton
											asChild
											size="lg"
											isActive={pathname === item.url}
											disabled={item.locked}
											className={cn(
												"transition-all duration-200 cursor-pointer overflow-hidden",
												"hover:bg-sidebar-accent/50 hover:text-sidebar-accent-foreground",
												pathname === item.url &&
												"bg-sidebar-accent text-sidebar-accent-foreground font-semibold",
												item.locked &&
												"opacity-50 cursor-not-allowed hover:bg-transparent",
											)}
										>
											{item.locked ? (
												<div className="flex items-center justify-between w-full gap-2 px-2 py-1.5">
													<div className="flex items-center gap-3 flex-1">
														<item.icon className="size-5 opacity-70" />
														<span className="text-sm font-medium">
															{item.title}
														</span>
													</div>
													<LockIcon className="size-4 opacity-50" />
												</div>
											) : (
												<Link
													href={item.url}
													className="flex items-center justify-between w-full gap-2"
													aria-current={
														pathname === item.url ? "page" : undefined
													}
												>
													<div className="flex items-center gap-2 flex-1">
														<item.icon className="size-4" />
														<span className="text-sm md:text-base font-medium">
															{item.title}
														</span>
													</div>
												</Link>
											)}
										</SidebarMenuButton>
										{!item.locked && renderBadge(item.badge, item.badgeColor)}
									</SidebarMenuItem>
								))}
							</SidebarMenu>
						</SidebarGroupContent>
					</SidebarGroup>
				))}
			</SidebarContent>

			<SidebarFooter className="p-0 border-t border-sidebar-border">
				<SidebarMenu>
					<SidebarMenuItem>
						<DropdownMenu>
							<DropdownMenuTrigger asChild>
								<SidebarMenuButton
									size="lg"
									className="data-[state=open]:bg-sidebar-accent data-[state=open]:text-sidebar-accent-foreground"
								>
									<div className="flex aspect-square size-8 items-center justify-center rounded-lg bg-primary text-primary-foreground">
										{profileLoading ? (
											<div className="size-4 animate-spin rounded-full border-2 border-background border-r-transparent" />
										) : (
											<Image
												src={profile?.avatar || "/avatars/user_krimson.png"}
												alt={profile?.name || "Profile"}
												width={32}
												height={32}
												className="rounded-lg"
											/>
										)}
									</div>
									<div className="grid flex-1 text-left text-sm leading-tight">
										<span className="truncate font-semibold">
											{profile?.name || "Tapan Go Ops"}
										</span>
										<span className="truncate text-xs text-muted-foreground">
											{profile?.email || "ops@tapango.logistics"}
										</span>
									</div>
									<ChevronDown className="ml-auto size-4" />
								</SidebarMenuButton>
							</DropdownMenuTrigger>
							<DropdownMenuContent
								className="w-[--radix-dropdown-menu-trigger-width] min-w-56 rounded-lg"
								side="bottom"
								align="end"
								sideOffset={4}
							>
								<DropdownMenuLabel className="p-0 font-normal">
									<div className="flex items-center gap-2 px-1 py-1.5 text-left text-sm">
										<div className="flex aspect-square size-8 items-center justify-center rounded-lg bg-primary text-primary-foreground">
											<Image
												src={profile?.avatar || "/avatars/user_krimson.png"}
												alt={profile?.name || "Profile"}
												width={32}
												height={32}
												className="rounded-lg"
											/>
										</div>
										<div className="grid flex-1 text-left text-sm leading-tight">
											<span className="truncate font-semibold">
												{profile?.name || "Tapan Go Ops"}
											</span>
											<span className="truncate text-xs text-muted-foreground">
												{profile?.email || "ops@tapango.logistics"}
											</span>
										</div>
									</div>
								</DropdownMenuLabel>
								<DropdownMenuSeparator />
								<DropdownMenuGroup>
									<DropdownMenuItem>
										<MonkeyIcon className="mr-2 h-4 w-4" />
										Profile Settings
									</DropdownMenuItem>
									<DropdownMenuItem>
										<GearIcon className="mr-2 h-4 w-4" />
										System Settings
									</DropdownMenuItem>
									<DropdownMenuItem>
										<BracketsIcon className="mr-2 h-4 w-4" />
										Help & Support
									</DropdownMenuItem>
								</DropdownMenuGroup>
								<DropdownMenuSeparator />
								{/* Sign Out Item */}
								<DropdownMenuItem onClick={handleSignOut} disabled={isSigningOut}>
									<LockIcon className="mr-2 h-4 w-4" />
									{isSigningOut ? "Signing out..." : "Log out"}
								</DropdownMenuItem>
							</DropdownMenuContent>
						</DropdownMenu>
					</SidebarMenuItem>
				</SidebarMenu>
			</SidebarFooter>

			<SidebarRail />
		</Sidebar>
	);
}

export default DashboardSidebar;
