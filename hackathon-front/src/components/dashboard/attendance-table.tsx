import { CheckCircle2, Clock, XCircle, FileCheck } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import type { AttendanceRecord } from "@/types";
const statusConfig = {
  present: { label: "Present", variant: "success" as const, icon: CheckCircle2 },
  absent: { label: "Absent", variant: "destructive" as const, icon: XCircle },
  late: { label: "Late", variant: "warning" as const, icon: Clock },
  excused: { label: "Excused", variant: "secondary" as const, icon: FileCheck },
};

interface AttendanceTableProps {
  records: AttendanceRecord[];
  title?: string;
  description?: string;
  onExport?: () => void;
  onMarkAttendance?: () => void;
}

export function AttendanceTable({
  records,
  title = "Today's Attendance",
  description = "Real-time attendance records",
  onExport,
  onMarkAttendance,
}: AttendanceTableProps) {
  const showActions = Boolean(onExport || onMarkAttendance);
  return (
    <Card className="hover:shadow-[var(--shadow-elevated)] transition-shadow duration-300">
      <CardHeader className="flex flex-row items-center justify-between">
        <div>
          <CardTitle>{title}</CardTitle>
          <CardDescription>{description}</CardDescription>
        </div>
        {showActions && (
          <div className="flex gap-2">
            {onExport && (
              <Button variant="secondary" size="sm" onClick={onExport}>
                Export
              </Button>
            )}
            {onMarkAttendance && (
              <Button size="sm" onClick={onMarkAttendance}>
                Mark Attendance
              </Button>
            )}
          </div>
        )}
      </CardHeader>
      <CardContent className="p-0">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-y border-slate-100 bg-slate-50/50">
                <th className="px-6 py-3 text-left font-medium text-slate-500">Student</th>
                <th className="px-6 py-3 text-left font-medium text-slate-500">Class</th>
                <th className="px-6 py-3 text-left font-medium text-slate-500">Date</th>
                <th className="px-6 py-3 text-left font-medium text-slate-500">Status</th>
              </tr>
            </thead>
            <tbody>
              {records.map((record) => {
                const config = statusConfig[record.status];
                const Icon = config.icon;

                return (
                  <tr
                    key={record.id}
                    className="border-b border-slate-50 transition-colors hover:bg-slate-50/80 last:border-0"
                  >
                    <td className="px-6 py-4 font-medium text-slate-900">
                      {record.studentName}
                    </td>
                    <td className="px-6 py-4 text-slate-600">{record.class}</td>
                    <td className="px-6 py-4 tabular-nums text-slate-600">{record.date}</td>
                    <td className="px-6 py-4">
                      <Badge
                        variant={config.variant}
                        className="gap-1 pl-1.5"
                      >
                        <Icon className="h-3 w-3" />
                        {config.label}
                      </Badge>
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
