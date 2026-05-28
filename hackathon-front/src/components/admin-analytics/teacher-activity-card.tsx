"use client";

import {
  BookOpen,
  CalendarCheck,
  ClipboardList,
  UserPlus,
} from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import type { TeacherActivityItem } from "@/types/admin-analytics";
import { cn } from "@/lib/utils";

const typeConfig = {
  grades: { icon: BookOpen, color: "bg-indigo-50 text-indigo-600" },
  attendance: { icon: CalendarCheck, color: "bg-emerald-50 text-emerald-600" },
  report: { icon: ClipboardList, color: "bg-slate-100 text-slate-600" },
  enrollment: { icon: UserPlus, color: "bg-violet-50 text-violet-600" },
};

interface TeacherActivityCardProps {
  activity: TeacherActivityItem[];
  className?: string;
}

export function TeacherActivityCard({ activity, className }: TeacherActivityCardProps) {
  return (
    <Card interactive className={cn("h-full", className)}>
      <CardHeader>
        <CardTitle className="text-base">Teacher activity</CardTitle>
        <CardDescription>Recent faculty actions across the institution</CardDescription>
      </CardHeader>
      <CardContent>
        <ul className="space-y-0">
          {activity.map((item, index) => {
            const config = typeConfig[item.type];
            const Icon = config.icon;

            return (
              <li
                key={item.id}
                className={cn(
                  "flex gap-3 py-3",
                  index < activity.length - 1 && "border-b border-slate-100"
                )}
              >
                <div
                  className={cn(
                    "flex h-9 w-9 shrink-0 items-center justify-center rounded-lg",
                    config.color
                  )}
                >
                  <Icon className="h-4 w-4" />
                </div>
                <div className="min-w-0 flex-1">
                  <div className="flex flex-wrap items-baseline justify-between gap-2">
                    <p className="text-sm font-medium text-slate-900">{item.teacherName}</p>
                    <span className="shrink-0 text-xs text-slate-400">{item.timestamp}</span>
                  </div>
                  <p className="text-sm text-indigo-600">{item.action}</p>
                  <p className="mt-0.5 text-xs text-slate-500">{item.detail}</p>
                </div>
              </li>
            );
          })}
        </ul>
      </CardContent>
    </Card>
  );
}
