import type React from "react";
import AppShell from "@/components/layout/app-shell";

export default function TapanAssociateLayout({
	children,
}: {
	children: React.ReactNode;
}) {
	return <AppShell>{children}</AppShell>;
}
