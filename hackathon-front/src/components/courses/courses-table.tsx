"use client";

import { BookOpen, Pencil, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { EmptyState } from "@/components/dashboard/data-states";
import type { CourseDto } from "@/types/api";

interface CoursesTableProps {
  courses: CourseDto[];
  title?: string;
  description?: string;
  onEdit?: (id: number) => void;
  onDelete?: (id: number) => void;
}

export function CoursesTable({
  courses,
  title = "Courses",
  description = "Subjects offered by your institution",
  onEdit,
  onDelete,
}: CoursesTableProps) {
  if (courses.length === 0) {
    return (
      <Card>
        <CardContent className="p-0">
          <EmptyState
            title="No courses yet"
            message="Courses will appear here once they are created."
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
                <th className="px-6 py-3 text-left text-label">Course</th>
                <th className="hidden px-4 py-3 text-left text-label sm:table-cell">
                  Code
                </th>
                <th className="hidden px-4 py-3 text-left text-label md:table-cell">
                  Description
                </th>
                {showActions ? (
                  <th className="w-24 px-4 py-3" aria-label="actions" />
                ) : null}
              </tr>
            </thead>
            <tbody>
              {courses.map((course) => (
                <tr
                  key={course.id}
                  className="border-b border-theme transition-colors last:border-0 hover-table-row"
                >
                  <td className="px-6 py-3.5">
                    <div className="flex items-center gap-3">
                      <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-emerald-100 dark:bg-emerald-950">
                        <BookOpen className="h-4 w-4 text-emerald-600 dark:text-emerald-300" />
                      </div>
                      <div>
                        <p className="font-medium text-theme">{course.name}</p>
                        <p className="text-xs text-theme-muted sm:hidden">
                          {course.code}
                        </p>
                      </div>
                    </div>
                  </td>
                  <td className="hidden px-4 py-3.5 text-theme-muted sm:table-cell">
                    {course.code}
                  </td>
                  <td className="hidden max-w-md truncate px-4 py-3.5 text-theme-muted md:table-cell">
                    {course.description || "—"}
                  </td>
                  {showActions ? (
                    <td className="px-4 py-3.5">
                      <div className="flex items-center justify-end gap-1">
                        {onEdit ? (
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8"
                            aria-label={`Edit ${course.name}`}
                            onClick={() => onEdit(course.id)}
                          >
                            <Pencil className="h-4 w-4 text-theme-muted" />
                          </Button>
                        ) : null}
                        {onDelete ? (
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8 hover:bg-rose-50 hover:text-rose-600"
                            aria-label={`Delete ${course.name}`}
                            onClick={() => onDelete(course.id)}
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
