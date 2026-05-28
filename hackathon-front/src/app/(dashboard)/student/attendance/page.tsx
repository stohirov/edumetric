"use client";

import { DashboardShell } from "@/components/layout/dashboard-shell";
import { Header } from "@/components/layout/header";
import { AreaChartCard } from "@/components/charts/area-chart-card";
import { Card, CardContent } from "@/components/ui/card";
import { ErrorState, LoadingState } from "@/components/dashboard/data-states";
import { RouteGuard } from "@/components/auth/route-guard";
import { useAuth } from "@/components/providers/auth-provider";
import { useT } from "@/components/providers/locale-provider";
import { useAsync } from "@/lib/use-async";
import { studentsApi } from "@/lib/api";
import { cn } from "@/lib/utils";
import type { ChartDataPoint } from "@/types";

export default function StudentAttendancePage() {
  const { user } = useAuth();
  const t = useT();

  const query = useAsync(async () => {
    if (!user) throw new Error("Not authenticated");
    return studentsApi.getMyStudentDashboard();
  }, [user?.id]);

  const trendData: ChartDataPoint[] = (query.data?.trend ?? []).map(
    (point, idx) => ({
      name: `W${idx + 1}`,
      value: Math.round(Number(point.attendanceNorm)),
    }),
  );

  const att = query.data?.metrics.attendanceNorm;
  const recent = query.data?.recentAttendance ?? [];
  const presentCount = recent.filter((a) => a.status === "PRESENT").length;
  const absentCount = recent.filter((a) => a.status === "ABSENT").length;
  const lateCount = recent.filter((a) => a.status === "LATE").length;

  return (
    <RouteGuard allow={["STUDENT", "TEACHER", "ADMIN"]}>
      <DashboardShell
        role="student"
        userName={user?.fullName ?? ""}
        userEmail={user?.email ?? ""}
      >
        <Header
          title={t.pages.studentAttendance.title}
          description={t.pages.studentAttendance.desc}
        />
        <div className="space-y-6 p-8">
          {query.loading ? (
            <LoadingState />
          ) : query.error ? (
            <ErrorState
              message={query.error.message}
              onRetry={query.reload}
            />
          ) : (
            <>
              <div className="grid gap-3 sm:grid-cols-4">
                {[
                  { label: "Attendance norm", value: `${Math.round(Number(att ?? 0))}%`, color: "bg-indigo-500" },
                  { label: "Present", value: presentCount, color: "bg-emerald-500" },
                  { label: "Late", value: lateCount, color: "bg-amber-500" },
                  { label: "Absent", value: absentCount, color: "bg-red-500" },
                ].map((stat) => (
                  <Card key={stat.label}>
                    <CardContent className="flex items-center gap-3 p-4">
                      <div className={cn("h-3 w-3 rounded-full", stat.color)} />
                      <div>
                        <p className="text-xs font-medium text-slate-500">{stat.label}</p>
                        <p className="text-xl font-semibold tabular-nums text-theme">
                          {stat.value}
                        </p>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>

              <AreaChartCard
                title={t.pages.studentAttendance.chart}
                description="Weekly attendance trend"
                data={trendData}
              />
            </>
          )}
        </div>
      </DashboardShell>
    </RouteGuard>
  );
}
