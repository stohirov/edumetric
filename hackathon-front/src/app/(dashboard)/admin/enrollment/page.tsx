"use client";

import { useMemo, useState } from "react";
import { DashboardShell } from "@/components/layout/dashboard-shell";
import { Header } from "@/components/layout/header";
import { RouteGuard } from "@/components/auth/route-guard";
import {
  EmptyState,
  ErrorState,
  LoadingState,
} from "@/components/dashboard/data-states";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
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
import { ApiError, enrollmentApi, groupsApi, studentsApi } from "@/lib/api";
import type { EnrollmentStatus } from "@/types/api";

function errorMessage(e: unknown): string {
  return e instanceof ApiError
    ? (e.details?.join(", ") ?? e.message)
    : e instanceof Error
      ? e.message
      : "Something went wrong";
}

const STATUS_VARIANT: Record<
  EnrollmentStatus,
  "success" | "destructive" | "secondary" | "default"
> = {
  ACTIVE: "success",
  WITHDRAWN: "destructive",
  TRANSFERRED: "secondary",
  COMPLETED: "default",
};

export default function AdminEnrollmentPage() {
  const { user } = useAuth();
  const t = useT();

  const studentsQuery = useAsync(
    () => studentsApi.listStudents({ page: 0, size: 200 }),
    [user?.id],
  );
  const groupsQuery = useAsync(
    () => groupsApi.listGroups({ page: 0, size: 200 }),
    [user?.id],
  );

  const [selectedStudentId, setSelectedStudentId] = useState<number | null>(
    null,
  );
  const [enrollGroupId, setEnrollGroupId] = useState<string>("");
  const [enrollReason, setEnrollReason] = useState("");
  const [transferGroupId, setTransferGroupId] = useState<string>("");
  const [transferReason, setTransferReason] = useState("");
  const [withdrawReason, setWithdrawReason] = useState("");

  const [submitting, setSubmitting] = useState(false);
  const [actionError, setActionError] = useState<string | null>(null);
  const [actionMessage, setActionMessage] = useState<string | null>(null);

  const students = useMemo(
    () => studentsQuery.data?.items ?? [],
    [studentsQuery.data],
  );
  const groups = useMemo(
    () => groupsQuery.data?.items ?? [],
    [groupsQuery.data],
  );

  const selectedStudent = useMemo(
    () => students.find((s) => s.id === selectedStudentId) ?? null,
    [students, selectedStudentId],
  );

  const historyQuery = useAsync(
    () =>
      selectedStudentId === null
        ? Promise.resolve([])
        : enrollmentApi.history(selectedStudentId),
    [selectedStudentId],
  );

  async function runAction(action: () => Promise<unknown>) {
    if (selectedStudentId === null) return;
    setSubmitting(true);
    setActionError(null);
    setActionMessage(null);
    try {
      await action();
      setActionMessage("Done.");
      setEnrollGroupId("");
      setEnrollReason("");
      setTransferGroupId("");
      setTransferReason("");
      setWithdrawReason("");
      historyQuery.reload();
      studentsQuery.reload();
    } catch (e) {
      setActionError(errorMessage(e));
    } finally {
      setSubmitting(false);
    }
  }

  function handleEnroll() {
    if (selectedStudentId === null || !enrollGroupId) return;
    void runAction(() =>
      enrollmentApi.enroll({
        studentId: selectedStudentId,
        groupId: Number(enrollGroupId),
        reason: enrollReason.trim() || undefined,
      }),
    );
  }

  function handleTransfer() {
    if (selectedStudentId === null || !transferGroupId) return;
    void runAction(() =>
      enrollmentApi.transfer({
        studentId: selectedStudentId,
        groupId: Number(transferGroupId),
        reason: transferReason.trim() || undefined,
      }),
    );
  }

  function handleWithdraw() {
    if (selectedStudentId === null) return;
    void runAction(() =>
      enrollmentApi.withdraw({
        studentId: selectedStudentId,
        reason: withdrawReason.trim() || undefined,
      }),
    );
  }

  const initialLoading = studentsQuery.loading || groupsQuery.loading;
  const loadError = studentsQuery.error ?? groupsQuery.error;

  return (
    <RouteGuard allow={["ADMIN"]}>
      <DashboardShell
        role="admin"
        userName={user?.fullName ?? ""}
        userEmail={user?.email ?? ""}
      >
        <Header
          title={t.nav.enrollment}
          description="Enroll, transfer or withdraw a student between groups."
        />
        <div className="space-y-6 p-8">
          {initialLoading ? (
            <LoadingState />
          ) : loadError ? (
            <ErrorState
              message={loadError.message}
              onRetry={() => {
                studentsQuery.reload();
                groupsQuery.reload();
              }}
            />
          ) : (
            <>
              <Card>
                <CardHeader>
                  <CardTitle>Manage enrollment</CardTitle>
                  <CardDescription>
                    Pick a student, then enroll, transfer or withdraw them.
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="grid gap-2 sm:max-w-md">
                    <Label htmlFor="student">Student</Label>
                    <Select
                      value={
                        selectedStudentId === null
                          ? ""
                          : String(selectedStudentId)
                      }
                      onValueChange={(v) => {
                        setSelectedStudentId(v ? Number(v) : null);
                        setActionError(null);
                        setActionMessage(null);
                      }}
                    >
                      <SelectTrigger id="student">
                        <SelectValue placeholder="Select a student" />
                      </SelectTrigger>
                      <SelectContent>
                        {students.map((s) => (
                          <SelectItem key={s.id} value={String(s.id)}>
                            {s.fullName}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  {selectedStudent && (
                    <>
                      <div className="flex items-center gap-2 text-sm text-theme-muted">
                        <span>Current group:</span>
                        {selectedStudent.groupName ? (
                          <Badge variant="secondary">
                            {selectedStudent.groupName}
                          </Badge>
                        ) : (
                          <span className="italic">No active group</span>
                        )}
                      </div>

                      {actionError && (
                        <p className="text-sm text-red-600">{actionError}</p>
                      )}
                      {actionMessage && (
                        <p className="text-sm text-emerald-600">
                          {actionMessage}
                        </p>
                      )}

                      <div className="grid gap-4 lg:grid-cols-3">
                        {/* Enroll */}
                        <div className="space-y-3 rounded-xl border border-theme p-4">
                          <h4 className="text-sm font-semibold text-theme">
                            Enroll
                          </h4>
                          <p className="text-[13px] text-theme-muted">
                            Place the student into a group.
                          </p>
                          <div className="grid gap-2">
                            <Label htmlFor="enroll-group">Group</Label>
                            <Select
                              value={enrollGroupId}
                              onValueChange={setEnrollGroupId}
                            >
                              <SelectTrigger id="enroll-group">
                                <SelectValue placeholder="Select a group" />
                              </SelectTrigger>
                              <SelectContent>
                                {groups.map((g) => (
                                  <SelectItem key={g.id} value={String(g.id)}>
                                    {g.name}
                                  </SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                          </div>
                          <div className="grid gap-2">
                            <Label htmlFor="enroll-reason">
                              Reason (optional)
                            </Label>
                            <Input
                              id="enroll-reason"
                              value={enrollReason}
                              onChange={(e) => setEnrollReason(e.target.value)}
                              placeholder="Reason"
                            />
                          </div>
                          <Button
                            size="sm"
                            disabled={submitting || !enrollGroupId}
                            onClick={handleEnroll}
                          >
                            Enroll
                          </Button>
                        </div>

                        {/* Transfer */}
                        <div className="space-y-3 rounded-xl border border-theme p-4">
                          <h4 className="text-sm font-semibold text-theme">
                            Transfer
                          </h4>
                          <p className="text-[13px] text-theme-muted">
                            Move the student to a different group.
                          </p>
                          <div className="grid gap-2">
                            <Label htmlFor="transfer-group">New group</Label>
                            <Select
                              value={transferGroupId}
                              onValueChange={setTransferGroupId}
                            >
                              <SelectTrigger id="transfer-group">
                                <SelectValue placeholder="Select a group" />
                              </SelectTrigger>
                              <SelectContent>
                                {groups.map((g) => (
                                  <SelectItem key={g.id} value={String(g.id)}>
                                    {g.name}
                                  </SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                          </div>
                          <div className="grid gap-2">
                            <Label htmlFor="transfer-reason">
                              Reason (optional)
                            </Label>
                            <Input
                              id="transfer-reason"
                              value={transferReason}
                              onChange={(e) =>
                                setTransferReason(e.target.value)
                              }
                              placeholder="Reason"
                            />
                          </div>
                          <Button
                            size="sm"
                            variant="secondary"
                            disabled={submitting || !transferGroupId}
                            onClick={handleTransfer}
                          >
                            Transfer
                          </Button>
                        </div>

                        {/* Withdraw */}
                        <div className="space-y-3 rounded-xl border border-theme p-4">
                          <h4 className="text-sm font-semibold text-theme">
                            Withdraw
                          </h4>
                          <p className="text-[13px] text-theme-muted">
                            Remove the student from their current group.
                          </p>
                          <div className="grid gap-2">
                            <Label htmlFor="withdraw-reason">
                              Reason (optional)
                            </Label>
                            <Input
                              id="withdraw-reason"
                              value={withdrawReason}
                              onChange={(e) =>
                                setWithdrawReason(e.target.value)
                              }
                              placeholder="Reason"
                            />
                          </div>
                          <Button
                            size="sm"
                            variant="destructive"
                            disabled={submitting}
                            onClick={handleWithdraw}
                          >
                            Withdraw
                          </Button>
                        </div>
                      </div>
                    </>
                  )}
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Enrollment history</CardTitle>
                  <CardDescription>
                    Past and present group memberships for the selected student.
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  {selectedStudentId === null ? (
                    <EmptyState
                      title="No student selected"
                      message="Select a student to view their enrollment history."
                    />
                  ) : historyQuery.loading ? (
                    <LoadingState />
                  ) : historyQuery.error ? (
                    <ErrorState
                      message={historyQuery.error.message}
                      onRetry={historyQuery.reload}
                    />
                  ) : (historyQuery.data?.length ?? 0) === 0 ? (
                    <EmptyState
                      title="No history"
                      message="This student has no enrollment records yet."
                    />
                  ) : (
                    <div className="overflow-x-auto">
                      <table className="w-full text-sm">
                        <thead>
                          <tr className="border-b border-theme text-left text-theme-muted">
                            <th className="px-3 py-2 font-medium">Group</th>
                            <th className="px-3 py-2 font-medium">Status</th>
                            <th className="px-3 py-2 font-medium">Enrolled</th>
                            <th className="px-3 py-2 font-medium">Ended</th>
                            <th className="px-3 py-2 font-medium">Reason</th>
                          </tr>
                        </thead>
                        <tbody>
                          {(historyQuery.data ?? []).map((row) => (
                            <tr
                              key={row.id}
                              className="border-b border-theme/60 last:border-0"
                            >
                              <td className="px-3 py-2 text-theme">
                                {row.groupName}
                              </td>
                              <td className="px-3 py-2">
                                <Badge variant={STATUS_VARIANT[row.status]}>
                                  {row.status}
                                </Badge>
                              </td>
                              <td className="px-3 py-2 text-theme-muted">
                                {row.enrolledAt}
                              </td>
                              <td className="px-3 py-2 text-theme-muted">
                                {row.endedAt ?? "—"}
                              </td>
                              <td className="px-3 py-2 text-theme-muted">
                                {row.reason ?? "—"}
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
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
