// Dashboard layout - inherits AppShell from (main)/layout.tsx
// This is a pass-through layout since sidebar is now provided by parent

import type React from "react";

export default function DashboardLayout({
	children,
}: {
	children: React.ReactNode;
}) {
	return <>{children}</>;
}
