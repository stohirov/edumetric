"use client";

import { useState } from "react";
import { DashboardShell } from "@/components/layout/dashboard-shell";
import { Header } from "@/components/layout/header";
import {
  EmptyState,
  ErrorState,
  LoadingState,
} from "@/components/dashboard/data-states";
import { RouteGuard } from "@/components/auth/route-guard";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Label } from "@/components/ui/label";
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
  assignmentsApi,
  coursesApi,
  studentsApi,
  gradingApi,
  ApiError,
} from "@/lib/api";

function errorMessage(e: unknown): string {
  return e instanceof ApiError
    ? (e.details?.join(", ") ?? e.message)
    : e instanceof Error
      ? e.message
      : "Something went wrong";
}

export default function TeacherFeedbackPage() {
  const { user } = useAuth();
  const t = useT();

  const [courseId, setCourseId] = useState("");
  const [assignmentId, setAssignmentId] = useState("");
  const [studentId, setStudentId] = useState("");
  const [body, setBody] = useState("");
  const [posting, setPosting] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);

  const coursesQuery = useAsync(
    () => coursesApi.listCourses({ page: 0, size: 200 }),
    [user?.id],
  );
  const studentsQuery = useAsync(
    () => studentsApi.listStudents({ page: 0, size: 200 }),
    [user?.id],
  );
  const assignmentsQuery = useAsync(
    () =>
      courseId
        ? assignmentsApi.listByCourse(Number(courseId))
        : Promise.resolve([]),
    [courseId],
  );

  const feedbackQuery = useAsync(
    () =>
      assignmentId && studentId
        ? gradingApi.listFeedback(Number(assignmentId), Number(studentId))
        : Promise.resolve([]),
    [assignmentId, studentId],
  );

  const courses = coursesQuery.data?.items ?? [];
  const students = studentsQuery.data?.items ?? [];
  const assignments = assignmentsQuery.data ?? [];

  async function handlePost(e: React.FormEvent) {
    e.preventDefault();
    setFormError(null);
    if (!assignmentId || !studentId || !body.trim()) {
      setFormError("Select an assignment, a student, and write feedback.");
      return;
    }
    setPosting(true);
    try {
      await gradingApi.postFeedback({
        assignmentId: Number(assignmentId),
        studentId: Number(studentId),
        body: body.trim(),
      });
      setBody("");
      feedbackQuery.reload();
    } catch (err) {
      setFormError(errorMessage(err));
    } finally {
      setPosting(false);
    }
  }

  const canViewFeedback = Boolean(assignmentId && studentId);

  return (
    <RouteGuard allow={["TEACHER", "ADMIN"]}>
      <DashboardShell
        role="teacher"
        userName={user?.fullName ?? ""}
        userEmail={user?.email ?? ""}
      >
        <Header
          title={t.nav.feedback}
          description="Leave written feedback for students on their assignments."
        />
        <div className="space-y-6 p-8">
          <Card>
            <CardHeader>
              <CardTitle>Post feedback</CardTitle>
              <CardDescription>
                Pick a course, assignment, and student, then write your
                feedback.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handlePost} className="space-y-4">
                <div className="grid gap-4 sm:grid-cols-3">
                  <div className="space-y-2">
                    <Label htmlFor="fb-course">Course</Label>
                    <Select
                      value={courseId}
                      onValueChange={(v) => {
                        setCourseId(v);
                        setAssignmentId("");
                      }}
                      disabled={coursesQuery.loading}
                    >
                      <SelectTrigger id="fb-course">
                        <SelectValue placeholder="Select course" />
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
                  <div className="space-y-2">
                    <Label htmlFor="fb-assignment">Assignment</Label>
                    <Select
                      value={assignmentId}
                      onValueChange={setAssignmentId}
                      disabled={!courseId || assignmentsQuery.loading}
                    >
                      <SelectTrigger id="fb-assignment">
                        <SelectValue placeholder="Select assignment" />
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
                  <div className="space-y-2">
                    <Label htmlFor="fb-student">Student</Label>
                    <Select
                      value={studentId}
                      onValueChange={setStudentId}
                      disabled={studentsQuery.loading}
                    >
                      <SelectTrigger id="fb-student">
                        <SelectValue placeholder="Select student" />
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
                </div>
                <div className="space-y-2">
                  <Label htmlFor="fb-body">Feedback</Label>
                  <textarea
                    id="fb-body"
                    value={body}
                    onChange={(e) => setBody(e.target.value)}
                    rows={4}
                    placeholder="Write feedback for the student…"
                    className="flex w-full rounded-[10px] border border-theme bg-theme-input px-3.5 py-2 text-sm text-theme shadow-[var(--shadow-xs)] transition-all duration-200 placeholder:text-theme-muted focus-visible:outline-none focus-visible:border-[var(--ring)] focus-visible:ring-[3px] focus-visible:ring-[var(--ring)]/20"
                  />
                </div>
                {formError && (
                  <p className="text-sm text-red-600">{formError}</p>
                )}
                <Button type="submit" disabled={posting}>
                  {posting ? "Posting…" : "Post feedback"}
                </Button>
              </form>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Feedback history</CardTitle>
              <CardDescription>
                Existing feedback for the selected assignment and student.
              </CardDescription>
            </CardHeader>
            <CardContent>
              {!canViewFeedback ? (
                <EmptyState
                  title="Select an assignment and student"
                  message="Choose both to see existing feedback."
                />
              ) : feedbackQuery.loading ? (
                <LoadingState />
              ) : feedbackQuery.error ? (
                <ErrorState
                  message={feedbackQuery.error.message}
                  onRetry={feedbackQuery.reload}
                />
              ) : (feedbackQuery.data ?? []).length === 0 ? (
                <EmptyState
                  title="No feedback yet"
                  message="Post the first feedback above."
                />
              ) : (
                <ul className="space-y-3">
                  {(feedbackQuery.data ?? []).map((fb) => (
                    <li
                      key={fb.id}
                      className="rounded-xl border border-theme bg-theme-input/40 p-4"
                    >
                      <div className="mb-1 flex items-center justify-between">
                        <span className="text-sm font-medium text-theme">
                          {fb.authorName}
                        </span>
                        <span className="text-xs text-theme-muted">
                          {new Date(fb.createdAt).toLocaleString()}
                        </span>
                      </div>
                      <p className="whitespace-pre-wrap text-sm text-theme-muted">
                        {fb.body}
                      </p>
                    </li>
                  ))}
                </ul>
              )}
            </CardContent>
          </Card>
        </div>
      </DashboardShell>
    </RouteGuard>
  );
}
