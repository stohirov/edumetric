"use client";

import { useMemo } from "react";
import { AosStagger } from "@/components/ui/aos";
import { DashboardShell } from "@/components/layout/dashboard-shell";
import {
  StudentHero,
  StudentRadarCard,
  StudentGrowthTrendCard,
  PerformanceBreakdown,
  GrowthAreasCard,
  RecentActivityCard,
} from "@/components/student-dashboard";
import { ErrorState, LoadingState } from "@/components/dashboard/data-states";
import { RouteGuard } from "@/components/auth/route-guard";
import { useAuth } from "@/components/providers/auth-provider";
import { useT } from "@/components/providers/locale-provider";
import { useAsync } from "@/lib/use-async";
import { studentsApi } from "@/lib/api";
import { adaptStudentDashboard } from "@/lib/adapters/student-dashboard";

export default function StudentDashboardPage() {
  const { user, status } = useAuth();
  const t = useT();

  const query = useAsync(async () => {
    if (!user) throw new Error("Not authenticated");
    const dashboard = await studentsApi.getMyStudentDashboard();
    return adaptStudentDashboard(dashboard);
  }, [user?.id]);

  const data = query.data;

  const shellName = useMemo(
    () => data?.profile.fullName ?? user?.fullName ?? "",
    [data, user],
  );
  const shellEmail = useMemo(
    () => data?.profile.email ?? user?.email ?? "",
    [data, user],
  );

  return (
    <RouteGuard allow={["STUDENT", "TEACHER", "ADMIN"]}>
    <DashboardShell role="student" userName={shellName} userEmail={shellEmail}>
      <div className="mx-auto max-w-[1600px] p-4 sm:p-6 lg:p-8">
        {status === "loading" || query.loading ? (
          <LoadingState label={t.pages.dashboardLoading.loading} />
        ) : query.error || !data ? (
          <ErrorState message={query.error?.message} onRetry={query.reload} />
        ) : (
          <AosStagger className="space-y-6 sm:space-y-8">
            <StudentHero profile={data.profile} />

            <div className="grid gap-6 lg:grid-cols-12">
              <StudentRadarCard data={data.radar} className="lg:col-span-5" />
              <StudentGrowthTrendCard
                data={data.growthTrend}
                className="lg:col-span-7"
              />
            </div>

            <div className="grid gap-6 lg:grid-cols-2">
              <PerformanceBreakdown items={data.performance} />
              <GrowthAreasCard areas={data.growthAreas} />
            </div>

            <RecentActivityCard
              grades={data.recentGrades}
              attendance={data.recentAttendance}
            />
          </AosStagger>
        )}
      </div>
    </DashboardShell>
    </RouteGuard>
  );
}
