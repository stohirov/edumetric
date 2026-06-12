"use client";

import { DashboardShell } from "@/components/layout/dashboard-shell";
import { Header } from "@/components/layout/header";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  EmptyState,
  ErrorState,
  LoadingState,
} from "@/components/dashboard/data-states";
import { RouteGuard } from "@/components/auth/route-guard";
import { useAuth } from "@/components/providers/auth-provider";
import { useT } from "@/components/providers/locale-provider";
import { useAsync } from "@/lib/use-async";
import { syllabusApi, ApiError } from "@/lib/api";

export default function StudentSyllabusPage() {
  const { user } = useAuth();
  const t = useT();

  const query = useAsync(() => syllabusApi.getMySyllabus(), [user?.id]);

  const syllabus = query.data;
  const notFound = query.error instanceof ApiError && query.error.status === 404;

  return (
    <RouteGuard allow={["STUDENT"]}>
      <DashboardShell
        role="student"
        userName={user?.fullName ?? ""}
        userEmail={user?.email ?? ""}
      >
        <Header
          title={t.nav.syllabus}
          description="Objectives and outline for your course."
        />
        <div className="p-8">
          {query.loading ? (
            <LoadingState />
          ) : notFound ? (
            <EmptyState
              title="No syllabus published yet"
              message="Your teacher hasn’t published a syllabus for your course."
            />
          ) : query.error ? (
            <ErrorState
              message={query.error.message}
              onRetry={query.reload}
            />
          ) : syllabus ? (
            <div className="space-y-6">
              <h2 className="text-lg font-semibold text-theme">
                {syllabus.courseName}
              </h2>
              <Card>
                <CardHeader>
                  <CardTitle>Objectives</CardTitle>
                </CardHeader>
                <CardContent>
                  {syllabus.objectives ? (
                    <p className="whitespace-pre-wrap text-sm text-theme">
                      {syllabus.objectives}
                    </p>
                  ) : (
                    <p className="text-sm text-theme-muted">
                      No objectives provided.
                    </p>
                  )}
                </CardContent>
              </Card>
              <Card>
                <CardHeader>
                  <CardTitle>Outline</CardTitle>
                </CardHeader>
                <CardContent>
                  {syllabus.outline ? (
                    <p className="whitespace-pre-wrap font-mono text-sm text-theme">
                      {syllabus.outline}
                    </p>
                  ) : (
                    <p className="text-sm text-theme-muted">
                      No outline provided.
                    </p>
                  )}
                </CardContent>
              </Card>
            </div>
          ) : (
            <EmptyState title="No syllabus published yet" />
          )}
        </div>
      </DashboardShell>
    </RouteGuard>
  );
}
