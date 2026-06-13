"use client";

import { Badge } from "@/components/ui/badge";
import { useT } from "@/components/providers/locale-provider";
import { cn } from "@/lib/utils";
import type { SubmissionDto } from "@/types/api/submissions";

function tone(percent: number | null): string {
  if (percent == null) return "text-theme-muted";
  if (percent >= 80) return "text-emerald-600";
  if (percent >= 60) return "text-amber-600";
  return "text-rose-600";
}

/**
 * Renders the unified submission feed — homework uploads and quiz attempts in one
 * list. Pass {@code showStudent} for the teacher/course view.
 */
export function SubmissionList({
  items,
  showStudent = false,
}: {
  items: SubmissionDto[];
  showStudent?: boolean;
}) {
  const t = useT();
  const tt = t.pages.submissions;

  return (
    <ul className="divide-y divide-slate-100">
      {items.map((s) => {
        const pct = s.percent != null ? Math.round(s.percent) : null;
        return (
          <li
            key={s.id}
            className="flex items-center justify-between gap-3 py-3"
          >
            <div className="min-w-0">
              <div className="flex items-center gap-2">
                <p className="truncate font-medium text-theme">{s.title}</p>
                <Badge variant={s.kind === "QUIZ" ? "secondary" : "outline"}>
                  {s.kind === "QUIZ" ? tt.kindQuiz : tt.kindHomework}
                </Badge>
              </div>
              <p className="text-xs text-theme-muted">
                {showStudent ? `${s.studentName} · ` : ""}
                {s.courseName} · {new Date(s.submittedAt).toLocaleDateString()}
                {s.kind === "QUIZ" && s.attemptCount > 0
                  ? ` · ${s.attemptCount} ${tt.attempts}`
                  : ""}
              </p>
            </div>
            <div className="flex items-center gap-3 whitespace-nowrap text-right">
              {s.score != null && s.maxScore != null && (
                <span
                  className={cn(
                    "text-sm font-semibold tabular-nums",
                    tone(s.percent),
                  )}
                >
                  {s.score}/{s.maxScore}
                  {pct != null ? ` · ${pct}%` : ""}
                </span>
              )}
              <Badge variant={s.status === "GRADED" ? "default" : "secondary"}>
                {s.status === "GRADED" ? tt.statusGraded : tt.statusSubmitted}
              </Badge>
            </div>
          </li>
        );
      })}
    </ul>
  );
}
