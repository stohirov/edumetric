import Link from "next/link";
import { AlertTriangle, ChevronRight, Mail } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import type { AtRiskStudent } from "@/types/teacher-dashboard";

interface AtRiskStudentsProps {
  students: AtRiskStudent[];
}

export function AtRiskStudents({ students }: AtRiskStudentsProps) {
  return (
    <Card interactive className="h-full">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-amber-50">
              <AlertTriangle className="h-4 w-4 text-amber-600" />
            </div>
            <div>
              <CardTitle className="text-base">At-risk students</CardTitle>
              <CardDescription>Intervention recommended</CardDescription>
            </div>
          </div>
          <Button variant="ghost" size="sm" className="h-8 text-xs" asChild>
            <Link href="/teacher/at-risk">View all</Link>
          </Button>
        </div>
      </CardHeader>
      <CardContent className="space-y-2">
        {students.map((student) => {
          const initials = student.name
            .split(" ")
            .map((n) => n[0])
            .join("")
            .slice(0, 2);

          return (
            <div
              key={student.id}
              className="group flex items-center gap-3 rounded-lg border border-amber-100/80 bg-amber-50/20 p-3 transition-all duration-200 hover:border-amber-200 hover:bg-amber-50/40"
            >
              <Avatar className="h-9 w-9">
                <AvatarFallback className="bg-white text-xs font-medium text-amber-800">
                  {initials}
                </AvatarFallback>
              </Avatar>
              <div className="min-w-0 flex-1">
                <p className="text-sm font-medium text-slate-900">{student.name}</p>
                <p className="text-xs text-slate-500">{student.course}</p>
                <p className="mt-0.5 text-xs text-amber-700">{student.reason}</p>
              </div>
              <div className="hidden shrink-0 text-right text-xs tabular-nums text-slate-500 sm:block">
                <p>{student.attendance}% att.</p>
                <p>GPA {student.gpa.toFixed(2)}</p>
              </div>
              <div className="flex shrink-0 gap-1">
                {student.email ? (
                  <Button
                    asChild
                    variant="ghost"
                    size="icon"
                    className="h-8 w-8 opacity-0 transition-opacity group-hover:opacity-100"
                    aria-label={`Email ${student.name}`}
                  >
                    <a
                      href={`mailto:${student.email}?subject=${encodeURIComponent(
                        `Check-in: ${student.name}`,
                      )}`}
                    >
                      <Mail className="h-3.5 w-3.5" />
                    </a>
                  </Button>
                ) : null}
                <Link
                  href="/teacher/at-risk"
                  className="flex h-8 w-8 items-center justify-center rounded-md text-slate-400 transition-colors hover:bg-white hover:text-indigo-600"
                  aria-label={`View ${student.name}`}
                >
                  <ChevronRight className="h-4 w-4" />
                </Link>
              </div>
            </div>
          );
        })}
      </CardContent>
    </Card>
  );
}
