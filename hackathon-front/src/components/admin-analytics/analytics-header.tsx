"use client";

import { CalendarRange, Download, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

interface AnalyticsHeaderProps {
  term?: string;
  onExport?: () => void;
}

export function AnalyticsHeader({
  term = "Spring 2026",
  onExport,
}: AnalyticsHeaderProps) {
  return (
    <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
      <div>
        <Badge className="mb-2 gap-1 border-0 bg-indigo-600 text-white">
          <Sparkles className="h-3 w-3" />
          Executive analytics
        </Badge>
        <h1 className="text-2xl font-semibold tracking-tight text-slate-900 sm:text-3xl">
          Institution overview
        </h1>
        <p className="mt-1 max-w-xl text-sm text-slate-500">
          Real-time performance across students, groups, attendance, and faculty
          activity.
        </p>
      </div>
      <div className="flex flex-wrap items-center gap-2">
        <Badge
          variant="secondary"
          className="gap-1.5 px-2.5 py-1 text-xs font-medium"
        >
          <CalendarRange className="h-3.5 w-3.5" />
          {term}
        </Badge>
        {onExport ? (
          <Button
            size="sm"
            className="gap-1.5 shadow-md shadow-indigo-600/15"
            onClick={onExport}
          >
            <Download className="h-4 w-4" />
            Export report
          </Button>
        ) : null}
      </div>
    </div>
  );
}
