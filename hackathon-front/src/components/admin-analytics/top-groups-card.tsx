"use client";

import Link from "next/link";
import { ArrowUpRight, ChevronRight, Layers } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import type { TopGroup } from "@/types/admin-analytics";
import { cn } from "@/lib/utils";

interface TopGroupsCardProps {
  groups: TopGroup[];
  className?: string;
}

export function TopGroupsCard({ groups, className }: TopGroupsCardProps) {
  const maxScore = Math.max(...groups.map((g) => g.avgScore));

  return (
    <Card interactive className={cn("h-full", className)}>
      <CardHeader className="flex flex-row items-center justify-between pb-2">
        <div>
          <CardTitle className="flex items-center gap-2 text-base">
            <Layers className="h-4 w-4 text-indigo-600" />
            Top groups
          </CardTitle>
          <CardDescription>Highest performing cohorts by composite score</CardDescription>
        </div>
        <Link
          href="/admin/groups"
          className="text-xs font-medium text-indigo-600 hover:text-indigo-700"
        >
          View all
        </Link>
      </CardHeader>
      <CardContent className="space-y-3">
        {groups.map((group, index) => (
          <Link
            key={group.id}
            href="/admin/groups"
            className="group flex items-center gap-3 rounded-xl border border-slate-100 p-3 transition-all duration-200 hover:border-indigo-100 hover:bg-indigo-50/20 hover:shadow-sm"
          >
            <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-slate-100 text-sm font-bold tabular-nums text-slate-600 group-hover:bg-indigo-100 group-hover:text-indigo-700">
              {index + 1}
            </span>
            <div className="min-w-0 flex-1">
              <p className="truncate font-medium text-slate-900 group-hover:text-indigo-700">
                {group.name}
              </p>
              <p className="text-xs text-slate-500">
                {group.department} · {group.students} students
              </p>
              <div className="mt-2">
                <Progress value={(group.avgScore / maxScore) * 100} className="h-1.5" />
              </div>
            </div>
            <div className="shrink-0 text-right">
              <p className="text-lg font-semibold tabular-nums text-slate-900">
                {group.avgScore}
              </p>
              <p
                className={cn(
                  "flex items-center justify-end gap-0.5 text-xs font-medium tabular-nums",
                  group.trend >= 0 ? "text-emerald-600" : "text-amber-600"
                )}
              >
                {group.trend >= 0 ? (
                  <ArrowUpRight className="h-3 w-3" />
                ) : (
                  <span>↓</span>
                )}
                {group.trend > 0 ? "+" : ""}
                {group.trend}%
              </p>
            </div>
            <ChevronRight className="h-4 w-4 shrink-0 text-slate-300 group-hover:text-indigo-500" />
          </Link>
        ))}
      </CardContent>
    </Card>
  );
}
