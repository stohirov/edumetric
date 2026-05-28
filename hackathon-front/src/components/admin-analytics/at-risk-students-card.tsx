"use client";

import Link from "next/link";
import { AlertTriangle, ChevronRight } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import type { AtRiskStudentRow } from "@/types/admin-analytics";
import { cn } from "@/lib/utils";

interface AtRiskStudentsCardProps {
  students: AtRiskStudentRow[];
  className?: string;
}

export function AtRiskStudentsCard({ students, className }: AtRiskStudentsCardProps) {
  return (
    <Card interactive className={cn("h-full", className)}>
      <CardHeader className="flex flex-row items-start justify-between">
        <div className="flex items-center gap-2">
          <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-red-50">
            <AlertTriangle className="h-4 w-4 text-red-600" />
          </div>
          <div>
            <CardTitle className="text-base">At-risk students</CardTitle>
            <CardDescription>Priority intervention queue</CardDescription>
          </div>
        </div>
        <Button variant="ghost" size="sm" className="h-8 text-xs" asChild>
          <Link href="/admin/at-risk">View all</Link>
        </Button>
      </CardHeader>
      <CardContent className="p-0">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-y border-slate-100 bg-slate-50/60">
                <th className="px-4 py-2.5 text-left text-xs font-medium text-slate-500">
                  Student
                </th>
                <th className="hidden px-4 py-2.5 text-left text-xs font-medium text-slate-500 sm:table-cell">
                  Group
                </th>
                <th className="px-4 py-2.5 text-right text-xs font-medium text-slate-500">
                  Score
                </th>
                <th className="hidden px-4 py-2.5 text-right text-xs font-medium text-slate-500 md:table-cell">
                  Attend.
                </th>
                <th className="px-4 py-2.5 text-right text-xs font-medium text-slate-500">
                  Risk
                </th>
                <th className="w-8" />
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
                    className="border-b border-slate-50 transition-colors hover:bg-red-50/20 last:border-0"
                  >
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2.5">
                        <Avatar className="h-8 w-8">
                          <AvatarFallback className="text-[10px]">{initials}</AvatarFallback>
                        </Avatar>
                        <span className="font-medium text-slate-900">{student.name}</span>
                      </div>
                    </td>
                    <td className="hidden px-4 py-3 text-slate-500 sm:table-cell">
                      {student.group}
                    </td>
                    <td className="px-4 py-3 text-right tabular-nums font-medium text-slate-700">
                      {student.score}
                    </td>
                    <td className="hidden px-4 py-3 text-right tabular-nums text-slate-500 md:table-cell">
                      {student.attendance}%
                    </td>
                    <td className="px-4 py-3 text-right">
                      <Badge
                        variant={student.riskScore >= 85 ? "destructive" : "warning"}
                        className="tabular-nums"
                      >
                        {student.riskScore}
                      </Badge>
                    </td>
                    <td className="px-2 py-3">
                      <Link
                        href="/admin/at-risk"
                        className="flex h-7 w-7 items-center justify-center rounded-md text-slate-400 hover:bg-white hover:text-indigo-600"
                      >
                        <ChevronRight className="h-4 w-4" />
                      </Link>
                    </td>
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
