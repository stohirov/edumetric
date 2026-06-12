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
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useAuth } from "@/components/providers/auth-provider";
import { useT } from "@/components/providers/locale-provider";
import { useAsync } from "@/lib/use-async";
import { gradingApi, ApiError } from "@/lib/api";
import type { GradeAppealDto } from "@/types/api";

function errorMessage(e: unknown): string {
  return e instanceof ApiError
    ? (e.details?.join(", ") ?? e.message)
    : e instanceof Error
      ? e.message
      : "Something went wrong";
}

type ActionMode = "resolve" | "reject";

function AppealRow({
  appeal,
  onReload,
}: {
  appeal: GradeAppealDto;
  onReload: () => void;
}) {
  const [mode, setMode] = useState<ActionMode | null>(null);
  const [resolution, setResolution] = useState("");
  const [newValue, setNewValue] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  function reset() {
    setMode(null);
    setResolution("");
    setNewValue("");
    setError(null);
  }

  async function submit() {
    setBusy(true);
    setError(null);
    try {
      if (mode === "resolve") {
        await gradingApi.resolveAppeal(appeal.id, {
          resolution: resolution.trim() || undefined,
          newValue: newValue.trim() === "" ? undefined : Number(newValue),
        });
      } else if (mode === "reject") {
        await gradingApi.rejectAppeal(appeal.id, {
          resolution: resolution.trim() || undefined,
        });
      }
      reset();
      onReload();
    } catch (err) {
      setError(errorMessage(err));
    } finally {
      setBusy(false);
    }
  }

  return (
    <>
      <tr className="border-b border-theme/60 align-top">
        <td className="py-2.5 pr-4 text-theme">{appeal.studentName}</td>
        <td className="py-2.5 pr-4 text-theme-muted">{appeal.courseName}</td>
        <td className="py-2.5 pr-4 text-theme">{appeal.assignmentName}</td>
        <td className="py-2.5 pr-4 text-theme-muted">{appeal.reason}</td>
        <td className="py-2.5 pr-4 text-theme-muted">
          {new Date(appeal.createdAt).toLocaleDateString()}
        </td>
        <td className="py-2.5 pr-0">
          <div className="flex gap-2">
            <Button
              size="sm"
              variant="secondary"
              onClick={() => setMode(mode === "resolve" ? null : "resolve")}
            >
              Resolve
            </Button>
            <Button
              size="sm"
              variant="destructive"
              onClick={() => setMode(mode === "reject" ? null : "reject")}
            >
              Reject
            </Button>
          </div>
        </td>
      </tr>
      {mode && (
        <tr className="border-b border-theme/60">
          <td colSpan={6} className="bg-theme-input/40 px-4 py-4">
            <div className="space-y-3">
              {mode === "resolve" && (
                <div className="space-y-1.5">
                  <Label htmlFor={`new-value-${appeal.id}`}>
                    New grade value (optional)
                  </Label>
                  <Input
                    id={`new-value-${appeal.id}`}
                    type="number"
                    value={newValue}
                    onChange={(e) => setNewValue(e.target.value)}
                    placeholder="e.g. 95"
                    className="max-w-[200px]"
                  />
                </div>
              )}
              <div className="space-y-1.5">
                <Label htmlFor={`resolution-${appeal.id}`}>
                  {mode === "resolve"
                    ? "Resolution note (optional)"
                    : "Reason for rejection (optional)"}
                </Label>
                <textarea
                  id={`resolution-${appeal.id}`}
                  value={resolution}
                  onChange={(e) => setResolution(e.target.value)}
                  rows={3}
                  placeholder="Add a note for the student…"
                  className="flex w-full rounded-[10px] border border-theme bg-theme-input px-3.5 py-2 text-sm text-theme shadow-[var(--shadow-xs)] transition-all duration-200 placeholder:text-theme-muted focus-visible:outline-none focus-visible:border-[var(--ring)] focus-visible:ring-[3px] focus-visible:ring-[var(--ring)]/20"
                />
              </div>
              {error && <p className="text-sm text-red-600">{error}</p>}
              <div className="flex gap-2">
                <Button size="sm" onClick={submit} disabled={busy}>
                  {busy
                    ? "Saving…"
                    : mode === "resolve"
                      ? "Confirm resolve"
                      : "Confirm reject"}
                </Button>
                <Button
                  size="sm"
                  variant="ghost"
                  onClick={reset}
                  disabled={busy}
                >
                  Cancel
                </Button>
              </div>
            </div>
          </td>
        </tr>
      )}
    </>
  );
}

export default function TeacherAppealsPage() {
  const { user } = useAuth();
  const t = useT();

  const query = useAsync(() => gradingApi.pendingAppeals(), [user?.id]);
  const appeals = query.data ?? [];

  return (
    <RouteGuard allow={["TEACHER", "ADMIN"]}>
      <DashboardShell
        role="teacher"
        userName={user?.fullName ?? ""}
        userEmail={user?.email ?? ""}
      >
        <Header
          title={t.nav.appeals}
          description="Review and resolve pending grade appeals from students."
        />
        <div className="space-y-6 p-8">
          <Card>
            <CardHeader>
              <CardTitle>Pending appeals</CardTitle>
              <CardDescription>
                Resolve with an optional new grade, or reject with a note.
              </CardDescription>
            </CardHeader>
            <CardContent>
              {query.loading ? (
                <LoadingState />
              ) : query.error ? (
                <ErrorState
                  message={query.error.message}
                  onRetry={query.reload}
                />
              ) : appeals.length === 0 ? (
                <EmptyState
                  title="No pending appeals"
                  message="There's nothing waiting for your review right now."
                />
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="border-b border-theme text-left text-theme-muted">
                        <th className="py-2 pr-4 font-medium">Student</th>
                        <th className="py-2 pr-4 font-medium">Course</th>
                        <th className="py-2 pr-4 font-medium">Assignment</th>
                        <th className="py-2 pr-4 font-medium">Reason</th>
                        <th className="py-2 pr-4 font-medium">Created</th>
                        <th className="py-2 pr-0 font-medium">Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {appeals.map((appeal) => (
                        <AppealRow
                          key={appeal.id}
                          appeal={appeal}
                          onReload={query.reload}
                        />
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
