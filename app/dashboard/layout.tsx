// Dashboard layout - children are rendered within the RootShell from app/layout.tsx
// This layout is intentionally minimal since the main shell is at the root level
export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
