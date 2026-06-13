"use client";

import { useState } from "react";
import { Download, FileText } from "lucide-react";
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
import { EmptyState } from "@/components/dashboard/data-states";
import { RouteGuard } from "@/components/auth/route-guard";
import { useAuth } from "@/components/providers/auth-provider";
import { useT } from "@/components/providers/locale-provider";
import {
  downloadMetricsCsv,
  downloadStudentGradesCsv,
  getStudentProgress,
} from "@/lib/api/reports";
import { ApiError } from "@/lib/api";
import type { ProgressReportDto } from "@/types/api/reports";
import type { Dictionary } from "@/lib/i18n/types";

function errorMessage(e: unknown, fallback: string): string {
  return e instanceof ApiError
    ? (e.details?.join(", ") ?? e.message)
    : e instanceof Error
      ? e.message
      : fallback;
}

function fmtNum(value: number | null | undefined): string {
  return value === null || value === undefined ? "—" : Number(value).toFixed(1);
}

function fmtDate(iso: string | null): string {
  if (!iso) return "—";
  const d = new Date(iso);
  return Number.isNaN(d.getTime()) ? iso : d.toLocaleDateString();
}

export default function TeacherReportsPage() {
  const { user } = useAuth();
  const t = useT();
  const tt = t.pages.teacherReports;
  const fallbackError = t.pages.studentContent.error;

  const [studentId, setStudentId] = useState("");
  const [busy, setBusy] = useState<null | "metrics" | "grades" | "progress">(null);
  const [error, setError] = useState<string | null>(null);
  const [report, setReport] = useState<ProgressReportDto | null>(null);

  const parsedId = (() => {
    const n = Number(studentId);
    return studentId.trim() !== "" && Number.isInteger(n) && n > 0 ? n : null;
  })();

  async function handleMetricsCsv() {
    setBusy("metrics");
    setError(null);
    try {
      await downloadMetricsCsv();
    } catch (e) {
      setError(errorMessage(e, fallbackError));
    } finally {
      setBusy(null);
    }
  }

  async function handleGradesCsv() {
    if (parsedId === null) return;
    setBusy("grades");
    setError(null);
    try {
      await downloadStudentGradesCsv(parsedId);
    } catch (e) {
      setError(errorMessage(e, fallbackError));
    } finally {
      setBusy(null);
    }
  }

  async function handleViewProgress() {
    if (parsedId === null) return;
    setBusy("progress");
    setError(null);
    try {
      setReport(await getStudentProgress(parsedId));
    } catch (e) {
      setReport(null);
      setError(errorMessage(e, fallbackError));
    } finally {
      setBusy(null);
    }
  }

  return (
    <RouteGuard allow={["TEACHER"]}>
      <DashboardShell
        role="teacher"
        userName={user?.fullName ?? ""}
        userEmail={user?.email ?? ""}
      >
        <Header
          title={tt.title}
          description={tt.desc}
        />
        <div className="space-y-6 p-8">
          <Card>
            <CardHeader>
              <CardTitle>{tt.metricsRoster}</CardTitle>
              <CardDescription>
                {tt.metricsRosterDesc}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Button onClick={handleMetricsCsv} disabled={busy === "metrics"}>
                <Download className="h-4 w-4" />
                {busy === "metrics" ? tt.preparing : tt.downloadMetrics}
              </Button>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>{tt.perStudent}</CardTitle>
              <CardDescription>
                {tt.perStudentDesc}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex flex-wrap items-end gap-3">
                <div className="space-y-2">
                  <Label htmlFor="studentId">{tt.studentId}</Label>
                  <Input
                    id="studentId"
                    type="number"
                    min={1}
                    inputMode="numeric"
                    placeholder="e.g. 42"
                    value={studentId}
                    onChange={(e) => setStudentId(e.target.value)}
                    className="w-40"
                  />
                </div>
                <Button
                  variant="outline"
                  onClick={handleGradesCsv}
                  disabled={parsedId === null || busy === "grades"}
                >
                  <Download className="h-4 w-4" />
                  {busy === "grades" ? tt.preparing : tt.gradesCsv}
                </Button>
                <Button
                  onClick={handleViewProgress}
                  disabled={parsedId === null || busy === "progress"}
                >
                  <FileText className="h-4 w-4" />
                  {busy === "progress" ? tt.loading : tt.viewProgress}
                </Button>
              </div>
              {error && <p className="mt-3 text-sm text-red-600">{error}</p>}
            </CardContent>
          </Card>

          {report && <ReportView data={report} tt={tt} />}
        </div>
      </DashboardShell>
    </RouteGuard>
  );
}

function ReportView({
  data,
  tt,
}: {
  data: ProgressReportDto;
  tt: Dictionary["pages"]["teacherReports"];
}) {
  const m = data.metrics;
  return (
    <Card>
      <CardHeader>
        <CardTitle>{data.studentName}</CardTitle>
        <CardDescription>
          {data.studentEmail}
          {data.groupName ? ` · ${data.groupName}` : ""}
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {!m || m.insufficientData ? (
          <p className="text-sm text-theme-muted">
            {tt.insufficient}
          </p>
        ) : (
          <div>
            <div className="text-3xl font-bold text-theme">{fmtNum(m.composite)}</div>
            <div className="text-xs text-theme-muted">
              {tt.compositePrefix} · {tt.grades} {fmtNum(m.gradesNorm)} · {tt.attendance} {fmtNum(m.attendanceNorm)} ·
              {" "}{tt.practical} {fmtNum(m.practicalNorm)} · {tt.behavior} {fmtNum(m.behaviorNorm)} · {tt.activity}{" "}
              {fmtNum(m.activityNorm)}
            </div>
          </div>
        )}

        <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
          <Stat label={tt.present} value={data.attendance.present} />
          <Stat label={tt.late} value={data.attendance.late} />
          <Stat label={tt.absent} value={data.attendance.absent} />
          <Stat label={tt.attendancePercent} value={fmtNum(data.attendance.attendancePercent)} />
        </div>

        {data.grades.length === 0 ? (
          <EmptyState title={tt.noGrades} message={tt.noGradesMsg} />
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-theme text-left text-xs font-medium text-theme-muted">
                  <th className="px-3 py-2">{tt.assignment}</th>
                  <th className="px-3 py-2">{tt.score}</th>
                  <th className="px-3 py-2">{tt.max}</th>
                  <th className="px-3 py-2">{tt.graded}</th>
                </tr>
              </thead>
              <tbody>
                {data.grades.map((g, i) => (
                  <tr key={i} className="border-b border-theme/60 last:border-0">
                    <td className="px-3 py-3 font-medium text-theme">{g.assignment}</td>
                    <td className="px-3 py-3 text-theme-muted">{fmtNum(g.value)}</td>
                    <td className="px-3 py-3 text-theme-muted">{fmtNum(g.max)}</td>
                    <td className="px-3 py-3 text-theme-muted">{fmtDate(g.gradedAt)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

function Stat({ label, value }: { label: string; value: number | string }) {
  return (
    <div className="rounded-[10px] border border-theme p-3">
      <div className="text-xs text-theme-muted">{label}</div>
      <div className="text-lg font-semibold text-theme">{value}</div>
    </div>
  );
}
