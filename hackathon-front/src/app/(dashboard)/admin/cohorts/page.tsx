"use client";

import { DashboardShell } from "@/components/layout/dashboard-shell";
import { Header } from "@/components/layout/header";
import {
  EmptyState,
  ErrorState,
  LoadingState,
} from "@/components/dashboard/data-states";
import { RouteGuard } from "@/components/auth/route-guard";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { useAuth } from "@/components/providers/auth-provider";
import { useT } from "@/components/providers/locale-provider";
import { useAsync } from "@/lib/use-async";
import { analyticsApi } from "@/lib/api";

function fmt(value: number | null): string {
  return value === null ? "—" : value.toFixed(1);
}

export default function AdminCohortsPage() {
  const { user } = useAuth();
  const t = useT();
  const tt = t.pages.adminCohorts;

  const query = useAsync(() => analyticsApi.getCohortComparison(), [user?.id]);

  const cohorts = query.data?.cohorts ?? [];
  const longitudinal = query.data?.longitudinal ?? [];

  return (
    <RouteGuard allow={["ADMIN"]}>
      <DashboardShell
        role="admin"
        userName={user?.fullName ?? ""}
        userEmail={user?.email ?? ""}
      >
        <Header
          title={tt.title}
          description={tt.desc}
        />
        <div className="space-y-6 p-8">
          {query.loading ? (
            <LoadingState />
          ) : query.error ? (
            <ErrorState message={query.error.message} onRetry={query.reload} />
          ) : (
            <>
              <Card>
                <CardHeader>
                  <CardTitle>{tt.cohorts}</CardTitle>
                  <CardDescription>
                    {tt.cohortsDesc}
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  {cohorts.length === 0 ? (
                    <EmptyState
                      title={tt.noCohorts}
                      message={tt.noCohortsMsg}
                    />
                  ) : (
                    <div className="overflow-x-auto">
                      <table className="w-full text-sm">
                        <thead>
                          <tr className="border-b border-theme text-left text-xs font-medium text-theme-muted">
                            <th className="px-3 py-2">{tt.group}</th>
                            <th className="px-3 py-2">{tt.students}</th>
                            <th className="px-3 py-2">{tt.avgComposite}</th>
                            <th className="px-3 py-2">{tt.avgAttendance}</th>
                            <th className="px-3 py-2">{tt.avgGrades}</th>
                            <th className="px-3 py-2">{tt.atRisk}</th>
                          </tr>
                        </thead>
                        <tbody>
                          {cohorts.map((c) => (
                            <tr
                              key={c.groupId}
                              className="border-b border-theme/60 last:border-0"
                            >
                              <td className="px-3 py-3 font-medium text-theme">
                                {c.groupName}
                              </td>
                              <td className="px-3 py-3 text-theme-muted">
                                {c.studentCount}
                              </td>
                              <td className="px-3 py-3 text-theme-muted">
                                {fmt(c.avgComposite)}
                              </td>
                              <td className="px-3 py-3 text-theme-muted">
                                {fmt(c.avgAttendance)}
                              </td>
                              <td className="px-3 py-3 text-theme-muted">
                                {fmt(c.avgGrades)}
                              </td>
                              <td className="px-3 py-3 text-theme-muted">
                                {c.atRiskCount}
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  )}
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>{tt.trend}</CardTitle>
                  <CardDescription>
                    {tt.trendDesc}
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  {longitudinal.length === 0 ? (
                    <EmptyState
                      title={tt.noTrend}
                      message={tt.noTrendMsg}
                    />
                  ) : (
                    <div className="space-y-3">
                      {longitudinal.map((p) => (
                        <div
                          key={p.label}
                          className="flex items-center gap-3 text-sm"
                        >
                          <span className="w-24 shrink-0 text-theme-muted">
                            {p.label}
                          </span>
                          <div className="h-3 flex-1 rounded-full bg-[var(--muted)]">
                            <div
                              className="h-3 rounded-full bg-indigo-500"
                              style={{
                                width: `${Math.max(0, Math.min(100, p.avgComposite ?? 0))}%`,
                              }}
                            />
                          </div>
                          <span className="w-12 shrink-0 text-right font-medium text-theme">
                            {fmt(p.avgComposite)}
                          </span>
                        </div>
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>
            </>
          )}
        </div>
      </DashboardShell>
    </RouteGuard>
  );
}
