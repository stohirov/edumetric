"use client";

import { DashboardShell } from "@/components/layout/dashboard-shell";
import { Header } from "@/components/layout/header";
import { AreaChartCard } from "@/components/charts/area-chart-card";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { ErrorState, LoadingState } from "@/components/dashboard/data-states";
import { RouteGuard } from "@/components/auth/route-guard";
import { useAuth } from "@/components/providers/auth-provider";
import { useT } from "@/components/providers/locale-provider";
import { useAsync } from "@/lib/use-async";
import { studentsApi } from "@/lib/api";
import type { ChartDataPoint } from "@/types";

export default function StudentGrowthPage() {
  const { user } = useAuth();
  const t = useT();

  const query = useAsync(async () => {
    if (!user) throw new Error("Not authenticated");
    return studentsApi.getMyStudentDashboard();
  }, [user?.id]);

  const trend: ChartDataPoint[] = (query.data?.trend ?? []).map((p, i) => ({
    name: `W${i + 1}`,
    value: Math.round(Number(p.compositeScore ?? 0)),
  }));

  const areas = query.data?.growthAreas ?? [];

  return (
    <RouteGuard allow={["STUDENT", "TEACHER", "ADMIN"]}>
      <DashboardShell
        role="student"
        userName={user?.fullName ?? ""}
        userEmail={user?.email ?? ""}
      >
        <Header
          title={t.pages.studentGrowth.title}
          description={t.pages.studentGrowth.desc}
        />
        <div className="space-y-6 p-8">
          {query.loading ? (
            <LoadingState />
          ) : query.error ? (
            <ErrorState message={query.error.message} onRetry={query.reload} />
          ) : (
            <>
              <AreaChartCard
                title={t.pages.studentGrowth.card}
                description="Composite score progression"
                data={trend}
              />
              <Card>
                <CardHeader>
                  <CardTitle>Focus areas</CardTitle>
                  <CardDescription>Where you trail your group average</CardDescription>
                </CardHeader>
                <CardContent>
                  <ul className="divide-y divide-slate-100">
                    {areas.map((a) => (
                      <li
                        key={a.dimension}
                        className="flex items-center justify-between py-3"
                      >
                        <span className="text-sm font-medium capitalize text-theme">
                          {a.dimension}
                        </span>
                        <span className="text-xs tabular-nums text-theme-muted">
                          {Math.round(Number(a.score ?? 0))} vs group{" "}
                          {Math.round(Number(a.groupAverage ?? 0))}
                        </span>
                      </li>
                    ))}
                    {areas.length === 0 && (
                      <li className="py-6 text-center text-sm text-theme-muted">
                        No growth data yet.
                      </li>
                    )}
                  </ul>
                </CardContent>
              </Card>
            </>
          )}
        </div>
      </DashboardShell>
    </RouteGuard>
  );
}
