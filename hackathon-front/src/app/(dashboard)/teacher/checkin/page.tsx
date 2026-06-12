"use client";

import { useEffect, useState } from "react";
import QRCode from "qrcode";
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
import { Badge } from "@/components/ui/badge";
import { useAuth } from "@/components/providers/auth-provider";
import { useT } from "@/components/providers/locale-provider";
import { useAsync } from "@/lib/use-async";
import { attendanceApi, lessonsApi, ApiError } from "@/lib/api";
import type { LessonDto } from "@/types/api";

function errMessage(e: unknown): string {
  return e instanceof ApiError
    ? (e.details?.join(", ") ?? e.message)
    : e instanceof Error
      ? e.message
      : "Something went wrong";
}

function formatTime(iso: string): string {
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return "";
  return d.toLocaleTimeString(undefined, {
    hour: "2-digit",
    minute: "2-digit",
  });
}

export default function TeacherCheckinPage() {
  const { user } = useAuth();
  const t = useT();
  const [selectedLessonId, setSelectedLessonId] = useState<number | null>(null);
  const [busy, setBusy] = useState(false);
  const [actionError, setActionError] = useState<string | null>(null);
  const [qrDataUrl, setQrDataUrl] = useState<string>("");

  const lessonsQuery = useAsync(() => lessonsApi.getTodayLessons(), [user?.id]);

  const activeLessonId =
    selectedLessonId ?? lessonsQuery.data?.[0]?.id ?? null;
  const lesson: LessonDto | null =
    lessonsQuery.data?.find((l) => l.id === activeLessonId) ?? null;

  const statusQuery = useAsync(async () => {
    if (activeLessonId == null) return null;
    return attendanceApi.checkinStatus(activeLessonId);
  }, [activeLessonId]);

  const checkin = statusQuery.data;
  const code = checkin?.open ? checkin.code : null;

  // Render the QR code whenever an open code is present. State is only set inside the
  // async callback (never synchronously in the effect body); the QR <img> is gated on `code`.
  useEffect(() => {
    if (!code) return;
    let cancelled = false;
    const origin =
      typeof window !== "undefined" ? window.location.origin : "";
    const target = `${origin}/student/checkin?code=${encodeURIComponent(code)}`;
    QRCode.toDataURL(target, { margin: 1, width: 240 })
      .then((url) => {
        if (!cancelled) setQrDataUrl(url);
      })
      .catch(() => {
        if (!cancelled) setQrDataUrl("");
      });
    return () => {
      cancelled = true;
    };
  }, [code]);

  const open = async () => {
    if (activeLessonId == null) return;
    setBusy(true);
    setActionError(null);
    try {
      await attendanceApi.openCheckin(activeLessonId);
      statusQuery.reload();
    } catch (e) {
      setActionError(errMessage(e));
    } finally {
      setBusy(false);
    }
  };

  const close = async () => {
    if (activeLessonId == null) return;
    setBusy(true);
    setActionError(null);
    try {
      await attendanceApi.closeCheckin(activeLessonId);
      statusQuery.reload();
    } catch (e) {
      setActionError(errMessage(e));
    } finally {
      setBusy(false);
    }
  };

  const lessons = lessonsQuery.data ?? [];

  return (
    <RouteGuard allow={["TEACHER", "ADMIN"]}>
      <DashboardShell
        role="teacher"
        userName={user?.fullName ?? ""}
        userEmail={user?.email ?? ""}
      >
        <Header
          title={t.nav.checkin}
          description="Open a check-in so students can mark themselves present by scanning the QR code or entering the code."
        />
        <div className="space-y-6 p-8">
          {lessonsQuery.loading ? (
            <LoadingState label="Loading today's lessons…" />
          ) : lessonsQuery.error ? (
            <ErrorState
              message={lessonsQuery.error.message}
              onRetry={lessonsQuery.reload}
            />
          ) : lessons.length === 0 ? (
            <EmptyState
              title="No lessons today"
              message="Check-in can only be opened against a lesson scheduled for today."
            />
          ) : (
            <>
              <div className="flex flex-wrap gap-2">
                {lessons.map((l) => (
                  <button
                    key={l.id}
                    type="button"
                    onClick={() => {
                      setSelectedLessonId(l.id);
                      setActionError(null);
                    }}
                    className={
                      "rounded-lg border px-3 py-2 text-left text-sm transition-colors " +
                      (l.id === activeLessonId
                        ? "border-indigo-300 bg-indigo-50 text-indigo-700"
                        : "border-slate-200 bg-white text-slate-600 hover:bg-slate-50")
                    }
                  >
                    <span className="block font-medium">
                      {l.topic || l.courseName || "Lesson"}
                    </span>
                    <span className="mt-0.5 block text-xs text-slate-400">
                      {l.courseName}
                      {l.groupName ? ` · ${l.groupName}` : ""}
                      {l.scheduledAt ? ` · ${formatTime(l.scheduledAt)}` : ""}
                    </span>
                  </button>
                ))}
              </div>

              <Card className="max-w-xl">
                <CardHeader>
                  <CardTitle>
                    {lesson?.topic || lesson?.courseName || "Lesson"}
                  </CardTitle>
                  <CardDescription>
                    {lesson
                      ? [lesson.courseName, lesson.groupName]
                          .filter(Boolean)
                          .join(" · ")
                      : ""}
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  {actionError ? (
                    <div className="rounded-md border border-rose-200 bg-rose-50 px-3 py-2 text-sm text-rose-700">
                      {actionError}
                    </div>
                  ) : null}

                  {statusQuery.loading ? (
                    <LoadingState label="Loading check-in…" />
                  ) : statusQuery.error ? (
                    <ErrorState
                      message={statusQuery.error.message}
                      onRetry={statusQuery.reload}
                    />
                  ) : checkin?.open && code ? (
                    <div className="space-y-4">
                      <div className="flex items-center gap-2">
                        <Badge variant="success">Open</Badge>
                        <span className="text-sm text-theme-muted">
                          Students can check in now.
                        </span>
                      </div>
                      <div className="flex flex-col items-center gap-4 rounded-xl border border-theme bg-white p-6">
                        <span className="text-xs font-medium uppercase tracking-wide text-slate-400">
                          Check-in code
                        </span>
                        <span className="font-mono text-5xl font-bold tracking-[0.25em] text-theme">
                          {code}
                        </span>
                        {qrDataUrl ? (
                          // eslint-disable-next-line @next/next/no-img-element
                          <img
                            src={qrDataUrl}
                            alt="Check-in QR code"
                            className="rounded-md border border-theme bg-white p-2"
                            width={240}
                            height={240}
                          />
                        ) : null}
                        <span className="text-center text-xs text-theme-muted">
                          Scan to open the check-in page, or enter the code
                          manually.
                        </span>
                      </div>
                      <Button
                        type="button"
                        variant="destructive"
                        disabled={busy}
                        onClick={close}
                      >
                        {busy ? "Closing…" : "Close check-in"}
                      </Button>
                    </div>
                  ) : (
                    <div className="space-y-4">
                      <div className="flex items-center gap-2">
                        <Badge variant="secondary">Closed</Badge>
                        <span className="text-sm text-theme-muted">
                          No active check-in for this lesson.
                        </span>
                      </div>
                      <Button type="button" disabled={busy} onClick={open}>
                        {busy ? "Opening…" : "Open check-in"}
                      </Button>
                    </div>
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
