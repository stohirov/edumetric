import { CalendarDays } from "lucide-react";
import type { TeacherProfile } from "@/types/teacher-dashboard";

interface TeacherHeaderProps {
  profile: TeacherProfile;
}

function getGreeting() {
  const hour = new Date().getHours();
  if (hour < 12) return "Good morning";
  if (hour < 17) return "Good afternoon";
  return "Good evening";
}

export function TeacherHeader({ profile }: TeacherHeaderProps) {
  const today = new Intl.DateTimeFormat("en-US", {
    weekday: "long",
    month: "long",
    day: "numeric",
  }).format(new Date());

  return (
    <div className="flex flex-col gap-1 sm:flex-row sm:items-end sm:justify-between">
      <div>
        <p className="text-sm font-medium text-indigo-600">{getGreeting()}</p>
        <h1 className="text-2xl font-semibold tracking-tight text-slate-900 sm:text-3xl">
          {profile.fullName}
        </h1>
        <p className="mt-0.5 text-sm text-slate-500">{profile.department}</p>
      </div>
      <div className="flex items-center gap-2 text-sm text-slate-500">
        <CalendarDays className="h-4 w-4 text-slate-400" />
        <span>{today}</span>
      </div>
    </div>
  );
}
