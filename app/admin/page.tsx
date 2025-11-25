"use client";

import { useEffect, useState } from "react";
import DashboardPageLayout from "@/components/dashboard/layout";
import StorageIcon from "@/components/icons/gear";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";
import { supabase } from "@/lib/supabaseClient";
import { useToast } from "@/hooks/use-toast";

interface AppSettings {
  maintenanceMode: boolean;
}

export default function AdminSettingsPage() {
  const [settings, setSettings] = useState<AppSettings | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [userRole, setUserRole] = useState<string | null>(null);
  const [roleLoaded, setRoleLoaded] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    let cancelled = false;

    async function loadSettings() {
      setLoading(true);
      try {
        const { data, error } = await supabase
          .from("app_settings")
          .select("key, value")
          .in("key", ["maintenance_mode"]);

        if (error) {
          console.warn("Supabase app_settings error", error.message);
          throw error;
        }

        if (cancelled) return;

        const map = new Map<string, any>();
        (data ?? []).forEach((row: any) => {
          map.set(row.key as string, row.value);
        });

        const maintenanceValue = map.get("maintenance_mode");

        setSettings({
          maintenanceMode: Boolean(maintenanceValue?.enabled ?? false),
        });
        setLoading(false);
      } catch (err) {
        if (cancelled) return;
        console.error("Failed to load app settings", err);
        setSettings({ maintenanceMode: false });
        setLoading(false);
      }
    }

    loadSettings();

    return () => {
      cancelled = true;
    };
  }, []);

  useEffect(() => {
    let cancelled = false;

    async function loadUserRole() {
      try {
        const {
          data: { user },
          error,
        } = await supabase.auth.getUser();

        if (error || !user) {
          if (!cancelled) {
            setUserRole(null);
            setRoleLoaded(true);
          }
          return;
        }

        const { data, error: userError } = await supabase
          .from("users")
          .select("role")
          .eq("id", user.id)
          .maybeSingle();

        if (cancelled) return;

        if (userError || !data) {
          setUserRole(null);
        } else {
          setUserRole((data.role as string | null) ?? null);
        }
        setRoleLoaded(true);
      } catch (err) {
        if (cancelled) return;
        console.warn("Failed to load user role for admin page", err);
        setUserRole(null);
        setRoleLoaded(true);
      }
    }

    loadUserRole();

    return () => {
      cancelled = true;
    };
  }, []);

  const canEdit = userRole === "manager" || userRole === "admin";

  const handleToggleMaintenance = async (next: boolean) => {
    if (!canEdit) {
      toast({
        title: "Insufficient permissions",
        description: "Only manager or admin users can change maintenance mode.",
        variant: "destructive",
      });
      return;
    }

    setSaving(true);
    try {
      const payload = { enabled: next };

      const { error } = await supabase
        .from("app_settings")
        .upsert({
          key: "maintenance_mode",
          value: payload,
          updated_at: new Date().toISOString(),
        }, { onConflict: "key" });

      if (error) {
        throw error;
      }

      setSettings((prev) => (prev ? { ...prev, maintenanceMode: next } : { maintenanceMode: next }));

      toast({
        title: "Maintenance mode updated",
        description: next
          ? "Maintenance mode is now enabled. Operators should complete in-flight tasks and pause new work."
          : "Maintenance mode is now disabled. System is back to normal operations.",
      });
    } catch (err: any) {
      console.error("Failed to update maintenance mode", err);
      toast({
        title: "Could not update setting",
        description:
          err?.message || "Something went wrong while updating maintenance mode.",
        variant: "destructive",
      });
    } finally {
      setSaving(false);
    }
  };

  return (
    <DashboardPageLayout
      header={{
        title: "Admin Settings",
        description: "Platform configuration, maintenance controls, and security posture",
        icon: StorageIcon,
      }}
    >
      <div className="space-y-6">
        <Card className="border-pop bg-background">
          <CardHeader>
            <CardTitle>Operational Controls</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-foreground">
                  Maintenance mode
                </p>
                <p className="text-xs text-muted-foreground max-w-md">
                  When enabled, operators should avoid starting new large jobs while
                  you perform system maintenance or schema changes.
                </p>
              </div>
              <div className="flex items-center gap-2">
                {roleLoaded && !canEdit && (
                  <span className="text-[11px] text-muted-foreground uppercase tracking-wide">
                    Read-only
                  </span>
                )}
                <Switch
                  checked={settings?.maintenanceMode ?? false}
                  disabled={loading || saving || !canEdit}
                  onCheckedChange={handleToggleMaintenance}
                />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-pop bg-background">
          <CardHeader>
            <CardTitle>Environment Overview</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2 text-xs text-muted-foreground">
            <p>
              This section can be extended to surface environment and integration
              status (Supabase project, WhatsApp integration, storage, etc.).
            </p>
            <p>
              For now, all core operational, billing, support, and analytics
              features are wired to Supabase with RLS on write operations.
            </p>
            <p>
              Effective role for this session: <span className="font-semibold text-foreground">{userRole ?? "unknown"}</span>.
              Admin-only actions such as maintenance mode and rate management
              depend on the <code>role</code> column in <code>public.users</code>
              matching your Supabase auth user.
            </p>
          </CardContent>
        </Card>
      </div>
    </DashboardPageLayout>
  );
}
