"use client";

import dynamic from "next/dynamic";
import { usePathname, useRouter } from "next/navigation";
import { useEffect } from "react";
import { DashboardSidebar } from "@/app/(main)/dashboard/_components/sidebar";
import { MFAGate } from "@/components/auth/mfa-gate";
import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar";

// Lazy load mobile header (only needed on mobile)
const MobileHeader = dynamic(
	() =>
		import("@/app/(main)/dashboard/_components/mobile-header").then((mod) => ({
			default: mod.MobileHeader,
		})),
	{ ssr: false },
);

import { TapanAssociateProvider } from "@/components/layout/tapan-associate-context";
import { cn } from "@/lib/utils";
import type {
	Notification as DashboardNotification,
	WidgetData,
} from "@/types/dashboard";

const TapanAssociateDrawerLauncher = dynamic(
	() =>
		import("@/components/layout/tapan-associate-drawer").then((mod) => ({
			default: mod.TapanAssociateDrawerLauncher,
		})),
	{ ssr: false },
);

interface RootShellProps {
	children: React.ReactNode;
	notifications: DashboardNotification[];
	defaultWidgetData: WidgetData;
}

export function RootShell({
	children,
	notifications,
	defaultWidgetData,
}: RootShellProps) {
	const pathname = usePathname();
	const router = useRouter();

	useEffect(() => {
		let lastKey = "";
		let lastKeyTime = 0;

		const handleKeyDown = (event: KeyboardEvent) => {
			const target = event.target as HTMLElement | null;
			const tagName = target?.tagName;
			const isInput =
				tagName === "INPUT" ||
				tagName === "TEXTAREA" ||
				tagName === "SELECT" ||
				target?.isContentEditable;

			if (isInput) return;

			const key = event.key.toLowerCase();
			const isMeta = event.metaKey || event.ctrlKey;
			const now = Date.now();

			// Clear sequence if too much time has passed (500ms)
			if (now - lastKeyTime > 500) {
				lastKey = "";
			}

			// Cmd+K for search
			if (isMeta && key === "k") {
				event.preventDefault();
				if (pathname !== "/search") {
					router.push("/search");
				}
				return;
			}

			// Sequential shortcuts (G + ...)
			if (lastKey === "g") {
				if (key === "d") {
					event.preventDefault();
					router.push("/dashboard");
				} else if (key === "i") {
					event.preventDefault();
					router.push("/invoices");
				} else if (key === "s") {
					event.preventDefault();
					router.push("/dashboard/shipments");
				}
				lastKey = "";
				return;
			}

			// Sequential shortcuts (C + ...)
			if (lastKey === "c") {
				if (key === "i") {
					event.preventDefault();
					router.push("/invoices?create=true");
				} else if (key === "s") {
					event.preventDefault();
					router.push("/dashboard/shipments?create=true");
				}
				lastKey = "";
				return;
			}

			// Catch-all for first key in sequence
			if (key === "g" || key === "c") {
				lastKey = key;
				lastKeyTime = now;
			}
		};

		window.addEventListener("keydown", handleKeyDown);
		return () => window.removeEventListener("keydown", handleKeyDown);
	}, [pathname, router]);

	const isStandaloneRoute =
		pathname === "/" ||
		pathname === "/login" ||
		pathname === "/track" ||
		pathname.startsWith("/track/") ||
		pathname === "/privacy-policy" ||
		pathname === "/terms-of-service" ||
		pathname === "/unauthorized" ||
		pathname.startsWith("/support/customer");

	if (isStandaloneRoute) {
		// For standalone routes (like /login, /track, customer support), render without dashboard chrome.
		return <>{children}</>;
	}

	return (
		<SidebarProvider>
			<TapanAssociateProvider>
				{/* Background gradient halos behind the dashboard */}
				<div className="pointer-events-none fixed inset-0 -z-10 text-primary">
					<div className="absolute -left-40 -top-40 h-80 w-80 rounded-full bg-chart-1/20 blur-3xl opacity-50" />
					<div className="absolute -right-48 -top-24 h-96 w-96 rounded-full bg-primary/10 blur-3xl opacity-50" />
				</div>
				{/* Sidebar + Inset layout */}
				<DashboardSidebar />
				<SidebarInset>
					{/* Mobile Header - only visible on mobile */}
					<div className="lg:hidden print:hidden">
						<MobileHeader notifications={notifications} />
					</div>

					{/* Page content */}
					<div
						className={cn(
							"min-h-[100svh] flex flex-col lg:h-screen lg:overflow-y-auto print:h-auto print:overflow-visible",
						)}
					>
						<MFAGate>{children}</MFAGate>
					</div>

					{/* Global Tapan Associate launcher (mobile only; desktop uses sidebar widget) */}
					{pathname !== "/tapan-associate" && (
						<div className="lg:hidden print:hidden">
							<TapanAssociateDrawerLauncher />
						</div>
					)}
				</SidebarInset>
			</TapanAssociateProvider>
		</SidebarProvider>
	);
}
