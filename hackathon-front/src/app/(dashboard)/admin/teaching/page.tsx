"use client";

import { useMemo, useState } from "react";
import { Plus, X } from "lucide-react";
import { RouteGuard } from "@/components/auth/route-guard";
import { DashboardShell } from "@/components/layout/dashboard-shell";
import { Header } from "@/components/layout/header";
import { ErrorState, LoadingState, EmptyState } from "@/components/dashboard/data-states";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
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
import { coursesApi, teachingApi, teachersApi, ApiError } from "@/lib/api";
import type { AssignmentRole } from "@/types/api";

function errMsg(e: unknown): string {
  if (e instanceof ApiError) return e.details?.join(", ") ?? e.message;
  if (e instanceof Error) return e.message;
  return "Something went wrong";
}

export default function AdminTeachingPage() {
  const { user } = useAuth();
  const t = useT();
  const [courseId, setCourseId] = useState<string>("");
  const [teacherId, setTeacherId] = useState<string>("");
  const [role, setRole] = useState<AssignmentRole>("CO_TEACHER");
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  const courses = useAsync(() => coursesApi.listCourses({ page: 0, size: 200 }), [user?.id]);
  const teachers = useAsync(() => teachersApi.listTeachers({ page: 0, size: 200 }), [user?.id]);
  const selectedCourse = courseId ? Number(courseId) : null;
  const assignments = useAsync(
    () => (selectedCourse ? teachingApi.listCourseTeachers(selectedCourse) : Promise.resolve([])),
    [selectedCourse],
  );

  const teacherName = useMemo(() => {
    const map = new Map<number, string>();
    for (const tch of teachers.data?.items ?? []) map.set(tch.id, tch.fullName);
    return map;
  }, [teachers.data]);

  async function assign() {
    if (!selectedCourse || !teacherId) {
      setError("Pick a course and a teacher");
      return;
    }
    setBusy(true);
    setError(null);
    try {
      await teachingApi.assignTeacher({ courseId: selectedCourse, teacherId: Number(teacherId), role });
      setTeacherId("");
      assignments.reload();
    } catch (e) {
      setError(errMsg(e));
    } finally {
      setBusy(false);
    }
  }

  async function unassign(tId: number) {
    if (!selectedCourse) return;
    try {
      await teachingApi.unassignTeacher(selectedCourse, tId);
      assignments.reload();
    } catch (e) {
      setError(errMsg(e));
    }
  }

  return (
    <RouteGuard allow={["ADMIN"]}>
      <DashboardShell role="admin" userName={user?.fullName ?? ""} userEmail={user?.email ?? ""}>
        <Header
          title={t.nav.coTeachers}
          description="Assign lead teachers and co-teachers to courses."
        />
        <div className="space-y-6 p-8">
          <Card>
            <CardHeader>
              <CardTitle>Course</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="max-w-sm space-y-2">
                <Label>Select a course</Label>
                <Select value={courseId} onValueChange={setCourseId}>
                  <SelectTrigger>
                    <SelectValue placeholder="Choose a course" />
                  </SelectTrigger>
                  <SelectContent>
                    {(courses.data?.items ?? []).map((c) => (
                      <SelectItem key={c.id} value={String(c.id)}>
                        {c.code} — {c.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {selectedCourse && (
                <div className="flex flex-wrap items-end gap-3 border-t pt-4">
                  <div className="space-y-2">
                    <Label>Teacher</Label>
                    <Select value={teacherId} onValueChange={setTeacherId}>
                      <SelectTrigger className="w-56">
                        <SelectValue placeholder="Choose a teacher" />
                      </SelectTrigger>
                      <SelectContent>
                        {(teachers.data?.items ?? []).map((tch) => (
                          <SelectItem key={tch.id} value={String(tch.id)}>
                            {tch.fullName}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label>Role</Label>
                    <Select value={role} onValueChange={(v) => setRole(v as AssignmentRole)}>
                      <SelectTrigger className="w-40">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="LEAD">Lead</SelectItem>
                        <SelectItem value="CO_TEACHER">Co-teacher</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <Button size="sm" onClick={assign} disabled={busy}>
                    <Plus className="h-4 w-4" /> Assign
                  </Button>
                </div>
              )}
              {error && (
                <div className="rounded-md bg-rose-50 px-3 py-2 text-sm text-rose-700">{error}</div>
              )}
            </CardContent>
          </Card>

          {selectedCourse && (
            <Card>
              <CardHeader>
                <CardTitle>Assigned teachers</CardTitle>
              </CardHeader>
              <CardContent className="p-0">
                {assignments.loading ? (
                  <LoadingState />
                ) : assignments.error ? (
                  <ErrorState message={assignments.error.message} onRetry={assignments.reload} />
                ) : (assignments.data ?? []).length === 0 ? (
                  <EmptyState message="No teachers assigned to this course yet." />
                ) : (
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="border-b text-left">
                        <th className="px-6 py-3">Teacher</th>
                        <th className="px-4 py-3">Role</th>
                        <th className="px-4 py-3"></th>
                      </tr>
                    </thead>
                    <tbody>
                      {(assignments.data ?? []).map((a) => (
                        <tr key={a.id} className="border-b">
                          <td className="px-6 py-3">
                            {a.teacherName || teacherName.get(a.teacherId) || `#${a.teacherId}`}
                            <span className="ml-2 text-xs text-slate-400">{a.teacherEmail}</span>
                          </td>
                          <td className="px-4 py-3">
                            <Badge variant={a.assignmentRole === "LEAD" ? "default" : "secondary"}>
                              {a.assignmentRole === "LEAD" ? "Lead" : "Co-teacher"}
                            </Badge>
                          </td>
                          <td className="px-4 py-3 text-right">
                            <Button variant="ghost" size="sm" onClick={() => unassign(a.teacherId)}>
                              <X className="h-4 w-4" /> Remove
                            </Button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                )}
              </CardContent>
            </Card>
          )}
        </div>
      </DashboardShell>
    </RouteGuard>
  );
}
