"use client";

import { DashboardShell } from "@/components/layout/dashboard-shell";
import { Header } from "@/components/layout/header";
import { RouteGuard } from "@/components/auth/route-guard";
import { useAuth } from "@/components/providers/auth-provider";
import { useT } from "@/components/providers/locale-provider";
import { MessagingView } from "@/components/messaging/messaging-view";

export default function StudentMessagesPage() {
  const { user } = useAuth();
  const tt = useT().pages.messages;

  return (
    <RouteGuard allow={["STUDENT"]}>
      <DashboardShell
        role="student"
        userName={user?.fullName ?? ""}
        userEmail={user?.email ?? ""}
      >
        <Header
          title={tt.title}
          description={tt.descStudent}
        />
        <MessagingView />
      </DashboardShell>
    </RouteGuard>
  );
}
