"use client";

import { Pencil, Trash2, Users } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { EmptyState } from "@/components/dashboard/data-states";
import type { GroupDto } from "@/types/api";

interface GroupsTableProps {
  groups: GroupDto[];
  title?: string;
  description?: string;
  onEdit?: (id: number) => void;
  onDelete?: (id: number) => void;
}

function formatDate(value: string | null | undefined): string {
  if (!value) return "—";
  try {
    return new Date(value).toLocaleDateString();
  } catch {
    return value;
  }
}

export function GroupsTable({
  groups,
  title = "Groups",
  description = "Organizational groups and cohorts",
  onEdit,
  onDelete,
}: GroupsTableProps) {
  if (groups.length === 0) {
    return (
      <Card>
        <CardContent className="p-0">
          <EmptyState
            title="No groups yet"
            message="Groups will appear here once they are created."
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
                <th className="px-6 py-3 text-left text-label">Group</th>
                <th className="hidden px-4 py-3 text-left text-label sm:table-cell">
                  Course
                </th>
                <th className="hidden px-4 py-3 text-left text-label md:table-cell">
                  Start
                </th>
                <th className="hidden px-4 py-3 text-left text-label md:table-cell">
                  End
                </th>
                {showActions ? (
                  <th className="w-24 px-4 py-3" aria-label="actions" />
                ) : null}
              </tr>
            </thead>
            <tbody>
              {groups.map((group) => (
                <tr
                  key={group.id}
                  className="border-b border-theme transition-colors last:border-0 hover-table-row"
                >
                  <td className="px-6 py-3.5">
                    <div className="flex items-center gap-3">
                      <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-indigo-100 dark:bg-indigo-950">
                        <Users className="h-4 w-4 text-indigo-600 dark:text-indigo-300" />
                      </div>
                      <div>
                        <p className="font-medium text-theme">{group.name}</p>
                        <p className="text-xs text-theme-muted sm:hidden">
                          {group.courseName}
                        </p>
                      </div>
                    </div>
                  </td>
                  <td className="hidden px-4 py-3.5 text-theme-muted sm:table-cell">
                    {group.courseName}
                  </td>
                  <td className="hidden px-4 py-3.5 tabular-nums text-theme-muted md:table-cell">
                    {formatDate(group.startDate)}
                  </td>
                  <td className="hidden px-4 py-3.5 tabular-nums text-theme-muted md:table-cell">
                    {formatDate(group.endDate)}
                  </td>
                  {showActions ? (
                    <td className="px-4 py-3.5">
                      <div className="flex items-center justify-end gap-1">
                        {onEdit ? (
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8"
                            aria-label={`Edit ${group.name}`}
                            onClick={() => onEdit(group.id)}
                          >
                            <Pencil className="h-4 w-4 text-theme-muted" />
                          </Button>
                        ) : null}
                        {onDelete ? (
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8 hover:bg-rose-50 hover:text-rose-600"
                            aria-label={`Delete ${group.name}`}
                            onClick={() => onDelete(group.id)}
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
