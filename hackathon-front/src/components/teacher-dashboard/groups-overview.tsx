import Link from "next/link";
import { ChevronRight, Layers, Users } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import type { TeacherGroup } from "@/types/teacher-dashboard";
import { cn } from "@/lib/utils";

interface GroupsOverviewProps {
  groups: TeacherGroup[];
}

export function GroupsOverview({ groups }: GroupsOverviewProps) {
  return (
    <Card interactive>
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-indigo-50">
              <Layers className="h-4 w-4 text-indigo-600" />
            </div>
            <div>
              <CardTitle className="text-base">Groups overview</CardTitle>
              <CardDescription>Your classes at a glance</CardDescription>
            </div>
          </div>
          <Link
            href="/teacher/groups"
            className="text-xs font-medium text-indigo-600 hover:text-indigo-700"
          >
            Manage groups
          </Link>
        </div>
      </CardHeader>
      <CardContent>
        <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
          {groups.map((group) => (
            <Link
              key={group.id}
              href="/teacher/groups"
              className={cn(
                "group rounded-xl border border-slate-200/80 p-4 transition-all duration-200",
                "hover:border-indigo-200 hover:bg-indigo-50/20 hover:shadow-sm"
              )}
            >
              <div className="flex items-start justify-between gap-2">
                <div className="min-w-0">
                  <p className="truncate font-medium text-slate-900 group-hover:text-indigo-700 transition-colors">
                    {group.name}
                  </p>
                  <p className="text-xs text-slate-400">{group.code}</p>
                </div>
                <ChevronRight className="h-4 w-4 shrink-0 text-slate-300 transition-transform group-hover:translate-x-0.5 group-hover:text-indigo-500" />
              </div>

              <div className="mt-3 flex items-center gap-3 text-xs text-slate-500">
                <span className="flex items-center gap-1 tabular-nums">
                  <Users className="h-3.5 w-3.5" />
                  {group.students}
                </span>
                {group.atRiskCount > 0 && (
                  <Badge variant="warning" className="text-[10px] px-1.5 py-0">
                    {group.atRiskCount} at risk
                  </Badge>
                )}
              </div>

              {group.avgScore > 0 && (
                <div className="mt-3">
                  <div className="mb-1 flex justify-between text-[10px] text-slate-500">
                    <span>Avg. score</span>
                    <span className="tabular-nums font-medium">{group.avgScore}%</span>
                  </div>
                  <Progress value={group.avgScore} className="h-1.5" />
                </div>
              )}

              <div className="mt-3 flex items-center justify-between text-[10px]">
                <span className="text-slate-400">Attendance</span>
                <span className="font-medium tabular-nums text-slate-700">
                  {group.attendanceRate}%
                </span>
              </div>

              {group.nextLesson && (
                <p className="mt-2 text-[10px] text-indigo-600">Next: {group.nextLesson}</p>
              )}
            </Link>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
