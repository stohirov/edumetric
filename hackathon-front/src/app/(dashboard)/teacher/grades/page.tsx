"use client";

import { DashboardShell } from "@/components/layout/dashboard-shell";
import { Header } from "@/components/layout/header";
import { DonutChartCard } from "@/components/charts/donut-chart-card";
import { ErrorState, LoadingState } from "@/components/dashboard/data-states";
import { RouteGuard } from "@/components/auth/route-guard";
import { useAuth } from "@/components/providers/auth-provider";
import { useT } from "@/components/providers/locale-provider";
import { useAsync } from "@/lib/use-async";
import { analyticsApi } from "@/lib/api";
import type { ChartDataPoint } from "@/types";

function bucketLetter(low: number, high: number): string {
  const mid = (low + high) / 2;
  if (mid >= 90) return "A";
  if (mid >= 80) return "B";
  if (mid >= 70) return "C";
  if (mid >= 60) return "D";
  return "F";
}

export default function TeacherGradesPage() {
  const { user } = useAuth();
  const t = useT();

  const query = useAsync(
    () => analyticsApi.getTeacherDashboard(),
    [user?.id],
  );

  const distribution: ChartDataPoint[] =
    (query.data?.scoreDistribution ?? []).map((b) => ({
      name: bucketLetter(b.low, b.high),
      value: b.count,
    }));

  return (
    <RouteGuard allow={["TEACHER", "ADMIN"]}>
      <DashboardShell
        role="teacher"
        userName={user?.fullName ?? ""}
        userEmail={user?.email ?? ""}
      >
        <Header
          title={t.pages.teacherGrades.title}
          description={t.pages.teacherGrades.desc}
        />
        <div className="p-8">
          {query.loading ? (
            <LoadingState />
          ) : query.error ? (
            <ErrorState message={query.error.message} onRetry={query.reload} />
          ) : (
            <DonutChartCard
              title={t.pages.teacherGrades.chart}
              description="Composite-score distribution across your groups"
              data={distribution}
            />
          )}
        </div>
      </DashboardShell>
    </RouteGuard>
  );
}
