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
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
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
import {
  gradingApi,
  coursesApi,
  assignmentsApi,
  studentsApi,
  ApiError,
} from "@/lib/api";
import type { AssignmentDto, StudentDto } from "@/types/api";

function errorMessage(e: unknown): string {
  return e instanceof ApiError
    ? (e.details?.join(", ") ?? e.message)
    : e instanceof Error
      ? e.message
      : "Something went wrong";
}

export default function TeacherPeerReviewsPage() {
  const { user } = useAuth();
  const t = useT();

  const [courseId, setCourseId] = useState<number | null>(null);
  const [assignmentId, setAssignmentId] = useState<number | null>(null);
  const [reviewerId, setReviewerId] = useState<number | null>(null);
  const [revieweeId, setRevieweeId] = useState<number | null>(null);
  const [assigning, setAssigning] = useState(false);
  const [assignError, setAssignError] = useState<string | null>(null);

  const coursesQuery = useAsync(
    () => coursesApi.listCourses({ page: 0, size: 200 }),
    [user?.id],
  );
  const studentsQuery = useAsync(
    () => studentsApi.listStudents({ page: 0, size: 200 }),
    [user?.id],
  );

  const assignmentsQuery = useAsync<AssignmentDto[]>(
    () =>
      courseId === null
        ? Promise.resolve([])
        : assignmentsApi.listByCourse(courseId),
    [courseId],
  );

  const reviewsQuery = useAsync(
    () =>
      assignmentId === null
        ? Promise.resolve([])
        : gradingApi.listPeerReviews(assignmentId),
    [assignmentId],
  );

  const courses = coursesQuery.data?.items ?? [];
  const students: StudentDto[] = studentsQuery.data?.items ?? [];
  const assignments = assignmentsQuery.data ?? [];

  const studentLabel = (s: StudentDto) =>
    s.groupName ? `${s.fullName} — ${s.groupName}` : s.fullName;

  const canAssign =
    assignmentId !== null &&
    reviewerId !== null &&
    revieweeId !== null &&
    !assigning;

  const reviews = useMemo(() => reviewsQuery.data ?? [], [reviewsQuery.data]);

  async function handleAssign() {
    if (assignmentId === null || reviewerId === null || revieweeId === null) {
      return;
    }
    setAssigning(true);
    setAssignError(null);
    try {
      await gradingApi.assignPeerReview({
        assignmentId,
        reviewerStudentId: reviewerId,
        revieweeStudentId: revieweeId,
      });
      setReviewerId(null);
      setRevieweeId(null);
      reviewsQuery.reload();
    } catch (e) {
      setAssignError(errorMessage(e));
    } finally {
      setAssigning(false);
    }
  }

  return (
    <RouteGuard allow={["TEACHER", "ADMIN"]}>
      <DashboardShell
        role="teacher"
        userName={user?.fullName ?? ""}
        userEmail={user?.email ?? ""}
      >
        <Header
          title={t.nav.peerReviews}
          description="Assign peer reviewers and track submitted reviews."
        />
        <div className="space-y-6 p-8">
          {/* Pickers */}
          <Card>
            <CardHeader>
              <CardTitle>Select assignment</CardTitle>
            </CardHeader>
            <CardContent className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-1.5">
                <Label>Course</Label>
                <Select
                  value={courseId === null ? undefined : String(courseId)}
                  onValueChange={(v) => {
                    setCourseId(Number(v));
                    setAssignmentId(null);
                    setReviewerId(null);
                    setRevieweeId(null);
                    setAssignError(null);
                  }}
                  disabled={coursesQuery.loading}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Choose a course" />
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
              <div className="space-y-1.5">
                <Label>Assignment</Label>
                <Select
                  value={
                    assignmentId === null ? undefined : String(assignmentId)
                  }
                  onValueChange={(v) => {
                    setAssignmentId(Number(v));
                    setAssignError(null);
                  }}
                  disabled={courseId === null || assignmentsQuery.loading}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Choose an assignment" />
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
            </CardContent>
          </Card>

          {/* Assign a review */}
          <Card>
            <CardHeader>
              <CardTitle>Assign a review</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid gap-4 sm:grid-cols-2">
                <div className="space-y-1.5">
                  <Label>Reviewer</Label>
                  <Select
                    value={reviewerId === null ? undefined : String(reviewerId)}
                    onValueChange={(v) => setReviewerId(Number(v))}
                    disabled={assignmentId === null || studentsQuery.loading}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Choose a reviewer" />
                    </SelectTrigger>
                    <SelectContent>
                      {students.map((s) => (
                        <SelectItem key={s.id} value={String(s.id)}>
                          {studentLabel(s)}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-1.5">
                  <Label>Reviewee</Label>
                  <Select
                    value={revieweeId === null ? undefined : String(revieweeId)}
                    onValueChange={(v) => setRevieweeId(Number(v))}
                    disabled={assignmentId === null || studentsQuery.loading}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Choose a reviewee" />
                    </SelectTrigger>
                    <SelectContent>
                      {students.map((s) => (
                        <SelectItem key={s.id} value={String(s.id)}>
                          {studentLabel(s)}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
              {assignError && (
                <p className="text-sm text-red-600">{assignError}</p>
              )}
              <Button onClick={handleAssign} disabled={!canAssign}>
                {assigning ? "Assigning…" : "Assign"}
              </Button>
            </CardContent>
          </Card>

          {/* Existing reviews */}
          <Card>
            <CardHeader>
              <CardTitle>Assigned reviews</CardTitle>
            </CardHeader>
            <CardContent>
              {assignmentId === null ? (
                <EmptyState
                  title="No assignment selected"
                  message="Choose a course and assignment to see its peer reviews."
                />
              ) : reviewsQuery.loading ? (
                <LoadingState />
              ) : reviewsQuery.error ? (
                <ErrorState
                  message={reviewsQuery.error.message}
                  onRetry={reviewsQuery.reload}
                />
              ) : reviews.length === 0 ? (
                <EmptyState
                  title="No reviews yet"
                  message="Assign a reviewer above to get started."
                />
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="border-b border-theme text-left text-theme-muted">
                        <th className="py-2 pr-4 font-medium">Reviewer</th>
                        <th className="py-2 pr-4 font-medium">Reviewee</th>
                        <th className="py-2 pr-4 font-medium">Status</th>
                        <th className="py-2 pr-4 font-medium">Score</th>
                        <th className="py-2 font-medium">Comments</th>
                      </tr>
                    </thead>
                    <tbody>
                      {reviews.map((r) => (
                        <tr
                          key={r.id}
                          className="border-b border-theme/60 text-theme"
                        >
                          <td className="py-2 pr-4">{r.reviewerName}</td>
                          <td className="py-2 pr-4">{r.revieweeName}</td>
                          <td className="py-2 pr-4">
                            <Badge
                              variant={
                                r.status === "SUBMITTED"
                                  ? "success"
                                  : "secondary"
                              }
                            >
                              {r.status}
                            </Badge>
                          </td>
                          <td className="py-2 pr-4">
                            {r.score === null ? "—" : r.score}
                          </td>
                          <td className="py-2 text-theme-muted">
                            {r.comments ?? "—"}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </DashboardShell>
    </RouteGuard>
  );
}
