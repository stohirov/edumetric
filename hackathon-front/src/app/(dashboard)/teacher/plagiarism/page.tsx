"use client";

import { useMemo, useState } from "react";
import { Plus, Trash2 } from "lucide-react";
import { DashboardShell } from "@/components/layout/dashboard-shell";
import { Header } from "@/components/layout/header";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { ErrorState, LoadingState } from "@/components/dashboard/data-states";
import { RouteGuard } from "@/components/auth/route-guard";
import { useAuth } from "@/components/providers/auth-provider";
import { useT } from "@/components/providers/locale-provider";
import { useAsync } from "@/lib/use-async";
import { assignmentsApi, coursesApi, gradingApi, studentsApi } from "@/lib/api";
import { ApiError } from "@/lib/api";
import type { AssignmentDto, PlagiarismReportDto } from "@/types/api";

function errMsg(e: unknown): string {
  return e instanceof ApiError
    ? (e.details?.join(", ") ?? e.message)
    : e instanceof Error
      ? e.message
      : "Something went wrong";
}

interface SubmissionRow {
  key: string;
  studentId: number | null;
  text: string;
}

let rowSeq = 0;
function newRow(): SubmissionRow {
  rowSeq += 1;
  return { key: `sub-${rowSeq}`, studentId: null, text: "" };
}

export default function TeacherPlagiarismPage() {
  const { user } = useAuth();
  const t = useT();

  const coursesQuery = useAsync(
    () => coursesApi.listCourses({ page: 0, size: 200 }),
    [user?.id],
  );
  const studentsQuery = useAsync(
    () => studentsApi.listStudents({ page: 0, size: 200 }),
    [user?.id],
  );

  const courses = coursesQuery.data?.items ?? [];
  const students = useMemo(
    () => studentsQuery.data?.items ?? [],
    [studentsQuery.data],
  );

  const [courseId, setCourseId] = useState<number | null>(null);
  const [assignmentId, setAssignmentId] = useState<number | null>(null);

  const assignmentsQuery = useAsync<AssignmentDto[]>(
    () =>
      courseId == null
        ? Promise.resolve<AssignmentDto[]>([])
        : assignmentsApi.listByCourse(courseId),
    [courseId],
  );
  const assignments = assignmentsQuery.data ?? [];

  const reportsQuery = useAsync<PlagiarismReportDto[]>(
    () =>
      assignmentId == null
        ? Promise.resolve<PlagiarismReportDto[]>([])
        : gradingApi.listPlagiarism(assignmentId),
    [assignmentId],
  );

  const studentName = useMemo(() => {
    const map = new Map<number, string>();
    for (const s of students) map.set(s.id, s.fullName);
    return map;
  }, [students]);

  // ----- Submission rows -----
  const [rows, setRows] = useState<SubmissionRow[]>([newRow(), newRow()]);
  const [results, setResults] = useState<PlagiarismReportDto[]>([]);
  const [running, setRunning] = useState(false);
  const [runError, setRunError] = useState<string | null>(null);

  const updateRow = (key: string, patch: Partial<SubmissionRow>) => {
    setRows((prev) => prev.map((r) => (r.key === key ? { ...r, ...patch } : r)));
  };
  const removeRow = (key: string) => {
    setRows((prev) => prev.filter((r) => r.key !== key));
  };
  const addRow = () => setRows((prev) => [...prev, newRow()]);

  const runCheck = async () => {
    if (assignmentId == null) return;
    const submissions = rows
      .filter((r) => r.studentId != null && r.text.trim() !== "")
      .map((r) => ({ studentId: r.studentId as number, text: r.text.trim() }));
    if (submissions.length < 2) {
      setRunError("Add at least two submissions with a student and text.");
      return;
    }
    try {
      setRunning(true);
      setRunError(null);
      const reports = await gradingApi.checkPlagiarism({
        assignmentId,
        submissions,
      });
      setResults([...reports].sort((a, b) => b.similarity - a.similarity));
      reportsQuery.reload();
    } catch (e) {
      setRunError(errMsg(e));
    } finally {
      setRunning(false);
    }
  };

  const sortedStored = useMemo(
    () => [...(reportsQuery.data ?? [])].sort((a, b) => b.similarity - a.similarity),
    [reportsQuery.data],
  );

  return (
    <RouteGuard allow={["TEACHER", "ADMIN"]}>
      <DashboardShell
        role="teacher"
        userName={user?.fullName ?? ""}
        userEmail={user?.email ?? ""}
      >
        <Header
          title={t.nav.plagiarism}
          description="Compare student submissions for an assignment to detect overlap."
        />
        <div className="space-y-6 p-8">
          {coursesQuery.loading ? (
            <LoadingState />
          ) : coursesQuery.error ? (
            <ErrorState
              message={coursesQuery.error.message}
              onRetry={coursesQuery.reload}
            />
          ) : (
            <>
              {/* Selectors */}
              <div className="flex flex-wrap items-end gap-4">
                <div className="w-64">
                  <Label className="mb-1.5 block">Course</Label>
                  <Select
                    value={courseId != null ? String(courseId) : ""}
                    onValueChange={(v) => {
                      setCourseId(Number(v));
                      setAssignmentId(null);
                      setResults([]);
                    }}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select a course" />
                    </SelectTrigger>
                    <SelectContent>
                      {courses.map((c) => (
                        <SelectItem key={c.id} value={String(c.id)}>
                          {c.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="w-64">
                  <Label className="mb-1.5 block">Assignment</Label>
                  <Select
                    value={assignmentId != null ? String(assignmentId) : ""}
                    onValueChange={(v) => {
                      setAssignmentId(Number(v));
                      setResults([]);
                      setRunError(null);
                    }}
                    disabled={courseId == null || assignments.length === 0}
                  >
                    <SelectTrigger>
                      <SelectValue
                        placeholder={
                          assignmentsQuery.loading
                            ? "Loading…"
                            : "Select an assignment"
                        }
                      />
                    </SelectTrigger>
                    <SelectContent>
                      {assignments.map((a) => (
                        <SelectItem key={a.id} value={String(a.id)}>
                          {a.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              {assignmentId == null ? (
                <p className="text-sm text-theme-muted">
                  Pick a course and an assignment to run a plagiarism check.
                </p>
              ) : (
                <>
                  {/* Submissions panel */}
                  <Card>
                    <CardHeader>
                      <CardTitle>Submissions</CardTitle>
                      <CardDescription>
                        Paste each student&apos;s text, then run the check.
                      </CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      {rows.map((row) => (
                        <div
                          key={row.key}
                          className="flex flex-col gap-2 rounded-lg border border-slate-200 p-3 sm:flex-row sm:items-start"
                        >
                          <div className="w-full sm:w-56">
                            <Select
                              value={
                                row.studentId != null
                                  ? String(row.studentId)
                                  : ""
                              }
                              onValueChange={(v) =>
                                updateRow(row.key, { studentId: Number(v) })
                              }
                              disabled={studentsQuery.loading}
                            >
                              <SelectTrigger>
                                <SelectValue placeholder="Select a student" />
                              </SelectTrigger>
                              <SelectContent>
                                {students.map((s) => (
                                  <SelectItem key={s.id} value={String(s.id)}>
                                    {s.fullName}
                                    {s.groupName ? ` · ${s.groupName}` : ""}
                                  </SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                          </div>
                          <textarea
                            value={row.text}
                            onChange={(e) =>
                              updateRow(row.key, { text: e.target.value })
                            }
                            placeholder="Submission text…"
                            rows={3}
                            className="flex-1 rounded-md border border-slate-200 bg-white px-3 py-2 text-sm text-theme outline-none focus:border-indigo-400 focus:ring-1 focus:ring-indigo-400"
                          />
                          <Button
                            type="button"
                            variant="outline"
                            size="icon"
                            onClick={() => removeRow(row.key)}
                            aria-label="Remove submission"
                          >
                            <Trash2 className="size-4" />
                          </Button>
                        </div>
                      ))}

                      <div className="flex flex-wrap items-center justify-between gap-3">
                        <Button
                          type="button"
                          variant="outline"
                          size="sm"
                          onClick={addRow}
                        >
                          <Plus className="mr-2 size-4" />
                          Add submission
                        </Button>
                        <Button
                          type="button"
                          onClick={runCheck}
                          disabled={running}
                        >
                          {running ? "Running…" : "Run check"}
                        </Button>
                      </div>

                      {runError && (
                        <p className="rounded-md bg-rose-50 px-3 py-2 text-sm text-rose-700">
                          {runError}
                        </p>
                      )}
                    </CardContent>
                  </Card>

                  {/* This run's results */}
                  {results.length > 0 && (
                    <Card>
                      <CardHeader>
                        <CardTitle>Check results</CardTitle>
                        <CardDescription>
                          Pairs detected in the latest run, highest similarity
                          first.
                        </CardDescription>
                      </CardHeader>
                      <CardContent>
                        <ReportTable
                          reports={results}
                          studentName={studentName}
                        />
                      </CardContent>
                    </Card>
                  )}

                  {/* Previously stored reports */}
                  <Card>
                    <CardHeader>
                      <CardTitle>Stored reports</CardTitle>
                      <CardDescription>
                        Previously saved plagiarism reports for this assignment.
                      </CardDescription>
                    </CardHeader>
                    <CardContent>
                      {reportsQuery.loading ? (
                        <LoadingState />
                      ) : reportsQuery.error ? (
                        <ErrorState
                          message={reportsQuery.error.message}
                          onRetry={reportsQuery.reload}
                        />
                      ) : sortedStored.length === 0 ? (
                        <p className="py-6 text-center text-sm text-theme-muted">
                          No stored reports yet.
                        </p>
                      ) : (
                        <ReportTable
                          reports={sortedStored}
                          studentName={studentName}
                        />
                      )}
                    </CardContent>
                  </Card>
                </>
              )}
            </>
          )}
        </div>
      </DashboardShell>
    </RouteGuard>
  );
}

function ReportTable({
  reports,
  studentName,
}: {
  reports: PlagiarismReportDto[];
  studentName: Map<number, string>;
}) {
  return (
    <div className="overflow-x-auto">
      <table className="w-full border-collapse text-sm">
        <thead>
          <tr className="border-b border-slate-200">
            <th className="px-3 py-2 text-left font-medium text-theme">
              Student A
            </th>
            <th className="px-3 py-2 text-left font-medium text-theme">
              Student B
            </th>
            <th className="px-3 py-2 text-right font-medium text-theme">
              Similarity
            </th>
          </tr>
        </thead>
        <tbody>
          {reports.map((r) => {
            const percent = Math.round(r.similarity * 100);
            const high = percent >= 60;
            return (
              <tr
                key={r.id}
                className="border-b border-slate-100 last:border-0 hover:bg-slate-50/60"
              >
                <td className="px-3 py-2 text-theme">
                  {r.studentAName || studentName.get(r.studentAId) || "—"}
                </td>
                <td className="px-3 py-2 text-theme">
                  {r.studentBName || studentName.get(r.studentBId) || "—"}
                </td>
                <td className="px-3 py-2 text-right">
                  <Badge variant={high ? "destructive" : "secondary"}>
                    {percent}%
                  </Badge>
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}
