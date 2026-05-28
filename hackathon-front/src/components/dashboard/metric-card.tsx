"use client";

import { ArrowDownRight, ArrowUpRight, Minus } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Aos } from "@/components/ui/aos";
import { cn } from "@/lib/utils";
import { pickStaggerAnimation } from "@/lib/aos-config";
import type { MetricCard as MetricCardType } from "@/types";

interface MetricCardProps {
  metric: MetricCardType;
  className?: string;
}

export function MetricCard({ metric, className }: MetricCardProps) {
  const trend = metric.trend ?? "neutral";
  const hasChange = metric.change !== undefined && metric.change !== 0;

  return (
    <Card interactive className={className}>
      <CardContent className="p-6 sm:p-7">
        <p className="text-label">{metric.label}</p>
        <p className="mt-3 text-3xl font-semibold tracking-tight text-slate-900 tabular-nums text-display sm:text-[2rem]">
          {metric.value}
        </p>
        {(metric.changeLabel || hasChange) && (
          <div className="mt-4 flex flex-wrap items-center gap-2">
            {hasChange && (
              <span
                className={cn(
                  "inline-flex items-center gap-0.5 rounded-lg px-2 py-0.5 text-xs font-semibold tabular-nums",
                  trend === "up" && "bg-emerald-50 text-emerald-700 ring-1 ring-emerald-100",
                  trend === "down" && "bg-red-50 text-red-700 ring-1 ring-red-100",
                  trend === "neutral" && "bg-slate-100 text-slate-600"
                )}
              >
                {trend === "up" && <ArrowUpRight className="h-3 w-3" />}
                {trend === "down" && <ArrowDownRight className="h-3 w-3" />}
                {trend === "neutral" && <Minus className="h-3 w-3" />}
                {metric.change !== undefined && (
                  <>
                    {metric.change > 0 ? "+" : ""}
                    {metric.change}%
                  </>
                )}
              </span>
            )}
            {metric.changeLabel && (
              <span className="text-xs text-slate-400">{metric.changeLabel}</span>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
}

export function MetricGrid({
  metrics,
  columns = 4,
}: {
  metrics: MetricCardType[];
  columns?: 2 | 3 | 4;
}) {
  const gridCols = {
    2: "sm:grid-cols-2",
    3: "sm:grid-cols-2 lg:grid-cols-3",
    4: "sm:grid-cols-2 xl:grid-cols-4",
  };

  return (
    <div className={cn("grid gap-4 sm:gap-5", gridCols[columns])}>
      {metrics.map((metric, index) => (
        <Aos
          key={metric.label}
          animation={pickStaggerAnimation(index)}
          delay={index * 70}
          duration={600}
        >
          <MetricCard metric={metric} />
        </Aos>
      ))}
    </div>
  );
}
