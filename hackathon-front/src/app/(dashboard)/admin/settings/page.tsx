"use client";

import { DashboardShell } from "@/components/layout/dashboard-shell";
import { Header } from "@/components/layout/header";
import { ProfileSettingsCard } from "@/components/settings/profile-settings-card";
import { SessionsCard } from "@/components/settings/sessions-card";
import { TwoFactorCard } from "@/components/settings/two-factor-card";
import { InstitutionSettingsCard } from "@/components/settings/institution-settings-card";
import { NotificationPreferencesCard } from "@/components/settings/notification-preferences-card";
import { RouteGuard } from "@/components/auth/route-guard";
import { useAuth } from "@/components/providers/auth-provider";
import { useT } from "@/components/providers/locale-provider";

export default function AdminSettingsPage() {
  const { user } = useAuth();
  const t = useT();
  return (
    <RouteGuard allow={["ADMIN"]}>
      <DashboardShell
        role="admin"
        userName={user?.fullName ?? ""}
        userEmail={user?.email ?? ""}
      >
        <Header
          title={t.pages.adminSettings.title}
          description={t.pages.adminSettings.desc}
        />
        <div className="space-y-8 p-8">
          <ProfileSettingsCard />
          <TwoFactorCard />
          <SessionsCard />
          <InstitutionSettingsCard />
          <NotificationPreferencesCard />
        </div>
      </DashboardShell>
    </RouteGuard>
  );
}
