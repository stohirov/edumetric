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
import { ErrorState, LoadingState } from "@/components/dashboard/data-states";
import { RouteGuard } from "@/components/auth/route-guard";
import { SubmissionList } from "@/components/submissions/submission-list";
import { useAuth } from "@/components/providers/auth-provider";
import { useT } from "@/components/providers/locale-provider";
import { useAsync } from "@/lib/use-async";
import { submissionsApi } from "@/lib/api";

export default function StudentSubmissionsPage() {
  const { user } = useAuth();
  const t = useT();
  const tt = t.pages.submissions;

  const query = useAsync(() => submissionsApi.getMySubmissions(), [user?.id]);
  const data = query.data;

  return (
    <RouteGuard allow={["STUDENT"]}>
      <DashboardShell
        role="student"
        userName={user?.fullName ?? ""}
        userEmail={user?.email ?? ""}
      >
        <Header title={tt.title} description={tt.descStudent} />
        <div className="space-y-6 p-8">
          {query.loading ? (
            <LoadingState />
          ) : query.error ? (
            <ErrorState message={query.error.message} onRetry={query.reload} />
          ) : (
            <Card>
              <CardHeader>
                <CardTitle>{tt.title}</CardTitle>
                <CardDescription>{tt.descStudent}</CardDescription>
              </CardHeader>
              <CardContent>
                {!data || data.length === 0 ? (
                  <p className="py-6 text-center text-sm text-theme-muted">
                    {tt.none}
                  </p>
                ) : (
                  <SubmissionList items={data} />
                )}
              </CardContent>
            </Card>
          )}
        </div>
      </DashboardShell>
    </RouteGuard>
  );
}
