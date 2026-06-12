"use client";

import { DashboardShell } from "@/components/layout/dashboard-shell";
import { Header } from "@/components/layout/header";
import { RouteGuard } from "@/components/auth/route-guard";
import { AnnouncementsManager } from "@/components/notifications/announcements-manager";
import { useAuth } from "@/components/providers/auth-provider";
import { useT } from "@/components/providers/locale-provider";

export default function TeacherAnnouncementsPage() {
  const { user } = useAuth();
  const t = useT();
  const tt = t.pages.announcements;

  return (
    <RouteGuard allow={["TEACHER", "ADMIN"]}>
      <DashboardShell role="teacher" userName={user?.fullName ?? ""} userEmail={user?.email ?? ""}>
        <Header title={tt.title} description={tt.desc} />
        <div className="space-y-6 p-8">
          <AnnouncementsManager mode="teacher" />
        </div>
      </DashboardShell>
    </RouteGuard>
  );
}
