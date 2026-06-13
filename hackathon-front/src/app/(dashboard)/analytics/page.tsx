"use client";

import { AosStagger } from "@/components/ui/aos";
import { DashboardShell } from "@/components/layout/dashboard-shell";
import {
  AnalyticsHeader,
  KpiCards,
  ScoreDistributionChart,
  AttendanceAnalyticsChart,
  TopGroupsCard,
  AtRiskStudentsCard,
  TeacherActivityCard,
} from "@/components/admin-analytics";
import { ErrorState, LoadingState } from "@/components/dashboard/data-states";
import { RouteGuard } from "@/components/auth/route-guard";
import { useAuth } from "@/components/providers/auth-provider";
import { useT } from "@/components/providers/locale-provider";
import { useAsync } from "@/lib/use-async";
import { analyticsApi } from "@/lib/api";
import { adaptAdminAnalytics } from "@/lib/adapters/admin-analytics";
import { downloadAnalyticsCsv } from "@/lib/analytics-export";

export default function AdminAnalyticsPage() {
  const { user, status } = useAuth();
  const t = useT();

  const query = useAsync(async () => {
    const [dashboard, atRisk] = await Promise.all([
      analyticsApi.getAdminDashboard(),
      analyticsApi.getAtRiskStudents().catch(() => []),
    ]);
    return adaptAdminAnalytics(dashboard, atRisk);
  }, [user?.id]);

  const data = query.data;

  return (
    <RouteGuard allow={["ADMIN"]}>
    <DashboardShell
      role="admin"
      userName={user?.fullName ?? "Admin"}
      userEmail={user?.email ?? ""}
    >
      <div className="mx-auto max-w-[1600px] p-4 sm:p-6 lg:p-8">
        {status === "loading" || query.loading ? (
          <LoadingState label={t.pages.analyticsPage.loading} />
        ) : query.error || !data ? (
          <ErrorState message={query.error?.message} onRetry={query.reload} />
        ) : (
          <AosStagger className="space-y-6 sm:space-y-8">
            <AnalyticsHeader onExport={() => downloadAnalyticsCsv(data)} />
            <KpiCards kpis={data.kpis} />

            <div className="grid gap-6 lg:grid-cols-2">
              <ScoreDistributionChart data={data.scoreDistribution} />
              <AttendanceAnalyticsChart data={data.attendanceAnalytics} />
            </div>

            <div className="grid gap-6 lg:grid-cols-12">
              <TopGroupsCard groups={data.topGroups} className="lg:col-span-4" />
              <AtRiskStudentsCard
                students={data.atRiskStudents}
                className="lg:col-span-8"
              />
            </div>

            <TeacherActivityCard activity={data.teacherActivity} />
          </AosStagger>
        )}
      </div>
    </DashboardShell>
    </RouteGuard>
  );
}
