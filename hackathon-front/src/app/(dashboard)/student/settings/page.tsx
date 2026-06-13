"use client";

import { DashboardShell } from "@/components/layout/dashboard-shell";
import { Header } from "@/components/layout/header";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { ErrorState, LoadingState } from "@/components/dashboard/data-states";
import { ProfileSettingsCard } from "@/components/settings/profile-settings-card";
import { SessionsCard } from "@/components/settings/sessions-card";
import { TwoFactorCard } from "@/components/settings/two-factor-card";
import { NotificationPreferencesCard } from "@/components/settings/notification-preferences-card";
import { RouteGuard } from "@/components/auth/route-guard";
import { useAuth } from "@/components/providers/auth-provider";
import { useT } from "@/components/providers/locale-provider";
import { useAsync } from "@/lib/use-async";
import { studentsApi } from "@/lib/api";

export default function StudentSettingsPage() {
  const { user } = useAuth();
  const t = useT();

  const query = useAsync(async () => {
    if (!user) throw new Error("Not authenticated");
    return studentsApi.getMyStudent();
  }, [user?.id]);

  const student = query.data;

  return (
    <RouteGuard allow={["STUDENT", "TEACHER", "ADMIN"]}>
      <DashboardShell
        role="student"
        userName={user?.fullName ?? ""}
        userEmail={user?.email ?? ""}
      >
        <Header
          title={t.pages.studentSettings.title}
          description={t.pages.studentSettings.desc}
        />
        <div className="space-y-8 p-8">
          <ProfileSettingsCard />
          <TwoFactorCard />
          <SessionsCard />
          <NotificationPreferencesCard />
          {query.loading ? (
            <LoadingState />
          ) : query.error ? (
            <ErrorState message={query.error.message} onRetry={query.reload} />
          ) : (
            <Card>
              <CardHeader>
                <CardTitle>{t.pages.studentSettings.card}</CardTitle>
                <CardDescription>Profile linked to your account</CardDescription>
              </CardHeader>
              <CardContent>
                <dl className="grid gap-3 text-sm">
                  <div className="flex justify-between">
                    <dt className="text-theme-muted">Full name</dt>
                    <dd className="font-medium text-theme">{student?.fullName ?? user?.fullName}</dd>
                  </div>
                  <div className="flex justify-between">
                    <dt className="text-theme-muted">Email</dt>
                    <dd className="font-medium text-theme">{student?.email ?? user?.email}</dd>
                  </div>
                  <div className="flex justify-between">
                    <dt className="text-theme-muted">Group</dt>
                    <dd className="font-medium text-theme">{student?.groupName ?? "—"}</dd>
                  </div>
                  <div className="flex justify-between">
                    <dt className="text-theme-muted">Enrolled</dt>
                    <dd className="font-medium text-theme">{student?.enrolledAt ?? "—"}</dd>
                  </div>
                </dl>
              </CardContent>
            </Card>
          )}
        </div>
      </DashboardShell>
    </RouteGuard>
  );
}
