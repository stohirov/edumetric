"use client";

import { DashboardShell } from "@/components/layout/dashboard-shell";
import { Header } from "@/components/layout/header";
import { ErrorState, LoadingState, EmptyState } from "@/components/dashboard/data-states";
import { RouteGuard } from "@/components/auth/route-guard";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { useAuth } from "@/components/providers/auth-provider";
import { useT } from "@/components/providers/locale-provider";
import { useAsync } from "@/lib/use-async";
import { gradingApi } from "@/lib/api";

function fmtPercent(v: number | null): string {
  return v === null ? "—" : `${v}%`;
}

function fmtValue(v: string | number | null): string {
  return v === null ? "—" : String(v);
}

export default function StudentTranscriptPage() {
  const { user } = useAuth();
  const t = useT();

  const query = useAsync(() => gradingApi.myTranscript(), [user?.id]);
  const rows = query.data ?? [];

  return (
    <RouteGuard allow={["STUDENT"]}>
      <DashboardShell
        role="student"
        userName={user?.fullName ?? ""}
        userEmail={user?.email ?? ""}
      >
        <Header
          title={t.nav.transcript}
          description="Your finalized grades across terms and courses."
        />
        <div className="space-y-6 p-8">
          <Card>
            <CardHeader>
              <CardTitle>Term grades</CardTitle>
            </CardHeader>
            <CardContent>
              {query.loading ? (
                <LoadingState />
              ) : query.error ? (
                <ErrorState
                  message={query.error.message}
                  onRetry={query.reload}
                />
              ) : rows.length === 0 ? (
                <EmptyState
                  title="No grades yet"
                  message="You don't have any finalized term grades."
                />
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="border-b border-theme text-left text-theme-muted">
                        <th className="py-2 pr-4 font-medium">Term</th>
                        <th className="py-2 pr-4 font-medium">Course</th>
                        <th className="py-2 pr-4 font-medium">Final %</th>
                        <th className="py-2 pr-4 font-medium">Letter</th>
                        <th className="py-2 pr-4 font-medium">GPA</th>
                      </tr>
                    </thead>
                    <tbody>
                      {rows.map((r) => (
                        <tr
                          key={r.id}
                          className="border-b border-theme/60 last:border-0"
                        >
                          <td className="py-2 pr-4 text-theme">{r.termName}</td>
                          <td className="py-2 pr-4 text-theme">
                            {r.courseName}
                          </td>
                          <td className="py-2 pr-4 text-theme">
                            {fmtPercent(r.finalPercent)}
                          </td>
                          <td className="py-2 pr-4 text-theme">
                            {fmtValue(r.letter)}
                          </td>
                          <td className="py-2 pr-4 text-theme">
                            {fmtValue(r.gpa)}
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
