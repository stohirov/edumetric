"use client";

import { AlertTriangle, Lightbulb, TrendingDown } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import type { GrowthAreaItem } from "@/types/student-analytics";
import { cn } from "@/lib/utils";

interface GrowthAreasCardProps {
  areas: GrowthAreaItem[];
  className?: string;
}

export function GrowthAreasCard({ areas, className }: GrowthAreasCardProps) {
  return (
    <Card interactive className={cn("h-full", className)}>
      <CardHeader>
        <div className="flex items-start justify-between gap-2">
          <div>
            <CardTitle>Growth areas</CardTitle>
            <CardDescription>Focus zones to improve your composite score</CardDescription>
          </div>
          <Badge variant="warning" className="shrink-0 gap-1">
            <AlertTriangle className="h-3 w-3" />
            {areas.length} insights
          </Badge>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {areas.map((area) => {
          const belowGroup = area.score < area.groupAvg;

          return (
            <div
              key={area.key}
              className={cn(
                "rounded-xl border p-4 transition-all duration-200",
                area.severity === "alert"
                  ? "border-red-200 bg-red-50/50"
                  : "border-amber-200/80 bg-amber-50/40"
              )}
            >
              <div className="flex items-start justify-between gap-3">
                <div className="flex items-center gap-2">
                  <div
                    className={cn(
                      "flex h-8 w-8 items-center justify-center rounded-lg",
                      belowGroup ? "bg-amber-100 text-amber-700" : "bg-indigo-100 text-indigo-700"
                    )}
                  >
                    {belowGroup ? (
                      <TrendingDown className="h-4 w-4" />
                    ) : (
                      <Lightbulb className="h-4 w-4" />
                    )}
                  </div>
                  <div>
                    <p className="font-medium text-slate-900">{area.dimension}</p>
                    <p className="text-xs text-slate-500 tabular-nums">
                      You {area.score} · Group {area.groupAvg}
                      {belowGroup && (
                        <span className="ml-1 text-amber-700">(−{area.gap} pts)</span>
                      )}
                    </p>
                  </div>
                </div>
              </div>
              <p className="mt-3 text-sm leading-relaxed text-slate-600">
                {area.suggestion}
              </p>
            </div>
          );
        })}
      </CardContent>
    </Card>
  );
}
