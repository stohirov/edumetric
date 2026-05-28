"use client";

import { ArrowDownRight, ArrowUpRight } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import type { PerformanceBreakdownItem } from "@/types/student-analytics";
import { cn } from "@/lib/utils";

interface PerformanceBreakdownProps {
  items: PerformanceBreakdownItem[];
  className?: string;
}

export function PerformanceBreakdown({ items, className }: PerformanceBreakdownProps) {
  return (
    <Card interactive className={cn("h-full", className)}>
      <CardHeader>
        <CardTitle>Performance breakdown</CardTitle>
        <CardDescription>Dimension scores compared to your group</CardDescription>
      </CardHeader>
      <CardContent className="space-y-5">
        {items.map((item, index) => {
          const isAbove = item.delta >= 0;

          return (
            <div
              key={item.key}
              className="group rounded-xl border border-slate-100 p-4 transition-all duration-200 hover:border-indigo-100 hover:bg-indigo-50/20"
              style={{ animationDelay: `${index * 60}ms` }}
            >
              <div className="flex items-center justify-between gap-2">
                <span className="text-sm font-medium text-slate-900">{item.label}</span>
                <div className="flex items-center gap-2">
                  <span className="text-lg font-semibold tabular-nums text-slate-900">
                    {item.value}
                  </span>
                  <span
                    className={cn(
                      "inline-flex items-center gap-0.5 rounded-md px-1.5 py-0.5 text-xs font-medium tabular-nums",
                      isAbove ? "bg-emerald-50 text-emerald-700" : "bg-amber-50 text-amber-700"
                    )}
                  >
                    {isAbove ? (
                      <ArrowUpRight className="h-3 w-3" />
                    ) : (
                      <ArrowDownRight className="h-3 w-3" />
                    )}
                    {isAbove ? "+" : ""}
                    {item.delta} vs group
                  </span>
                </div>
              </div>
              <Progress value={item.value} className="mt-3 h-2" />
              <div className="mt-2 flex justify-between text-xs text-slate-400">
                <span>Group avg: {item.groupAvg}</span>
                <span className="tabular-nums">{item.value}%</span>
              </div>
            </div>
          );
        })}
      </CardContent>
    </Card>
  );
}
