"use client";

import {
	Bell,
	ChevronsUpDown,
	CreditCard,
	LogOut,
	Settings,
	Sparkles,
	User,
} from "lucide-react";
import { useRouter } from "next/navigation";
import * as React from "react";
import { useSidebar } from "@/components/layout/sidebar-context";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
	DropdownMenu,
	DropdownMenuContent,
	DropdownMenuGroup,
	DropdownMenuItem,
	DropdownMenuLabel,
	DropdownMenuSeparator,
	DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useSignoutToastContext } from "@/lib/signout-toast-context";
import { supabase } from "@/lib/supabaseClient";
import { cn } from "@/lib/utils";

export function UserProfile() {
	const { isMobile, isCollapsed } = useSidebar();
	const router = useRouter();
	const { showSignoutToast } = useSignoutToastContext();
	const [isSigningOut, setIsSigningOut] = React.useState(false);

	const [profile, setProfile] = React.useState<{
		name: string;
		email: string;
		avatar: string | null;
		role: string | null;
	} | null>(null);

	React.useEffect(() => {
		let cancelled = false;

		async function loadProfile() {
			try {
				const {
					data: { user },
				} = await supabase.auth.getUser();

				if (cancelled) return;

				if (!user) {
					setProfile(null);
					return;
				}

				const { data: userRow } = await supabase
					.from("users")
					.select("name, role, avatar_url")
					.eq("id", user.id)
					.maybeSingle();

				if (cancelled) return;

				setProfile({
					name:
						(userRow?.name as string | null) ||
						user.email?.split("@")[0] ||
						"User",
					email: user.email || "",
					avatar: userRow?.avatar_url || null,
					role: (userRow?.role as string | null) || "Associate",
				});
			} catch (error) {
				console.warn("Failed to load user profile", error);
			}
		}

		loadProfile();

		return () => {
			cancelled = true;
		};
	}, []);

	const handleSignOut = async () => {
		if (isSigningOut) return;
		setIsSigningOut(true);

		const userEmail = profile?.email || "User";

		try {
			await supabase.auth.signOut();
			showSignoutToast(userEmail);
			setTimeout(() => {
				router.push("/login");
			}, 1500);
		} catch (error) {
			console.error("Error signing out", error);
			setIsSigningOut(false);
			router.push("/login");
		}
	};

	const displayName = profile?.name || "Tapan Associate";
	const displayEmail = profile?.email || "admin@tapancargo.com";
	const displayInitials = displayName
		.split(" ")
		.map((n) => n[0])
		.join("")
		.toUpperCase()
		.slice(0, 2);

	return (
		<DropdownMenu>
			<DropdownMenuTrigger asChild>
				<button
					type="button"
					className={cn(
						"flex w-full items-center gap-2 overflow-hidden rounded-md p-2 text-left text-sm outline-hidden transition-colors hover:bg-muted hover:text-foreground focus-visible:ring-2 disabled:pointer-events-none disabled:opacity-50",
						"data-[state=open]:bg-muted data-[state=open]:text-foreground",
						isCollapsed && "justify-center",
					)}
				>
					<Avatar className="h-8 w-8 rounded-lg">
						<AvatarImage src={profile?.avatar || ""} alt={displayName} />
						<AvatarFallback className="rounded-lg">
							{displayInitials}
						</AvatarFallback>
					</Avatar>

					{!isCollapsed && (
						<>
							<div className="grid flex-1 text-left text-sm leading-tight">
								<span className="truncate font-semibold">{displayName}</span>
								<span className="truncate text-xs text-muted-foreground">
									{displayEmail}
								</span>
							</div>
							<ChevronsUpDown className="ml-auto size-4" />
						</>
					)}
				</button>
			</DropdownMenuTrigger>
			<DropdownMenuContent
				className="w-[--radix-dropdown-menu-trigger-width] min-w-56 rounded-lg"
				side={isMobile ? "bottom" : "right"}
				align="end"
				sideOffset={4}
			>
				<DropdownMenuLabel className="p-0 font-normal">
					<div className="flex items-center gap-2 px-1 py-1.5 text-left text-sm">
						<Avatar className="h-8 w-8 rounded-lg">
							<AvatarImage src={profile?.avatar || ""} alt={displayName} />
							<AvatarFallback className="rounded-lg">
								{displayInitials}
							</AvatarFallback>
						</Avatar>
						<div className="grid flex-1 text-left text-sm leading-tight">
							<span className="truncate font-semibold">{displayName}</span>
							<span className="truncate text-xs text-muted-foreground">
								{displayEmail}
							</span>
						</div>
					</div>
				</DropdownMenuLabel>
				<DropdownMenuSeparator />
				<DropdownMenuGroup>
					<DropdownMenuItem>
						<Sparkles className="mr-2 h-4 w-4" />
						Upgrade to Pro
					</DropdownMenuItem>
				</DropdownMenuGroup>
				<DropdownMenuSeparator />
				<DropdownMenuGroup>
					<DropdownMenuItem>
						<User className="mr-2 h-4 w-4" />
						Account
					</DropdownMenuItem>
					<DropdownMenuItem>
						<CreditCard className="mr-2 h-4 w-4" />
						Billing
					</DropdownMenuItem>
					<DropdownMenuItem>
						<Bell className="mr-2 h-4 w-4" />
						Notifications
					</DropdownMenuItem>
					<DropdownMenuItem>
						<Settings className="mr-2 h-4 w-4" />
						Settings
					</DropdownMenuItem>
				</DropdownMenuGroup>
				<DropdownMenuSeparator />
				<DropdownMenuItem
					onClick={handleSignOut}
					disabled={isSigningOut}
					className="text-destructive focus:text-destructive"
				>
					<LogOut className="mr-2 h-4 w-4" />
					<span>{isSigningOut ? "Signing out..." : "Log out"}</span>
				</DropdownMenuItem>
			</DropdownMenuContent>
		</DropdownMenu>
	);
}
