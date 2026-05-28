"use client";

import { CalendarClock, Pencil, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { EmptyState } from "@/components/dashboard/data-states";
import type { LessonDto } from "@/types/api";

interface LessonsTableProps {
  lessons: LessonDto[];
  title?: string;
  description?: string;
  onEdit?: (id: number) => void;
  onDelete?: (id: number) => void;
}

function formatDateTime(iso: string): string {
  if (!iso) return "—";
  try {
    return new Date(iso).toLocaleString();
  } catch {
    return iso;
  }
}

export function LessonsTable({
  lessons,
  title = "Lessons",
  description = "All scheduled lessons across your institution",
  onEdit,
  onDelete,
}: LessonsTableProps) {
  if (lessons.length === 0) {
    return (
      <Card>
        <CardContent className="p-0">
          <EmptyState
            title="No lessons yet"
            message="Schedule a lesson to see it appear here."
          />
        </CardContent>
      </Card>
    );
  }

  const showActions = Boolean(onEdit || onDelete);

  return (
    <Card interactive>
      <CardHeader>
        <CardTitle>{title}</CardTitle>
        <CardDescription>{description}</CardDescription>
      </CardHeader>
      <CardContent className="p-0">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-theme bg-table-head">
                <th className="px-6 py-3 text-left text-label">Lesson</th>
                <th className="hidden px-4 py-3 text-left text-label sm:table-cell">
                  Group
                </th>
                <th className="hidden px-4 py-3 text-left text-label sm:table-cell">
                  Course
                </th>
                <th className="hidden px-4 py-3 text-left text-label md:table-cell">
                  Teacher
                </th>
                <th className="px-4 py-3 text-left text-label">When</th>
                {showActions ? (
                  <th className="w-24 px-4 py-3" aria-label="actions" />
                ) : null}
              </tr>
            </thead>
            <tbody>
              {lessons.map((lesson) => (
                <tr
                  key={lesson.id}
                  className="border-b border-theme transition-colors last:border-0 hover-table-row"
                >
                  <td className="px-6 py-3.5">
                    <div className="flex items-center gap-3">
                      <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-amber-100 dark:bg-amber-950">
                        <CalendarClock className="h-4 w-4 text-amber-600 dark:text-amber-300" />
                      </div>
                      <div>
                        <p className="font-medium text-theme">{lesson.topic}</p>
                        <p className="text-xs text-theme-muted sm:hidden">
                          {lesson.groupName} · {lesson.courseName}
                        </p>
                      </div>
                    </div>
                  </td>
                  <td className="hidden px-4 py-3.5 text-theme-muted sm:table-cell">
                    {lesson.groupName}
                  </td>
                  <td className="hidden px-4 py-3.5 text-theme-muted sm:table-cell">
                    {lesson.courseName}
                  </td>
                  <td className="hidden px-4 py-3.5 text-theme-muted md:table-cell">
                    {lesson.teacherName}
                  </td>
                  <td className="px-4 py-3.5 tabular-nums text-theme-muted">
                    {formatDateTime(lesson.scheduledAt)}
                  </td>
                  {showActions ? (
                    <td className="px-4 py-3.5">
                      <div className="flex items-center justify-end gap-1">
                        {onEdit ? (
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8"
                            aria-label={`Edit ${lesson.topic}`}
                            onClick={() => onEdit(lesson.id)}
                          >
                            <Pencil className="h-4 w-4 text-theme-muted" />
                          </Button>
                        ) : null}
                        {onDelete ? (
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8 hover:bg-rose-50 hover:text-rose-600"
                            aria-label={`Delete ${lesson.topic}`}
                            onClick={() => onDelete(lesson.id)}
                          >
                            <Trash2 className="h-4 w-4 text-theme-muted" />
                          </Button>
                        ) : null}
                      </div>
                    </td>
                  ) : null}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </CardContent>
    </Card>
  );
}
