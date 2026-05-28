"use client";

import Link from "next/link";
import { Mail, Pencil, Trash2 } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { useT } from "@/components/providers/locale-provider";
import type { Student } from "@/types";

const statusVariant = {
  active: "success" as const,
  "at-risk": "warning" as const,
  inactive: "secondary" as const,
};

interface StudentsTableProps {
  students: Student[];
  title?: string;
  description?: string;
  viewAllHref?: string;
  onEdit?: (id: string) => void;
  onDelete?: (id: string) => void;
}

export function StudentsTable({
  students,
  title,
  description,
  viewAllHref,
  onEdit,
  onDelete,
}: StudentsTableProps) {
  const t = useT();
  const tableTitle = title ?? t.institution.studentsTable.title;
  const tableDesc = description ?? t.institution.studentsTable.desc;

  return (
    <Card interactive>
      <CardHeader className="flex flex-row items-center justify-between">
        <div>
          <CardTitle>{tableTitle}</CardTitle>
          <CardDescription>{tableDesc}</CardDescription>
        </div>
        {viewAllHref ? (
          <Button asChild variant="secondary" size="sm">
            <Link href={viewAllHref}>{t.common.viewAll}</Link>
          </Button>
        ) : null}
      </CardHeader>
      <CardContent className="p-0">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-theme bg-table-head">
                <th className="px-6 py-3 text-left text-label">
                  {t.institution.studentsTable.student}
                </th>
                <th className="hidden px-4 py-3 text-left text-label sm:table-cell">
                  {t.institution.studentsTable.grade}
                </th>
                <th className="px-4 py-3 text-left text-label">
                  {t.institution.studentsTable.gpa}
                </th>
                <th className="hidden px-4 py-3 text-left text-label md:table-cell">
                  {t.institution.studentsTable.attendance}
                </th>
                <th className="px-4 py-3 text-left text-label">
                  {t.institution.studentsTable.status}
                </th>
                <th className="w-10 px-4 py-3" aria-label="contact" />
                {onEdit || onDelete ? (
                  <th className="w-24 px-4 py-3" aria-label="actions" />
                ) : null}
              </tr>
            </thead>
            <tbody>
              {students.map((student) => {
                const initials = student.name
                  .split(" ")
                  .map((n) => n[0])
                  .join("")
                  .slice(0, 2);

                return (
                  <tr
                    key={student.id}
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
                          <p className="font-medium text-theme">{student.name}</p>
                          <p className="text-xs text-theme-muted sm:hidden">{student.grade}</p>
                        </div>
                      </div>
                    </td>
                    <td className="hidden px-4 py-3.5 text-theme-muted sm:table-cell">
                      {student.grade}
                    </td>
                    <td className="px-4 py-3.5">
                      <span className="font-semibold tabular-nums text-theme">{student.gpa}</span>
                    </td>
                    <td className="hidden px-4 py-3.5 tabular-nums text-theme-muted md:table-cell">
                      {student.attendance}%
                    </td>
                    <td className="px-4 py-3.5">
                      <Badge variant={statusVariant[student.status]}>{student.status}</Badge>
                    </td>
                    <td className="px-4 py-3.5">
                      {student.email ? (
                        <Button
                          asChild
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8"
                          aria-label={`Email ${student.name}`}
                        >
                          <a href={`mailto:${student.email}`}>
                            <Mail className="h-4 w-4 text-theme-muted" />
                          </a>
                        </Button>
                      ) : null}
                    </td>
                    {onEdit || onDelete ? (
                      <td className="px-4 py-3.5">
                        <div className="flex items-center justify-end gap-1">
                          {onEdit ? (
                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-8 w-8"
                              aria-label={`${t.common.edit} ${student.name}`}
                              onClick={() => onEdit(student.id)}
                            >
                              <Pencil className="h-4 w-4 text-theme-muted" />
                            </Button>
                          ) : null}
                          {onDelete ? (
                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-8 w-8 hover:bg-rose-50 hover:text-rose-600"
                              aria-label={`${t.common.delete} ${student.name}`}
                              onClick={() => onDelete(student.id)}
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
