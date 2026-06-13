"use client";

import { useMemo, useState } from "react";
import { DashboardShell } from "@/components/layout/dashboard-shell";
import { Header } from "@/components/layout/header";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { ErrorState, LoadingState } from "@/components/dashboard/data-states";
import { RouteGuard } from "@/components/auth/route-guard";
import { SubmissionList } from "@/components/submissions/submission-list";
import { useAuth } from "@/components/providers/auth-provider";
import { useT } from "@/components/providers/locale-provider";
import { useAsync } from "@/lib/use-async";
import { submissionsApi, teachersApi } from "@/lib/api";
import type { SubmissionDto } from "@/types/api/submissions";

interface CourseOption {
  courseId: number;
  courseName: string;
}

export default function TeacherSubmissionsPage() {
  const { user } = useAuth();
  const t = useT();
  const tt = t.pages.submissions;

  const groupsQuery = useAsync(() => teachersApi.listMyGroups(), [user?.id]);

  const courses = useMemo<CourseOption[]>(() => {
    const byId = new Map<number, CourseOption>();
    for (const g of groupsQuery.data ?? []) {
      if (!byId.has(g.courseId)) {
        byId.set(g.courseId, { courseId: g.courseId, courseName: g.courseName });
      }
    }
    return [...byId.values()];
  }, [groupsQuery.data]);

  const [courseId, setCourseId] = useState<number | null>(null);
  const activeCourseId = courseId ?? courses[0]?.courseId ?? null;

  const query = useAsync(
    () =>
      activeCourseId == null
        ? Promise.resolve<SubmissionDto[]>([])
        : submissionsApi.getCourseSubmissions(activeCourseId),
    [activeCourseId],
  );
  const data = query.data;

  return (
    <RouteGuard allow={["TEACHER", "ADMIN"]}>
      <DashboardShell
        role="teacher"
        userName={user?.fullName ?? ""}
        userEmail={user?.email ?? ""}
      >
        <Header title={tt.title} description={tt.descTeacher} />
        <div className="space-y-6 p-8">
          {groupsQuery.loading ? (
            <LoadingState />
          ) : groupsQuery.error ? (
            <ErrorState
              message={groupsQuery.error.message}
              onRetry={groupsQuery.reload}
            />
          ) : courses.length === 0 ? (
            <p className="text-sm text-theme-muted">{tt.noCourses}</p>
          ) : (
            <>
              <div className="w-56">
                <Label className="mb-1.5 block">{tt.course}</Label>
                <Select
                  value={activeCourseId != null ? String(activeCourseId) : ""}
                  onValueChange={(v) => setCourseId(Number(v))}
                >
                  <SelectTrigger>
                    <SelectValue placeholder={tt.selectCourse} />
                  </SelectTrigger>
                  <SelectContent>
                    {courses.map((c) => (
                      <SelectItem key={c.courseId} value={String(c.courseId)}>
                        {c.courseName}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <Card>
                <CardHeader>
                  <CardTitle>{tt.title}</CardTitle>
                  <CardDescription>{tt.descTeacher}</CardDescription>
                </CardHeader>
                <CardContent>
                  {query.loading ? (
                    <LoadingState />
                  ) : query.error ? (
                    <ErrorState
                      message={query.error.message}
                      onRetry={query.reload}
                    />
                  ) : !data || data.length === 0 ? (
                    <p className="py-6 text-center text-sm text-theme-muted">
                      {tt.none}
                    </p>
                  ) : (
                    <SubmissionList items={data} showStudent />
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
