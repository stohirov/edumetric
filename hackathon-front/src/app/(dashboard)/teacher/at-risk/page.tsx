"use client";

import { DashboardShell } from "@/components/layout/dashboard-shell";
import { Header } from "@/components/layout/header";
import { StudentsTable } from "@/components/dashboard/students-table";
import { ErrorState, LoadingState } from "@/components/dashboard/data-states";
import { RouteGuard } from "@/components/auth/route-guard";
import { useAuth } from "@/components/providers/auth-provider";
import { useT } from "@/components/providers/locale-provider";
import { useAsync } from "@/lib/use-async";
import { analyticsApi } from "@/lib/api";
import { atRiskDtoToRow } from "@/lib/adapters/student-row";

export default function TeacherAtRiskPage() {
  const { user } = useAuth();
  const t = useT();
  const query = useAsync(
    () => analyticsApi.getAtRiskStudents(),
    [user?.id],
  );

  return (
    <RouteGuard allow={["TEACHER", "ADMIN"]}>
      <DashboardShell
        role="teacher"
        userName={user?.fullName ?? ""}
        userEmail={user?.email ?? ""}
      >
        <Header
          title={t.pages.teacherAtRisk.title}
          description={t.pages.teacherAtRisk.desc}
        />
        <div className="p-8">
          {query.loading ? (
            <LoadingState />
          ) : query.error ? (
            <ErrorState message={query.error.message} onRetry={query.reload} />
          ) : (
            <StudentsTable
              students={(query.data ?? []).map(atRiskDtoToRow)}
              title={t.pages.teacherAtRisk.card}
            />
          )}
        </div>
      </DashboardShell>
    </RouteGuard>
  );
}
