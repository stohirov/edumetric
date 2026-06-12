"use client";

import { useState } from "react";
import { Check, Info, X } from "lucide-react";
import { DashboardShell } from "@/components/layout/dashboard-shell";
import { Header } from "@/components/layout/header";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { EmptyState, ErrorState, LoadingState } from "@/components/dashboard/data-states";
import { RouteGuard } from "@/components/auth/route-guard";
import { useAuth } from "@/components/providers/auth-provider";
import { useT } from "@/components/providers/locale-provider";
import { useAsync } from "@/lib/use-async";
import { attendanceApi, ApiError } from "@/lib/api";

function errorMessage(e: unknown): string {
  return e instanceof ApiError
    ? (e.details?.join(", ") ?? e.message)
    : e instanceof Error
      ? e.message
      : "Something went wrong";
}

function formatDate(iso: string | null): string {
  if (!iso) return "—";
  const d = new Date(iso);
  return Number.isNaN(d.getTime()) ? iso : d.toLocaleDateString();
}

export default function TeacherJustificationsPage() {
  const { user } = useAuth();
  const t = useT();

  const pending = useAsync(
    () => attendanceApi.pendingJustifications(),
    [user?.id],
  );

  const [busyId, setBusyId] = useState<number | null>(null);
  const [actionError, setActionError] = useState<string | null>(null);

  async function decide(id: number, action: "approve" | "reject") {
    setBusyId(id);
    setActionError(null);
    try {
      if (action === "approve") {
        await attendanceApi.approveJustification(id);
      } else {
        await attendanceApi.rejectJustification(id);
      }
      pending.reload();
    } catch (err) {
      setActionError(errorMessage(err));
    } finally {
      setBusyId(null);
    }
  }

  return (
    <RouteGuard allow={["TEACHER", "ADMIN"]}>
      <DashboardShell
        role="teacher"
        userName={user?.fullName ?? ""}
        userEmail={user?.email ?? ""}
      >
        <Header
          title={t.nav.justifications}
          description="Review pending absence excuses from your students."
        />
        <div className="space-y-6 p-8">
          <div className="flex items-start gap-2 rounded-xl border border-indigo-200/60 bg-indigo-50/40 p-3 text-sm text-indigo-800">
            <Info className="mt-0.5 h-4 w-4 shrink-0" />
            <p>
              Approving an excuse marks the student&apos;s absence for that
              lesson as <span className="font-semibold">excused</span>.
            </p>
          </div>

          <Card>
            <CardHeader>
              <CardTitle>Pending excuses</CardTitle>
              <CardDescription>
                Each request is waiting for your decision.
              </CardDescription>
            </CardHeader>
            <CardContent>
              {actionError && (
                <p className="mb-3 text-sm text-red-600">{actionError}</p>
              )}
              {pending.loading ? (
                <LoadingState />
              ) : pending.error ? (
                <ErrorState
                  message={pending.error.message}
                  onRetry={pending.reload}
                />
              ) : (pending.data ?? []).length === 0 ? (
                <EmptyState
                  title="No pending excuses"
                  message="You're all caught up."
                />
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="border-b border-theme text-left text-xs font-medium text-theme-muted">
                        <th className="px-3 py-2">Student</th>
                        <th className="px-3 py-2">Course</th>
                        <th className="px-3 py-2">Lesson</th>
                        <th className="px-3 py-2">Reason</th>
                        <th className="px-3 py-2">Submitted</th>
                        <th className="px-3 py-2 text-right">Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {(pending.data ?? []).map((j) => (
                        <tr
                          key={j.id}
                          className="border-b border-theme/60 last:border-0"
                        >
                          <td className="px-3 py-3 font-medium text-theme">
                            {j.studentName}
                          </td>
                          <td className="px-3 py-3 text-theme-muted">
                            {j.courseName}
                          </td>
                          <td className="px-3 py-3 text-theme-muted">
                            {j.lessonTopic}
                          </td>
                          <td className="max-w-xs px-3 py-3 text-theme-muted">
                            {j.reason}
                          </td>
                          <td className="px-3 py-3 text-theme-muted">
                            {formatDate(j.createdAt)}
                          </td>
                          <td className="px-3 py-3">
                            <div className="flex justify-end gap-2">
                              <Button
                                size="sm"
                                variant="secondary"
                                disabled={busyId === j.id}
                                onClick={() => decide(j.id, "approve")}
                              >
                                <Check className="h-4 w-4" />
                                Approve
                              </Button>
                              <Button
                                size="sm"
                                variant="destructive"
                                disabled={busyId === j.id}
                                onClick={() => decide(j.id, "reject")}
                              >
                                <X className="h-4 w-4" />
                                Reject
                              </Button>
                            </div>
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
