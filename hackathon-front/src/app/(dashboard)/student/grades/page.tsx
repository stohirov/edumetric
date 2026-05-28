"use client";

import { DashboardShell } from "@/components/layout/dashboard-shell";
import { Header } from "@/components/layout/header";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { ErrorState, LoadingState } from "@/components/dashboard/data-states";
import { RouteGuard } from "@/components/auth/route-guard";
import { useAuth } from "@/components/providers/auth-provider";
import { useT } from "@/components/providers/locale-provider";
import { useAsync } from "@/lib/use-async";
import { studentsApi } from "@/lib/api";

export default function StudentGradesPage() {
  const { user } = useAuth();
  const t = useT();

  const query = useAsync(async () => {
    if (!user) throw new Error("Not authenticated");
    return studentsApi.getMyStudentDashboard();
  }, [user?.id]);

  const grades = query.data?.recentGrades ?? [];

  return (
    <RouteGuard allow={["STUDENT", "TEACHER", "ADMIN"]}>
      <DashboardShell
        role="student"
        userName={user?.fullName ?? ""}
        userEmail={user?.email ?? ""}
      >
        <Header
          title={t.pages.studentGrades.title}
          description={t.pages.studentGrades.desc}
        />
        <div className="p-8">
          {query.loading ? (
            <LoadingState />
          ) : query.error ? (
            <ErrorState message={query.error.message} onRetry={query.reload} />
          ) : (
            <Card>
              <CardHeader>
                <CardTitle>{t.pages.studentGrades.card}</CardTitle>
                <CardDescription>Recent assignment grades</CardDescription>
              </CardHeader>
              <CardContent>
                <ul className="divide-y divide-slate-100">
                  {grades.map((g) => {
                    const max = Number(g.maxValue) || 100;
                    const value = Number(g.value);
                    const pct = max > 0 ? Math.round((value / max) * 100) : 0;
                    return (
                      <li key={g.id} className="py-3">
                        <div className="flex items-center justify-between gap-3">
                          <div>
                            <p className="font-medium text-theme">{g.assignmentName}</p>
                            <p className="text-xs text-theme-muted">
                              {new Date(g.gradedAt).toLocaleDateString()}
                            </p>
                          </div>
                          <Badge variant="default">
                            {value}/{max}
                          </Badge>
                        </div>
                        <Progress value={pct} className="mt-2 h-2" />
                      </li>
                    );
                  })}
                  {grades.length === 0 && (
                    <li className="py-6 text-center text-sm text-theme-muted">
                      No grades yet.
                    </li>
                  )}
                </ul>
              </CardContent>
            </Card>
          )}
        </div>
      </DashboardShell>
    </RouteGuard>
  );
}
