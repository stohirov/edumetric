"use client";

import Link from "next/link";
import { DashboardShell } from "@/components/layout/dashboard-shell";
import { Header } from "@/components/layout/header";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { ErrorState, LoadingState } from "@/components/dashboard/data-states";
import { RouteGuard } from "@/components/auth/route-guard";
import { useAuth } from "@/components/providers/auth-provider";
import { useT } from "@/components/providers/locale-provider";
import { useAsync } from "@/lib/use-async";
import { teachersApi } from "@/lib/api";

export default function TeacherGroupsPage() {
  const { user } = useAuth();
  const t = useT();
  const query = useAsync(() => teachersApi.listMyGroups(), [user?.id]);

  return (
    <RouteGuard allow={["TEACHER", "ADMIN"]}>
      <DashboardShell
        role="teacher"
        userName={user?.fullName ?? ""}
        userEmail={user?.email ?? ""}
      >
        <Header
          title={t.pages.teacherGroups.title}
          description={t.pages.teacherGroups.desc}
        />
        <div className="p-8">
          {query.loading ? (
            <LoadingState />
          ) : query.error ? (
            <ErrorState message={query.error.message} onRetry={query.reload} />
          ) : (
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {(query.data ?? []).map((g) => (
                <Card key={g.id} interactive>
                  <CardHeader>
                    <CardTitle>{g.name}</CardTitle>
                    <CardDescription>{g.courseName}</CardDescription>
                  </CardHeader>
                  <CardContent className="text-sm text-theme-muted">
                    <div className="flex justify-between">
                      <span>Starts</span>
                      <span className="tabular-nums">{g.startDate ?? "—"}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Ends</span>
                      <span className="tabular-nums">{g.endDate ?? "—"}</span>
                    </div>
                    <Link
                      href={`/teacher/students?group=${g.id}`}
                      className="mt-3 inline-block text-indigo-600 hover:underline"
                    >
                      View students →
                    </Link>
                  </CardContent>
                </Card>
              ))}
              {(query.data ?? []).length === 0 && (
                <p className="text-sm text-theme-muted">
                  No groups assigned yet.
                </p>
              )}
            </div>
          )}
        </div>
      </DashboardShell>
    </RouteGuard>
  );
}
