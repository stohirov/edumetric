"use client";

import { CheckCircle2, Clock, FileCheck, XCircle } from "lucide-react";
import { cn } from "@/lib/utils";
import type { AttendanceStatus } from "@/types/attendance";

const statuses: {
  value: AttendanceStatus;
  label: string;
  short: string;
  icon: typeof CheckCircle2;
  active: string;
  idle: string;
}[] = [
  {
    value: "present",
    label: "Present",
    short: "P",
    icon: CheckCircle2,
    active: "bg-emerald-600 text-white border-emerald-600 shadow-sm",
    idle: "hover:bg-emerald-50 hover:border-emerald-200 text-slate-600",
  },
  {
    value: "late",
    label: "Late",
    short: "L",
    icon: Clock,
    active: "bg-amber-500 text-white border-amber-500 shadow-sm",
    idle: "hover:bg-amber-50 hover:border-amber-200 text-slate-600",
  },
  {
    value: "absent",
    label: "Absent",
    short: "A",
    icon: XCircle,
    active: "bg-red-600 text-white border-red-600 shadow-sm",
    idle: "hover:bg-red-50 hover:border-red-200 text-slate-600",
  },
  {
    value: "excused",
    label: "Excused",
    short: "E",
    icon: FileCheck,
    active: "bg-slate-600 text-white border-slate-600 shadow-sm",
    idle: "hover:bg-slate-100 hover:border-slate-300 text-slate-600",
  },
];

interface AttendanceStatusToggleProps {
  value: AttendanceStatus;
  onChange: (status: AttendanceStatus) => void;
  compact?: boolean;
  disabled?: boolean;
}

export function AttendanceStatusToggle({
  value,
  onChange,
  compact = false,
  disabled = false,
}: AttendanceStatusToggleProps) {
  return (
    <div
      className={cn(
        "inline-flex rounded-lg border border-slate-200 bg-slate-50/80 p-0.5",
        compact ? "gap-0.5" : "gap-1"
      )}
      role="group"
      aria-label="Attendance status"
    >
      {statuses.map((s) => {
        const Icon = s.icon;
        const isActive = value === s.value;

        return (
          <button
            key={s.value}
            type="button"
            disabled={disabled}
            onClick={() => onChange(s.value)}
            title={`${s.label} (${s.short})`}
            className={cn(
              "inline-flex items-center justify-center gap-1.5 rounded-md border border-transparent font-medium transition-all duration-150 active:scale-[0.97]",
              compact ? "h-9 min-w-[2.25rem] px-2 text-xs sm:min-w-[2.75rem] sm:px-2.5" : "h-10 min-w-[2.5rem] px-2.5 text-xs sm:min-w-0 sm:px-3 sm:text-sm",
              isActive ? s.active : s.idle,
              disabled && "pointer-events-none opacity-50"
            )}
          >
            <Icon className={cn("shrink-0", compact ? "h-3.5 w-3.5" : "h-4 w-4")} />
            <span className={cn(compact ? "hidden sm:inline" : "hidden md:inline")}>
              {s.label}
            </span>
            <kbd className="hidden lg:inline-flex h-4 min-w-[1rem] items-center justify-center rounded bg-black/10 px-1 text-[10px] font-semibold opacity-70">
              {s.short}
            </kbd>
          </button>
        );
      })}
    </div>
  );
}

export { statuses as attendanceStatuses };
