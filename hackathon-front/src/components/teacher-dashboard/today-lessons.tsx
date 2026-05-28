"use client";

import Link from "next/link";
import {
  CheckCircle2,
  Clock,
  MapPin,
  Radio,
  UserCheck,
  Users,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import type { TodayLesson } from "@/types/teacher-dashboard";
import { cn } from "@/lib/utils";

interface TodayLessonsProps {
  lessons: TodayLesson[];
}

const statusConfig = {
  live: {
    label: "Live now",
    badge: "default" as const,
    border: "border-indigo-200 ring-1 ring-indigo-100",
    bg: "bg-indigo-50/30",
  },
  upcoming: {
    label: "Upcoming",
    badge: "secondary" as const,
    border: "border-slate-200",
    bg: "bg-white",
  },
  completed: {
    label: "Completed",
    badge: "outline" as const,
    border: "border-slate-100",
    bg: "bg-slate-50/50",
  },
};

export function TodayLessons({ lessons }: TodayLessonsProps) {
  return (
    <Card interactive>
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="text-base">Today&apos;s lessons</CardTitle>
            <CardDescription>Quick attendance & lesson controls</CardDescription>
          </div>
          <Link
            href="/teacher/attendance"
            className="text-xs font-medium text-indigo-600 transition-colors hover:text-indigo-700"
          >
            View all
          </Link>
        </div>
      </CardHeader>
      <CardContent>
        <div className="flex gap-3 overflow-x-auto pb-1 -mx-1 px-1 snap-x snap-mandatory">
          {lessons.map((lesson) => {
            const config = statusConfig[lesson.status];
            const isLive = lesson.status === "live";

            return (
              <article
                key={lesson.id}
                className={cn(
                  "min-w-[260px] max-w-[280px] shrink-0 snap-start rounded-xl border p-4 transition-all duration-200",
                  config.border,
                  config.bg,
                  isLive && "shadow-sm"
                )}
              >
                <div className="flex items-start justify-between gap-2">
                  <Badge variant={config.badge} className="gap-1 text-[10px]">
                    {isLive && (
                      <span className="relative flex h-1.5 w-1.5">
                        <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-indigo-400 opacity-75" />
                        <span className="relative inline-flex h-1.5 w-1.5 rounded-full bg-indigo-600" />
                      </span>
                    )}
                    {isLive && <Radio className="h-3 w-3" />}
                    {config.label}
                  </Badge>
                  {lesson.attendanceMarked && (
                    <CheckCircle2 className="h-4 w-4 text-emerald-500" />
                  )}
                </div>

                <h3 className="mt-3 font-semibold text-slate-900">{lesson.title}</h3>
                <p className="text-xs text-slate-500">{lesson.group}</p>

                <div className="mt-3 space-y-1.5 text-xs text-slate-500">
                  <p className="flex items-center gap-1.5 tabular-nums">
                    <Clock className="h-3.5 w-3.5 text-slate-400" />
                    {lesson.startTime} – {lesson.endTime}
                  </p>
                  <p className="flex items-center gap-1.5">
                    <MapPin className="h-3.5 w-3.5 text-slate-400" />
                    {lesson.room}
                  </p>
                  <p className="flex items-center gap-1.5 tabular-nums">
                    <Users className="h-3.5 w-3.5 text-slate-400" />
                    {lesson.students} students
                  </p>
                </div>

                <div className="mt-4 flex gap-2">
                  {!lesson.attendanceMarked && lesson.status !== "completed" ? (
                    <Button size="sm" className="h-8 flex-1 text-xs" asChild>
                      <Link href="/teacher/attendance">
                        <UserCheck className="h-3.5 w-3.5" />
                        Mark attendance
                      </Link>
                    </Button>
                  ) : (
                    <Button size="sm" variant="secondary" className="h-8 flex-1 text-xs" asChild>
                      <Link href="/teacher/attendance">View roster</Link>
                    </Button>
                  )}
                  {isLive && (
                    <Badge
                      variant="destructive"
                      className="h-8 gap-1.5 px-2 text-xs font-medium"
                    >
                      <Radio className="h-3 w-3 animate-pulse" />
                      Live
                    </Badge>
                  )}
                </div>
              </article>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
}
