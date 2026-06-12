"use client";

import { useEffect, useMemo, useState } from "react";
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
import { assignmentsApi, coursesApi, gradingApi, studentsApi } from "@/lib/api";
import { ApiError } from "@/lib/api";
import type { AssignmentDto } from "@/types/api";

function errMsg(e: unknown): string {
  return e instanceof ApiError
    ? (e.details?.join(", ") ?? e.message)
    : e instanceof Error
      ? e.message
      : "Something went wrong";
}

interface CriterionRow {
  id: number | null; // existing criterion id, or null for a new row
  key: string; // stable React key
  label: string;
  maxPoints: string;
}

let rowSeq = 0;
function newRow(): CriterionRow {
  rowSeq += 1;
  return { id: null, key: `new-${rowSeq}`, label: "", maxPoints: "" };
}

export default function TeacherRubricsPage() {
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
  const students = studentsQuery.data?.items ?? [];

  const [courseId, setCourseId] = useState<number | null>(null);
  const [assignmentId, setAssignmentId] = useState<number | null>(null);

  const assignmentsQuery = useAsync<AssignmentDto[]>(
    () =>
      courseId == null
        ? Promise.resolve<AssignmentDto[]>([])
        : assignmentsApi.listByCourse(courseId),
    [courseId],
  );
  const assignments = useMemo(
    () => assignmentsQuery.data ?? [],
    [assignmentsQuery.data],
  );
  const activeAssignment = useMemo(
    () => assignments.find((a) => a.id === assignmentId) ?? null,
    [assignments, assignmentId],
  );

  // ----- Rubric builder state -----
  const [rubricName, setRubricName] = useState("");
  const [rows, setRows] = useState<CriterionRow[]>([]);
  const [rubricLoading, setRubricLoading] = useState(false);
  const [rubricLoadError, setRubricLoadError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [saveError, setSaveError] = useState<string | null>(null);
  const [saveOk, setSaveOk] = useState(false);

  // Load the rubric whenever the selected assignment changes.
  /* eslint-disable react-hooks/set-state-in-effect */
  useEffect(() => {
    if (assignmentId == null) {
      setRubricName("");
      setRows([]);
      setRubricLoadError(null);
      return;
    }
    let cancelled = false;
    setRubricLoading(true);
    setRubricLoadError(null);
    gradingApi
      .getRubric(assignmentId)
      .then((rubric) => {
        if (cancelled) return;
        const criteria = [...(rubric?.criteria ?? [])].sort(
          (a, b) => a.position - b.position,
        );
        setRubricName(rubric?.name ?? "");
        setRows(
          criteria.length > 0
            ? criteria.map((c) => ({
                id: c.id,
                key: `c-${c.id}`,
                label: c.label,
                maxPoints: String(c.maxPoints),
              }))
            : [newRow()],
        );
      })
      .catch(() => {
        // No rubric yet (or fetch failed) — start with a blank builder.
        if (cancelled) return;
        setRubricName("");
        setRows([newRow()]);
      })
      .finally(() => {
        if (!cancelled) setRubricLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, [assignmentId]);

  const updateRow = (key: string, patch: Partial<CriterionRow>) => {
    setRows((prev) =>
      prev.map((r) => (r.key === key ? { ...r, ...patch } : r)),
    );
  };
  const removeRow = (key: string) => {
    setRows((prev) => prev.filter((r) => r.key !== key));
  };
  const addRow = () => setRows((prev) => [...prev, newRow()]);

  const saveRubric = async () => {
    if (assignmentId == null) return;
    const criteria = rows
      .map((r, idx) => ({
        label: r.label.trim(),
        maxPoints: Number(r.maxPoints),
        position: idx,
      }))
      .filter((c) => c.label !== "" && Number.isFinite(c.maxPoints));
    if (rubricName.trim() === "") {
      setSaveError("Rubric name is required.");
      return;
    }
    if (criteria.length === 0) {
      setSaveError("Add at least one criterion.");
      return;
    }
    try {
      setSaving(true);
      setSaveError(null);
      setSaveOk(false);
      const saved = await gradingApi.upsertRubric({
        assignmentId,
        name: rubricName.trim(),
        criteria,
      });
      const next = [...(saved?.criteria ?? [])].sort(
        (a, b) => a.position - b.position,
      );
      setRubricName(saved?.name ?? rubricName.trim());
      setRows(
        next.map((c) => ({
          id: c.id,
          key: `c-${c.id}`,
          label: c.label,
          maxPoints: String(c.maxPoints),
        })),
      );
      setSaveOk(true);
    } catch (e) {
      setSaveError(errMsg(e));
    } finally {
      setSaving(false);
    }
  };

  // ----- Score a student -----
  const [studentId, setStudentId] = useState<number | null>(null);
  const [scoreValues, setScoreValues] = useState<Record<number, string>>({});
  const [scoreComments, setScoreComments] = useState<Record<number, string>>(
    {},
  );
  const [scoreLoading, setScoreLoading] = useState(false);
  const [scoreSaving, setScoreSaving] = useState(false);
  const [scoreError, setScoreError] = useState<string | null>(null);
  const [scoreOk, setScoreOk] = useState(false);

  // Criteria with a persisted id can be scored.
  const scorableCriteria = useMemo(
    () =>
      rows
        .filter((r): r is CriterionRow & { id: number } => r.id != null)
        .map((r) => ({
          id: r.id,
          label: r.label,
          maxPoints: Number(r.maxPoints),
        })),
    [rows],
  );

  // Load existing scores when a student is selected.
  useEffect(() => {
    if (assignmentId == null || studentId == null) {
      setScoreValues({});
      setScoreComments({});
      return;
    }
    let cancelled = false;
    setScoreLoading(true);
    setScoreError(null);
    setScoreOk(false);
    gradingApi
      .getRubricScores(assignmentId, studentId)
      .then((scores) => {
        if (cancelled) return;
        const values: Record<number, string> = {};
        const comments: Record<number, string> = {};
        for (const s of scores) {
          values[s.criterionId] = String(s.points);
          comments[s.criterionId] = s.comment ?? "";
        }
        setScoreValues(values);
        setScoreComments(comments);
      })
      .catch(() => {
        if (cancelled) return;
        setScoreValues({});
        setScoreComments({});
      })
      .finally(() => {
        if (!cancelled) setScoreLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, [assignmentId, studentId]);
  /* eslint-enable react-hooks/set-state-in-effect */

  const scoreTotal = useMemo(
    () =>
      scorableCriteria.reduce((sum, c) => {
        const v = Number(scoreValues[c.id]);
        return sum + (Number.isFinite(v) ? v : 0);
      }, 0),
    [scorableCriteria, scoreValues],
  );

  const saveScores = async () => {
    if (assignmentId == null || studentId == null) return;
    const scores = scorableCriteria.map((c) => ({
      criterionId: c.id,
      points: Number(scoreValues[c.id] ?? 0) || 0,
      comment: scoreComments[c.id]?.trim() || undefined,
    }));
    try {
      setScoreSaving(true);
      setScoreError(null);
      setScoreOk(false);
      await gradingApi.scoreRubric({ assignmentId, studentId, scores });
      setScoreOk(true);
    } catch (e) {
      setScoreError(errMsg(e));
    } finally {
      setScoreSaving(false);
    }
  };

  return (
    <RouteGuard allow={["TEACHER", "ADMIN"]}>
      <DashboardShell
        role="teacher"
        userName={user?.fullName ?? ""}
        userEmail={user?.email ?? ""}
      >
        <Header
          title={t.nav.rubrics}
          description="Build a scoring rubric for an assignment and grade students against it."
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
                      setStudentId(null);
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
                      setStudentId(null);
                      setSaveError(null);
                      setSaveOk(false);
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
                          {a.name} (/{a.maxValue})
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              {assignmentId == null ? (
                <p className="text-sm text-theme-muted">
                  Pick a course and an assignment to build its rubric.
                </p>
              ) : (
                <div className="grid gap-6 lg:grid-cols-2">
                  {/* Section A: Rubric builder */}
                  <Card>
                    <CardHeader>
                      <CardTitle>Rubric builder</CardTitle>
                      <CardDescription>
                        {activeAssignment
                          ? `Total of all criteria must not exceed the assignment max (${activeAssignment.maxValue}).`
                          : "Define the criteria students are scored on."}
                      </CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      {rubricLoading ? (
                        <LoadingState />
                      ) : rubricLoadError ? (
                        <ErrorState message={rubricLoadError} />
                      ) : (
                        <>
                          <div>
                            <Label className="mb-1.5 block">Rubric name</Label>
                            <Input
                              value={rubricName}
                              onChange={(e) => setRubricName(e.target.value)}
                              placeholder="e.g. Essay rubric"
                            />
                          </div>

                          <div className="space-y-2">
                            <Label className="block">Criteria</Label>
                            {rows.length === 0 ? (
                              <p className="text-sm text-theme-muted">
                                No criteria yet.
                              </p>
                            ) : (
                              rows.map((row) => (
                                <div
                                  key={row.key}
                                  className="flex items-end gap-2"
                                >
                                  <div className="flex-1">
                                    <Input
                                      value={row.label}
                                      onChange={(e) =>
                                        updateRow(row.key, {
                                          label: e.target.value,
                                        })
                                      }
                                      placeholder="Criterion label"
                                    />
                                  </div>
                                  <div className="w-24">
                                    <Input
                                      value={row.maxPoints}
                                      inputMode="decimal"
                                      onChange={(e) =>
                                        updateRow(row.key, {
                                          maxPoints: e.target.value,
                                        })
                                      }
                                      placeholder="Max"
                                    />
                                  </div>
                                  <Button
                                    type="button"
                                    variant="outline"
                                    size="icon"
                                    onClick={() => removeRow(row.key)}
                                    aria-label="Remove criterion"
                                  >
                                    <Trash2 className="size-4" />
                                  </Button>
                                </div>
                              ))
                            )}
                          </div>

                          <Button
                            type="button"
                            variant="outline"
                            size="sm"
                            onClick={addRow}
                          >
                            <Plus className="mr-2 size-4" />
                            Add criterion
                          </Button>

                          {saveError && (
                            <p className="rounded-md bg-rose-50 px-3 py-2 text-sm text-rose-700">
                              {saveError}
                            </p>
                          )}
                          {saveOk && (
                            <p className="rounded-md bg-emerald-50 px-3 py-2 text-sm text-emerald-700">
                              Rubric saved.
                            </p>
                          )}

                          <div className="flex justify-end">
                            <Button
                              type="button"
                              onClick={saveRubric}
                              disabled={saving}
                            >
                              {saving ? "Saving…" : "Save rubric"}
                            </Button>
                          </div>
                        </>
                      )}
                    </CardContent>
                  </Card>

                  {/* Section B: Score a student */}
                  <Card>
                    <CardHeader>
                      <CardTitle>Score a student</CardTitle>
                      <CardDescription>
                        Scores are saved to the gradebook. The total cannot
                        exceed the assignment max.
                      </CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div>
                        <Label className="mb-1.5 block">Student</Label>
                        <Select
                          value={studentId != null ? String(studentId) : ""}
                          onValueChange={(v) => setStudentId(Number(v))}
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

                      {studentId == null ? (
                        <p className="text-sm text-theme-muted">
                          Pick a student to score against the rubric.
                        </p>
                      ) : scorableCriteria.length === 0 ? (
                        <p className="text-sm text-theme-muted">
                          Save the rubric first to score students.
                        </p>
                      ) : scoreLoading ? (
                        <LoadingState />
                      ) : (
                        <>
                          <div className="space-y-3">
                            {scorableCriteria.map((c) => (
                              <div key={c.id} className="space-y-1.5">
                                <div className="flex items-center justify-between gap-2">
                                  <Label className="block">{c.label}</Label>
                                  <span className="text-xs text-theme-muted">
                                    / {c.maxPoints}
                                  </span>
                                </div>
                                <div className="flex gap-2">
                                  <Input
                                    className="w-24"
                                    inputMode="decimal"
                                    value={scoreValues[c.id] ?? ""}
                                    onChange={(e) =>
                                      setScoreValues((prev) => ({
                                        ...prev,
                                        [c.id]: e.target.value,
                                      }))
                                    }
                                    placeholder="Points"
                                  />
                                  <Input
                                    className="flex-1"
                                    value={scoreComments[c.id] ?? ""}
                                    onChange={(e) =>
                                      setScoreComments((prev) => ({
                                        ...prev,
                                        [c.id]: e.target.value,
                                      }))
                                    }
                                    placeholder="Comment (optional)"
                                  />
                                </div>
                              </div>
                            ))}
                          </div>

                          <p className="text-sm text-theme-muted">
                            Total:{" "}
                            <span className="font-semibold text-theme">
                              {scoreTotal}
                            </span>
                            {activeAssignment
                              ? ` / ${activeAssignment.maxValue}`
                              : ""}
                          </p>

                          {scoreError && (
                            <p className="rounded-md bg-rose-50 px-3 py-2 text-sm text-rose-700">
                              {scoreError}
                            </p>
                          )}
                          {scoreOk && (
                            <p className="rounded-md bg-emerald-50 px-3 py-2 text-sm text-emerald-700">
                              Scores saved to the gradebook.
                            </p>
                          )}

                          <div className="flex justify-end">
                            <Button
                              type="button"
                              onClick={saveScores}
                              disabled={scoreSaving}
                            >
                              {scoreSaving ? "Saving…" : "Save scores"}
                            </Button>
                          </div>
                        </>
                      )}
                    </CardContent>
                  </Card>
                </div>
              )}
            </>
          )}
        </div>
      </DashboardShell>
    </RouteGuard>
  );
}
