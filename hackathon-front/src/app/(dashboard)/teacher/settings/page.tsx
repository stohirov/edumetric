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

export default function TeacherSettingsPage() {
  const { user } = useAuth();
  const t = useT();
  return (
    <RouteGuard allow={["TEACHER", "ADMIN"]}>
      <DashboardShell
        role="teacher"
        userName={user?.fullName ?? ""}
        userEmail={user?.email ?? ""}
      >
        <Header
          title={t.pages.teacherSettings.title}
          description={t.pages.teacherSettings.desc}
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
