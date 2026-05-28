"use client";

import { Check, Loader2, RotateCcw, Save } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import type { AttendanceStatus } from "@/types/attendance";

interface AttendanceSaveBarProps {
  counts: Record<AttendanceStatus, number>;
  total: number;
  hasChanges: boolean;
  isSaving: boolean;
  saveSuccess: boolean;
  onSave: () => void;
  onReset: () => void;
  onMarkAllPresent: () => void;
}

export function AttendanceSaveBar({
  counts,
  total,
  hasChanges,
  isSaving,
  saveSuccess,
  onSave,
  onReset,
  onMarkAllPresent,
}: AttendanceSaveBarProps) {
  return (
    <div
      className={cn(
        "fixed bottom-0 left-0 right-0 z-40 border-t border-slate-200/50 bg-white/90 backdrop-blur-xl backdrop-saturate-150 transition-all duration-300 shadow-[0_-4px_24px_-4px_rgb(15_23_42/0.08)]",
        "lg:left-[var(--sidebar-width,16rem)]",
        saveSuccess && "border-emerald-200"
      )}
    >
      <div className="mx-auto flex max-w-[1600px] flex-col gap-3 px-4 py-3 sm:flex-row sm:items-center sm:justify-between sm:px-6 lg:px-8">
        <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-sm">
          <span className="font-medium text-slate-900 tabular-nums">
            {total} students
          </span>
          <span className="hidden h-4 w-px bg-slate-200 sm:block" />
          <span className="text-emerald-600 tabular-nums">
            {counts.present} present
          </span>
          <span className="text-amber-600 tabular-nums">{counts.late} late</span>
          <span className="text-red-600 tabular-nums">{counts.absent} absent</span>
          <span className="text-slate-500 tabular-nums">{counts.excused} excused</span>
          {hasChanges && (
            <span className="rounded-full bg-amber-100 px-2 py-0.5 text-xs font-medium text-amber-800">
              Unsaved changes
            </span>
          )}
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={onMarkAllPresent}
            disabled={isSaving}
            className="hidden sm:inline-flex"
          >
            All present
          </Button>
          <Button
            type="button"
            variant="secondary"
            size="sm"
            onClick={onReset}
            disabled={isSaving || !hasChanges}
          >
            <RotateCcw className="h-4 w-4" />
            Reset
          </Button>
          <Button
            type="button"
            size="sm"
            onClick={onSave}
            disabled={isSaving}
            className={cn(
              "min-w-[120px] transition-all duration-300",
              saveSuccess && "bg-emerald-600 hover:bg-emerald-700"
            )}
          >
            {isSaving ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" />
                Saving…
              </>
            ) : saveSuccess ? (
              <>
                <Check className="h-4 w-4" />
                Saved!
              </>
            ) : (
              <>
                <Save className="h-4 w-4" />
                Save attendance
                <kbd className="ml-1 hidden rounded bg-white/20 px-1.5 text-[10px] lg:inline">
                  ⌘S
                </kbd>
              </>
            )}
          </Button>
        </div>
      </div>
    </div>
  );
}
