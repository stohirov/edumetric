import Link from "next/link";
import {
  AlertCircle,
  CalendarCheck,
  ChevronRight,
  ClipboardList,
  FileCheck,
} from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import type { PendingTask, TaskType } from "@/types/teacher-dashboard";
import { cn } from "@/lib/utils";

interface PendingTasksProps {
  tasks: PendingTask[];
}

const typeIcons: Record<TaskType, typeof ClipboardList> = {
  grading: ClipboardList,
  attendance: CalendarCheck,
  review: FileCheck,
};

const priorityStyles = {
  high: "border-l-red-500 bg-red-50/30",
  medium: "border-l-amber-500 bg-amber-50/20",
  low: "border-l-slate-300 bg-slate-50/50",
};

export function PendingTasks({ tasks }: PendingTasksProps) {
  return (
    <Card interactive className="h-full">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="text-base">Pending tasks</CardTitle>
            <CardDescription>{tasks.length} items need your attention</CardDescription>
          </div>
          <Badge variant="secondary" className="tabular-nums">
            {tasks.filter((t) => t.priority === "high").length} urgent
          </Badge>
        </div>
      </CardHeader>
      <CardContent className="space-y-2">
        {tasks.map((task) => {
          const Icon = typeIcons[task.type];

          return (
            <Link
              key={task.id}
              href={
                task.type === "attendance"
                  ? "/teacher/attendance"
                  : task.type === "grading"
                    ? "/teacher/grades"
                    : "/teacher/at-risk"
              }
              className={cn(
                "group flex items-center gap-3 rounded-lg border border-slate-100 border-l-[3px] p-3 transition-all duration-200",
                priorityStyles[task.priority],
                "hover:border-slate-200 hover:shadow-sm"
              )}
            >
              <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-white shadow-sm">
                <Icon className="h-4 w-4 text-indigo-600" />
              </div>
              <div className="min-w-0 flex-1">
                <p className="truncate text-sm font-medium text-slate-900 group-hover:text-indigo-700 transition-colors">
                  {task.title}
                </p>
                <p className="truncate text-xs text-slate-500">{task.course}</p>
              </div>
              <div className="flex shrink-0 flex-col items-end gap-1">
                <span
                  className={cn(
                    "text-xs font-medium tabular-nums",
                    task.priority === "high" ? "text-red-600" : "text-slate-500"
                  )}
                >
                  {task.dueLabel}
                </span>
                {task.priority === "high" && (
                  <AlertCircle className="h-3.5 w-3.5 text-red-500" />
                )}
              </div>
              <ChevronRight className="h-4 w-4 shrink-0 text-slate-300 transition-transform group-hover:translate-x-0.5 group-hover:text-slate-500" />
            </Link>
          );
        })}
      </CardContent>
    </Card>
  );
}
