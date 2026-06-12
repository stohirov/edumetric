"use client";

import { useMemo, useState } from "react";
import { Loader2 } from "lucide-react";
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
import { coursesApi, syllabusApi, ApiError } from "@/lib/api";
import type { CourseDto, SyllabusDto } from "@/types/api";

const TEXTAREA_CLASS =
  "flex w-full rounded-[10px] border border-theme bg-theme-input px-3.5 py-2.5 text-sm shadow-[var(--shadow-xs)] focus-visible:border-[var(--ring)] focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-[var(--ring)]/20";

function errMsg(e: unknown, fallback: string): string {
  return e instanceof ApiError
    ? (e.details?.join(", ") ?? e.message)
    : e instanceof Error
      ? e.message
      : fallback;
}

export default function TeacherSyllabusPage() {
  const { user } = useAuth();
  const t = useT();

  const coursesQuery = useAsync(
    () => coursesApi.listCourses({ page: 0, size: 200 }),
    [user?.id],
  );

  const courses = useMemo<CourseDto[]>(
    () => coursesQuery.data?.items ?? [],
    [coursesQuery.data],
  );

  const [courseId, setCourseId] = useState<number | null>(null);
  const activeCourseId = courseId ?? courses[0]?.id ?? null;

  const syllabusQuery = useAsync<SyllabusDto | null>(
    () =>
      activeCourseId == null
        ? Promise.resolve(null)
        : syllabusApi.getSyllabus(activeCourseId),
    [activeCourseId],
  );

  const [objectives, setObjectives] = useState("");
  const [outline, setOutline] = useState("");
  const [published, setPublished] = useState(false);
  const [saving, setSaving] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const syllabus = syllabusQuery.data;

  // Sync the form to the loaded syllabus once per (course, load) — the React
  // "store information from previous renders" pattern (setState during render).
  const [syncedKey, setSyncedKey] = useState<string | null>(null);
  const loadKey = `${activeCourseId}:${syllabus ? syllabus.id ?? "new" : "none"}`;
  if (syncedKey !== loadKey) {
    setSyncedKey(loadKey);
    setObjectives(syllabus?.objectives ?? "");
    setOutline(syllabus?.outline ?? "");
    setPublished(syllabus?.published ?? false);
    setSuccess(false);
    setError(null);
  }

  const save = async () => {
    if (activeCourseId == null) return;
    setSaving(true);
    setSuccess(false);
    setError(null);
    try {
      await syllabusApi.upsertSyllabus({
        courseId: activeCourseId,
        objectives: objectives.trim() || null,
        outline: outline.trim() || null,
        published,
      });
      setSuccess(true);
      syllabusQuery.reload();
    } catch (e) {
      setError(errMsg(e, "Failed to save syllabus."));
    } finally {
      setSaving(false);
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
          title={t.nav.syllabus}
          description="Write learning objectives and a course outline for your students."
        />
        <div className="p-8">
          {coursesQuery.loading ? (
            <LoadingState />
          ) : coursesQuery.error ? (
            <ErrorState
              message={coursesQuery.error.message}
              onRetry={coursesQuery.reload}
            />
          ) : courses.length === 0 ? (
            <p className="text-sm text-theme-muted">
              No courses available yet.
            </p>
          ) : (
            <div className="space-y-6">
              <div className="max-w-xs">
                <Label className="mb-1.5 block">Course</Label>
                <Select
                  value={activeCourseId != null ? String(activeCourseId) : ""}
                  onValueChange={(v) => setCourseId(Number(v))}
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

              {syllabusQuery.loading ? (
                <LoadingState />
              ) : syllabusQuery.error ? (
                <ErrorState
                  message={syllabusQuery.error.message}
                  onRetry={syllabusQuery.reload}
                />
              ) : (
                <Card>
                  <CardHeader>
                    <CardTitle>Syllabus</CardTitle>
                    <CardDescription>
                      Objectives and outline are visible to students once
                      published.
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-5">
                    <div className="space-y-1.5">
                      <Label htmlFor="objectives">Objectives</Label>
                      <textarea
                        id="objectives"
                        value={objectives}
                        onChange={(e) => setObjectives(e.target.value)}
                        rows={5}
                        placeholder="What students will learn in this course…"
                        className={TEXTAREA_CLASS}
                      />
                    </div>
                    <div className="space-y-1.5">
                      <Label htmlFor="outline">Outline / schedule</Label>
                      <textarea
                        id="outline"
                        value={outline}
                        onChange={(e) => setOutline(e.target.value)}
                        rows={12}
                        placeholder="Week-by-week schedule (Markdown supported)…"
                        className={`${TEXTAREA_CLASS} font-mono`}
                      />
                    </div>
                    <label className="flex items-center gap-2 text-sm text-theme">
                      <input
                        type="checkbox"
                        checked={published}
                        onChange={(e) => setPublished(e.target.checked)}
                      />
                      Published
                    </label>
                    {success && (
                      <p className="text-xs text-emerald-600">
                        Syllabus saved.
                      </p>
                    )}
                    {error && (
                      <p className="text-xs text-rose-600">{error}</p>
                    )}
                    <Button
                      type="button"
                      disabled={saving}
                      onClick={save}
                      className="gap-1.5"
                    >
                      {saving && (
                        <Loader2 className="h-3.5 w-3.5 animate-spin" />
                      )}
                      {saving ? "Saving…" : "Save"}
                    </Button>
                  </CardContent>
                </Card>
              )}
            </div>
          )}
        </div>
      </DashboardShell>
    </RouteGuard>
  );
}
