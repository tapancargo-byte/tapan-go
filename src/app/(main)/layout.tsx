// Layout for (main) route group - provides sidebar shell for all authenticated routes
// This replaces having individual layouts in each sub-route

import type React from "react";

import AppShell from "@/components/layout/app-shell";

export default function MainLayout({
	children,
}: {
	children: React.ReactNode;
}) {
	return <AppShell>{children}</AppShell>;
}
