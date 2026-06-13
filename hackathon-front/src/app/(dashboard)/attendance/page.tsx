"use client";

import { DashboardShell } from "@/components/layout/dashboard-shell";
import { Header } from "@/components/layout/header";
import { Card, CardContent } from "@/components/ui/card";
import { ErrorState, LoadingState } from "@/components/dashboard/data-states";
import { RouteGuard } from "@/components/auth/route-guard";
import { useAuth } from "@/components/providers/auth-provider";
import { useT } from "@/components/providers/locale-provider";
import { useAsync } from "@/lib/use-async";
import { analyticsApi } from "@/lib/api";

export default function AttendancePage() {
  const { user } = useAuth();
  const tt = useT().pages.attendanceAdmin;

  const query = useAsync(
    () => analyticsApi.getAdminDashboard(),
    [user?.id],
  );

  const k = query.data?.kpis;

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
            <div className="grid gap-4 sm:grid-cols-4">
              {[
                { label: tt.students, value: k?.studentCount ?? 0, color: "bg-indigo-500" },
                { label: tt.groups, value: k?.groupCount ?? 0, color: "bg-emerald-500" },
                { label: tt.teachers, value: k?.teacherCount ?? 0, color: "bg-violet-500" },
                { label: tt.atRisk, value: k?.atRiskCount ?? 0, color: "bg-amber-500" },
              ].map((stat) => (
                <Card key={stat.label}>
                  <CardContent className="flex items-center gap-4 p-4">
                    <div className={`h-3 w-3 rounded-full ${stat.color}`} />
                    <div>
                      <p className="text-xs font-medium text-theme-muted">{stat.label}</p>
                      <p className="text-xl font-semibold tabular-nums text-theme">
                        {stat.value.toLocaleString()}
                      </p>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </div>
      </DashboardShell>
    </RouteGuard>
  );
}
