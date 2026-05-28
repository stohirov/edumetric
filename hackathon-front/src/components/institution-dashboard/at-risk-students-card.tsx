"use client";

import Link from "next/link";
import { AlertTriangle, ArrowUpRight } from "lucide-react";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import { useT } from "@/components/providers/locale-provider";
import type { AtRiskStudentRow } from "@/types/education-metrics";

interface AtRiskStudentsCardProps {
  students: AtRiskStudentRow[];
  className?: string;
}

export function AtRiskStudentsCard({ students, className }: AtRiskStudentsCardProps) {
  const t = useT();
  return (
    <Card interactive className={className}>
      <CardHeader className="flex flex-row items-start justify-between">
        <div>
          <CardTitle className="flex items-center gap-2">
            <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-rose-50 text-rose-600 ring-1 ring-rose-100">
              <AlertTriangle className="h-4 w-4" />
            </span>
            {t.institution.atRisk.title}
          </CardTitle>
          <CardDescription>{t.institution.atRisk.desc}</CardDescription>
        </div>
        <Link
          href="/admin/at-risk"
          className="flex items-center gap-1 text-xs font-semibold text-indigo-600 hover:text-indigo-700 dark:text-indigo-400"
        >
          {t.common.viewAll}
          <ArrowUpRight className="h-3.5 w-3.5" />
        </Link>
      </CardHeader>
      <CardContent className="p-0">
        <ul className="divide-y divide-[var(--divider)]">
          {students.map((student) => {
            const initials = student.name
              .split(" ")
              .map((n) => n[0])
              .join("")
              .slice(0, 2);

            return (
              <li
                key={student.id}
                className="flex items-start gap-3 px-6 py-3.5 transition-colors hover-table-row"
              >
                <Avatar className="h-9 w-9 ring-2 ring-white">
                  <AvatarFallback className="bg-slate-100 text-xs font-semibold text-slate-600">
                    {initials}
                  </AvatarFallback>
                </Avatar>
                <div className="min-w-0 flex-1">
                  <div className="flex items-center justify-between gap-2">
                    <p className="truncate text-sm font-semibold text-theme">
                      {student.name}
                    </p>
                    <span
                      className={cn(
                        "shrink-0 rounded-md px-1.5 py-0.5 text-[10px] font-bold tabular-nums",
                        student.score < 65
                          ? "bg-rose-50 text-rose-700"
                          : "bg-amber-50 text-amber-700"
                      )}
                    >
                      {student.score}%
                    </span>
                  </div>
                  <p className="text-xs text-slate-500">{student.group}</p>
                  <div className="mt-1.5 flex flex-wrap gap-1">
                    {student.riskFactors.map((factor) => (
                      <span
                        key={factor}
                        className="rounded-md bg-slate-100 px-1.5 py-0.5 text-[10px] font-medium text-slate-600"
                      >
                        {factor}
                      </span>
                    ))}
                  </div>
                </div>
                <span className="text-xs font-medium tabular-nums text-slate-400">
                  {student.attendance}%
                </span>
              </li>
            );
          })}
        </ul>
      </CardContent>
    </Card>
  );
}
