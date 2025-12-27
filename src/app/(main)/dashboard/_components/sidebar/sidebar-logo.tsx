"use client";

import { useSidebar } from "@/components/ui/sidebar";
import { UnifiedLogo } from "@/components/ui/unified-logo";

export function SidebarLogo() {
	const { state } = useSidebar();

	return (
		<UnifiedLogo
			collapsed={state === "collapsed"}
			className="h-12 md:h-14 lg:h-16"
		/>
	);
}
