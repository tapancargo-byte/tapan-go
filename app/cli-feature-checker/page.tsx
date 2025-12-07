"use client";

import DashboardPageLayout from "@/components/dashboard/layout";
import BracketsIcon from "@/components/icons/brackets";
import { Card } from "@/components/ui/card";

export default function CliFeatureCheckerPage() {
  return (
    <DashboardPageLayout
      header={{
        title: "CLI Feature Checker",
        description: "Validate optional package setup and CLI tools",
        icon: BracketsIcon,
      }}
    >
      <Card className="p-6 space-y-3">
        <p className="text-lg font-semibold">CLI Feature Checker</p>
        <p className="text-sm text-muted-foreground">
          Not found - page under construction
        </p>
        <p className="text-sm">
          Fork on v0 and start promoting your way to new pages.
        </p>
        <p className="text-sm font-semibold">TAPAN GOCARGO SERVICE</p>
        <p className="text-sm text-muted-foreground">
          A seamless cargo service for Northeast and Delhi.
        </p>
        <p className="text-sm">Quick AI help for what you are working on right now.</p>
      </Card>
    </DashboardPageLayout>
  );
}
