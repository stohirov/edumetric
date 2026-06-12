"use client";

import { DashboardShell } from "@/components/layout/dashboard-shell";
import { Header } from "@/components/layout/header";
import { RouteGuard } from "@/components/auth/route-guard";
import { NotificationsFeed } from "@/components/notifications/notifications-feed";
import { useAuth } from "@/components/providers/auth-provider";
import { useT } from "@/components/providers/locale-provider";

export default function ParentNotificationsPage() {
  const { user } = useAuth();
  const t = useT();
  const tt = t.pages.notifications;

  return (
    <RouteGuard allow={["PARENT"]}>
      <DashboardShell
        role="parent"
        userName={user?.fullName ?? ""}
        userEmail={user?.email ?? ""}
      >
        <Header title={tt.title} description={tt.desc} />
        <div className="space-y-6 p-8">
          <NotificationsFeed />
        </div>
      </DashboardShell>
    </RouteGuard>
  );
}
