"use client";

import { DashboardShell } from "@/components/layout/dashboard-shell";
import { Header } from "@/components/layout/header";
import { RouteGuard } from "@/components/auth/route-guard";
import { useAuth } from "@/components/providers/auth-provider";
import { useT } from "@/components/providers/locale-provider";
import { MessagingView } from "@/components/messaging/messaging-view";

export default function TeacherMessagesPage() {
  const { user } = useAuth();
  const tt = useT().pages.messages;

  return (
    <RouteGuard allow={["TEACHER"]}>
      <DashboardShell
        role="teacher"
        userName={user?.fullName ?? ""}
        userEmail={user?.email ?? ""}
      >
        <Header
          title={tt.title}
          description={tt.descTeacher}
        />
        <MessagingView />
      </DashboardShell>
    </RouteGuard>
  );
}
