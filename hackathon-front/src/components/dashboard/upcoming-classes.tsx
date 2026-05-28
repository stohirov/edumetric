import { Clock, MapPin, Users } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

interface ClassItem {
  id: string;
  title: string;
  time: string;
  room: string;
  students: number;
}

interface UpcomingClassesProps {
  classes: ClassItem[];
}

export function UpcomingClasses({ classes }: UpcomingClassesProps) {
  return (
    <Card className="hover:shadow-[var(--shadow-elevated)] transition-shadow duration-300">
      <CardHeader>
        <CardTitle>Today&apos;s Schedule</CardTitle>
        <CardDescription>Your upcoming classes and sessions</CardDescription>
      </CardHeader>
      <CardContent className="space-y-3">
        {classes.map((item) => (
          <div
            key={item.id}
            className="flex items-center gap-4 rounded-lg border border-slate-100 p-4 transition-all duration-200 hover:border-indigo-100 hover:shadow-sm"
          >
            <div className="flex h-12 w-12 shrink-0 flex-col items-center justify-center rounded-lg bg-indigo-50 text-indigo-700">
              <span className="text-[10px] font-medium uppercase">Today</span>
              <Clock className="mt-0.5 h-4 w-4" />
            </div>
            <div className="min-w-0 flex-1">
              <h4 className="font-medium text-slate-900">{item.title}</h4>
              <div className="mt-1 flex flex-wrap gap-3 text-xs text-slate-500">
                <span className="flex items-center gap-1">
                  <Clock className="h-3 w-3" />
                  {item.time}
                </span>
                <span className="flex items-center gap-1">
                  <MapPin className="h-3 w-3" />
                  {item.room}
                </span>
                <span className="flex items-center gap-1 tabular-nums">
                  <Users className="h-3 w-3" />
                  {item.students} students
                </span>
              </div>
            </div>
          </div>
        ))}
      </CardContent>
    </Card>
  );
}
