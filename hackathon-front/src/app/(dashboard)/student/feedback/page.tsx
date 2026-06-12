"use client";

import { useState } from "react";
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
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useAuth } from "@/components/providers/auth-provider";
import { useT } from "@/components/providers/locale-provider";
import { useAsync } from "@/lib/use-async";
import { gradebookApi, gradingApi } from "@/lib/api";

export default function StudentFeedbackPage() {
  const { user } = useAuth();
  const t = useT();

  const [assignmentId, setAssignmentId] = useState("");

  const gradesQuery = useAsync(
    () => gradebookApi.getMyCourseGrades(),
    [user?.id],
  );
  const feedbackQuery = useAsync(
    () =>
      assignmentId
        ? gradingApi.myFeedback(Number(assignmentId))
        : Promise.resolve([]),
    [assignmentId],
  );

  const assignments = gradesQuery.data?.items ?? [];

  return (
    <RouteGuard allow={["STUDENT"]}>
      <DashboardShell
        role="student"
        userName={user?.fullName ?? ""}
        userEmail={user?.email ?? ""}
      >
        <Header
          title={t.nav.feedback}
          description="Read the feedback your teachers left on your assignments."
        />
        <div className="space-y-6 p-8">
          <Card>
            <CardHeader>
              <CardTitle>My feedback</CardTitle>
              <CardDescription>
                Select an assignment to view its feedback.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2 sm:max-w-sm">
                <Label htmlFor="fb-assignment">Assignment</Label>
                <Select
                  value={assignmentId}
                  onValueChange={setAssignmentId}
                  disabled={gradesQuery.loading}
                >
                  <SelectTrigger id="fb-assignment">
                    <SelectValue placeholder="Select an assignment" />
                  </SelectTrigger>
                  <SelectContent>
                    {assignments.map((a) => (
                      <SelectItem
                        key={a.assignmentId}
                        value={String(a.assignmentId)}
                      >
                        {a.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {!assignmentId ? (
                <EmptyState
                  title="Select an assignment"
                  message="Choose an assignment above to view feedback."
                />
              ) : feedbackQuery.loading ? (
                <LoadingState />
              ) : feedbackQuery.error ? (
                <ErrorState
                  message={feedbackQuery.error.message}
                  onRetry={feedbackQuery.reload}
                />
              ) : (feedbackQuery.data ?? []).length === 0 ? (
                <EmptyState
                  title="No feedback yet"
                  message="There's no feedback for this assignment."
                />
              ) : (
                <ul className="space-y-3">
                  {(feedbackQuery.data ?? []).map((fb) => (
                    <li
                      key={fb.id}
                      className="rounded-xl border border-theme bg-theme-input/40 p-4"
                    >
                      <div className="mb-1 flex items-center justify-between">
                        <span className="text-sm font-medium text-theme">
                          {fb.authorName}
                        </span>
                        <span className="text-xs text-theme-muted">
                          {new Date(fb.createdAt).toLocaleString()}
                        </span>
                      </div>
                      <p className="whitespace-pre-wrap text-sm text-theme-muted">
                        {fb.body}
                      </p>
                    </li>
                  ))}
                </ul>
              )}
            </CardContent>
          </Card>
        </div>
      </DashboardShell>
    </RouteGuard>
  );
}
