"use client";

import { useEffect, useState } from "react";
import { DashboardLayout } from "@/components/dashboard/layout";
import GearIcon from "@/components/icons/gear";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Switch } from "@/components/ui/switch";
import { Input } from "@/components/ui/input";
import { supabase } from "@/lib/supabaseClient";
import { useToast } from "@/hooks/use-toast";

export default function SettingsPage() {
  const [avatarUploading, setAvatarUploading] = useState(false);
  const { toast } = useToast();

  const [orgLoading, setOrgLoading] = useState(true);
  const [orgSaving, setOrgSaving] = useState(false);
  const [orgProfile, setOrgProfile] = useState({
    name: "Tapan Go Logistics",
    email: "contact@tapango.logistics",
    phone: "+91-9876543210",
    address: "Ahmedabad, Gujarat, India",
  });

  const [userRole, setUserRole] = useState<string | null>(null);
  const [roleLoaded, setRoleLoaded] = useState(false);

  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [passwordSaving, setPasswordSaving] = useState(false);

  const [mfaChecking, setMfaChecking] = useState(true);
  const [hasTotp, setHasTotp] = useState(false);
  const [mfaError, setMfaError] = useState<string | null>(null);
  const [enrollLoading, setEnrollLoading] = useState(false);
  const [qrCode, setQrCode] = useState<string | null>(null);
  const [factorId, setFactorId] = useState<string | null>(null);
  const [verifyCode, setVerifyCode] = useState("");

  const handleStartMfaEnroll = async () => {
    setMfaError(null);
    setEnrollLoading(true);
    setQrCode(null);
    setFactorId(null);
    try {
      const { data, error } = await supabase.auth.mfa.enroll({ factorType: "totp" });
      if (error) {
        setMfaError(error.message ?? "Failed to start two-factor setup.");
        return;
      }
      if (!data) {
        setMfaError("Failed to start two-factor setup.");
        return;
      }
      setFactorId(data.id);
      setQrCode(data.totp?.qr_code ?? null);
    } catch (err) {
      setMfaError(
        err instanceof Error ? err.message : "Failed to start two-factor setup."
      );
    } finally {
      setEnrollLoading(false);
    }
  };

  const handleConfirmMfaEnroll = async () => {
    if (!factorId) {
      setMfaError("Setup is not initialized. Start setup again.");
      return;
    }
    if (!verifyCode.trim()) {
      setMfaError("Enter the code from your authenticator app.");
      return;
    }

    setEnrollLoading(true);
    setMfaError(null);

    try {
      const challenge = await supabase.auth.mfa.challenge({ factorId });
      if (challenge.error) {
        setMfaError(challenge.error.message ?? "Failed to start verification.");
        return;
      }

      const challengeId = challenge.data?.id;
      if (!challengeId) {
        setMfaError("Invalid MFA challenge.");
        return;
      }

      const verify = await supabase.auth.mfa.verify({
        factorId,
        challengeId,
        code: verifyCode.trim(),
      });
      if (verify.error) {
        setMfaError(verify.error.message ?? "Invalid verification code.");
        return;
      }

      setHasTotp(true);
      setQrCode(null);
      setFactorId(null);
      setVerifyCode("");
      toast({
        title: "Two-factor authentication enabled",
        description: "You will be asked for a code when signing in.",
      });
    } catch (err) {
      setMfaError(
        err instanceof Error ? err.message : "Failed to verify two-factor code."
      );
    } finally {
      setEnrollLoading(false);
    }
  };

  const handleCancelMfaEnroll = () => {
    setQrCode(null);
    setFactorId(null);
    setVerifyCode("");
    setMfaError(null);
  };

  useEffect(() => {
    let cancelled = false;

    async function loadOrgProfile() {
      try {
        const { data, error } = await supabase
          .from("app_settings")
          .select("key, value")
          .eq("key", "org_profile")
          .maybeSingle();

        if (cancelled) return;

        if (!error && data?.value) {
          const value = data.value as any;
          setOrgProfile((prev) => ({
            name: value.name ?? prev.name,
            email: value.email ?? prev.email,
            phone: value.phone ?? prev.phone,
            address: value.address ?? prev.address,
          }));
        }
      } catch (err) {
        if (!cancelled) {
          console.warn("Failed to load organization profile settings", err);
        }
      } finally {
        if (!cancelled) {
          setOrgLoading(false);
        }
      }
    }

    async function loadRole() {
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

        const { data, error: roleError } = await supabase
          .from("users")
          .select("role")
          .eq("id", user.id)
          .maybeSingle();

        if (cancelled) return;

        if (roleError || !data) {
          setUserRole(null);
        } else {
          setUserRole((data.role as string | null) ?? null);
        }
        setRoleLoaded(true);
      } catch (err) {
        if (cancelled) return;
        console.warn("Failed to load user role for settings page", err);
        setUserRole(null);
        setRoleLoaded(true);
      }
    }

    async function loadMfaStatus() {
      try {
        const { data, error } = await supabase.auth.mfa.listFactors();
        if (cancelled) return;
        if (error) {
          setMfaError(error.message ?? "Failed to check two-factor status.");
          return;
        }
        const hasTotpFactor = Array.isArray(data?.totp) && data.totp.length > 0;
        setHasTotp(hasTotpFactor);
      } catch (err) {
        if (cancelled) return;
        setMfaError(
          err instanceof Error ? err.message : "Failed to check two-factor status."
        );
      } finally {
        if (!cancelled) {
          setMfaChecking(false);
        }
      }
    }

    void loadOrgProfile();
    void loadRole();
    void loadMfaStatus();

    return () => {
      cancelled = true;
    };
  }, []);

  const canEditOrg = true;

  const handleAvatarChange = async (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    const file = event.target.files?.[0];
    if (!file) return;

    setAvatarUploading(true);
    try {
      const {
        data: { user },
        error: userError,
      } = await supabase.auth.getUser();

      if (userError || !user) {
        console.warn("No authenticated user for avatar upload", userError);
        toast({
          title: "Not signed in",
          description: "You must be logged in to update your avatar.",
          variant: "destructive",
        });
        return;
      }

      const fileExt = file.name.split(".").pop();
      const filePath = `${user.id}/${Date.now()}.${fileExt}`;

      const { error: uploadError } = await supabase.storage
        .from("avatars")
        .upload(filePath, file, {
          upsert: true,
        });

      if (uploadError) {
        console.error("Avatar upload failed", uploadError.message);
        toast({
          title: "Avatar upload failed",
          description: uploadError.message ?? "Could not upload your avatar.",
          variant: "destructive",
        });
        return;
      }

      const {
        data: { publicUrl },
      } = supabase.storage.from("avatars").getPublicUrl(filePath);

      const { error: updateError } = await supabase
        .from("users")
        .upsert(
          {
            id: user.id,
            email: user.email,
            avatar_url: publicUrl,
            updated_at: new Date().toISOString(),
          },
          { onConflict: "id" }
        );

      if (updateError) {
        console.error("Failed to update avatar_url on users", updateError.message);
        toast({
          title: "Could not save avatar",
          description:
            updateError.message || "Something went wrong while saving your avatar.",
          variant: "destructive",
        });
        return;
      }

      event.target.value = "";

      toast({
        title: "Avatar updated",
        description: "Your profile picture has been updated.",
      });

      // Notify other components (sidebar) that the profile has changed
      // Use CustomEvent to pass the new URL directly for immediate UI update
      window.dispatchEvent(
        new CustomEvent("profile-updated", {
          detail: { avatarUrl: publicUrl },
        })
      );
    } catch (err) {
      console.error("Unexpected error during avatar upload", err);
      toast({
        title: "Unexpected error",
        description:
          err instanceof Error ? err.message : "Something went wrong while uploading your avatar.",
        variant: "destructive",
      });
    } finally {
      setAvatarUploading(false);
    }
  };

  const handleSaveOrgProfile = async () => {
    if (!canEditOrg) {
      toast({
        title: "Insufficient permissions",
        description: "Only manager or admin users can update organization settings.",
        variant: "destructive",
      });
      return;
    }

    setOrgSaving(true);
    try {
      const payload = {
        name: orgProfile.name.trim(),
        email: orgProfile.email.trim(),
        phone: orgProfile.phone.trim(),
        address: orgProfile.address.trim(),
      };

      const { error } = await supabase
        .from("app_settings")
        .upsert(
          {
            key: "org_profile",
            value: payload,
            updated_at: new Date().toISOString(),
          },
          { onConflict: "key" }
        );

      if (error) {
        throw error;
      }

      toast({
        title: "Settings saved",
        description: "Organization profile has been updated.",
      });
    } catch (err: any) {
      console.error("Failed to save organization settings", err);
      toast({
        title: "Could not save settings",
        description:
          err?.message || "Something went wrong while saving organization settings.",
        variant: "destructive",
      });
    } finally {
      setOrgSaving(false);
    }
  };

  const handleUpdatePassword = async () => {
    if (!newPassword || !confirmPassword) {
      toast({
        title: "Missing password",
        description: "Enter and confirm your new password.",
        variant: "destructive",
      });
      return;
    }

    if (newPassword !== confirmPassword) {
      toast({
        title: "Passwords do not match",
        description: "New password and confirmation must be the same.",
        variant: "destructive",
      });
      return;
    }

    setPasswordSaving(true);
    try {
      const { error } = await supabase.auth.updateUser({
        password: newPassword,
      });

      if (error) {
        throw error;
      }

      setCurrentPassword("");
      setNewPassword("");
      setConfirmPassword("");

      toast({
        title: "Password updated",
        description: "Your account password has been changed.",
      });
    } catch (err: any) {
      console.error("Failed to update password", err);
      toast({
        title: "Could not update password",
        description:
          err?.message || "Something went wrong while updating your password.",
        variant: "destructive",
      });
    } finally {
      setPasswordSaving(false);
    }
  };

  return (
    <DashboardLayout
      header={{
        title: 'Settings',
        description: 'Manage system configuration, preferences, and user settings',
        icon: GearIcon,
      }}
    >
      <div className="space-y-6">
        <Tabs defaultValue="general" className="w-full">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="general">General</TabsTrigger>
            <TabsTrigger value="notifications">Notifications</TabsTrigger>
            <TabsTrigger value="security">Security</TabsTrigger>
            <TabsTrigger value="integrations">Integrations</TabsTrigger>
          </TabsList>

          <TabsContent value="general" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Profile</CardTitle>
                <CardDescription>
                  Update your personal information and avatar for the dashboard.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium">Avatar</label>
                  <Input
                    type="file"
                    accept="image/*"
                    onChange={handleAvatarChange}
                    disabled={avatarUploading}
                  />
                  <p className="text-xs text-muted-foreground">
                    Recommended square image, up to a few MB. This will show in the sidebar.
                  </p>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Organization Settings</CardTitle>
                <CardDescription>Configure your organization details</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="space-y-2">
                  <label className="text-sm font-medium">Organization Name</label>
                  <Input
                    value={orgProfile.name}
                    onChange={(e) =>
                      setOrgProfile((prev) => ({ ...prev, name: e.target.value }))
                    }
                    placeholder="Enter organization name"
                    disabled={orgLoading || orgSaving}
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium">Email</label>
                  <Input
                    value={orgProfile.email}
                    onChange={(e) =>
                      setOrgProfile((prev) => ({ ...prev, email: e.target.value }))
                    }
                    placeholder="Enter email"
                    disabled={orgLoading || orgSaving}
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium">Phone Number</label>
                  <Input
                    value={orgProfile.phone}
                    onChange={(e) =>
                      setOrgProfile((prev) => ({ ...prev, phone: e.target.value }))
                    }
                    placeholder="Enter phone number"
                    disabled={orgLoading || orgSaving}
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium">Address</label>
                  <Input
                    value={orgProfile.address}
                    onChange={(e) =>
                      setOrgProfile((prev) => ({ ...prev, address: e.target.value }))
                    }
                    placeholder="Enter address"
                    disabled={orgLoading || orgSaving}
                  />
                </div>
                <div className="flex items-center justify-between gap-3">
                  {roleLoaded && !canEditOrg && (
                    <p className="text-[11px] text-muted-foreground">
                      You have read-only access. Contact an admin to update organization settings.
                    </p>
                  )}
                  <Button
                    className="bg-orange-600 hover:bg-orange-700 ml-auto"
                    type="button"
                    onClick={handleSaveOrgProfile}
                    disabled={orgLoading || orgSaving}
                  >
                    {orgSaving ? "Saving..." : "Save Changes"}
                  </Button>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Display Settings</CardTitle>
                <CardDescription>Customize your dashboard appearance</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-medium">Dark Mode</p>
                    <p className="text-sm text-muted-foreground">Enable dark theme</p>
                  </div>
                  <Switch defaultChecked />
                </div>
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-medium">Compact View</p>
                    <p className="text-sm text-muted-foreground">Reduce spacing for compact display</p>
                  </div>
                  <Switch />
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="notifications" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Notification Preferences</CardTitle>
                <CardDescription>Control how you receive notifications</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-medium">Shipment Updates</p>
                    <p className="text-sm text-muted-foreground">Receive alerts for shipment status changes</p>
                  </div>
                  <Switch defaultChecked />
                </div>
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-medium">Warehouse Alerts</p>
                    <p className="text-sm text-muted-foreground">Get notified about warehouse events</p>
                  </div>
                  <Switch defaultChecked />
                </div>
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-medium">Invoice Reminders</p>
                    <p className="text-sm text-muted-foreground">Receive invoice payment reminders</p>
                  </div>
                  <Switch defaultChecked />
                </div>
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-medium">Daily Summary</p>
                    <p className="text-sm text-muted-foreground">Get daily operations summary</p>
                  </div>
                  <Switch />
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="security" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Security Settings</CardTitle>
                <CardDescription>Manage your account security</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium">Current Password</label>
                  <Input
                    type="password"
                    placeholder="Enter current password"
                    value={currentPassword}
                    onChange={(e) => setCurrentPassword(e.target.value)}
                    disabled={passwordSaving}
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium">New Password</label>
                  <Input
                    type="password"
                    placeholder="Enter new password"
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    disabled={passwordSaving}
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium">Confirm Password</label>
                  <Input
                    type="password"
                    placeholder="Confirm new password"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    disabled={passwordSaving}
                  />
                </div>
                <Button
                  className="bg-orange-600 hover:bg-orange-700"
                  type="button"
                  onClick={handleUpdatePassword}
                  disabled={passwordSaving}
                >
                  {passwordSaving ? "Updating..." : "Update Password"}
                </Button>

                <div className="pt-4 border-t">
                  <div className="flex items-center justify-between mb-4">
                    <div>
                      <p className="font-medium">Two-Factor Authentication</p>
                      <p className="text-sm text-muted-foreground">Use an authenticator app to protect your account.</p>
                    </div>
                    {mfaChecking ? (
                      <span className="text-xs text-muted-foreground">Checking...</span>
                    ) : hasTotp ? (
                      <span className="text-xs font-medium text-emerald-600 dark:text-emerald-400">Enabled</span>
                    ) : (
                      <Button
                        variant="outline"
                        size="sm"
                        type="button"
                        onClick={handleStartMfaEnroll}
                        disabled={enrollLoading}
                      >
                        {enrollLoading ? "Starting..." : "Enable"}
                      </Button>
                    )}
                  </div>
                  {mfaError && (
                    <p className="text-xs text-destructive">
                      {mfaError}
                    </p>
                  )}
                  {qrCode && (
                    <div className="space-y-3 rounded-md border bg-muted/40 p-3">
                      <p className="text-sm font-medium">
                        Scan the QR code and enter the 6-digit code to finish setup.
                      </p>
                      <div className="flex flex-col items-center gap-3 sm:flex-row">
                        <img
                          src={qrCode}
                          alt="Authenticator QR code"
                          className="h-32 w-32 shrink-0"
                        />
                        <div className="w-full space-y-2">
                          <Input
                            type="text"
                            inputMode="numeric"
                            autoComplete="one-time-code"
                            placeholder="Enter code from app"
                            value={verifyCode}
                            onChange={(e) => setVerifyCode(e.target.value)}
                            disabled={enrollLoading}
                          />
                          <div className="flex gap-2">
                            <Button
                              type="button"
                              className="bg-orange-600 hover:bg-orange-700"
                              onClick={handleConfirmMfaEnroll}
                              disabled={enrollLoading}
                            >
                              {enrollLoading ? "Verifying..." : "Verify and enable"}
                            </Button>
                            <Button
                              type="button"
                              variant="ghost"
                              onClick={handleCancelMfaEnroll}
                              disabled={enrollLoading}
                            >
                              Cancel
                            </Button>
                          </div>
                        </div>
                      </div>
                    </div>
                  )}
                  {hasTotp && !qrCode && (
                    <p className="text-xs text-muted-foreground">
                      Two-factor authentication is active. Admin and manager accounts will be required to complete an extra step when signing in.
                    </p>
                  )}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="integrations" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>System Integrations</CardTitle>
                <CardDescription>Connect with third-party services</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between p-3 rounded-lg border">
                  <div>
                    <p className="font-medium">Email Service</p>
                    <p className="text-sm text-muted-foreground">Connected</p>
                  </div>
                  <Button variant="outline" size="sm">Configure</Button>
                </div>
                <div className="flex items-center justify-between p-3 rounded-lg border">
                  <div>
                    <p className="font-medium">SMS Gateway</p>
                    <p className="text-sm text-muted-foreground">Not connected</p>
                  </div>
                  <Button variant="outline" size="sm">Connect</Button>
                </div>
                <div className="flex items-center justify-between p-3 rounded-lg border">
                  <div>
                    <p className="font-medium">Payment Gateway</p>
                    <p className="text-sm text-muted-foreground">Connected</p>
                  </div>
                  <Button variant="outline" size="sm">Configure</Button>
                </div>
                <div className="flex items-center justify-between p-3 rounded-lg border">
                  <div>
                    <p className="font-medium">GPS Tracking</p>
                    <p className="text-sm text-muted-foreground">Connected</p>
                  </div>
                  <Button variant="outline" size="sm">Configure</Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </DashboardLayout>
  );
}
