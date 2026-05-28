"use client";

import { useState } from "react";
import {
  BookOpen,
  CalendarCheck,
  CheckCircle2,
  Clock,
  FileText,
  XCircle,
} from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import type { RecentAttendanceEntry, RecentGradeEntry } from "@/types/student-analytics";

interface RecentActivityCardProps {
  grades: RecentGradeEntry[];
  attendance: RecentAttendanceEntry[];
  className?: string;
}

type Tab = "grades" | "attendance";

const gradeTypeIcons = {
  exam: BookOpen,
  assignment: FileText,
  quiz: FileText,
};

const attendanceStatus = {
  present: { icon: CheckCircle2, label: "Present", variant: "success" as const },
  absent: { icon: XCircle, label: "Absent", variant: "destructive" as const },
  late: { icon: Clock, label: "Late", variant: "warning" as const },
  excused: { icon: CalendarCheck, label: "Excused", variant: "secondary" as const },
};

export function RecentActivityCard({
  grades,
  attendance,
  className,
}: RecentActivityCardProps) {
  const [tab, setTab] = useState<Tab>("grades");

  return (
    <Card interactive className={className}>
      <CardHeader>
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <CardTitle>Recent activity</CardTitle>
            <CardDescription>Your latest grades and attendance events</CardDescription>
          </div>
          <div className="flex rounded-lg border border-slate-200 bg-slate-50 p-1">
            {(["grades", "attendance"] as Tab[]).map((t) => (
              <button
                key={t}
                type="button"
                onClick={() => setTab(t)}
                className={cn(
                  "rounded-md px-4 py-1.5 text-sm font-medium capitalize transition-all duration-200",
                  tab === t
                    ? "bg-white text-indigo-700 shadow-sm"
                    : "text-slate-500 hover:text-slate-700"
                )}
              >
                {t}
              </button>
            ))}
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <ul className="relative space-y-0">
          {tab === "grades" &&
            grades.map((entry, index) => {
              const Icon = gradeTypeIcons[entry.type];
              const isLast = index === grades.length - 1;

              return (
                <li key={entry.id} className="relative flex gap-4 pb-6">
                  {!isLast && (
                    <span className="absolute left-[15px] top-8 h-[calc(100%-8px)] w-px bg-slate-200" />
                  )}
                  <div className="relative z-10 flex h-8 w-8 shrink-0 items-center justify-center rounded-full border-2 border-white bg-indigo-50 shadow-sm">
                    <Icon className="h-3.5 w-3.5 text-indigo-600" />
                  </div>
                  <div className="min-w-0 flex-1 pt-0.5">
                    <div className="flex flex-wrap items-start justify-between gap-2">
                      <div>
                        <p className="font-medium text-slate-900">{entry.title}</p>
                        <p className="text-sm text-slate-500">{entry.course}</p>
                      </div>
                      <div className="flex items-center gap-2">
                        <Badge variant="default">{entry.grade}</Badge>
                        <span className="text-sm font-semibold tabular-nums text-slate-700">
                          {entry.score}%
                        </span>
                      </div>
                    </div>
                    <p className="mt-1 text-xs text-slate-400">{entry.date}</p>
                  </div>
                </li>
              );
            })}

          {tab === "attendance" &&
            attendance.map((entry, index) => {
              const config = attendanceStatus[entry.status];
              const Icon = config.icon;
              const isLast = index === attendance.length - 1;

              return (
                <li key={entry.id} className="relative flex gap-4 pb-6">
                  {!isLast && (
                    <span className="absolute left-[15px] top-8 h-[calc(100%-8px)] w-px bg-slate-200" />
                  )}
                  <div className="relative z-10 flex h-8 w-8 shrink-0 items-center justify-center rounded-full border-2 border-white bg-slate-50 shadow-sm">
                    <Icon
                      className={cn(
                        "h-3.5 w-3.5",
                        entry.status === "present" && "text-emerald-600",
                        entry.status === "late" && "text-amber-600",
                        entry.status === "absent" && "text-red-600"
                      )}
                    />
                  </div>
                  <div className="min-w-0 flex-1 pt-0.5">
                    <div className="flex flex-wrap items-start justify-between gap-2">
                      <div>
                        <p className="font-medium text-slate-900">{entry.course}</p>
                        <p className="text-xs text-slate-400">{entry.date}</p>
                      </div>
                      <Badge variant={config.variant}>{config.label}</Badge>
                    </div>
                    {entry.time && (
                      <p className="mt-1 text-xs tabular-nums text-slate-500">{entry.time}</p>
                    )}
                  </div>
                </li>
              );
            })}
        </ul>
      </CardContent>
    </Card>
  );
}
