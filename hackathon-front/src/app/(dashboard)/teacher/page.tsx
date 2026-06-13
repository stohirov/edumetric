"use client";

import { AosStagger } from "@/components/ui/aos";
import { DashboardShell } from "@/components/layout/dashboard-shell";
import {
  TeacherHeader,
  AnalyticsSummary,
  TodayLessons,
  PendingTasks,
  AtRiskStudents,
  GroupsOverview,
} from "@/components/teacher-dashboard";
import { ErrorState, LoadingState } from "@/components/dashboard/data-states";
import { RouteGuard } from "@/components/auth/route-guard";
import { useAuth } from "@/components/providers/auth-provider";
import { useT } from "@/components/providers/locale-provider";
import { useAsync } from "@/lib/use-async";
import {
  analyticsApi,
  lessonsApi,
  teachersApi,
} from "@/lib/api";
import { adaptTeacherDashboard } from "@/lib/adapters/teacher-dashboard";

export default function TeacherDashboardPage() {
  const { user, status } = useAuth();
  const t = useT();

  const query = useAsync(async () => {
    if (!user) throw new Error("Not authenticated");
    const [teacher, lessons, atRisk, myGroups] = await Promise.all([
      teachersApi.getMyTeacher().catch(() => null),
      lessonsApi.getTodayLessons().catch(() => []),
      analyticsApi.getAtRiskStudents().catch(() => []),
      teachersApi.listMyGroups().catch(() => []),
    ]);
    return adaptTeacherDashboard({
      teacher,
      fallbackProfile: { fullName: user.fullName, email: user.email },
      lessons,
      atRisk,
      groups: myGroups,
    });
  }, [user?.id]);

  const data = query.data;
  const shellName = data?.profile.fullName ?? user?.fullName ?? "";
  const shellEmail = data?.profile.email ?? user?.email ?? "";

  return (
    <RouteGuard allow={["TEACHER", "ADMIN"]}>
    <DashboardShell role="teacher" userName={shellName} userEmail={shellEmail}>
      <div className="mx-auto max-w-[1600px] p-4 sm:p-6 lg:p-8">
        {status === "loading" || query.loading ? (
          <LoadingState label={t.pages.dashboardLoading.loading} />
        ) : query.error || !data ? (
          <ErrorState message={query.error?.message} onRetry={query.reload} />
        ) : (
          <AosStagger className="space-y-5 sm:space-y-6">
            <TeacherHeader profile={data.profile} />
            <AnalyticsSummary items={data.analytics} />
            <TodayLessons lessons={data.lessons} />

            <div className="grid gap-5 lg:grid-cols-2">
              <PendingTasks tasks={data.tasks} />
              <AtRiskStudents students={data.atRiskStudents} />
            </div>

            <GroupsOverview groups={data.groups} />
          </AosStagger>
        )}
      </div>
    </DashboardShell>
    </RouteGuard>
  );
}
