"use client";

import { useMemo, useState } from "react";
import { CalendarClock, Download, Loader2, Plus } from "lucide-react";
import { DashboardShell } from "@/components/layout/dashboard-shell";
import { Header } from "@/components/layout/header";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
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
import { assignmentsApi, gradesApi, homeworkApi, teachersApi } from "@/lib/api";
import { ApiError } from "@/lib/api/client";
import type { AssignmentDto, AssignmentType } from "@/types/api/grades";
import type { TeacherSubmissionDto } from "@/types/api/homework";

const ASSIGNMENT_TYPES: AssignmentType[] = [
  "THEORY",
  "PRACTICAL",
  "PROJECT",
  "EXAM",
];

interface CourseOption {
  courseId: number;
  courseName: string;
}

export default function TeacherHomeworkPage() {
  const { user } = useAuth();
  const t = useT();
  const tt = t.pages.teacherHomework;

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

  const [selected, setSelected] = useState<AssignmentDto | null>(null);

  const assignmentsQuery = useAsync(
    () =>
      activeCourseId == null
        ? Promise.resolve<AssignmentDto[]>([])
        : assignmentsApi.listByCourse(activeCourseId),
    [activeCourseId],
  );

  return (
    <RouteGuard allow={["TEACHER", "ADMIN"]}>
      <DashboardShell
        role="teacher"
        userName={user?.fullName ?? ""}
        userEmail={user?.email ?? ""}
      >
        <Header title={tt.title} description={tt.desc} />
        <div className="p-8">
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
            <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_minmax(0,1.4fr)]">
              <div className="space-y-6">
                <div className="max-w-xs">
                  <Label className="mb-1.5 block">{tt.selectCourse}</Label>
                  <Select
                    value={activeCourseId != null ? String(activeCourseId) : ""}
                    onValueChange={(v) => {
                      setCourseId(Number(v));
                      setSelected(null);
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

                <AssignmentsCard
                  query={assignmentsQuery}
                  courseId={activeCourseId}
                  selectedId={selected?.id ?? null}
                  onSelect={setSelected}
                  onCreated={assignmentsQuery.reload}
                />
              </div>

              <SubmissionsCard assignment={selected} />
            </div>
          )}
        </div>
      </DashboardShell>
    </RouteGuard>
  );
}

interface AssignmentsCardProps {
  query: ReturnType<typeof useAsync<AssignmentDto[]>>;
  courseId: number | null;
  selectedId: number | null;
  onSelect: (a: AssignmentDto) => void;
  onCreated: () => void;
}

function AssignmentsCard({
  query,
  courseId,
  selectedId,
  onSelect,
  onCreated,
}: AssignmentsCardProps) {
  const t = useT();
  const tt = t.pages.teacherHomework;
  const items = query.data ?? [];

  return (
    <Card>
      <CardHeader>
        <CardTitle>{tt.assignments}</CardTitle>
        <CardDescription>{tt.desc}</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {query.loading ? (
          <LoadingState />
        ) : query.error ? (
          <ErrorState message={query.error.message} onRetry={query.reload} />
        ) : (
          <ul className="divide-y divide-slate-100">
            {items.map((a) => (
              <li key={a.id}>
                <button
                  type="button"
                  onClick={() => onSelect(a)}
                  className={`flex w-full items-center justify-between gap-3 rounded-lg px-2 py-3 text-left transition-colors hover:bg-slate-50/60 ${
                    selectedId === a.id ? "bg-indigo-50/70" : ""
                  }`}
                >
                  <div className="min-w-0">
                    <p className="truncate font-medium text-theme">{a.name}</p>
                    <p className="mt-0.5 flex items-center gap-1 text-xs text-theme-muted">
                      <CalendarClock className="h-3.5 w-3.5" />
                      {a.dueDate
                        ? `${tt.dueDate}: ${new Date(a.dueDate).toLocaleDateString()}`
                        : "—"}
                    </p>
                  </div>
                  <Badge variant="secondary">
                    {tt.types[a.type]} · {a.maxValue}
                  </Badge>
                </button>
              </li>
            ))}
            {items.length === 0 && (
              <li className="py-6 text-center text-sm text-theme-muted">
                {tt.noAssignments}
              </li>
            )}
          </ul>
        )}

        {courseId != null && (
          <NewAssignmentForm courseId={courseId} onCreated={onCreated} />
        )}
      </CardContent>
    </Card>
  );
}

function NewAssignmentForm({
  courseId,
  onCreated,
}: {
  courseId: number;
  onCreated: () => void;
}) {
  const t = useT();
  const tt = t.pages.teacherHomework;

  const [name, setName] = useState("");
  const [type, setType] = useState<AssignmentType>("PRACTICAL");
  const [maxValue, setMaxValue] = useState("100");
  const [dueDate, setDueDate] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const submit = async (event: React.FormEvent) => {
    event.preventDefault();
    setError(null);
    const max = Number(maxValue);
    if (!name.trim() || !Number.isFinite(max) || max <= 0) {
      setError(tt.createError);
      return;
    }
    setSubmitting(true);
    try {
      await assignmentsApi.createAssignment({
        courseId,
        name: name.trim(),
        type,
        maxValue: max,
        dueDate: dueDate || null,
      });
      setName("");
      setDueDate("");
      onCreated();
    } catch (e) {
      setError(
        e instanceof ApiError
          ? (e.details?.join(", ") ?? e.message)
          : e instanceof Error
            ? e.message
            : tt.createError,
      );
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <form
      onSubmit={submit}
      className="space-y-3 rounded-[10px] border border-theme bg-slate-50/50 p-4"
    >
      <p className="text-label">{tt.newAssignment}</p>
      <div className="space-y-1.5">
        <Label htmlFor="hw-name">{tt.name}</Label>
        <Input
          id="hw-name"
          value={name}
          onChange={(e) => setName(e.target.value)}
        />
      </div>
      <div className="grid grid-cols-2 gap-3">
        <div className="space-y-1.5">
          <Label>{tt.type}</Label>
          <Select value={type} onValueChange={(v) => setType(v as AssignmentType)}>
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {ASSIGNMENT_TYPES.map((tp) => (
                <SelectItem key={tp} value={tp}>
                  {tt.types[tp]}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="hw-max">{tt.maxValue}</Label>
          <Input
            id="hw-max"
            type="number"
            min={1}
            value={maxValue}
            onChange={(e) => setMaxValue(e.target.value)}
          />
        </div>
      </div>
      <div className="space-y-1.5">
        <Label htmlFor="hw-due">{tt.dueDate}</Label>
        <Input
          id="hw-due"
          type="date"
          value={dueDate}
          onChange={(e) => setDueDate(e.target.value)}
        />
      </div>
      {error && (
        <div className="rounded-md border border-rose-200 bg-rose-50 px-3 py-2 text-sm text-rose-700">
          {error}
        </div>
      )}
      <Button type="submit" size="sm" disabled={submitting} className="gap-1.5">
        {submitting ? (
          <Loader2 className="h-3.5 w-3.5 animate-spin" />
        ) : (
          <Plus className="h-3.5 w-3.5" />
        )}
        {submitting ? tt.creating : tt.create}
      </Button>
    </form>
  );
}

function SubmissionsCard({ assignment }: { assignment: AssignmentDto | null }) {
  const t = useT();
  const tt = t.pages.teacherHomework;

  const query = useAsync(
    () =>
      assignment == null
        ? Promise.resolve<TeacherSubmissionDto[]>([])
        : homeworkApi.getSubmissions(assignment.id),
    [assignment?.id],
  );

  if (!assignment) {
    return (
      <Card>
        <CardContent className="flex min-h-[12rem] items-center justify-center text-sm text-theme-muted">
          {tt.selectAssignmentPrompt}
        </CardContent>
      </Card>
    );
  }

  const items = query.data ?? [];

  return (
    <Card>
      <CardHeader>
        <CardTitle>{tt.submissions}</CardTitle>
        <CardDescription>
          {assignment.name} · {tt.maxValue} {assignment.maxValue}
        </CardDescription>
      </CardHeader>
      <CardContent>
        {query.loading ? (
          <LoadingState />
        ) : query.error ? (
          <ErrorState message={query.error.message} onRetry={query.reload} />
        ) : items.length === 0 ? (
          <p className="py-6 text-center text-sm text-theme-muted">
            {tt.noSubmissions}
          </p>
        ) : (
          <ul className="divide-y divide-slate-100">
            {items.map((s) => (
              <SubmissionRow
                key={s.submissionId}
                submission={s}
                assignment={assignment}
                onGraded={query.reload}
              />
            ))}
          </ul>
        )}
      </CardContent>
    </Card>
  );
}

function SubmissionRow({
  submission,
  assignment,
  onGraded,
}: {
  submission: TeacherSubmissionDto;
  assignment: AssignmentDto;
  onGraded: () => void;
}) {
  const t = useT();
  const tt = t.pages.teacherHomework;

  const [grade, setGrade] = useState(
    submission.gradeValue != null ? String(submission.gradeValue) : "",
  );
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const download = async () => {
    try {
      const blob = await homeworkApi.downloadSubmissionFile(submission.submissionId);
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = submission.fileName ?? "submission";
      document.body.appendChild(a);
      a.click();
      a.remove();
      URL.revokeObjectURL(url);
    } catch {
      setError(tt.gradeError);
    }
  };

  const saveGrade = async () => {
    const value = Number(grade);
    if (!Number.isFinite(value) || value < 0 || value > assignment.maxValue) {
      setError(tt.gradeError);
      return;
    }
    setSaving(true);
    setError(null);
    try {
      await gradesApi.createGrade({
        studentId: submission.studentId,
        assignmentId: assignment.id,
        value,
      });
      onGraded();
    } catch (e) {
      setError(
        e instanceof ApiError
          ? (e.details?.join(", ") ?? e.message)
          : e instanceof Error
            ? e.message
            : tt.gradeError,
      );
    } finally {
      setSaving(false);
    }
  };

  return (
    <li className="py-3.5">
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <p className="flex items-center gap-2 font-medium text-theme">
            {submission.studentName}
            {submission.graded && (
              <Badge variant="secondary">{tt.graded}</Badge>
            )}
          </p>
          <p className="mt-0.5 text-xs text-theme-muted">
            {tt.submitted}: {new Date(submission.submittedAt).toLocaleString()}
          </p>
          {submission.comment && (
            <p className="mt-1 text-sm text-theme">{submission.comment}</p>
          )}
        </div>
        {submission.hasFile ? (
          <Button
            type="button"
            variant="outline"
            size="sm"
            className="shrink-0 gap-1.5"
            onClick={download}
          >
            <Download className="h-3.5 w-3.5" />
            {tt.download}
          </Button>
        ) : (
          <span className="shrink-0 text-xs text-theme-muted">{tt.noFile}</span>
        )}
      </div>
      <div className="mt-2.5 flex items-center gap-2">
        <Label htmlFor={`grade-${submission.submissionId}`} className="text-xs">
          {tt.grade}
        </Label>
        <Input
          id={`grade-${submission.submissionId}`}
          type="number"
          min={0}
          max={assignment.maxValue}
          value={grade}
          placeholder={tt.gradePlaceholder}
          onChange={(e) => setGrade(e.target.value)}
          className="h-8 w-24"
        />
        <span className="text-xs text-theme-muted">/ {assignment.maxValue}</span>
        <Button
          type="button"
          size="sm"
          variant="ghost"
          disabled={saving || grade === ""}
          onClick={saveGrade}
          className="gap-1.5"
        >
          {saving && <Loader2 className="h-3.5 w-3.5 animate-spin" />}
          {tt.saveGrade}
        </Button>
      </div>
      {error && <p className="mt-1 text-xs text-rose-600">{error}</p>}
    </li>
  );
}
