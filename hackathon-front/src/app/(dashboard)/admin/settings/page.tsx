"use client";

import { DashboardShell } from "@/components/layout/dashboard-shell";
import { Header } from "@/components/layout/header";
import { SectionPlaceholder } from "@/components/dashboard/section-placeholder";
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
        <SectionPlaceholder
          title={t.pages.adminSettings.card}
          description="Branding, SSO, API keys, and notification policies."
        />
      </DashboardShell>
    </RouteGuard>
  );
}
