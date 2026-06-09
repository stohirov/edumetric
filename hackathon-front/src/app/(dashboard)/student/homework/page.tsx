"use client";

import { useState } from "react";
import { CalendarClock, ChevronRight, Paperclip } from "lucide-react";
import { DashboardShell } from "@/components/layout/dashboard-shell";
import { Header } from "@/components/layout/header";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ErrorState, LoadingState } from "@/components/dashboard/data-states";
import { RouteGuard } from "@/components/auth/route-guard";
import { useAuth } from "@/components/providers/auth-provider";
import { useT } from "@/components/providers/locale-provider";
import { useAsync } from "@/lib/use-async";
import { homeworkApi } from "@/lib/api";
import type { HomeworkAssignmentDto } from "@/types/api/homework";
import { SubmissionSheet } from "@/components/homework/submission-sheet";
import { homeworkStatusVariant } from "@/components/homework/homework-status";

export default function StudentHomeworkPage() {
  const { user } = useAuth();
  const t = useT();
  const tt = t.pages.studentHomework;

  const query = useAsync(async () => {
    if (!user) throw new Error("Not authenticated");
    return homeworkApi.getMyHomework();
  }, [user?.id]);

  const [selected, setSelected] = useState<HomeworkAssignmentDto | null>(null);
  const [sheetOpen, setSheetOpen] = useState(false);

  const items = query.data ?? [];

  const statusLabel = (a: HomeworkAssignmentDto) => {
    if (a.graded) return `${a.gradeValue}/${a.maxValue}`;
    if (a.submitted) return tt.statusSubmitted;
    if (a.overdue) return tt.overdue;
    return tt.statusPending;
  };

  const open = (a: HomeworkAssignmentDto) => {
    setSelected(a);
    setSheetOpen(true);
  };

  return (
    <RouteGuard allow={["STUDENT"]}>
      <DashboardShell
        role="student"
        userName={user?.fullName ?? ""}
        userEmail={user?.email ?? ""}
      >
        <Header title={tt.title} description={tt.desc} />
        <div className="p-8">
          {query.loading ? (
            <LoadingState />
          ) : query.error ? (
            <ErrorState message={query.error.message} onRetry={query.reload} />
          ) : (
            <Card>
              <CardHeader>
                <CardTitle>{tt.card}</CardTitle>
                <CardDescription>
                  {items[0]?.courseName ?? ""}
                </CardDescription>
              </CardHeader>
              <CardContent>
                <ul className="divide-y divide-slate-100">
                  {items.map((a) => (
                    <li key={a.assignmentId}>
                      <button
                        type="button"
                        onClick={() => open(a)}
                        className="group flex w-full items-center justify-between gap-3 py-3.5 text-left transition-colors hover:bg-slate-50/60 -mx-2 px-2 rounded-lg"
                      >
                        <div className="min-w-0">
                          <p className="truncate font-medium text-theme">
                            {a.name}
                          </p>
                          <p className="mt-0.5 flex items-center gap-3 text-xs text-theme-muted">
                            <span className="inline-flex items-center gap-1">
                              <CalendarClock className="h-3.5 w-3.5" />
                              {a.dueDate
                                ? `${tt.due}: ${new Date(a.dueDate).toLocaleDateString()}`
                                : tt.noDue}
                            </span>
                            {a.hasFile && (
                              <span className="inline-flex items-center gap-1 text-indigo-500">
                                <Paperclip className="h-3.5 w-3.5" />
                                {a.fileName}
                              </span>
                            )}
                          </p>
                        </div>
                        <div className="flex shrink-0 items-center gap-2">
                          <Badge variant={homeworkStatusVariant(a)}>
                            {statusLabel(a)}
                          </Badge>
                          <ChevronRight className="h-4 w-4 text-slate-300 transition-colors group-hover:text-slate-400" />
                        </div>
                      </button>
                    </li>
                  ))}
                  {items.length === 0 && (
                    <li className="py-10 text-center text-sm text-theme-muted">
                      {tt.empty}
                    </li>
                  )}
                </ul>
              </CardContent>
            </Card>
          )}
        </div>

        <SubmissionSheet
          assignment={selected}
          open={sheetOpen}
          onOpenChange={setSheetOpen}
          onSubmitted={query.reload}
        />
      </DashboardShell>
    </RouteGuard>
  );
}
