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
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
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
import { gradebookApi, gradingApi, ApiError } from "@/lib/api";
import type { AppealStatus } from "@/types/api";

function errorMessage(e: unknown): string {
  return e instanceof ApiError
    ? (e.details?.join(", ") ?? e.message)
    : e instanceof Error
      ? e.message
      : "Something went wrong";
}

const STATUS_VARIANT: Record<
  AppealStatus,
  "secondary" | "success" | "destructive"
> = {
  PENDING: "secondary",
  RESOLVED: "success",
  REJECTED: "destructive",
};

export default function StudentAppealsPage() {
  const { user } = useAuth();
  const t = useT();

  const gradesQuery = useAsync(
    () => gradebookApi.getMyCourseGrades(),
    [user?.id],
  );
  const appealsQuery = useAsync(() => gradingApi.myAppeals(), [user?.id]);

  const [assignmentId, setAssignmentId] = useState("");
  const [reason, setReason] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);

  const assignments = gradesQuery.data?.items ?? [];

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setFormError(null);
    if (!assignmentId || !reason.trim()) {
      setFormError("Select an assignment and provide a reason.");
      return;
    }
    setSubmitting(true);
    try {
      await gradingApi.openAppeal({
        assignmentId: Number(assignmentId),
        reason: reason.trim(),
      });
      setAssignmentId("");
      setReason("");
      appealsQuery.reload();
    } catch (err) {
      setFormError(errorMessage(err));
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <RouteGuard allow={["STUDENT"]}>
      <DashboardShell
        role="student"
        userName={user?.fullName ?? ""}
        userEmail={user?.email ?? ""}
      >
        <Header
          title={t.nav.appeals}
          description="Request a regrade and track the status of your appeals."
        />
        <div className="space-y-6 p-8">
          <Card>
            <CardHeader>
              <CardTitle>Request a regrade</CardTitle>
              <CardDescription>
                Choose an assignment and explain why you believe the grade
                should be reviewed.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="appeal-assignment">Assignment</Label>
                  <Select
                    value={assignmentId}
                    onValueChange={setAssignmentId}
                    disabled={gradesQuery.loading}
                  >
                    <SelectTrigger id="appeal-assignment">
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
                <div className="space-y-2">
                  <Label htmlFor="appeal-reason">Reason</Label>
                  <textarea
                    id="appeal-reason"
                    value={reason}
                    onChange={(e) => setReason(e.target.value)}
                    rows={4}
                    placeholder="Explain why you'd like this grade reviewed…"
                    className="flex w-full rounded-[10px] border border-theme bg-theme-input px-3.5 py-2 text-sm text-theme shadow-[var(--shadow-xs)] transition-all duration-200 placeholder:text-theme-muted focus-visible:outline-none focus-visible:border-[var(--ring)] focus-visible:ring-[3px] focus-visible:ring-[var(--ring)]/20 disabled:cursor-not-allowed disabled:opacity-50"
                  />
                </div>
                {formError && (
                  <p className="text-sm text-red-600">{formError}</p>
                )}
                <Button type="submit" disabled={submitting}>
                  {submitting ? "Submitting…" : "Submit appeal"}
                </Button>
              </form>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>My appeals</CardTitle>
              <CardDescription>
                The status and outcome of every appeal you've submitted.
              </CardDescription>
            </CardHeader>
            <CardContent>
              {appealsQuery.loading ? (
                <LoadingState />
              ) : appealsQuery.error ? (
                <ErrorState
                  message={appealsQuery.error.message}
                  onRetry={appealsQuery.reload}
                />
              ) : (appealsQuery.data ?? []).length === 0 ? (
                <EmptyState
                  title="No appeals yet"
                  message="Submit a regrade request above to get started."
                />
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="border-b border-theme text-left text-theme-muted">
                        <th className="py-2 pr-4 font-medium">Assignment</th>
                        <th className="py-2 pr-4 font-medium">Status</th>
                        <th className="py-2 pr-4 font-medium">Reason</th>
                        <th className="py-2 pr-4 font-medium">Resolution</th>
                        <th className="py-2 pr-4 font-medium">Created</th>
                      </tr>
                    </thead>
                    <tbody>
                      {(appealsQuery.data ?? []).map((appeal) => (
                        <tr
                          key={appeal.id}
                          className="border-b border-theme/60 align-top"
                        >
                          <td className="py-2.5 pr-4 text-theme">
                            {appeal.assignmentName}
                            <div className="text-xs text-theme-muted">
                              {appeal.courseName}
                            </div>
                          </td>
                          <td className="py-2.5 pr-4">
                            <Badge variant={STATUS_VARIANT[appeal.status]}>
                              {appeal.status}
                            </Badge>
                          </td>
                          <td className="py-2.5 pr-4 text-theme-muted">
                            {appeal.reason}
                          </td>
                          <td className="py-2.5 pr-4 text-theme-muted">
                            {appeal.resolution ?? "—"}
                          </td>
                          <td className="py-2.5 pr-4 text-theme-muted">
                            {new Date(appeal.createdAt).toLocaleDateString()}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </DashboardShell>
    </RouteGuard>
  );
}
