"use client";

import { useMemo, useState } from "react";
import { Download } from "lucide-react";
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
import { Input } from "@/components/ui/input";
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
import { useAuth } from "@/components/providers/auth-provider";
import { useT } from "@/components/providers/locale-provider";
import { useAsync } from "@/lib/use-async";
import { gradebookApi, gradesApi, teachersApi } from "@/lib/api";
import { ApiError } from "@/lib/api/client";
import { downloadGradebookCsv } from "@/lib/gradebook-export";
import { cn } from "@/lib/utils";
import type {
  GradebookCellDto,
  GradebookColumnDto,
  GradebookDto,
} from "@/types/api/gradebook";

const ALL_GROUPS = "all";

interface CourseOption {
  courseId: number;
  courseName: string;
}
interface GroupOption {
  groupId: number;
  groupName: string;
  courseId: number;
}

function errMsg(e: unknown, fallback: string): string {
  return e instanceof ApiError
    ? (e.details?.join(", ") ?? e.message)
    : e instanceof Error
      ? e.message
      : fallback;
}

function gradeTone(percent: number | null): string {
  if (percent == null) return "text-theme-muted";
  if (percent >= 80) return "text-emerald-600";
  if (percent >= 60) return "text-amber-600";
  return "text-rose-600";
}

export default function TeacherGradebookPage() {
  const { user } = useAuth();
  const t = useT();
  const tt = t.pages.teacherGrades;

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

  const groups = useMemo<GroupOption[]>(
    () =>
      (groupsQuery.data ?? [])
        .filter((g) => g.courseId === activeCourseId)
        .map((g) => ({
          groupId: g.id,
          groupName: g.name,
          courseId: g.courseId,
        })),
    [groupsQuery.data, activeCourseId],
  );

  const [groupId, setGroupId] = useState<string>(ALL_GROUPS);

  const bookQuery = useAsync(
    () =>
      activeCourseId == null
        ? Promise.resolve<GradebookDto | null>(null)
        : gradebookApi.getGradebook(
            activeCourseId,
            groupId === ALL_GROUPS ? null : Number(groupId),
          ),
    [activeCourseId, groupId],
  );

  const [saveError, setSaveError] = useState<string | null>(null);

  const saveCell = async (
    studentId: number,
    assignmentId: number,
    raw: string,
    max: number,
  ) => {
    const trimmed = raw.trim();
    if (trimmed === "") return;
    const value = Number(trimmed);
    if (!Number.isFinite(value) || value < 0 || value > max) {
      setSaveError(tt.saveError);
      return;
    }
    try {
      setSaveError(null);
      await gradesApi.createGrade({ studentId, assignmentId, value });
      await bookQuery.reload();
    } catch (e) {
      setSaveError(errMsg(e, tt.saveError));
    }
  };

  const book = bookQuery.data;

  return (
    <RouteGuard allow={["TEACHER", "ADMIN"]}>
      <DashboardShell
        role="teacher"
        userName={user?.fullName ?? ""}
        userEmail={user?.email ?? ""}
      >
        <Header title={tt.title} description={tt.desc} />
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
              <div className="flex flex-wrap items-end gap-4">
                <div className="w-56">
                  <Label className="mb-1.5 block">{tt.course}</Label>
                  <Select
                    value={activeCourseId != null ? String(activeCourseId) : ""}
                    onValueChange={(v) => {
                      setCourseId(Number(v));
                      setGroupId(ALL_GROUPS);
                    }}
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

                {groups.length > 1 && (
                  <div className="w-48">
                    <Label className="mb-1.5 block">{tt.allGroups}</Label>
                    <Select value={groupId} onValueChange={setGroupId}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value={ALL_GROUPS}>{tt.allGroups}</SelectItem>
                        {groups.map((g) => (
                          <SelectItem key={g.groupId} value={String(g.groupId)}>
                            {g.groupName}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                )}

                <div className="ml-auto">
                  <Button
                    variant="outline"
                    disabled={!book || book.rows.length === 0}
                    onClick={() => book && downloadGradebookCsv(book)}
                  >
                    <Download className="mr-2 size-4" />
                    {tt.export}
                  </Button>
                </div>
              </div>

              {saveError && (
                <p className="rounded-md bg-rose-50 px-3 py-2 text-sm text-rose-700">
                  {saveError}
                </p>
              )}

              <Card>
                <CardHeader>
                  <CardTitle>{book?.courseName ?? tt.title}</CardTitle>
                  <CardDescription>{tt.cellHint}</CardDescription>
                </CardHeader>
                <CardContent>
                  {bookQuery.loading ? (
                    <LoadingState />
                  ) : bookQuery.error ? (
                    <ErrorState
                      message={bookQuery.error.message}
                      onRetry={bookQuery.reload}
                    />
                  ) : !book || book.columns.length === 0 ? (
                    <p className="py-6 text-center text-sm text-theme-muted">
                      {tt.noAssignments}
                    </p>
                  ) : book.rows.length === 0 ? (
                    <p className="py-6 text-center text-sm text-theme-muted">
                      {tt.noStudents}
                    </p>
                  ) : (
                    <GradebookTable book={book} onSaveCell={saveCell} />
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

function GradebookTable({
  book,
  onSaveCell,
}: {
  book: GradebookDto;
  onSaveCell: (
    studentId: number,
    assignmentId: number,
    raw: string,
    max: number,
  ) => void;
}) {
  const t = useT();
  const tt = t.pages.teacherGrades;

  return (
    <div className="overflow-x-auto">
      <table className="w-full border-collapse text-sm">
        <thead>
          <tr className="border-b border-slate-200">
            <th className="sticky left-0 z-10 bg-white px-3 py-2 text-left font-medium text-theme">
              {tt.student}
            </th>
            {book.columns.map((col) => (
              <ColumnHeader key={col.key} col={col} />
            ))}
            <th className="px-3 py-2 text-right font-medium text-theme">
              {tt.course}
            </th>
          </tr>
        </thead>
        <tbody>
          {book.rows.map((row) => {
            const cellByKey = new Map<string, GradebookCellDto>(
              row.cells.map((c) => [c.key, c]),
            );
            return (
              <tr
                key={row.studentId}
                className="border-b border-slate-100 last:border-0 hover:bg-slate-50/60"
              >
                <td className="sticky left-0 z-10 bg-white px-3 py-1.5 font-medium text-theme">
                  {row.studentName}
                  {row.groupName && (
                    <span className="ml-2 text-xs text-theme-muted">
                      {row.groupName}
                    </span>
                  )}
                </td>
                {book.columns.map((col) => {
                  const cell = cellByKey.get(col.key);
                  return (
                    <GradeCell
                      // Include the saved value so the cell remounts with fresh
                      // local state whenever the matrix reloads after a save.
                      key={`${col.key}:${cell?.value ?? ""}`}
                      studentId={row.studentId}
                      column={col}
                      cell={cell}
                      onSave={onSaveCell}
                    />
                  );
                })}
                <td className="whitespace-nowrap px-3 py-1.5 text-right">
                  <span
                    className={cn("font-semibold", gradeTone(row.coursePercent))}
                  >
                    {row.display ?? "—"}
                  </span>
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}

function ColumnHeader({ col }: { col: GradebookColumnDto }) {
  const t = useT();
  const tt = t.pages.teacherGrades;
  const isQuiz = col.kind === "QUIZ";
  return (
    <th className="min-w-[5.5rem] px-2 py-2 text-center align-bottom font-medium text-theme">
      <div className="truncate" title={col.name}>
        {col.name}
      </div>
      {isQuiz && (
        <div className="mx-auto mt-0.5 w-fit rounded bg-indigo-50 px-1 text-[10px] font-medium uppercase tracking-wide text-indigo-600">
          {tt.quizTag}
        </div>
      )}
      <div className="text-[11px] font-normal text-theme-muted">
        /{col.maxValue ?? "—"} · ×{col.weight ?? 1}
      </div>
      <div className="text-[11px] font-normal text-theme-muted">
        {col.averagePercent != null
          ? `${tt.avg} ${Math.round(col.averagePercent)}%`
          : `${col.missingCount} ${tt.missing}`}
      </div>
    </th>
  );
}

function GradeCell({
  studentId,
  column,
  cell,
  onSave,
}: {
  studentId: number;
  column: GradebookColumnDto;
  cell: GradebookCellDto | undefined;
  onSave: (
    studentId: number,
    assignmentId: number,
    raw: string,
    max: number,
  ) => void;
}) {
  const t = useT();
  const tt = t.pages.teacherGrades;
  const original = cell?.value != null ? String(cell.value) : "";
  const [value, setValue] = useState(original);

  // Quizzes are auto-graded — show the best-attempt score read-only.
  if (column.kind === "QUIZ") {
    return (
      <td className="px-1 py-1 text-center">
        <span
          className={cn("inline-block min-w-16 tabular-nums", gradeTone(cell?.percent ?? null))}
          title={tt.quizReadOnly}
        >
          {cell?.value != null ? cell.value : "—"}
        </span>
      </td>
    );
  }

  const commit = () => {
    if (value.trim() === original.trim()) return;
    if (column.assignmentId == null || column.maxValue == null) return;
    onSave(studentId, column.assignmentId, value, column.maxValue);
  };

  return (
    <td className="px-1 py-1 text-center">
      <div className="relative">
        <Input
          value={value}
          inputMode="decimal"
          onChange={(e) => setValue(e.target.value)}
          onBlur={commit}
          onKeyDown={(e) => {
            if (e.key === "Enter") (e.target as HTMLInputElement).blur();
          }}
          className="h-8 w-16 px-1.5 text-center"
        />
        {!cell?.value && cell?.submitted && (
          <span
            className="absolute -right-0.5 -top-0.5 size-2 rounded-full bg-amber-400"
            title={tt.submittedHint}
          />
        )}
      </div>
    </td>
  );
}
