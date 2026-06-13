"use client";

import { DashboardShell } from "@/components/layout/dashboard-shell";
import { Header } from "@/components/layout/header";
import { ProfileSettingsCard } from "@/components/settings/profile-settings-card";
import { SessionsCard } from "@/components/settings/sessions-card";
import { TwoFactorCard } from "@/components/settings/two-factor-card";
import { NotificationPreferencesCard } from "@/components/settings/notification-preferences-card";
import { RouteGuard } from "@/components/auth/route-guard";
import { useAuth } from "@/components/providers/auth-provider";
import { useT } from "@/components/providers/locale-provider";

export default function ParentSettingsPage() {
  const { user } = useAuth();
  const t = useT();

  return (
    <RouteGuard allow={["PARENT"]}>
      <DashboardShell
        role="parent"
        userName={user?.fullName ?? ""}
        userEmail={user?.email ?? ""}
      >
        <Header
          title={t.nav.settings}
          description={t.pages.studentSettings.desc}
        />
        <div className="space-y-8 p-8">
          <ProfileSettingsCard />
          <TwoFactorCard />
          <SessionsCard />
          <NotificationPreferencesCard />
        </div>
      </DashboardShell>
    </RouteGuard>
  );
}
