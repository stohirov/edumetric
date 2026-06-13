"use client";

import { Printer } from "lucide-react";
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
import { EmptyState, ErrorState, LoadingState } from "@/components/dashboard/data-states";
import { RouteGuard } from "@/components/auth/route-guard";
import { useAuth } from "@/components/providers/auth-provider";
import { useT } from "@/components/providers/locale-provider";
import { useAsync } from "@/lib/use-async";
import { getMyProgress } from "@/lib/api/reports";
import type { ProgressReportDto } from "@/types/api/reports";
import type { Dictionary } from "@/lib/i18n/types";

function fmtNum(value: number | null | undefined): string {
  return value === null || value === undefined ? "—" : Number(value).toFixed(1);
}

function fmtDate(iso: string | null): string {
  if (!iso) return "—";
  const d = new Date(iso);
  return Number.isNaN(d.getTime()) ? iso : d.toLocaleDateString();
}

type DimLabelKey = keyof Dictionary["pages"]["studentProgress"]["dimensions"];

const DIMENSIONS: {
  labelKey: DimLabelKey;
  key: keyof NonNullable<ProgressReportDto["metrics"]>;
}[] = [
  { labelKey: "grades", key: "gradesNorm" },
  { labelKey: "attendance", key: "attendanceNorm" },
  { labelKey: "practical", key: "practicalNorm" },
  { labelKey: "behavior", key: "behaviorNorm" },
  { labelKey: "activity", key: "activityNorm" },
  { labelKey: "growthBonus", key: "growthBonus" },
  { labelKey: "consistencyBonus", key: "consistencyBonus" },
];

export default function StudentProgressPage() {
  const { user } = useAuth();
  const t = useT();
  const tt = t.pages.studentProgress;
  const report = useAsync(() => getMyProgress(), [user?.id]);

  return (
    <RouteGuard allow={["STUDENT"]}>
      <DashboardShell
        role="student"
        userName={user?.fullName ?? ""}
        userEmail={user?.email ?? ""}
      >
        <Header
          title={tt.title}
          description={tt.desc}
        />
        <div className="space-y-6 p-8">
          <div className="flex justify-end print:hidden">
            <Button onClick={() => window.print()}>
              <Printer className="h-4 w-4" />
              {tt.print}
            </Button>
          </div>

          {report.loading ? (
            <LoadingState />
          ) : report.error ? (
            <ErrorState message={report.error.message} onRetry={report.reload} />
          ) : !report.data ? (
            <EmptyState title={tt.noReport} message={tt.noReportMsg} />
          ) : (
            <ProgressContent data={report.data} tt={tt} />
          )}
        </div>
      </DashboardShell>
    </RouteGuard>
  );
}

function ProgressContent({
  data,
  tt,
}: {
  data: ProgressReportDto;
  tt: Dictionary["pages"]["studentProgress"];
}) {
  const m = data.metrics;
  return (
    <>
      <Card>
        <CardHeader>
          <CardTitle>{data.studentName}</CardTitle>
          <CardDescription>
            {data.studentEmail}
            {data.groupName ? ` · ${data.groupName}` : ""}
          </CardDescription>
        </CardHeader>
        <CardContent>
          {!m || m.insufficientData ? (
            <p className="text-sm text-theme-muted">
              {tt.insufficient}
            </p>
          ) : (
            <div className="space-y-4">
              <div>
                <div className="text-4xl font-bold text-theme">{fmtNum(m.composite)}</div>
                <div className="text-xs text-theme-muted">
                  {tt.compositePrefix} {m.formulaVersion} · {m.sampleSize} {tt.samples} · {tt.computed}{" "}
                  {fmtDate(m.computedAt)}
                </div>
              </div>
              <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
                {DIMENSIONS.map((d) => (
                  <div
                    key={d.key}
                    className="rounded-[10px] border border-theme p-3"
                  >
                    <div className="text-xs text-theme-muted">{tt.dimensions[d.labelKey]}</div>
                    <div className="text-lg font-semibold text-theme">
                      {fmtNum(m[d.key] as number | null)}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>{tt.attendance}</CardTitle>
          <CardDescription>
            {tt.attendanceDesc.replace(
              "{percent}",
              fmtNum(data.attendance.attendancePercent),
            )}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
            <Stat label={tt.present} value={data.attendance.present} />
            <Stat label={tt.late} value={data.attendance.late} />
            <Stat label={tt.absent} value={data.attendance.absent} />
            <Stat label={tt.excused} value={data.attendance.excused} />
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>{tt.recentGrades}</CardTitle>
          <CardDescription>{tt.recentGradesDesc}</CardDescription>
        </CardHeader>
        <CardContent>
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

      <Card>
        <CardHeader>
          <CardTitle>{tt.trend}</CardTitle>
          <CardDescription>{tt.trendDesc}</CardDescription>
        </CardHeader>
        <CardContent>
          {data.trend.length === 0 ? (
            <EmptyState title={tt.noHistory} message={tt.noHistoryMsg} />
          ) : (
            <ul className="space-y-1 text-sm">
              {data.trend.map((p, i) => (
                <li key={i} className="flex justify-between border-b border-theme/60 py-1 last:border-0">
                  <span className="text-theme-muted">{fmtDate(p.date)}</span>
                  <span className="font-medium text-theme">{fmtNum(p.composite)}</span>
                </li>
              ))}
            </ul>
          )}
        </CardContent>
      </Card>
    </>
  );
}

function Stat({ label, value }: { label: string; value: number }) {
  return (
    <div className="rounded-[10px] border border-theme p-3">
      <div className="text-xs text-theme-muted">{label}</div>
      <div className="text-lg font-semibold text-theme">{value}</div>
    </div>
  );
}
