"use client";

import { useState } from "react";
import { CheckCircle2 } from "lucide-react";
import { DashboardShell } from "@/components/layout/dashboard-shell";
import { Header } from "@/components/layout/header";
import { ErrorState, LoadingState, EmptyState } from "@/components/dashboard/data-states";
import { RouteGuard } from "@/components/auth/route-guard";
import { Button } from "@/components/ui/button";
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
import {
  coursesApi,
  gradingApi,
  organizationApi,
  studentsApi,
  ApiError,
} from "@/lib/api";
import type { TermGradeDto } from "@/types/api";

function toMessage(e: unknown): string {
  return e instanceof ApiError
    ? (e.details?.join(", ") ?? e.message)
    : e instanceof Error
      ? e.message
      : "Something went wrong";
}

function fmtPercent(v: number | null): string {
  return v === null ? "—" : `${v}%`;
}

function fmtValue(v: string | number | null): string {
  return v === null ? "—" : String(v);
}

function GradesTable({
  rows,
  primaryLabel,
  primaryValue,
  secondaryLabel,
  secondaryValue,
}: {
  rows: TermGradeDto[];
  primaryLabel: string;
  primaryValue: (r: TermGradeDto) => string;
  secondaryLabel: string;
  secondaryValue: (r: TermGradeDto) => string;
}) {
  return (
    <div className="overflow-x-auto">
      <table className="w-full text-sm">
        <thead>
          <tr className="border-b border-theme text-left text-theme-muted">
            <th className="py-2 pr-4 font-medium">{primaryLabel}</th>
            <th className="py-2 pr-4 font-medium">{secondaryLabel}</th>
            <th className="py-2 pr-4 font-medium">Final %</th>
            <th className="py-2 pr-4 font-medium">Letter</th>
            <th className="py-2 pr-4 font-medium">GPA</th>
          </tr>
        </thead>
        <tbody>
          {rows.map((r) => (
            <tr
              key={r.id}
              className="border-b border-theme/60 last:border-0"
            >
              <td className="py-2 pr-4 text-theme">{primaryValue(r)}</td>
              <td className="py-2 pr-4 text-theme">{secondaryValue(r)}</td>
              <td className="py-2 pr-4 text-theme">
                {fmtPercent(r.finalPercent)}
              </td>
              <td className="py-2 pr-4 text-theme">{fmtValue(r.letter)}</td>
              <td className="py-2 pr-4 text-theme">{fmtValue(r.gpa)}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export default function TeacherTranscriptsPage() {
  const { user } = useAuth();
  const t = useT();

  const coursesQuery = useAsync(
    () => coursesApi.listCourses({ page: 0, size: 200 }),
    [user?.id],
  );
  const termsQuery = useAsync(() => organizationApi.listTerms(), [user?.id]);
  const studentsQuery = useAsync(
    () => studentsApi.listStudents({ page: 0, size: 200 }),
    [user?.id],
  );

  const courses = coursesQuery.data?.items ?? [];
  const terms = termsQuery.data ?? [];
  const students = studentsQuery.data?.items ?? [];

  // Finalize state
  const [courseId, setCourseId] = useState<number | null>(null);
  const [termId, setTermId] = useState<number | null>(null);
  const [finalizing, setFinalizing] = useState(false);
  const [finalizeError, setFinalizeError] = useState<string | null>(null);
  const [finalized, setFinalized] = useState<TermGradeDto[] | null>(null);

  async function handleFinalize() {
    if (courseId === null || termId === null) return;
    setFinalizeError(null);
    setFinalizing(true);
    try {
      const result = await gradingApi.finalizeTermGrades({ courseId, termId });
      setFinalized(result);
    } catch (err) {
      setFinalizeError(toMessage(err));
    } finally {
      setFinalizing(false);
    }
  }

  // Student transcript view state
  const [studentId, setStudentId] = useState<number | null>(null);
  const transcriptQuery = useAsync(
    () =>
      studentId === null
        ? Promise.resolve<TermGradeDto[]>([])
        : gradingApi.studentTranscript(studentId),
    [studentId],
  );
  const transcriptRows = transcriptQuery.data ?? [];

  return (
    <RouteGuard allow={["TEACHER", "ADMIN"]}>
      <DashboardShell
        role="teacher"
        userName={user?.fullName ?? ""}
        userEmail={user?.email ?? ""}
      >
        <Header
          title={t.nav.transcripts}
          description="Finalize term grades and review student transcripts."
        />
        <div className="space-y-6 p-8">
          <Card>
            <CardHeader>
              <CardTitle>Finalize term grades</CardTitle>
              <CardDescription>
                Compute and persist final grades for an entire course in a term.
              </CardDescription>
            </CardHeader>
            <CardContent>
              {coursesQuery.loading || termsQuery.loading ? (
                <LoadingState />
              ) : coursesQuery.error ? (
                <ErrorState
                  message={coursesQuery.error.message}
                  onRetry={coursesQuery.reload}
                />
              ) : termsQuery.error ? (
                <ErrorState
                  message={termsQuery.error.message}
                  onRetry={termsQuery.reload}
                />
              ) : (
                <div className="space-y-4">
                  <div className="grid gap-4 sm:grid-cols-[1fr_1fr_auto] sm:items-end">
                    <div className="space-y-2">
                      <Label htmlFor="finalize-course">Course</Label>
                      <Select
                        value={courseId === null ? undefined : String(courseId)}
                        onValueChange={(v) => setCourseId(Number(v))}
                      >
                        <SelectTrigger id="finalize-course">
                          <SelectValue placeholder="Select a course" />
                        </SelectTrigger>
                        <SelectContent>
                          {courses.map((c) => (
                            <SelectItem key={c.id} value={String(c.id)}>
                              {c.name} ({c.code})
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="finalize-term">Term</Label>
                      <Select
                        value={termId === null ? undefined : String(termId)}
                        onValueChange={(v) => setTermId(Number(v))}
                      >
                        <SelectTrigger id="finalize-term">
                          <SelectValue placeholder="Select a term" />
                        </SelectTrigger>
                        <SelectContent>
                          {terms.map((term) => (
                            <SelectItem key={term.id} value={String(term.id)}>
                              {term.name}
                              {term.current ? " (current)" : ""}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    <Button
                      onClick={handleFinalize}
                      disabled={
                        finalizing || courseId === null || termId === null
                      }
                    >
                      <CheckCircle2 className="h-4 w-4" />
                      Finalize whole course
                    </Button>
                  </div>
                  {finalizeError && (
                    <p className="text-sm text-red-500">{finalizeError}</p>
                  )}
                  {finalized !== null &&
                    (finalized.length === 0 ? (
                      <EmptyState
                        title="No grades produced"
                        message="No students were finalized for this course and term."
                      />
                    ) : (
                      <GradesTable
                        rows={finalized}
                        primaryLabel="Student"
                        primaryValue={(r) => r.studentName}
                        secondaryLabel="Course"
                        secondaryValue={(r) => r.courseName}
                      />
                    ))}
                </div>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>View a student&apos;s transcript</CardTitle>
              <CardDescription>
                Browse a single student&apos;s finalized term grades.
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
                    <Label htmlFor="transcript-student">Student</Label>
                    <Select
                      value={studentId === null ? undefined : String(studentId)}
                      onValueChange={(v) => setStudentId(Number(v))}
                    >
                      <SelectTrigger id="transcript-student">
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
                    (transcriptQuery.loading ? (
                      <LoadingState />
                    ) : transcriptQuery.error ? (
                      <ErrorState
                        message={transcriptQuery.error.message}
                        onRetry={transcriptQuery.reload}
                      />
                    ) : transcriptRows.length === 0 ? (
                      <EmptyState
                        title="No transcript yet"
                        message="This student has no finalized term grades."
                      />
                    ) : (
                      <GradesTable
                        rows={transcriptRows}
                        primaryLabel="Term"
                        primaryValue={(r) => r.termName}
                        secondaryLabel="Course"
                        secondaryValue={(r) => r.courseName}
                      />
                    ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </DashboardShell>
    </RouteGuard>
  );
}
