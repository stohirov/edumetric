"use client";

import { DashboardShell } from "@/components/layout/dashboard-shell";
import { Header } from "@/components/layout/header";
import { StudentsTable } from "@/components/dashboard/students-table";
import { ErrorState, LoadingState } from "@/components/dashboard/data-states";
import { RouteGuard } from "@/components/auth/route-guard";
import { useAuth } from "@/components/providers/auth-provider";
import { useT } from "@/components/providers/locale-provider";
import { useAsync } from "@/lib/use-async";
import { teachersApi } from "@/lib/api";
import { studentDtoToRow } from "@/lib/adapters/student-row";

export default function TeacherStudentsPage() {
  const { user } = useAuth();
  const t = useT();
  const query = useAsync(
    () => teachersApi.listMyStudents({ page: 0, size: 200 }),
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
          title={t.pages.teacherStudents.title}
          description={t.pages.teacherStudents.desc}
        />
        <div className="p-8">
          {query.loading ? (
            <LoadingState />
          ) : query.error ? (
            <ErrorState message={query.error.message} onRetry={query.reload} />
          ) : (
            <StudentsTable students={(query.data?.items ?? []).map(studentDtoToRow)} />
          )}
        </div>
      </DashboardShell>
    </RouteGuard>
  );
}
