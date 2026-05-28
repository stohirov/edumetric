"use client";

import { Mail, Pencil, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { EmptyState } from "@/components/dashboard/data-states";
import type { TeacherDto } from "@/types/api";

interface TeachersTableProps {
  teachers: TeacherDto[];
  title?: string;
  description?: string;
  onEdit?: (id: number) => void;
  onDelete?: (id: number) => void;
}

export function TeachersTable({
  teachers,
  title = "Faculty",
  description = "All teachers in your institution",
  onEdit,
  onDelete,
}: TeachersTableProps) {
  if (teachers.length === 0) {
    return (
      <Card>
        <CardContent className="p-0">
          <EmptyState
            title="No teachers yet"
            message="Teachers will appear here once they are added."
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
                <th className="px-6 py-3 text-left text-label">Teacher</th>
                <th className="hidden px-4 py-3 text-left text-label sm:table-cell">
                  Department
                </th>
                <th className="hidden px-4 py-3 text-left text-label md:table-cell">
                  Email
                </th>
                <th className="w-10 px-4 py-3" aria-label="contact" />
                {showActions ? (
                  <th className="w-24 px-4 py-3" aria-label="actions" />
                ) : null}
              </tr>
            </thead>
            <tbody>
              {teachers.map((teacher) => {
                const initials = teacher.fullName
                  .split(" ")
                  .map((n) => n[0])
                  .join("")
                  .slice(0, 2)
                  .toUpperCase();

                return (
                  <tr
                    key={teacher.id}
                    className="border-b border-theme transition-colors last:border-0 hover-table-row"
                  >
                    <td className="px-6 py-3.5">
                      <div className="flex items-center gap-3">
                        <Avatar className="h-8 w-8 ring-2 ring-[var(--card)]">
                          <AvatarFallback className="bg-indigo-100 text-xs font-medium text-indigo-700 dark:bg-indigo-950 dark:text-indigo-300">
                            {initials}
                          </AvatarFallback>
                        </Avatar>
                        <div>
                          <p className="font-medium text-theme">{teacher.fullName}</p>
                          <p className="text-xs text-theme-muted sm:hidden">
                            {teacher.department || "—"}
                          </p>
                        </div>
                      </div>
                    </td>
                    <td className="hidden px-4 py-3.5 text-theme-muted sm:table-cell">
                      {teacher.department || "—"}
                    </td>
                    <td className="hidden px-4 py-3.5 text-theme-muted md:table-cell">
                      {teacher.email}
                    </td>
                    <td className="px-4 py-3.5">
                      <Button
                        asChild
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8"
                        aria-label={`Email ${teacher.fullName}`}
                      >
                        <a href={`mailto:${teacher.email}`}>
                          <Mail className="h-4 w-4 text-theme-muted" />
                        </a>
                      </Button>
                    </td>
                    {showActions ? (
                      <td className="px-4 py-3.5">
                        <div className="flex items-center justify-end gap-1">
                          {onEdit ? (
                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-8 w-8"
                              aria-label={`Edit ${teacher.fullName}`}
                              onClick={() => onEdit(teacher.id)}
                            >
                              <Pencil className="h-4 w-4 text-theme-muted" />
                            </Button>
                          ) : null}
                          {onDelete ? (
                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-8 w-8 hover:bg-rose-50 hover:text-rose-600"
                              aria-label={`Delete ${teacher.fullName}`}
                              onClick={() => onDelete(teacher.id)}
                            >
                              <Trash2 className="h-4 w-4 text-theme-muted" />
                            </Button>
                          ) : null}
                        </div>
                      </td>
                    ) : null}
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </CardContent>
    </Card>
  );
}
