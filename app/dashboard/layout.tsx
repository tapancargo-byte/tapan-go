// Dashboard layout - children are rendered within the RootShell from app/layout.tsx
// This layout is intentionally minimal since the main shell is at the root level

import type React from "react";

import AppShell from "@/components/layout/app-shell";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <AppShell>{children}</AppShell>;
}
