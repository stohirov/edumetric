"use client";

import { DashboardShell } from "@/components/layout/dashboard-shell";
import { Header } from "@/components/layout/header";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { ErrorState, LoadingState } from "@/components/dashboard/data-states";
import { RouteGuard } from "@/components/auth/route-guard";
import { useAuth } from "@/components/providers/auth-provider";
import { useT } from "@/components/providers/locale-provider";
import { useAsync } from "@/lib/use-async";
import { gradebookApi } from "@/lib/api";
import { cn } from "@/lib/utils";

function tone(percent: number | null): string {
  if (percent == null) return "text-theme-muted";
  if (percent >= 80) return "text-emerald-600";
  if (percent >= 60) return "text-amber-600";
  return "text-rose-600";
}

export default function StudentGradesPage() {
  const { user } = useAuth();
  const t = useT();
  const tt = t.pages.studentGrades;

  const query = useAsync(() => gradebookApi.getMyCourseGrades(), [user?.id]);
  const data = query.data;

  return (
    <RouteGuard allow={["STUDENT", "TEACHER", "ADMIN"]}>
      <DashboardShell
        role="student"
        userName={user?.fullName ?? ""}
        userEmail={user?.email ?? ""}
      >
        <Header title={tt.title} description={tt.desc} />
        <div className="space-y-6 p-8">
          {query.loading ? (
            <LoadingState />
          ) : query.error ? (
            <ErrorState message={query.error.message} onRetry={query.reload} />
          ) : !data || data.courseId == null ? (
            <p className="text-sm text-theme-muted">{tt.noCourse}</p>
          ) : (
            <>
              <Card>
                <CardHeader>
                  <CardTitle>{data.courseName}</CardTitle>
                  <CardDescription>{tt.courseGrade}</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="flex items-end justify-between gap-4">
                    <span
                      className={cn(
                        "text-4xl font-bold tabular-nums",
                        tone(data.coursePercent),
                      )}
                    >
                      {data.display ?? "—"}
                    </span>
                    {data.coursePercent != null && (
                      <span className="text-sm text-theme-muted">
                        {Math.round(data.coursePercent)}%
                      </span>
                    )}
                  </div>
                  <Progress
                    value={data.coursePercent ?? 0}
                    className="mt-3 h-2"
                  />
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>{tt.card}</CardTitle>
                  <CardDescription>{data.courseName}</CardDescription>
                </CardHeader>
                <CardContent>
                  {data.items.length === 0 ? (
                    <p className="py-6 text-center text-sm text-theme-muted">
                      {tt.noGrades}
                    </p>
                  ) : (
                    <ul className="divide-y divide-slate-100">
                      {data.items.map((it) => {
                        const pct =
                          it.percent != null ? Math.round(it.percent) : null;
                        return (
                          <li key={it.key} className="py-3">
                            <div className="flex items-center justify-between gap-3">
                              <div className="min-w-0">
                                <p className="truncate font-medium text-theme">
                                  {it.name}
                                </p>
                                <p className="text-xs text-theme-muted">
                                  {tt.weight} ×{it.weight ?? 1}
                                  {it.dueDate
                                    ? ` · ${tt.due} ${new Date(it.dueDate).toLocaleDateString()}`
                                    : ""}
                                </p>
                              </div>
                              {it.graded ? (
                                <Badge variant="default">
                                  {it.value}/{it.maxValue}
                                </Badge>
                              ) : it.submitted ? (
                                <Badge variant="secondary">{tt.pending}</Badge>
                              ) : (
                                <Badge variant="outline">{tt.notSubmitted}</Badge>
                              )}
                            </div>
                            {it.graded && pct != null && (
                              <Progress value={pct} className="mt-2 h-2" />
                            )}
                            {it.comment && (
                              <p className="mt-2 text-xs text-theme-muted">
                                “{it.comment}”
                              </p>
                            )}
                          </li>
                        );
                      })}
                    </ul>
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
