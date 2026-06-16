"use client";

import { useState } from "react";
import { DashboardShell } from "@/components/layout/dashboard-shell";
import { Header } from "@/components/layout/header";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  EmptyState,
  ErrorState,
  LoadingState,
} from "@/components/dashboard/data-states";
import { RouteGuard } from "@/components/auth/route-guard";
import { useAuth } from "@/components/providers/auth-provider";
import { useT } from "@/components/providers/locale-provider";
import { useAsync } from "@/lib/use-async";
import { ApiError, parentsApi } from "@/lib/api";

function errMessage(e: unknown): string {
  return e instanceof ApiError
    ? (e.details?.join(", ") ?? e.message)
    : e instanceof Error
      ? e.message
      : "Something went wrong";
}

function pct(n: number): string {
  // Metrics arrive on a 0–100 scale from the backend; just round.
  return `${Math.round(n)}%`;
}

export default function ParentChildrenPage() {
  const { user } = useAuth();
  const t = useT();

  const [selectedStudentId, setSelectedStudentId] = useState<number | null>(
    null,
  );

  const childrenQuery = useAsync(
    () => parentsApi.myChildren(),
    [user?.id],
  );

  const dashboardQuery = useAsync(async () => {
    if (selectedStudentId == null) return null;
    return parentsApi.childDashboard(selectedStudentId);
  }, [selectedStudentId]);

  const children = childrenQuery.data;
  const dashboard = dashboardQuery.data;

  const metrics = dashboard?.metrics;
  const atRisk =
    metrics != null &&
    !metrics.insufficientData &&
    metrics.compositeScore < 60;

  return (
    <RouteGuard allow={["PARENT"]}>
      <DashboardShell
        role="parent"
        userName={user?.fullName ?? ""}
        userEmail={user?.email ?? ""}
      >
        <Header title={t.nav.children} />
        <div className="space-y-8 p-8">
          {childrenQuery.loading ? (
            <LoadingState label="Loading your children…" />
          ) : childrenQuery.error ? (
            <ErrorState
              message={errMessage(childrenQuery.error)}
              onRetry={childrenQuery.reload}
            />
          ) : !children || children.length === 0 ? (
            <EmptyState
              title="No linked children"
              message="No students are linked to your account yet. Please contact your institution."
            />
          ) : (
            <>
              <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                {children.map((child) => {
                  const isSelected = child.studentId === selectedStudentId;
                  return (
                    <Card
                      key={child.studentId}
                      interactive
                      className={
                        isSelected
                          ? "ring-2 ring-indigo-500 ring-offset-2"
                          : undefined
                      }
                    >
                      <CardHeader>
                        <CardTitle>{child.studentName}</CardTitle>
                        <CardDescription>
                          {child.groupName ?? "No group"}
                        </CardDescription>
                      </CardHeader>
                      <CardContent>
                        <Button
                          size="sm"
                          variant={isSelected ? "default" : "outline"}
                          onClick={() => setSelectedStudentId(child.studentId)}
                        >
                          {isSelected ? "Viewing" : "View progress"}
                        </Button>
                      </CardContent>
                    </Card>
                  );
                })}
              </div>

              {selectedStudentId != null && (
                <div className="space-y-6">
                  {dashboardQuery.loading ? (
                    <LoadingState label="Loading progress…" />
                  ) : dashboardQuery.error ? (
                    <ErrorState
                      message={errMessage(dashboardQuery.error)}
                      onRetry={dashboardQuery.reload}
                    />
                  ) : !dashboard ? (
                    <EmptyState
                      title="No data yet"
                      message="There is no progress data for this student yet."
                    />
                  ) : (
                    <>
                      <div className="flex flex-wrap items-center gap-3">
                        <h2 className="text-lg font-semibold text-theme">
                          {dashboard.student.fullName}
                        </h2>
                        {dashboard.student.groupName && (
                          <Badge variant="secondary">
                            {dashboard.student.groupName}
                          </Badge>
                        )}
                        {metrics?.insufficientData ? (
                          <Badge variant="warning">Insufficient data</Badge>
                        ) : atRisk ? (
                          <Badge variant="destructive">At risk</Badge>
                        ) : (
                          <Badge variant="success">On track</Badge>
                        )}
                      </div>

                      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
                        <Card>
                          <CardHeader>
                            <CardDescription>Composite score</CardDescription>
                            <CardTitle className="text-2xl">
                              {metrics ? pct(metrics.compositeScore) : "—"}
                            </CardTitle>
                          </CardHeader>
                        </Card>
                        <Card>
                          <CardHeader>
                            <CardDescription>Attendance</CardDescription>
                            <CardTitle className="text-2xl">
                              {metrics ? pct(metrics.attendanceNorm) : "—"}
                            </CardTitle>
                          </CardHeader>
                        </Card>
                        <Card>
                          <CardHeader>
                            <CardDescription>Grades</CardDescription>
                            <CardTitle className="text-2xl">
                              {metrics ? pct(metrics.gradesNorm) : "—"}
                            </CardTitle>
                          </CardHeader>
                        </Card>
                        <Card>
                          <CardHeader>
                            <CardDescription>Group percentile</CardDescription>
                            <CardTitle className="text-2xl">
                              {dashboard.groupPercentile
                                ? `${Math.round(
                                    dashboard.groupPercentile.percentile,
                                  )}th`
                                : "—"}
                            </CardTitle>
                            <CardDescription>
                              {dashboard.groupPercentile
                                ? `of ${dashboard.groupPercentile.groupSize} students`
                                : ""}
                            </CardDescription>
                          </CardHeader>
                        </Card>
                      </div>

                      <Card>
                        <CardHeader>
                          <CardTitle>Recent grades</CardTitle>
                          <CardDescription>
                            Latest graded assignments
                          </CardDescription>
                        </CardHeader>
                        <CardContent>
                          {dashboard.recentGrades.length === 0 ? (
                            <p className="text-sm text-theme-muted">
                              No grades recorded yet.
                            </p>
                          ) : (
                            <ul className="divide-y divide-slate-100">
                              {dashboard.recentGrades.map((grade) => (
                                <li
                                  key={grade.id}
                                  className="flex items-center justify-between gap-4 py-2.5 text-sm"
                                >
                                  <span className="font-medium text-theme">
                                    {grade.assignmentName}
                                  </span>
                                  <span className="text-theme-muted">
                                    {grade.value} / {grade.maxValue}
                                  </span>
                                </li>
                              ))}
                            </ul>
                          )}
                        </CardContent>
                      </Card>

                      {dashboard.growthAreas.length > 0 && (
                        <Card>
                          <CardHeader>
                            <CardTitle>Growth areas</CardTitle>
                            <CardDescription>
                              Compared with the group average
                            </CardDescription>
                          </CardHeader>
                          <CardContent>
                            <ul className="divide-y divide-slate-100">
                              {dashboard.growthAreas.map((area) => (
                                <li
                                  key={area.dimension}
                                  className="flex items-center justify-between gap-4 py-2.5 text-sm"
                                >
                                  <span className="font-medium text-theme capitalize">
                                    {area.dimension}
                                  </span>
                                  <span className="text-theme-muted">
                                    {pct(area.score)}{" "}
                                    <span className="text-theme-muted/70">
                                      (avg {pct(area.groupAverage)})
                                    </span>
                                  </span>
                                </li>
                              ))}
                            </ul>
                          </CardContent>
                        </Card>
                      )}
                    </>
                  )}
                </div>
              )}
            </>
          )}
        </div>
      </DashboardShell>
    </RouteGuard>
  );
}
