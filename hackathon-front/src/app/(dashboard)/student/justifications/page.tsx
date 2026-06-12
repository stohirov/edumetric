"use client";

import { useMemo, useState } from "react";
import { Send } from "lucide-react";
import { DashboardShell } from "@/components/layout/dashboard-shell";
import { Header } from "@/components/layout/header";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { EmptyState, ErrorState, LoadingState } from "@/components/dashboard/data-states";
import { RouteGuard } from "@/components/auth/route-guard";
import { useAuth } from "@/components/providers/auth-provider";
import { useT } from "@/components/providers/locale-provider";
import { useAsync } from "@/lib/use-async";
import { attendanceApi, studentsApi, ApiError } from "@/lib/api";
import type { JustificationDto } from "@/types/api";

function errorMessage(e: unknown): string {
  return e instanceof ApiError
    ? (e.details?.join(", ") ?? e.message)
    : e instanceof Error
      ? e.message
      : "Something went wrong";
}

function statusVariant(
  status: JustificationDto["status"],
): "secondary" | "success" | "destructive" {
  switch (status) {
    case "APPROVED":
      return "success";
    case "REJECTED":
      return "destructive";
    default:
      return "secondary";
  }
}

function formatDate(iso: string | null): string {
  if (!iso) return "—";
  const d = new Date(iso);
  return Number.isNaN(d.getTime()) ? iso : d.toLocaleDateString();
}

export default function StudentJustificationsPage() {
  const { user } = useAuth();
  const t = useT();

  // Source for the lesson picker. There is no dedicated student-facing
  // "my lessons" endpoint, so we surface the lessons that already appear in
  // the student's recent attendance (each carries a lessonId + status). The
  // student can also fall back to typing a raw lesson id.
  const lessonsQuery = useAsync(async () => {
    if (!user) throw new Error("Not authenticated");
    const dashboard = await studentsApi.getMyStudentDashboard();
    return dashboard.recentAttendance;
  }, [user?.id]);

  const requests = useAsync(() => attendanceApi.myJustifications(), [user?.id]);

  const recentLessons = useMemo(() => {
    const seen = new Set<number>();
    const out: { lessonId: number; status: string }[] = [];
    for (const a of lessonsQuery.data ?? []) {
      if (seen.has(a.lessonId)) continue;
      seen.add(a.lessonId);
      out.push({ lessonId: a.lessonId, status: a.status });
    }
    return out;
  }, [lessonsQuery.data]);

  const [selectedLessonId, setSelectedLessonId] = useState<string>("");
  const [manualMode, setManualMode] = useState(false);
  const [manualLessonId, setManualLessonId] = useState<string>("");
  const [reason, setReason] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);

  const usePicker = !manualMode && recentLessons.length > 0;

  const resolvedLessonId = (() => {
    const raw = usePicker ? selectedLessonId : manualLessonId;
    const n = Number(raw);
    return raw !== "" && Number.isInteger(n) && n > 0 ? n : null;
  })();

  const canSubmit =
    !submitting && resolvedLessonId !== null && reason.trim().length > 0;

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setFormError(null);
    if (resolvedLessonId === null) {
      setFormError("Please choose a lesson (or enter a valid lesson ID).");
      return;
    }
    if (reason.trim().length === 0) {
      setFormError("Please describe the reason for your absence.");
      return;
    }
    setSubmitting(true);
    try {
      await attendanceApi.submitJustification({
        lessonId: resolvedLessonId,
        reason: reason.trim(),
      });
      setReason("");
      setSelectedLessonId("");
      setManualLessonId("");
      requests.reload();
    } catch (err) {
      setFormError(errorMessage(err));
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <RouteGuard allow={["STUDENT"]}>
      <DashboardShell
        role="student"
        userName={user?.fullName ?? ""}
        userEmail={user?.email ?? ""}
      >
        <Header
          title={t.nav.justifications}
          description="Submit an excuse for a missed lesson and track your requests."
        />
        <div className="space-y-6 p-8">
          <Card>
            <CardHeader>
              <CardTitle>Submit an excuse</CardTitle>
              <CardDescription>
                Choose the lesson you missed and explain why. Your teacher will
                review the request.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="lesson">Lesson</Label>
                  {usePicker ? (
                    <>
                      <Select
                        value={selectedLessonId}
                        onValueChange={setSelectedLessonId}
                      >
                        <SelectTrigger id="lesson">
                          <SelectValue placeholder="Select a recent lesson" />
                        </SelectTrigger>
                        <SelectContent>
                          {recentLessons.map((l) => (
                            <SelectItem
                              key={l.lessonId}
                              value={String(l.lessonId)}
                            >
                              {`Lesson #${l.lessonId} — ${l.status}`}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <button
                        type="button"
                        className="text-xs font-medium text-indigo-600 hover:underline"
                        onClick={() => setManualMode(true)}
                      >
                        Enter a lesson ID manually instead
                      </button>
                    </>
                  ) : (
                    <>
                      <Input
                        id="lesson"
                        type="number"
                        min={1}
                        inputMode="numeric"
                        placeholder="e.g. 42"
                        value={manualLessonId}
                        onChange={(e) => setManualLessonId(e.target.value)}
                      />
                      <p className="text-xs text-theme-muted">
                        Find the lesson ID on your attendance page.
                      </p>
                      {recentLessons.length > 0 && (
                        <button
                          type="button"
                          className="text-xs font-medium text-indigo-600 hover:underline"
                          onClick={() => setManualMode(false)}
                        >
                          Pick from your recent lessons instead
                        </button>
                      )}
                    </>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="reason">Reason</Label>
                  <textarea
                    id="reason"
                    rows={4}
                    value={reason}
                    onChange={(e) => setReason(e.target.value)}
                    placeholder="Explain why you were absent…"
                    className="flex w-full rounded-[10px] border border-theme bg-theme-input px-3.5 py-2 text-sm shadow-[var(--shadow-xs)] transition-all duration-200 placeholder:text-[var(--foreground-muted)] hover:border-[var(--ring)]/40 focus-visible:border-[var(--ring)] focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-[var(--ring)]/20 disabled:cursor-not-allowed disabled:opacity-50"
                  />
                </div>

                {formError && (
                  <p className="text-sm text-red-600">{formError}</p>
                )}

                <Button type="submit" disabled={!canSubmit}>
                  <Send className="h-4 w-4" />
                  {submitting ? "Submitting…" : "Submit excuse"}
                </Button>
              </form>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>My requests</CardTitle>
              <CardDescription>
                Every excuse you have submitted and its current status.
              </CardDescription>
            </CardHeader>
            <CardContent>
              {requests.loading ? (
                <LoadingState />
              ) : requests.error ? (
                <ErrorState
                  message={requests.error.message}
                  onRetry={requests.reload}
                />
              ) : (requests.data ?? []).length === 0 ? (
                <EmptyState
                  title="No requests yet"
                  message="Submit an excuse above to get started."
                />
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="border-b border-theme text-left text-xs font-medium text-theme-muted">
                        <th className="px-3 py-2">Lesson</th>
                        <th className="px-3 py-2">Reason</th>
                        <th className="px-3 py-2">Status</th>
                        <th className="px-3 py-2">Submitted</th>
                      </tr>
                    </thead>
                    <tbody>
                      {(requests.data ?? []).map((j) => (
                        <tr
                          key={j.id}
                          className="border-b border-theme/60 last:border-0"
                        >
                          <td className="px-3 py-3">
                            <div className="font-medium text-theme">
                              {j.lessonTopic}
                            </div>
                            <div className="text-xs text-theme-muted">
                              {j.courseName}
                            </div>
                          </td>
                          <td className="max-w-xs px-3 py-3 text-theme-muted">
                            {j.reason}
                          </td>
                          <td className="px-3 py-3">
                            <Badge variant={statusVariant(j.status)}>
                              {j.status}
                            </Badge>
                          </td>
                          <td className="px-3 py-3 text-theme-muted">
                            {formatDate(j.createdAt)}
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
