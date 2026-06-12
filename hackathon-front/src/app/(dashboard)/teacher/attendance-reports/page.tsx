"use client";

import { useState } from "react";
import { DashboardShell } from "@/components/layout/dashboard-shell";
import { Header } from "@/components/layout/header";
import {
  ErrorState,
  LoadingState,
  EmptyState,
} from "@/components/dashboard/data-states";
import { RouteGuard } from "@/components/auth/route-guard";
import { Badge } from "@/components/ui/badge";
import { Label } from "@/components/ui/label";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
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
import { attendanceApi, groupsApi, studentsApi } from "@/lib/api";
import type {
  AttendanceReportDto,
  GroupAttendanceReportDto,
} from "@/types/api";

function fmtPercent(v: number | null): string {
  return v === null ? "—" : `${v}%`;
}

function StudentRow({ r }: { r: AttendanceReportDto }) {
  return (
    <tr className="border-b border-theme/60 last:border-0">
      <td className="py-2 pr-4 text-theme">{r.studentName}</td>
      <td className="py-2 pr-4 text-theme">{r.present}</td>
      <td className="py-2 pr-4 text-theme">{r.late}</td>
      <td className="py-2 pr-4 text-theme">{r.absent}</td>
      <td className="py-2 pr-4 text-theme">{r.excused}</td>
      <td className="py-2 pr-4 text-theme">{fmtPercent(r.attendancePercent)}</td>
      <td className="py-2 pr-4">
        {r.atRisk ? <Badge variant="destructive">At risk</Badge> : null}
      </td>
    </tr>
  );
}

function GroupReportTable({ report }: { report: GroupAttendanceReportDto }) {
  return (
    <div className="space-y-4">
      <p className="text-sm text-theme-muted">
        Group average attendance:{" "}
        <span className="font-semibold text-theme">
          {fmtPercent(report.groupAveragePercent)}
        </span>
      </p>
      {report.students.length === 0 ? (
        <EmptyState
          title="No students"
          message="This group has no students with attendance records."
        />
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-theme text-left text-theme-muted">
                <th className="py-2 pr-4 font-medium">Student</th>
                <th className="py-2 pr-4 font-medium">Present</th>
                <th className="py-2 pr-4 font-medium">Late</th>
                <th className="py-2 pr-4 font-medium">Absent</th>
                <th className="py-2 pr-4 font-medium">Excused</th>
                <th className="py-2 pr-4 font-medium">Attendance</th>
                <th className="py-2 pr-4 font-medium">Status</th>
              </tr>
            </thead>
            <tbody>
              {report.students.map((r) => (
                <StudentRow key={r.studentId} r={r} />
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

function Kpi({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-xl border border-theme p-4">
      <p className="text-xs uppercase tracking-wide text-theme-muted">{label}</p>
      <p className="mt-1 text-2xl font-semibold text-theme">{value}</p>
    </div>
  );
}

function StudentReportCards({ report }: { report: AttendanceReportDto }) {
  return (
    <div className="space-y-4">
      <div className="flex items-center gap-3">
        <p className="text-sm text-theme-muted">{report.studentName}</p>
        {report.atRisk ? <Badge variant="destructive">At risk</Badge> : null}
      </div>
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <Kpi label="Attendance" value={fmtPercent(report.attendancePercent)} />
        <Kpi label="Present" value={String(report.present)} />
        <Kpi label="Absent" value={String(report.absent)} />
        <Kpi label="Excused" value={String(report.excused)} />
      </div>
    </div>
  );
}

export default function TeacherAttendanceReportsPage() {
  const { user } = useAuth();
  const t = useT();

  const groupsQuery = useAsync(
    () => groupsApi.listGroups({ page: 0, size: 200 }),
    [user?.id],
  );
  const studentsQuery = useAsync(
    () => studentsApi.listStudents({ page: 0, size: 200 }),
    [user?.id],
  );

  const groups = groupsQuery.data?.items ?? [];
  const students = studentsQuery.data?.items ?? [];

  const [groupId, setGroupId] = useState<number | null>(null);
  const groupReportQuery = useAsync(
    () =>
      groupId === null
        ? Promise.resolve<GroupAttendanceReportDto | null>(null)
        : attendanceApi.groupReport(groupId),
    [groupId],
  );

  const [studentId, setStudentId] = useState<number | null>(null);
  const studentReportQuery = useAsync(
    () =>
      studentId === null
        ? Promise.resolve<AttendanceReportDto | null>(null)
        : attendanceApi.studentReport(studentId),
    [studentId],
  );

  return (
    <RouteGuard allow={["TEACHER", "ADMIN"]}>
      <DashboardShell
        role="teacher"
        userName={user?.fullName ?? ""}
        userEmail={user?.email ?? ""}
      >
        <Header
          title={t.nav.attendanceReports}
          description="Review attendance by group or for an individual student."
        />
        <div className="space-y-6 p-8">
          <Card>
            <CardHeader>
              <CardTitle>Group report</CardTitle>
              <CardDescription>
                See average attendance and per-student breakdown for a group.
              </CardDescription>
            </CardHeader>
            <CardContent>
              {groupsQuery.loading ? (
                <LoadingState />
              ) : groupsQuery.error ? (
                <ErrorState
                  message={groupsQuery.error.message}
                  onRetry={groupsQuery.reload}
                />
              ) : (
                <div className="space-y-4">
                  <div className="max-w-sm space-y-2">
                    <Label htmlFor="report-group">Group</Label>
                    <Select
                      value={groupId === null ? undefined : String(groupId)}
                      onValueChange={(v) => setGroupId(Number(v))}
                    >
                      <SelectTrigger id="report-group">
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
                  {groupId !== null &&
                    (groupReportQuery.loading ? (
                      <LoadingState />
                    ) : groupReportQuery.error ? (
                      <ErrorState
                        message={groupReportQuery.error.message}
                        onRetry={groupReportQuery.reload}
                      />
                    ) : groupReportQuery.data ? (
                      <GroupReportTable report={groupReportQuery.data} />
                    ) : null)}
                </div>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Student report</CardTitle>
              <CardDescription>
                Drill into a single student&apos;s attendance summary.
              </CardDescription>
            </CardHeader>
            <CardContent>
              {studentsQuery.loading ? (
                <LoadingState />
              ) : studentsQuery.error ? (
                <ErrorState
                  message={studentsQuery.error.message}
                  onRetry={studentsQuery.reload}
                />
              ) : (
                <div className="space-y-4">
                  <div className="max-w-sm space-y-2">
                    <Label htmlFor="report-student">Student</Label>
                    <Select
                      value={studentId === null ? undefined : String(studentId)}
                      onValueChange={(v) => setStudentId(Number(v))}
                    >
                      <SelectTrigger id="report-student">
                        <SelectValue placeholder="Select a student" />
                      </SelectTrigger>
                      <SelectContent>
                        {students.map((s) => (
                          <SelectItem key={s.id} value={String(s.id)}>
                            {s.fullName}
                            {s.groupName ? ` — ${s.groupName}` : ""}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  {studentId !== null &&
                    (studentReportQuery.loading ? (
                      <LoadingState />
                    ) : studentReportQuery.error ? (
                      <ErrorState
                        message={studentReportQuery.error.message}
                        onRetry={studentReportQuery.reload}
                      />
                    ) : studentReportQuery.data ? (
                      <StudentReportCards report={studentReportQuery.data} />
                    ) : null)}
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </DashboardShell>
    </RouteGuard>
  );
}
